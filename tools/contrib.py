"""Turn a VBMath contribution issue (GitHub issue form) into data changes.

  python3 tools/contrib.py check    # validate; prints a Markdown report (used as an issue comment)
  python3 tools/contrib.py apply    # apply an accepted issue to the data files

Reads the issue from $GITHUB_EVENT_PATH. Issue text is untrusted input: it is only parsed, never executed.
"""
import json, os, re, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QFILE = os.path.join(ROOT, 'data/questions.jsonl')
TOPICS = json.load(open(os.path.join(ROOT, 'data/topics.json'), encoding='utf-8'))

def fields(body):
    """Issue forms render as '### Label' followed by the answer."""
    out, cur = {}, None
    for line in (body or '').splitlines():
        m = re.match(r'^###\s+(.*)$', line)
        if m:
            cur = m.group(1).strip(); out[cur] = []
        elif cur is not None:
            out[cur].append(line)
    clean = {}
    for k, v in out.items():
        t = '\n'.join(v).strip()
        t = re.sub(r'^```\w*\n|\n```$', '', t).strip()
        clean[k] = '' if t == '_No response_' else t
    return clean

def kind(issue):
    labels = {l['name'] for l in issue.get('labels', [])}
    for k in ('add-question', 'fix-tags', 'solution', 'mistake'):
        if k in labels: return k
    return None

def load_q():
    return [json.loads(l) for l in open(QFILE, encoding='utf-8')]

def parse_topics(text):
    good, bad = [], []
    for line in text.splitlines():
        line = line.strip(' -*\t')
        if not line: continue
        if '>' in line:
            b, s = [x.strip() for x in line.split('>', 1)]
        else:
            b, s = line, None
        if b in TOPICS and (s is None or s in TOPICS[b]): good.append({'broad': b, 'specific': s})
        else: bad.append(line)
    return good, bad

def check(issue):
    k, f, errs = kind(issue), fields(issue.get('body')), []
    if k == 'add-question':
        if not re.fullmatch(r'(19|20)\d\d', f.get('Exam year', '')): errs.append('Exam year should be four digits, like 2025.')
        if not re.search(r'[A-Za-z]+\s*-?\s*\d', f.get('Paper code', '')): errs.append('Paper code looks unusual (expected something like MJMA-5).')
        if f.get('Question in LaTeX', '').count('$') % 2: errs.append('The LaTeX has an odd number of `$` signs.')
    elif k in ('fix-tags', 'solution', 'mistake'):
        qid = f.get('Question id') or f.get('Question id or page link', '')
        ids = {q['id'] for q in load_q()}
        m = re.search(r'VB-[A-Za-z0-9-]+', qid)
        if not m or m.group(0) not in ids: errs.append(f'Question id `{qid}` was not found in the archive.')
        if k == 'fix-tags':
            good, bad = parse_topics(f.get('Correct topics', ''))
            if bad: errs.append('Unknown topics: ' + ', '.join(f'`{b}`' for b in bad) + '. Use names from data/topics.json.')
            if not good and not bad: errs.append('No topics given.')
    else:
        errs.append('This issue has no contribution label.')
    if errs:
        return False, '**Please check:**\n\n' + '\n'.join('- ' + e for e in errs) + '\n\nEdit the issue and the check runs again.'
    return True, 'Thanks! The fields look right. A reviewer will compare it with the scan and add the `accepted` label; a pull request then follows automatically.'

def apply(issue):
    k, f = kind(issue), fields(issue.get('body'))
    n = issue['number']
    if k == 'add-question':
        univ = 'VB'
        prog = 'BSc Hons' if f['Programme'].startswith('B') else 'MSc'
        qn = re.match(r'\s*(\w+)\s*(?:\(([^)]+)\))?', f['Question number and part'])
        qno, part = (qn.group(1), qn.group(2)) if qn else (f['Question number and part'], None)
        nums = re.findall(r'\d+(?:\.\d+)?', f.get('Marks', ''))
        marks = sum(float(x) for x in nums) if nums and re.fullmatch(r'[\d.\s+]+', f.get('Marks', '')) else (float(nums[0]) if len(nums) == 1 else None)
        code = re.sub(r'[^A-Z0-9()-]', '', f['Paper code'].upper())[:24]
        qno = re.sub(r'[^A-Za-z0-9]', '', qno)[:6]; part = re.sub(r'[^A-Za-z0-9]', '', part or '')[:6] or None
        rec = dict(university=univ, programme=prog, semester=int(f['Semester']), year=int(f['Exam year']),
                   kind='internal' if f['Exam'] == 'Internal' else 'semester', paper_code=code,
                   paper_title=f.get('Paper title') or None, paper_index=1, full_marks=None, choice_rule=None,
                   section=None, qno=qno, part=part, marks_raw=f.get('Marks') or None, marks=marks,
                   latex=f['Question in LaTeX'], text=re.sub(r'\s+', ' ', re.sub(r'[\\${}]', ' ', f['Question in LaTeX'])).strip(),
                   source_file=f'contrib-{univ}-{prog.split()[0]}-S{f["Semester"]}-{f["Exam year"]}-{code}', review=[],
                   topics=[], topic_basis=None, needs_topic_review=True,
                   provenance=f'issue #{n}', scan=f.get('Link to the scan (if any)') or None)
        rec['id'] = f"{univ}-{prog.split()[0]}-{f['Exam year']}-S{f['Semester']}-{code}-Q{qno}" + (f'-{part}' if part else '') + f'-i{n}'
        with open(QFILE, 'a', encoding='utf-8') as fh: fh.write(json.dumps(rec, ensure_ascii=False) + '\n')
        return f'Add {code} {f["Exam year"]} Q{f["Question number and part"]} (closes #{n})'
    if k == 'fix-tags':
        qid = re.search(r'VB-[A-Za-z0-9-]+', f['Question id']).group(0)
        good, _ = parse_topics(f['Correct topics'])
        R = load_q()
        for r in R:
            if r['id'] == qid:
                r['topics'] = good; r['topic_basis'] = 'reviewed'; r['needs_topic_review'] = False
        with open(QFILE, 'w', encoding='utf-8') as fh:
            for r in R: fh.write(json.dumps(r, ensure_ascii=False) + '\n')
        return f'Fix topics of {qid} (closes #{n})'
    if k == 'solution':
        qid = re.search(r'VB-[A-Za-z0-9-]+', f['Question id']).group(0)
        d = os.path.join(ROOT, 'data/solutions'); os.makedirs(d, exist_ok=True)
        path = os.path.join(d, f'{qid}-i{n}.md')
        credit = f.get('Name for credit (optional)') or 'anonymous'
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(f'---\nquestion: {qid}\nissue: {n}\ncredit: {json.dumps(credit)}\ndate: {datetime.date.today()}\n---\n\n{f["Solution in LaTeX"]}\n')
        return f'Add solution to {qid} (closes #{n})'
    raise SystemExit('Nothing to apply for this issue type; a maintainer handles it by hand.')

if __name__ == '__main__':
    ev = json.load(open(os.environ['GITHUB_EVENT_PATH'], encoding='utf-8'))
    issue = ev['issue']
    if sys.argv[1] == 'check':
        ok, msg = check(issue)
        open(os.environ.get('REPORT', 'report.md'), 'w').write(msg)
        print(msg)
    else:
        title = re.sub(r'[^A-Za-z0-9 ()#.,:-]', '', apply(issue))[:120]
        open(os.environ.get('PR_TITLE_FILE', 'pr_title.txt'), 'w').write(title)
        print(title)
