"""Import the supplied JAM JSONL and NET LaTeX archive into VBMath's question format."""
import argparse
import bisect
import csv
import hashlib
import json
from pathlib import Path
import re
from zipfile import ZipFile

from tag import tag

ROOT = Path(__file__).resolve().parents[1]
SESSIONS = {
    "June 2016.tex": ("2016-jun", "June 2016", "A"),
    "NET_2020_Nov26.tex": ("2020-nov26", "26 November 2020", "A"),
    "NET_2020_Nov30.tex": ("2020-nov30", "30 November 2020", "B"),
    "NET_2022_Feb.tex": ("2022-feb", "16 February 2022", "B"),
    "NET_2022_Sep.tex": ("2022-sep", "September 2022", "A"),
    "NET_2023_June.tex": ("2023-jun", "7 June 2023", "A"),
    "NET_2023_Dec.tex": ("2023-dec", "28 December 2023", "A"),
    "NET_2024_June.tex": ("2024-jul", "25 July 2024", "B"),
    "NET_2024_Dec.tex": ("2024-dec", "December 2024 cycle (28 February 2025)", "A"),
}
NET_SCANS = {
    "2016-jun": "1ZSfVDOhCw-9jCdDvORCOLacaZo7UVEp8",
    "2020-nov26": "1vnbyKJrYFLb5yKdChSoQha43yDmvDl-A",
    "2020-nov30": "11xuMlCJk5vGwMn12VmEia1mexSoqG9gI",
    "2022-feb": "1Aw25sklRCITWo-vcZYgNZ7IdZjCnDXWR",
    "2022-sep": "1rylGicoYEjX1mEyretM4HOhRwi-qyUMz",
    "2023-jun": "1I6M4HXzTjtsdiB8Q-zGHSqSXXXtlIkNR",
    "2023-dec": "1Ess0KVgefx0FZexy8eo81SQ_cWw0wmID",
    "2024-jul": "1_13429Gwy3nHoblwJPyxGnBMK1xtGUaB",
    "2024-dec": "1XSQQjydvUubOx7AVM0NxO4UndWY5RxqR",
}
COMMENT = re.compile(r"(?<!\\)%[^\n]*")
LIST = re.compile(r"\\(?:(begin|end)\{(enumerate|itemize)\}(?:\[[^\n]*?\])?|item\b)")
HEADER = re.compile(
    r"\\(?:sub)*section\*?\{\s*(?:part|section)\s*[- ]*([ABC])\b[^}]*\}"
    r"|\\begin\{center\}\s*\\textbf\{Part ([ABC])\}\s*\\end\{center\}", re.I
)
COUNTER = re.compile(r"\\setcounter\{enumi\}\{(\d+)\}")
FIGURE = re.compile(r"\\includegraphics(?:\[[^\n]*?\])?\{([^{}]+)\}")
CREDIT = re.compile(r"\\hfill\s*\[\s*(NET|GATE)\s*-?\s*(\d{4})[^\]]*\]", re.I)


def entries(source, fragment=False):
    visible = COMMENT.sub(lambda m: " " * len(m[0]), source)
    depth = int(fragment)
    start = None
    for m in LIST.finditer(visible):
        action, env = m.groups()
        if depth == 1 and action != "begin":
            if start:
                yield start, m.start()
            start = m if not action else None
        if action == "begin":
            depth += 1
        elif action == "end":
            depth -= 1
            if depth == 0:
                start = None
    if start:
        yield start, len(source)
    if depth != int(fragment):
        raise ValueError(f"Unbalanced question lists, depth {depth}")


def normalized(tex):
    tex = re.sub(r"\\begin\{enumerate\}(?:\[[^\n]*?\])?", "", tex)
    tex = CREDIT.sub("", COMMENT.sub("", tex))
    return re.sub(r"[^a-z0-9]", "", tex.lower())


