"""Give every scan a readable name from what it contains.

Inputs: tools/scans_raw.tsv (Drive id, folder, original file name), data/questions.jsonl (typed papers, for course
titles) and, when available, tools/scan_ocr.json (OCR of each page header). Output: tools/scan_names.json
{drive id: {"name": ..., "codes": [...], "pages": n}} which build_site.py uses as the label shown on the site.
"""
import json, os, re, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROM = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14}
PRE = r'(MJAMA|MJMA|MNMA|MDMA|SECMA|SECC|SEC|DSEMA|DSE|GEMA|GEC|GE|CCMA|CC|BMC|BME|BMO|BMH|MMC|MME|MMO|MM|AECC|BCSA|BSCA|BPA|BSA|BACH)'
CODE = re.compile(PRE + r'\s*[-–_:.]?\s*(0?\d{1,3}|XIV|XIII|XII|XI|IX|X|VIII|VII|VI|IV|V|III|II|I)\b\s*([AB](?![a-z]))?', re.I)
OTHER = {'BCSA': 'Computer Science (allied)', 'BSCA': 'Computer Science (allied)', 'BPA': 'Physics (allied)', 'BSA': 'Statistics (allied)', 'BACH': 'Chemistry (allied)', 'GEC': 'Generic elective', 'AECC': 'Environmental studies'}
def norm(pre, num, ab=''):
    pre = pre.upper()
    if pre == 'SECC': pre = 'SEC'
    n = ROM.get(num.upper()) if not num.isdigit() else int(num)
    if not n: return None
    if pre in ('CC', 'CCMA') and n > 14: return None
    if pre == 'MM' and not (100 <= n < 500): return None
    if pre in ('MMC', 'MMO', 'MME', 'BMC', 'BME', 'BMO') and not (11 <= n <= 64): return None
    if pre in ('SEC', 'SECMA', 'GE', 'GEMA', 'DSE', 'DSEMA', 'MDMA', 'MNMA') and n > 8: return None
    return f'{pre}-{n}{(ab or "").upper()}'
def codes_in(text):
    out = []
    for m in CODE.finditer(text):
        c = norm(m.group(1), m.group(2), m.group(3))
        if c and c not in out: out.append(c)
    return out
def prog_of(path): return path.split('/')[0]
# course titles from the typed papers: (programme, code) -> {year: title}
titles = collections.defaultdict(dict)
for l in open(os.path.join(ROOT, 'data/questions.jsonl'), encoding='utf-8'):
    r = json.loads(l)
    if not r.get('paper_code') or not r.get('paper_title'): continue
    t = r['paper_title'].strip(' ()')
    if '_' in t or len(t) < 4 or re.match(r'(nep|sem|unit|paper|internal)\b', t, re.I): continue
    m = CODE.search(r['paper_code'])
    if not m: continue
    c = norm(m.group(1), m.group(2), m.group(3))
    titles[('BSc' if r['programme'].startswith('BSc') else 'MSc', c)][r['year']] = t
def title_for(prog, code, year):
    ys = titles.get((prog, code))
    if not ys: return None
    y = min(ys, key=lambda k: abs(k - (year or k)))
    return ys[y] if abs(y - (year or y)) <= 5 else None
BADT = re.compile(r'symbols|notations|usual meaning|^group|^(hon(ou)?rs?|hons|pass|general|major|minor|mathematics|new|old|new syllabus|old syllabus|theory|practical)$|marks|hours|answer|figures|questions|syllabus|semester|examination|^[a-z]?\d', re.I)
OCRFIX = [(r'-I[LT]\b', '-II'), (r'-IIT\b', '-III'), (r'-T\b', '-I'), (r' -(I+)\b', r'-\1'), (r'Mechanies', 'Mechanics'), (r'Analyse\b', 'Analysis')]
def good_title(t):
    if not t: return None
    t = re.sub(r'\s+', ' ', t).strip(' .,:;-–()')
    t = re.sub(r'^(first|second|third|1st|2nd|3rd)?\s*internal\s*(exam(ination)?|test)?\s*(of|on|in)?\s*', '', t, flags=re.I)
    for a, b in OCRFIX: t = re.sub(a, b, t)
    if re.search(r'hon[a-z]{0,3}rs', t, re.I): return None
    if len(t) < 5 or BADT.search(t) or not re.search(r'[A-Za-z]{4}', t): return None
    return t
