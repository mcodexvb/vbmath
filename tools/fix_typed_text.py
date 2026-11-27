"""Tidy typed questions in data/questions.jsonl (safe to run again).

1. Marks typed at the end of the LaTeX ("... \\hfill 5", "\\hfill \\(4+1\\)") move into the marks field,
   so the question maker can show and change them.
2. Transcriber's remarks written into the question ("\\par\\textit{[Differential absent in print.]}")
   move to a `notes` list: they are shown beside the question on the site, not printed on papers.
3. Symbols that came out as \\missingglyph are filled in where the meaning is certain.
   The others stay as a visible box with a note.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, 'data/questions.jsonl')

TRAIL = re.compile(r'\s*\\hfill\s*(?:\\\(|\$)?\s*[\[(]?\s*(\d+(?:\.\d+)?(?:\s*\+\s*\d+(?:\.\d+)?)*)\s*[\])]?\s*(?:\\\)|\$)?\s*$')
NOTE = re.compile(r'\s*(?:\\par\b)?\s*\\textit\{\[((?:[^\[\]{}]|\{[^{}]*\})*)\]\}')

# \missingglyph by question; "R" means the reals, None leaves the box (unsure which set was printed)
GLYPH = {
    'VB-BSc-Sem-III-2019-P1-Q3-b': 'R', 'VB-BSc-Sem-III-2019-P1-Q4-a': 'R', 'VB-BSc-Sem-III-2019-P1-Q4-b': 'R',
    'VB-BSc-Sem-III-2019-P1-Q5-c': 'R', 'VB-BSc-Sem-III-2019-P1-Q8-c': 'R',
    'VB-BSc-Sem-III-2019-P2-Q3-b': 'R',
}
# inside these, only the occurrences matched by the pattern are certain
GLYPH_PART = {
    'VB-BSc-Sem-III-2019-P2-Q3-a': re.compile(r'\\missingglyph(?=\^3)'),
}
UNSURE_NOTE = 'A set symbol (shown as a box) is unreadable in the typed source; check the scanned paper.'


def plain_note(t):
    t = re.sub(r'\\\(|\\\)|\$', '', t)
    t = re.sub(r'\\(textit|emph|textbf)\{([^{}]*)\}', r'\2', t)
    return re.sub(r'\s+', ' ', t).strip()


# Remarks that are part of the question: the handwritten text is put back where it belongs
INLINE = [
    (re.compile(r'(x\^\{m-1\}e\^\{-x\}\\,dx\$)\.\s*\n?\\par\\textit\{\[Printed continuation unavailable\. A handwritten addition reads “is convergent if \\\(m>0\\\)\.”\]\}'),
     r'\1 is convergent if $m>0$.', 'The words “is convergent if m>0” are a handwritten addition; the printed line stops before them.'),
    (re.compile(r'of a function on a closed(.*?)\s*\\hfill\s*\n?\\par\\textit\{\[The word “monotone” is inserted by hand before “function\.”\]\}', re.S),
     r'of a monotone function on a closed\1', 'The word “monotone” is a handwritten addition in the paper.'),
]
INLINE.append((re.compile(r'(\\lvert\\int_a\^b\\frac\{\\cos x\}\{\(1\+x\)\}\\,dx)<(.*?)\s*\n?\\par\\textit\{\[Closing vertical bar absent in the source\.\]\}', re.S),
               r'\1\\rvert<\2', 'The closing bar of the absolute value is missing in the printed paper.'))
KEEP = re.compile(r'^Figure\b')  # a description of a figure stays in the question

rows = [json.loads(l) for l in open(PATH, encoding='utf-8')]
stats = dict(marks=0, notes=0, glyph=0, unsure=0)
for r in rows:
    tex = r['latex']
    m = TRAIL.search(tex)
    if m:
        n = sum(float(x) for x in m.group(1).split('+'))
        if r.get('marks') is None or float(r['marks']) == n:
            if r.get('marks') is None:
                r['marks'] = n
                r['marks_raw'] = re.sub(r'\s+', '', m.group(1))
                if 'marks' in (r.get('review') or []): r['review'] = [x for x in r['review'] if x != 'marks']
            tex = tex[:m.start()].rstrip()
            r['text'] = re.sub(r'\s*' + re.escape(m.group(1).split('+')[-1].strip()) + r'\s*$', '', r.get('text', '')).rstrip() if r.get('text') else r.get('text')
            stats['marks'] += 1
    for rx, rep, note in INLINE:
        if rx.search(tex):
            tex = rx.sub(rep, tex); r['notes'] = list(dict.fromkeys((r.get('notes') or []) + [note])); stats['notes'] += 1
    notes = [plain_note(x) for x in NOTE.findall(tex) if not KEEP.match(x)]
    if notes:
        tex = NOTE.sub(lambda m: m.group(0) if KEEP.match(m.group(1)) else '', tex).rstrip()
        r['notes'] = list(dict.fromkeys((r.get('notes') or []) + notes))
        stats['notes'] += len(notes)
    if '\\missingglyph' in tex:
        if GLYPH.get(r['id']) == 'R':
            tex = tex.replace('\\missingglyph', '\\mathbb{R}'); stats['glyph'] += 1
        elif r['id'] in GLYPH_PART and GLYPH_PART[r['id']].search(tex):
            tex = GLYPH_PART[r['id']].sub(r'\\mathbb{R}', tex); stats['glyph'] += 1
        if '\\missingglyph' in tex and UNSURE_NOTE not in (r.get('notes') or []):
            r['notes'] = (r.get('notes') or []) + [UNSURE_NOTE]; stats['unsure'] += 1
    r['latex'] = tex

with open(PATH, 'w', encoding='utf-8') as f:
    for r in rows: f.write(json.dumps(r, ensure_ascii=False) + '\n')
print(stats)
