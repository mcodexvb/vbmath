import json,re,sys,collections
sys.path.insert(0,'.')
from topics import T
PAT={(b,s):re.compile(r'(?<![A-Za-z])(?:'+p+')',re.I) for b,d in T.items() for s,p in d.items()}
# paper-level broad hint from paper title/code keywords
HINT=[(r'real analysis|analysis-?i\b|analysis-?ii\b|calculus|analysis',"Real Analysis"),(r'algebra',"Abstract Algebra"),(r'linear algebra|matrix|matrices',"Linear Algebra"),
 (r'differential equation|ode|pde|partial',"Differential Equations"),(r'complex',"Complex Analysis"),(r'metric|topolog',"Metric Spaces & Topology"),(r'functional',"Functional Analysis"),
 (r'mechanic|dynamic|fluid',"Mechanics & Mathematical Physics"),(r'numerical|programming|computer|c\+\+|python',"Numerical Analysis"),(r'probab|statist',"Probability & Statistics"),
 (r'operations|optimi|linear programming|\blpp',"Optimization & Operations Research"),(r'graph|discrete|combinator',"Discrete Mathematics & Graph Theory"),(r'geometr|tensor|vector',"Differential Geometry & Tensors"),(r'transform|integral equation',"Mathematical Methods & Transforms")]
def tag(r):
    txt=r['text']+' '+r['latex']
    hits=[]
    for (b,s),p in PAT.items():
        n=len(p.findall(txt))
        if n: hits.append((n,b,s))
    hits.sort(reverse=True)
    return [(b,s) for n,b,s in hits[:3]]
def main(inp,out):
    R=[json.loads(l) for l in open(inp,encoding='utf-8')]
    byq=collections.defaultdict(list)
    for r in R:
        r['topics']=[{'broad':b,'specific':s} for b,s in tag(r)];r['topic_basis']='text' if r['topics'] else None
        byq[(r['source_file'],r['paper_index'],r.get('section'),r['qno'])].append(r)
    for g in byq.values():
        u=[t for r in g for t in r['topics']];seen=[]
        for t in u:
            if t not in seen:seen.append(t)
        for r in g:
            if not r['topics'] and seen:
                r['topics']=seen[:3];r['topic_basis']='sibling-part'
    for r in R:
        if not r['topics']:
            ti=(r.get('paper_title') or '')+' '+(r.get('paper_code') or '')
            for p,b in HINT:
                if re.search(p,ti,re.I): r['topics']=[{'broad':b,'specific':None}];r['topic_basis']='paper-title';break
        r['needs_topic_review']=r['topic_basis'] in (None,'paper-title')
    with open(out,'w',encoding='utf-8') as f:
        for r in R:f.write(json.dumps(r,ensure_ascii=False)+'\n')
    c=collections.Counter(r['topic_basis'] for r in R);print(len(R),c)
    b=collections.Counter(t['broad'] for r in R for t in r['topics']);print(b.most_common())
if __name__=='__main__':main(*sys.argv[1:3])
