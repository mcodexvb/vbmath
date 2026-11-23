#!/usr/bin/env python3
"""Turn audited exam-paper LaTeX into one JSON record per question part.
Usage: import_tex.py TRACKER.csv OUT.jsonl  (paths resolved from SRC_GLOBS)"""
import csv,glob,os,re,json,sys,hashlib
ROMAN={'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6}
def bn(p):
    m=re.search(r'(?:/b|/B|Batch_)(\d+)',p); return int(m.group(1)) if m else 0
def resolve(row,globs,arch):
    base=os.path.basename(row['latex_path']); c=[]
    for g in globs: c+=glob.glob(g%base,recursive=True)
    if c: return sorted(set(c),key=bn)[-1]
    a=glob.glob(arch%(row['archive'],row['latex_path']))
    return a[0] if a else None
def balanced(s,i):
    """s[i]=='{' -> return (content,end_index_after)"""
    d=0;j=i
    while j<len(s):
        if s[j]=='\\': j+=2;continue
        if s[j]=='{': d+=1
        elif s[j]=='}':
            d-=1
            if d==0: return s[i+1:j],j+1
        j+=1
    return s[i+1:],len(s)
def marks_sum(raw):
    if not raw: return None
    t=raw.replace('×','x').replace('\\times','x')
    m=re.search(r'(\d+)\s*x\s*(\d+)\s*=\s*(\d+)',t)
    if m: return int(m.group(3))
    nums=re.findall(r'\d+(?:\.\d+)?',t)
    if not nums: return None
    if re.fullmatch(r'[\s\d.+\[\]]*',t): return sum(float(n) for n in nums)
    return None
def plain(s):
    s=re.sub(r'%.*','',s)
    s=re.sub(r'\\(?:printedmarks|gapmark)\{[^{}]*\}','',s)
    s=re.sub(r'\\(?:displaystyle|left|right|big|Big|quad|qquad|,|;|!)','',s)
    for a,b in [(r'\leq','<='),(r'\geq','>='),(r'\neq','!='),(r'\to','->'),(r'\infty','infinity'),(r'\in','in'),(r'\sum','sum'),(r'\int','integral'),(r'\partial','partial'),(r'\lambda','lambda'),(r'\alpha','alpha'),(r'\beta','beta'),(r'\theta','theta'),(r'\epsilon','epsilon'),(r'\varepsilon','epsilon'),(r'\delta','delta'),(r'\mu','mu'),(r'\pi','pi'),(r'\sigma','sigma'),(r'\phi','phi'),(r'\mathbb{R}','R'),(r'\mathbb R','R'),(r'\mathbb{Z}','Z'),(r'\mathbb{N}','N'),(r'\mathbb{Q}','Q'),(r'\mathbb{C}','C')]:
        s=s.replace(a,b)
    for _ in range(4): s=re.sub(r'\\(?:textbf|textit|emph|mathrm|mathbf|operatorname|text|mbox|underline)\{([^{}]*)\}',r'\1',s)
    for _ in range(3): s=re.sub(r'\\(?:dfrac|frac)\{([^{}]*)\}\{([^{}]*)\}',r'(\1)/(\2)',s)
    s=re.sub(r'\\[a-zA-Z]+\*?',' ',s)
    s=re.sub(r'\^\{([^{}]*)\}',r'^\1',s);s=re.sub(r'_\{([^{}]*)\}',r'_\1',s)
    s=re.sub(r'[\\{}$&]',' ',s)
    return re.sub(r'\s+',' ',s).strip()
CODE=re.compile(r'\b(MJAMA|MJMA|MNMA|SECMA|SEC|DSEMA|GEMA|CCMA|CC|BMC|BME|BMO|MMC|MME|MMO|GEC|AECC|MDMA)\s*[-–]?\s*(\d{1,2}[A-Za-z]?)\b',re.I)

HDR=re.compile(r'Examination|Programme|Course\s*[:\-]|Paper\s*[:\-]|Semester',re.I)
SEC=re.compile(r'\b(Unit|Group|Section|Part)\b',re.I)
def events(body):
    ev=[]
    for m in re.finditer(r'\\begin\{center\}(.*?)\\end\{center\}',body,re.S):
        t=m.group(1)
        if re.match(r'\s*(\\textit\{)?\s*(Answer|Questions? (are|of)|Notations|Symbols|Use separate)',t) : continue
        if HDR.search(t) and not re.search(r'^\s*\\textbf\{(Unit|Group)',t): ev.append((m.start(),m.end(),'H',t))
        elif SEC.search(t) and len(t)<300: ev.append((m.start(),m.end(),'U',t))
    for m in re.finditer(r'\\exam\{',body):
        j=m.end()-1;e=j;blk=''
        for _ in range(5):
            while e<len(body) and body[e]!='{': e+=1
            c,e=balanced(body,e);blk+=c+' \\\\ '
        ev.append((m.start(),e,'H',blk))
    for m in re.finditer(r'\\unit\{',body):
        e=m.end()-1;blk=''
        for _ in range(2):
            c,e=balanced(body,e);blk+=c+' ';
            while e<len(body) and body[e] in ' \n': e+=1
        ev.append((m.start(),e,'H' if (re.search(r'Examination|Programme',blk,re.I) and re.search(r'Semester|Paper|Course',blk,re.I)) else 'U',blk))
    for m in re.finditer(r'%\s*=====\s*(.*?)\s*=====',body): ev.append((m.start(),m.end(),'T',m.group(1)))
    for m in re.finditer(r'\\Q\{([^}]*)\}',body): ev.append((m.start(),m.end(),'Q',m.group(1)))
    for m in re.finditer(r'\\sQ\{([^}]*)\}',body): ev.append((m.start(),m.end(),'S',m.group(1)))
    ev.sort(key=lambda x:(x[0],x[2]!='H'))
    # drop events nested inside another event's span (e.g. \unit inside center)
    out=[];end=-1
    for e in ev:
        if e[0]<end and e[2] in 'HUT': continue
        out.append(e);end=max(end,e[1]) if e[2] in 'HU' else end
    return out
def parse_body(body):
    """returns list of papers: dict(header,tag,items=[(sectionidx,section,qlabel,part,latex)])"""
    ev=events(body);papers=[];cur=None;seen_q=True;tag=''
    pend_hdr='';sec='';si=0
    items=[]  # raw ranges
    last_item=None
    def close(upto):
        nonlocal last_item
        if last_item is not None and cur is not None:
            i0,q,part,secl,sidx=last_item
            txt=body[i0:upto]
            cur['items'].append((sidx,secl,q,part,txt))
        last_item=None
    curq=''
    for k,(s0,s1,typ,val) in enumerate(ev):
        if typ=='T': tag=val;continue
        if typ=='H':
            close(s0)
            if cur is None or seen_q or not cur['items']and False:
                if cur is None or seen_q:
                    cur={'header':val,'tag':tag,'items':[]};papers.append(cur);seen_q=False;sec='';si=0
                else: cur['header']+=' '+val
            else: cur['header']+=' '+val
            continue
        if typ=='U':
            close(s0)
            if cur is None: cur={'header':'','tag':tag,'items':[]};papers.append(cur)
            sec=val;si+=1;continue
        if typ=='Q':
            close(s0)
            if cur is None: cur={'header':'','tag':tag,'items':[]};papers.append(cur)
            seen_q=True;curq=val.strip()
            last_item=(s1,curq,'',sec,si);continue
        if typ=='S':
            # close stem or previous part
            if last_item is not None and last_item[2]=='' and not plain(body[last_item[0]:s0]):
                last_item=None
            else: close(s0)
            last_item=(s1,curq,val.strip(),sec,si)
    close(len(body))
    return papers
def main(tracker,out,globs,arch):
    rows=list(csv.DictReader(open(tracker,encoding='utf-8-sig')))
    n=0;f=open(out,'w',encoding='utf-8');stats=[];seen={}
    for r in rows:
        p=resolve(r,globs,arch)
        if not p: continue
        src=open(p,errors='ignore').read()
        i=src.find('\\begin{document}'); body=src[i+16:] if i>=0 else src
        papers=parse_body(body)
        sem=ROMAN.get(r['semester'],None) or int(r['semester']) if r['semester'] else None
        for pi,pp in enumerate(papers,1):
            if not pp['items']: continue
            h=plain(pp['header']);ht=plain(pp['tag'])+' '+h
            code=None;title=None
            cm=CODE.search(h) or CODE.search(plain(pp['tag']))
            if cm:
                code=(cm.group(1)+'-'+cm.group(2)).upper()
                opt=re.match(r'\s*\(([A-Z]\d{1,2})\)',h[cm.end():]) or re.match(r'\s*\(([A-Z]\d{1,2})\)',plain(pp['tag'])[cm.end():] if CODE.search(plain(pp['tag'])) else '')
                if opt: code+='('+opt.group(1)+')'
            if not code:
                for srcs in (plain(pp['tag']),os.path.basename(r['latex_path'])):
                    cm2=CODE.search(srcs.replace('_','-'))
                    if cm2: code=(cm2.group(1)+'-'+cm2.group(2)).upper();break
            if code:
                mm=re.match(r'([A-Z]+)-0*(\d+)([A-Z]?)(.*)',code)
                if mm: code=mm.group(1)+'-'+mm.group(2)+mm.group(3)+mm.group(4)
            tm=re.findall(r'\(\s*([A-Za-z][^()]{3,80}?)\s*\)',h)
            tm=[x for x in tm if not re.fullmatch(r'[A-Z]\d{1,2}|Optional|Old|New|NEP|CBCS|Special',x)]
            if tm: title=tm[0]
            elif plain(pp['tag']):
                tt=re.sub(CODE.pattern,'',plain(pp['tag']),flags=re.I).strip(' ()-:')
                title=tt or None
            mk=re.search(r'Full Marks\s*[:\-]?\s*(\d+)',h); full=int(mk.group(1)) if mk else None
            choice=re.search(r'Answer[^.]{0,80}',h)
            kind='internal' if re.search(r'internal|tutorial|assessment',ht+' '+r['latex_path'],re.I) else 'semester'
            for (sidx,secl,lab,part,t) in pp['items']:
                mr=re.findall(r'\\(?:printedmarks|gapmark)\{([^{}]*)\}',t)
                latex=re.sub(r'\\(?:printedmarks|gapmark)\{[^{}]*\}','',re.sub(r'^\s*%.*$','',t,flags=re.M))
                latex=re.sub(r'\\(?:newpage|clearpage|end\{document\})','',latex).strip()
                if len(plain(latex))<3 and not part: continue
                rec={'university':'VB','programme':'BSc Hons' if r['archive']=='BSc' else 'MSc','semester':sem,'year':int(r['year']),
                 'kind':kind,'paper_code':code,'paper_title':title,'paper_index':pi,'full_marks':full,'choice_rule':choice.group(0).strip() if choice else None,
                 'section':plain(secl) or None,'qno':re.sub(r'\.$','',lab),'part':part,'marks_raw':mr[-1] if mr else None,'marks':marks_sum(mr[-1]) if mr else None,
                 'latex':latex,'source_file':os.path.basename(r['latex_path'])}
                rec['text']=plain(latex)
                rec['id']='VB-%s-%s-P%d-%sQ%s%s'%(r['archive'],os.path.splitext(os.path.basename(r['latex_path']))[0].replace('BSc_','').replace('MSc_','').replace('_','-'),pi,('S%d-'%sidx) if sidx else '',rec['qno'],('-'+part) if part else '')
                k=seen.get(rec['id'],0);seen[rec['id']]=k+1
                if k: rec['id']+='-d%d'%(k+1)
                f.write(json.dumps(rec,ensure_ascii=False)+'\n');n+=1
    print(n,'records');f.close()
if __name__=='__main__':
    main(sys.argv[1],sys.argv[2],[g for g in sys.argv[3].split(',')],sys.argv[4])
