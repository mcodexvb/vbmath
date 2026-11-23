/* VBMath — static question bank. No build step: data/*.json is produced by tools/build_site.py. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const PROG = { BSc: "B.Sc. (Honours)", MSc: "M.Sc." };
  const SHORT_MAX = 4; // marks: ≤4 short, ≥5 long
  const PAGE = 20;
  const store = {
    get(k, d) { try { const v = localStorage.getItem("vbm:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("vbm:" + k, JSON.stringify(v)); } catch (e) {} },
  };
  const D = { papers: [], topics: [], broad: [], Q: [], scans: [], C: {}, byId: new Map(), byPaper: [], scanIdx: new Map() };
  let basket = store.get("basket", []);
  let F = defaultFilters();
  let shown = PAGE;

  function defaultFilters() { return { q: "", prog: "", sem: "", from: "", to: "", code: "", broad: "", topic: "", len: "", kind: "", rep: false, sort: "rel" }; }

  /* ---------- LaTeX → HTML (text mode), maths left for MathJax ---------- */
  const MATHENV = "equation\\*?|align\\*?|gather\\*?|multline\\*?|eqnarray\\*?|pmatrix|bmatrix|vmatrix|Vmatrix|matrix|smallmatrix|cases|array|aligned|gathered";
  const SEG = new RegExp("\\$\\$[\\s\\S]+?\\$\\$|\\$(?:\\\\.|[^$\\\\])+\\$|\\\\\\[[\\s\\S]+?\\\\\\]|\\\\\\([\\s\\S]+?\\\\\\)|\\\\begin\\{(" + MATHENV + ")\\}[\\s\\S]+?\\\\end\\{\\1\\}", "g");
  function marksTail(t) {
    // "\hfill 5", "\hfill \(3+2\)", "\hfill [4+6]", "\hfill $(10\times2=20)$" → printed marks
    return t.replace(/\\hfill\s*((?:\\\(|\$)?\s*[\[(]?[\d\s+×x*\\times=.]+[\])]?\s*(?:\\\)|\$)?)\s*(?=\\\\|\n|$)/g, (m, tail) => {
      const clean = tail.replace(/\\\(|\\\)|\$/g, "").replace(/\\times/g, "×").trim();
      return /\d/.test(clean) ? "\\printedmarks{" + clean + "}" : "";
    });
  }
  function texToHtml(src) {
    let s = String(src || "").replace(/(^|[^\\])%[^\n]*/g, "$1");
    s = marksTail(s);
    const keep = [];
    const hold = (html) => "\u0000" + (keep.push(html) - 1) + "\u0000";
    s = s.replace(/\\begin\{verbatim\}([\s\S]*?)\\end\{verbatim\}/g, (m, c) => hold("<pre>" + esc(c.replace(/^\n/, "")) + "</pre>"));
    s = s.replace(/\\begin\{tabular\}(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})?([\s\S]*?)\\end\{tabular\}/g, (m, spec, body) => {
      const rows = body.split(/\\\\(?:\[[^\]]*\])?/).map((r) => r.replace(/\\hline|\\cline\{[^}]*\}/g, "").trim()).filter((r) => r);
      return hold('<div class="tblwrap"><table>' + rows.map((r) => "<tr>" + r.split(/(?<!\\)&/).map((c) => "<td>" + texToHtml(c.trim()) + "</td>").join("") + "</tr>").join("") + "</table></div>");
    });
    let out = "", last = 0, m;
    SEG.lastIndex = 0;
    while ((m = SEG.exec(s))) {
      out += textPart(s.slice(last, m.index));
      let seg = m[0];
      if (m[1]) seg = "\\[" + seg + "\\]";
      out += esc(seg);
      last = SEG.lastIndex;
    }
    out += textPart(s.slice(last));
    return out.replace(/\u0000(\d+)\u0000/g, (x, i) => keep[+i]);
  }
  function textPart(t) {
    if (!t) return "";
    t = esc(t);
    const rep = [
      [/\\renewcommand\{?\\label\w+\}?\{[^\n]*\}/g, ""],
      [/\\(?:noindent|medskip|bigskip|smallskip|centering|newpage|clearpage|small|large|normalsize|footnotesize)\b/g, ""],
      [/\\[hv]space\*?\{[^}]*\}/g, " "],
      [/\\(?:quad|qquad|enspace|,|;|:)/g, " "],
      [/\\hfill/g, " "],
      [/\\printedmarks\{([^{}]*)\}/g, '<span class="pm">[$1]</span>'],
      [/\\unreadable\{([^{}]*)\}/g, '<span class="unr" title="Not legible in the scan">$1</span>'],
      [/\\gapmark\{[^{}]*\}/g, '<span class="unr" title="Gap in the source">…</span>'],
      [/\\missingglyph\b/g, '<span class="unr" title="Symbol missing in the source">□</span>'],
      [/\\begin\{(?:enumerate|romanparts)\}(?:\[[^\]]*\])?/g, '<ol class="sub">'],
      [/\\begin\{itemize\}(?:\[[^\]]*\])?/g, '<ol class="sub" style="list-style:disc">'],
      [/\\end\{(?:enumerate|romanparts|itemize)\}/g, "</ol>"],
      [/\\item\s*\[([^\]]*)\]/g, '<li style="list-style:none"><b>$1</b> '],
      [/\\item\b/g, "<li>"],
      [/\\begin\{center\}/g, '<div class="center">'],
      [/\\end\{center\}/g, "</div>"],
      [/\\begin\{\w+\*?\}(?:\[[^\]]*\])?|\\end\{\w+\*?\}/g, ""],
      [/\\\\(?:\[[^\]]*\])?|\\par\b|\\newline\b/g, "<br>"],
      [/\\(?:ldots|dots|cdots)\b/g, "…"],
      [/``/g, "“"], [/''/g, "”"], [/`/g, "‘"], [/---/g, "—"], [/--/g, "–"], [/~/g, "&nbsp;"],
      [/\\&amp;/g, "&amp;"], [/\\%/g, "%"], [/\\_/g, "_"], [/\\#/g, "#"], [/\\\{/g, "{"], [/\\\}/g, "}"],
    ];
    for (const [a, b] of rep) t = t.replace(a, b);
    for (let i = 0; i < 4; i++) {
      t = t.replace(/\\(?:textbf|bf)\{([^{}]*)\}/g, "<b>$1</b>").replace(/\\(?:textit|emph|it)\{([^{}]*)\}/g, "<i>$1</i>")
        .replace(/\\underline\{([^{}]*)\}/g, "<u>$1</u>").replace(/\\(?:textsc)\{([^{}]*)\}/g, '<span style="font-variant:small-caps">$1</span>')
        .replace(/\\[a-zA-Z]+\*?\{([^{}]*)\}/g, "$1");
    }
    t = t.replace(/\\[a-zA-Z]+\*?/g, "").replace(/[{}]/g, "");
    return t;
  }
  function plainOf(src) {
    return String(src || "").replace(/\\printedmarks\{[^}]*\}/g, " ").replace(/\\(?:text|mathrm|mathbf|textbf|textit|emph|operatorname)\{([^{}]*)\}/g, "$1")
      .replace(/\\(alpha|beta|gamma|delta|epsilon|varepsilon|theta|lambda|mu|pi|sigma|phi|varphi|omega|rho|tau|xi|eta|nabla|partial|infty|int|sum|lim|sin|cos|tan|log|exp|det)\b/g, " $1 ")
      .replace(/\\[a-zA-Z]+/g, " ").replace(/[{}$\\^_&]/g, " ").replace(/\s+/g, " ").trim();
  }

  /* ---------- MathJax ---------- */
  let mjQueue = Promise.resolve();
  function typeset(el) {
    if (!el || !window.MathJax || !MathJax.typesetPromise) { if (el) el.dataset.pendingMath = "1"; return; }
    mjQueue = mjQueue.then(() => MathJax.typesetPromise([el])).catch(() => {});
  }
  window.__vbmMathReady = () => { $$('[data-pending-math="1"]').forEach((el) => { el.removeAttribute("data-pending-math"); typeset(el); }); };

  /* ---------- data ---------- */
  async function load() {
    const get = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u + " " + r.status); return r.json(); });
    const [P, Q, S, C] = await Promise.all([get("data/papers.json"), get("data/questions.json"), get("data/scans.json"), get("data/content.json")]);
    D.papers = P.papers; D.topics = P.topics; D.broad = P.broad; D.scans = S; D.C = C;
    D.byPaper = D.papers.map(() => []);
    D.Q = Q.map((a, i) => {
      const p = D.papers[a[0]];
      const q = { i, p: a[0], sec: a[1], qno: a[2], part: a[3], marks: a[4], mraw: a[5], tex: a[6], t: a[7], tb: a[8], weak: a[9], id: a[10], rep: a[11] || [], stem: !!a[12] };
      q.broads = new Set(q.t.map((k) => D.broad.indexOf(D.topics[k][0])).concat(q.tb));
      q.hay = (plainOf(q.tex) + " " + (p.code || "") + " " + (p.title || "")).toLowerCase();
      D.byPaper[a[0]].push(q);
      D.byId.set(q.id, q);
      return q;
    });
    D.years = Array.from(new Set(D.papers.map((p) => p.year))).sort();
    D.codes = Array.from(new Set(D.papers.map((p) => p.code).filter(Boolean))).sort();
    D.scans.forEach((s) => { const k = s.prog + "|" + s.sem + "|" + s.year + "|" + s.kind; if (!D.scanIdx.has(k)) D.scanIdx.set(k, []); D.scanIdx.get(k).push(s); });
    basket = basket.filter((id) => D.byId.has(id));
  }

  /* ---------- helpers ---------- */
  const paperLabel = (p) => (p.code ? p.code : "Paper " + (p.key.split("-").pop())) + (p.title ? " · " + p.title : "");
  const semLabel = (p) => (p.prog === "BSc" ? "B.Sc." : "M.Sc.") + " Sem " + ROMAN[p.sem];
  const scanUrl = (id) => "https://drive.google.com/file/d/" + id + "/view";
  const scansFor = (p) => {
    const list = (D.scanIdx.get(p.prog + "|" + p.sem + "|" + p.year + "|" + (p.kind[0] === "i" ? "i" : "s")) || []).filter((s) => !s.other);
    const code = (p.code || "").replace(/\(.*/, "").toUpperCase();
    return list.slice().sort((a, b) => (b.code === code) - (a.code === code));
  };
  const qLabel = (q) => q.qno + (q.part ? "(" + q.part + ")" : "");
  const lenOf = (q) => (q.marks == null ? "" : q.marks <= SHORT_MAX ? "short" : "long");
  function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 1800); }
  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); toast((label || "Copied") + " ✓"); }
    catch (e) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast((label || "Copied") + " ✓"); } catch (e2) { toast("Select the text and copy it manually"); } ta.remove(); }
  }
  function updateBasketCount() { $$(".basket-n").forEach((n) => { n.textContent = basket.length; n.hidden = !basket.length; }); }
  function toggleBasket(id, btn) {
    const k = basket.indexOf(id);
    if (k >= 0) basket.splice(k, 1); else basket.push(id);
    store.set("basket", basket); updateBasketCount();
    if (btn) { const on = basket.includes(id); btn.classList.toggle("added", on); btn.textContent = on ? "✓ In paper" : "+ Add to paper"; btn.closest(".q") && btn.closest(".q").classList.toggle("in-basket", on); }
  }

  function qCard(q, opts = {}) {
    const p = D.papers[q.p];
    const inB = basket.includes(q.id);
    const tags = [];
    if (!opts.noSource) tags.push(`<a class="qsrc" href="#paper-${p.key}">${semLabel(p)} · ${p.year}${p.kind[0] === "i" ? " · Internal" : ""} · <span class="code">${esc(p.code || "—")}</span></a>`);
    q.t.slice(0, 2).forEach((k) => tags.push(`<span class="tag" title="${esc(D.topics[k][0])}">${esc(D.topics[k][1])}</span>`));
    if (!q.t.length) q.tb.forEach((b) => tags.push(`<span class="tag b">${esc(D.broad[b])}</span>`));
    if (q.rep.length > 1) tags.push(`<span class="tag rep" title="The same question text appears in these years">Asked ${q.rep.length}× · ${q.rep.join(", ")}</span>`);
    return `<article class="q${inB ? " in-basket" : ""}" data-id="${esc(q.id)}">
      <div class="qn">${esc(opts.num != null ? opts.num : qLabel(q))}</div>
      <div class="qbody">${texToHtml(q.tex)}</div>
      <div class="qm">${q.marks != null ? "<b>" + (Number.isInteger(q.marks) ? q.marks : q.marks.toFixed(1)) + "</b>" : ""}</div>
      <footer class="qmeta">${tags.join("")}
        <span class="qact">
          <button type="button" data-act="copy" title="Copy LaTeX source">Copy LaTeX</button>
          <button type="button" data-act="basket" class="${inB ? "added" : ""}">${inB ? "✓ In paper" : "+ Add to paper"}</button>
        </span>
      </footer></article>`;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const card = b.closest("[data-id]");
    const q = card && D.byId.get(card.dataset.id);
    const act = b.dataset.act;
    if (act === "copy" && q) copy(q.tex, "LaTeX copied");
    if (act === "basket" && q) toggleBasket(q.id, b);
  });

  /* ---------- search ---------- */
  function tokens(qs) {
    const out = []; qs.toLowerCase().replace(/"([^"]+)"|(\S+)/g, (m, a, b) => { out.push(a || b); }); return out.filter((t) => t.length > 0);
  }
  function runSearch() {
    const tk = tokens(F.q);
    const from = +F.from || 0, to = +F.to || 9999;
    const topic = F.topic === "" ? -1 : +F.topic, broad = F.broad === "" ? -1 : +F.broad;
    const res = [];
    for (const q of D.Q) {
      if (q.stem) continue;
      const p = D.papers[q.p];
      if (F.prog && p.prog !== F.prog) continue;
      if (F.sem && p.sem !== +F.sem) continue;
      if (p.year < from || p.year > to) continue;
      if (F.code && (p.code || "").replace(/\(.*/, "") !== F.code.replace(/\(.*/, "") && p.code !== F.code) continue;
      if (F.kind && p.kind[0] !== F.kind) continue;
      if (topic >= 0 && !q.t.includes(topic)) continue;
      if (broad >= 0 && !q.broads.has(broad)) continue;
      if (F.len && lenOf(q) !== F.len) continue;
      if (F.rep && q.rep.length < 2) continue;
      let score = 0;
      if (tk.length) {
        let ok = true;
        for (const t of tk) { const k = q.hay.indexOf(t); if (k < 0) { ok = false; break; } score += 10 - Math.min(9, k / 80); }
        if (!ok) continue;
      }
      res.push([q, score]);
    }
    const S = F.sort;
    res.sort((a, b) => {
      const pa = D.papers[a[0].p], pb = D.papers[b[0].p];
      if (S === "new") return pb.year - pa.year || a[0].i - b[0].i;
      if (S === "old") return pa.year - pb.year || a[0].i - b[0].i;
      if (S === "marks") return (b[0].marks || 0) - (a[0].marks || 0);
      if (S === "rep") return b[0].rep.length - a[0].rep.length || pb.year - pa.year;
      return b[1] - a[1] || pb.year - pa.year || a[0].i - b[0].i;
    });
    return res.map((r) => r[0]);
  }
  function opt(v, label, cur) { return `<option value="${esc(v)}"${String(cur) === String(v) ? " selected" : ""}>${esc(label)}</option>`; }
  function viewSearch() {
    const yrs = D.years;
    const specific = D.topics.map((t, i) => [i, t]).filter(([i, t]) => F.broad === "" || t[0] === D.broad[+F.broad]);
    return `<div class="wrap">
      <div class="crumbs"><a href="#home">Home</a> / Search</div>
      <h1 style="margin-bottom:.2em">Search the question bank</h1>
      <p class="muted" style="margin-bottom:22px">${D.Q.filter((q) => !q.stem).length.toLocaleString()} questions from ${D.papers.length} papers. Type words, a theorem, or a paper code; combine with filters.</p>
      <div class="search-layout">
        <aside class="filters" id="filters" data-collapsed="1" aria-label="Filters">
          <div style="display:flex;justify-content:space-between;align-items:center"><span class="flabel" style="margin:0">Filters</span>
            <span><button class="btn btn-ghost btn-sm ftoggle" type="button" id="ftoggle">Show</button> <button class="btn btn-ghost btn-sm" type="button" id="freset">Reset</button></span></div>
          <div class="fbody">
          <div><span class="flabel">Programme</span><div class="seg" data-f="prog">${[["", "All"], ["BSc", "B.Sc."], ["MSc", "M.Sc."]].map(([v, l]) => `<button type="button" class="chip${F.prog === v ? " on" : ""}" data-v="${v}">${l}</button>`).join("")}</div></div>
          <div><label for="f-sem">Semester</label><select id="f-sem">${opt("", "Any semester", F.sem)}${[1, 2, 3, 4, 5, 6].filter((s) => F.prog !== "MSc" || s <= 4).map((s) => opt(s, "Semester " + ROMAN[s], F.sem)).join("")}</select></div>
          <div><span class="flabel">Year</span><div class="row2"><select id="f-from" aria-label="From year">${opt("", "From", F.from)}${yrs.map((y) => opt(y, y, F.from)).join("")}</select><select id="f-to" aria-label="To year">${opt("", "To", F.to)}${yrs.map((y) => opt(y, y, F.to)).join("")}</select></div></div>
          <div><label for="f-code">Paper code</label><input id="f-code" type="text" list="codes" placeholder="e.g. CC-5, MMC-21" value="${esc(F.code)}" autocomplete="off"><datalist id="codes">${D.codes.map((c) => `<option value="${esc(c)}">`).join("")}</datalist></div>
          <div><label for="f-broad">Topic</label><select id="f-broad">${opt("", "Any area", F.broad)}${D.broad.map((b, i) => opt(i, b, F.broad)).join("")}</select>
            <select id="f-topic" style="margin-top:8px" aria-label="Specific topic">${opt("", "Any specific topic", F.topic)}${specific.map(([i, t]) => opt(i, t[1], F.topic)).join("")}</select></div>
          <div><span class="flabel">Length</span><div class="seg" data-f="len">${[["", "Any"], ["short", "Short ≤" + SHORT_MAX], ["long", "Long ≥" + (SHORT_MAX + 1)]].map(([v, l]) => `<button type="button" class="chip${F.len === v ? " on" : ""}" data-v="${v}">${l}</button>`).join("")}</div></div>
          <div><span class="flabel">Exam</span><div class="seg" data-f="kind">${[["", "All"], ["s", "Semester"], ["i", "Internal"]].map(([v, l]) => `<button type="button" class="chip${F.kind === v ? " on" : ""}" data-v="${v}">${l}</button>`).join("")}</div></div>
          <div><label style="display:flex;gap:8px;align-items:center;text-transform:none;letter-spacing:0;font:500 14px var(--f-ui);color:var(--ink-2)"><input type="checkbox" id="f-rep" ${F.rep ? "checked" : ""}> Only questions asked in more than one year</label></div>
          </div>
        </aside>
        <section style="min-width:0">
          <form class="searchbar" id="sform" role="search"><input type="search" id="sq" placeholder="Try: Cayley-Hamilton, Sylow, Frobenius, &quot;uniformly continuous&quot;" value="${esc(F.q)}" aria-label="Search questions"><button class="btn btn-primary" type="submit">Search</button></form>
          <div class="resultbar"><span id="rcount"></span><label>Sort <select id="f-sort">${opt("rel", "Relevance", F.sort)}${opt("new", "Newest first", F.sort)}${opt("old", "Oldest first", F.sort)}${opt("marks", "Most marks", F.sort)}${opt("rep", "Most repeated", F.sort)}</select></label></div>
          <div id="results"></div>
          <div class="pager"><button class="btn btn-ghost" type="button" id="more" hidden>Show more</button></div>
        </section>
      </div></div>`;
  }
  function bindSearch() {
    shown = PAGE;
    const rerun = (reset = true) => { if (reset) shown = PAGE; store.set("filters", F); renderResults(); };
    $("#sform").addEventListener("submit", (e) => { e.preventDefault(); F.q = $("#sq").value.trim(); rerun(); });
    let deb; $("#sq").addEventListener("input", (e) => { clearTimeout(deb); deb = setTimeout(() => { F.q = e.target.value.trim(); rerun(); }, 220); });
    $$(".seg[data-f]").forEach((g) => g.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-v]"); if (!b) return;
      F[g.dataset.f] = b.dataset.v; $$("button", g).forEach((x) => x.classList.toggle("on", x === b));
      if (g.dataset.f === "prog") { route(); return; }
      rerun();
    }));
    const sel = { "f-sem": "sem", "f-from": "from", "f-to": "to", "f-sort": "sort", "f-topic": "topic" };
    Object.entries(sel).forEach(([id, k]) => $("#" + id).addEventListener("change", (e) => { F[k] = e.target.value; rerun(); }));
    $("#f-broad").addEventListener("change", (e) => { F.broad = e.target.value; F.topic = ""; route(); });
    $("#f-code").addEventListener("change", (e) => { F.code = e.target.value.trim().toUpperCase(); rerun(); });
    $("#f-rep").addEventListener("change", (e) => { F.rep = e.target.checked; rerun(); });
    $("#freset").addEventListener("click", () => { F = defaultFilters(); store.set("filters", F); route(); });
    $("#ftoggle").addEventListener("click", (e) => { const f = $("#filters"); const c = f.dataset.collapsed === "1"; f.dataset.collapsed = c ? "0" : "1"; e.target.textContent = c ? "Hide" : "Show"; });
    $("#more").addEventListener("click", () => { shown += PAGE; renderResults(true); });
    renderResults();
  }
  let lastRes = [];
  function renderResults(append) {
    if (!append) lastRes = runSearch();
    const box = $("#results"); if (!box) return;
    const n = lastRes.length;
    $("#rcount").textContent = n ? `${n.toLocaleString()} question${n === 1 ? "" : "s"}` : "";
    if (!n) { box.innerHTML = `<div class="empty">No questions match. Loosen a filter, or check the <a href="#scans">scanned papers</a> — not every scan has been typed yet.</div>`; $("#more").hidden = true; return; }
    const from = append ? box.children.length : 0;
    const html = lastRes.slice(from, shown).map((q) => qCard(q)).join("");
    if (append) { const tmp = document.createElement("div"); tmp.innerHTML = html; const frag = Array.from(tmp.children); frag.forEach((c) => box.appendChild(c)); frag.forEach(typeset); }
    else { box.innerHTML = html; typeset(box); }
    $("#more").hidden = shown >= n;
    $("#more").textContent = `Show more (${(n - Math.min(shown, n)).toLocaleString()} left)`;
  }

  /* ---------- home ---------- */
  function viewHome() {
    const nb = D.papers.filter((p) => p.prog === "BSc").length, nm = D.papers.length - nb;
    const yrs = D.years;
    const counts = D.broad.map((b, i) => [i, D.Q.filter((q) => !q.stem && q.broads.has(i)).length]).sort((a, b) => b[1] - a[1]);
    const max = counts[0][1];
    const repeated = D.Q.filter((q) => q.rep.length >= 3 && q.marks >= 4).sort((a, b) => b.rep.length - a.rep.length).slice(0, 3);
    const semCard = (prog, s) => {
      const n = D.papers.filter((p) => p.prog === prog && p.sem === s).length;
      return `<a class="card semcard" href="#papers" data-goto="${prog}-${s}"><span class="num">${ROMAN[s]}</span><b>${prog === "BSc" ? "B.Sc." : "M.Sc."} Semester ${ROMAN[s]}</b><small>${n} typed paper${n === 1 ? "" : "s"}</small></a>`;
    };
    return `<div class="wrap">
      <section class="hero">
        <div>
          <div class="eyebrow">Department of Mathematics · Visva-Bharati</div>
          <h1 style="margin-top:14px">Every question paper, <em>typed and searchable.</em></h1>
          <p class="lede">Previous-year questions of the B.Sc. and M.Sc. Mathematics examinations at Visva-Bharati, Santiniketan, transcribed in LaTeX, tagged by topic, and linked to the original scans. Made by students, for students.</p>
          <form class="bigsearch" id="homeform" role="search"><input type="search" id="homeq" placeholder="Search a theorem, a topic, or a paper code…" aria-label="Search questions" autocomplete="off"><button class="btn btn-primary" type="submit">Search</button></form>
          <div class="hints">${["Cayley-Hamilton", "Sylow", "Green's theorem", "Frobenius", "Simplex", "Cauchy-Riemann", "Runge-Kutta"].map((h) => `<button type="button" class="chip" data-hint="${esc(h)}">${esc(h)}</button>`).join("")}</div>
        </div>
        <div class="stats" aria-label="Archive in numbers">
          <div class="stat"><b>${D.Q.filter((q) => !q.stem).length.toLocaleString()}</b><span>questions, part by part</span></div>
          <div class="stat"><b>${D.papers.length}</b><span>typed papers · ${nb} B.Sc., ${nm} M.Sc.</span></div>
          <div class="stat"><b>${D.scans.length}</b><span>scanned PDFs linked</span></div>
          <div class="stat"><b>${yrs[0]}–${yrs[yrs.length - 1]}</b><span>examination years typed</span></div>
        </div>
      </section>

      <section class="section"><div class="section-head"><h2>Browse by semester</h2><a href="#papers">All papers →</a></div>
        <div class="flabel">B.Sc. Mathematics (Honours / Major)</div>
        <div class="grid g4" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,160px),1fr))">${[1, 2, 3, 4, 5, 6].map((s) => semCard("BSc", s)).join("")}</div>
        <div class="flabel" style="margin-top:22px">M.Sc. Mathematics</div>
        <div class="grid g4" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,160px),1fr))">${[1, 2, 3, 4].map((s) => semCard("MSc", s)).join("")}</div>
      </section>

      <section class="section"><div class="section-head"><h2>Questions by topic</h2><a href="#topics">Topic map and trends →</a></div>
        <div class="grid g3">${counts.slice(0, 9).map(([i, n]) => `<a class="card topic-tile" href="#search" data-broad="${i}"><h3>${esc(D.broad[i])}</h3><p>${n.toLocaleString()} questions</p><div class="bar"><i style="width:${Math.round((100 * n) / max)}%"></i></div></a>`).join("")}</div>
      </section>

      ${repeated.length ? `<section class="section"><div class="section-head"><h2>Asked again and again</h2><a href="#search" data-rep="1">All repeated questions →</a></div>
        <p class="muted" style="margin-top:-6px">The same wording set in three or more years: a good place to start revising.</p>
        <div id="rep-list">${repeated.map((q) => qCard(q)).join("")}</div></section>` : ""}

      <section class="section"><div class="appeal">
        <div><div class="eyebrow" style="color:var(--turmeric)">An appeal</div><h2 style="margin-top:10px">Help keep the archive complete</h2>
        <p>Send the question papers of your semester, share your notes, or help with typing and checking. Each paper you send helps the next batch of students.</p></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary" href="${esc(D.C.forms.questions)}" target="_blank" rel="noopener">Send question papers</a><a class="btn btn-ghost" href="#contribute">Other ways to help</a></div>
      </div></section>
    </div>`;
  }
  function bindHome() {
    $("#homeform").addEventListener("submit", (e) => { e.preventDefault(); F = defaultFilters(); F.q = $("#homeq").value.trim(); location.hash = "search"; });
    $$("[data-hint]").forEach((b) => b.addEventListener("click", () => { F = defaultFilters(); F.q = b.dataset.hint; location.hash = "search"; }));
    $$("[data-broad]").forEach((a) => a.addEventListener("click", () => { F = defaultFilters(); F.broad = a.dataset.broad; }));
    $$("[data-rep]").forEach((a) => a.addEventListener("click", () => { F = defaultFilters(); F.rep = true; F.sort = "rep"; }));
    $$("[data-goto]").forEach((a) => a.addEventListener("click", () => { store.set("papersTab", a.dataset.goto.split("-")[0]); store.set("papersSem", a.dataset.goto.split("-")[1]); }));
    typeset($("#rep-list"));
  }

  /* ---------- papers matrix ---------- */
  function viewPapers() {
    const tab = store.get("papersTab", "BSc");
    const sems = tab === "BSc" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4];
    const years = Array.from(new Set(D.papers.filter((p) => p.prog === tab).map((p) => p.year).concat(D.scans.filter((s) => s.prog === tab && !s.old && s.year >= 2016).map((s) => s.year)))).sort((a, b) => b - a);
    const cell = (s, y) => {
      const ps = D.papers.filter((p) => p.prog === tab && p.sem === s && p.year === y);
      const sc = D.scans.filter((x) => x.prog === tab && x.sem === s && x.year === y && !x.other).length;
      return `<td>${ps.map((p) => `<a href="#paper-${p.key}" title="${esc(paperLabel(p))}"><span class="cellpill${p.kind[0] === "i" ? " i" : ""}">${esc(p.code || "Paper")}</span></a>`).join("")}${sc ? `<div><a class="cellscan" href="#scans" data-scan="${tab}|${s}|${y}">${sc} scan${sc > 1 ? "s" : ""}</a></div>` : ps.length ? "" : '<span class="muted">—</span>'}</td>`;
    };
    return `<div class="wrap"><div class="crumbs"><a href="#home">Home</a> / Papers</div>
      <h1>Question papers</h1><p class="lede" style="margin-bottom:22px">Every typed paper by semester and year. Green codes are end-semester papers, amber are internal tests. The scan count links to the original PDFs.</p>
      <div class="tabs">${["BSc", "MSc"].map((t) => `<button type="button" class="chip${t === tab ? " on" : ""}" data-tab="${t}">${PROG[t]}</button>`).join("")}</div>
      <div class="scroll-x"><table class="matrix"><thead><tr><th class="rowh">Year</th>${sems.map((s) => `<th>Semester ${ROMAN[s]}</th>`).join("")}</tr></thead>
      <tbody>${years.map((y) => `<tr><th class="rowh">${y}</th>${sems.map((s) => cell(s, y)).join("")}</tr>`).join("")}</tbody></table></div>
      <p class="muted" style="margin-top:14px;font-size:13.5px">Older papers (before 2016) are available as scans only — see <a href="#scans">Scans</a>. Syllabus eras: BMC codes until 2016–17, CBCS (CC, DSE, SEC, GE) from 2017–18, NEP (MJMA, MNMA, SEC, MD) from 2025–26.</p></div>`;
  }
  function bindPapers() {
    $$("[data-tab]").forEach((b) => b.addEventListener("click", () => { store.set("papersTab", b.dataset.tab); route(); }));
    $$("[data-scan]").forEach((a) => a.addEventListener("click", () => { const [pg, s, y] = a.dataset.scan.split("|"); store.set("scanF", { prog: pg, sem: s, year: y, q: "", math: true, old: false }); }));
  }

  /* ---------- one paper ---------- */
  function viewPaper(key) {
    const pi = D.papers.findIndex((p) => p.key === key);
    if (pi < 0) return `<div class="wrap"><div class="empty">That paper isn't in the archive. <a href="#papers">Back to papers</a></div></div>`;
    const p = D.papers[pi], qs = D.byPaper[pi];
    const scans = scansFor(p);
    let html = "", sec = null, lastQ = null;
    for (const q of qs) {
      if (q.sec !== sec) { sec = q.sec; if (sec) html += `<div class="secthead">${esc(plainOf(sec))}</div>`; lastQ = null; }
      const num = q.qno !== lastQ ? qLabel(q) : "(" + q.part + ")";
      lastQ = q.qno;
      html += q.stem ? `<p class="secthead" style="text-transform:none;letter-spacing:0;font:italic 400 16px var(--f-text)">${esc(qLabel(q))}. ${texToHtml(q.tex)}</p>` : qCard(q, { noSource: true, num });
    }
    const siblings = D.papers.filter((x) => x.prog === p.prog && x.sem === p.sem && x.year === p.year && x !== p);
    const other = D.papers.filter((x) => x.prog === p.prog && x.code && x.code === p.code && x !== p).sort((a, b) => b.year - a.year);
    return `<div class="wrap" style="max-width:920px"><div class="crumbs"><a href="#home">Home</a> / <a href="#papers">Papers</a> / ${esc(semLabel(p))} / ${p.year}</div>
      <header class="exam-head">
        <div class="inst">Visva-Bharati · Department of Mathematics</div>
        <h1>${esc(p.code || "Paper " + key.split("-").pop())}</h1>
        ${p.title ? `<div class="sub">${esc(p.title)}${p.title_guess ? ' <span class="muted" title="Title taken from the same course in a nearby year">*</span>' : ""}</div>` : ""}
        <div class="fm"><span>${esc(PROG[p.prog])} · Semester ${ROMAN[p.sem]}</span><span>${p.kind[0] === "i" ? "Internal assessment" : "End-semester examination"} · ${p.year}</span>${p.full ? `<span>Full marks ${esc(p.full)}</span>` : ""}</div>
      </header>
      <div class="paper-tools">
        <button class="btn btn-ghost btn-sm" type="button" id="copypaper">Copy whole paper (LaTeX)</button>
        <button class="btn btn-ghost btn-sm" type="button" id="addpaper">+ Add all to my paper</button>
        ${scans.slice(0, 1).map((s) => `<a class="btn btn-primary btn-sm" href="${scanUrl(s.id)}" target="_blank" rel="noopener">View original scan ↗</a>`).join("")}
      </div>
      ${p.rule ? `<p class="center muted" style="text-align:center;font:italic 15px var(--f-text)">${esc(plainOf(p.rule))}</p>` : ""}
      <div id="paperqs">${html}</div>
      <section class="section" style="margin-top:36px"><div class="section-head"><h2 style="font-size:20px">Original scans</h2><span class="muted">Opens in Google Drive</span></div>
        ${scans.length ? `<div class="list">${scans.map((s) => `<a class="row" href="${scanUrl(s.id)}" target="_blank" rel="noopener"><span class="t">${esc(s.label)}</span><span class="code muted">${esc(s.code || "")} ↗</span></a>`).join("")}</div>` : `<div class="empty">No scan is linked for this exam yet.</div>`}
      </section>
      ${other.length ? `<section class="section" style="margin-top:36px"><div class="section-head"><h2 style="font-size:20px">${esc(p.code)} in other years</h2></div><div class="tabs">${other.map((x) => `<a class="chip" href="#paper-${x.key}">${x.year}${x.kind[0] === "i" ? " internal" : ""}</a>`).join("")}</div></section>` : ""}
      ${siblings.length ? `<section class="section" style="margin-top:28px"><div class="section-head"><h2 style="font-size:20px">Same semester, same year</h2></div><div class="tabs">${siblings.map((x) => `<a class="chip" href="#paper-${x.key}">${esc(paperLabel(x))}</a>`).join("")}</div></section>` : ""}
    </div>`;
  }
  function bindPaper(key) {
    const pi = D.papers.findIndex((p) => p.key === key); if (pi < 0) return;
    const qs = D.byPaper[pi];
    typeset($("#paperqs"));
    $("#copypaper").addEventListener("click", () => copy(toLatex(qs, D.papers[pi]), "Paper LaTeX copied"));
    $("#addpaper").addEventListener("click", () => { qs.forEach((q) => { if (!basket.includes(q.id)) basket.push(q.id); }); store.set("basket", basket); updateBasketCount(); route(); toast(qs.length + " questions in your paper"); });
  }
  function toLatex(qs, p, title) {
    const lines = ["\\documentclass[11pt]{article}", "\\usepackage{amsmath,amssymb,enumitem}", "\\usepackage[margin=2.2cm]{geometry}", "\\newcommand{\\printedmarks}[1]{\\hfill[#1]}", "\\newcommand{\\unreadable}[1]{#1}", "\\newcommand{\\gapmark}[1]{\\ldots}", "\\newcommand{\\missingglyph}{\\square}", "\\newenvironment{romanparts}{\\begin{enumerate}[label=(\\roman*)]}{\\end{enumerate}}", "\\begin{document}"];
    lines.push("\\begin{center}\\textbf{" + (title || (p ? PROG[p.prog] + " Examination " + p.year + "\\\\Semester " + ROMAN[p.sem] + " \\\\ " + (p.code || "") + (p.title ? " (" + p.title + ")" : "") : "Question paper")) + "}\\end{center}");
    lines.push("\\begin{enumerate}");
    let sec = null;
    qs.forEach((q) => {
      const src = p ? "" : " % " + semLabel(D.papers[q.p]) + " " + D.papers[q.p].year + " " + (D.papers[q.p].code || "") + " Q" + qLabel(q);
      if (p && q.sec !== sec) { sec = q.sec; if (sec) lines.push("\\item[] \\begin{center}\\textbf{" + plainOf(sec) + "}\\end{center}"); }
      lines.push("\\item " + q.tex.trim() + (q.marks != null && !/printedmarks|hfill/.test(q.tex) ? " \\hfill [" + (q.mraw || q.marks) + "]" : "") + src);
    });
    lines.push("\\end{enumerate}", "\\end{document}");
    return lines.join("\n");
  }

  /* ---------- basket (teacher's paper builder) ---------- */
  function viewBasket() {
    const qs = basket.map((id) => D.byId.get(id)).filter(Boolean);
    const total = qs.reduce((s, q) => s + (q.marks || 0), 0);
    return `<div class="wrap" style="max-width:920px"><div class="crumbs"><a href="#home">Home</a> / My paper</div>
      <h1>My paper</h1><p class="lede">Collect questions from anywhere in the archive, reorder them, and copy the LaTeX to set a new paper or a practice sheet. Your selection stays in this browser.</p>
      ${qs.length ? `<div class="resultbar" style="margin-top:18px"><span>${qs.length} question${qs.length > 1 ? "s" : ""} · ${total} marks</span>
        <span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" type="button" id="bcopy">Copy LaTeX</button><button class="btn btn-ghost btn-sm" type="button" id="btext">Copy plain text</button><button class="btn btn-ghost btn-sm" type="button" id="bdl">Download .tex</button><button class="btn btn-ghost btn-sm" type="button" id="bclear">Clear</button></span></div>
        <div id="blist">${qs.map((q, k) => `<div style="display:flex;gap:6px;align-items:flex-start"><div style="display:grid;gap:4px;padding-top:14px"><button class="iconbtn" type="button" data-mv="${k}" data-d="-1" aria-label="Move up">↑</button><button class="iconbtn" type="button" data-mv="${k}" data-d="1" aria-label="Move down">↓</button></div><div style="flex:1;min-width:0">${qCard(q, { num: k + 1 + "." })}</div></div>`).join("")}</div>
        <details class="more" style="margin-top:16px"><summary>Show LaTeX source</summary><textarea class="export" readonly id="bsrc">${esc(toLatex(qs, null, "Question paper"))}</textarea></details>`
      : `<div class="empty" style="margin-top:22px">Your paper is empty. Use <b>+ Add to paper</b> on any question in <a href="#search">Search</a> or on a paper page.</div>`}
    </div>`;
  }
  function bindBasket() {
    if (!$("#blist")) return;
    typeset($("#blist"));
    const qs = () => basket.map((id) => D.byId.get(id)).filter(Boolean);
    $("#bcopy").addEventListener("click", () => copy(toLatex(qs(), null, "Question paper"), "LaTeX copied"));
    $("#btext").addEventListener("click", () => copy(qs().map((q, k) => `${k + 1}. ${plainOf(q.tex)}${q.marks != null ? "  [" + (q.mraw || q.marks) + "]" : ""}`).join("\n\n"), "Text copied"));
    $("#bdl").addEventListener("click", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([toLatex(qs(), null, "Question paper")], { type: "text/x-tex" })); a.download = "vbmath-paper.tex"; document.body.appendChild(a); a.click(); a.remove(); });
    $("#bclear").addEventListener("click", (e) => { if (e.target.dataset.sure) { basket = []; store.set("basket", basket); updateBasketCount(); route(); } else { e.target.dataset.sure = "1"; e.target.textContent = "Click again to clear"; } });
    $$("[data-mv]").forEach((b) => b.addEventListener("click", () => { const k = +b.dataset.mv, d = +b.dataset.d, j = k + d; if (j < 0 || j >= basket.length) return; [basket[k], basket[j]] = [basket[j], basket[k]]; store.set("basket", basket); route(); }));
  }

  /* ---------- scans ---------- */
  function viewScans() {
    const f = Object.assign({ prog: "", sem: "", year: "", q: "", math: true, old: false }, store.get("scanF", {}));
    const years = Array.from(new Set(D.scans.map((s) => s.year).filter(Boolean))).sort((a, b) => b - a);
    return `<div class="wrap"><div class="crumbs"><a href="#home">Home</a> / Scans</div>
      <h1>Scanned papers</h1><p class="lede" style="margin-bottom:20px">All ${D.scans.length} original PDFs in the VBMath Drive, from 2004 onwards, each with its own link. Some are not typed yet; those still open here.</p>
      <div class="card" style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));align-items:end;margin-bottom:18px">
        <div><label class="flabel" for="s-prog">Programme</label><select id="s-prog">${opt("", "All", f.prog)}${opt("BSc", "B.Sc.", f.prog)}${opt("MSc", "M.Sc.", f.prog)}</select></div>
        <div><label class="flabel" for="s-sem">Semester</label><select id="s-sem">${opt("", "All", f.sem)}${[1, 2, 3, 4, 5, 6].map((s) => opt(s, "Sem " + ROMAN[s], f.sem)).join("")}</select></div>
        <div><label class="flabel" for="s-year">Year</label><select id="s-year">${opt("", "All", f.year)}${years.map((y) => opt(y, y, f.year)).join("")}</select></div>
        <div style="grid-column:span 2;min-width:0"><label class="flabel" for="s-q">Name contains</label><input type="search" id="s-q" value="${esc(f.q)}" placeholder="e.g. MMC-21, topology"></div>
        <label style="display:flex;gap:8px;align-items:center;font-size:14px;color:var(--ink-2)"><input type="checkbox" id="s-math" ${f.math ? "checked" : ""}> Mathematics only</label>
      </div>
      <div id="scanlist"></div>
      <section class="section"><div class="section-head"><h2 style="font-size:20px">Drive folders</h2><span class="muted">The full folders, as on the old site</span></div>
        <div class="grid g2">${["BSc", "MSc"].map((pg) => `<div class="card"><h3>${PROG[pg]}</h3><div class="tabs" style="margin:8px 0 0">${D.C.folders[pg].map(([l, u]) => `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join("")}</div></div>`).join("")}
        <div class="card"><h3>Older B.Sc. folders</h3><p style="margin-bottom:8px">Before the 2025 reorganisation.</p><div class="tabs" style="margin:0">${D.C.folders.BSc_old1.concat(D.C.folders.BSc_old2).map(([l, u], i) => `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener">${i < 6 ? "" : "2017+ "}${esc(l)} ↗</a>`).join("")}</div></div></div>
      </section></div>`;
  }
  function bindScans() {
    const read = () => ({ prog: $("#s-prog").value, sem: $("#s-sem").value, year: $("#s-year").value, q: $("#s-q").value.trim(), math: $("#s-math").checked });
    const draw = () => {
      const f = read(); store.set("scanF", f);
      const ql = f.q.toLowerCase();
      const list = D.scans.filter((s) => (!f.prog || s.prog === f.prog) && (!f.sem || s.sem === +f.sem) && (!f.year || s.year === +f.year) && (!f.math || !s.other) && (!ql || (s.label + " " + (s.code || "")).toLowerCase().includes(ql)));
      const groups = new Map();
      list.forEach((s) => { const k = s.prog + "|" + s.sem + "|" + (s.year || 0); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); });
      const keys = Array.from(groups.keys()).sort((a, b) => { const [pa, sa, ya] = a.split("|"), [pb, sb, yb] = b.split("|"); return pa.localeCompare(pb) || sa - sb || yb - ya; });
      $("#scanlist").innerHTML = list.length ? `<p class="muted" style="font-size:13.5px">${list.length} PDF${list.length > 1 ? "s" : ""}</p>` + keys.map((k) => {
        const [pg, s, y] = k.split("|"); const g = groups.get(k);
        const typed = D.papers.filter((p) => p.prog === pg && p.sem === +s && p.year === +y);
        return `<div style="margin-bottom:18px"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;justify-content:space-between;margin-bottom:8px"><h3 style="margin:0">${pg === "BSc" ? "B.Sc." : "M.Sc."} Semester ${ROMAN[s]} · ${+y || "Year unknown"}</h3>${typed.length ? `<span class="tabs" style="margin:0">${typed.map((p) => `<a class="chip" href="#paper-${p.key}">${esc(p.code || "Paper")} typed</a>`).join("")}</span>` : '<span class="muted" style="font-size:13px">Not typed yet</span>'}</div>
          <div class="list">${g.map((x) => `<a class="row" href="${scanUrl(x.id)}" target="_blank" rel="noopener"><span class="t">${esc(x.label)}${x.kind === "i" ? ' <span class="tag rep">Internal</span>' : ""}${x.other ? ' <span class="tag b">Other subject</span>' : ""}${x.old ? ' <span class="tag b">Older</span>' : ""}</span><span class="muted">↗</span></a>`).join("")}</div></div>`;
      }).join("") : `<div class="empty">No scans match.</div>`;
    };
    ["s-prog", "s-sem", "s-year", "s-math"].forEach((id) => $("#" + id).addEventListener("change", draw));
    let deb; $("#s-q").addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(draw, 200); });
    draw();
  }

  /* ---------- topics ---------- */
  function viewTopics() {
    const yrs = D.years;
    const byYear = new Map(yrs.map((y) => [y, 0]));
    const cell = new Map();
    D.Q.forEach((q) => { if (q.stem) return; const y = D.papers[q.p].year; byYear.set(y, byYear.get(y) + 1); q.broads.forEach((b) => cell.set(b + "|" + y, (cell.get(b + "|" + y) || 0) + 1)); });
    const tc = D.topics.map(() => 0); D.Q.forEach((q) => !q.stem && q.t.forEach((k) => tc[k]++));
    const bc = D.broad.map((b, i) => D.Q.filter((q) => !q.stem && q.broads.has(i)).length);
    const order = D.broad.map((b, i) => i).sort((a, b) => bc[b] - bc[a]);
    let maxShare = 0; cell.forEach((v, k) => { const y = +k.split("|")[1]; maxShare = Math.max(maxShare, v / byYear.get(y)); });
    const shade = (v) => `color-mix(in srgb, var(--laterite) ${Math.round(8 + 72 * v)}%, var(--card))`;
    const weak = D.Q.filter((q) => q.weak).length;
    return `<div class="wrap"><div class="crumbs"><a href="#home">Home</a> / Topics</div>
      <h1>Topic map</h1><p class="lede">Each question part is tagged with up to three topics, from broad areas down to specific ones. Click any topic or any cell to see its questions.</p>
      <p class="note" style="max-width:76ch">Tags come from a first automatic pass over the question text, so some are imprecise. ${weak.toLocaleString()} questions are marked for checking. The trend table shows how often an area was examined in past years; it describes patterns, it does not predict a paper.</p>
      <section class="section" style="margin-top:32px"><div class="section-head"><h2>How often each area is examined</h2><span class="muted">Share of that year's questions</span></div>
        <div class="scroll-x" style="padding:10px"><table class="heat"><thead><tr><th></th>${yrs.map((y) => `<th>’${String(y).slice(2)}</th>`).join("")}</tr></thead><tbody>
        ${order.map((b) => `<tr><th>${esc(D.broad[b])}</th>${yrs.map((y) => { const v = cell.get(b + "|" + y) || 0, sh = byYear.get(y) ? v / byYear.get(y) : 0; return `<td style="background:${shade(sh / maxShare)};color:${sh / maxShare > 0.55 ? "#fff" : "var(--ink)"}" data-hb="${b}" data-hy="${y}" title="${esc(D.broad[b])}, ${y}: ${v} questions (${Math.round(sh * 100)}%)">${v ? Math.round(sh * 100) : ""}</td>`; }).join("")}</tr>`).join("")}
        </tbody></table></div><p class="muted" style="font-size:13px;margin-top:8px">Numbers are percentages. B.Sc. and M.Sc. together; use Search filters to split them.</p></section>
      <section class="section"><div class="section-head"><h2>All topics</h2></div>
        <div class="grid g2">${order.map((b) => `<div class="card"><h3><a href="#search" data-tb="${b}" style="color:inherit;text-decoration:none">${esc(D.broad[b])}</a> <span class="muted" style="font:400 13px var(--f-ui)">${bc[b].toLocaleString()}</span></h3>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${D.topics.map((t, k) => [t, k]).filter(([t]) => t[0] === D.broad[b]).sort((x, y) => tc[y[1]] - tc[x[1]]).map(([t, k]) => `<a class="tag" href="#search" data-tt="${k}" data-tb2="${b}">${esc(t[1])} · ${tc[k]}</a>`).join("")}</div></div>`).join("")}</div></section></div>`;
  }
  function bindTopics() {
    $$("[data-hb]").forEach((td) => td.addEventListener("click", () => { F = defaultFilters(); F.broad = td.dataset.hb; F.from = F.to = td.dataset.hy; location.hash = "search"; }));
    $$("[data-tb]").forEach((a) => a.addEventListener("click", () => { F = defaultFilters(); F.broad = a.dataset.tb; }));
    $$("[data-tt]").forEach((a) => a.addEventListener("click", () => { F = defaultFilters(); F.broad = a.dataset.tb2; F.topic = a.dataset.tt; }));
  }

  /* ---------- content pages ---------- */
  const ext = (u, l, cls) => `<a ${cls ? `class="${cls}" ` : ""}href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}${cls === "chip" ? " ↗" : ""}</a>`;
  const page = (crumb, title, lede, body) => `<div class="wrap"><div class="crumbs"><a href="#home">Home</a> / ${esc(crumb)}</div><h1>${esc(title)}</h1>${lede ? `<p class="lede" style="margin-bottom:26px">${lede}</p>` : ""}${body}</div>`;
  function viewExams() {
    return page("Competitive exams", "Competitive & admission exams", "Previous papers for IIT JAM, CSIR-UGC NET, GATE, NBHM, TIFR and the Visva-Bharati M.Sc. admission test.",
      `<div class="grid g2">${D.C.exams.map((e) => `<div class="card"><h3>${esc(e.name)}</h3><p style="margin-bottom:12px">${esc(e.note)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${e.links.map(([l, u], i) => ext(u, l === "Paper" ? "Paper " + (e.links.slice(0, i + 1).filter((x) => x[0] === "Paper").length) : l, "chip")).join("")}</div>
        ${e.syllabus ? `<p style="margin-top:12px">${ext(e.syllabus, "Syllabus ↗")}</p>` : ""}</div>`).join("")}</div>`);
  }
  function viewNotes() {
    return page("Notes", "Notes", "Class notes from the department, written and shared by former students. These notes are for reference only; they cannot replace the classes taken by your teachers.",
      `<div class="grid g2">${D.C.notes.items.map(([t, by, u]) => `<a class="card" href="${esc(u)}" target="_blank" rel="noopener"><h3>${esc(t)} <span class="muted">↗</span></h3><p>${esc(by)}</p></a>`).join("")}</div>
      <section class="section"><div class="section-head"><h2>Class-note folders</h2></div><div class="grid g2">${Object.entries(D.C.notes.folders).map(([k, us]) => `<div class="card"><h3>${esc(k)}</h3><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">${us.map((u, i) => ext(u, "Folder " + (i + 1), "chip")).join("")}</div></div>`).join("")}</div>
      <p style="margin-top:18px">${ext(D.C.forms.notes, "Upload your notes →")}</p></section>`);
  }
  function viewSyllabus() {
    return page("Syllabus", "Syllabus", "Official syllabi, newest first. Paper codes in the archive follow these eras: BMC (2011–12), CBCS (2017–18 and 2020–21), NEP (2025–26).",
      `<div class="list">${D.C.syllabus.map(([t, d, u]) => `<a class="row" href="${esc(u)}" target="_blank" rel="noopener"><span class="t"><b>${esc(t)}</b>${d ? `<br><span class="muted" style="font-size:13.5px">${esc(d)}</span>` : ""}</span><span class="muted">↗</span></a>`).join("")}</div>`);
  }
  function viewBooks() {
    return page("Books", "Books", "Standard texts recommended by students and teachers, by subject. Please buy the book or borrow it from the library.",
      `<div class="grid g2">${Object.entries(D.C.books).map(([s, bs]) => `<div class="card"><h3>${esc(s)}</h3><ul style="margin:8px 0 0;padding-left:1.1em;color:var(--ink-2);font:15px/1.55 var(--f-text)">${bs.map((b) => { const [t, a] = b.split(" — "); return `<li><i>${esc(t)}</i>${a ? " — " + esc(a) : ""}</li>`; }).join("")}</ul></div>`).join("")}</div>
      <p style="margin-top:18px">${ext(D.C.forms.books, "Suggest a book →")}</p>`);
  }
  function viewLearn() {
    return page("Videos & websites", "Videos & websites", "Courses, references and job portals collected for mathematics students.",
      `<div class="grid g2">${D.C.video.map(([n, d, ls]) => `<div class="card"><h3>${esc(n)}</h3><p style="margin-bottom:10px">${esc(d)}</p><div style="display:flex;flex-wrap:wrap;gap:6px">${ls.map(([l, u]) => ext(u, l, "chip")).join("")}</div></div>`).join("")}</div>
      ${D.C.websites.map(([g, ls]) => `<section class="section" style="margin-top:34px"><div class="section-head"><h2 style="font-size:20px">${esc(g)}</h2></div><div style="display:flex;flex-wrap:wrap;gap:8px">${ls.map(([l, u]) => ext(u, l, "chip")).join("")}</div></section>`).join("")}`);
  }
  function viewPeople() {
    return page("People", "People", "Faculty of the Department of Mathematics, Visva-Bharati, with the courses they teach and their research interests (as listed on the earlier site).",
      `<div class="grid g2">${D.C.faculty.map(([n, c, r]) => `<div class="card"><h3>${esc(n)}</h3><p><b style="color:var(--ink)">Teaches</b> ${esc(c)}</p>${r ? `<p style="margin-top:6px"><b style="color:var(--ink)">Research</b> ${esc(r)}</p>` : ""}</div>`).join("")}</div>
      <section class="section"><div class="section-head"><h2 style="font-size:20px">Former faculty</h2></div><p class="prose">${D.C.retired.map(esc).join(" · ")}</p></section>
      <section class="section"><div class="section-head"><h2 style="font-size:20px">Research scholars and alumni</h2></div><p class="prose">The list of current and graduated research scholars, with their supervisors, is kept on the ${ext(D.C.scholars_link, "earlier site")}. Alumni can add their details through the alumni form there.</p></section>`);
  }
  function viewGuides() {
    const C = D.C;
    return page("Guides", "Guides", "Practical help: scholarships, admission, reaching Santiniketan, LaTeX, numerical tools and the Ph.D. thesis submission process.",
      `<div class="tabs">${[["sch", "Scholarships"], ["adm", "Admission"], ["reach", "How to reach"], ["latex", "LaTeX"], ["tools", "Numerical tools"], ["thesis", "Thesis submission"]].map(([k, l]) => `<a class="chip" href="#guides" data-jump="${k}">${l}</a>`).join("")}</div>
      <section class="section" id="g-sch" style="margin-top:28px"><div class="section-head"><h2>Scholarships</h2></div><div class="grid g2">${C.scholarships.map(([n, d, u]) => `<div class="card"><h3>${esc(n)}</h3><p>${esc(d)}</p><p style="margin-top:10px">${ext(u, "Official site ↗")}</p></div>`).join("")}</div><p class="muted" style="margin-top:10px;font-size:13.5px">Amounts and rules change; check the official notice. ${ext(C.forms.scholarship, "Suggest a scholarship")}.</p></section>
      <section class="section" id="g-adm"><div class="section-head"><h2>Admission to Visva-Bharati</h2></div><div class="prose">${C.admission.map((x) => `<p>${esc(x)}</p>`).join("")}</div></section>
      <section class="section" id="g-reach"><div class="section-head"><h2>How to reach the department</h2></div><div class="grid g2">${C.reach.map(([t, d, u]) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p>${u ? `<p style="margin-top:8px">${ext(u, "Open ↗")}</p>` : ""}</div>`).join("")}</div></section>
      <section class="section" id="g-latex"><div class="section-head"><h2>LaTeX for project work</h2></div><p class="prose">LaTeX positions text and equations for you, so long mathematical documents stay tidy as you edit. Install an editor and a TeX distribution, or write online on Overleaf.</p><div style="display:flex;flex-wrap:wrap;gap:8px">${C.latex.map(([l, u]) => ext(u, l, "chip")).join("")}</div></section>
      <section class="section" id="g-tools"><div class="section-head"><h2>Numerical tools</h2><span class="muted">From Math++</span></div><div style="display:flex;flex-wrap:wrap;gap:8px">${C.tools.map(([l, u]) => ext(u, l, "chip")).join("")}</div></section>
      <section class="section" id="g-thesis"><div class="section-head"><h2>Ph.D. thesis submission</h2></div><ol class="prose">${C.thesis.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${C.thesis.links.map(([l, u]) => ext(u, l, "chip")).join("")}</div></section>`);
  }
  function bindGuides() { $$("[data-jump]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const t = $("#g-" + a.dataset.jump); t && t.scrollIntoView({ behavior: "smooth", block: "start" }); })); }
  function viewContribute() {
    const C = D.C;
    return page("Contribute", "Contribute", "VBMath runs on volunteers. Every scan, correction and note makes the archive better for the next batch.",
      `<div class="grid g2">
        <div class="card"><h3>Send question papers</h3><p>Photograph or scan the papers of your semester and upload them with the form. Choose the programme, semester and year so they are sorted automatically.</p><p style="margin-top:12px"><a class="btn btn-primary btn-sm" href="${esc(C.forms.questions)}" target="_blank" rel="noopener">Open the upload form ↗</a></p></div>
        <div class="card"><h3>Help maintain the site</h3><p>Scholars and B.Sc./M.Sc. students can help by collecting papers, typing and checking questions, or overseeing a semester. Technical help is available.</p><p style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="${esc(C.forms.volunteer)}" target="_blank" rel="noopener">Volunteer ↗</a></p></div>
        <div class="card"><h3>Share notes</h3><p>Clear handwritten or typed notes from your classes help everyone revise.</p><p style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="${esc(C.forms.notes)}" target="_blank" rel="noopener">Upload notes ↗</a></p></div>
        <div class="card"><h3>Report a mistake</h3><p>Found a typo, a wrong mark, or a mis-tagged topic? Write to <span class="mono" style="user-select:all">${esc(C.email)}</span> with the question's paper, year and number.</p></div>
      </div>
      <section class="section"><div class="section-head"><h2>Solutions — coming next</h2></div><p class="prose">A place for students to submit worked solutions to individual questions is planned. Until then, solutions can be sent by email with the question reference.</p></section>`);
  }
  function viewAbout() {
    const C = D.C;
    return page("About", "About VBMath", "",
      `<div class="prose"><p>VBMath is an unofficial, student-run archive for the Department of Mathematics, Visva-Bharati, Santiniketan. It is not affiliated with Visva-Bharati or its Department of Mathematics. It began as a Google Site sharing scanned question papers through Drive folders. This version types every paper in LaTeX, so questions can be searched, filtered by topic and length, copied by teachers setting new papers, and compared across years.</p>
      <p>All maintenance is voluntary and free of cost: the site is a static page hosted on Cloudflare Pages from a public GitHub repository, and the scans stay in Google Drive. The earlier site remains at ${ext(C.oldsite, "sites.google.com/view/vbmath")}.</p>
      <p>For copyright concerns or corrections, write to <span class="mono" style="user-select:all">${esc(C.email)}</span>.</p></div>
      <section class="section"><div class="section-head"><h2>People behind it</h2></div><div class="grid g2">${Object.entries(C.credits).map(([k, v]) => `<div class="card"><h3>${esc(k)}</h3><p>${v.map(esc).join(", ")}</p></div>`).join("")}</div></section>`);
  }

  /* ---------- router ---------- */
  const ROUTES = {
    home: [viewHome, bindHome], search: [viewSearch, bindSearch], papers: [viewPapers, bindPapers], scans: [viewScans, bindScans], topics: [viewTopics, bindTopics],
    basket: [viewBasket, bindBasket], exams: [viewExams], notes: [viewNotes], syllabus: [viewSyllabus], books: [viewBooks], learn: [viewLearn], people: [viewPeople],
    guides: [viewGuides, bindGuides], contribute: [viewContribute], about: [viewAbout],
  };
  const TITLES = { home: "VBMath", search: "Search", papers: "Papers", scans: "Scans", topics: "Topics", basket: "My paper", exams: "Competitive exams", notes: "Notes", syllabus: "Syllabus", books: "Books", learn: "Videos & websites", people: "People", guides: "Guides", contribute: "Contribute", about: "About" };
  let lastRoute = null;
  function route() {
    const h = (location.hash || "#home").slice(1);
    const app = $("#app");
    let name = h, arg = null;
    if (h.startsWith("paper-")) { name = "paper"; arg = h.slice(6); }
    if (name !== "paper" && !ROUTES[name]) name = "home";
    if (name === "paper") { app.innerHTML = viewPaper(arg); bindPaper(arg); const p = D.papers.find((x) => x.key === arg); document.title = p ? `${p.code || "Paper"} ${p.year} · VBMath` : "VBMath"; }
    else { const [v, b] = ROUTES[name]; app.innerHTML = v(); b && b(); document.title = name === "home" ? "VBMath — Visva-Bharati Mathematics question bank" : TITLES[name] + " · VBMath"; }
    const navName = name === "paper" ? "papers" : name;
    $$(".nav a[data-r]").forEach((a) => { if (a.dataset.r === navName) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    if (lastRoute !== h) window.scrollTo(0, 0);
    lastRoute = h;
    $("#nav").hidden = window.matchMedia("(max-width:980px)").matches;
    updateBasketCount();
  }

  /* ---------- chrome ---------- */
  function initChrome() {
    const nav = $("#nav");
    $("#menu").addEventListener("click", () => { nav.hidden = !nav.hidden; $("#menu").setAttribute("aria-expanded", String(!nav.hidden)); });
    const dd = $("#more-dd"), btn = $("#more-btn");
    btn.addEventListener("click", (e) => { e.stopPropagation(); dd.hidden = !dd.hidden; btn.setAttribute("aria-expanded", String(!dd.hidden)); });
    document.addEventListener("click", (e) => { if (!e.target.closest(".dd")) { dd.hidden = true; btn.setAttribute("aria-expanded", "false"); } });
    $$("#more-dd a").forEach((a) => a.addEventListener("click", () => { dd.hidden = true; }));
    const themeBtn = $("#theme");
    const applyTheme = (t) => { if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme"); };
    applyTheme(store.get("theme", ""));
    themeBtn.addEventListener("click", () => {
      const dark = document.documentElement.getAttribute("data-theme") ? document.documentElement.getAttribute("data-theme") === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      const t = dark ? "light" : "dark"; applyTheme(t); store.set("theme", t);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); if ((location.hash || "") !== "#search") location.hash = "search"; setTimeout(() => $("#sq") && $("#sq").focus(), 30); }
    });
    window.addEventListener("hashchange", route);
  }

  async function start() {
    initChrome();
    F = Object.assign(defaultFilters(), store.get("filters", {}));
    try { await load(); }
    catch (e) { $("#app").innerHTML = `<div class="wrap"><div class="empty">The question data could not be loaded (${esc(e.message)}). Please reload the page.</div></div>`; return; }
    route();
  }
  start();
})();
