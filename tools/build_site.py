"""Build site/data/*.json from data/questions.jsonl and the Drive scan index."""
import json,re,os,sys,collections,datetime
from pathlib import Path
from build_home_data import write_home_data
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R=[json.loads(l) for l in open(os.path.join(ROOT,'data/questions.jsonl'),encoding='utf-8')]
TOP=json.load(open(os.path.join(ROOT,'data/topics.json'),encoding='utf-8'))
TL=[(b,s) for b,ss in TOP.items() for s in ss]; TI={t:i for i,t in enumerate(TL)}
BROAD=list(TOP)
CODE=re.compile(r'\b(MJAMA|MJMA|MNMA|SECMA|SEC|DSEMA|DSE|GEMA|CCMA|CC|BMC|BME|BMO|MMC|MME|MMO|GEC|AECC|MDMA)\s*[-–_ ]?\s*0*(\d{1,2})',re.I)
ROMAN={'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6}
def prog(p): return 'BSc' if p.startswith('BSc') else 'MSc'
# ---- drop papers typed twice (same questions, same programme, semester and year)
_sig=collections.defaultdict(list)
for r in R: _sig[(r['source_file'],r['paper_index'])].append(r['latex'])
_first={}; _dupes=set()
for k,texts in _sig.items():
    r0=next(r for r in R if (r['source_file'],r['paper_index'])==k)
    key=(r0['programme'],r0['semester'],r0['year'],'||'.join(texts))
    if key in _first: _dupes.add(k)
    else: _first[key]=k
R=[r for r in R if (r['source_file'],r['paper_index']) not in _dupes]
# ---- paper code and title clean-up
def fix_code_title(code,title,sem,pg):
    """Unify code spellings and turn syllabus notes and elective numbers in the title field into codes."""
    t=(title or '').strip()
    if code:
        code=re.sub(r'\(([AP])0*(\d+)\)',lambda m:f'({m.group(1)}{m.group(2)})',code.strip())
    m=re.fullmatch(r'(?:New Syllabus-)?P-?0*(\d+)(?:/A0*(\d+))?',t,re.I)
    if m and pg=='MSc' and sem in (3,4):
        el=f"P{m.group(1)}"+(f"/A{m.group(2)}" if m.group(2) else '')
        base=re.sub(r'\(.*','',code) if code else f'MMO-{sem}1'
        code=f'{base}({el})'; t=''
    if re.fullmatch(r'(nep[- ]?new|(new|old)( (new|old))?( syllabus)?)',t,re.I): t=''
    t=re.sub(r'\bAdvance\b(?!d)','Advanced',t)
    return code,(t or None)
# ---- papers
papers={};order=[]
for r in R:
    k=(r['source_file'],r['paper_index'])
    if k not in papers:
        kind='i' if r['kind']=='internal' else 's'
        key=f"{prog(r['programme']).lower()}-{r['semester']}-{r['year']}-{kind}-{len([1 for kk in papers if kk[0]==r['source_file']])+1}"
        if r['source_file'].startswith('Extra_'): key=key.replace(f'-{kind}-',f'-{kind}x-')
        code,title=fix_code_title(r['paper_code'],r['paper_title'],r['semester'],prog(r['programme']))
        papers[k]=dict(key=key,prog=prog(r['programme']),sem=r['semester'],year=r['year'],kind=kind,
          code=code,title=title,full=r['full_marks'],rule=r['choice_rule'],n=0)
        order.append(k)
    papers[k]['n']+=1
    if not papers[k]['code'] and r['paper_code']: papers[k]['code']=fix_code_title(r['paper_code'],None,r['semester'],prog(r['programme']))[0]
# dedupe keys
seen=collections.Counter()
for k in order:
    p=papers[k];seen[p['key']]+=1
    if seen[p['key']]>1: p['key']+=f"-{seen[p['key']]}"
P=[papers[k] for k in order];PI={k:i for i,k in enumerate(order)}
def clean_title(t):
    if not t: return None
    t=re.sub(r'\s+',' ',t).strip(' ()')
    if re.fullmatch(r'(Honours|Hons\.?|Mathematics|Major|Minor)',t,re.I): return None
    # file tags and unit/semester labels are not course titles
    if '_' in t or re.match(r'(nep|sem(ester)?|unit|paper|internal|tutorial|test|cia)\b[\s\-:.]*[ivx\d]*',t,re.I) and len(t)<22: return None
    if re.fullmatch(r'[A-Z]{2,6}-?\d+[A-Z]?',t): return None
    return t
for p in P: p['title']=clean_title(p['title'])
# fill missing titles from the nearest-year paper with the same programme+code
byc=collections.defaultdict(list)
for p in P:
    if p['code'] and p['title']: byc[(p['prog'],p['sem'],p['code'])].append(p)
for p in P:
    if not p['title'] and p['code'] and byc.get((p['prog'],p['sem'],p['code'])):
        best=min(byc[(p['prog'],p['sem'],p['code'])],key=lambda x:abs(x['year']-p['year']))
        if abs(best['year']-p['year'])<=4: p['title']=best['title'];p['title_guess']=1
# ---- repeats: same question text asked in different years
def norm(t): return re.sub(r'[^a-z0-9]','',t.lower())
rep=collections.defaultdict(set)
for r in R:
    n=norm(r['text'])
    if len(n)>=30: rep[(prog(r['programme']),n)].add(r['year'])
RUB=re.compile(r'^\s*(answer|attempt)\b[^.]{0,80}\bquestions?\b[^.]{0,60}\.?\s*$',re.I)
# ---- questions
Q=[]
for r in R:
    tp=[TI[(t['broad'],t['specific'])] for t in r['topics'] if t.get('specific') and (t['broad'],t['specific']) in TI]
    tb=[BROAD.index(t['broad']) for t in r['topics'] if not t.get('specific') and t['broad'] in BROAD]
    Q.append([PI[(r['source_file'],r['paper_index'])],r.get('section') or '',r['qno'],r.get('part') or '',
              r['marks'],r.get('marks_raw') or '',r['latex'],tp,tb,1 if r.get('needs_topic_review') else 0,r['id'],
              sorted(rep.get((prog(r['programme']),norm(r['text'])),[])) if len(rep.get((prog(r['programme']),norm(r['text'])),[]))>1 and not RUB.match(r['text']) else [],
              1 if RUB.match(r['text']) else 0]+([r['notes']] if r.get('notes') else []))
# ---- scans
NONMATH=re.compile(r'tagore|statist|\bstat\b|stat minor|physic|mnphy|phy\b|chem|english|bengali|bangla|environment|\bevs\b|\bgec|aecc|hindi|sanskrit|history|philosophy|economics|geography|computer sc|sec theory|botany|zoology',re.I)
SN=json.load(open(os.path.join(ROOT,'tools/scan_names.json'),encoding='utf-8')) if os.path.exists(os.path.join(ROOT,'tools/scan_names.json')) else {}
S=[]
for l in open(os.path.join(ROOT,'tools/scans_raw.tsv'),encoding='utf-8'):
    i,path,title=l.rstrip('\n').split('\t')
    parts=path.split('/')
    pg=parts[0];sem=ROMAN.get(parts[1].replace('Sem_',''),None)
    yr=next((int(x) for x in parts[2:] if re.fullmatch(r'20\d\d',x)),None)
    if yr is None:
        m=re.search(r'(20\d\d)',' '.join(parts[2:])+' '+title); yr=int(m.group(1)) if m else None
    older=any(x.lower() in('old','older') for x in parts) or (yr is not None and yr<2016)
    kind='i' if 'Internal' in parts else 's'
    lab=re.sub(r'\.pdf$','',title,flags=re.I)
    m=re.match(r'^\d{4}_(BSc|MSc)_Sem_[IVX]+_(Semester|Internal)_(.*)$',lab)
    if m:
        lab=re.sub(r'\s+-\s+[^-]+$','',m.group(3)).strip()
    lab=lab.replace('_',' ').strip()
    lab=re.sub(r'^(20\d\d\s+)?((b\.?sc|m\.?sc)\s+)?(sem(ester)?\s?-?\s?\d\s+)?','',lab,flags=re.I).strip() or lab
    lab=re.sub(r'\b(bmc|mmc|mmo|mme|cc|ccma|dsema|dse|gec|aecc|sec|secma|mjma|mnma)\s*-?\s*(\d{1,2})\b',lambda m:m.group(1).upper()+'-'+m.group(2),lab,flags=re.I)
    lab=lab[:1].upper()+lab[1:]
    cm=CODE.search(lab); code=(cm.group(1).upper()+'-'+str(int(cm.group(2)))) if cm else None
    sub=[x for x in parts[4:] if x not in('Semester','Internal')]
    fname=re.sub(r'\s+by\s+[A-Z][a-z]+(\s[A-Z][a-z]+)*$|\s*-\s*[A-Z][a-z]+\s[A-Z][a-z]+$','',lab); nm=SN.get(i)
    if nm:
        lab=nm['name']
        if len(nm['codes'])==1: code=nm['codes'][0]
        elif len(nm['codes'])>1: code=None
    if pg=='MSc' and sem==3 and yr==2018 and code and re.fullmatch(r'MMC-1\d',code): sem=1  # filed under Sem III on Drive
    d=dict(id=i,prog=pg,sem=sem,year=yr,kind=kind,old=older,label=lab,code=code,other=bool(NONMATH.search(lab+' '+fname)) and not (nm and nm['codes'] and not NONMATH.search(lab)),group=sub[0] if sub else None)
    if fname!=lab: d['file']=fname
    if nm and nm.get('pages'): d['pages']=nm['pages']
    S.append(d)
S.sort(key=lambda s:(s['prog'],s['sem'] or 0,-(s['year'] or 0),s['kind'],s['label'].lower()))
OUT=os.path.join(ROOT,'site/data')
json.dump(dict(papers=P,topics=[list(t) for t in TL],broad=BROAD),open(f'{OUT}/papers.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
with open(f'{OUT}/questions.json','w',encoding='utf-8') as f:
    f.write('[\n'+',\n'.join(json.dumps(q,ensure_ascii=False,separators=(',',':')) for q in Q)+'\n]')
json.dump(S,open(f'{OUT}/scans.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(P),'papers',len(Q),'questions',len(S),'scans')


# Competitive papers use the same browser record shape and keep their own source file.
EXAM_NAMES={'JAM':'IIT JAM','NET':'CSIR-UGC NET','GATE':'GATE Mathematics','TIFR':'TIFR Graduate School','NBHM':'NBHM'}
def competitive_dataset(name):
    source_path=os.path.join(ROOT,f'data/{name}.jsonl')
    CP=[]; CQ=[]; CPI={}
    if not os.path.exists(source_path):
        return CP,CQ
    with open(source_path,encoding='utf-8') as f:
        for row in map(json.loads,f):
            key=row['paper_key']
            if key not in CPI:
                CPI[key]=len(CP)
                CP.append(dict(key=key,prog=row['programme'],sem=0,year=row['year'],
                    kind='c',code=row['programme'],title=row['paper_title'],
                    full=row.get('full_marks'),source=row.get('source_scan'),answer_key=row.get('answer_key_url'),n=0))
                if row.get('selection'): CP[-1]['selection']=True
            i=CPI[key]
            CP[i]['n']+=1
            tags=[TI[t['broad'],t['specific']] for t in row['topics'] if (t['broad'],t['specific']) in TI]
            CQ.append([i,row['section'],row['qno'],'',row['marks'],'',row['latex'],tags,[],0,row['id'],[],0,row.get('review_notes',[]),row.get('answer')]+([row['answer_origin']] if row.get('answer_origin') else []))
    with open(f'{OUT}/{name}.json','w',encoding='utf-8') as f:
        json.dump(dict(papers=CP,questions=CQ),f,ensure_ascii=False,separators=(',',':'))
    return CP,CQ

competitive=[competitive_dataset('competitive'), competitive_dataset('scholarship')]
write_home_data(Path(OUT) / 'home.json', [(P,Q), *competitive], S)
with open(f'{OUT}/competitive-catalog.json','w',encoding='utf-8') as f:
    json.dump([paper for papers,_ in competitive for paper in papers],f,ensure_ascii=False,separators=(',',':'))
    f.write('\n')


# ---------------------------------------------------------------- static pages for search engines
import html as H, shutil
SITE='https://vbmath.pages.dev'
ROMAN=['','I','II','III','IV','V','VI','VII','VIII']
PS={'BSc':'B.Sc.','MSc':'M.Sc.'}
TPL=open(os.path.join(ROOT,'site/index.html'),encoding='utf-8').read()
def page(path,title,desc,body,ld=None):
    head=(f'<title>{H.escape(title)}</title>\n<meta name="description" content="{H.escape(desc)}">\n<link rel="canonical" href="{SITE}{path}">\n'
          f'<meta property="og:title" content="{H.escape(title)}">\n<meta property="og:description" content="{H.escape(desc)}">\n<meta property="og:url" content="{SITE}{path}">\n')
    if ld: head+=f'<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>\n'
    t=re.sub(r'<!--HEAD-->.*?<!--/HEAD-->','<!--HEAD-->\n'+head.replace('\\','\\\\')+'<!--/HEAD-->',TPL,flags=re.S)
    t=re.sub(r'<!--APP-->.*?<!--/APP-->','<!--APP-->'+body.replace('\\','\\\\')+'<!--/APP-->',t,flags=re.S)
    d=os.path.join(ROOT,'site',path.strip('/'))
    os.makedirs(d,exist_ok=True)
    open(os.path.join(d,'index.html'),'w',encoding='utf-8').write(t)
for d in ('paper','semester'):
    shutil.rmtree(os.path.join(ROOT,'site',d),ignore_errors=True)
pname=lambda p: p['code'] or ('Internal test' if p['kind'][0]=='i' else 'Paper')
byp=collections.defaultdict(list)
for q in Q: byp[q[0]].append(q)
urls=[('/','1.0'),('/papers/','0.9'),('/search/','0.8'),('/topics/','0.7'),('/scans/','0.7'),('/exams/','0.6'),('/exams/gate/','0.6'),('/syllabus/','0.5'),('/notes/','0.5'),('/books/','0.4'),('/learn/','0.3'),('/gallery/','0.4'),('/people/','0.3'),('/guides/','0.4'),('/tools/','0.4'),('/contribute/','0.4'),('/about/','0.3')]
TOP={'search':('Search questions · VBMath','Search 7,700+ Visva-Bharati mathematics exam questions by text, semester, year, paper code, topic and length.'),
     'papers':('Question papers by semester · VBMath','Visva-Bharati B.Sc. (Semesters I–VIII) and M.Sc. (Semesters I–IV) Mathematics question papers by semester and year.'),
     'topics':('Topics and trends · VBMath','How often each area of mathematics appears in Visva-Bharati B.Sc. and M.Sc. papers, year by year.'),
     'scans':('Original scanned papers · VBMath','All scanned Visva-Bharati mathematics question papers in Google Drive, from 2004 onwards.'),
     'exams':('JAM, NET, GATE, NBHM, TIFR papers · VBMath','Previous papers for IIT JAM, CSIR-UGC NET, GATE, NBHM, TIFR and the Visva-Bharati M.Sc. admission test.'),
     'exams/gate':('GATE Mathematics · VBMath','Search and browse typed GATE Mathematics papers from 2000 to 2026.'),
     'notes':('Notes · VBMath','Class notes from the Department of Mathematics, Visva-Bharati, shared by former students.'),
     'syllabus':('Syllabus · VBMath','Visva-Bharati B.Sc. and M.Sc. Mathematics syllabi: NEP 2025, CBCS 2020 and 2017, BMC; NET and JAM syllabi.'),
     'books':('Books · VBMath','Recommended mathematics textbooks by subject.'),'learn':('Videos and websites · VBMath','Video courses and useful websites for mathematics students.'),
     'people':('People · VBMath','Faculty of the Department of Mathematics, Visva-Bharati.'),'guides':('Guides · VBMath','Scholarships, admission, reaching Santiniketan, LaTeX and Ph.D. thesis submission at Visva-Bharati.'),
     'contribute':('Contribute · VBMath','Send question papers, type questions, fix topic tags or share solutions.'),'about':('About · VBMath','About VBMath, the student-run archive of Visva-Bharati mathematics question papers.'),
     'tools':('Tools · VBMath','CLab and free tools for computing, programming, LaTeX and research, for mathematics students and scholars.'),
     'gallery':('Math Gallery · VBMath','25 interactive mathematical simulations with their equations, explanations and live controls.'),
     'preview':('Paper preview · VBMath','Preview your collected questions as an A4 question paper.')}
for k,(t,d) in TOP.items():
    page(f'/{k}/',t,d,f'<div class="wrap"><h1>{H.escape(t.split(" · ")[0])}</h1><p class="lede">{H.escape(d)}</p></div>')
for (pg,s) in [('BSc',i) for i in range(1,9)]+[('MSc',i) for i in range(1,5)]:
    ps=[(i,p) for i,p in enumerate(P) if p['prog']==pg and p['sem']==s]
    path=f'/semester/{pg.lower()}-{s}/'
    ys=sorted({p['year'] for _,p in ps},reverse=True)
    body=f'<div class="wrap"><nav class="crumbs"><a href="/">Home</a> / <a href="/papers/">Papers</a> / {PS[pg]} Semester {ROMAN[s]}</nav><h1>{PS[pg]} Mathematics Semester {ROMAN[s]}</h1>'
    for y in ys:
        body+=f'<h2>{y}</h2><ul>'+''.join(f'<li><a href="/paper/{p["key"]}/">{H.escape(pname(p))}{(" — "+H.escape(p["title"])) if p["title"] else ""}{" (internal)" if p["kind"][0]=="i" else ""}</a></li>' for _,p in ps if p['year']==y)+'</ul>'
    body+='</div>'
    title=f'{PS[pg]} Mathematics Semester {ROMAN[s]} question papers · VBMath'
    desc=(f'Visva-Bharati {PS[pg]} Mathematics Semester {ROMAN[s]} question papers'+(f', {min(ys)}–{max(ys)}' if ys else '')+', typed and searchable, with the original scans.')
    page(path,title,desc,body,{'@context':'https://schema.org','@type':'CollectionPage','name':title,'url':SITE+path,'isPartOf':{'@type':'WebSite','name':'VBMath','url':SITE+'/'}})
    urls.append((path,'0.8'))
for i,p in enumerate(P):
    path=f'/paper/{p["key"]}/'
    qs=byp[i]
    nm=pname(p)
    title=f'{nm}{(" "+p["title"]) if p["title"] else ""} {p["year"]} · {PS[p["prog"]]} Mathematics Semester {ROMAN[p["sem"]]} · VBMath'
    first=next((q for q in qs if not q[12]),None)
    desc=(f'Visva-Bharati {PS[p["prog"]]} Mathematics Semester {ROMAN[p["sem"]]} {p["year"]} {"internal" if p["kind"][0]=="i" else "end-semester"} question paper {nm}'
          +(f' ({p["title"]})' if p['title'] else '')+f': {sum(1 for q in qs if not q[12])} questions typed in LaTeX.')
    lis=''.join(f'<li><b>{H.escape(str(q[2]))}{("("+H.escape(q[3])+")") if q[3] else ""}</b> <span class="qbody">{H.escape(q[6])}</span>{(" ["+H.escape(q[5] or str(q[4]))+"]") if q[4] is not None else ""}</li>' for q in qs)
    body=(f'<div class="wrap" style="max-width:920px"><nav class="crumbs"><a href="/">Home</a> / <a href="/papers/">Papers</a> / <a href="/semester/{p["prog"].lower()}-{p["sem"]}/">{PS[p["prog"]]} Semester {ROMAN[p["sem"]]}</a> / {p["year"]}</nav>'
          f'<header class="exam-head"><div class="inst">Visva-Bharati · Department of Mathematics</div><h1>{H.escape(nm)}</h1>'
          +(f'<div class="sub">{H.escape(p["title"])}</div>' if p['title'] else '')+f'<div class="fm"><span>{PS[p["prog"]]} Mathematics · Semester {ROMAN[p["sem"]]}</span><span>{p["year"]}</span></div></header><ol class="prerender">{lis}</ol></div>')
    ld={'@context':'https://schema.org','@type':'LearningResource','name':title.replace(' · VBMath',''),'url':SITE+path,'learningResourceType':'Exam question paper','educationalLevel':'Undergraduate' if p['prog']=='BSc' else 'Postgraduate',
        'inLanguage':'en','isAccessibleForFree':True,'about':'Mathematics','provider':{'@type':'Organization','name':'VBMath'},
        'breadcrumb':{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Papers','item':SITE+'/papers/'},{'@type':'ListItem','position':2,'name':f'{PS[p["prog"]]} Semester {ROMAN[p["sem"]]}','item':SITE+f'/semester/{p["prog"].lower()}-{p["sem"]}/'},{'@type':'ListItem','position':3,'name':f'{nm} {p["year"]}','item':SITE+path}]}}
    page(path,title,desc,body,ld)
    urls.append((path,'0.7'))
for CP,CQ in competitive:
    competitive_questions=collections.defaultdict(list)
    for q in CQ:
        competitive_questions[q[0]].append(q)
    for i,p in enumerate(CP):
        path=f'/paper/{p["key"]}/'
        name=EXAM_NAMES[p['prog']]
        label=f'{name} · {p["title"]}'
        desc=f'{p["n"]} questions from the VBMath transcription of {label}.'
        lis=''.join(f'<li><b>{H.escape(q[2])}</b> <span class="qbody">{H.escape(q[6])}</span></li>' for q in competitive_questions[i])
        body=(f'<div class="wrap" style="max-width:920px"><nav class="crumbs"><a href="/">Home</a> / <a href="/exams/">Competitive exams</a></nav>'
              f'<header class="exam-head"><h1>{H.escape(label)}</h1></header><ol class="prerender">{lis}</ol></div>')
        page(path,label+' · VBMath',desc,body)
        urls.append((path,'0.7'))
# 404 page for Cloudflare Pages (served with status 404 for unknown paths)
nf=re.sub(r'<!--HEAD-->.*?<!--/HEAD-->','<!--HEAD-->\n<title>Page not found · VBMath</title>\n<meta name="robots" content="noindex">\n<!--/HEAD-->',TPL,flags=re.S)
nf=re.sub(r'<!--APP-->.*?<!--/APP-->','<!--APP--><div class="wrap"><h1>This page isn’t here</h1><p><a href="/search/">Search questions</a> or open <a href="/papers/">papers by semester</a>.</p></div><!--/APP-->',nf,flags=re.S)
open(os.path.join(ROOT,'site/404.html'),'w',encoding='utf-8').write(nf)
# the preview page is personal: keep it out of search results
pv=os.path.join(ROOT,'site/preview/index.html')
pvt=open(pv,encoding='utf-8').read().replace('<!--/HEAD-->','<meta name="robots" content="noindex">\n<!--/HEAD-->',1)
open(pv,'w',encoding='utf-8').write(pvt)
today=datetime.date.today().isoformat()
open(os.path.join(ROOT,'site/sitemap.xml'),'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod><priority>{pr}</priority></url>\n' for u,pr in urls)+'</urlset>\n')
open(os.path.join(ROOT,'site/robots.txt'),'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
print(len(urls),'urls in sitemap')