def prepare(archive, name, tex):
    def figure(match):
        leaf = Path(match[1]).name
        candidates = [name.rsplit("/", 1)[0] + "/" + leaf, leaf]
        candidates += [p for p in archive.namelist() if Path(p).name in (leaf, leaf + ".png")]
        entry = next((candidate for candidate in candidates if candidate in archive.namelist()), None)
        if entry is None:
            raise ValueError(f"{name}: missing figure {leaf}")
        data = archive.read(entry)
        asset = hashlib.sha256(data).hexdigest()[:16] + ".png"
        (ROOT / "site/assets/competitive" / asset).write_bytes(data)
        return r"\includegraphics[width=.65\linewidth]{assets/competitive/" + asset + "}"
    tex = FIGURE.sub(figure, tex)
    tex = re.sub(r"\\(?:toprule|midrule|bottomrule)\b", r"\\hline", tex)
    return tex.strip()


def question(exam, key, year, title, number, section, marks, tex, file, line, scan=None):
    text = re.sub(r"\s+", " ", re.sub(r"\\[a-zA-Z]+|[{}$]", " ", COMMENT.sub("", tex))).strip()
    topics = tag({"latex": tex, "text": text})
    return {
        "id": f"{key.upper()}-Q{number}", "programme": exam, "year": year,
        "paper_key": key, "paper_title": title, "source_scan": scan,
        "qno": str(number), "section": section, "marks": marks, "latex": tex, "text": text,
        "topics": [{"broad": b, "specific": s} for b, s in topics],
        "source_file": file, "source_line": line,
    }


def label_choices(tex, label):
    # The final four-item enumerate normally holds the answer options. Earlier
    # lists can be numbered statements and keep their source labels.
    visible = COMMENT.sub(lambda m: " " * len(m[0]), tex)
    depth = 0
    choice = None
    count = 0
    found = None
    for match in LIST.finditer(visible):
        action, env = match.groups()
        if action == "begin":
            if depth == 0:
                choice, count = match, 0
            depth += 1
        elif action == "end":
            depth -= 1
            if depth == 0 and env == "enumerate" and count == 4:
                found = choice
        elif depth == 1:
            count += 1
    if found and found[0] == r"\begin{enumerate}":
        return tex[:found.end()] + "[label=(" + label + "*)]" + tex[found.end():]
    return tex


def net(archive):
    seen = set()
    for basename, (session, label, part) in SESSIONS.items():
        name = "Yearwise/" + basename
        source = archive.read(name).decode("utf-8-sig")
        lines = [0] + [m.end() for m in re.finditer("\n", source)]
        number = {"A": 0, "B": 20}[part]
        previous = 0
        used = set()
        for item, stop in entries(source):
            before = COMMENT.sub("", source[previous:item.start()])
            for heading in HEADER.finditer(before):
                new_part = (heading[1] or heading[2]).upper()
                if basename == "NET_2023_Dec.tex" and not used:
                    new_part = "A"
                part = new_part
                number = max(number, {"A": 0, "B": 20, "C": 60}[part])
            for count in COUNTER.finditer(before):
                if int(count[1]) >= number and not (basename == "NET_2023_Dec.tex" and not used):
                    number = int(count[1])
            if basename == "NET_2022_Sep.tex":
                part = "A" if number < 20 else "B" if number < 60 else "C"
            number += 1
            raw = source[item.end():stop]
            breaks = [m.start() for pattern in (HEADER, COUNTER) if (m := pattern.search(raw))]
            raw = raw[:min(breaks, default=len(raw))]
            raw = re.sub(r"\\(?:clearpage|newpage)\b", "", raw)
            tex = prepare(archive, name, raw)
            assert tex and number not in used, (name, number)
            used.add(number)
            previous = item.end() + len(raw)
            seen.add(normalized(tex))
            tex = label_choices(tex, r"\arabic" if session == "2016-jun" else r"\alph")
            # The June 2016 compilation uses different section labels from the later papers.
            marks = None if session == "2016-jun" or (number <= 20 and part != "A") else {"A": 2, "B": 3, "C": 4.75}[part]
            yield question("NET", "net-" + session, int(session[:4]), label, number,
                           "Part " + part, marks, tex, name, bisect.bisect_right(lines, item.start()),
                           f"https://drive.google.com/file/d/{NET_SCANS[session]}/view")
    # Mixed topic booklets contain older NET and GATE alongside the yearwise papers.
    # Retain attributable in-scope NET items once, without guessing a paper question number.
    for name in sorted(p for p in archive.namelist() if "/" not in p and p.endswith(".tex")):
        source = archive.read(name).decode("utf-8-sig")
        for index, (item, stop) in enumerate(entries(source), 1):
            raw = source[item.end():stop]
            credit = CREDIT.search(raw)
            if not credit or credit[1].upper() != "NET" or not 2016 <= int(credit[2]) <= 2026:
                continue
            tex = prepare(archive, name, CREDIT.sub("", raw))
            signature = normalized(tex)
            if signature in seen:
                continue
            seen.add(signature)
            year = int(credit[2])
            row = question("NET", f"net-{year}-topics", year, f"{year} topic compilation",
                           index, Path(name).stem, None, tex, name, source.count("\n", 0, item.start()) + 1)
            row["id"] = f"NET-{year}-TOPIC-{hashlib.sha256(signature.encode()).hexdigest()[:16]}"
            row["qno"] = ""
            yield row