def ocr_title(text, code):
    """A course title printed in brackets under the code, e.g. 'Course: MJMA 02 (Analytical Geometry and Vector Calculus)'."""
    for m in re.finditer(r'\(([A-Za-z][A-Za-z ,&\-–:]{5,70})\)', text):
        t = good_title(m.group(1))
        if t: return t
    return None
STOP = r'\b(b\.?\s?sc|m\.?\s?sc|m\.?a|b\.?a|sem(ester)?|internal|semester|mathematics|maths?|hons?|honours|all|in|one|pdf|pyq|paper|papers|question|questions|copy|compressed|new|old|doc|scan|adobe|final|the|of|and|for|sir|special|q)\b'
def file_topic(title):
    """Topic words in a file name such as '2018_msc_sem4_mmoa2_oceanography' -> 'Oceanography'."""
    t = re.sub(r'\.pdf$', '', title, flags=re.I)
    t = re.sub(r'\s*-\s*[A-Z][a-z]+(\s[A-Z][a-z]+){1,2}\s*$', '', t)          # trailing uploader name
    t = re.sub(r'^\d{4}_(BSc|MSc)_Sem_[IVX]+_(Semester|Internal)_', '', t)
    t = re.sub(r'\bby\b.*$', '', t, flags=re.I)
    t = t.replace('_', ' ')
    t = re.sub(r'\b(undergraduate|mathematics|docscanner|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|pm|am|etqp|unit\d*|units?)\b', ' ', t, flags=re.I)
    t = re.sub(r'\b[bm][.\-]?\s?(a|sc)\b[.\-]?', ' ', t, flags=re.I)
    t = re.sub(r'\b(B\.?A\.?\s*B\.?Sc|M\.?A\.?\s*M\.?Sc)\.?_?', ' ', t, flags=re.I)
    t = re.sub(r'\bsem(ester)?[-_ ]?([ivx]+|\d)\b', ' ', t, flags=re.I)
    t = t.replace('_', ' ')
    t = CODE.sub(' ', t)
    t = re.sub(r'\b(mmo|mme|mo|mm|dsema|dse)[a-z]?\d+[a-z]?\d*\b|\b[ap]\d+\b|\(\d\)|\b\d+[a-z]?\b', ' ', t, flags=re.I)
    t = re.sub(r'mathematics|sem-?[ivx]+\\b', ' ', t, flags=re.I)
    t = t.replace('&', ' and ')
    words = [w for w in re.split(r'[\s(),.]+', t) if w and w != '-' and not re.fullmatch(STOP + r'|qp|sec|ge|dse|cc|envo|part|syllabus|old|chem|allied|comp', w, re.I)]
    words = [w.strip('-') for w in words if w.strip('-')]
    if not any(len(w) >= 5 and not re.search(r'\d', w) for w in words): return None
    out = []
    for w in words:
        if re.fullmatch(r'[ivx]+', w, re.I): out.append(w.upper())
        elif '-' in w: out.append('-'.join(p.upper() if re.fullmatch(r'[ivx]+', p, re.I) else p.capitalize() for p in w.split('-')))
        elif w.lower() in ('and', 'of', 'in', 'to'): out.append(w.lower())
        elif w.isupper() and len(w) <= 4: out.append(w)
        else: out.append(w.capitalize())
    r = ' '.join(out)
    r = re.sub(r' (I{1,3}|IV|V|VI)\b', r'-\1', r)
    for a, b in OCRFIX: r = re.sub(a, b, r)
    r = ' '.join(ABBR.get(re.sub(r'\\d+$', '', w.lower()), w) for w in r.split())
    r = re.sub(r'(?<=[a-z])-(?=[A-Z][a-z])', ' ', r)
    if re.search(r'hon[a-z]{0,3}rs', r, re.I): return None
    return r if len(r) >= 5 else None
ABBR = {'mdcs': 'Computer Science (multidisciplinary)', 'mnphy': 'Physics (minor)', 'mdph': 'Physics (multidisciplinary)',
        'stat': 'Statistics', 'evs': 'Environmental Studies', 'envo': 'Environmental Studies', 'mileng': 'English (MIL)',
        'mil': 'MIL', 'aecc': 'AECC', 'multi': '(multidisciplinary)', 'minor': '(minor)'}
