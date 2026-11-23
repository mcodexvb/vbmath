# VBMath

Searchable question bank for the Department of Mathematics, Visva-Bharati: B.Sc. and M.Sc. papers typed in LaTeX, tagged by topic, and linked to the original scans in Google Drive. An unofficial, student-run project.

## What's here

| Path | What it is |
|---|---|
| `site/` | The website (static: HTML, CSS, JS, JSON). Deploy this folder. |
| `site/data/` | Generated data the site reads: `papers.json`, `questions.json`, `scans.json`, and hand-edited `content.json` (notes, books, exam links, forms). |
| `site/assets/logo.svg` | Placeholder logo. Replace with the final logo (same file name); `favicon.svg` likewise. |
| `data/questions.jsonl` | Master records, one per question part (paper code, year, semester, marks, LaTeX, plain text, topics, review flags). |
| `data/topics.json` | Topic taxonomy (broad → specific). |
| `tools/import_tex.py` | Turns audited LaTeX papers into `data/questions.jsonl`. |
| `tools/tag.py`, `tools/topics.py` | Keyword topic tagger (first pass; `needs_topic_review` marks weak tags). |
| `tools/scans_raw.tsv` | Drive file id, folder path and name of every scanned PDF. |
| `tools/build_site.py` | Builds `site/data/*.json` from the files above. |

## Updating

```
python3 tools/tag.py <imported.jsonl> data/questions.jsonl   # after importing new papers
python3 tools/build_site.py                                   # regenerate site data
```
Commit and push; Cloudflare Pages redeploys automatically.

## Deploying on Cloudflare Pages (free)

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → choose `mcodexvb/vbmath`.
2. Framework preset: None. Build command: leave empty. Build output directory: `site`.
3. Save and deploy. The site appears at `https://<project>.pages.dev`; a custom domain can be added later.

The Google Site can link to it; scans stay in Drive. No keys or passwords belong in this repository.
