"""Build site/data/*.json from data/questions.jsonl and the Drive scan index."""
import json,re,os,sys,collections
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R=[json.loads(l) for l in open(os.path.join(ROOT,'data/questions.jsonl'),encoding='utf-8')]
TOP=json.load(open(os.path.join(ROOT,'data/topics.json'),encoding='utf-8'))
TL=[(b,s) for b,ss in TOP.items() for s in ss]; TI={t:i for i,t in enumerate(TL)}
BROAD=list(TOP)
CODE=re.compile(r'\b(MJAMA|MJMA|MNMA|SECMA|SEC|DSEMA|DSE|GEMA|CCMA|CC|BMC|BME|BMO|MMC|MME|MMO|GEC|AECC|MDMA)\s*[-–_ ]?\s*0*(\d{1,2})',re.I)
ROMAN={'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6}
def prog(p): return 'BSc' if p.startswith('BSc') else 'MSc'
# ---- papers
papers={};order=[]
for r in R:
    k=(r['source_file'],r['paper_index'])
    if k not in papers:
        kind='i' if r['kind']=='internal' else 's'
        key=f"{prog(r['programme']).lower()}-{r['semester']}-{r['year']}-{kind}-{len([1 for kk in papers if kk[0]==r['source_file']])+1}"
        if r['source_file'].startswith('Extra_'): key=key.replace(f'-{kind}-',f'-{kind}x-')
        papers[k]=dict(key=key,prog=prog(r['programme']),sem=r['semester'],year=r['year'],kind=kind,
          code=r['paper_code'],title=r['paper_title'],full=r['full_marks'],rule=r['choice_rule'],n=0)
        order.append(k)
    papers[k]['n']+=1
    if not papers[k]['code'] and r['paper_code']: papers[k]['code']=r['paper_code']
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
    return t
for p in P: p['title']=clean_title(p['title'])
# fill missing titles from the nearest-year paper with the same programme+code
byc=collections.defaultdict(list)
for p in P:
    if p['code'] and p['title']: byc[(p['prog'],p['code'])].append(p)
for p in P:
    if not p['title'] and p['code'] and byc.get((p['prog'],p['code'])):
        best=min(byc[(p['prog'],p['code'])],key=lambda x:abs(x['year']-p['year']))
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
              1 if RUB.match(r['text']) else 0])
# ---- scans
NONMATH=re.compile(r'tagore|statist|\bstat\b|stat minor|physic|mnphy|phy\b|chem|english|bengali|bangla|environment|\bevs\b|\bgec|aecc|hindi|sanskrit|history|philosophy|economics|geography|computer sc|sec theory|botany|zoology',re.I)
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
    S.append(dict(id=i,prog=pg,sem=sem,year=yr,kind=kind,old=older,label=lab,code=code,other=bool(NONMATH.search(lab)),group=sub[0] if sub else None))
S.sort(key=lambda s:(s['prog'],s['sem'] or 0,-(s['year'] or 0),s['kind'],s['label'].lower()))
OUT=os.path.join(ROOT,'site/data')
json.dump(dict(papers=P,topics=[list(t) for t in TL],broad=BROAD),open(f'{OUT}/papers.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
with open(f'{OUT}/questions.json','w',encoding='utf-8') as f:
    f.write('[\n'+',\n'.join(json.dumps(q,ensure_ascii=False,separators=(',',':')) for q in Q)+'\n]')
json.dump(S,open(f'{OUT}/scans.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(P),'papers',len(Q),'questions',len(S),'scans')
