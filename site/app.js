/* VBMath — static question bank. Data: data/*.json, produced by tools/build_site.py. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const PROG = { BSc: "B.Sc. Mathematics", MSc: "M.Sc. Mathematics" };
  const PSHORT = { BSc: "B.Sc.", MSc: "M.Sc." };
  const EXAM = { JAM: "IIT JAM", NET: "CSIR-UGC NET", GATE: "GATE", TIFR: "TIFR Graduate School", NBHM: "NBHM" };
  const EXAM_CODE = {"IIT JAM":"JAM", "CSIR-UGC NET":"NET", "GATE Mathematics":"GATE", NBHM:"NBHM", TIFR:"TIFR"};
  const EXAM_GUIDANCE = {
    JAM: ["IIT JAM Mathematics (2026)", "Official Mathematics (MA) syllabus.", "https://jam2026.iitb.ac.in/files/syllabus_MA.pdf"],
    GATE: ["GATE Mathematics", "Select Mathematics (MA) on the official syllabus page.", "https://gate2027.iitm.ac.in/exam_papers_and_syllabus"],
    NBHM: ["NBHM written test", "NBHM has no prescribed syllabus. See the official written-test guidance.", "https://www.imsc.res.in/~nbhm/ST_current/faq.html"],
    TIFR: ["TIFR Mathematics", "Stage I and Stage II syllabi and admission information.", "https://mathweb.tifr.res.in/admissions.html"],
  };
  const PROGRAMME_ROUTES = {BSc:"papers-bsc", MSc:"papers-msc"};
  const PEOPLE_LABELS = {teachers:"Teachers", alumni:"Alumni", scholars:"Scholars", "student-achievements":"Student achievements"};
  const FACULTY_DIRECTORY = "https://www.visvabharati.ac.in/home/facul_mathematics/";
  const FACULTY_PROFILES = {
    "Tapas Ray Mahapatra": {profile:"https://visvabharati.irins.org/profile/157925", scholar:"UEjM2XYAAAAJ"},
    "Prasanta Chatterjee": {website:"https://sites.google.com/site/prasantavbmath/home", scholar:"mKlOQgoAAAAJ", researchgate:"Prasanta-Chatterjee"},
    "Prashanta Kumar Mandal": {website:"https://sites.google.com/a/visva-bharati.ac.in/dr-pk-mandal/work-experience", cv:"https://www.visvabharati.ac.in/file/prashantakumarmandal.pdf", scholar:"Tir_SYsAAAAJ"},
    "Amar Prasad Misra": {profile:"https://visvabharati.irins.org/profile/155499", website:"https://sites.google.com/a/visva-bharati.ac.in/apmisra/home", scholar:"OLb4zgYAAAAJ"},
    "Tarapada Bag": {profile:"https://visvabharati.irins.org/profile/322520", scholar:"hHdQ7_sAAAAJ", researchgate:"Tarapada-Bag"},
    "Dibyendu Banerjee": {profile:"https://www.visvabharati.ac.in/DibyenduBanerjee.html", scholar:"XDgfvoIAAAAJ", researchgate:"Dibyendu-Banerjee-8"},
    "Subhasis Ray": {profile:"https://www.visvabharati.ac.in/subhasisRoy.html", scholar:"V7pOJVgAAAAJ", researchgate:"Ray-S"},
    "Anjan Kumar Bhuniya": {profile:"https://www.visvabharati.ac.in/AnjanKumarBhuniya.html", scholar:"wSBoVaMAAAAJ"},
    "Lakshmi Narayan Guin": {profile:"https://www.visvabharati.ac.in/lakshminarayanguin.html", website:"https://sites.google.com/site/lakshmiguin/", scholar:"HJyEsPMAAAAJ", researchgate:"Lakshmi-Guin-2"},
    "Kalyan Hansda": {scholar:"kEkNaVEAAAAJ", researchgate:"Kalyan-Hansda-2"},
    "Nikhil Pal": {profile:"https://www.visvabharati.ac.in/nikhilpal.html", website:"https://sites.google.com/site/nikhilpalmath/", scholar:"9RsWjvMAAAAJ", researchgate:"Nikhil-Pal"},
    "Sougata Biswas": {website:"https://sites.google.com/site/sougatasrf/", cv:"https://www.visvabharati.ac.in/file/sougatabiswas.pdf", scholar:"4PkvH4sAAAAJ", researchgate:"Sougata-Biswas"},
    "Bipul Pal": {profile:"https://www.visvabharati.ac.in/bipulpal.html", researchgate:"Bipul-Pal"},
    "Jaitra Chattopadhyay": {website:"https://sites.google.com/view/jaitrac/home", cv:"https://www.visvabharati.ac.in/file/CV%20Jaitra.pdf", scholar:"KPs7vcgAAAAJ"},
    "Swapan Raha": {profile:"https://visvabharati.irins.org/profile/155506", scholar:"SJiJMjcAAAAJ"},
    "Puspajit Mandal": {profile:"https://www.visvabharati.ac.in/PuspajitMandal.html", researchgate:"Puspajit-Mandal"},
    "Syamal Kumar Samanta": {profile:"https://www.visvabharati.ac.in/SyamalKumarSamanta.html"},
    "Santabrata Chakravarty": {researchgate:"Santabrata-Chakravarty"},
    "Dulal Pal": {profile:"https://visvabharati.irins.org/profile/158866", scholar:"Rq_JS0oAAAAJ", researchgate:"Dulal-Pal"},
    "Madan Mohan Panja": {profile:"https://www.visvabharati.ac.in/DrMadanMohanPanja.html", cv:"https://www.visvabharati.ac.in/file/madanmohanpanja.pdf"},
  };
  const PEOPLE_DATA = {"people-alumni":"alumni", "people-student-achievements":"student-achievements"};
  const NSEM = { BSc: 8, MSc: 4 };
  const SHORT_MAX = 4;
  const PAGE = 20;
  const GH = "https://github.com/mcodexvb/vbmath/issues/new?template=";
  const SITE = "https://vbmath.pages.dev";
  const HASH = document.documentElement.dataset.router === "hash";
  const BASE = HASH ? "" : "/";
  const store = {
    get(k, d) { try { const v = localStorage.getItem("vbm:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("vbm:" + k, JSON.stringify(v)); } catch (e) {} },
  };
  const D = { papers: [], topics: [], broad: [], Q: [], scans: [], C: {}, byId: new Map(), byPaper: [], scanIdx: new Map(), byKey: new Map() };
  let coll = store.get("basket", []);
  let F = defaultFilters();
  let shown = PAGE;
  function defaultFilters() { return { q: "", prog: "", sem: "", from: "", to: "", code: "", broad: "", topic: "", len: "", kind: "", rep: false, sort: "rel" }; }

  /* ---------- links: clean paths on the real site, #names in previews ---------- */
  function L(r) {
    if (HASH) return "#" + r;
    if (r === "home") return "/";
    const m = r.match(/^(paper|semester|preview|maker|papers|exams|people)-(.+)$/);
    return m ? `/${m[1]}/${m[2]}/` : `/${r}/`;
  }
  const routeParams = () => new URLSearchParams(HASH ? (location.hash.split("?")[1] || "") : location.search);
  function current() {
    let s;
    if (HASH) s = (location.hash || "#home").slice(1).split("?")[0];
    else {
      const p = location.pathname.replace(/\/+$/, "").replace(/^\/+/, "");
      if (!p) s = "home";
      else { const parts = p.split("/"); s = parts.length > 1 ? parts[0] + "-" + parts.slice(1).join("-") : parts[0]; }
    }
    return s || "home";
  }
  function go(r) {
    if (HASH) { if (location.hash === "#" + r) return route(); location.hash = r; }
    else { history.pushState({}, "", L(r)); return route(); }
  }

  /* ---------- icons ---------- */
  const I = (d, extra = "") => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const IC = {
    grid: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>`,
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    copy: I('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    check: I('<path d="m5 12.5 4.5 4.5L19 7"/>'),
    dots: I('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
    stack: I('<path d="M4 7.5 12 4l8 3.5-8 3.5z"/><path d="m4 12 8 3.5 8-3.5"/><path d="m4 16.5 8 3.5 8-3.5"/>'),
    file: I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
    ext: I('<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
    trash: I('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    up: I('<path d="m6 15 6-6 6 6"/>'),
    down: I('<path d="m6 9 6 6 6-6"/>'),
    x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    print: I('<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'),
    dl: I('<path d="M12 4v11m0 0-4-4m4 4 4-4"/><path d="M5 20h14"/>'),
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: I('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
    menu: I('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    pen: I('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
    tag: I('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>'),
    flag: I('<path d="M5 21V4h11l-2 4 2 4H5"/>'),
    link: I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    arrow: I('<path d="M5 12h14m-5-5 5 5-5 5"/>'),
    folder: I('<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    scan: I('<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 9h8M8 13h8M8 17h5"/>'),
    grip: I('<circle cx="9" cy="6" r="1.3" fill="currentColor"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="9" cy="18" r="1.3" fill="currentColor"/><circle cx="15" cy="6" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="18" r="1.3" fill="currentColor"/>'),
    scissors: I('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>'),
    mergeUp: I('<path d="m9 8 3-3 3 3"/><path d="M12 5v9a4 4 0 0 1-4 4H5"/>'),
    mergeDown: I('<path d="m9 16 3 3 3-3"/><path d="M12 19V10a4 4 0 0 1 4-4h3"/>'),
    branch: I('<path d="M16 3h5v5M4 20l17-17M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
    chevronUp: I('<path d="m18 15-6-6-6 6"/>'),
    chevronDown: I('<path d="m6 9 6 6 6-6"/>'),
    undo: I('<path d="M3 7v6h6M3 13a9 9 0 0 1 15.4-4.6L21 11"/>'),
    redo: I('<path d="M21 7v6h-6M21 13a9 9 0 0 0-15.4-4.6L3 11"/>'),
  };

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
    s = s.replace(/\\includegraphics(?:\[[^\]]*\])?\{(assets\/competitive\/[a-f0-9]{16}\.png)\}/g,
      (m, path) => hold(`<img class="question-figure" src="${BASE + path}" alt="Figure supplied with the question" loading="lazy">`));
    let out = "", last = 0, m;
    SEG.lastIndex = 0;
    while ((m = SEG.exec(s))) {
      out += textPart(s.slice(last, m.index));
      let seg = m[0].replace(/\\rule\{[^{}]+\}\{[^{}]+\}/g, "\\underline{\\qquad}");
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
      [/\\rule\{[^{}]+\}\{[^{}]+\}/g, "______"],
      [/\\printedmarks\{([^{}]*)\}/g, '<span class="pm">[$1]</span>'],
      [/\\unreadable\{([^{}]*)\}/g, '<span class="unr" title="Not legible in the scan">$1</span>'],
      [/\\gapmark\{[^{}]*\}/g, '<span class="unr" title="Gap in the source">…</span>'],
      [/\\missingglyph\b/g, '<span class="unr" title="Symbol missing in the source">□</span>'],
      [/\\begin\{(?:enumerate|romanparts)\}(?:\[([^\]]*)\])?/g, (m, label = "") => {
        const type = label.includes("\\alph") ? "a" : label.includes("\\Alph") ? "A" :
          label.includes("\\Roman") ? "I" : label.includes("\\arabic") ? "1" : "i";
        return `<ol class="sub" style="list-style-type:${({ a: "lower-alpha", A: "upper-alpha", I: "upper-roman", 1: "decimal", i: "lower-roman" })[type]}">`;
      }],
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
  const MATH_SCRIPT = "https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js";
  let mjQueue = Promise.resolve();
  function typeset(el) {
    if (!el) return;
    if (!window.MathJax?.typesetPromise) {
      el.dataset.pendingMath = "1";
      if (!$(`script[src="${MATH_SCRIPT}"]`)) {
        const script = document.createElement("script");
        script.src = MATH_SCRIPT;
        script.addEventListener("error", () => script.remove(), {once:true});
        document.head.appendChild(script);
      }
      return;
    }
    mjQueue = mjQueue.then(() => MathJax.typesetPromise([el])).catch(() => {});
  }
  window.__vbmMathReady = () => { $$('[data-pending-math="1"]').forEach((el) => { el.removeAttribute("data-pending-math"); typeset(el); }); };

  /* ---------- data ---------- */
  function loadJSON(name) {
    return fetch(BASE + "data/" + name + ".json").then((response) => {
      if (!response.ok) throw Error(name + " " + response.status);
      return response.json();
    });
  }
  let catalogueReady = false, questionsReady = false;
  let catalogueRequest, questionRequest;
  function loadCatalogue() {
    catalogueRequest ??= Promise.all(["papers", "scans", "content", "competitive-catalog"].map(loadJSON))
      .then(([papers, scans, content, competitive]) => {
        D.papers = papers.papers.concat(competitive);
        D.topics = papers.topics; D.broad = papers.broad; D.scans = scans; D.C = content;
        D.papers.forEach((paper, i) => D.byKey.set(paper.key, i));
        D.years = Array.from(new Set(D.papers.map((p) => p.year))).sort();
        D.codes = Array.from(new Set(D.papers.map((p) => p.code).filter(Boolean))).sort();
        D.scans.forEach((scan) => {
          const key = [scan.prog, scan.sem, scan.year, scan.kind].join("|");
          if (!D.scanIdx.has(key)) D.scanIdx.set(key, []);
          D.scanIdx.get(key).push(scan);
        });
        catalogueReady = true;
      }).catch((error) => { catalogueRequest = null; throw error; });
    return catalogueRequest;
  }
  function load() {
    questionRequest ??= Promise.all([loadCatalogue(), ...["questions", "competitive", "scholarship"].map(loadJSON)])
      .then(([, rows, ...datasets]) => {
        for (const dataset of datasets) {
          rows.push(...dataset.questions.map(([index, ...q]) => [D.byKey.get(dataset.papers[index].key), ...q]));
        }
        indexQuestions(rows);
        questionsReady = true;
      }).catch((error) => { questionRequest = null; throw error; });
    return questionRequest;
  }
  function indexQuestions(Q) {
    D.byPaper = D.papers.map(() => []);
    D.Q = Q.map((a, i) => {
      const p = D.papers[a[0]];
      const q = { i, p: a[0], sec: a[1], qno: a[2], part: a[3], marks: a[4], mraw: a[5], tex: a[6], t: a[7], tb: a[8], weak: a[9], id: a[10], rep: a[11] || [], stem: !!a[12], notes: a[13] || [], answer: a[14], answerOrigin: a[15] };
      q.broads = new Set(q.t.map((k) => D.broad.indexOf(D.topics[k][0])).concat(q.tb));
      const topics = q.t.map((k) => D.topics[k].join(" ")).concat([...q.broads].map((k) => D.broad[k]));
      q.search = [searchWords(plainOf(q.tex)), searchWords(topics.join(" ")),
        searchWords([p.code?.replace(/\(.*/, ""), p.title, p.prog, EXAM[p.prog], p.year].join(" "))];
      D.byPaper[a[0]].push(q);
      D.byId.set(q.id, q);
      return q;
    });
    searchVocabulary = null;
    coll = coll.filter((id) => D.byId.has(id));
  }

  /* ---------- helpers ---------- */
  const hue = (b) => `hsl(${Math.round((b * 360) / 16 + 140) % 360} 42% 45%)`;
  const pname = (p) => p.code || (p.kind[0] === "i" ? "Internal test" : "Paper " + p.key.split("-").pop());
  const paperLabel = (p) => pname(p) + (p.title ? " · " + p.title : "");
  const semLabel = (p) => EXAM[p.prog] || PSHORT[p.prog] + " Sem " + ROMAN[p.sem];
  const scanUrl = (id) => "https://drive.google.com/file/d/" + id + "/view";
  const scansFor = (p) => {
    const list = (D.scanIdx.get(p.prog + "|" + p.sem + "|" + p.year + "|" + (p.kind[0] === "i" ? "i" : "s")) || []).filter((s) => !s.other);
    const code = (p.code || "").replace(/\(.*/, "").toUpperCase();
    return list.slice().sort((a, b) => (b.code === code) - (a.code === code));
  };
  const qLabel = (q) => q.qno + (q.part ? "(" + q.part + ")" : "");
  const lenOf = (q) => (q.marks == null ? "" : q.marks <= SHORT_MAX ? "short" : "long");
  const fmtMarks = (q) => (q.mraw && /[+×x]/.test(q.mraw) ? q.mraw.replace(/x/g, "×") : q.marks != null ? (Number.isInteger(q.marks) ? q.marks : String(q.marks)) : "");
  const era = (code) => !code ? "" : /^BM|^BME|^BMO/.test(code) ? "BMC syllabus" : /^(MJ|MN|MD|SEC-)/.test(code) ? "NEP syllabus" : /^(CC|DSE|GE|SEC|AECC)/.test(code) ? "CBCS syllabus" : "";
  function toast(msg) { $$(".toast").forEach((t) => t.remove()); const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 1900); }
  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); toast((label || "Copied") + " ✓"); }
    catch (e) { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast((label || "Copied") + " ✓"); } catch (e2) { toast("Select the text and copy it manually"); } ta.remove(); }
  }
  function setMeta(title, desc, path) {
    document.title = title;
    const m = $('meta[name="description"]'); if (m && desc) m.setAttribute("content", desc);
    const c = $('link[rel="canonical"]'); if (c && !HASH) c.setAttribute("href", SITE + (path || location.pathname));
  }

  /* ---------- collection ---------- */
  function saveColl() { store.set("basket", coll); updateCount(true); }
  function updateCount(bump) {
    $$(".coll-n").forEach((n) => { n.textContent = coll.length; n.hidden = !coll.length; if (bump) { n.classList.remove("bump"); void n.offsetWidth; n.classList.add("bump"); } });
    const fab = $("#fab"); if (fab) fab.hidden = !coll.length || $("#drawer").classList.contains("show") || /^(?:preview|maker)(?:-|$)/.test(current());
    if ($("#drawer").classList.contains("show")) renderDrawer();
  }
  function toggleColl(id) {
    const k = coll.indexOf(id);
    if (k >= 0) coll.splice(k, 1); else coll.push(id);
    saveColl();
    const on = coll.includes(id);
    $$(`:is(.q,.qod)[data-id="${CSS.escape(id)}"]`).forEach((card) => {
      card.classList.toggle("in", on);
      const button = $(".collect", card);
      if (button) { button.classList.toggle("on", on); button.setAttribute("aria-pressed", String(on)); }
    });
    toast(on ? `Added · ${coll.length} in your collection` : "Removed from your collection");
  }
  async function openDrawer() {
    if (coll.length && !questionsReady) {
      try { await load(); }
      catch { toast("Could not load collected questions. Try again."); return; }
    }
    renderDrawer(); $("#scrim").hidden = false; requestAnimationFrame(() => { $("#scrim").classList.add("show"); $("#drawer").classList.add("show"); }); $("#fab").hidden = true; setTimeout(() => $("#dclose") && $("#dclose").focus(), 50); }
  function closeDrawer() { $("#scrim").classList.remove("show"); $("#drawer").classList.remove("show"); setTimeout(() => { $("#scrim").hidden = true; }, 220); updateCount(); }
  function renderDrawer() {
    const qs = coll.map((id) => D.byId.get(id)).filter(Boolean);
    const total = qs.reduce((s, q) => s + (q.marks || 0), 0);
    const papers = new Set(qs.map((q) => q.p)).size;
    $("#drawer").innerHTML = `
      <div class="dhead"><div><div class="eyebrow">Your collection</div><h2>${qs.length ? qs.length + " question" + (qs.length > 1 ? "s" : "") : "Empty for now"}</h2></div>
        <button class="iconbtn" id="dclose" type="button" aria-label="Close">${IC.x}</button></div>
      ${qs.length ? `<div class="dsum"><span><b>${total}</b> marks</span><span>from <b>${papers}</b> paper${papers > 1 ? "s" : ""}</span><span><b>${qs.filter((q) => lenOf(q) === "short").length}</b> short · <b>${qs.filter((q) => lenOf(q) === "long").length}</b> long</span></div>
      <div class="dlist">${qs.map((q, k) => { const p = D.papers[q.p]; return `<div class="ditem" data-id="${esc(q.id)}"><span class="n">${k + 1}.</span><div style="min-width:0"><div class="tx">${esc(plainOf(q.tex))}</div><div class="src">${esc(semLabel(p))} · ${p.year} · ${esc(pname(p))} · Q${esc(qLabel(q))}${q.marks != null ? " · " + esc(fmtMarks(q)) + " marks" : ""}</div></div>
        <div class="ctl"><button type="button" data-mv="${k}" data-d="-1" aria-label="Move up">${IC.up}</button><button type="button" data-mv="${k}" data-d="1" aria-label="Move down">${IC.down}</button><button type="button" data-rm="${esc(q.id)}" aria-label="Remove">${IC.x}</button></div></div>`; }).join("")}</div>
      <div class="dfoot">
        <a class="btn btn-primary btn-block" href="${L("preview")}" data-close>${IC.file} Open Question Paper Studio</a>
        <div class="r3"><button class="btn btn-ghost btn-sm" type="button" id="dcopy">${IC.copy} LaTeX</button><button class="btn btn-ghost btn-sm" type="button" id="dtxt">${IC.copy} Text</button><button class="btn btn-ghost btn-sm" type="button" id="dclear">${IC.trash} Clear</button></div>
      </div>` : `<div class="dempty"><p style="font:17px/1.6 var(--f-text);color:var(--ink-2)">Tap <b>Collect</b> on any question to add it here, like a cart.</p><p>Build an exam paper or practice sheet with composite questions (3+2 marks), choice rules (5 of 8), and custom marks.</p><p style="margin-top:12px;display:flex;gap:8px;justify-content:center"><a class="btn btn-primary btn-sm" href="${L("preview")}" data-close>Open Question Maker</a><a class="btn btn-ghost btn-sm" href="${L("search")}" data-close>Find questions</a></p></div>`}`;
    $("#dclose").onclick = closeDrawer;
    $$("[data-close]", $("#drawer")).forEach((a) => a.addEventListener("click", closeDrawer));
    $$("[data-mv]", $("#drawer")).forEach((b) => b.onclick = () => { const k = +b.dataset.mv, j = k + +b.dataset.d; if (j < 0 || j >= coll.length) return; [coll[k], coll[j]] = [coll[j], coll[k]]; store.set("basket", coll); renderDrawer(); });
    $$("[data-rm]", $("#drawer")).forEach((b) => b.onclick = () => { toggleColl(b.dataset.rm); renderDrawer(); });
    if ($("#dcopy")) {
      $("#dcopy").onclick = () => copy(toLatex(qs, null), "LaTeX copied");
      $("#dtxt").onclick = () => copy(qs.map((q, k) => `${k + 1}. ${plainOf(q.tex)}${q.marks != null ? "  [" + fmtMarks(q) + "]" : ""}`).join("\n\n"), "Text copied");
      $("#dclear").onclick = (e) => { const b = e.currentTarget; if (b.dataset.sure) { coll = []; saveColl(); renderDrawer(); route(true); } else { b.dataset.sure = "1"; b.innerHTML = IC.trash + " Sure?"; } };
    }
  }

  /* ---------- question card ---------- */
  function qCard(q, opts = {}) {
    const p = D.papers[q.p];
    const on = coll.includes(q.id);
    const tags = [];
    q.t.slice(0, 2).forEach((k) => tags.push(`<a class="tag" style="--h:${hue(D.broad.indexOf(D.topics[k][0]))}" href="${L("search")}" data-ft="${k}" title="${esc(D.topics[k][0])} › ${esc(D.topics[k][1])}"><span>${esc(D.topics[k][1])}</span></a>`));
    if (!q.t.length) q.tb.slice(0, 1).forEach((b) => tags.push(`<a class="tag" style="--h:${hue(b)}" href="${L("search")}" data-fb="${b}"><span>${esc(D.broad[b])}</span></a>`));
    if (q.rep.length > 1) tags.push(`<span class="tag rep" title="Same wording in ${q.rep.join(", ")}">↻ Asked ${q.rep.length}× · ${q.rep.slice(-3).join(", ")}${q.rep.length > 3 ? "…" : ""}</span>`);
    const src = opts.noSource ? `<span class="qsrc"></span>` : `<a class="qsrc" href="${L("paper-" + p.key)}">${esc(semLabel(p))} · ${p.year}${p.kind[0] === "i" ? " · Internal" : ""} · <span class="code">${esc(pname(p))}</span></a>`;
    return `<article class="q${on ? " in" : ""}" data-id="${esc(q.id)}">
      <header class="qh"><span class="qn">${esc(opts.num ?? (q.qno ? "Q" + qLabel(q) : "Practice question"))}</span>${src}${q.marks != null ? `<span class="qmk">${esc(fmtMarks(q))} mark${q.marks === 1 ? "" : "s"}</span>` : ""}</header>
      <div class="qbody">${texToHtml(q.tex)}</div>
      ${q.answer ? `<details class="q-answer"><summary>${q.answerOrigin ? "Answer from compilation" : "Official answer"}</summary>
        <p>${q.answerOrigin ? texToHtml(q.answer) : esc(q.answer === "MTA" ? "Marks to all (MTA)" : q.answer.replaceAll(";", ", "))}</p>
        ${q.notes.map((note) => `<p class="muted">${esc(note)}</p>`).join("")}</details>` : ""}
      <footer class="qf"><div class="qtags">${tags.join("")}</div>
        <div class="qbtns">
          <button type="button" class="qbtn" data-act="copy" title="Copy LaTeX" aria-label="Copy LaTeX">${IC.copy}<span class="sr">Copy LaTeX</span></button>
          <details class="qmore"><summary class="qbtn" aria-label="More actions" title="More">${IC.dots}</summary><div class="qmenu" popover="manual" role="group" aria-label="Question actions">
            <div class="qmh"><b>${esc(opts.num ?? (q.qno ? "Q" + qLabel(q) : "Practice question"))}</b><button type="button" class="qmclose" data-close-menu aria-label="Close">${IC.x}</button></div>
            <button type="button" data-act="copytext">${IC.copy} Copy as plain text</button>
            <a href="${L("paper-" + p.key)}">${IC.file} Open the full paper</a>
            <a href="${GH}4-submit-solution.yml&qid=${encodeURIComponent(q.id)}" target="_blank" rel="noopener">${IC.pen} Submit a solution</a>
            <a href="${GH}2-fix-tags.yml&qid=${encodeURIComponent(q.id)}" target="_blank" rel="noopener">${IC.tag} Fix topic tags</a>
            <a href="${GH}3-report-mistake.yml&qid=${encodeURIComponent(q.id)}" target="_blank" rel="noopener">${IC.flag} Report a mistake</a>
            <button type="button" data-act="copyid">${IC.link} Copy question id</button>
          </div></details>
          <button type="button" class="qbtn collect${on ? " on" : ""}" data-act="collect" aria-pressed="${on}"><span class="lbl-off">${IC.plus}</span><span class="lbl-on">${IC.check}</span><span class="lbl-off">Collect</span><span class="lbl-on">Collected</span></button>
        </div></footer></article>`;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (b) {
      const card = b.closest("[data-id]"), q = card && D.byId.get(card.dataset.id);
      const act = b.dataset.act;
      if (act === "collect" && card?.id === "qod") { toggleColl(card.dataset.id); return; }
      if (!q) return;
      if (act === "copy") copy(q.tex, "LaTeX copied");
      if (act === "copytext") copy(plainOf(q.tex), "Text copied");
      if (act === "copyid") copy(q.id, "Question id copied");
      if (act === "collect") toggleColl(q.id);
      const d = b.closest("details"); if (d) d.open = false;
      return;
    }
    if (e.target.closest("[data-close-menu]") || e.target.matches(".menuscrim")) { closeMenus(); return; }
    $$("details.qmore[open]").forEach((d) => { if (!d.contains(e.target)) d.open = false; });
    const t = e.target.closest("[data-ft],[data-fb]");
    if (t) { F = defaultFilters(); if (t.dataset.ft) { F.topic = t.dataset.ft; F.broad = String(D.broad.indexOf(D.topics[+t.dataset.ft][0])); } else F.broad = t.dataset.fb; }
    const exam = e.target.closest("[data-exam-search]");
    if (exam && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      F = { ...defaultFilters(), kind: exam.dataset.examSearch };
      if (HASH) go("search");
      else { history.pushState({}, "", L("search") + searchQuery()); route(); }
      return;
    }
    const a = e.target.closest("a[href]");
    if (a && !HASH && !a.target && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      const href = a.getAttribute("href");
      if (href.startsWith("/") && !href.startsWith("//") && !/\.(json|svg|xml|txt|png)$/.test(href)) { e.preventDefault(); if (href !== location.pathname + location.search) { history.pushState({}, "", href); route(); } else route(true); }
    }
  });

  /* ---------- the ⋯ menu: kept inside the window; a bottom sheet on phones ---------- */
  function closeMenus() {
    $$("details.qmore[open]").forEach((d) => {
      const m = d.querySelector(".qmenu");
      if (m.hidePopover) m.hidePopover();
      d.open = false;
    });
    const scrim = $(".menuscrim");
    if (scrim) scrim.hidden = true;
  }
  function placeMenu(d) {
    const m = d.querySelector(".qmenu"), s = d.querySelector("summary");
    const phone = window.matchMedia("(max-width:767px)").matches;
    let scrim = $(".menuscrim");
    if (m.showPopover && !m.matches(":popover-open")) m.showPopover();
    if (phone) {
      m.classList.add("sheet"); m.style.cssText = "";
      if (!scrim) { scrim = document.createElement("div"); scrim.className = "menuscrim"; document.body.appendChild(scrim); }
      scrim.hidden = false;
      return;
    }
    m.classList.remove("sheet"); if (scrim) scrim.hidden = true;
    m.style.cssText = "position:fixed;visibility:hidden;left:0;top:0";
    const r = s.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight, W = document.documentElement.clientWidth, H = window.innerHeight;
    const left = Math.max(8, Math.min(r.right - mw, W - mw - 8));
    let top = r.bottom + 6;
    if (top + mh > H - 8) top = Math.max(8, r.top - 6 - mh);
    m.style.cssText = `position:fixed;left:${left}px;top:${top}px`;
  }
  document.addEventListener("toggle", (e) => {
    const d = e.target;
    if (!(d instanceof HTMLDetailsElement) || !d.classList.contains("qmore")) return;
    if (d.open) { $$("details.qmore[open]").forEach((o) => { if (o !== d) o.open = false; }); placeMenu(d); const f = d.querySelector(".qmenu a, .qmenu button:not(.qmclose)"); f && f.focus({ preventScroll: true }); }
    else {
      const m = d.querySelector(".qmenu");
      if (m.hidePopover) m.hidePopover();
      const sc = $(".menuscrim");
      if (sc && !$("details.qmore[open]")) sc.hidden = true;
    }
  }, true);
  window.addEventListener("scroll", () => { if (!window.matchMedia("(max-width:767px)").matches) closeMenus(); }, { passive: true });
  window.addEventListener("resize", () => { const open = $("details.qmore[open]"); if (open) placeMenu(open); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("details.qmore[open]")) { const d = $("details.qmore[open]"); closeMenus(); d.querySelector("summary").focus(); } });

  /* ---------- Question Paper Maker & LaTeX Generator ---------- */
  function defaultMakerHead() {
    return {
      inst: "VISVA-BHARATI",
      dept: "Department of Mathematics",
      exam: "B.Sc. (Honours) Examination, 2026",
      paper: "Mathematics · Paper CC-1",
      time: "Time: 2 Hours",
      full: "50",
      autoFull: true,
      ruleType: "choice", // "choice", "compulsory_plus", "all", "custom"
      choiceX: 5,
      choiceY: 8,
      instr: "Candidates are required to give their answers in their own words as far as practicable. Answer any 5 out of 8 questions. Figures in the right margin indicate full marks.",
      partStyle: "paren_alpha", // "paren_alpha" (1. (a), (b)), "num_alpha" (1 a), 1 b)), "alpha_paren" (1. a), b)), "roman_paren" (1. (i), (ii))
      marksStyle: "parts_only" // "parts_only" ([5], [5]), "both" ([5], [5] & [10]), "breakdown" ([5+5]), "total_only" ([10])
    };
  }

  function sampleMakerPaper() {
    return {
      header: {
        inst: "VISVA-BHARATI",
        dept: "Department of Mathematics",
        exam: "B.Sc. (Honours) Examination, 2026",
        paper: "Mathematics · Paper CC-1: Real Analysis & Calculus",
        time: "Time: 2 Hours",
        full: "50",
        autoFull: true,
        ruleType: "choice",
        choiceX: 5,
        choiceY: 8,
        instr: "Candidates are required to give their answers in their own words as far as practicable. Answer any 5 out of 8 questions. Figures in the right margin indicate full marks.",
        partStyle: "paren_alpha",
        marksStyle: "parts_only"
      },
      sections: [
        {
          id: "sec_1",
          title: "",
          rule: "",
          questions: [
            {
              id: "sq_1",
              qno: "1",
              orAlternative: false,
              parts: [
                { id: "sp_1_a", label: "a", marks: 5, tex: "If $\\lim_{x\\to a}f(x)=\\ell \\ne 0$, prove that in a deleted neighbourhood of $a$, $f(x)$ keeps the same sign as that of $\\ell$." },
                { id: "sp_1_b", label: "b", marks: 5, tex: "Using $(\\varepsilon-\\delta)$ definition, evaluate $\\lim_{x\\to 0} \\frac{\\sin x}{x}$." }
              ]
            },
            {
              id: "sq_2",
              qno: "2",
              orAlternative: false,
              parts: [
                { id: "sp_2_a", label: "a", marks: 6, tex: "Prove that every monotone decreasing sequence which is bounded below is convergent and converges to its greatest lower bound." },
                { id: "sp_2_b", label: "b", marks: 4, tex: "Test the convergence of the sequence whose $n$-th term is $x_n = \\frac{1}{\\sqrt{n^2+1}} + \\frac{1}{\\sqrt{n^2+2}} + \\cdots + \\frac{1}{\\sqrt{n^2+n}}$." }
              ]
            },
            {
              id: "sq_3",
              qno: "3",
              orAlternative: false,
              parts: [
                { id: "sp_3_a", label: "a", marks: 6, tex: "Prove that a sequence in $\\mathbb{R}$ is convergent if and only if it is a Cauchy sequence." },
                { id: "sp_3_b", label: "b", marks: 4, tex: "Examine if the sequence $x_n = 1 - \\frac{1}{2} + \\frac{1}{3} - \\cdots + \\frac{(-1)^{n+1}}{n}$ is a Cauchy sequence." }
              ]
            },
            {
              id: "sq_4",
              qno: "4",
              orAlternative: false,
              parts: [
                { id: "sp_4_a", label: "a", marks: 5, tex: "State and prove Rolle's theorem on a closed interval $[a,b]$." },
                { id: "sp_4_b", label: "b", marks: 3, tex: "Using Mean Value Theorem, show that $\\frac{x}{1+x} < \\ln(1+x) < x$ for all $x > 0$." },
                { id: "sp_4_c", label: "c", marks: 2, tex: "Show that $2x^3 + 2x^2 - 10x + 6 > 0$ for all $x > 1$." }
              ]
            },
            {
              id: "sq_5",
              qno: "5",
              orAlternative: false,
              parts: [
                { id: "sp_5_a", label: "a", marks: 5, tex: "Define a derived set. Prove that the derived set of any bounded set in $\\mathbb{R}$ is bounded." },
                { id: "sp_5_b", label: "b", marks: 5, tex: "Let $S$ be a bounded non-empty subset of $\\mathbb{R}$ and $T = \\{x-y : x,y \\in S\\}$. Prove that $\\sup T = \\sup S - \\inf S$ and $\\inf T = \\inf S - \\sup S$." }
              ]
            },
            {
              id: "sq_6",
              qno: "6",
              orAlternative: false,
              parts: [
                { id: "sp_6_a", label: "a", marks: 5, tex: "If $n$ is an even positive integer, establish the reduction formula for $\\int_0^{\\pi/2}\\sin^n x\\,dx$ and deduce its value." },
                { id: "sp_6_b", label: "b", marks: 5, tex: "Evaluate $\\int_0^1 x^4(1-x)^3\\,dx$ using Beta and Gamma functions." }
              ]
            },
            {
              id: "sq_7",
              qno: "7",
              orAlternative: false,
              parts: [
                { id: "sp_7_a", label: "a", marks: 6, tex: "State necessary and sufficient condition for a bounded function $f:[a,b]\\to\\mathbb{R}$ to be Riemann integrable." },
                { id: "sp_7_b", label: "b", marks: 4, tex: "Show that $f(x) = [x]$ is Riemann integrable on $[0,3]$ and compute $\\int_0^3 [x]\\,dx$." }
              ]
            },
            {
              id: "sq_8",
              qno: "8",
              orAlternative: false,
              parts: [
                { id: "sp_8_a", label: "a", marks: 5, tex: "State and prove Weierstrass M-test for uniform convergence of a series of functions." },
                { id: "sp_8_b", label: "b", marks: 5, tex: "Test the uniform convergence of $\\sum_{n=1}^\\infty \\frac{x}{n(1+nx^2)}$ on $[0,1]$." }
              ]
            }
          ]
        }
      ]
    };
  }

  function formatPartLabel(style, qno, pIdx) {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const romans = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
    const l = letters[pIdx % letters.length];
    const rom = romans[pIdx % romans.length];
    if (style === "num_alpha") return `${qno} ${l})`;
    if (style === "paren_alpha") return `(${l})`;
    if (style === "alpha_paren") return `${l})`;
    if (style === "roman_paren") return `(${rom})`;
    return `(${l})`;
  }

  function calcDocStats(doc) {
    const h = doc.header || (doc.header = defaultMakerHead());
    let totalQuestions = 0;
    let totalPaperMarks = 0;
    const questionMarksList = [];

    (doc.sections || []).forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        if (!q.orAlternative) totalQuestions++;
        const parts = q.parts || [];
        let qMarks = 0;
        const pMarksArr = [];
        parts.forEach((pt) => {
          const m = parseFloat(pt.marks);
          if (!isNaN(m)) {
            qMarks += m;
            pMarksArr.push(Number.isInteger(m) ? String(m) : m.toFixed(1));
          }
        });
        q._totalMarks = qMarks;
        q._breakdown = pMarksArr.length > 1 ? pMarksArr.join(" + ") : (pMarksArr[0] || "");
        if (!q.orAlternative) {
          totalPaperMarks += qMarks;
          questionMarksList.push(qMarks);
        }
      });
    });

    const choiceY = totalQuestions;
    let choiceX = parseInt(h.choiceX, 10);
    if (isNaN(choiceX) || choiceX <= 0) choiceX = Math.min(5, choiceY || 1);
    if (choiceX > choiceY && choiceY > 0) choiceX = choiceY;
    h.choiceX = choiceX;
    h.choiceY = choiceY;

    let fullMarks = totalPaperMarks;
    if (h.ruleType === "choice" && choiceY > 0) {
      if (questionMarksList.length > 0) {
        const equalMarks = questionMarksList.every((m) => m === questionMarksList[0]);
        if (equalMarks && questionMarksList[0] > 0) {
          fullMarks = choiceX * questionMarksList[0];
        } else {
          const sorted = [...questionMarksList].sort((a, b) => b - a);
          fullMarks = sorted.slice(0, choiceX).reduce((a, b) => a + b, 0);
        }
      }
    } else if (h.ruleType === "compulsory_plus" && choiceY > 1) {
      const q1m = questionMarksList[0] || 0;
      const rest = questionMarksList.slice(1);
      const restAvg = rest.length ? rest.reduce((a, b) => a + b, 0) / rest.length : 0;
      fullMarks = Math.round(q1m + choiceX * restAvg);
    } else if (h.ruleType === "all") {
      fullMarks = totalPaperMarks;
    }

    if (h.autoFull) {
      h.full = String(fullMarks);
    }

    if (h.ruleType === "choice") {
      h.instr = `Candidates are required to give their answers in their own words as far as practicable. Answer any ${choiceX} out of ${choiceY} questions. Figures in the right margin indicate full marks.`;
    } else if (h.ruleType === "all") {
      h.instr = "Candidates are required to give their answers in their own words as far as practicable. Answer all questions. Figures in the right margin indicate full marks.";
    } else if (h.ruleType === "compulsory_plus") {
      h.instr = `Question No. 1 is compulsory. Answer any ${choiceX} questions from the rest. Figures in the right margin indicate full marks.`;
    }

    return { totalQuestions, totalPaperMarks, choiceX, choiceY, fullMarks };
  }

  function getMakerDoc() {
    let doc = store.get("maker_doc", null);
    if (!doc || !doc.sections || !doc.sections.length) {
      doc = initDocFromColl();
      store.set("maker_doc", doc);
    } else {
      // Sync any new collected items from coll that aren't yet in doc
      const existingIds = new Set();
      doc.sections.forEach((sec) => {
        (sec.questions || []).forEach((q) => {
          (q.parts || []).forEach((pt) => { if (pt.id) existingIds.add(pt.id); });
        });
      });
      const missing = coll.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        const sec = doc.sections[0] || (doc.sections[0] = { id: "sec_1", title: "", rule: "", questions: [] });
        missing.forEach((id) => {
          const q = D.byId.get(id);
          if (!q) return;
          sec.questions.push({
            id: "mq_" + id,
            qno: "",
            orAlternative: false,
            parts: [{ id: q.id, label: q.part || "", marks: q.marks != null ? q.marks : 5, tex: q.tex, sourcePaper: q.p }]
          });
        });
        autoGroupQuestions(doc);
        store.set("maker_doc", doc);
      }
    }
    calcDocStats(doc);
    return doc;
  }

  function saveMakerDoc(doc) {
    calcDocStats(doc);
    store.set("maker_doc", doc);
    // sync coll with doc
    const ids = [];
    (doc.sections || []).forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        (q.parts || []).forEach((pt) => { if (pt.id && D.byId.has(pt.id)) ids.push(pt.id); });
      });
    });
    coll = ids;
    saveColl();
  }

  function initDocFromColl() {
    const qs = coll.map((id) => D.byId.get(id)).filter(Boolean);
    const doc = {
      header: defaultMakerHead(),
      sections: [{ id: "sec_1", title: "", rule: "", questions: [] }]
    };
    if (!qs.length) return doc;

    const sec = doc.sections[0];
    qs.forEach((q) => {
      sec.questions.push({
        id: "mq_" + q.id,
        qno: q.qno || "",
        orAlternative: false,
        parts: [{ id: q.id, label: q.part || "", marks: q.marks != null ? q.marks : 5, tex: q.tex, sourcePaper: q.p }]
      });
    });
    autoGroupQuestions(doc);
    return doc;
  }

  function autoGroupQuestions(doc) {
    // Groups consecutive questions that share original paper (sourcePaper) and qno
    (doc.sections || []).forEach((sec) => {
      const grouped = [];
      (sec.questions || []).forEach((q) => {
        const prev = grouped[grouped.length - 1];
        const p0 = q.parts && q.parts[0];
        const prevP0 = prev && prev.parts && prev.parts[0];
        if (prev && p0 && prevP0 && p0.sourcePaper != null && p0.sourcePaper === prevP0.sourcePaper && q.qno && q.qno === prev.qno && !q.orAlternative && !prev.orAlternative) {
          prev.parts.push(...q.parts);
        } else {
          grouped.push(q);
        }
      });
      sec.questions = grouped;
    });
    calcDocStats(doc);
  }

  function qsToDoc(qs, p, head) {
    const h = head || (p ? paperHead(p) : defaultMakerHead());
    const doc = {
      header: {
        inst: h.inst || "VISVA-BHARATI",
        dept: "",
        exam: h.exam || "",
        paper: h.paper || "",
        time: h.time || "",
        full: h.full || "",
        autoFull: false,
        ruleType: "custom",
        choiceX: 5,
        choiceY: qs.length,
        instr: h.instr || (p && p.rule ? plainOf(p.rule) : "Figures in the margin indicate full marks."),
        partStyle: "num_alpha",
        marksStyle: "both"
      },
      sections: []
    };

    let currentSec = null;
    let secName = null;
    qs.forEach((q) => {
      if (!currentSec || q.sec !== secName) {
        secName = q.sec;
        currentSec = { id: "sec_" + doc.sections.length, title: secName ? plainOf(secName) : "", rule: "", questions: [] };
        doc.sections.push(currentSec);
      }
      currentSec.questions.push({
        id: "q_" + (q.id || Math.random().toString(36).slice(2)),
        qno: q.qno || "",
        orAlternative: false,
        parts: [{ id: q.id, label: q.part || "", marks: q.marks != null ? q.marks : "", tex: q.tex, sourcePaper: q.p }]
      });
    });
    autoGroupQuestions(doc);
    return doc;
  }

  function docToLatex(doc) {
    const h = doc.header || defaultMakerHead();
    calcDocStats(doc);
    const lines = [
      "\\documentclass[11pt,a4paper]{article}",
      "\\usepackage{amsmath,amssymb,enumitem,graphicx}",
      "\\usepackage[margin=2cm]{geometry}",
      "\\newcommand{\\printedmarks}[1]{}",
      "\\newcommand{\\unreadable}[1]{#1}",
      "\\newcommand{\\gapmark}[1]{\\ldots}",
      "\\newcommand{\\missingglyph}{\\square}",
      "\\pagestyle{empty}",
      "\\begin{document}",
      "\\begin{center}",
      h.inst ? "{\\large\\textbf{" + h.inst + "}}\\\\[2pt]" : "",
      h.dept ? "\\textbf{" + h.dept + "}\\\\[2pt]" : "",
      h.exam ? "\\textbf{" + h.exam + "}\\\\[2pt]" : "",
      h.paper ? "\\textit{" + h.paper + "}" : "",
      "\\end{center}",
      "\\noindent\\textbf{" + (h.time || "") + "}\\hfill\\textbf{" + (h.full ? "Full Marks: " + h.full : "") + "}\\\\[-4pt]",
      "\\rule{\\textwidth}{0.6pt}",
      h.instr ? "\\begin{center}\\textit{" + h.instr + "}\\end{center}" : "",
      "\\vspace{0.4em}",
      "\\begin{enumerate}[leftmargin=*,label=\\textbf{\\arabic*.}]"
    ];

    (doc.sections || []).forEach((sec) => {
      if (sec.title) {
        lines.push(`\\item[] \\begin{center}\\textbf{${sec.title}}${sec.rule ? "\\\\\\textit{" + sec.rule + "}" : ""}\\end{center}`);
      }
      (sec.questions || []).forEach((q, qIdx) => {
        if (q.orAlternative) {
          lines.push("\\item[] \\begin{center}\\textbf{OR}\\end{center}");
        }
        const parts = q.parts || [];
        if (!parts.length) return;

        if (parts.length === 1 && !parts[0].label) {
          const p0 = parts[0];
          const mk = p0.marks != null && p0.marks !== "" ? ` \\hfill [${p0.marks}]` : "";
          lines.push(`\\item ${p0.tex.trim().replace(/\\hfill\s*\\printedmarks\{[^}]*\}/g, "")}${mk}`);
        } else {
          let subLabel = "\\textbf{(\\alph*)}";
          if (h.partStyle === "num_alpha") subLabel = "\\textbf{\\arabic{enumi}\\alph*)}";
          else if (h.partStyle === "alpha_paren") subLabel = "\\textbf{\\alph*)}";
          else if (h.partStyle === "roman_paren") subLabel = "\\textbf{(\\roman*)}";

          lines.push(`\\item % Question ${qIdx + 1}`);
          lines.push(`  \\begin{enumerate}[leftmargin=*,label=${subLabel}]`);
          parts.forEach((pt) => {
            const pmk = pt.marks != null && pt.marks !== "" ? ` \\hfill [${pt.marks}]` : "";
            lines.push(`    \\item ${pt.tex.trim().replace(/\\hfill\s*\\printedmarks\{[^}]*\}/g, "")}${pmk}`);
          });
          lines.push(`  \\end{enumerate}`);
        }
      });
    });

    lines.push("\\end{enumerate}", "\\end{document}");
    return lines.filter((l) => l !== "").join("\n");
  }

  function toLatex(qsOrDoc, p, head) {
    if (qsOrDoc && qsOrDoc.header && qsOrDoc.sections) {
      return docToLatex(qsOrDoc);
    }
    const doc = qsToDoc(qsOrDoc || [], p, head);
    return docToLatex(doc);
  }

  function defaultHead() { return defaultMakerHead(); }
  function paperHead(p) {
    if (EXAM[p.prog]) return { inst: EXAM[p.prog], dept: "", exam: p.title, paper: "", time: "", full: p.full || "", instr: "" };
    return { inst: "VISVA-BHARATI", dept: "Department of Mathematics", exam: (p.prog === "BSc" ? "B.Sc." : "M.Sc.") + " Mathematics " + (p.kind[0] === "i" ? "Internal Assessment" : "Examination") + " " + p.year + ", Semester " + ROMAN[p.sem], paper: (p.code || "") + (p.title ? " — " + p.title : ""), time: "", full: p.full || "", instr: p.rule ? plainOf(p.rule) : "Figures in the margin indicate full marks." }; }
  function overleaf(tex) {
    const f = document.createElement("form"); f.method = "post"; f.action = "https://www.overleaf.com/docs"; f.target = "_blank";
    [["encoded_snip", encodeURIComponent(tex)], ["snip_name", "vbmath-paper.tex"]].forEach(([n, v]) => { const i = document.createElement("input"); i.type = "hidden"; i.name = n; i.value = v; f.appendChild(i); });
    document.body.appendChild(f); f.submit(); f.remove();
  }
  function download(name, text) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/x-tex" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }

  /* ---------- search ---------- */
  const STOP_WORDS = new Set("a an the of in on to and or for with is are find show prove question questions about".split(" "));
  const MATH_ALIASES = [
    [/\b(?:rref|reduced row echelon (?:form|matrix))\b/g, "rref"],
    [/\b(?:ivp|initial value problem)\b/g, "ivp"],
    [/\b(?:bvp|boundary value problem)\b/g, "bvp"],
    [/\b(?:ode|ordinary differential equations?)\b/g, "ode"],
    [/\b(?:pde|partial differential equations?)\b/g, "pde"],
    [/\b(?:eigen values?|eigenvalues?|characteristic roots?)\b/g, "eigenvalue"],
    [/\b(?:null space|nullspace|kernel)\b/g, "nullspace"],
    [/\b(?:cayley hamilton|hamilton cayley)\b/g, "cayleyhamilton"],
    [/\b(?:converges?|convergent|convergence)\b/g, "convergence"],
    [/\b(?:differentiability|differentiable)\b/g, "differentiable"],
    [/\b(?:continuity|continuous)\b/g, "continuous"],
    [/\bmatrices\b/g, "matrix"],
  ];
  let searchVocabulary = null;
  const compactCode = (value) => String(value || "").toLowerCase().replace(/\(.*/, "").replace(/[^a-z0-9]/g, "");
  function searchWords(value, aliases = true) {
    let text = String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
      .replace(/[’']/g, "").replace(/∫/g, " int ").replace(/∑/g, " sum ").replace(/∞/g, " infty ")
      .replace(/\\(mathbb|mathbf|mathrm)\{([a-z]+)\}/g, "$2").replace(/\\(?=[a-z])/g, " ")
      .replace(/\b(mjama|mjma|mnma|mdma|secma|sec|dsema|dse|gema|ccma|cc|bmc|bme|bmo|mmc|mme|mmo|gec|aecc)[\s–-]*0*(\d+[a-z]?)\b/g, "$1$2")
      .replace(/[^a-z0-9]+/g, " ").trim();
    if (aliases) for (const [pattern, replacement] of MATH_ALIASES) text = text.replace(pattern, replacement);
    return text ? " " + text + " " : " ";
  }
  function oneEdit(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    if (a.length === b.length) {
      return a.slice(i + 1) === b.slice(i + 1) ||
        (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
    }
    return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
  }
  function scoringQuery(value) {
    const exact = [];
    const plain = value.replace(/"([^"]+)"/g, (_, quoted) => { exact.push(searchWords(quoted, false)); return " "; });
    let words = [...new Set(searchWords(plain).trim().split(/ +/).filter(Boolean))];
    if (words.some((w) => !STOP_WORDS.has(w))) words = words.filter((w) => !STOP_WORDS.has(w));
    if (!words.length && !exact.length) return null;
    if (!searchVocabulary) {
      searchVocabulary = new Set();
      for (const q of D.Q) for (const field of q.search) for (const word of field.trim().split(" ")) searchVocabulary.add(word);
    }
    const terms = words.map((w) => {
      if (w.length < 5 || searchVocabulary.has(w) || !/^[a-z]+$/.test(w)) return [" " + w + " "];
      const typoForms = w.endsWith("s") && w.length > 6 ? [w, w.slice(0, -1)] : [w];
      const alternatives = [...searchVocabulary].filter((term) => term[0] === w[0] && typoForms.some((form) => oneEdit(form, term)));
      return [" " + w + " ", ...alternatives.slice(0, 8).map((t) => " " + t + " ")];
    });
    const phrase = searchWords(plain);
    return { terms, exact, phrase };
  }
  function searchScore(q, query) {
    const display = query.exact.length ? searchWords(plainOf(q.tex), false) : "";
    if (query.exact.some((x) => !display.includes(x))) return -1;
    let score = 8 * query.exact.length;
    for (const alternatives of query.terms) {
      let best = 0;
      for (const [i, term] of alternatives.entries()) {
        if (q.search[0].includes(term)) best = Math.max(best, i ? 2 : 5);
        if (q.search[1].includes(term)) best = Math.max(best, i ? 3 : 8);
        if (q.search[2].includes(term)) best = Math.max(best, i ? 2 : 6);
      }
      if (!best) return -1;
      score += best;
    }
    if (query.phrase.trim().includes(" ") && q.search.some((x) => x.includes(query.phrase))) score += 6;
    return score;
  }
  function runSearch() {
    const query = scoringQuery(F.q);
    const from = +F.from || 0, to = +F.to || 9999;
    const topic = F.topic === "" ? -1 : +F.topic, broad = F.broad === "" ? -1 : +F.broad;
    const res = [];
    for (const q of D.Q) {
      if (q.stem) continue;
      const p = D.papers[q.p];
      if (F.prog && p.prog !== F.prog) continue;
      if (F.sem && p.sem !== +F.sem) continue;
      if (p.year < from || p.year > to) continue;
      if (F.code && compactCode(p.code) !== compactCode(F.code)) continue;
      if (F.kind && (EXAM[F.kind] ? p.prog !== F.kind : p.kind[0] !== F.kind)) continue;
      if (topic >= 0 && !q.t.includes(topic)) continue;
      if (broad >= 0 && !q.broads.has(broad)) continue;
      if (F.len && lenOf(q) !== F.len) continue;
      if (F.rep && q.rep.length < 2) continue;
      const score = query ? searchScore(q, query) : 0;
      if (score < 0) continue;
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
  let searchFiltersOpen = false;
  function viewSearch() {
    const yrs = D.years;
    const specific = D.topics.map((t, i) => [i, t]).filter(([i, t]) => F.broad === "" || t[0] === D.broad[+F.broad]);
    return `<div class="wrap">
      <div class="crumbs"><a href="${L("home")}">Home</a> / Search</div>
      ${editorialHeading("Search the question bank", `${D.Q.filter((q) => !q.stem).length.toLocaleString()} questions from ${D.papers.length} papers. Find a topic, theorem, formula or paper code.`, false)}
      <div class="search-console">
        <form class="searchbar" id="sform" role="search">${IC.search}<input name="q" type="search" id="sq" placeholder="Try: Cayley-Hamilton, Sylow, Frobenius, &quot;uniformly continuous&quot;" value="${esc(F.q)}" aria-label="Search questions"><button class="btn btn-primary" type="submit">Search</button></form>
        <div class="source-picker"><span class="flabel" id="source-label">Question source</span><div class="seg" data-f="prog" role="group" aria-labelledby="source-label">${[["", "All"], ["BSc", "B.Sc."], ["MSc", "M.Sc."], ...Object.keys(EXAM).map((code) => [code, code])].map(([v, l]) => `<button type="button" class="chip${(F.prog || (EXAM[F.kind] ? F.kind : "")) === v ? " on" : ""}" data-v="${v}" aria-pressed="${(F.prog || (EXAM[F.kind] ? F.kind : "")) === v}">${l}</button>`).join("")}</div></div>
      </div>
      <div class="search-layout">
        <aside class="filters" id="filters" data-collapsed="${searchFiltersOpen ? "0" : "1"}" aria-label="Filters">
          <div style="display:flex;justify-content:space-between;align-items:center"><span class="flabel" style="margin:0">Filters</span>
            <span><button class="btn btn-ghost btn-sm ftoggle" type="button" id="ftoggle" aria-controls="search-refinements" aria-expanded="${searchFiltersOpen}">${searchFiltersOpen ? "Hide" : "Show"}</button> <button class="btn btn-ghost btn-sm" type="button" id="freset">Reset</button></span></div>
          <div class="fbody" id="search-refinements">
          <div><label class="flabel" for="f-sem">Semester</label><select id="f-sem"${EXAM[F.kind] ? " disabled" : ""}>${opt("", "Any semester", F.sem)}${[1, 2, 3, 4, 5, 6, 7, 8].filter((s) => F.prog !== "MSc" || s <= 4).map((s) => opt(s, "Semester " + ROMAN[s], F.sem)).join("")}</select></div>
          <div><span class="flabel">Year</span><div class="two"><select id="f-from" aria-label="From year">${opt("", "From", F.from)}${yrs.map((y) => opt(y, y, F.from)).join("")}</select><select id="f-to" aria-label="To year">${opt("", "To", F.to)}${yrs.map((y) => opt(y, y, F.to)).join("")}</select></div></div>
          <div><label class="flabel" for="f-code">Paper code</label><input id="f-code" type="text" list="codes" placeholder="e.g. CC-5, MMC-21" value="${esc(F.code)}" autocomplete="off"><datalist id="codes">${D.codes.map((c) => `<option value="${esc(c)}">`).join("")}</datalist></div>
          <div><label class="flabel" for="f-broad">Topic</label><select id="f-broad">${opt("", "Any area", F.broad)}${D.broad.map((b, i) => opt(i, b, F.broad)).join("")}</select>
            <select id="f-topic" style="margin-top:8px" aria-label="Specific topic">${opt("", "Any specific topic", F.topic)}${specific.map(([i, t]) => opt(i, t[1], F.topic)).join("")}</select></div>
          <div><span class="flabel">Length</span><div class="seg" data-f="len">${[["", "Any"], ["short", "Short ≤" + SHORT_MAX], ["long", "Long ≥" + (SHORT_MAX + 1)]].map(([v, l]) => `<button type="button" class="chip${F.len === v ? " on" : ""}" data-v="${v}">${l}</button>`).join("")}</div></div>
          <div ${EXAM[F.kind] ? "hidden" : ""}><span class="flabel">VB exam type</span><div class="seg" data-f="kind">${[["", "All"], ["s", "Semester"], ["i", "Internal"]].map(([v, l]) => `<button type="button" class="chip${F.kind === v ? " on" : ""}" data-v="${v}">${l}</button>`).join("")}</div></div>
          <div><label style="display:flex;gap:8px;align-items:center;font:500 14px var(--f-ui);color:var(--ink-2)"><input type="checkbox" id="f-rep" ${F.rep ? "checked" : ""}> Only questions asked in more than one year</label></div>
          </div>
        </aside>
        <section style="min-width:0">
          <div class="resultbar"><span id="rcount"></span><label>Sort <select id="f-sort">${opt("rel", "Relevance", F.sort)}${opt("new", "Newest first", F.sort)}${opt("old", "Oldest first", F.sort)}${opt("marks", "Most marks", F.sort)}${opt("rep", "Most repeated", F.sort)}</select></label></div>
          <div id="results"></div>
          <div class="pager"><button class="btn btn-ghost" type="button" id="more" hidden>Show more</button></div>
        </section>
      </div></div>`;
  }
  function searchQuery() {
    const params = new URLSearchParams();
    if (F.q) params.set("q", F.q);
    if (EXAM[F.kind] || F.prog) params.set("exam", EXAM[F.kind] ? F.kind : F.prog);
    if (F.sem) params.set("sem", F.sem);
    return params.size ? "?" + params : "";
  }
  function bindSearch() {
    shown = PAGE;
    const rerun = (reset = true) => { if (reset) shown = PAGE; store.set("filters", F); if (!HASH) history.replaceState({}, "", "/search/" + searchQuery()); renderResults(); };
    $("#sform").addEventListener("submit", (e) => { e.preventDefault(); F.q = $("#sq").value.trim(); rerun(); });
    let deb; $("#sq").addEventListener("input", (e) => { clearTimeout(deb); deb = setTimeout(() => { F.q = e.target.value.trim(); rerun(); }, 220); });
    $$(".seg[data-f]").forEach((g) => g.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-v]"); if (!b) return;
      const field = g.dataset.f, value = b.dataset.v;
      if (field === "prog") {
        F.prog = EXAM[value] ? "" : value;
        F.kind = EXAM[value] ? value : EXAM[F.kind] ? "" : F.kind;
        if (EXAM[value]) F.sem = F.code = "";
        if (value === "MSc" && +F.sem > 4) F.sem = "";
        route(true);
        $$('.source-picker .chip').find((chip) => chip.dataset.v === value)?.focus({ preventScroll: true });
        return;
      }
      F[field] = value;
      $$("button", g).forEach((x) => x.classList.toggle("on", x === b));
      rerun();
    }));
    const sel = { "f-sem": "sem", "f-from": "from", "f-to": "to", "f-sort": "sort", "f-topic": "topic" };
    Object.entries(sel).forEach(([id, k]) => $("#" + id).addEventListener("change", (e) => { F[k] = e.target.value; rerun(); }));
    $("#f-broad").addEventListener("change", (e) => { F.broad = e.target.value; F.topic = ""; route(true); });
    $("#f-code").addEventListener("change", (e) => { F.code = e.target.value.trim().toUpperCase(); rerun(); });
    $("#f-rep").addEventListener("change", (e) => { F.rep = e.target.checked; rerun(); });
    $("#freset").addEventListener("click", () => { F = defaultFilters(); store.set("filters", F); route(true); });
    $("#ftoggle").addEventListener("click", (e) => { const f = $("#filters"); const c = f.dataset.collapsed === "1"; f.dataset.collapsed = c ? "0" : "1"; searchFiltersOpen = c; e.currentTarget.setAttribute("aria-expanded", String(c)); e.currentTarget.textContent = c ? "Hide" : "Show"; });
    $("#more").addEventListener("click", () => { shown += PAGE; renderResults(true); });
    rerun();
  }
  let lastRes = [];
  function renderResults(append) {
    if (!append) lastRes = runSearch();
    const box = $("#results"); if (!box) return;
    const n = lastRes.length;
    $("#rcount").textContent = n ? `${n.toLocaleString()} question${n === 1 ? "" : "s"}` : "";
    if (!n && F.kind === "GATE" && !D.papers.some((p) => p.prog === "GATE")) {
      box.innerHTML = `<div class="empty">Use the <a href="${L("exams-gate")}">GATE archive</a> to search PDF text and browse available typed editions.</div>`;
      $("#more").hidden = true;
      return;
    }
    if (!n) { box.innerHTML = `<div class="empty">No questions match. Loosen a filter, or check the <a href="${L("scans")}">scanned papers</a> — not every scan has been typed yet.</div>`; $("#more").hidden = true; return; }
    const from = append ? box.children.length : 0;
    const html = lastRes.slice(from, shown).map((q) => qCard(q)).join("");
    if (append) { const tmp = document.createElement("div"); tmp.innerHTML = html; const frag = Array.from(tmp.children); frag.forEach((c) => box.appendChild(c)); frag.forEach(typeset); }
    else { box.innerHTML = html; typeset(box); }
    $("#more").hidden = shown >= n;
    $("#more").textContent = `Show more (${(n - Math.min(shown, n)).toLocaleString()} left)`;
  }

  /* ---------- semester helpers ---------- */
  function semPapers(pg, s) { return D.papers.filter((p) => p.prog === pg && p.sem === s); }
  function semCodes(pg, s) {
    // unique paper choices: code (or internal label), newest first, with the newest title
    const m = new Map();
    semPapers(pg, s).slice().sort((a, b) => b.year - a.year).forEach((p) => {
      const k = (p.kind[0] === "i" ? "i:" : "s:") + pname(p);
      if (!m.has(k)) m.set(k, { k, name: pname(p), title: p.title, kind: p.kind[0], years: [] });
      if (!m.get(k).years.includes(p.year)) m.get(k).years.push(p.year);
    });
    return Array.from(m.values()).sort((a, b) => (a.kind === "i") - (b.kind === "i") || b.years[0] - a.years[0] || a.name.localeCompare(b.name, "en", { numeric: true }));
  }
  function pickerParts(pg, s, id) {
    const codes = semCodes(pg, s);
    if (!codes.length) return ["", ""];
    return [`<select id="${id}-c" aria-label="Paper">${codes.map((c) => `<option value="${esc(c.k)}">${esc(c.name)}${c.title ? " · " + esc(c.title) : ""}${c.kind === "i" ? " (internal)" : ""}</option>`).join("")}</select>`,
      `<select id="${id}-y" aria-label="Year">${yearOpts(codes[0])}</select>`];
  }
  const pickerHtml = (pg, s, id) => pickerParts(pg, s, id).join("");
  const yearOpts = (c) => `<option value="all">All years (${c.years.length})</option>` + c.years.map((y) => `<option value="${y}">${y}</option>`).join("");
  function bindPicker(pg, s, id, btn) {
    const codes = semCodes(pg, s); const cs = $("#" + id + "-c"), ys = $("#" + id + "-y"); if (!cs) return;
    cs.addEventListener("change", () => { ys.innerHTML = yearOpts(codes.find((c) => c.k === cs.value)); });
    $(btn).addEventListener("click", () => {
      const c = codes.find((x) => x.k === cs.value), y = ys.value;
      if (y !== "all") { const p = D.papers.find((p) => p.prog === pg && p.sem === s && p.year === +y && (p.kind[0] === "i" ? "i:" : "s:") + pname(p) === c.k); if (p) return go("paper-" + p.key); }
      F = defaultFilters(); F.prog = pg; F.sem = String(s); if (c.name && !/^Internal|^Paper/.test(c.name)) F.code = c.name; if (c.kind === "i") F.kind = "i"; F.sort = "new"; go("search");
    });
  }

  /* ---------- home ---------- */
  function seasonSems() {
    const m = new Date().getMonth() + 1;
    return m >= 8 || m <= 1 ? { label: "Odd semesters", B: [1, 3, 5, 7], M: [1, 3] } : { label: "Even semesters", B: [2, 4, 6, 8], M: [2, 4] };
  }
  function dayIndex(n) {
    const d = new Date(), s = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0) % n;
  }
  const WAVE_UNUSED = `<svg class="wave" viewBox="0 0 170 50" aria-hidden="true"><path d="M4 34 C38 44 58 8 92 6 C116 4 128 16 166 8 C140 26 122 18 98 22 C64 28 50 50 4 34 Z" fill="#E8A62C"/></svg>`;
  let homeRequest, homeObserver;
  function loadHomeData() {
    homeRequest ??= loadJSON("home").catch((error) => { homeRequest = null; throw error; });
    return homeRequest;
  }
  function viewSeasonHeading({label, B}) {
    return `<header class="shead season-heading">
      <div>
        <h2><span class="season-heading-kicker">Coming up</span>${label}</h2>
        <p class="season-heading-numbers">Semesters ${B.map((semester) => ROMAN[semester]).join(" · ")}</p>
        <p>Pick a paper and a year, or open the semester to see every paper.</p>
      </div>
      <a class="btn btn-ghost" href="${L("papers")}">All semesters ${IC.arrow}</a>
    </header>`;
  }
  function viewHomeArchive() {
    const S = seasonSems();
    const card = (pg, s, i) => {
      const ps = semPapers(pg, s), id = `sp${i}`;
      const ys = ps.map((p) => p.year);
      return `<div class="semcard${ps.length ? "" : " none"}">
        <h3>${PSHORT[pg]} Semester ${ROMAN[s]}</h3>
        ${ps.length ? `<div class="meta">${ps.length} papers from ${Math.min(...ys)} to ${Math.max(...ys)}</div>${pickerHtml(pg, s, id)}
          <div class="acts"><button class="btn btn-primary btn-sm" type="button" id="${id}-go">Open paper</button><a class="lnk" href="${L("semester-" + pg.toLowerCase() + "-" + s)}">All papers</a></div>`
        : `<p class="empty-note">${s >= 7 ? "The first Semester " + ROMAN[s] + " examinations of the four-year programme are still to come." : "No papers typed yet."} If you have the papers, please send them.</p><div class="acts"><a class="btn btn-ghost btn-sm" href="${esc(D.C.forms.questions)}" target="_blank" rel="noopener">Send scans</a></div>`}
      </div>`;
    };
    const seasonList = S.B.map((s) => ["BSc", s]).concat(S.M.map((s) => ["MSc", s]));
    const tile = (pg, s) => { const n = semPapers(pg, s).length; return `<a class="${n ? "" : "none"}" href="${L("semester-" + pg.toLowerCase() + "-" + s)}" aria-label="${PSHORT[pg]} Semester ${ROMAN[s]}"><b>${ROMAN[s]}</b><small>${n ? n + " papers" : "None yet"}</small></a>`; };
    return `<section class="section">${viewSeasonHeading(S)}
        <div class="season">${seasonList.map(([pg, s], i) => card(pg, s, i)).join("")}</div></section>

      <section class="section"><div class="shead"><h2>Every semester</h2></div>
        <div class="allsem">
          <div class="r"><span>B.Sc.</span><nav aria-label="B.Sc. semesters">${[1, 2, 3, 4, 5, 6, 7, 8].map((s) => tile("BSc", s)).join("")}</nav></div>
          <div class="r"><span>M.Sc.</span><nav class="m" aria-label="M.Sc. semesters">${[1, 2, 3, 4].map((s) => tile("MSc", s)).join("")}</nav></div>
        </div></section>`;
  }
  function viewHome() {
    return `<section class="hero-band"><div class="wrap">
        <div class="hero">
          <div>
            <h1>Visva-Bharati Mathematics Question Papers</h1>
            <p class="lede">B.Sc. and M.Sc. examination questions, written in LaTeX, sorted by semester and topic, and linked to the original scans.</p>
            <form class="bigsearch" id="homeform" role="search">${IC.search}<input type="search" id="homeq" name="q" placeholder="Search a theorem, topic or paper code" aria-label="Search questions" autocomplete="off"><button class="btn btn-primary" type="submit">Search</button></form>
            <div class="hints"><span class="muted">Try</span>${["Cayley-Hamilton", "Sylow", "Green's theorem", "Frobenius", "Simplex"].map((h) => `<button type="button" class="chip" data-hint="${esc(h)}">${esc(h)}</button>`).join("")}</div>
          </div>
          <div class="hero-feature"><figure class="daily-figure" id="home-figure" aria-busy="true">
              <figcaption class="daily-figure-label">Math figure of the day</figcaption>
              <div class="daily-figure-plot"></div>
            </figure>
            <article class="qod" id="home-daily">
              <div class="qodh"><b>Question of the day</b></div>
              <p class="muted">Loading today’s question…</p>
            </article>
          </div>
        </div>
        <div class="statbar" id="home-stats"></div>
      </div></section>
    <div class="wrap">
      <div id="home-semesters"><section class="section">${viewSeasonHeading(seasonSems())}</section></div>
      <section class="section"><div class="features">
        <a class="feature" href="${L("topics")}"><span class="fi">${IC.grid || IC.search}</span><h3>Topics and trends</h3><p>See how often each topic was examined year by year.</p><span class="go">Explore topics</span></a>
        <a class="feature" href="${L("preview")}" data-open-coll><span class="fi">${IC.file || IC.plus}</span><h3>Build a paper</h3><p>Collect questions from any year, reorder them, preview an A4 paper, then print it or take the LaTeX.</p><span class="go">Open your collection</span></a>
        <a class="feature" href="${L("contribute")}"><span class="fi">${IC.plus}</span><h3>Contribute</h3><p>Send scans, type a missing question, fix a topic or share a solution. A reviewer checks every change.</p><span class="go">Ways to help</span></a>
      </div></section>
    </div>`;
  }
  function viewDailyQuestion(qp, qod) {
    return `<article class="qod" id="qod" data-id="${esc(qod.id)}" aria-label="Question of the day">
            <div class="qodh"><b>Question of the day</b><a href="${L("paper-" + qp.key)}">${esc(pname(qp))}, ${esc(semLabel(qp))}, ${qp.year}</a></div>
            <div class="qh"><span class="qn">Q${esc(qLabel(qod))}</span><span class="qsrc">${qp.title ? esc(qp.title) : ""}</span>${qod.marks != null ? `<span class="qmk">${esc(fmtMarks(qod))} marks</span>` : ""}</div>
            <div class="qbody">${texToHtml(qod.tex)}</div>
            <div class="qodf"><a class="btn btn-ghost btn-sm" href="${L("paper-" + qp.key)}">Open the paper</a><button type="button" class="qbtn collect${coll.includes(qod.id) ? " on" : ""}" aria-pressed="${coll.includes(qod.id)}" data-act="collect"><span class="lbl-off">${IC.plus}</span><span class="lbl-on">${IC.check}</span><span class="lbl-off">Collect</span><span class="lbl-on">Collected</span></button></div>
          </article>`;
  }
  function bindHome() {
    $("#homeform").addEventListener("submit", (e) => { e.preventDefault(); F = defaultFilters(); F.q = $("#homeq").value.trim(); go("search"); });
    $$("[data-hint]").forEach((b) => b.addEventListener("click", () => { F = defaultFilters(); F.q = b.dataset.hint; go("search"); }));
    $$("[data-open-coll]").forEach((a) => a.addEventListener("click", (e) => { if (!coll.length) { e.preventDefault(); e.stopPropagation(); openDrawer(); } }, true));
    const stats = $("#home-stats"), daily = $("#home-daily"), semesters = $("#home-semesters"), figure = $("#home-figure");
    const dataRequest = loadHomeData();
    dataRequest.then(({questions, papers, scans, years}) => {
      if (!stats.isConnected) return;
      const counts = [[questions.toLocaleString(), "questions"], [papers.toLocaleString(), "typed papers"], [scans.toLocaleString(), "original scans"], [years.join("–"), "examination years"]];
      stats.innerHTML = counts.map(([value, label]) => `<div><b>${esc(value)}</b><span>${label}</span></div>`).join("");
    }).catch(() => {});
    const sections = new Map([
      [figure, async () => {
        try {
          const {mountDailyFigure} = await import("./math-figures.mjs");
          if (figure.isConnected) mountDailyFigure(figure, L("gallery"));
        } catch {
          if (figure.isConnected) figure.hidden = true;
        }
      }],
      [daily, async () => {
        try {
          const {dailyQuestions} = await dataRequest;
          if (!daily.isConnected) return;
          const [paper, question] = dailyQuestions[dayIndex(dailyQuestions.length)];
          daily.outerHTML = viewDailyQuestion(paper, question);
          typeset($("#qod"));
        } catch {
          if (daily.isConnected) $(".muted", daily).innerHTML = `Today’s question is unavailable. <a href="${L("search")}">Browse questions</a>`;
        }
      }],
      [semesters, async () => {
        try { await loadCatalogue(); }
        catch { return; } // The archive link remains available if the picker data fails.
        if (!semesters.isConnected) return;
        semesters.innerHTML = viewHomeArchive();
        const S = seasonSems();
        S.B.map((s) => ["BSc", s]).concat(S.M.map((s) => ["MSc", s])).forEach(([pg, s], i) => {
          if ($(`#sp${i}-go`)) bindPicker(pg, s, `sp${i}`, `#sp${i}-go`);
        });
      }],
    ]);
    if (!("IntersectionObserver" in window)) {
      sections.forEach((show) => show());
      return;
    }
    homeObserver = new IntersectionObserver((entries, observer) => {
      for (const {isIntersecting, target} of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        if (target.isConnected) sections.get(target)();
      }
    });
    sections.forEach((_, target) => homeObserver.observe(target));
  }

  /* ---------- paper archives ---------- */
  const originalPaperLink = (href, label, icon = IC.ext) => `<a href="${esc(href)}" target="_blank" rel="noopener">${icon}<span>${esc(label)}</span></a>`;
  function archiveItems(code, semester) {
    const academic = Object.hasOwn(PROG, code);
    const sources = academic ? [] : D.C.paperSources?.[code] || [];
    const byPaper = new Map(sources.filter((row) => row[4]).map((row) => [row[4], row]));
    const seen = new Set(sources.map((row) => row[2]).filter(Boolean));
    const records = D.papers.filter((p) => p.prog === code && (!semester || p.sem === semester)).map((p) => {
      const source = byPaper.get(p.key);
      const pdf = source?.[2] || p.source || "";
      if (pdf) seen.add(pdf);
      return {year:p.year, sem:p.sem, label:source?.[1] || (academic ? paperLabel(p) : code === "JAM" ? "Mathematics (MA)" : p.title),
        pdf, answer:source?.[3] || p.answer_key, typed:p.key, internal:p.kind[0] === "i", questions:p.n};
    });
    records.push(...sources.filter((row) => !row[4] || !D.byKey.has(row[4])).map(([year, label, pdf, answer, , reader]) => ({year,label,pdf,answer,reader})));
    if (academic) {
      records.push(...D.scans.filter((scan) => !scan.other && scan.prog === code && (!semester || scan.sem === semester)).map((scan) =>
        ({year:scan.year, sem:scan.sem, label:scan.label, pdf:scanUrl(scan.id), internal:scan.kind === "i"})));
    } else if (code === "NET" || code === "JAM") {
      const exam = D.C.exams.find((item) => EXAM_CODE[item.name] === code);
      for (const [label, url] of exam.links) {
        const year = code === "JAM" ? /^\d{4}$/.test(label) && +label : Number(label.match(/\b20\d{2}\b/)?.[0]);
        if (year && !seen.has(url)) {
          const jam = code === "JAM" && records.find((row) => row.year === year && row.typed);
          if (!jam) records.push({year,label:code === "JAM" ? "Mathematics (MA)" : label,pdf:url});
        }
      }
    }
    return records.sort((a, b) => (b.year || 0) - (a.year || 0) || (a.sem || 0) - (b.sem || 0) || Number(!!b.typed) - Number(!!a.typed) || a.label.localeCompare(b.label, undefined, {numeric:true}));
  }
  function archiveCard(item, code) {
    const actions = [
      item.pdf && originalPaperLink(item.pdf, "Original PDF", IC.file),
      item.typed && `<a href="${L("paper-" + item.typed)}">${IC.stack}<span>Typed questions</span></a>`,
      item.reader && originalPaperLink(item.reader, "Typed paper (external)", IC.stack),
      item.answer && originalPaperLink(item.answer, "Answer key"),
    ].filter(Boolean).join("");
    const session = code === "NET" && item.label.match(/^(?:(\d{1,2}) )?(January|February|March|April|May|June|July|August|September|October|November|December)/i);
    const sessionLabel = session ? [session[1], session[2].slice(0, 3)].filter(Boolean).join(" ") : "";
    const mark = `<span class="archive-year" aria-hidden="true">${IC.file}<strong>${item.year || "—"}</strong>${sessionLabel ? `<span>${sessionLabel}</span>` : ""}</span>`;
    const assignment = `<span class="archive-label">${esc(item.label)}</span>${item.sem ? `<small>${semLabel({prog:code,sem:item.sem})}${item.internal ? " · Internal" : ""}</small>` : ""}`;
    const heading = item.pdf ? `<a class="archive-item-head" href="${esc(item.pdf)}" target="_blank" rel="noopener" aria-label="Open original PDF, ${item.year || "year unlisted"}, ${esc(item.label)}">${mark}<span>${assignment}</span></a>` :
      `<div class="archive-item-head">${mark}<span>${assignment}</span></div>`;
    return `<article class="archive-item">${heading}<div class="archive-actions">${actions}</div></article>`;
  }
  let gatePages;
  function gateSearch() {
    return `<form class="archive-search" id="gate-search" role="search">
      <label for="gate-query">Find text in GATE PDFs (2022–2026)</label>
      <div><input id="gate-query" type="search" placeholder="Try eigenvalue, compact, or differential equation" required>
        <button type="submit" class="btn btn-primary">${IC.search} Search PDFs</button></div>
      <small class="muted">Search extracted PDF text. Open the original page to read formulas and figures.</small>
    </form><div id="gate-matches" aria-live="polite"></div>`;
  }
  function bindGateSearch(archive) {
    const form = $("#gate-search", archive);
    if (!form) return;
    const output = $("#gate-matches", archive);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const terms = $("#gate-query", archive).value.toLowerCase().match(/[a-z0-9]+/g) || [];
      if (!terms.length) { output.textContent = "Enter a word or question number to search."; return; }
      const button = $("button", form);
      button.disabled = true;
      output.textContent = "Searching PDF pages…";
      try {
        if (!gatePages) {
          const response = await fetch(BASE + "data/gate-pages.json.gz");
          if (!response.ok || !response.body) throw Error("PDF index unavailable");
          gatePages = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).json();
        }
        const sources = new Map(D.C.paperSources.GATE.map(([year, , pdf]) => [String(year), pdf]));
        const matches = Object.entries(gatePages).reverse().flatMap(([year, pages]) => pages
          .filter(([, text]) => terms.every((term) => (" " + text + " ").includes(" " + term + " "))).map(([page]) => [year, page]));
        output.innerHTML = matches.length ? `<p>${matches.length} matching PDF ${matches.length === 1 ? "page" : "pages"}</p>
          <div class="row gate-page-links">${matches.map(([year, page]) => `<a class="chip" href="${esc(sources.get(year))}#page=${page}" target="_blank" rel="noopener">GATE ${year} · page ${page} ${IC.ext}</a>`).join("")}</div>`
          : "<p>No PDF pages match those terms.</p>";
      } catch {
        output.textContent = "PDF search is temporarily unavailable. You can still open the PDFs below.";
      } finally { button.disabled = false; }
    });
  }
  function archiveBrowser(code, semester) {
    const items = archiveItems(code, semester);
    const years = [...new Set(items.map((p) => p.year || "unknown"))];
    const academic = Object.hasOwn(PROG, code);
    const typed = items.some((item) => item.typed);
    const records = items.some((item) => item.reader);
    return `<div class="paper-archive" data-archive="${code}" data-semester="${semester || ""}">
      ${code === "GATE" ? gateSearch() : ""}
      ${typed ? `<form class="archive-search" role="search" action="${L("search")}">
        <label for="archive-query">Search typed questions</label>
        <div><input name="q" type="search" id="archive-query" placeholder="Search a topic, theorem or formula">
          <input name="exam" type="hidden" value="${code}">
          <button class="btn btn-primary" type="submit">${IC.search} Search</button></div></form>` :
        records ? `<p class="note">The GATE tiles link to official PDFs and available typed editions. <a href="https://studentaihub.tech/gate-previous-year-papers/ma#gate-ma-previous-year-questions-by-topic" target="_blank" rel="noopener">Browse GATE questions by topic</a>.</p>` : ""}
      ${items.length ? `<div class="archive-filters">
        <div><label class="flabel" for="archive-year">Year</label><select id="archive-year">${opt("", "All years", "")}${years.map((y) => opt(y, y === "unknown" ? "Year unlisted" : y, academic ? years[0] : "")).join("")}</select></div>
        ${academic && !semester ? `<div><label class="flabel" for="archive-sem">Semester</label><select id="archive-sem">${opt("", "All semesters", "")}${Array.from({length:NSEM[code]}, (_, i) => opt(i + 1, "Semester " + ROMAN[i + 1], "")).join("")}</select></div>` : ""}
        <div><label class="flabel" for="archive-format">Format</label><select id="archive-format"><option value="">All formats</option><option value="pdf">Original PDFs</option>${typed || records ? '<option value="typed">Typed papers</option>' : ""}</select></div>
        <div><label class="flabel" for="archive-title">Paper or session</label><input type="search" id="archive-title" placeholder="Filter papers"></div>
      </div><p class="muted archive-count" aria-live="polite"></p><div class="archive-tiles"></div>` : '<p class="empty">No question papers are listed for this semester.</p>'}
    </div>`;
  }
  function bindArchive() {
    const archive = $(".paper-archive");
    if (!archive) return;
    const {archive:code, semester} = archive.dataset;
    bindGateSearch(archive);
    const search = $('form.archive-search[action]', archive);
    search?.addEventListener("submit", (event) => {
      event.preventDefault();
      F = {...defaultFilters(), q: $("#archive-query").value.trim(), sem:semester, prog:Object.hasOwn(PROG, code) ? code : "", kind:EXAM[code] ? code : ""};
      go("search");
    });
    const year = $("#archive-year", archive);
    if (!year) return;
    const sem = $("#archive-sem", archive), format = $("#archive-format", archive), title = $("#archive-title", archive);
    const items = archiveItems(code, +semester);
    const draw = () => {
      const q = searchWords(title.value, false).trim();
      const shown = items.filter((item) => (!year.value || year.value === String(item.year || "unknown")) &&
        (!sem?.value || +sem.value === item.sem) && (format.value !== "pdf" || item.pdf) &&
        (format.value !== "typed" || item.typed || item.reader) && (!q || searchWords(item.label, false).includes(q)));
      $(".archive-count", archive).textContent = shown.length.toLocaleString() + (shown.length === 1 ? " paper" : " papers");
      $(".archive-tiles", archive).innerHTML = shown.length ? shown.map((item) => archiveCard(item, code)).join("") : '<p class="empty">No papers match these filters.</p>';
    };
    [year, sem, format].filter(Boolean).forEach((el) => el.addEventListener("change", draw));
    title.addEventListener("input", draw);
    draw();
  }

  /* ---------- papers (programme overview) ---------- */
  function viewPapers(programme) {
    const requested = routeParams().get("programme");
    const tab = programme || (Object.hasOwn(PROG, requested) ? requested : store.get("papersTab", "BSc"));
    const sems = Array.from({ length: NSEM[tab] }, (_, i) => i + 1);
    return `<div class="wrap"><div class="crumbs"><a href="${L("home")}">Home</a> / Papers</div>
      ${editorialHeading(programme ? PROG[tab] + " Question Papers" : "Question papers", "Browse typed exam papers, internal tests and original scans by semester.")}
      ${programme ? "" : `<div class="progtabs" role="group" aria-label="Mathematics programmes">${Object.entries(PROGRAMME_ROUTES).map(([code, route]) => `<a class="chip${code === tab ? " on" : ""}" href="${L(route)}">${PROG[code]}</a>`).join("")}</div>`}
      <div class="semgrid">${sems.map((s) => {
        const ps = semPapers(tab, s), ys = ps.map((p) => p.year), sc = D.scans.filter((x) => x.prog === tab && x.sem === s && !x.other).length;
        const codes = semCodes(tab, s).filter((c) => c.kind === "s").slice(0, 4).map((c) => c.name).join(" · ");
        return `<a class="semlink${ps.length ? "" : " none"}" href="${L("semester-" + tab.toLowerCase() + "-" + s)}"><span class="big">${ROMAN[s]}</span><b>Semester ${ROMAN[s]}</b><small>${ps.length ? `${ps.length} papers · ${Math.min(...ys)}–${Math.max(...ys)} · ${sc} scans` : sc ? sc + " scans, none typed yet" : "No papers yet"}</small><span class="codes">${esc(codes || "—")}</span></a>`;
      }).join("")}</div>
      ${programme ? archiveBrowser(tab) : ""}
      <p class="muted" style="margin-top:18px;font-size:14px">Syllabus eras: BMC codes until 2016–17, CBCS (CC, DSE, SEC, GE) from 2017–18, NEP (MJMA, MNMA, SEC) from 2025–26. Older papers are in <a href="${L("scans")}">Scans</a>.</p></div>`;
  }
  /* ---------- one semester ---------- */
  function viewSemester(arg) {
    const m = (arg || "").match(/^(bsc|msc)-(\d)$/); if (!m) return notFound();
    const pg = m[1] === "bsc" ? "BSc" : "MSc", s = +m[2]; if (s < 1 || s > NSEM[pg]) return notFound();
    const ps = semPapers(pg, s);
    setMeta(`${PSHORT[pg]} Mathematics Semester ${ROMAN[s]} question papers · VBMath`, `All Visva-Bharati ${PSHORT[pg]} Mathematics Semester ${ROMAN[s]} question papers${ps.length ? ", " + Math.min(...ps.map((p) => p.year)) + "–" + Math.max(...ps.map((p) => p.year)) : ""}, typed and searchable, with scans.`, L("semester-" + arg));
    return `<div class="wrap" style="max-width:1080px"><div class="crumbs"><a href="${L("home")}">Home</a> / <a href="${L("papers")}">Papers</a> / ${PSHORT[pg]} Semester ${ROMAN[s]}</div>
      <div class="pagehead"><div class="eyebrow">${PROG[pg]}</div><h1 style="margin-top:10px">Semester ${ROMAN[s]}</h1>
        <p class="lede">${ps.length ? `${ps.length} papers from ${Math.min(...ps.map((p) => p.year))} to ${Math.max(...ps.map((p) => p.year))}. Pick a paper and a year, or browse by year below.` : "No typed papers for this semester yet."}</p></div>
      ${ps.length ? `<div class="picker"><div><span class="flabel">Paper</span>${pickerParts(pg, s, "sem")[0]}</div><div><span class="flabel">Year</span>${pickerParts(pg, s, "sem")[1]}</div><button class="btn btn-primary" type="button" id="sem-go">Open</button></div>
        <p class="muted" style="font-size:13.5px;margin-bottom:8px">“All years” opens every question of that paper code in Search, newest first.</p>` : `<div class="empty">Have these papers? <a href="${esc(D.C.forms.questions)}" target="_blank" rel="noopener">Send the scans</a>.</div>`}
      ${archiveBrowser(pg, s)}
      <div class="row" style="margin-top:28px">${Array.from({ length: NSEM[pg] }, (_, i) => i + 1).filter((x) => x !== s).map((x) => `<a class="chip" href="${L("semester-" + pg.toLowerCase() + "-" + x)}">Semester ${ROMAN[x]}</a>`).join("")}</div></div>`;
  }
  function bindSemester(arg) {
    const m = (arg || "").match(/^(bsc|msc)-(\d)$/); if (!m) return;
    const pg = m[1] === "bsc" ? "BSc" : "MSc", s = +m[2];
    if ($("#sem-go")) bindPicker(pg, s, "sem", "#sem-go");
    bindArchive();
  }
  const notFound = () => `<div class="wrap"><div class="empty">This page isn't in the archive. <a href="${L("home")}">Go home</a></div></div>`;

  /* ---------- one paper ---------- */
  function viewPaper(key) {
    const pi = D.byKey.get(key); if (pi == null) return notFound();
    const p = D.papers[pi], qs = D.byPaper[pi];
    if (EXAM[p.prog]) return viewCompetitivePaper(p, qs);
    const scans = scansFor(p);
    setMeta(`${pname(p)}${p.title ? " " + p.title : ""} ${p.year} · ${PSHORT[p.prog]} Semester ${ROMAN[p.sem]} · VBMath`, `Visva-Bharati ${PSHORT[p.prog]} Mathematics Semester ${ROMAN[p.sem]} ${p.year} ${p.kind[0] === "i" ? "internal" : "end-semester"} question paper ${p.code || ""}${p.title ? " (" + p.title + ")" : ""}: all ${qs.filter((q) => !q.stem).length} questions typed in LaTeX, with the original scan.`, L("paper-" + key));
    let html = "", sec = null;
    for (const q of qs) {
      if (q.sec !== sec) { sec = q.sec; if (sec) html += `<div class="secthead">${esc(plainOf(sec))}</div>`; }
      html += q.stem ? `<p class="rubric">${esc(qLabel(q))}. ${texToHtml(q.tex)}</p>` : qCard(q, { noSource: true, num: "Q" + qLabel(q) });
    }
    const siblings = D.papers.filter((x) => x.prog === p.prog && x.sem === p.sem && x.year === p.year && x !== p);
    const other = D.papers.filter((x) => x.prog === p.prog && x.code && x.code === p.code && x !== p).sort((a, b) => b.year - a.year);
    const sk = "semester-" + p.prog.toLowerCase() + "-" + p.sem;
    return `<div class="wrap" style="max-width:920px"><div class="crumbs"><a href="${L("home")}">Home</a> / <a href="${L("papers")}">Papers</a> / <a href="${L(sk)}">${esc(semLabel(p))}</a> / ${p.year}</div>
      <header class="exam-head">
        <div class="inst">Visva-Bharati · Department of Mathematics</div>
        <h1>${esc(pname(p))}</h1>
        ${p.title ? `<div class="sub">${esc(p.title)}${p.title_guess ? ' <span class="muted" title="Title taken from the same course in a nearby year">*</span>' : ""}</div>` : ""}
        <div class="fm"><span>${esc(PROG[p.prog])} · Semester ${ROMAN[p.sem]}</span><span>${p.kind[0] === "i" ? "Internal assessment" : "End-semester examination"} · ${p.year}</span>${p.full ? `<span>Full marks ${esc(p.full)}</span>` : ""}</div>
      </header>
      <div class="toolbar">
        <a class="btn btn-primary btn-sm" href="${L("preview-" + key)}">${IC.file} Preview as PDF</a>
        <button class="btn btn-ghost btn-sm" type="button" id="addall">${IC.plus} Collect all</button>
        <button class="btn btn-ghost btn-sm" type="button" id="copypaper">${IC.copy} Copy LaTeX</button>
        ${scans.slice(0, 1).map((s) => `<a class="btn btn-ghost btn-sm" href="${scanUrl(s.id)}" target="_blank" rel="noopener">${IC.scan} Original scan</a>`).join("")}
      </div>
      ${p.rule ? `<p class="rubric">${esc(plainOf(p.rule))}</p>` : ""}
      ${paperSearch()}<div id="paperqs">${html}</div>
      <section class="section" style="margin-top:44px"><div class="shead"><h2 style="font-size:22px;margin:0">Original scans</h2><span class="muted">Opens in Google Drive</span></div>
        ${scans.length ? `<div class="list">${scans.map((s) => `<a class="row" href="${scanUrl(s.id)}" target="_blank" rel="noopener"><span class="t">${esc(s.label)}${s.pages ? ` <span class="muted">· ${s.pages} ${s.pages === 1 ? "page" : "pages"}</span>` : ""}</span><span class="muted">${IC.ext}</span></a>`).join("")}</div>` : `<div class="empty">No scan is linked for this exam yet.</div>`}
      </section>
      ${other.length ? `<section class="section" style="margin-top:36px"><div class="shead"><h2 style="font-size:22px;margin:0">${esc(p.code)} in other years</h2></div><div class="row">${other.map((x) => `<a class="chip" href="${L("paper-" + x.key)}">${x.year}${x.kind[0] === "i" ? " · internal" : ""}</a>`).join("")}</div></section>` : ""}
      ${siblings.length ? `<section class="section" style="margin-top:28px"><div class="shead"><h2 style="font-size:22px;margin:0">Same semester, same year</h2></div><div class="row">${siblings.map((x) => `<a class="chip" href="${L("paper-" + x.key)}">${esc(paperLabel(x))}</a>`).join("")}</div></section>` : ""}
    </div>`;
  }
  function viewCompetitivePaper(p, qs) {
    const name = EXAM[p.prog];
    const source = D.C.paperSources?.[p.prog]?.find((row) => row[4] === p.key);
    const pdf = source?.[2] || p.source, answer = source?.[3] || p.answer_key;
    setMeta(`${name} · ${p.title} · VBMath`, `${qs.length} typed questions from ${name}, ${p.title}.`, L("paper-" + p.key));
    let section = "";
    const cards = qs.map((q, index) => {
      const heading = q.sec === section ? "" : `<h2 class="secthead">${esc(q.sec)}</h2>`;
      section = q.sec;
      return heading + qCard(q, { noSource: true, num: q.qno ? "Q" + q.qno : "Item " + (index + 1) });
    }).join("");
    return `<div class="wrap" style="max-width:920px">
      <div class="crumbs"><a href="${L("home")}">Home</a> / <a href="${L("exams")}">Competitive exams</a> / ${esc(name)}</div>
      <header class="exam-head"><div class="inst">${esc(name)}</div><h1>${esc(p.title)}</h1><div class="fm"><span>${qs.length} typed questions</span></div></header>
      ${p.selection ? `<p class="gnote">These are the questions typed so far, not the whole paper. The original paper has every question.</p>` : ""}
      <div class="toolbar">
        <a class="btn btn-primary btn-sm" href="${L("preview-" + p.key)}">${IC.file} Preview as PDF</a>
        <button class="btn btn-ghost btn-sm" type="button" id="addall">${IC.plus} Collect all</button>
        <button class="btn btn-ghost btn-sm" type="button" id="copypaper">${IC.copy} Copy LaTeX</button>
        ${pdf ? ext(pdf, "Original paper", "btn btn-ghost btn-sm") : ""}
        ${answer ? ext(answer, "Final answer key", "btn btn-ghost btn-sm") : ""}
      </div>
      ${paperSearch()}<div id="paperqs">${cards}</div>
    </div>`;
  }
  const paperSearch = () => `<div class="paper-find"><label for="paper-find">Find in this paper</label>
    <input id="paper-find" type="search" placeholder="Search questions or enter a question number">
    <span class="muted" id="paper-find-count" aria-live="polite"></span></div>`;
  function bindPaper(key) {
    const pi = D.byKey.get(key); if (pi == null) return;
    const qs = D.byPaper[pi].filter((q) => !q.stem);
    const body = $("#paperqs"), input = $("#paper-find");
    typeset(body);
    input?.addEventListener("input", () => {
      const term = input.value.trim(), number = term.match(/^q(?:uestion)?\s*\.?\s*(\d+)(?:\s*\(?([a-z])\)?)?$/i);
      const query = number ? null : scoringQuery(term);
      let count = 0;
      $$(".q", body).forEach((el) => {
        const q = D.byId.get(el.dataset.id);
        el.hidden = number ? (String(q.qno) !== number[1] || !!number[2] && q.part?.toLowerCase() !== number[2].toLowerCase())
          : !!query && searchScore(q, query) < 0;
        if (!el.hidden) count++;
      });
      $$(".secthead", body).forEach((el) => { el.hidden = Boolean(term); });
      $("#paper-find-count").textContent = term ? count + (count === 1 ? " match" : " matches") : "";
    });
    $("#copypaper").addEventListener("click", () => copy(toLatex(D.byPaper[pi], D.papers[pi]), "Paper LaTeX copied"));
    $("#addall").addEventListener("click", () => { let n = 0; qs.forEach((q) => { if (!coll.includes(q.id)) { coll.push(q.id); n++; } }); saveColl(); $$(".q").forEach((c) => { c.classList.add("in"); const b = $(".collect", c); b && b.classList.add("on"); }); toast(n + " added · " + coll.length + " in your collection"); });
  }

  /* ---------- preview (A4) & Question Paper Studio ---------- */
  function renderSheetFromDoc(doc, isPastPaper, selectedQIdx, editingPartId) {
    const h = doc.header || defaultMakerHead();
    const stats = calcDocStats(doc);
    const partStyle = h.partStyle || "paren_alpha";
    const marksStyle = h.marksStyle || "parts_only";
    const isStudio = !isPastPaper;

    let secHtml = "";
    let overallQno = 0;
    const totalQs = (doc.sections && doc.sections[0] && doc.sections[0].questions) ? doc.sections[0].questions.length : 0;

    (doc.sections || []).forEach((sec) => {
      let qListHtml = "";
      (sec.questions || []).forEach((q, qIdx) => {
        if (q.orAlternative) {
          qListHtml += `<li class="pv-or-div"><span>OR</span></li>`;
        } else {
          overallQno++;
        }
        const currentQnum = isStudio ? String(overallQno) : (q.qno || String(overallQno));
        const parts = q.parts || [];
        if (!parts.length) return;

        const isSelected = isStudio && (selectedQIdx === qIdx);
        const hasParts = parts.length > 1;
        const splitTitle = hasParts ? "Split subpart into a new question" : "Split question into subparts (a) and (b)";

        let floatingBarHtml = "";
        if (isStudio) {
          floatingBarHtml = `
            <div class="pv-q-floating-bar" role="toolbar" aria-label="Question actions">
              <div class="pv-q-bar-left">
                <span class="pv-q-badge" title="Question ${esc(currentQnum)}">Q${esc(currentQnum)}</span>
                <span class="pv-act-btn pv-drag-handle" title="Drag to reorder" draggable="true">${IC.grip}<span>Drag</span></span>
              </div>
              <div class="pv-q-bar-right">
                <button type="button" class="pv-act-btn" data-act="q-replace" data-qidx="${qIdx}" title="Search and replace question">${IC.search}<span>Replace</span></button>
                <button type="button" class="pv-act-btn" data-act="q-edit" data-qidx="${qIdx}" title="Edit LaTeX text">${IC.pen}<span>Edit</span></button>
                <span class="pv-bar-sep" aria-hidden="true"></span>
                <button type="button" class="pv-act-btn" data-act="q-add-part" data-qidx="${qIdx}" title="Add a subpart">${IC.plus}<span>Part</span></button>
                <button type="button" class="pv-act-btn" data-act="q-split" data-qidx="${qIdx}" title="${esc(splitTitle)}">${IC.scissors}<span>Split</span></button>
                <button type="button" class="pv-act-btn" data-act="q-add-or" data-qidx="${qIdx}" title="Add alternative question (OR)">${IC.branch}<span>OR</span></button>
                <span class="pv-bar-sep" aria-hidden="true"></span>
                <button type="button" class="pv-act-btn" data-act="q-join-prev" data-qidx="${qIdx}" title="Add to previous question (merge as subpart)" ${qIdx === 0 ? "disabled" : ""}>${IC.mergeUp}<span>To Prev</span></button>
                <button type="button" class="pv-act-btn" data-act="q-join-next" data-qidx="${qIdx}" title="Add to next question (merge as subpart)" ${qIdx === totalQs - 1 ? "disabled" : ""}>${IC.mergeDown}<span>To Next</span></button>
                <span class="pv-bar-sep" aria-hidden="true"></span>
                <button type="button" class="pv-act-btn pv-act-icon" data-act="q-up" data-qidx="${qIdx}" title="Move Up" ${qIdx === 0 ? "disabled" : ""}>${IC.chevronUp}</button>
                <button type="button" class="pv-act-btn pv-act-icon" data-act="q-down" data-qidx="${qIdx}" title="Move Down" ${qIdx === totalQs - 1 ? "disabled" : ""}>${IC.chevronDown}</button>
                <button type="button" class="pv-act-btn pv-act-icon pv-danger" data-act="q-del" data-qidx="${qIdx}" title="Delete Question">${IC.trash}</button>
              </div>
            </div>`;
        }

        if (parts.length === 1 && !parts[0].label) {
          const pt = parts[0];
          const mkStr = pt.marks != null && pt.marks !== "" ? `[${pt.marks}]` : "";
          const isEditing = isStudio && (editingPartId === qIdx + "_0");

          let bodyHtml = "";
          if (isEditing) {
            bodyHtml = `
              <div class="pv-inline-editor">
                <textarea class="pv-inline-ta" data-qidx="${qIdx}" data-pidx="0" placeholder="Question LaTeX...">${esc(pt.tex)}</textarea>
                <div class="pv-inline-editor-acts">
                  <button type="button" class="btn btn-primary btn-sm" data-act="p-save-edit" data-qidx="${qIdx}" data-pidx="0">✓ Done</button>
                </div>
              </div>`;
          } else {
            bodyHtml = `<div class="pv-qbody" data-act="p-edit-text" data-qidx="${qIdx}" data-pidx="0" title="${isStudio ? 'Click to edit LaTeX' : ''}">${texToHtml(pt.tex)}</div>`;
          }

          qListHtml += `
            <li class="pv-q pv-q-single ${isStudio ? 'pv-interactive' : ''} ${isSelected ? 'is-selected' : ''}" data-qid="${esc(q.id || "")}" data-qidx="${qIdx}" ${isStudio ? 'draggable="true"' : ''}>
              ${floatingBarHtml}
              <span class="pv-qno">${esc(currentQnum)}.</span>
              ${bodyHtml}
              <span class="pv-qmk ${isStudio ? 'pv-part-mk-editable' : ''}" data-act="${isStudio ? 'p-edit-marks' : ''}" data-qidx="${qIdx}" data-pidx="0" title="${isStudio ? 'Click to edit marks' : ''}">${esc(mkStr)}</span>
            </li>`;
        } else {
          // Composite question with subparts (e.g. 1 a), 1 b) or 1. (a), (b))
          const totalMk = q._totalMarks;
          const breakdown = q._breakdown;
          let totalMkDisplay = "";
          if (marksStyle === "both") {
            totalMkDisplay = breakdown ? `[${breakdown} = ${totalMk}]` : `[${totalMk}]`;
          } else if (marksStyle === "breakdown") {
            totalMkDisplay = breakdown ? `[${breakdown}]` : `[${totalMk}]`;
          } else if (marksStyle === "total_only") {
            totalMkDisplay = `[${totalMk}]`;
          }

          let partsHtml = "";
          const isDirect = partStyle === "num_alpha";
          parts.forEach((pt, pIdx) => {
            const pMk = (marksStyle === "both" || marksStyle === "parts_only") && pt.marks != null && pt.marks !== "" ? `[${pt.marks}]` : "";
            const isEditing = isStudio && (editingPartId === qIdx + "_" + pIdx);

            let bodyHtml = "";
            if (isEditing) {
              bodyHtml = `
                <div class="pv-inline-editor">
                  <textarea class="pv-inline-ta" data-qidx="${qIdx}" data-pidx="${pIdx}" placeholder="Question LaTeX...">${esc(pt.tex)}</textarea>
                  <div class="pv-inline-editor-acts">
                    <button type="button" class="btn btn-primary btn-sm" data-act="p-save-edit" data-qidx="${qIdx}" data-pidx="${pIdx}">✓ Done</button>
                  </div>
                </div>`;
            } else {
              bodyHtml = `<div class="pv-qbody" data-act="p-edit-text" data-qidx="${qIdx}" data-pidx="${pIdx}" title="${isStudio ? 'Click to edit LaTeX' : ''}">${texToHtml(pt.tex)}</div>`;
            }

            const partToolsHtml = (isStudio && !isEditing && parts.length > 1) ? `
              <span class="pv-part-tools" title="Subpart actions">
                <button type="button" class="pv-part-tool-btn" data-act="p-split" data-qidx="${qIdx}" data-pidx="${pIdx}" title="Split this subpart into a new question">${IC.scissors}<span>Split</span></button>
                <button type="button" class="pv-part-tool-btn danger" data-act="p-del-part" data-qidx="${qIdx}" data-pidx="${pIdx}" title="Delete subpart">${IC.trash}</button>
              </span>` : "";

            if (isDirect) {
              const pLbl = `${currentQnum} ${String.fromCharCode(97 + pIdx)})`;
              partsHtml += `
                <li class="pv-part${isStudio ? ' pv-part-draggable' : ''}" data-pid="${esc(pt.id || "")}" data-qidx="${qIdx}" data-pidx="${pIdx}"${isStudio ? ' draggable="true"' : ''}>
                  ${isStudio ? '<span class="pv-part-grip" title="Drag to move subpart">' + IC.grip + '</span>' : ''}
                  <span class="pv-part-lbl">${esc(pLbl)}</span>
                  ${bodyHtml}
                  <span class="pv-part-mk ${isStudio ? 'pv-part-mk-editable' : ''}" data-act="${isStudio ? 'p-edit-marks' : ''}" data-qidx="${qIdx}" data-pidx="${pIdx}" title="${isStudio ? 'Click to edit marks' : ''}">${esc(pMk)}</span>
                  ${partToolsHtml}
                </li>`;
            } else {
              const pLbl = formatPartLabel(partStyle, currentQnum, pIdx);
              const qPrefix = pIdx === 0 ? `${currentQnum}.` : "";
              partsHtml += `
                <li class="pv-part${isStudio ? ' pv-part-draggable' : ''}" data-pid="${esc(pt.id || "")}" data-qidx="${qIdx}" data-pidx="${pIdx}"${isStudio ? ' draggable="true"' : ''}>
                  ${isStudio ? '<span class="pv-part-grip" title="Drag to move subpart">' + IC.grip + '</span>' : ''}
                  <span class="pv-qno">${esc(qPrefix)}</span>
                  <span class="pv-part-lbl">${esc(pLbl)}</span>
                  ${bodyHtml}
                  <span class="pv-part-mk ${isStudio ? 'pv-part-mk-editable' : ''}" data-act="${isStudio ? 'p-edit-marks' : ''}" data-qidx="${qIdx}" data-pidx="${pIdx}" title="${isStudio ? 'Click to edit marks' : ''}">${esc(pMk)}</span>
                  ${partToolsHtml}
                </li>`;
            }
          });

          qListHtml += `
            <li class="pv-q pv-q-comp ${isStudio ? 'pv-interactive' : ''} ${isSelected ? 'is-selected' : ''}" data-qid="${esc(q.id || "")}" data-qidx="${qIdx}" ${isStudio ? 'draggable="true"' : ''}>
              ${floatingBarHtml}
              <ol class="pv-parts ${isDirect ? "pv-parts-direct" : ""}">
                ${partsHtml}
              </ol>
              ${totalMkDisplay ? `<div class="pv-q-total-row"><span class="pv-q-total">${esc(totalMkDisplay)}</span></div>` : ""}
            </li>`;
        }
      });

      secHtml += `
        ${sec.title ? `<div class="sec-head"><div class="sec-title">${esc(sec.title)}</div>${sec.rule ? `<div class="sec-rule">${esc(sec.rule)}</div>` : ""}</div>` : ""}
        <ol class="qs">${qListHtml}</ol>`;
    });

    return `
      <article class="a4 ${isStudio ? 'studio-sheet' : ''}" id="sheet">
        <div class="ah ${isStudio ? 'studio-ah' : ''}" data-act="${isStudio ? 'open-exam-rules' : ''}" title="${isStudio ? 'Click to edit Exam Details & Rules' : ''}">
          <div class="i" data-v="inst">${esc(h.inst || "")}</div>
          ${h.dept ? `<div class="dept" data-v="dept">${esc(h.dept)}</div>` : ""}
          <div class="e" data-v="exam">${esc(h.exam || "")}</div>
          <div class="p" data-v="paper">${esc(h.paper || "")}</div>
        </div>
        <div class="meta">
          <span data-v="time">${esc(h.time || "")}</span>
          <span data-v="full">${h.full ? "Full Marks: " + esc(h.full) : ""}</span>
        </div>
        ${h.instr ? `<div class="instr" data-v="instr">${esc(h.instr)}</div>` : ""}
        <div class="paper-content">
          ${secHtml}
        </div>
      </article>`;
  }

  function viewPreview(arg) {
    const pi = arg ? D.byKey.get(arg) : null;
    const p = pi != null ? D.papers[pi] : null;

    if (p) {
      // Past paper preview with grouping
      const qs = D.byPaper[pi];
      const doc = qsToDoc(qs, p);
      calcDocStats(doc);
      return `<div class="wrap"><div class="crumbs"><a href="${L("home")}">Home</a> / <a href="${L("paper-" + p.key)}">${esc(pname(p))} ${p.year}</a> / Preview</div>
        <div class="pagehead"><h1>Paper preview</h1><p class="lede">${esc(pname(p))} ${p.year} (${esc(PROG[p.prog])} Sem ${ROMAN[p.sem]}) — University format with grouped questions.</p></div>
        <div class="pv-layout">
          <aside class="pv-side" aria-label="Paper actions">
            <button class="btn btn-primary btn-block" type="button" id="pvprint">${IC.print} Print / Save as PDF</button>
            <button class="btn btn-ghost btn-block" type="button" id="pv-customize">${IC.pen} Customize in Question Maker</button>
            <button class="btn btn-ghost btn-block" type="button" id="pvol">${IC.ext} Compile in Overleaf</button>
            <div class="two"><button class="btn btn-ghost btn-sm" type="button" id="pvtex">${IC.dl} .tex</button><button class="btn btn-ghost btn-sm" type="button" id="pvcopy">${IC.copy} LaTeX</button></div>
            <hr style="border:0;border-top:1px solid var(--rule);margin:4px 0">
            <p class="muted" style="font-size:12.5px;margin:0">Click <b>Customize in Question Maker</b> to edit questions, adjust marks, reorder parts, or set custom choice rules.</p>
          </aside>
          <div class="pv-stage">${renderSheetFromDoc(doc, true)}</div>
        </div></div>`;
    }

    // Question Maker Studio (Full Page View)
    const doc = getMakerDoc();
    const stats = calcDocStats(doc);
    const h = doc.header;

    return `
      <div class="maker-studio">
        <header class="studio-topbar">
          <div class="studio-bar-left">
            <a href="${L("home")}" class="studio-crumb">← Home</a>
            <div class="studio-title-block">
              <h1 class="studio-title">${esc(h.paper || "Question Paper Studio")}</h1>
              <div class="studio-stats" id="studio-stats">
                <span><b id="st-qcount">${stats.totalQuestions}</b> Questions</span>
                <span>·</span>
                <span><b id="st-choice">${stats.choiceX}</b> to answer</span>
                <span>·</span>
                <span>Full Marks: <b id="st-fullmk">${h.full || stats.fullMarks}</b></span>
                <span>·</span>
                <span>Paper Total: <b id="st-papermk">${stats.totalPaperMarks}</b></span>
              </div>
            </div>
          </div>
          <div class="studio-bar-right">
            <button class="btn btn-ghost btn-sm" type="button" id="m-theme-toggle" title="Switch light or dark theme">🌓 Theme</button>
            <button class="btn btn-ghost btn-sm" type="button" id="m-undo" title="Undo (Ctrl+Z)" disabled style="opacity:0.45">↶ Undo</button>
            <button class="btn btn-ghost btn-sm" type="button" id="m-redo" title="Redo (Ctrl+Y)" disabled style="opacity:0.45">↷ Redo</button>
            <button class="btn btn-primary btn-sm" type="button" id="m-add-q">➕ Add Question</button>
            <button class="btn btn-ghost btn-sm" type="button" id="m-open-rules">⚙️ Exam &amp; Rules</button>
            <button class="btn btn-ghost btn-sm" type="button" id="m-sample">📄 Sample Paper</button>
            <button class="btn btn-ghost btn-sm" type="button" id="pvprint">${IC.print} Print / PDF</button>
            <div class="dropdown-wrap" style="position:relative;display:inline-block">
              <button class="btn btn-ghost btn-sm" type="button" id="m-export-btn">🚀 Export ▾</button>
              <div class="studio-menu" id="m-export-menu" style="display:none">
                <button type="button" id="pvol">${IC.ext} Compile in Overleaf</button>
                <button type="button" id="pvtex">${IC.dl} Download .tex</button>
                <button type="button" id="pvcopy">${IC.copy} Copy LaTeX</button>
                <button type="button" id="pvtxt">${IC.copy} Copy Plain Text</button>
                <hr style="border:0;border-top:1px solid var(--rule);margin:4px 0">
                <button type="button" id="m-clear" class="danger" style="color:#d32f2f">${IC.trash} Clear Paper</button>
              </div>
            </div>
          </div>
        </header>

        <main class="studio-canvas">
          <div class="studio-hint-bar">
            <span style="display:inline-flex;align-items:center;gap:6px">
              ${IC.check}
              <span><b>Interactive Sheet:</b> Click any question to open its context bar (edit LaTeX, split, replace, or reorder).</span>
            </span>
            <span class="muted" style="font-size:11.5px">Click canvas to deselect</span>
          </div>
          <div class="pv-stage" id="studio-stage" style="background:transparent;border:0;padding:0;width:100%;display:flex;justify-content:center">
            ${renderSheetFromDoc(doc, false, null, null)}
          </div>
        </main>
      </div>`;
  }

  function openReplaceModal({ targetType, qIdx, pIdx, doc, onReplace }) {
    const existing = $("#replace-modal-scrim");
    if (existing) existing.remove();

    const sec = (doc.sections || [])[0];
    if (!sec) return;
    const q = sec.questions[qIdx];
    if (!q) return;
    const pt = targetType === "part" ? (q.parts && q.parts[pIdx]) : null;

    const initialMarks = targetType === "part" ? (pt ? parseFloat(pt.marks) || 0 : 0) : (q._totalMarks || 10);
    const targetTitle = targetType === "part"
      ? `Part (${pt?.label || "a"}) of Question ${q.qno || qIdx + 1}`
      : `Question ${q.qno || qIdx + 1}`;

    const scrim = document.createElement("div");
    scrim.id = "replace-modal-scrim";
    scrim.className = "replace-modal-scrim" + (window.innerWidth >= 1024 ? " is-sidebar" : "");

    const studioEl = $(".maker-studio");
    if (scrim.classList.contains("is-sidebar") && studioEl) {
      studioEl.classList.add("has-rep-sidebar");
    }

    scrim.innerHTML = `
      <div class="replace-modal" role="dialog" aria-modal="true" aria-labelledby="rep-title">
        <div class="replace-modal-head">
          <h3 id="rep-title">🔍 Search Replacement ${targetType === "part" ? "Subpart" : "Question"}</h3>
          <div style="display:flex;align-items:center;gap:6px">
            <button class="mq-iconbtn" type="button" id="rep-mode-toggle" title="Toggle Sidebar / Center Window">🗗</button>
            <button class="mq-iconbtn" type="button" id="rep-close" title="Close">✕</button>
          </div>
        </div>
        <div class="replace-modal-body">
          <div style="font-size:13px;color:var(--ink-2);background:var(--paper-2);padding:8px 12px;border-radius:8px;border:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center">
            <span>Target: <b>${esc(targetTitle)}</b></span>
            <span>Target Marks: <span class="mq-mk-pill">${initialMarks ? initialMarks + " marks" : "Any"}</span></span>
          </div>

          <div class="replace-filter-bar">
            <input type="search" id="rep-query" placeholder="Type topic, theorem, or keyword (e.g. Cauchy, Riemann, continuous)..." autofocus>
            <select id="rep-marks">
              <option value="all">Any marks</option>
              ${initialMarks ? `<option value="${initialMarks}" selected>Target marks (${initialMarks})</option>` : ""}
              <option value="2">2 marks</option>
              <option value="3">3 marks</option>
              <option value="4">4 marks</option>
              <option value="5">5 marks</option>
              <option value="6">6 marks</option>
              <option value="8">8 marks</option>
              <option value="10">10 marks</option>
            </select>
            <select id="rep-sem">
              <option value="">All Semesters</option>
              <option value="1">Semester I</option>
              <option value="2">Semester II</option>
              <option value="3">Semester III</option>
              <option value="4">Semester IV</option>
              <option value="5">Semester V</option>
              <option value="6">Semester VI</option>
            </select>
          </div>

          <div id="rep-count" style="font-size:12.5px;color:var(--ink-3);margin-top:-4px"></div>
          <div class="replace-results" id="rep-results"></div>
        </div>
      </div>`;

    document.body.appendChild(scrim);

    const close = () => {
      scrim.remove();
      if (studioEl) studioEl.classList.remove("has-rep-sidebar");
      document.removeEventListener("keydown", onKeyDown);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    $("#rep-close").onclick = close;
    const modeToggle = $("#rep-mode-toggle");
    if (modeToggle) {
      modeToggle.onclick = () => {
        scrim.classList.toggle("is-sidebar");
        if (studioEl) {
          studioEl.classList.toggle("has-rep-sidebar", scrim.classList.contains("is-sidebar"));
        }
      };
    }
    scrim.addEventListener("click", (e) => {
      if (e.target === scrim) close();
    });

    const qInput = $("#rep-query");
    const mSelect = $("#rep-marks");
    const sSelect = $("#rep-sem");
    const resContainer = $("#rep-results");
    const countEl = $("#rep-count");

    const doSearch = () => {
      const qVal = qInput.value.trim().toLowerCase();
      const mVal = mSelect.value;
      const sVal = sSelect.value;

      const qTokens = searchWords(qVal).split(" ").filter(Boolean);

      let matches = [];
      for (const item of D.Q) {
        if (item.stem) continue;
        const p = D.papers[item.p];
        if (!p) continue;

        if (sVal && String(p.sem) !== sVal) continue;
        if (mVal !== "all") {
          const targetM = parseFloat(mVal);
          if (item.marks !== targetM) continue;
        }

        if (!qTokens.every((token) => item.search.some((field) => field.includes(token)))) continue;

        matches.push(item);
        if (matches.length >= 35) break;
      }

      countEl.textContent = `Found ${matches.length} matching question${matches.length === 1 ? "" : "s"}${matches.length >= 35 ? " (showing top 35)" : ""}:`;

      if (!matches.length) {
        resContainer.innerHTML = `<div class="empty" style="padding:24px 10px"><p>No matching questions found. Try removing filters or searching a simpler keyword.</p></div>`;
        return;
      }

      resContainer.innerHTML = matches.map((item) => {
        const p = D.papers[item.p];
        const paperTitle = p ? `${pname(p)} ${p.year} (Sem ${ROMAN[p.sem]})` : "";
        const qTag = `Q${item.qno}${item.part ? ` (${item.part})` : ""}`;
        const mkTag = item.marks != null ? `${item.marks} marks` : "";
        return `
          <div class="replace-card" data-idx="${item.i}">
            <div class="replace-card-head">
              <div>
                <strong>${esc(paperTitle)}</strong>
                <span class="muted" style="margin-left:6px">${esc(qTag)}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                ${mkTag ? `<span class="mq-mk-pill">${esc(mkTag)}</span>` : ""}
                <button class="btn btn-primary btn-sm" type="button" data-act="apply-rep" data-idx="${item.i}">✓ Replace with this</button>
              </div>
            </div>
            <div class="replace-card-math">${texToHtml(item.tex)}</div>
          </div>`;
      }).join("");

      typeset(resContainer);
    };

    qInput.addEventListener("input", doSearch);
    mSelect.addEventListener("change", doSearch);
    sSelect.addEventListener("change", doSearch);

    resContainer.addEventListener("click", (e) => {
      const applyBtn = e.target.closest('[data-act="apply-rep"]');
      if (!applyBtn) return;
      const idx = +applyBtn.dataset.idx;
      const chosen = D.Q[idx];
      if (!chosen) return;

      onReplace(chosen);
      close();
    });

    doSearch();
    qInput.focus();
  }

  function openExamRulesModal(doc, onSave) {
    const existing = $("#exam-rules-scrim");
    if (existing) existing.remove();

    const stats = calcDocStats(doc);
    const h = doc.header;

    const scrim = document.createElement("div");
    scrim.id = "exam-rules-scrim";
    scrim.className = "exam-modal-scrim";

    scrim.innerHTML = `
      <div class="exam-modal" role="dialog" aria-modal="true" aria-labelledby="erm-title">
        <div class="exam-modal-head">
          <h3 id="erm-title">⚙️ Examination Details &amp; Choice Rules</h3>
          <button class="mq-iconbtn" type="button" id="erm-close">✕</button>
        </div>
        <div class="exam-modal-body">
          <div><span class="flabel">Institution</span><input type="text" id="em-inst" value="${esc(h.inst || "")}"></div>
          <div><span class="flabel">Department</span><input type="text" id="em-dept" value="${esc(h.dept || "")}" placeholder="Department of Mathematics"></div>
          <div><span class="flabel">Examination</span><input type="text" id="em-exam" value="${esc(h.exam || "")}"></div>
          <div><span class="flabel">Paper / Subject</span><input type="text" id="em-paper" value="${esc(h.paper || "")}"></div>
          <div class="two">
            <div><span class="flabel">Time Allowed</span><input type="text" id="em-time" value="${esc(h.time || "")}"></div>
            <div><span class="flabel">Full Marks</span><input type="text" id="em-full" value="${esc(h.full || "")}"></div>
          </div>
          <div class="rule-box">
            <span class="flabel" style="margin:0">Choice Rule &amp; Total Marks</span>
            <div>
              <select id="em-rule-type">
                <option value="choice" ${h.ruleType === "choice" ? "selected" : ""}>Answer any X out of Y questions</option>
                <option value="compulsory_plus" ${h.ruleType === "compulsory_plus" ? "selected" : ""}>Question 1 compulsory + any X from rest</option>
                <option value="all" ${h.ruleType === "all" ? "selected" : ""}>Answer all questions</option>
                <option value="custom" ${h.ruleType === "custom" ? "selected" : ""}>Custom rubric text</option>
              </select>
            </div>
            <div class="rule-choice-row" id="em-choice-row" ${h.ruleType === "all" || h.ruleType === "custom" ? 'style="display:none"' : ""}>
              <span>Answer</span>
              <input type="number" id="em-choice-x" min="1" max="${Math.max(1, stats.choiceY)}" value="${h.choiceX}">
              <span>out of <b>${stats.choiceY}</b> questions</span>
            </div>
            <div class="auto-full-row">
              <label style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                <input type="checkbox" id="em-auto-full" ${h.autoFull ? "checked" : ""}> Auto-calculate Full Marks
              </label>
            </div>
          </div>
          <div class="two">
            <div>
              <span class="flabel">Subpart Style</span>
              <select id="em-part-style">
                <option value="paren_alpha" ${h.partStyle === "paren_alpha" ? "selected" : ""}>1. (a), (b) (Parentheses - Standard)</option>
                <option value="num_alpha" ${h.partStyle === "num_alpha" ? "selected" : ""}>1 a), 1 b) (Direct)</option>
                <option value="alpha_paren" ${h.partStyle === "alpha_paren" ? "selected" : ""}>1. a), b) (Letter)</option>
                <option value="roman_paren" ${h.partStyle === "roman_paren" ? "selected" : ""}>1. (i), (ii) (Roman)</option>
              </select>
            </div>
            <div>
              <span class="flabel">Marks Display</span>
              <select id="em-marks-style">
                <option value="parts_only" ${h.marksStyle === "parts_only" ? "selected" : ""}>Part marks only ([5], [5]) (Standard)</option>
                <option value="both" ${h.marksStyle === "both" ? "selected" : ""}>Parts &amp; Total ([5],[5] &amp; [10])</option>
                <option value="breakdown" ${h.marksStyle === "breakdown" ? "selected" : ""}>Breakdown only ([5+5])</option>
                <option value="total_only" ${h.marksStyle === "total_only" ? "selected" : ""}>Total only ([10])</option>
              </select>
            </div>
          </div>
          <div>
            <span class="flabel">Instructions / Rubric</span>
            <textarea id="em-instr" rows="3">${esc(h.instr || "")}</textarea>
          </div>
        </div>
        <div class="exam-modal-foot">
          <button class="btn btn-ghost" type="button" id="erm-cancel">Cancel</button>
          <button class="btn btn-primary" type="button" id="erm-save">Save &amp; Apply</button>
        </div>
      </div>`;

    document.body.appendChild(scrim);

    const close = () => { scrim.remove(); document.removeEventListener("keydown", onKeyDown); };
    const onKeyDown = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKeyDown);

    $("#erm-close").onclick = close;
    $("#erm-cancel").onclick = close;
    scrim.addEventListener("click", (e) => { if (e.target === scrim) close(); });

    const ruleSel = $("#em-rule-type");
    if (ruleSel) {
      ruleSel.addEventListener("change", () => {
        const choiceRow = $("#em-choice-row");
        if (choiceRow) choiceRow.style.display = (ruleSel.value === "all" || ruleSel.value === "custom") ? "none" : "flex";
      });
    }

    $("#erm-save").onclick = () => {
      h.inst = $("#em-inst").value;
      h.dept = $("#em-dept").value;
      h.exam = $("#em-exam").value;
      h.paper = $("#em-paper").value;
      h.time = $("#em-time").value;
      h.full = $("#em-full").value;
      h.ruleType = $("#em-rule-type").value;
      h.choiceX = parseInt($("#em-choice-x").value, 10) || 1;
      h.autoFull = $("#em-auto-full").checked;
      h.partStyle = $("#em-part-style").value;
      h.marksStyle = $("#em-marks-style").value;
      h.instr = $("#em-instr").value;
      calcDocStats(doc);
      onSave();
      close();
    };
  }

  let studioEvents;
  function bindPreview(arg) {
    const pi = arg ? D.byKey.get(arg) : null;
    const p = pi != null ? D.papers[pi] : null;

    if (p) {
      // Past paper preview binding
      const qs = D.byPaper[pi];
      const doc = qsToDoc(qs, p);
      typeset($("#sheet"));

      $("#pvprint").onclick = () => { try { window.print(); } catch (e) {} };
      $("#pvol").onclick = () => overleaf(toLatex(doc));
      $("#pvtex").onclick = () => download((p ? p.key : "vbmath-paper") + ".tex", toLatex(doc));
      $("#pvcopy").onclick = () => copy(toLatex(doc), "LaTeX copied");

      const custBtn = $("#pv-customize");
      if (custBtn) {
        custBtn.onclick = () => {
          saveMakerDoc(doc);
          if (HASH) go("preview");
          else { history.pushState({}, "", L("preview")); route(); }
          toast("Paper loaded into Question Paper Studio");
        };
      }
      return;
    }

    // Question Maker Studio Binding (Full-Page Canvas)
    let doc = getMakerDoc();
    let selectedQIdx = null;
    let editingPartId = null;

    // Undo / Redo history
    let undoStack = [];
    let redoStack = [];

    const pushUndo = () => {
      undoStack.push(JSON.stringify(doc));
      if (undoStack.length > 40) undoStack.shift();
      redoStack = [];
      updateUndoRedoBtns();
    };

    const doUndo = () => {
      if (!undoStack.length) return;
      redoStack.push(JSON.stringify(doc));
      doc = JSON.parse(undoStack.pop());
      saveMakerDoc(doc);
      refreshStudio(null, null);
      updateUndoRedoBtns();
      toast("Undone ↶");
    };

    const doRedo = () => {
      if (!redoStack.length) return;
      undoStack.push(JSON.stringify(doc));
      doc = JSON.parse(redoStack.pop());
      saveMakerDoc(doc);
      refreshStudio(null, null);
      updateUndoRedoBtns();
      toast("Redone ↷");
    };

    const updateUndoRedoBtns = () => {
      const uBtn = $("#m-undo");
      const rBtn = $("#m-redo");
      if (uBtn) {
        uBtn.disabled = undoStack.length === 0;
        uBtn.style.opacity = undoStack.length === 0 ? "0.45" : "1";
      }
      if (rBtn) {
        rBtn.disabled = redoStack.length === 0;
        rBtn.style.opacity = redoStack.length === 0 ? "0.45" : "1";
      }
    };

    studioEvents = new AbortController();
    const { signal } = studioEvents;
    signal.addEventListener("abort", () => {
      $("#rep-close")?.click();
      $("#erm-close")?.click();
    });
    const thBtn = $("#m-theme-toggle");
    if (thBtn) thBtn.onclick = () => $("#theme")?.click();

    const uBtn = $("#m-undo");
    if (uBtn) uBtn.onclick = doUndo;
    const rBtn = $("#m-redo");
    if (rBtn) rBtn.onclick = doRedo;

    document.addEventListener("keydown", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          doRedo();
        } else {
          e.preventDefault();
          doUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        doRedo();
      }
    }, { signal });

    const refreshStudio = (newSelectedQIdx, newEditingPartId) => {
      if (newSelectedQIdx !== undefined) selectedQIdx = newSelectedQIdx;
      if (newEditingPartId !== undefined) editingPartId = newEditingPartId;

      const stats = calcDocStats(doc);
      const stage = $("#studio-stage");
      if (stage) {
        stage.innerHTML = renderSheetFromDoc(doc, false, selectedQIdx, editingPartId);
        typeset(stage);
      }

      const qCountEl = $("#st-qcount"); if (qCountEl) qCountEl.textContent = stats.totalQuestions;
      const choiceEl = $("#st-choice"); if (choiceEl) choiceEl.textContent = stats.choiceX;
      const fullEl = $("#st-fullmk"); if (fullEl) fullEl.textContent = doc.header.full || stats.fullMarks;
      const paperMkEl = $("#st-papermk"); if (paperMkEl) paperMkEl.textContent = stats.totalPaperMarks;

      if (editingPartId) {
        const ta = stage && stage.querySelector(".pv-inline-ta");
        if (ta) {
          ta.focus();
          ta.setSelectionRange(ta.value.length, ta.value.length);
        }
      }
    };

    typeset($("#sheet"));

    // Studio Topbar Actions
    const addQBtn = $("#m-add-q");
    if (addQBtn) {
      addQBtn.onclick = () => {
        const sec = (doc.sections || [])[0];
        if (!sec) return;
        pushUndo();
        sec.questions.push({
          id: "mq_" + Date.now(),
          qno: "",
          orAlternative: false,
          parts: [{ id: "pt_" + Date.now(), label: "", marks: 5, tex: "State and prove the theorem." }]
        });
        saveMakerDoc(doc);
        refreshStudio(sec.questions.length - 1, null);
        toast("Question added at the end");
        const newEl = document.querySelector(`[data-qidx="${sec.questions.length - 1}"]`);
        if (newEl) newEl.scrollIntoView({ behavior: "smooth", block: "center" });
      };
    }

    const rulesBtn = $("#m-open-rules");
    if (rulesBtn) {
      rulesBtn.onclick = () => openExamRulesModal(doc, () => { pushUndo(); saveMakerDoc(doc); refreshStudio(); toast("Exam & Rules updated"); });
    }

    const sampleBtn = $("#m-sample");
    if (sampleBtn) {
      sampleBtn.onclick = () => {
        pushUndo();
        doc = sampleMakerPaper();
        saveMakerDoc(doc);
        refreshStudio(null, null);
        toast("Loaded standard 8-question university exam paper");
      };
    }

    const exportBtn = $("#m-export-btn");
    const exportMenu = $("#m-export-menu");
    if (exportBtn && exportMenu) {
      exportBtn.onclick = (e) => {
        e.stopPropagation();
        exportMenu.style.display = exportMenu.style.display === "none" ? "flex" : "none";
      };
      document.addEventListener("click", () => {
        exportMenu.style.display = "none";
      }, { signal });
    }

    const clearBtn = $("#m-clear");
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (confirm("Are you sure you want to clear all questions in this paper?")) {
          pushUndo();
          const sec = (doc.sections || [])[0];
          if (sec) sec.questions = [];
          saveMakerDoc(doc);
          refreshStudio(null, null);
          toast("Paper cleared");
        }
      };
    }

    // Export buttons
    $("#pvprint").onclick = () => { try { window.print(); } catch (e) {} };
    $("#pvol").onclick = () => overleaf(toLatex(doc));
    $("#pvtex").onclick = () => download("vbmath-exam-paper.tex", toLatex(doc));
    $("#pvcopy").onclick = () => copy(toLatex(doc), "LaTeX copied");
    const pvtxt = $("#pvtxt");
    if (pvtxt) {
      pvtxt.onclick = () => {
        const lines = [`${doc.header.inst} - ${doc.header.exam}`, `${doc.header.paper}`, `${doc.header.time} | Full Marks: ${doc.header.full}`, "", doc.header.instr, ""];
        let n = 0;
        (doc.sections[0]?.questions || []).forEach((q) => {
          if (q.orAlternative) { lines.push("\n--- OR ---\n"); return; }
          n++;
          if (q.parts.length === 1 && !q.parts[0].label) {
            lines.push(`${n}. ${plainOf(q.parts[0].tex)}  [${q.parts[0].marks}]`);
          } else {
            lines.push(`${n}. [${q._breakdown} = ${q._totalMarks} marks]`);
            q.parts.forEach((pt, i) => {
              lines.push(`   ${formatPartLabel(doc.header.partStyle, n, i)} ${plainOf(pt.tex)}  [${pt.marks}]`);
            });
          }
          lines.push("");
        });
        copy(lines.join("\n"), "Text copied");
      };
    }

    // Canvas & Sheet Click Delegation
    const canvasEl = $(".studio-canvas");
    if (canvasEl) {
      canvasEl.addEventListener("click", (e) => {
        const sec = (doc.sections || [])[0];
        if (!sec) return;

        // If clicked inside an active inline editor, stay in edit mode!
        if (e.target.closest(".pv-inline-editor")) {
          if (!e.target.closest('[data-act="p-save-edit"]')) {
            return;
          }
        }

        // Check if clicked the Exam & Rules header
        const ah = e.target.closest('[data-act="open-exam-rules"]');
        if (ah) {
          openExamRulesModal(doc, () => { saveMakerDoc(doc); refreshStudio(); toast("Exam & Rules updated"); });
          return;
        }

        const actBtn = e.target.closest("[data-act]");
        const act = actBtn ? actBtn.dataset.act : null;

        if (act) {
          e.stopPropagation();
          const qIdx = actBtn.dataset.qidx != null ? +actBtn.dataset.qidx : (+actBtn.closest(".pv-q")?.dataset.qidx || -1);
          const pIdx = actBtn.dataset.pidx != null ? +actBtn.dataset.pidx : 0;
          const q = qIdx >= 0 ? sec.questions[qIdx] : null;
          const pt = q && q.parts ? q.parts[pIdx] : null;

          if (act === "q-replace" && qIdx >= 0) {
            openReplaceModal({
              targetType: "question",
              qIdx,
              doc,
              onReplace: (chosen) => {
                pushUndo();
                const siblings = D.byPaper[chosen.p]?.filter((sq) => sq.qno === chosen.qno) || [];
                if (siblings.length > 1) {
                  q.parts = siblings.map((sq) => ({
                    id: "pt_" + sq.id,
                    label: sq.part || "",
                    marks: sq.marks != null ? sq.marks : 5,
                    tex: sq.tex
                  }));
                } else {
                  q.parts = [{
                    id: "pt_" + chosen.id,
                    label: chosen.part || "",
                    marks: chosen.marks != null ? chosen.marks : 5,
                    tex: chosen.tex
                  }];
                }
                saveMakerDoc(doc);
                refreshStudio(qIdx, null);
                toast(`Question replaced with ${D.papers[chosen.p]?.title || "question"}`);
              }
            });
            return;
          }

          if (act === "p-replace" && q && pt) {
            openReplaceModal({
              targetType: "part",
              qIdx,
              pIdx,
              doc,
              onReplace: (chosen) => {
                pushUndo();
                pt.tex = chosen.tex;
                if (chosen.marks != null) pt.marks = chosen.marks;
                saveMakerDoc(doc);
                refreshStudio(qIdx, null);
                toast(`Subpart replaced with ${D.papers[chosen.p]?.title || "question"}`);
              }
            });
            return;
          }

          if (act === "q-edit" && qIdx >= 0) {
            refreshStudio(qIdx, qIdx + "_0");
            return;
          }

          if (act === "p-edit-text" && qIdx >= 0) {
            refreshStudio(qIdx, qIdx + "_" + pIdx);
            return;
          }

          if (act === "p-save-edit" && q && pt) {
            const ta = canvasEl.querySelector(`.pv-inline-ta[data-qidx="${qIdx}"][data-pidx="${pIdx}"]`);
            if (ta) {
              pushUndo();
              pt.tex = ta.value;
            }
            saveMakerDoc(doc);
            refreshStudio(qIdx, null);
            toast("Question text updated");
            return;
          }

          if (act === "p-edit-marks" && q && pt) {
            const curM = pt.marks != null ? String(pt.marks) : "";
            const newM = prompt("Enter marks for this question part:", curM);
            if (newM !== null) {
              pushUndo();
              pt.marks = newM.trim();
              saveMakerDoc(doc);
              refreshStudio(qIdx, null);
            }
            return;
          }

          if (act === "q-add-part" && q) {
            pushUndo();
            const nextLetter = String.fromCharCode(97 + q.parts.length);
            q.parts.push({ id: "pt_" + Date.now(), label: nextLetter, marks: 2, tex: "Evaluate the integral." });
            if (!q.parts[0].label) q.parts[0].label = "a";
            saveMakerDoc(doc);
            refreshStudio(qIdx, null);
            toast("Subpart added");
            return;
          }

          if (act === "q-add-or" && q) {
            pushUndo();
            sec.questions.splice(qIdx + 1, 0, {
              id: "mq_" + Date.now(),
              qno: q.qno,
              orAlternative: true,
              parts: [
                { id: "pt_" + Date.now(), label: "a", marks: 3, tex: "Alternative formulation of the problem." },
                { id: "pt_" + (Date.now() + 1), label: "b", marks: 2, tex: "Show that the series converges." }
              ]
            });
            saveMakerDoc(doc);
            refreshStudio(qIdx + 1, null);
            toast("OR alternative question added");
            return;
          }

          if (act === "q-split" && q) {
            pushUndo();
            if (q.parts && q.parts.length > 1) {
              const [removed] = q.parts.splice(q.parts.length - 1, 1);
              removed.label = "";
              if (q.parts.length === 1) {
                q.parts[0].label = "";
              } else {
                q.parts.forEach((p, idx) => { p.label = String.fromCharCode(97 + idx); });
              }
              sec.questions.splice(qIdx + 1, 0, {
                id: "mq_" + Date.now(),
                qno: "",
                orAlternative: false,
                parts: [removed]
              });
              saveMakerDoc(doc);
              refreshStudio(qIdx + 1, null);
              toast("Subpart split into a new question");
            } else if (q.parts && q.parts.length === 1) {
              const curM = parseFloat(q.parts[0].marks) || 10;
              const m1 = Math.ceil(curM / 2);
              const m2 = Math.floor(curM / 2);
              q.parts[0].label = "a";
              q.parts[0].marks = m1;
              q.parts.push({
                id: "pt_" + Date.now(),
                label: "b",
                marks: m2,
                tex: "Show that the result holds in the general setting."
              });
              saveMakerDoc(doc);
              refreshStudio(qIdx, null);
              toast("Question split into subparts (a) and (b)");
            }
            return;
          }

          if (act === "q-join-prev" && qIdx > 0 && q) {
            const prevQ = sec.questions[qIdx - 1];
            if (prevQ && prevQ.parts) {
              pushUndo();
              if (prevQ.parts.length === 1 && !prevQ.parts[0].label) {
                prevQ.parts[0].label = "a";
              }
              q.parts.forEach((pt) => {
                pt.label = String.fromCharCode(97 + prevQ.parts.length);
                prevQ.parts.push(pt);
              });
              sec.questions.splice(qIdx, 1);
              saveMakerDoc(doc);
              refreshStudio(qIdx - 1, null);
              toast(`Merged into Question ${qIdx}`);
            }
            return;
          }

          if (act === "q-join-next" && qIdx < sec.questions.length - 1 && q) {
            const nextQ = sec.questions[qIdx + 1];
            if (nextQ && nextQ.parts) {
              pushUndo();
              const combined = [...q.parts, ...nextQ.parts];
              combined.forEach((pt, i) => {
                pt.label = String.fromCharCode(97 + i);
              });
              nextQ.parts = combined;
              sec.questions.splice(qIdx, 1);
              saveMakerDoc(doc);
              refreshStudio(qIdx, null);
              toast(`Merged into Question ${qIdx + 1}`);
            }
            return;
          }

          if (act === "q-up" && qIdx > 0) {
            pushUndo();
            [sec.questions[qIdx], sec.questions[qIdx - 1]] = [sec.questions[qIdx - 1], sec.questions[qIdx]];
            saveMakerDoc(doc);
            refreshStudio(qIdx - 1, null);
            return;
          }

          if (act === "q-down" && qIdx < sec.questions.length - 1) {
            pushUndo();
            [sec.questions[qIdx], sec.questions[qIdx + 1]] = [sec.questions[qIdx + 1], sec.questions[qIdx]];
            saveMakerDoc(doc);
            refreshStudio(qIdx + 1, null);
            return;
          }

          if (act === "q-del" && qIdx >= 0) {
            pushUndo();
            sec.questions.splice(qIdx, 1);
            saveMakerDoc(doc);
            refreshStudio(Math.max(0, qIdx - 1), null);
            toast("Question removed");
            return;
          }

          if (act === "p-split" && q && q.parts && q.parts.length > 1) {
            pushUndo();
            const splitIdx = (pIdx >= 0 && pIdx < q.parts.length) ? pIdx : (q.parts.length - 1);
            const [removed] = q.parts.splice(splitIdx, 1);
            removed.label = "";
            if (q.parts.length === 1) {
              q.parts[0].label = "";
            } else {
              q.parts.forEach((p, idx) => { p.label = String.fromCharCode(97 + idx); });
            }
            const insertIdx = (splitIdx === 0) ? qIdx : (qIdx + 1);
            sec.questions.splice(insertIdx, 0, {
              id: "mq_" + Date.now(),
              qno: "",
              orAlternative: false,
              parts: [removed]
            });
            saveMakerDoc(doc);
            refreshStudio(insertIdx, null);
            toast("Subpart split into a new question");
            return;
          }

          if (act === "p-move-prev" && q && pIdx >= 0 && qIdx > 0) {
            const prevQ = sec.questions[qIdx - 1];
            if (prevQ && prevQ.parts) {
              pushUndo();
              const [moved] = q.parts.splice(pIdx, 1);
              if (prevQ.parts.length === 1 && !prevQ.parts[0].label) prevQ.parts[0].label = "a";
              moved.label = String.fromCharCode(97 + prevQ.parts.length);
              prevQ.parts.push(moved);
              if (!q.parts.length) {
                sec.questions.splice(qIdx, 1);
              } else if (q.parts.length === 1) {
                q.parts[0].label = "";
              } else {
                q.parts.forEach((p, idx) => { p.label = String.fromCharCode(97 + idx); });
              }
              saveMakerDoc(doc);
              refreshStudio(qIdx - 1, null);
              toast(`Subpart moved to Question ${qIdx}`);
            }
            return;
          }

          if (act === "p-move-next" && q && pIdx >= 0 && qIdx < sec.questions.length - 1) {
            const nextQ = sec.questions[qIdx + 1];
            if (nextQ && nextQ.parts) {
              pushUndo();
              const [moved] = q.parts.splice(pIdx, 1);
              if (nextQ.parts.length === 1 && !nextQ.parts[0].label) nextQ.parts[0].label = "a";
              nextQ.parts.unshift(moved);
              nextQ.parts.forEach((p, idx) => { p.label = String.fromCharCode(97 + idx); });
              if (!q.parts.length) {
                sec.questions.splice(qIdx, 1);
              } else if (q.parts.length === 1) {
                q.parts[0].label = "";
              } else {
                q.parts.forEach((p, idx) => { p.label = String.fromCharCode(97 + idx); });
              }
              saveMakerDoc(doc);
              refreshStudio(qIdx, null);
              toast(`Subpart moved to Question ${qIdx + 1}`);
            }
            return;
          }

          if (act === "p-del-part" && q && pIdx >= 0) {
            pushUndo();
            q.parts.splice(pIdx, 1);
            if (!q.parts.length) sec.questions.splice(qIdx, 1);
            else if (q.parts.length === 1) q.parts[0].label = "";
            saveMakerDoc(doc);
            refreshStudio(qIdx, null);
            toast("Subpart removed");
            return;
          }
        }

        // Selection handling: clicking on a question selects it, clicking outside deselects
        const qEl = e.target.closest(".pv-q");
        if (qEl) {
          const qIdx = +qEl.dataset.qidx;
          if (selectedQIdx !== qIdx) {
            refreshStudio(qIdx, null);
          }
        } else {
          // Clicked outside on the canvas
          if (selectedQIdx != null || editingPartId != null) {
            refreshStudio(null, null);
          }
        }
      });

      // Keydown in inline editor: Ctrl+Enter saves, Escape cancels
      canvasEl.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const ta = e.target.closest(".pv-inline-ta");
          if (ta) {
            refreshStudio(selectedQIdx, null);
            return;
          }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          const ta = e.target.closest(".pv-inline-ta");
          if (ta) {
            const qIdx = +ta.dataset.qidx;
            const pIdx = +ta.dataset.pidx;
            const sec = (doc.sections || [])[0];
            const q = sec && sec.questions[qIdx];
            const pt = q && q.parts ? q.parts[pIdx] : null;
            if (pt) {
              pushUndo();
              pt.tex = ta.value;
              saveMakerDoc(doc);
              refreshStudio(qIdx, null);
              toast("Question text updated");
            }
          }
        }
      });

      // Right-Click Context Menu
      let contextMenuEl = null;
      const closeContextMenu = () => {
        if (contextMenuEl) {
          contextMenuEl.remove();
          contextMenuEl = null;
        }
      };
      signal.addEventListener("abort", closeContextMenu);
      document.addEventListener("click", closeContextMenu, { signal });
      document.addEventListener("contextmenu", (e) => {
        if (!e.target.closest(".studio-canvas")) closeContextMenu();
      }, { signal });

      canvasEl.addEventListener("contextmenu", (e) => {
        const qEl = e.target.closest(".pv-q");
        if (!qEl) return;
        e.preventDefault();
        e.stopPropagation();
        closeContextMenu();

        const qIdx = +qEl.dataset.qidx;
        selectedQIdx = qIdx;
        $$(".pv-q").forEach((c, idx) => c.classList.toggle("is-selected", idx === qIdx));

        const sec = (doc.sections || [])[0];
        const q = sec && sec.questions[qIdx];
        const totalQs = sec?.questions?.length || 0;
        const pEl = e.target.closest(".pv-part");
        const pIdx = pEl && pEl.dataset.pidx != null ? +pEl.dataset.pidx : -1;
        const hasParts = q && q.parts && q.parts.length > 1;

        let partSectionHtml = "";
        if (hasParts && pIdx >= 0) {
          const ptLabel = q.parts[pIdx]?.label || String.fromCharCode(97 + pIdx);
          partSectionHtml = `
            <hr>
            <div class="studio-cm-label">Subpart (${esc(ptLabel)})</div>
            <button type="button" data-act="p-split" data-qidx="${qIdx}" data-pidx="${pIdx}">${IC.scissors}<span>Split Part (${esc(ptLabel)}) into New Question</span></button>
            ${qIdx > 0 ? `<button type="button" data-act="p-move-prev" data-qidx="${qIdx}" data-pidx="${pIdx}">${IC.mergeUp}<span>Move Part (${esc(ptLabel)}) to Question ${qIdx}</span></button>` : ""}
            ${qIdx < totalQs - 1 ? `<button type="button" data-act="p-move-next" data-qidx="${qIdx}" data-pidx="${pIdx}">${IC.mergeDown}<span>Move Part (${esc(ptLabel)}) to Question ${qIdx + 2}</span></button>` : ""}
            <button type="button" class="danger" data-act="p-del-part" data-qidx="${qIdx}" data-pidx="${pIdx}">${IC.trash}<span>Delete Subpart (${esc(ptLabel)})</span></button>
          `;
        }

        const menu = document.createElement("div");
        menu.className = "studio-context-menu";
        const x = Math.min(e.clientX, window.innerWidth - 240);
        const y = Math.min(e.clientY, window.innerHeight - 360);
        menu.style.left = x + "px";
        menu.style.top = y + "px";

        menu.innerHTML = `
          <button type="button" data-act="q-replace" data-qidx="${qIdx}">${IC.search}<span>Replace Question...</span></button>
          <button type="button" data-act="q-edit" data-qidx="${qIdx}">${IC.pen}<span>Edit LaTeX</span></button>
          <button type="button" data-act="q-add-part" data-qidx="${qIdx}">${IC.plus}<span>Add Subpart</span></button>
          <button type="button" data-act="q-split" data-qidx="${qIdx}">${IC.scissors}<span>${hasParts ? "Split Subpart into New Question" : "Split into Subparts (a) & (b)"}</span></button>
          <hr>
          <button type="button" data-act="q-join-prev" data-qidx="${qIdx}" ${qIdx === 0 ? "disabled" : ""}>${IC.mergeUp}<span>Add to Previous Question (Merge)</span></button>
          <button type="button" data-act="q-join-next" data-qidx="${qIdx}" ${qIdx === totalQs - 1 ? "disabled" : ""}>${IC.mergeDown}<span>Add to Next Question (Merge)</span></button>
          <button type="button" data-act="q-add-or" data-qidx="${qIdx}">${IC.branch}<span>Add Alternative (OR)</span></button>
          ${partSectionHtml}
          <hr>
          <button type="button" data-act="q-up" data-qidx="${qIdx}" ${qIdx === 0 ? "disabled" : ""}>${IC.chevronUp}<span>Move Up</span></button>
          <button type="button" data-act="q-down" data-qidx="${qIdx}" ${qIdx === totalQs - 1 ? "disabled" : ""}>${IC.chevronDown}<span>Move Down</span></button>
          <hr>
          <button type="button" id="cm-undo" ${undoStack.length ? "" : "disabled"}>${IC.undo}<span>Undo</span><kbd>Ctrl+Z</kbd></button>
          <button type="button" id="cm-redo" ${redoStack.length ? "" : "disabled"}>${IC.redo}<span>Redo</span><kbd>Ctrl+Y</kbd></button>
          <hr>
          <button type="button" class="danger" data-act="q-del" data-qidx="${qIdx}">${IC.trash}<span>Delete Question</span><kbd>Del</kbd></button>
        `;

        document.body.appendChild(menu);
        contextMenuEl = menu;

        menu.addEventListener("click", (evt) => {
          const btn = evt.target.closest("button");
          if (!btn) return;
          evt.stopPropagation();
          closeContextMenu();

          if (btn.id === "cm-undo") {
            doUndo();
            return;
          }
          if (btn.id === "cm-redo") {
            doRedo();
            return;
          }

          const act = btn.dataset.act;
          if (act) {
            const fakeBtn = document.createElement("button");
            fakeBtn.dataset.act = act;
            fakeBtn.dataset.qidx = btn.dataset.qidx || qIdx;
            if (btn.dataset.pidx != null) fakeBtn.dataset.pidx = btn.dataset.pidx;
            fakeBtn.style.display = "none";
            canvasEl.appendChild(fakeBtn);
            fakeBtn.click();
            fakeBtn.remove();
          }
        });
      });

      // ── Drag and Drop: whole questions AND subparts ──────────────
      let draggedQIdx = null;    // set when dragging a whole question
      let draggedPart = null;    // { qIdx, pIdx } when dragging a subpart

      function dndRelabel(q) {
        if (!q.parts.length) return;
        if (q.parts.length === 1) { q.parts[0].label = ""; return; }
        q.parts.forEach((p, i) => { p.label = String.fromCharCode(97 + i); });
      }

      canvasEl.addEventListener("dragstart", (e) => {
        const partEl = e.target.closest(".pv-part-draggable");
        const card   = e.target.closest(".pv-q");
        if (partEl && partEl.dataset.pidx != null) {
          // ── subpart drag ──────────────────────────────────────────
          draggedPart = { qIdx: +partEl.dataset.qidx, pIdx: +partEl.dataset.pidx };
          draggedQIdx = null;
          partEl.classList.add("is-dragging-part");
          if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", "part"); }
        } else if (card && e.target.closest(".pv-drag-handle")) {
          // ── whole question drag (must start from handle) ──────────
          draggedQIdx = +card.dataset.qidx;
          draggedPart = null;
          card.classList.add("is-dragging");
          if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", "question"); }
        } else {
          e.preventDefault();
        }
      });

      canvasEl.addEventListener("dragover", (e) => {
        // clear all highlights
        $$(".pv-q").forEach((c) => c.classList.remove("drag-over", "drag-over-merge"));
        $$(".pv-part").forEach((p) => p.classList.remove("drag-over-part"));

        if (draggedPart !== null) {
          // subpart drag – highlight target part row or target question
          const targetPart = e.target.closest(".pv-part-draggable");
          const targetQ    = e.target.closest(".pv-q");
          if (targetPart) {
            const { qIdx: sQ, pIdx: sP } = draggedPart;
            if (+targetPart.dataset.qidx !== sQ || +targetPart.dataset.pidx !== sP) {
              targetPart.classList.add("drag-over-part");
            }
          } else if (targetQ) {
            if (+targetQ.dataset.qidx !== draggedPart.qIdx) {
              targetQ.classList.add("drag-over-merge");
            }
          }
          e.preventDefault();
        } else if (draggedQIdx !== null) {
          // question drag – top half = reorder, bottom half = merge
          const targetQ = e.target.closest(".pv-q");
          if (!targetQ) return;
          e.preventDefault();
          if (+targetQ.dataset.qidx === draggedQIdx) return;
          const rect = targetQ.getBoundingClientRect();
          const isTopHalf = e.clientY < rect.top + rect.height / 2;
          targetQ.classList.add(isTopHalf ? "drag-over" : "drag-over-merge");
        }
      });

      canvasEl.addEventListener("dragleave", (e) => {
        const overCard = e.target.closest(".pv-q");
        const overPart = e.target.closest(".pv-part");
        if (overCard && !overCard.contains(e.relatedTarget)) {
          overCard.classList.remove("drag-over", "drag-over-merge");
        }
        if (overPart && !overPart.contains(e.relatedTarget)) {
          overPart.classList.remove("drag-over-part");
        }
      });

      canvasEl.addEventListener("drop", (e) => {
        e.preventDefault();
        const sec = (doc.sections || [])[0];
        if (!sec) return;

        if (draggedPart !== null) {
          // ── DROP SUBPART ──────────────────────────────────────────
          const { qIdx: srcQ, pIdx: srcP } = draggedPart;
          const targetPartEl = e.target.closest(".pv-part-draggable");
          const targetQEl    = e.target.closest(".pv-q");

          if (targetPartEl) {
            // Drop onto specific part → insert before that part
            const tgtQ = +targetPartEl.dataset.qidx;
            const tgtP = +targetPartEl.dataset.pidx;
            if (srcQ === tgtQ && srcP === tgtP) { draggedPart = null; return; }
            pushUndo();
            const srcQuestion = sec.questions[srcQ];
            const [movedPart] = srcQuestion.parts.splice(srcP, 1);
            dndRelabel(srcQuestion);
            if (!srcQuestion.parts.length) sec.questions.splice(srcQ, 1);

            // After potential splice, find target question by its DOM qid
            const tgtQId = targetPartEl.closest(".pv-q").dataset.qid;
            const dstQuestion = sec.questions.find(q => q.id === tgtQId);
            if (dstQuestion) {
              const insertAt = +targetPartEl.dataset.pidx; // recalc after src splice
              dstQuestion.parts.splice(insertAt, 0, movedPart);
              dndRelabel(dstQuestion);
              const dstIdx = sec.questions.indexOf(dstQuestion);
              saveMakerDoc(doc); refreshStudio(dstIdx, null);
              toast("Subpart moved");
            }
          } else if (targetQEl) {
            // Drop onto question body → add as last subpart
            const tgtQId = targetQEl.dataset.qid;
            const dstQuestion = sec.questions.find(q => q.id === tgtQId);
            const srcQuestion = sec.questions[srcQ];
            if (!dstQuestion || dstQuestion === srcQuestion) { draggedPart = null; return; }
            pushUndo();
            const [movedPart] = srcQuestion.parts.splice(srcP, 1);
            dndRelabel(srcQuestion);
            if (!srcQuestion.parts.length) sec.questions.splice(sec.questions.indexOf(srcQuestion), 1);
            dstQuestion.parts.push(movedPart);
            dndRelabel(dstQuestion);
            const dstIdx = sec.questions.indexOf(dstQuestion);
            saveMakerDoc(doc); refreshStudio(dstIdx, null);
            toast("Subpart added to question");
          }
          draggedPart = null;

        } else if (draggedQIdx !== null) {
          // ── DROP WHOLE QUESTION ───────────────────────────────────
          const targetQEl = e.target.closest(".pv-q");
          if (!targetQEl) { draggedQIdx = null; return; }
          const tgtQ = +targetQEl.dataset.qidx;
          if (tgtQ === draggedQIdx) { draggedQIdx = null; return; }

          const rect = targetQEl.getBoundingClientRect();
          const isTopHalf = e.clientY < rect.top + rect.height / 2;

          if (isTopHalf) {
            // REORDER: insert dragged question before target
            pushUndo();
            const [moved] = sec.questions.splice(draggedQIdx, 1);
            const insertAt = draggedQIdx < tgtQ ? tgtQ - 1 : tgtQ;
            sec.questions.splice(insertAt, 0, moved);
            saveMakerDoc(doc); refreshStudio(insertAt, null);
            toast(`Question moved to position ${insertAt + 1}`);
          } else {
            // MERGE: add all parts of dragged question into target question
            pushUndo();
            const srcQ = sec.questions[draggedQIdx];
            const dstQ = sec.questions[tgtQ];
            srcQ.parts.forEach(pt => dstQ.parts.push(pt));
            dndRelabel(dstQ);
            sec.questions.splice(draggedQIdx, 1);
            const finalIdx = draggedQIdx < tgtQ ? tgtQ - 1 : tgtQ;
            saveMakerDoc(doc); refreshStudio(finalIdx, null);
            toast("Questions merged");
          }
          draggedQIdx = null;
        }
      });

      canvasEl.addEventListener("dragend", () => {
        $$(".pv-q").forEach((c) => c.classList.remove("is-dragging", "drag-over", "drag-over-merge"));
        $$(".pv-part").forEach((p) => p.classList.remove("is-dragging-part", "drag-over-part"));
        draggedQIdx = null;
        draggedPart = null;
      });
    }
  }

  /* ---------- scans ---------- */
  function viewScans() {
    const f = Object.assign({ prog: "", sem: "", year: "", q: "", math: true, old: false }, store.get("scanF", {}));
    const years = Array.from(new Set(D.scans.map((s) => s.year).filter(Boolean))).sort((a, b) => b - a);
    return `<div class="wrap"><div class="crumbs"><a href="${L("home")}">Home</a> / Scans</div>
      ${editorialHeading("Scanned papers", "Find original exam papers by programme, semester, year or paper code.", false, `<div class="resource-stat">${IC.scan}<div><strong>${D.scans.length.toLocaleString()}</strong><small>Original PDFs</small></div></div>`)}
      <div class="scan-filters" aria-label="Scan filters">
        <div><label class="flabel" for="s-prog">Programme</label><select id="s-prog">${opt("", "All", f.prog)}${opt("BSc", "B.Sc.", f.prog)}${opt("MSc", "M.Sc.", f.prog)}</select></div>
        <div><label class="flabel" for="s-sem">Semester</label><select id="s-sem">${opt("", "All", f.sem)}${[1, 2, 3, 4, 5, 6, 7, 8].map((s) => opt(s, "Sem " + ROMAN[s], f.sem)).join("")}</select></div>
        <div><label class="flabel" for="s-year">Year</label><select id="s-year">${opt("", "All", f.year)}${years.map((y) => opt(y, y, f.year)).join("")}</select></div>
        <div class="scan-query"><label class="flabel" for="s-q">Paper name or code</label><input type="search" id="s-q" value="${esc(f.q)}" placeholder="e.g. MMC-21, topology"></div>
        <div class="scan-filter-actions"><label><input type="checkbox" id="s-math" ${f.math ? "checked" : ""}> Mathematics only</label><button class="btn btn-ghost btn-sm" type="button" id="s-reset">Reset filters</button></div>
      </div>
      <p id="scan-count" class="scan-count" role="status"></p><div id="scanlist"></div>
      <section class="section"><div class="shead"><h2>Drive folders</h2></div>
        <div class="grid g2">${["BSc", "MSc"].map((pg) => `<div class="card"><h3>${PROG[pg]}</h3><div class="tabs" style="margin:8px 0 0">${D.C.folders[pg].map(([l, u]) => `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join("")}</div></div>`).join("")}
        <div class="card"><h3>Older B.Sc. folders</h3><p style="margin-bottom:8px">Before the 2025 reorganisation.</p><div class="tabs" style="margin:0">${D.C.folders.BSc_old1.concat(D.C.folders.BSc_old2).map(([l, u], i) => `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener">${i < 6 ? "" : "2017+ "}${esc(l)} ↗</a>`).join("")}</div></div></div>
      </section></div>`;
  }
  function bindScans() {
    const read = () => ({ prog: $("#s-prog").value, sem: $("#s-sem").value, year: $("#s-year").value, q: $("#s-q").value.trim(), math: $("#s-math").checked });
    const draw = () => {
      const f = read(); store.set("scanF", f);
      const ql = f.q.toLowerCase();
      const list = D.scans.filter((s) => (!f.prog || s.prog === f.prog) && (!f.sem || s.sem === +f.sem) && (!f.year || s.year === +f.year) && (!f.math || !s.other) && (!ql || (s.label + " " + (s.code || "") + " " + (s.file || "")).toLowerCase().includes(ql)));
      const groups = new Map();
      list.forEach((s) => { const k = s.prog + "|" + s.sem + "|" + (s.year || 0); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); });
      const keys = Array.from(groups.keys()).sort((a, b) => { const [pa, sa, ya] = a.split("|"), [pb, sb, yb] = b.split("|"); return pa.localeCompare(pb) || sa - sb || yb - ya; });
      $("#scan-count").textContent = list.length.toLocaleString() + (list.length === 1 ? " PDF" : " PDFs");
      $("#scanlist").innerHTML = list.length ? keys.map((k) => {
        const [pg, sem, year] = k.split("|");
        const group = groups.get(k);
        const typed = D.papers.filter((p) => p.prog === pg && p.sem === +sem && p.year === +year);
        const heading = (PSHORT[pg] || pg) + (ROMAN[sem] ? " Semester " + ROMAN[sem] : "") + " · " + (+year || "Year unknown");
        return `<section class="scan-group"><header class="scan-group-head">
          <span class="resource-icon">${IC.folder}</span><div><h2>${esc(heading)}</h2>
          <span class="muted">${group.length} ${group.length === 1 ? "scan" : "scans"}</span></div></header>
          <div class="scan-rows">${group.map((x) => `<a class="resource-row" href="${scanUrl(x.id)}" target="_blank" rel="noopener">
            <span class="resource-row-icon">${IC.file}</span><span class="resource-row-text"><span class="scan-name"><strong>${esc(x.label)}</strong>${x.file || x.pages ? `<small class="scan-meta">${x.pages ? x.pages + (x.pages === 1 ? " page" : " pages") : ""}${x.file && x.pages ? " · " : ""}${x.file ? "file: " + esc(x.file) : ""}</small>` : ""}</span>
            ${x.kind === "i" ? '<span class="tag rep">Internal</span>' : ""}${x.other ? '<span class="tag">Other subject</span>' : ""}${x.old ? '<span class="tag">Older</span>' : ""}</span><span class="resource-arrow">${IC.ext}</span></a>`).join("")}</div>
          ${typed.length ? `<details class="resource-disclosure"><summary>Typed papers <span class="muted">(${typed.length})</span></summary>
          <div class="resource-links">${typed.map((p) => `<a class="chip" href="${L("paper-" + p.key)}">${esc(pname(p))}${p.kind[0] === "i" ? " · Internal" : ""}</a>`).join("")}</div></details>` : ""}</section>`;
      }).join("") : `<div class="empty">No scans match these filters.</div>`;
    };
    ["s-prog", "s-sem", "s-year", "s-math"].forEach((id) => $("#" + id).addEventListener("change", draw));
    $("#s-reset").addEventListener("click", () => {
      ["s-prog", "s-sem", "s-year", "s-q"].forEach((id) => { $("#" + id).value = ""; });
      $("#s-math").checked = true;
      draw();
    });
    let deb; $("#s-q").addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(draw, 200); });
    draw();
  }

  /* ---------- topics ---------- */
  function viewTopics() {
    const yrs = D.years;
    const byYear = new Map(yrs.map((y) => [y, 0]));
    const cell = new Map();
    D.Q.forEach((q) => { if (q.stem || EXAM[D.papers[q.p].prog]) return; const y = D.papers[q.p].year; byYear.set(y, byYear.get(y) + 1); q.broads.forEach((b) => cell.set(b + "|" + y, (cell.get(b + "|" + y) || 0) + 1)); });
    const tc = D.topics.map(() => 0); D.Q.forEach((q) => !q.stem && q.t.forEach((k) => tc[k]++));
    const bc = D.broad.map((b, i) => D.Q.filter((q) => !q.stem && q.broads.has(i)).length);
    const order = D.broad.map((b, i) => i).sort((a, b) => bc[b] - bc[a]);
    let maxShare = 0; cell.forEach((v, k) => { const y = +k.split("|")[1]; maxShare = Math.max(maxShare, v / byYear.get(y)); });
    const weak = D.Q.filter((q) => q.weak).length;
    return `<div class="wrap"><div class="crumbs"><a href="${L("home")}">Home</a> / Topics</div>
      ${editorialHeading("Topic map", "Explore questions by topic and see how Visva-Bharati exam coverage changes from year to year.")}
      <p class="note" style="max-width:76ch">Tags come from a first automatic pass over the question text, so some are imprecise. ${weak.toLocaleString()} questions are marked for checking. The trend table shows how often an area was examined in past years; it describes patterns, it does not predict a paper.</p>
      <section class="section" style="margin-top:32px"><div class="section-head"><h2>How often each area is examined</h2><span class="muted">Share of that year's questions</span></div>
        <div class="scroll-x" style="padding:10px"><table class="heat"><thead><tr><th></th>${yrs.map((y) => `<th>’${String(y).slice(2)}</th>`).join("")}</tr></thead><tbody>
        ${order.map((b) => `<tr><th>${esc(D.broad[b])}</th>${yrs.map((y) => { const v = cell.get(b + "|" + y) || 0, sh = byYear.get(y) ? v / byYear.get(y) : 0; return `<td style="--heat-weight:${maxShare ? Math.round(100 * sh / maxShare) : 0}%" data-hb="${b}" data-hy="${y}" title="${esc(D.broad[b])}, ${y}: ${v} questions (${Math.round(sh * 100)}%)">${v ? Math.round(sh * 100) : ""}</td>`; }).join("")}</tr>`).join("")}
        </tbody></table></div><p class="muted" style="font-size:13px;margin-top:8px">Numbers are percentages. B.Sc. and M.Sc. together; use Search filters to split them.</p></section>
      <section class="section"><div class="section-head"><h2>All topics</h2></div>
        <div class="topic-grid">${order.map((b) => {
          const topics = D.topics.map(([area, label], k) => ({ area, label, k, count: tc[k] }))
            .filter(({ area }) => area === D.broad[b]).sort((a, b) => b.count - a.count);
          return `<article class="topic-card">
            <h3><a class="topic-area" href="${L("search")}" data-tb="${b}">
              <span>${esc(D.broad[b])}</span>
              <span class="topic-total">${bc[b].toLocaleString()}<span class="sr"> questions</span></span>
              ${IC.arrow}
            </a></h3>
            <ul class="topic-list" role="list">${topics.map(({ label, k, count }) => `
              <li><a class="topic-row" href="${L("search")}" data-tt="${k}" data-tb2="${b}">
                <span>${esc(label)}</span>
                <span class="topic-count">${count.toLocaleString()}<span class="sr"> questions</span></span>
              </a></li>`).join("")}</ul>
          </article>`;
        }).join("")}</div></section></div>`;
  }
  function bindTopics() {
    $$("[data-hb]").forEach((td) => td.addEventListener("click", () => { F = defaultFilters(); F.broad = td.dataset.hb; F.from = F.to = td.dataset.hy; go("search"); }));
    $$("[data-tb]").forEach((a) => a.addEventListener("click", () => { F = defaultFilters(); F.broad = a.dataset.tb; }));
    $$("[data-tt]").forEach((a) => a.addEventListener("click", () => { F = defaultFilters(); F.broad = a.dataset.tb2; F.topic = a.dataset.tt; }));
  }

  /* ---------- content pages ---------- */
  const ext = (u, l, cls) => `<a ${cls ? `class="${cls}" ` : ""}href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}${cls === "chip" ? " ↗" : ""}</a>`;
  function editorialHeading(title, intro, art = true, aside = "") {
    return `<header class="editorial-heading${art ? " has-art" : ""}${aside ? " has-aside" : ""}"><div>
      <h1>${esc(title)}</h1>${intro ? `<p class="lede">${esc(intro)}</p>` : ""}</div>
      ${aside}</header>`;
  }
  const illustratedPages = new Set(["Notes", "Competitive exams", "Syllabus"]);
  const page = (crumb, title, lede, body) => `<div class="wrap"><div class="crumbs"><a href="${L("home")}">Home</a> / ${esc(crumb)}</div>
    ${illustratedPages.has(crumb) ? editorialHeading(title, lede) : `<h1>${esc(title)}</h1>${lede ? `<p class="lede" style="margin-bottom:26px">${lede}</p>` : ""}`}${body}</div>`;
  function viewExams(selected) {
    const row = (label, href, external = false, attrs = "") => `<a class="exam-row" href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ""}${attrs}><span>${esc(label)}</span>${external ? IC.ext : IC.arrow}</a>`;
    const exams = selected ? D.C.exams.filter((exam) => EXAM_CODE[exam.name] === selected) : D.C.exams;
    const cards = exams.map((exam) => {
      const code = EXAM_CODE[exam.name];
      const papers = code ? D.papers.filter((p) => p.prog === code).sort((a, b) => b.year - a.year || b.key.localeCompare(a.key)) : [];
      const search = papers.length ? row("Search questions", L("search") + (HASH ? "" : "?exam=" + code), false, ` data-exam-search="${code}"`) : "";
      const links = (code === "GATE" ? row("Official past papers and answer keys", "https://gate2026.iitg.ac.in/download.html", true) : "") + exam.links.map(([label, url]) => row(label, url, true)).join("");
      const syllabus = EXAM_GUIDANCE[code]?.[2] || exam.syllabus;
      return `<article class="topic-card exam-card" id="exam-${code || "vb-admission"}" tabindex="-1">
        <div class="exam-card-title"><span class="resource-icon">${code ? IC.stack : IC.file}</span>
          <div>${selected ? "" : `<h2>${code ? `<a class="exam-title-link" href="${L("exams-" + code.toLowerCase())}">${esc(exam.name)}</a>` : esc(exam.name)}</h2>`}<p>${esc(exam.note)}</p></div></div>
        <div class="exam-rows">
          ${search}
          ${papers.length ? `<details class="exam-disclosure"${selected ? " open" : ""}><summary><span>Searchable papers</span><span class="topic-total" aria-label="${papers.length} papers">${papers.length}</span>${IC.down}</summary>
            <div>${papers.map((p) => row(code === "JAM" ? p.year : p.title, L("paper-" + p.key))).join("")}</div></details>` : ""}
          ${exam.years ? `<details class="exam-disclosure"><summary><span>Papers by year</span><span class="topic-total" aria-label="${exam.years.length} years">${exam.years.length}</span>${IC.down}</summary>
            <div class="yeartable" role="table" aria-label="${esc(exam.name)} papers by year">${exam.years.map(([y, groups]) => `<div class="yt-row" role="row"><span class="yt-year" role="rowheader">${esc(y)}</span><div class="yt-cells">${groups.map(([lab, ls]) => `<div class="yt-group"><span class="yt-lab">${esc(lab)}</span><span class="yt-links">${ls.map(([l, u]) => ext(u, l)).join("")}</span></div>`).join("")}</div></div>`).join("")}</div></details>` : ""}
          ${code && papers.length ? `<details class="exam-disclosure"><summary><span>Original papers and resources</span>${IC.down}</summary><div>${links}</div></details>` : links}
          ${syllabus ? row(code === "NBHM" ? "Written test guidance" : "Syllabus", syllabus, true) : ""}
        </div>
      </article>`;
    });
    if (selected) {
      const exam = exams[0];
      const resources = exam.links.filter(([label]) => selected === "NET" ? !/\b20\d{2}\b/.test(label) : selected !== "JAM" || !/^\d{4}$/.test(label));
      const guidance = EXAM_GUIDANCE[selected]?.[2] || exam.syllabus;
      return page("Competitive exams", exam.name + " Question Papers", exam.note,
        `${archiveBrowser(selected)}
          <div class="archive-resources">
            ${guidance ? ext(guidance, selected === "NBHM" ? "Written test guidance" : "Syllabus") : ""}
            ${resources.map(([label, url]) => ext(url, label)).join("")}
            ${selected === "GATE" ? ext("https://drive.google.com/file/d/1BV1cIm5E4v8zJUtrjeQDLjXeuPfETAt1/view", "Official Mathematics PDF bundle (2007–2026)") : ""}
            ${selected === "NET" ? ext("https://csirhrdg.res.in/Home/Index/1/Default/919/26", "Official CSIR exam archive") : ""}
            <a href="${L("exams")}">All competitive exams</a>
          </div>`);
    }
    return page("Competitive exams", "Competitive & admission exams",
      "Find previous papers and syllabi for mathematics entrance tests and fellowships.",
      `<div class="resource-grid exam-grid">${cards.join("")}</div>`);
  }
  function viewNotes() {
    const symbols = {
      "Numerical Analysis": I('<path d="M3 4v16h17M6 16l5-6 4 2 5-7"/><circle cx="11" cy="10" r="1"/><circle cx="15" cy="12" r="1"/>'),
      "Continuum Mechanics": I('<path d="m3 8 15-4 3 13-15 4zM4.5 14.5l15-4M10.5 6l3 13"/>'),
      "Mathematical Ecology": I('<path d="M20 4c-7 0-14 3-14 10a5 5 0 0 0 5 5c7 0 9-8 9-15ZM4 21l11-11"/>'),
      "Mathematical Biology": I('<path d="M6 3c0 9 12 9 12 18M18 3c0 9-12 9-12 18M7 6h10M7 18h10M10 9h4M10 15h4"/>'),
      "Dynamical Systems": I('<path d="M21 11c0-5-4-8-9-8S3 7 3 12s4 9 9 9 8-3 8-7-3-6-7-6-5 2-5 5 2 4 4 4 3-1 3-3M18 11h3v-3"/>'),
      "Complex Analysis": I('<path d="M3 12h18M12 3v18"/><circle cx="12" cy="12" r="7"/><path d="m12 12 5-5"/>'),
      "Abstract Algebra": I('<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9"/>'),
      "NET/GATE Notes": IC.stack,
    };
    const folder = I('<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>');
    const notes = D.C.notes.items.map(([title, credit, url]) => `<article class="note-card">
      <span class="note-symbol">${symbols[title] || IC.file}</span>
      <h2>${esc(title)}</h2><p>${esc(credit)}</p>
      <a class="note-open" href="${esc(url)}" target="_blank" rel="noopener" aria-label="Open notes for ${esc(title)} (new tab)">Open notes ${IC.ext}</a>
    </article>`).join("");
    const folders = Object.entries(D.C.notes.folders).map(([label, urls], group) => {
      const semesters = urls.map((url, i) => ({
        id: `class-notes-${group}-${i + 1}`,
        name: "Semester " + (ROMAN[i + 1] || i + 1),
        url,
        items: D.C.notes.folderContents?.[url] || [],
      }));
      return `<section class="class-note-card">
        <h3>${esc(label)}</h3>
        <div class="class-note-tiles">
          ${semesters.map(({id, name, items}) => `<button type="button" class="class-note-tile" id="${id}-tile" aria-expanded="false" aria-controls="${id}">
            <span class="class-note-folder"><span class="class-note-sheet" aria-hidden="true"></span>
              <span class="class-note-folder-face"><strong>${name}</strong><small>${items.length ? items.length + (items.length === 1 ? " folder" : " folders") : "Browse notes"}</small></span>
            </span>
          </button>`).join("")}
        </div>
        ${semesters.map(({id, name, url, items}) => `<section class="class-note-preview" id="${id}" aria-labelledby="${id}-heading" tabindex="-1" hidden>
          <div class="class-note-preview-head"><h4 id="${id}-heading">${name}</h4>
            <a href="${esc(url)}" target="_blank" rel="noopener">Open in Drive ${IC.ext}</a>
            <button type="button" class="iconbtn class-note-close" aria-label="Close ${name}">${IC.x}</button>
          </div>
          ${items.length ? `<ul>${items.map(([title, link]) => `<li><a href="${esc(link)}" target="_blank" rel="noopener">${folder}<span>${esc(title)}</span>${IC.ext}</a></li>`).join("")}</ul>` :
            '<p class="muted">Browse this semester’s notes in Drive.</p>'}
        </section>`).join("")}
      </section>`;
    }).join("");
    return page("Notes", "Notes", "Lecture notes shared by Visva-Bharati mathematics students and alumni.",
      `<div class="note-grid">${notes}</div>
      <section class="section"><div class="shead"><h2>Class-note folders</h2>${ext(D.C.forms.notes, "Upload your notes", "btn btn-ghost btn-sm")}</div>
      <div class="class-note-grid">${folders}</div></section>`);
  }
  function bindNotes() {
    $$(".class-note-card").forEach((card) => {
      const tiles = $$(".class-note-tile", card);
      const panelFor = (tile) => document.getElementById(tile.getAttribute("aria-controls"));
      const hide = (tile) => {
        tile.setAttribute("aria-expanded", "false");
        panelFor(tile).hidden = true;
      };
      tiles.forEach((tile) => tile.addEventListener("click", () => {
        const wasOpen = tile.getAttribute("aria-expanded") === "true";
        const previous = tiles.find((candidate) => candidate.getAttribute("aria-expanded") === "true");
        if (previous) hide(previous);
        if (wasOpen) return;
        tile.setAttribute("aria-expanded", "true");
        const panel = panelFor(tile);
        panel.hidden = false;
        panel.focus();
      }));
      card.addEventListener("click", (event) => {
        if (!event.target.closest(".class-note-close")) return;
        const open = tiles.find((tile) => tile.getAttribute("aria-expanded") === "true");
        if (open) { hide(open); open.focus(); }
      });
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        const open = tiles.find((tile) => tile.getAttribute("aria-expanded") === "true");
        if (open) { event.preventDefault(); hide(open); open.focus(); }
      });
    });
  }
  function viewSyllabus() {
    const groups = new Map([["B.Sc. Mathematics", []], ["M.Sc. Mathematics", []], ["Competitive & admission exams", []]]);
    const syllabus = D.C.syllabus.map((item) => item[0] === "IIT JAM Mathematics" ? EXAM_GUIDANCE.JAM : item);
    syllabus.push(EXAM_GUIDANCE.GATE, EXAM_GUIDANCE.NBHM, EXAM_GUIDANCE.TIFR);
    for (const item of syllabus) {
      const title = item[0];
      const group = title.startsWith("B.Sc. —") ? "B.Sc. Mathematics" :
        title.startsWith("M.Sc. —") ? "M.Sc. Mathematics" : "Competitive & admission exams";
      groups.get(group).push(item);
    }
    return page("Syllabus", "Syllabus", "Find the syllabus for your programme or exam.",
      `<div class="resource-grid syllabus-grid">${Array.from(groups, ([group, items]) => `
        <section class="resource-card syllabus-group"><div class="resource-card-head">
          <span class="resource-icon">${IC.file}</span><h2>${esc(group)}</h2></div>
          <div class="syllabus-rows">${items.map(([title, desc, url]) => `
            <a class="resource-row" href="${esc(url)}" target="_blank" rel="noopener">
              <span class="resource-row-text"><strong>${esc(title.replace(/^[BM]\.Sc\. — /, ""))}</strong>${desc ? `<small>${esc(desc)}</small>` : ""}</span>
              <span class="resource-arrow">${IC.ext}</span></a>`).join("")}</div></section>`).join("")}</div>`);
  }
  function viewBooks() {
    const subjects = Object.entries(D.C.books).map(([subject, books]) => `<section class="book-subject">
      <h2>${esc(subject)}</h2>
      <ul>${books.map((book) => {
        const [title, author] = book.split(" — ");
        const amazon = "https://www.amazon.in/s?" + new URLSearchParams({k: [title, author].filter(Boolean).join(" "), i: "stripbooks"});
        return `<li>${ext(amazon, title)}${author ? ` <span class="muted">· ${esc(author)}</span>` : ""}</li>`;
      }).join("")}</ul></section>`).join("");
    return page("Books", "Books", "Mathematics books recommended by students and teachers.",
      `<div class="book-subjects">${subjects}</div><p style="margin-top:24px">${ext(D.C.forms.books, "Suggest a book")}</p>`);
  }
  function viewLearn(section) {
    const Ln = D.C.learn, subj = Object.fromEntries(Ln.subjects);
    const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
    const plat = (p) => p === "YouTube" ? "yt" : p.startsWith("MIT") ? "mit" : "web";
    const course = ([t, by, p, what, sj, papers, u]) => `<li class="lc" data-subj="${sj}">
        <span class="lc-plat lc-${plat(p)}" aria-hidden="true">${p === "YouTube" ? "YT" : p.startsWith("MIT") ? "MIT" : "WEB"}</span>
        <div class="lc-main"><a class="lc-title" href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>
          <p class="lc-by">${esc(by)}, ${esc(p)}</p><p class="lc-what">${esc(what)}</p></div>
        <div class="lc-side"><span class="lc-subj">${esc(subj[sj])}</span>${papers ? `<span class="lc-papers">For ${papers.split(/,\s*/).map((c) => `<button type="button" class="pcode" data-code="${esc(c)}" title="Questions from ${esc(c)}">${esc(c)}</button>`).join("")}</span>` : ""}</div></li>`;
    const lectures = `<section class="learn-block" id="lectures-notes" aria-labelledby="lc-h" tabindex="-1">
        <div class="lb-head"><div><h2 id="lc-h">Courses by subject</h2><p class="muted">Each course lists the Visva-Bharati papers it helps with. Tap a code to see that paper’s questions.</p></div></div>
        <div class="lseg" role="group" aria-label="Filter by subject"><button type="button" class="on" data-s="">All</button>${Ln.subjects.map(([k, l]) => `<button type="button" data-s="${k}">${esc(l)}</button>`).join("")}</div>
        <ul class="lcourses">${Ln.courses.map(course).join("")}</ul>
      </section>
      <section class="learn-block" aria-labelledby="ch-h">
        <div class="lb-head"><div><h2 id="ch-h">Channels worth following</h2><p class="muted">Whole lecture series and regular uploads, beyond a single course.</p></div></div>
        <div class="lchannels">${Ln.channels.map(([n, d, ls]) => `<div class="lch"><h3>${esc(n)}</h3><p>${esc(d)}</p><div class="lch-links">${ls.map(([l, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}${IC.ext}</a>`).join("")}</div></div>`).join("")}</div>
      </section>
      `;
    const websites = `<section class="learn-block" id="useful-websites" aria-labelledby="ws-h" tabindex="-1">
        <div class="lb-head"><div><h2 id="ws-h">Websites</h2><p class="muted">Grouped by what you need them for.</p></div></div>
        <div class="lsites">${Ln.sites.map(([g, d, ls]) => `<div class="lsg"><div class="lsg-head"><h3>${esc(g)}</h3><p>${esc(d)}</p></div>
          <ul class="lsg-list">${ls.map(([n, u, w]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener"><span class="ls-n">${esc(n)}</span>${w ? `<span class="ls-w">${esc(w)}</span>` : ""}<span class="ls-h">${esc(host(u))}</span></a></li>`).join("")}</ul></div>`).join("")}</div>
      </section>
      `;
    const title = section === "lectures" ? "Lectures & Notes" : section === "websites" ? "Useful Websites" : "Lectures, notes & websites";
    return page("Resources", title, "", `${section === "websites" ? "" : lectures}${section === "lectures" ? "" : websites}
      <p class="gnote" style="margin-top:28px">Suggest a resource at <span class="mono">${esc(D.C.email)}</span>.</p>`);
  }
  function bindLearn() {
    const btns = $$(".lseg button");
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.toggle("on", x === b));
      $$(".lc").forEach((li) => { li.hidden = !!b.dataset.s && li.dataset.subj !== b.dataset.s; });
    }));
    $$(".pcode").forEach((b) => b.addEventListener("click", () => { F = defaultFilters(); F.code = b.dataset.code; F.sort = "new"; go("search"); }));
  }
  function viewAlumni() {
    const rows = D.alumni.map(([name, years, degree]) => `<li class="people-record" data-alumnus>
      <h2>${esc(name)}</h2><p class="people-meta">${[years, degree].filter(Boolean).map(esc).join(" · ")}</p></li>`).join("");
    return `<div class="people-toolbar"><div><label for="alumni-find">Filter alumni</label><input id="alumni-find" type="search" placeholder="Name, years or degree"></div></div>
      <p class="people-meta" id="alumni-count" role="status">${D.alumni.length} alumni</p>
      <ul class="people-list">${rows}</ul>`;
  }
  function bindAlumni() {
    const rows = $$("[data-alumnus]").map((row) => [row, row.textContent.toLowerCase()]);
    const search = $("#alumni-find");
    search.addEventListener("input", () => {
      const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      for (const [row, text] of rows) {
        row.hidden = !terms.every((term) => text.includes(term));
        count += Number(!row.hidden);
      }
      $("#alumni-count").textContent = count === 1 ? "1 alumnus" : count + " alumni";
    });
  }
  function viewStudentAchievements() {
    const {source, highlights, cohorts} = D["student-achievements"];
    return `<div class="people-directory"><h2>Fellowships and recognition</h2>
      <ul class="people-list">${highlights.map(([name, achievement]) => `<li class="people-record"><strong>${esc(name)}</strong><p>${esc(achievement)}</p></li>`).join("")}</ul>
      <h2>NET, GATE and further study</h2>
      ${cohorts.map(({years, students}, index) => `<details class="people-cohort"${index === 0 ? " open" : ""}>
        <summary><strong>M.Sc. ${esc(years)}</strong><span class="people-meta">${students.length} records</span></summary>
        <ul class="people-list">${students.map(([name, exams, study]) => `<li class="people-record"><strong>${esc(name)}</strong><p>${[exams, study].filter(Boolean).map(esc).join(" · ")}</p></li>`).join("")}</ul></details>`).join("")}
      <p>${ext(source, "Source · Visva-Bharati Department of Mathematics")}</p></div>`;
  }
  function facultyCard(name, teaching, research) {
    const {profile, website, cv, scholar, researchgate} = FACULTY_PROFILES[name.replace(/^(?:Prof|Dr)\. /, "")] || {};
    const links = [
      ["University profile", profile],
      ["Academic website", website],
      ["University CV (PDF)", cv],
      ["Google Scholar", scholar && "https://scholar.google.com/citations?user=" + scholar],
      ["ResearchGate", researchgate && "https://www.researchgate.net/profile/" + researchgate],
    ].filter(([, url]) => url);
    return `<article class="card"><h3>${esc(name)}</h3>
      ${teaching ? `<p><b>Teaches</b> ${esc(teaching)}</p>` : ""}
      ${research ? `<p><b>Research</b> ${esc(research)}</p>` : ""}
      ${links.length ? `<p class="archive-resources">${links.map(([label, url]) => ext(url, label)).join("")}</p>` : ""}</article>`;
  }
  function viewPeople(section) {
    if (section === "alumni") return page("People", "Alumni", "Visva-Bharati mathematics alumni directory.", viewAlumni());
    if (section === "student-achievements") return page("People", "Student achievements", "Qualifications, further study and honours reported by the Department of Mathematics.", viewStudentAchievements());
    const teachers = `<section id="teachers" aria-label="Teachers" tabindex="-1">
      <p class="archive-resources">${ext(FACULTY_DIRECTORY, "Visva-Bharati mathematics faculty directory")}</p>
      <div class="grid g2">${D.C.faculty.map(([name, teaching, research]) => facultyCard(name, teaching, research)).join("")}</div>
      <section class="section"><div class="section-head"><h2>Former faculty</h2></div>
      <div class="grid g2">${D.C.retired.map((name) => facultyCard(name)).join("")}</div></section></section>`;
    const scholars = `<div class="card" id="scholars" tabindex="-1"><p>See the directory of current and graduated research scholars and their supervisors.</p><p style="margin-top:12px">${ext(D.C.scholars_link, "Open the scholar directory", "btn btn-ghost")}</p></div>`;
    if (section) return page("People", PEOPLE_LABELS[section], "", {teachers, scholars}[section]);
    return page("People", "People", "", `<div class="resource-grid">${Object.entries(PEOPLE_LABELS).map(([key, label]) => `<a class="card" href="${L("people-" + key)}"><h2>${label}</h2></a>`).join("")}</div>
      <div class="section">${teachers}</div><div class="section">${scholars}</div>`);
  }
  function viewTools() {
    const coding = D.C.tools.filter(([label]) => label.startsWith("Math++"));
    const numerical = D.C.tools.filter(([label]) => !label.startsWith("Math++"));
    return page("Tools", "Mathematics tools", "",
      `<div class="resource-grid">${[["Coding", coding], ["Numerical methods", numerical], ["LaTeX", D.C.latex]].map(([title, links]) => `
        <section class="topic-card exam-card"><div class="exam-card-title"><span class="resource-icon">${IC.file}</span><h2>${title}</h2></div>
          <div class="exam-rows">${links.map(([label, url]) => `<a class="exam-row" href="${esc(url)}" target="_blank" rel="noopener"><span>${esc(label)}</span>${IC.ext}</a>`).join("")}</div>
        </section>`).join("")}</div>`);
  }
  function viewGuides() {
    const C = D.C;
    const parts = [["sch", "Scholarships"], ["adm", "Admission"], ["reach", "Reaching the department"], ["latex", "LaTeX"], ["tools", "Numerical tools"], ["thesis", "Ph.D. thesis submission"]];
    const linkList = (items) => `<ul class="glinks">${items.map(([l, u]) => `<li>${ext(u, l)}</li>`).join("")}</ul>`;
    return `<div class="wrap"><nav class="crumbs"><a href="${L("home")}">Home</a> / Guides</nav>
      <div class="pagehead"><h1>Guides</h1><p class="lede">Practical help for students of the department, from scholarships and admission to submitting a Ph.D. thesis.</p></div>
      <div class="guide">
        <aside class="gnav" aria-label="On this page"><b>On this page</b>${parts.map(([k, l]) => `<a href="#g-${k}" data-jump="${k}">${l}</a>`).join("")}</aside>
        <div class="gbody">
          <section id="g-sch"><h2>Scholarships</h2><p class="gnote">Rules and amounts change every year, so check the official notice before applying.</p>
            <div class="gtable" role="table" aria-label="Scholarships">
              <div class="gr gh" role="row"><span role="columnheader">Scholarship</span><span role="columnheader">Who can apply</span></div>
              ${C.scholarships.map(([n, d, u]) => `<div class="gr" role="row"><span role="cell"><a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a></span><span role="cell">${esc(d)}</span></div>`).join("")}
            </div>
            <p class="gnote">Know one that is missing? ${ext(C.forms.scholarship, "Suggest a scholarship")}.</p></section>
          <section id="g-adm"><h2>Admission to Visva-Bharati</h2>${C.admission.map((x) => `<p>${esc(x)}</p>`).join("")}</section>
          <section id="g-reach"><h2>Reaching the department</h2><dl class="gdl">${C.reach.map(([t, d, u]) => `<dt>${esc(t)}</dt><dd>${esc(d)}${u ? ` ${ext(u, t === "Map" ? "Open in Google Maps" : "Train timings")}` : ""}</dd>`).join("")}</dl></section>
          <section id="g-latex"><h2>LaTeX for project work</h2><p>LaTeX places text and equations for you, so a long mathematical document stays tidy as you edit it. Install an editor with a TeX distribution, or write online on Overleaf.</p>${linkList(C.latex)}</section>
          <section id="g-tools"><h2>Numerical tools</h2><p>Small calculators for common numerical methods, hosted on Math++.</p>${linkList(C.tools)}</section>
          <section id="g-thesis"><h2>Ph.D. thesis submission</h2><p>The usual order of steps at Visva-Bharati. Confirm details with your supervisor and the Bhavana office.</p>
            <ol class="gsteps">${C.thesis.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
            <h3>Forms and links</h3>${linkList(C.thesis.links)}</section>
        </div>
      </div></div>`;
  }
  function bindGuides() {
    const links = $$(".gnav a");
    links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const t = $("#g-" + a.dataset.jump); t && t.scrollIntoView({ behavior: "smooth", block: "start" }); }));
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => { es.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle("on", "g-" + a.dataset.jump === en.target.id)); }); }, { rootMargin: "-20% 0px -70% 0px" });
    $$(".gbody section").forEach((s) => io.observe(s));
  }
  function viewContribute() {
    const C = D.C;
    return page("Contribute", "Contribute", "VBMath runs on volunteers. Every scan, correction and note makes the archive better for the next batch.",
      `<div class="grid g2">
        <div class="card"><h3>Send question papers</h3><p>Photograph or scan the papers of your semester and upload them with the form. Choose the programme, semester and year so they are sorted automatically.</p><p style="margin-top:12px"><a class="btn btn-primary btn-sm" href="${esc(C.forms.questions)}" target="_blank" rel="noopener">Open the upload form ↗</a></p></div>
        <div class="card"><h3>Help maintain the site</h3><p>Scholars and B.Sc./M.Sc. students can help by collecting papers, typing and checking questions, or overseeing a semester. Technical help is available.</p><p style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="${esc(C.forms.volunteer)}" target="_blank" rel="noopener">Volunteer ↗</a></p></div>
        <div class="card"><h3>Share notes</h3><p>Clear handwritten or typed notes from your classes help everyone revise.</p><p style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="${esc(C.forms.notes)}" target="_blank" rel="noopener">Upload notes ↗</a></p></div>
        <div class="card"><h3>Type a missing question</h3><p>Copy a question from a scan into LaTeX. A reviewer checks it against the scan before it appears.</p><p style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="${GH}1-add-question.yml" target="_blank" rel="noopener">Add a question ↗</a></p></div>
        <div class="card"><h3>Fix topic tags</h3><p>Tags came from an automatic first pass. Use the <b>⋯</b> menu and choose <b>Fix topic tags</b> on any question; the id is filled in for you.</p><p style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="${GH}2-fix-tags.yml" target="_blank" rel="noopener">Fix tags ↗</a></p></div>
        <div class="card"><h3>Report a mistake</h3><p>A typo, a wrong mark or a missing line. Use the <b>⋯</b> menu and choose <b>Report a mistake</b> on the question, or write to <span class="mono" style="user-select:all">${esc(C.email)}</span>.</p><p style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="${GH}3-report-mistake.yml" target="_blank" rel="noopener">Report ↗</a></p></div>
        <div class="card"><h3>Share a solution</h3><p>Write a worked solution in LaTeX. Reviewed solutions will appear under their questions.</p><p style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="${GH}4-submit-solution.yml" target="_blank" rel="noopener">Submit a solution ↗</a></p></div>
      </div>
      <section class="section"><div class="section-head"><h2>How a contribution goes live</h2></div><ol class="prose"><li>You fill a short GitHub form (a free GitHub account is needed; a no-account form is planned).</li><li>An automatic check reads the fields and replies on the issue.</li><li>A reviewer compares it with the scan and marks it accepted.</li><li>A pull request is created automatically; once merged, the site updates within minutes.</li></ol></section>`);
  }
  function viewAbout() {
    const C = D.C;
    return page("About", "About VBMath", "",
      `<div class="prose"><p>VBMath is an unofficial, student-run archive for the Department of Mathematics, Visva-Bharati, Santiniketan. It is not affiliated with Visva-Bharati or its Department of Mathematics. It began as a Google Site sharing scanned question papers through Drive folders. This version types every paper in LaTeX, so questions can be searched, filtered by topic and length, copied by teachers setting new papers, and compared across years.</p>
      <p>All maintenance is voluntary and free of cost: the site is a static page hosted on Cloudflare Pages from a public GitHub repository, and the scans stay in Google Drive. The earlier site remains at ${ext(C.oldsite, "sites.google.com/view/vbmath")}.</p>
      <p>For copyright concerns or corrections, write to <span class="mono" style="user-select:all">${esc(C.email)}</span>.</p></div>
      <section class="section"><div class="section-head"><h2>People behind it</h2></div><div class="grid g2">${Object.entries(C.credits).map(([k, v]) => `<div class="card"><h3>${esc(k)}</h3><p>${v.map(esc).join(", ")}</p></div>`).join("")}</div></section>`);
  }

  function viewGallery() {
    return page("Resources", "Math Gallery", "Motion, structure, and the unexpected. An interactive collection of mathematical experiments.",
      `<div class="gallery-layout" id="gallery">
        <section class="gallery-collection" aria-label="Gallery exhibits"><div class="gallery-collection-head"><h2>Explore the collection</h2><span>Select an exhibit to enter the experiment</span></div><div class="gallery-list"></div></section>
        <div class="gallery-main">
          <figure class="gallery-stage" aria-labelledby="gallery-figure-title">
            <div class="daily-figure-label gallery-category">Interactive figure</div>
            <h2 id="gallery-figure-title">Loading figures…</h2>
            <div class="gallery-plot daily-figure-plot"></div>
            <p class="gallery-equation"></p>
            <p class="gallery-telemetry"></p>
            <figcaption class="gallery-caption"></figcaption>
            <div class="gallery-parameters" aria-label="Simulation parameters"></div><div class="gallery-controls">
              <button type="button" class="btn btn-primary" data-gallery-play>Play</button>
              <button type="button" class="btn btn-ghost" data-gallery-replay>Replay</button>
              <label class="sr" for="gallery-timeline">Animation timeline</label>
              <input type="range" id="gallery-timeline" min="0" max="3300" value="0">
              <span class="gallery-elapsed" aria-hidden="true"></span>
              <label>Speed <select data-gallery-speed><option value="0.25">¼×</option><option value="0.5">½×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label>
              <label><input type="checkbox" data-gallery-loop checked> Loop</label>
              <button class="btn btn-ghost" data-gallery-fullscreen>Full screen</button>
              <button class="btn btn-ghost" data-gallery-snapshot>Save PNG</button>
            </div>
          </figure>
          <section class="gallery-python" aria-label="Python example">
            <div class="gallery-python-head"><h2>Reproduce in Python</h2>
              <button type="button" class="btn btn-ghost" data-gallery-copy>${IC.copy} Copy code</button></div>
            <p>Install <code>numpy</code> and <code>matplotlib</code>, then run the script. Scripts reproduce the default exhibit settings. Add <code>--gif figure.gif</code> to save the animation.</p>
            <p class="gallery-code-status" role="status"></p>
            <details class="gallery-code-details"><summary>View Python code</summary><pre><code class="gallery-code"></code></pre></details>
          </section>
        </div>
      </div>`);
  }
  let galleryCodeRequest, disposeGallery;
  async function bindGallery() {
    const root = $("#gallery");
    try {
      const {mountGallery} = await import("./math-gallery.mjs");
      if (!root.isConnected) return;
      disposeGallery = mountGallery(root, {
        initial: routeParams().get("figure"),
        setFigure(id) {
          const params = routeParams();
          params.set("figure", id);
          const url = HASH ? "#gallery?" + params : location.pathname + "?" + params + location.hash;
          history.replaceState(history.state, "", url);
        },
        copy: code => copy(code, "Python code copied"),
        loadCodes() {
          galleryCodeRequest ??= loadJSON("gallery-python").catch(error => { galleryCodeRequest = null; throw error; });
          return galleryCodeRequest;
        },
      });
    } catch {
      if (root.isConnected) root.innerHTML = '<p class="empty" role="status">Could not load the Math Gallery. Please reload to try again.</p>';
    }
  }
  function viewMainulResources() {
    const resources = [
      ["Phase Plane Explorer", "Explore trajectories, nullclines, equilibria and time series of planar systems.", "https://mainul.pages.dev/tools/phase-plane/"],
      ["Numerical mathematics tools", "Open Mainul’s collection of browser-based numerical methods.", "https://mainul.pages.dev/tools/numerical/"],
      ["Research", "Read about mathematical ecology, nonlinear dynamics and bifurcation studies.", "https://mainul.pages.dev/research"],
      ["Publications", "Browse Mainul’s papers and publication records.", "https://mainul.pages.dev/publications"],
    ];
    return page("Resources", "Mainul’s resources", "Mathematics tools and research from Dr. Mainul Hossain.",
      `<div class="people-directory"><ul class="people-list">${resources.map(([label, detail, url]) =>
        `<li class="people-record">${ext(url,label)}<p>${esc(detail)}</p></li>`).join("")}</ul>
      <p>${ext("https://mainul.pages.dev/", "Mainul Hossain’s website")}</p></div>`);
  }

  /* ---------- router ---------- */
  const ROUTES = {
    home: [viewHome, bindHome, "VBMath — Visva-Bharati Mathematics question papers, typed and searchable"],
    search: [viewSearch, bindSearch, "Search questions · VBMath"], papers: [viewPapers, null, "Question papers by semester · VBMath"],
    ...Object.fromEntries(Object.entries(PROGRAMME_ROUTES).map(([code, path]) => [path, [() => viewPapers(code), bindArchive, PROG[code] + " question papers · VBMath"]])),
    scans: [viewScans, bindScans, "Original scanned papers · VBMath"], topics: [viewTopics, bindTopics, "Topics and trends · VBMath"],
    preview: [() => viewPreview(null), () => bindPreview(null), "Paper preview · VBMath"],
    ...Object.entries(EXAM_CODE).reduce((routes, [name, code]) => {
      routes["exams-" + code.toLowerCase()] = [() => viewExams(code), bindArchive, name + " question papers · VBMath"];
      return routes;
    }, {}),
    lectures: [() => viewLearn("lectures"), bindLearn, "Lectures & Notes · VBMath"],
    gallery: [viewGallery, bindGallery, "Math Gallery · VBMath"],
    "mainul-resources": [viewMainulResources, null, "Mainul’s resources · VBMath"],
    websites: [() => viewLearn("websites"), null, "Useful Websites · VBMath"],
    ...Object.fromEntries(Object.entries(PEOPLE_LABELS).map(([key, label]) => ["people-" + key, [() => viewPeople(key), key === "alumni" ? bindAlumni : null, label + " · VBMath"]])),
    exams: [viewExams, null, "JAM, NET, GATE, NBHM, TIFR papers · VBMath"], notes: [viewNotes, bindNotes, "Notes · VBMath"], syllabus: [viewSyllabus, null, "Syllabus · VBMath"],
    books: [viewBooks, null, "Books · VBMath"], learn: [viewLearn, bindLearn, "Videos and websites · VBMath"], tools: [viewTools, null, "Mathematics tools · VBMath"], people: [viewPeople, null, "People · VBMath"],
    guides: [viewGuides, bindGuides, "Guides · VBMath"], contribute: [viewContribute, null, "Contribute · VBMath"], about: [viewAbout, null, "About · VBMath"],
  };
  let lastRoute = null, routeVersion = 0;
  function needsQuestions(route) {
    return /^(?:search|topics|paper-.+|(?:preview|maker)(?:-.+)?)$/.test(route);
  }
  async function route(keepScroll) {
    const r = current(), version = ++routeVersion;
    const dataset = Object.hasOwn(PEOPLE_DATA, r) ? PEOPLE_DATA[r] : null;
    const home = /^(?:home|basket|collection)$/.test(r);
    const standalone = home || r === "gallery" || r === "mainul-resources";
    const needsBank = needsQuestions(r);
    homeObserver?.disconnect();
    homeObserver = null;
    if (!standalone && (!catalogueReady || (needsBank && !questionsReady) || (dataset && !D[dataset]))) {
      if (needsBank && !questionsReady && lastRoute !== null) {
        $("#app").innerHTML = `<div class="loading" role="status">Loading the question bank…</div>`;
      }
      try {
        await Promise.all([
          needsBank ? load() : loadCatalogue(),
          dataset && !D[dataset] ? loadJSON(dataset).then((data) => { D[dataset] = data; }) : null,
        ]);
      }
      catch (error) {
        if (version === routeVersion) $("#app").innerHTML = `<div class="wrap"><div class="empty">The archive could not be loaded (${esc(error.message)}). Please reload the page.</div></div>`;
        return;
      }
      if (version !== routeVersion) return;
    }
    closeMenus();
    if (!HASH && r === "search" && !keepScroll) {
      const params = new URLSearchParams(location.search);
      const exam = params.get("exam"), q = params.get("q"), sem = params.get("sem");
      if (EXAM[exam] || Object.hasOwn(PROG, exam) || q !== null || sem !== null) F = { ...defaultFilters(), kind: EXAM[exam] ? exam : "", prog: Object.hasOwn(PROG, exam) ? exam : "", q: q || "", sem: /^[1-8]$/.test(sem) ? sem : "" };
    }
    let name = r, arg = null;
    const m = r.match(/^(paper|semester|preview|maker)-(.+)$/);
    if (m) { name = m[1]; arg = m[2]; }
    if (r === "basket" || r === "collection") { name = "home"; setTimeout(openDrawer, 50); }
    const app = $("#app");
    disposeGallery?.();
    disposeGallery = undefined;
    studioEvents?.abort();
    studioEvents = undefined;
    if (name === "paper") { app.innerHTML = viewPaper(arg); bindPaper(arg); }
    else if (name === "semester") { app.innerHTML = viewSemester(arg); bindSemester(arg); }
    else if (name === "preview" || name === "maker") { app.innerHTML = viewPreview(arg); bindPreview(arg); setMeta(arg ? "Paper preview · VBMath" : "Question Paper Studio · VBMath"); }
    else if (!ROUTES[name] && name !== "basket" && name !== "collection") { app.innerHTML = `<div class="wrap" style="max-width:720px;padding-block:40px"><div class="eyebrow">Error 404</div><h1>This page isn’t here</h1><p class="lede">The link may be old or mistyped. Search the archive or open a semester instead.</p><p style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><a class="btn btn-primary" href="${L("search")}">Search questions</a><a class="btn btn-ghost" href="${L("papers")}">Papers by semester</a></p></div>`; setMeta("Page not found · VBMath"); }
    else { if (!ROUTES[name]) name = "home"; const [v, b, t] = ROUTES[name]; app.innerHTML = v(); b && b(); setMeta(t, name === "home" ? "Previous-year B.Sc. and M.Sc. Mathematics question papers of Visva-Bharati, typed in LaTeX, searchable by topic, year and paper code, with the original scans." : null); }
    const navName = name === "paper" || name === "semester" ? "papers" : name;
    const navLinks = $$(".nav a");
    navLinks.forEach((a) => {
      const active = a.dataset.r === navName;
      if (active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    $$(".nav .dd").forEach((group) => {
      const active = group.querySelector('[aria-current="page"]') || group.dataset.routes.split(" ").includes(navName);
      group.querySelector(".navbtn").classList.toggle("nav-current", !!active);
    });
    if (!keepScroll && lastRoute !== r) window.scrollTo(0, 0);
    const section = routeParams().get("section");
    const target = section && document.getElementById(section);
    if (target && app.contains(target)) {
      target.focus({preventScroll: true});
      target.scrollIntoView({block: "start"});
    }
    lastRoute = r;
    if (window.matchMedia("(max-width:1040px)").matches) {
      const navEl = $("#nav");
      if (navEl) navEl.hidden = true;
      const menuBtn = $("#menu");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    }
    updateCount();
  }

  /* ---------- chrome ---------- */
  function renderNavigation(nav) {
    const link = (route, label) => `<a href="${L(route)}" data-r="${route}">${label}</a>`;
    const group = (id, label, links, routes) => `<div class="dd" data-routes="${routes}">
      <button class="navbtn" type="button" aria-expanded="false" aria-controls="nav-${id}">${label} <span aria-hidden="true">▾</span></button>
      <div class="dd-menu" id="nav-${id}" hidden>${links.join("")}</div></div>`;
    nav.innerHTML = [
      link("home", "Home"),
      group("pyq", "PYQ", [
        ...Object.entries(PROGRAMME_ROUTES).map(([label, path]) => link(path, label)),
        ...["NET", "GATE", "JAM", "TIFR", "NBHM"].map((e) => link("exams-" + e.toLowerCase(), e)),
        link("exams", "Competitive"), link("search", "Search questions"), link("topics", "Topic map"), link("scans", "Original scans"),
      ], "papers exams search topics scans"),
      group("resources", "Resources", [
        link("notes", "VB Notes"),
        link("lectures", "Lectures &amp; Notes"),
        link("websites", "Useful Websites"),
        link("books", "Books"),
        link("gallery", "Math Gallery"),
        link("mainul-resources", "Mainul’s resources"),
      ], "notes learn books gallery mainul-resources"),
      link("syllabus", "Syllabus"),
      group("people", "People", [
        ...Object.entries(PEOPLE_LABELS).map(([key, label]) => link("people-" + key, label)),
      ], "people"),
      link("preview", "Question Maker"), link("tools", "Tools"), link("guides", "Guides"), link("about", "About"),
    ].join("");
  }
  function initChrome() {
    $$("a[data-r]").forEach((a) => a.setAttribute("href", L(a.dataset.r)));
    const nav = $("#nav");
    renderNavigation(nav);
    if (window.matchMedia("(max-width:1040px)").matches) nav.hidden = true;
    const menu = $("#menu"), toggles = $$(".navbtn", nav);
    const closeGroups = () => toggles.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      document.getElementById(toggle.getAttribute("aria-controls")).hidden = true;
    });
    menu.addEventListener("click", () => {
      nav.hidden = !nav.hidden;
      menu.setAttribute("aria-expanded", String(!nav.hidden));
      if (nav.hidden) closeGroups();
    });
    toggles.forEach((toggle) => toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      closeGroups();
      if (!open) {
        toggle.setAttribute("aria-expanded", "true");
        document.getElementById(toggle.getAttribute("aria-controls")).hidden = false;
      }
    }));
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".dd") || e.target.closest(".dd-menu a")) closeGroups();
    });
    nav.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const open = toggles.find((toggle) => toggle.getAttribute("aria-expanded") === "true");
      if (open) { closeGroups(); open.focus(); }
      else if (window.matchMedia("(max-width:1040px)").matches) {
        nav.hidden = true; menu.setAttribute("aria-expanded", "false"); menu.focus();
      }
    });
    $("#collbtn").addEventListener("click", openDrawer);
    $("#fab").addEventListener("click", openDrawer);
    $("#scrim").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("#drawer").classList.contains("show")) closeDrawer();
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); if (current() !== "search") Promise.resolve(go("search")).then(() => { setTimeout(() => $("#sq")?.focus(), 30); }); else $("#sq")?.focus(); }
    });
    const themeToggle = $("#theme");
    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)");
    const root = document.documentElement;
    const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : preferredDark.matches;
    const syncThemeToggle = () => {
      const dark = isDark();
      const label = dark ? "Switch to light theme" : "Switch to dark theme";
      themeToggle.innerHTML = dark ? IC.sun : IC.moon;
      themeToggle.setAttribute("aria-label", label);
      themeToggle.title = label;
    };
    const savedTheme = store.get("theme", "");
    if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
    syncThemeToggle();
    preferredDark.addEventListener("change", syncThemeToggle);
    themeToggle.addEventListener("click", () => {
      root.dataset.theme = isDark() ? "light" : "dark";
      store.set("theme", root.dataset.theme);
      syncThemeToggle();
    });
    if (HASH) window.addEventListener("hashchange", () => route());
    else window.addEventListener("popstate", () => route());
  }
  function start() {
    initChrome();
    F = Object.assign(defaultFilters(), store.get("filters", {}));
    route();
  }
  start();
})();
