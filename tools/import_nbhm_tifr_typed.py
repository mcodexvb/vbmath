"""Import the typed NBHM Ph.D. (2005-2022) and TIFR GS (2010-2026) papers.

Usage: python3 tools/import_nbhm_tifr_typed.py
Replaces the NBHM and TIFR rows of data/competitive.jsonl and leaves JAM/NET alone.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from import_competitive import entries, label_choices, question

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NBHM_FILE, TIFR_FILE = "sources/nbhm-phd-2005-2022.tex", "sources/tifr-gs-mathematics-2010-2026.tex"
CONTENT = json.load(open(os.path.join(ROOT, "site/data/content.json"), encoding="utf-8"))


def read(name):
    return open(os.path.join(ROOT, "data", name), encoding="utf-8").read()


def link(exam, year, pick):
    for e in CONTENT["exams"]:
        if e["name"] == exam:
            for y, groups in e.get("years", []):
                if str(y) == str(year):
                    for label, links in groups:
                        if pick(label):
                            for l, u in links:
                                if re.search(r"paper|question|test", l, re.I) and not re.search(r"key", l, re.I):
                                    return u
    return None


def clean(tex):
    tex = re.sub(r"\\(?:medskip|bigskip|smallskip)\b", "", tex)
    tex = re.sub(r"\n\s*\n\s*$", "", tex.strip() + "\n").strip()
    return tex


def nbhm():
    s = read(NBHM_FILE)
    rows = []
    heads = list(re.finditer(r"\\examheader\{NBHM (\d{4})\}\{([^}]*)\}\{[^}]*\}\{[^}]*\}", s))
    for h, nxt in zip(heads, heads[1:] + [None]):
        year, name = int(h[1]), h[2]
        base, stop = h.end(), nxt.start() if nxt else len(s)
        k = s.find("\\examsec{Answer Key", base, stop)
        paper, key = s[base:k], s[k:stop]
        answers = {m[0]: m[1].strip().rstrip("\\").strip()
                   for m in re.findall(r"\\textbf\{(\([\d]+\)|[\d.]+)\}\s*(.*?)(?=\\\\\n|\\\\$|\n\n|\\end\{multicols\})", key, re.S)}
        title = re.sub(r"\s*---.*$", "", name).strip()
        title = f"{title} {year}" if str(year) not in title else title
        section, qs = "", []
        for m in re.finditer(r"\\examsec\{([^}]*)\}|\\qitem\{([^}]*)\}", paper):
            if m[1]:
                section = re.sub(r"^Section\s+\d+:\s*", "", m[1]).strip()
                section = re.sub(r"\s*---\s*", " \u00b7 ", section)
            else:
                qs.append((m.start(), m.end(), m[2].strip().strip("()"), section))
        for j, (a, b, no, sec) in enumerate(qs):
            end = qs[j + 1][0] if j + 1 < len(qs) else len(paper)
            nxt_sec = re.search(r"\\examsec\{", paper[b:end])
            tex = clean(paper[b:b + nxt_sec.start()] if nxt_sec else paper[b:end])
            line = s.count("\n", 0, base + b) + 1
            sect = f"Section {no.split('.')[0]} \u00b7 {sec}" if "." in no else sec
            row = question("NBHM", f"nbhm-{year}", year, title, no, sect, None, label_choices(tex, r"\alph"),
                           NBHM_FILE, line, link("NBHM", year, lambda l: re.search(r"Ph\.?D|Combined|Doctoral", l, re.I)))
            ans = answers.get(no) or answers.get(f"({no})")
            if ans:
                row["answer"] = ans
            else:
                row["review_notes"] = ["No answer in the typed key."]
            row["full_marks"] = None
            rows.append(row)
    return rows


def tifr():
    s = read(TIFR_FILE)
    rows = []
    heads = list(re.finditer(r"\\section\{GS-(\d{4}) \(([^)]*)\)\}", s))
    for h, nxt in zip(heads, heads[1:] + [None]):
        year, tag = int(h[1]), h[2]
        cam = "CAM" in tag
        key = f"tifr-gs-{year}" + ("-cam" if cam else "")
        title = f"TIFR GS Mathematics {year}" + (" (PhD at CAM)" if cam else "")
        scan = link("TIFR", year, lambda l: ("campus" in l.lower() or "CAM" in l) if cam else ("Graduate" in l or "GS" in l))
        base, stop = h.end(), nxt.start() if nxt else len(s)
        subs = list(re.finditer(r"\\subsection\*\{([^}]*)\}", s[base:stop]))
        no = 0
        for sm, snext in zip(subs, subs[1:] + [None]):
            head = sm[1]
            if re.search(r"Instruction|Notation|Test Structure", head):
                continue
            part = re.sub(r"\s*---\s*", " \u00b7 ", head.replace("\\&", "&"))
            lo = base + sm.end(); hi = base + (snext.start() if snext else stop - base)
            body = s[lo:hi]
            for item, end in entries(body):
                no += 1
                tex = clean(body[item.end():end])
                row = question("TIFR", key, year, title, no, part, None, label_choices(tex, r"\alph"),
                               TIFR_FILE, s.count("\n", 0, lo + item.start()) + 1, scan)
                row["full_marks"] = None
                rows.append(row)
    return rows


def main():
    path = os.path.join(ROOT, "data/competitive.jsonl")
    old = [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]
    keep = [r for r in old if r["programme"] not in ("NBHM", "TIFR")]
    new = nbhm() + tifr()
    out = sorted(keep + new, key=lambda r: (r["programme"], -r["year"], r["paper_key"], int(re.sub(r"\D", "", r["qno"].split(".")[-1]) or 0) if r["programme"] != "JAM" else 0))
    # keep original order of existing rows; append new ones sorted
    out = keep + sorted(new, key=lambda r: (r["programme"], -r["year"], r["paper_key"]))
    with open(path, "w", encoding="utf-8") as f:
        for r in out:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    from collections import Counter
    c = Counter(r["paper_key"] for r in new)
    print(len(new), "rows", len(c), "papers")


if __name__ == "__main__":
    main()
