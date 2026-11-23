<p align="center">
  <img src="site/assets/logo.svg" width="72" alt="VBMath logo">
</p>

<h1 align="center">VBMath</h1>

<p align="center">
  <b>Every Visva-Bharati mathematics question paper — typed, searchable, and linked to its scan.</b><br>
  An unofficial, student-run archive of the Department of Mathematics, Visva-Bharati, Santiniketan.
</p>

<p align="center">
  <a href="https://vbmath.pages.dev">Website</a> ·
  <a href="https://github.com/mcodexvb/vbmath/issues/new/choose">Contribute</a> ·
  <a href="https://sites.google.com/view/vbmath">Earlier site</a>
</p>

---

## What it is

VBMath turns ten years of scanned B.Sc. and M.Sc. Mathematics papers into a searchable question bank.

| | |
|---|---|
| **Questions** | 7,700+ question parts from 456 papers, 2016–2026, typed in LaTeX |
| **Scans** | 738 original PDFs in Google Drive, each with its own link, back to 2004 |
| **Topics** | 16 broad areas and 84 specific topics, with a year-by-year trend table |
| **Repeats** | Questions set in more than one year are marked, with the years |
| **Teachers** | A paper builder: collect questions, reorder, copy or download LaTeX |
| **Resources** | JAM, NET, GATE, NBHM, TIFR papers; notes; syllabi; books; guides |

The site is a static page: no server, no database, no cost. Search runs in the browser and the maths is rendered with MathJax.

## Contributing

You don't need to know git. Pick a form:

| I want to… | Use |
|---|---|
| Send scans or photos of a paper | [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSdCV1ctSVpP4imwMnRHGdXdf90xu3gu-55ER1vyMLtxmJ7P7A/viewform) |
| Type a missing question | [Add a question](https://github.com/mcodexvb/vbmath/issues/new?template=1-add-question.yml) |
| Fix a wrong topic | [Fix topic tags](https://github.com/mcodexvb/vbmath/issues/new?template=2-fix-tags.yml) |
| Correct a typo or a mark | [Report a mistake](https://github.com/mcodexvb/vbmath/issues/new?template=3-report-mistake.yml) |
| Share a worked solution | [Submit a solution](https://github.com/mcodexvb/vbmath/issues/new?template=4-submit-solution.yml) |

On the website, the **⋯** menu on every question opens these forms with the question id already filled in.

**What happens next:** an automatic check replies on your issue. A reviewer compares it with the scan and adds the `accepted` label. A pull request is then created for you, and once it is merged the site updates within minutes.

## Repository layout

```
site/                  the website — deploy this folder
  index.html, app.js, app.css
  assets/logo.svg      replace with the final logo (keep the name); favicon.svg too
  data/                generated JSON the site reads, plus content.json (hand-edited links)
data/
  questions.jsonl      master records: one line per question part
  topics.json          topic taxonomy (broad → specific)
  solutions/           accepted solutions, one Markdown file each
tools/
  import_tex.py        audited LaTeX papers → questions.jsonl
  tag.py, topics.py    first-pass topic tagger
  build_site.py        questions + scans → site/data/*.json
  contrib.py           issue form → data change (used by GitHub Actions)
  scans_raw.tsv        Drive id, folder and name of every scan
.github/
  ISSUE_TEMPLATE/      the four contribution forms
  workflows/           check a contribution; open a PR when accepted
```

### A question record

```json
{
  "id": "VB-BSc-Sem-I-2018-P2-Q8-c",
  "programme": "BSc Hons", "semester": 1, "year": 2018, "kind": "semester",
  "paper_code": "CC-2", "qno": "8", "part": "c", "marks": 2,
  "latex": "Expand $f(x)=x^4-x^3+2x^2+6x-2$ as a polynomial in $x-2$ ...",
  "topics": [{"broad": "Calculus & Geometry", "specific": "Differential calculus (one variable)"}],
  "needs_topic_review": true, "review": []
}
```

## Working locally

```bash
python3 tools/build_site.py          # regenerate site/data after editing data/
cd site && python3 -m http.server    # open http://localhost:8000
```

## Deploying (free)

Cloudflare Pages → Create → Connect to Git → `mcodexvb/vbmath`.
Framework preset **None**, build command **empty**, output directory **`site`**.
Every push to `main` redeploys; every pull request gets its own preview link.

For the contribution pipeline, enable *Settings → Actions → General → Allow GitHub Actions to create and approve pull requests*.

## Status and known gaps

- Topic tags come from an automatic first pass; about 700 questions are flagged for review.
- 121 papers have no title, and some records lack marks or a paper code (`review` field).
- Pre-2016 papers and several internal tests exist only as scans so far.

## Notice

VBMath is not affiliated with Visva-Bharati or its Department of Mathematics. Question papers belong to the university; the site collects them for students' study. For copyright concerns or corrections, write to vbmath2013@gmail.com.