SCANJUNK = re.compile(r'^(new doc|adobe scan|docscanner|doc-\d|img|camscanner|scan)\b', re.I)
def tidy(label):
    t = re.sub(r'\.pdf$', '', label, flags=re.I).replace('_', ' ')
    t = re.sub(r'^\d{4} (BSc|MSc) Sem [IVX]+ (Semester|Internal) ', '', t)
    t = re.sub(r'\s+', ' ', t).strip(' -')
    if SCANJUNK.match(t): return 'Scanned question paper'
    t = re.sub(r'\b(\d{4}|sem(ester)?[- ]?\w+|part\d|old syllabus|all[- ]?questions?[- ]?papers?)\b', ' ', t, flags=re.I)
    t = ' '.join(ABBR.get(w.lower(), w) for w in re.split(r'[\s\-]+', t) if w)
    t = re.sub(r'\s+', ' ', t).strip(' -')
    return (t[:1].upper() + t[1:]) if len(t) >= 3 else 'Scanned question paper'

def polish(n):
    n = re.sub(r'\s*\[theory\s*(&|and)?\s*practical\]?', ' (theory and practical)', n, flags=re.I)
    n = re.sub(r'\s+Sem-?[IVX]+$|\s+\d+(st|nd|rd|th)$', '', n)
    n = re.sub(r'\b\d{4}all\b|\bquestions?\b|\bpaper\b', '', n, flags=re.I) if re.match(r'^(MSc|BSc)\b', n) else n
    n = re.sub(r'^(MSc|BSc)\s*$', 'All papers', n.strip())
    m = re.match(r'^(\((minor|multidisciplinary)\))\s+(.+)$', n)
    if m: n = f'{m.group(3)} {m.group(1)}'
    n = re.sub(r'^Course\s+', '', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n if n not in ('(minor)', '(multidisciplinary)') else 'Minor paper'
def main():
    ocr = {}
    p = os.path.join(ROOT, 'tools/scan_ocr.json')
    if os.path.exists(p): ocr = json.load(open(p, encoding='utf-8'))
    out = {}
    for line in open(os.path.join(ROOT, 'tools/scans_raw.tsv'), encoding='utf-8'):
        fid, path, title = line.rstrip('\n').split('\t')
        prog = prog_of(path)
        yr = next((int(x) for x in re.findall(r'(?<!\d)(20\d\d)(?!\d)', path + ' ' + title)), None)
        o = ocr.get(fid)
        found = []
        if o:
            for t in o['text']:
                for c in codes_in(t):
                    if c not in found: found.append(c)
        name_codes = codes_in(title.replace('_', ' '))
        codes = found or name_codes
        maths = [c for c in codes if c.split('-')[0] not in OTHER]
        n = o['pages'] if o else None
        topic = file_topic(title)
        if len(maths) >= 2:
            shown = ', '.join(maths[:6]) + (f' and {len(maths) - 6} more' if len(maths) > 6 else '')
            name = f'All papers: {shown}'
        elif len(maths) == 1:
            c = maths[0]
            printed = ocr_title(' '.join(o['text'][:1]), c) if o else None
            option = c.split('-')[0] in ('MMO', 'MME', 'BMO', 'BME', 'DSE', 'DSEMA')
            # option papers share one code, so only a printed or file-name title can say which subject it is
            t = (printed or topic) if option else (good_title(title_for(prog, c, yr)) or printed or topic)
            name = f'{c} {t}' if t else (f'{c} (optional paper)' if option else c)
        elif codes:
            c = codes[0]; name = f'{OTHER[c.split("-")[0]]}: {c}'
        else:
            t = ocr_title(' '.join(o['text'][:1]), None) if o else None
            name = topic if (topic and t and not re.search(r'[aeiou]{2}[a-z]*\\b', t.split()[0].lower()) and False) else (t or topic or tidy(title))
        out[fid] = {'name': polish(name), 'codes': codes, 'pages': n, 'from': 'ocr' if found else ('filename' if name_codes else 'title')}
    man = os.path.join(ROOT, 'tools/scan_names_manual.json')   # checked by eye where OCR could not read the page
    if os.path.exists(man):
        for k, v in json.load(open(man, encoding='utf-8')).items():
            if k in out: out[k].update(v, **{'from': 'manual'})
    json.dump(out, open(os.path.join(ROOT, 'tools/scan_names.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    c = collections.Counter(v['from'] for v in out.values())
    print(len(out), 'scans named', dict(c))
if __name__ == '__main__': main()