def jam_2026():
    """Join the visually transcribed master paper to the official final key."""
    file = "sources/jam-ma-2026.tex"
    source = (ROOT / "data" / file).read_text()
    with (ROOT / "data/sources/jam-ma-2026-key.csv").open() as f:
        key = list(csv.DictReader(f))
    questions = list(entries(source))
    if len(questions) != 60 or [int(k["question"]) for k in key] != list(range(1, 61)):
        raise ValueError("JAM 2026 must have matching questions and answers 1–60")
    if sum(int(k["marks"]) for k in key) != 100:
        raise ValueError("JAM 2026 final key must total 100 marks")
    notes = {
        7: "The set symbol at the end of options C and D is absent in the supplied PDF (printed page 7).",
        9: "The group symbol in option B is faint or incomplete in the supplied PDF (printed page 8).",
        17: "The first coordinate in the zero case is faint or absent in the supplied PDF (printed page 14).",
        22: "Faint occurrences of x were restored from the surrounding expressions (printed page 17).",
        31: "Faint occurrences of x were restored from context (printed page 23).",
        34: "Faint occurrences of f were restored from context (printed page 24).",
        36: "Faint occurrences of f were restored from context (printed page 25).",
        41: "The summation begins at n=1 in the supplied PDF (printed page 28). The printed logarithmic factor is undefined at that index.",
        59: "The membership symbol before the real vector space was restored from context (printed page 33).",
    }
    for (item, stop), k in zip(questions, key, strict=True):
        n = int(k["question"])
        kind = k["type"]
        section = {"MCQ": "A", "MSQ": "B", "NAT": "C"}[kind]
        tex = source[item.end():stop].strip()
        if tex.count(r"\begin{enumerate}") != int(kind != "NAT"):
            raise ValueError(f"Unexpected options in JAM 2026 Q{n}")
        row = question("JAM", "jam-ma-2026", 2026, "Mathematics (MA), 2026",
                       n, f"Section {section} · {kind}", int(k["marks"]), tex,
                       file, source.count("\n", 0, item.start()) + 1,
                       "https://jam2026.iitb.ac.in/files/MA_QP.pdf")
        row["full_marks"] = 100
        row["answer_key_url"] = "https://jam2026.iitb.ac.in/files/MA_AK.pdf"
        row["answer"] = k["answer"]
        if n in notes:
            row["review_notes"] = [notes[n]]
        yield row


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("jam_jsonl", type=Path)
    parser.add_argument("net_zip", type=Path)
    args = parser.parse_args()
    (ROOT / "site/assets/competitive").mkdir(parents=True, exist_ok=True)
    records = []
    for line in args.jam_jsonl.read_text().splitlines():
        q = json.loads(line)
        year = q["year"]
        row = question("JAM", f"jam-ma-{year}", year, f"Mathematics (MA), {year}",
                       q["number"], f"Section {q['section']} · {q['type']}", q["marks"],
                       label_choices(q["latex"], r"\alph"), q["source"]["file"], q["source"]["start_line"],
                       f"https://jam2026.iitb.ac.in/files/MA{year}.pdf")
        row["full_marks"] = 100
        row["review_notes"] = q["notes"]
        records.append(row)
    records.extend(jam_2026())
    with ZipFile(args.net_zip) as archive:
        records.extend(net(archive))
    assert len({r["id"] for r in records}) == len(records)
    with (ROOT / "data/competitive.jsonl").open("w", encoding="utf-8") as out:
        for row in records:
            out.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
    from collections import Counter
    print(Counter(row["paper_key"] for row in records))


if __name__ == "__main__":
    main()
