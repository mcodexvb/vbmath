"""Import the supplied NBHM and TIFR LaTeX compilations for 2016–2026."""
import argparse
import json
from pathlib import Path
import re
from collections import Counter

from import_competitive import COMMENT, ROOT, entries, question

PAPER = re.compile(r"(?m)^\\examheader\{([^}]+)\}")
NB_SECTION = re.compile(r"(?m)^\\examsec\{([^}]+)\}")
TIFR_PAPER = re.compile(r"(?m)^\\section\{GS-(\d{4}) \(([^}]+)\)\}")
TIFR_SECTION = re.compile(r"(?m)^\\subsection\*\{([^}]+)\}")
NUMBER = re.compile(r"(?m)^\\qitem\{([^}]+)\}")
KEY_LINE = re.compile(r"(?m)^[ \t]*\\textbf\{(\(?\d+(?:\.\d+)*\.?\)?)\}[ \t]*(.+)$")


def blocks(text, pattern):
    matches = list(pattern.finditer(text))
    for i, match in enumerate(matches):
        stop = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        yield match, text[match.end():stop]


def clean(tex, macros):
    tex = COMMENT.sub("", tex)
    for name, value in macros.items():
        tex = re.sub(r"\\" + name + r"(?![A-Za-z])", lambda _: value, tex)
    tex = re.sub(r"\\(?:clearpage|newpage|end\{document\})\b", "", tex)
    tex = tex.replace(r"\end{document}", "")
    tex = re.sub(r"\\begin\{enumerate\}\[\((a|i|A|I)\)\]",
                 lambda m: r"\begin{enumerate}[label=(\\".replace("\\\\", "\\") +
                 {"a": "alph", "i": "roman", "A": "Alph", "I": "Roman"}[m[1]] + "*)]", tex)
    tex = re.sub(r"\\begin\{enumerate\}\[(a|i)\.\]",
                 lambda m: r"\begin{enumerate}[label=\\".replace("\\\\", "\\") +
                 ("alph" if m[1] == "a" else "roman") + "*.]", tex)
    tex = tex.replace(r"\ansbox", r"\fbox")
    return tex.strip()


def nbhm(path, text, macros):
    level = "msc" if "_msc_" in path.name else "phd" if "_phd_" in path.name else "combined"
    label = {"msc": "M.Sc. scholarship", "phd": "Doctoral scholarship", "combined": "Master’s and doctoral scholarship"}[level]
    for paper, body in blocks(text, PAPER):
        year = int(re.search(r"\d{4}", paper[1])[0])
        if not 2016 <= year <= 2026:
            continue
        sections = list(blocks(body, NB_SECTION))
        answers = {}
        for section, part in sections:
            if section[1].startswith("Answer Key"):
                for a in KEY_LINE.finditer(part):
                    key = a[1].strip("().")
                    value = clean(re.sub(r"\\\\\s*$", "", a[2]), macros)
                    if key in answers:
                        answers[key] = None
                    elif value:
                        answers[key] = value
        for section, part in sections:
            if section[1].startswith("Answer Key"):
                break
            for item, q in blocks(part, NUMBER):
                number = item[1].strip("().")
                line = text.count("\n", 0, paper.end() + section.end() + item.start()) + 1
                marks = 4 if level == "combined" else None
                row = question("NBHM", f"nbhm-{level}-{year}", year, f"{year} · {label}",
                               number, section[1], marks, clean(q, macros), path.name, line)
                if answers.get(number):
                    row["answer"] = answers[number]
                    row["answer_origin"] = "supplied compilation"
                yield row


def tifr(path, text, macros):
    for paper, body in blocks(text, TIFR_PAPER):
        year = int(paper[1])
        if not 2016 <= year <= 2026:
            continue
        cam = "CAM" in paper[2]
        last = 0
        for section, part in blocks(body, TIFR_SECTION):
            if not re.match(r"Part |Questions$", section[1], re.I):
                continue
            resume = re.search(r"\\begin\{enumerate\}\[(?:resume|start=(\d+))\]", part)
            number = (int(resume[1]) - 1 if resume and resume[1] else last) if resume else 0
            section_code = re.sub(r"[^a-z0-9]", "", section[1].lower())
            for item, stop in entries(part):
                number += 1
                line = text.count("\n", 0, paper.end() + section.end() + item.start()) + 1
                row = question("TIFR", f"tifr-gs-{year}{'-cam' if cam else ''}", year,
                               f"GS {year} · {paper[2]}", number, section[1], None,
                               clean(part[item.end():stop], macros), path.name, line)
                row["id"] = f"{row['paper_key'].upper()}-{section_code.upper()}-Q{number}"
                yield row
            last = number


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("sources", nargs="+", type=Path)
    args = cli.parse_args()
    rows = []
    for path in args.sources:
        text = path.read_text(encoding="utf-8-sig")
        macros = dict(re.findall(r"(?m)^\\newcommand\{\\(\w+)\}\{(.+)\}[ \t]*$", text))
        rows.extend((tifr if path.name.startswith("tifr") else nbhm)(path, text, macros))
    if len(rows) != len({r["id"] for r in rows}) or any(not r["latex"] for r in rows):
        raise ValueError("Duplicate question IDs or empty question text")
    with (ROOT / "data/scholarship.jsonl").open("w", encoding="utf-8") as out:
        for row in rows:
            row.pop("text")  # Search text is derived from LaTeX in the browser.
            out.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(Counter(r["programme"] for r in rows))
    print(Counter(r["paper_key"] for r in rows))

if __name__ == "__main__":
    main()
