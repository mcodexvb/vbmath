"""Import the supplied yearwise GATE MA transcriptions into the competitive bank."""

from collections import Counter
import json
import re

from import_competitive import COMMENT, ROOT, question
from import_scholarship import blocks

DATA = ROOT / "data"
SOURCES = sorted((DATA / "sources").glob("gate_ma_batch*.tex"))
YEAR = re.compile(r"^% GATE (\d{4})[^\n]*", re.M)
NUMBER = r"\d+(?:\.\d+)?[a-z]?"
EVENT = re.compile(
    r"^\\(?:sub)?section\*\{(?P<section>[^\n{}]+)\}"
    r"|^\\textbf\{(?:Q\.\s*|MA-)?(?P<number>" + NUMBER
    + r")\.?(?:\s+\((?P<kind>MCQ|MSQ|NAT)\))?\}"
    r"|^\\textbf\{(?P<shared>(?:Common Data for|Statement for Linked Answer) Questions [^{}]+):\}",
    re.M,
)
ANSWER = re.compile(r"^\\ans(?=\{)", re.M)
OPTIONS = re.compile(r"\\opts(?:four|list)(A?)(?=\{)")
BRACE = re.compile(r"\\[{}]|[{}]")
MARKS = re.compile(r"\b(?:carry|carrying)\s+(one|two|three|five)\s+marks?\b", re.I)
VALUES = {"one": 1, "two": 2, "three": 3, "five": 5}
TYPES = ("MCQ", "MSQ", "NAT")


def argument(text, start):
    """Return a braced macro argument and the position just after it."""
    while start < len(text) and text[start].isspace():
        start += 1
    if text[start:start + 1] != "{":
        raise ValueError("Expected a braced GATE macro argument")
    depth = 1
    for match in BRACE.finditer(text, start + 1):
        depth += (match[0] == "{") - (match[0] == "}")
        if not depth:
            return text[start + 1:match.start()], match.end()
    raise ValueError("Unclosed GATE macro argument")


def clean(tex):
    tex = COMMENT.sub("", tex)
    tex = re.sub(r"\\setlength\{\\(?:itemsep|parskip)\}\{[^{}]*\}", "", tex)
    tex = re.sub(r"\\(?:newpage|clearpage)\b|\\end\{document\}", "", tex)
    tex = re.sub(r"\\(?:toprule|midrule|bottomrule)\b", lambda _: r"\hline", tex)
    return re.sub(r"[ \t]+$", "", tex, flags=re.M).strip()


def expand_options(tex):
    match = OPTIONS.search(tex)
    if not match:
        return tex
    pos = match.end()
    items = []
    for _ in range(4):
        item, pos = argument(tex, pos)
        items.append(r"\item " + item)
    style = r"\Alph" if match[1] else r"\alph"
    choices = "\n".join([r"\begin{enumerate}[label=(" + style + "*)]", *items, r"\end{enumerate}"])
    return tex[:match.start()] + choices + tex[pos:]


def paper_rows(path, heading, body):
    year = int(heading[1])
    group = "Mathematics"
    section = ""
    marks = None
    context = {}
    ids = set()
    answered = 0
    key = f"gate-ma-{year}"
    for event, data in blocks(body, EVENT):
        if event["shared"]:
            for number in re.findall(NUMBER, event["shared"]):
                context[number] = clean(data)
            continue

        if label := event["section"]:
            if "General Aptitude" in label:
                group = "General Aptitude"
            elif "Mathematics" in label:
                group = "Mathematics"
            section = label
            mark = MARKS.search(label)
            if mark:
                marks = VALUES[mark[1].lower()]
            elif label.startswith("SECTION B"):
                marks = 5
            elif label.startswith(("Common Data", "Linked Answer")):
                marks = 2
            else:
                marks = None
            continue

        number = event["number"]
        data = clean(data)
        answer = ANSWER.search(data)
        if not answer:
            if year <= 2002 and number in {"1", "2"} and "sub-questions" in data.lower():
                marks = int(number) + (year == 2000)
                continue
            raise ValueError(f"{path.name}: missing answer for {year} {group} Q{number}")

        value, _ = argument(data, answer.end())
        answered += 1
        raw = data[:answer.start()].rstrip()
        kind = event["kind"] or next((k for k in TYPES if f"({k})" in section), "")
        if section.startswith("SECTION "):
            caption = section.split(" (", 1)[0].title()
        elif section.startswith(("Common Data", "Linked Answer")):
            caption = f"{group} · {section.split(':', 1)[0]}"
        else:
            caption = group
        if kind:
            caption += f" · {kind}"
        question_tex = expand_options(raw)
        if number in context:
            question_tex = context[number] + "\n\n" + question_tex
        line = body.count("\n", 0, event.start()) + heading.string.count("\n", 0, heading.end()) + 1
        row = question("GATE", key, year, f"Mathematics (MA), {year}", number,
                       caption, marks, question_tex, path.relative_to(DATA).as_posix(), line)
        if group == "General Aptitude":
            row["id"] = f"{key.upper()}-GA-Q{number}"
            row["topics"] = []
        if row["id"] in ids:
            raise ValueError(f"Duplicate question: {row['id']}")
        ids.add(row["id"])
        # The source for 2001 ends at question 20, two short of its stated Section B.
        if year == 2001:
            row["selection"] = True
        row["answer"] = value.strip()
        row["answer_origin"] = "supplied transcription"
        yield row

    if answered != len(ANSWER.findall(body)):
        raise ValueError(f"{year}: matched {answered} of {len(ANSWER.findall(body))} answers")


def main():
    rows = []
    for source in SOURCES:
        for heading, body in blocks(source.read_text(encoding="utf-8"), YEAR):
            rows.extend(paper_rows(source, heading, body))
    counts = Counter(r["year"] for r in rows)
    if set(counts) != set(range(2000, 2027)) or len({r["id"] for r in rows}) != len(rows):
        raise ValueError("Expected 27 unique yearwise GATE papers")
    path = DATA / "competitive.jsonl"
    old = path.read_text(encoding="utf-8").splitlines()
    kept = [line for line in old if json.loads(line)["programme"] != "GATE"]
    new = [json.dumps(row, ensure_ascii=False, separators=(",", ":")) for row in sorted(rows, key=lambda r: r["year"])]
    path.write_text("\n".join(kept + new) + "\n", encoding="utf-8")
    print(f"Imported {len(rows)} questions across {len(counts)} GATE papers")
    print(dict(sorted(counts.items())))


if __name__ == "__main__":
    main()
