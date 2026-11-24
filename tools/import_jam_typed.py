"""Add the typed JAM 2005-2015 questions (data/sources/jam-ma-2005-2015.tex) to data/competitive.jsonl.

The typed file is a selection, not every question of each paper, so the rows carry no
official question number and no marks. Rerunning replaces the rows for those years.
"""
import json
from pathlib import Path
import re

from import_competitive import entries, label_choices, question, COMMENT

ROOT = Path(__file__).resolve().parents[1]
FILE = "sources/jam-ma-2005-2015.tex"
SCANS = {
    2005: "1tzdPoEXLnEY86EXYGmHVHsFI9CRQEBju", 2006: "1_Pfw74qo0Oh14Adh4Lga3k4VJqTjiBvj",
    2007: "1e-l6OISczT-2wgjGvY_gPYlLM2l-34lv", 2008: "134yynATIw3FJej1J3s41kJ6dTrtUxuIy",
    2009: "185xAloj8S2SNlbTUZKeGx0_5cSCERGUF", 2010: "1V56PwJaESEOej8nFjPCeDGO5bbwMYE-f",
    2011: "1YPRNCTrAzAp6uPm9E1lbfcofxe6s6V-i", 2012: "1_wsN0l5MYmoAjBgesbMSUHTqDfJEYGnc",
    2013: "1eT9jut9rVptmSmsqJ7CanHzgcQRTrYg2", 2014: "1UC-Ogs1imIzh4Xi8iCudyRLqI3fNf54C",
    2015: "1LhKheWWZgWgB-cq87zmthM4e6ltiH8Cz",
}
CREDIT = re.compile(r"\\hfill\s*\[\s*JAM\s*\d{4}\s*\]")
HEADING = re.compile(r"\\textbf\{\s*((?:CORE|OPTIONAL)\s+SECTION[^}]*)\}", re.I)
NO_OPTIONS = "The answer options are not in the typed source; see the original paper."


def kind(tex):
    if r"\begin{enumerate}" in tex:
        return "Objective"
    if r"\rule{" in tex:
        return "Fill in the blank"
    plain = re.sub(r"\$\$.*?\$\$|\$.*?\$", " x ", tex, flags=re.S).strip().rstrip(".:")
    if re.search(r"\b(is|are|equals?|equal to|be|value of)\s*$", plain):
        return "Objective"
    return "Descriptive"


def rows():
    source = (ROOT / "data" / FILE).read_text(encoding="utf-8")
    years = [(m.start(), int(m[1])) for m in re.finditer(r"\\section\{JAM (\d{4})\}", source)]
    for (start, year), (stop, _) in zip(years, years[1:] + [(len(source), 0)]):
        body = source[start:stop]
        heading = None
        previous = 0
        for n, (item, end) in enumerate(entries(body), 1):
            for h in HEADING.finditer(COMMENT.sub("", body[previous:item.start()])):
                m = re.match(r"(core|optional)\s+section\s*:?\s*([a-d])?", h[1].strip(), re.I)
                heading = m[1].capitalize() + " section" + (" " + m[2].upper() if m[2] else "")
            previous = item.end()
            raw = HEADING.sub("", body[item.end():end])
            tex = CREDIT.sub("", raw).strip()
            k = kind(tex)
            section = f"{heading} · {k}" if heading else k
            row = question("JAM", f"jam-ma-{year}", year, f"Mathematics (MA), {year}", n, section, None,
                           label_choices(tex, r"\alph"), FILE, source.count("\n", 0, start + item.start()) + 1,
                           f"https://drive.google.com/file/d/{SCANS[year]}/view")
            row["qno"] = ""
            row["full_marks"] = None
            row["review_notes"] = [NO_OPTIONS] if k == "Objective" and r"\begin{enumerate}" not in tex else []
            row["selection"] = True
            yield row


def main():
    path = ROOT / "data/competitive.jsonl"
    keep = [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines()]
    keep = [r for r in keep if not (r["programme"] == "JAM" and r["year"] <= 2015)]
    new = list(rows())
    out = new + keep
    assert len({r["id"] for r in out}) == len(out)
    with path.open("w", encoding="utf-8") as f:
        for r in sorted(out, key=lambda r: (r["programme"] != "JAM", r["programme"], r["year"] if r["programme"] == "JAM" else 0)):
            f.write(json.dumps(r, ensure_ascii=False, separators=(",", ":")) + "\n")
    from collections import Counter
    print(Counter((r["year"], r["section"]) for r in new))


if __name__ == "__main__":
    main()
