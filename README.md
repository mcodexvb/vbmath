# vbmath

Searchable question bank for Mathematics, Department of Mathematics, Visva-Bharati (more universities later).

- `data/questions.jsonl` — one record per question part (paper code, year, semester, marks, LaTeX + plain text, topics, review flags).
- `data/topics.json` — topic taxonomy (broad → specific).
- `tools/import_tex.py` — turns audited LaTeX papers into records.
- `tools/tag.py`, `tools/topics.py` — keyword topic tagger (first pass; `needs_topic_review` marks weak tags).

Records with `review` flags (missing code/marks/title) need manual checking. Scans stay in Drive; no personal data or keys belong in this repo.
