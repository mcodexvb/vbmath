const LIBRARIES = [
  ["https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js", "sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H"],
  ["https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js", "sha384-qovJwSBbRDPP5cEjCp8S0UP66wrvnjaa60XMOGzTNanrThcrGfXfnZkvgY8N1KT3"]
];
let libraries;

function loadLibraries() {
  libraries ??= Promise.all(LIBRARIES.map(([url, integrity]) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.integrity = integrity;
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = () => { script.remove(); reject(Error("The PDF renderer could not be loaded.")); };
    document.head.append(script);
  }))).catch((error) => { libraries = null; throw error; });
  return libraries;
}

function inlineMath(sheet) {
  const ns = "http://www.w3.org/2000/svg";
  const serializer = new XMLSerializer();
  // The rasterizer does not reliably hide the screen-reader-only MathML overlay.
  sheet.querySelectorAll("mjx-assistive-mml").forEach((node) => node.remove());
  for (const svg of sheet.querySelectorAll("mjx-container svg")) {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const copy = svg.cloneNode(true);
    const defs = document.createElementNS(ns, "defs");
    const seen = new Set();
    for (const use of copy.querySelectorAll("use")) {
      const href = use.getAttribute("href") || use.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      const glyph = href?.startsWith("#") && document.getElementById(href.slice(1));
      if (glyph && !seen.has(href)) { defs.append(glyph.cloneNode(true)); seen.add(href); }
    }
    copy.prepend(defs);
    copy.setAttribute("width", rect.width);
    copy.setAttribute("height", rect.height);
    copy.style.color = "#111";
    const image = new Image(rect.width, rect.height);
    image.style.verticalAlign = svg.style.verticalAlign;
    image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serializer.serializeToString(copy));
    svg.replaceWith(image);
  }
}

function paginate(sheet, host) {
  const header = [...sheet.children].filter((child) => !child.matches(".paper-content"));
  const groups = [];
  let pending = [];
  for (const child of sheet.querySelector(".paper-content").children) {
    if (child.matches(".sec-head")) { pending.push(child); continue; }
    for (const question of [...child.children]) {
      if (question.matches(".pv-or-div")) { pending.push(question); continue; }
      groups.push([...pending, question]);
      pending = [];
    }
  }
  const pages = [];
  const nextPage = () => {
    const page = document.createElement("article");
    page.className = "a4 pdf-page";
    page.append(document.createElement("div"));
    host.append(page);
    pages.push(page);
    return page;
  };
  let page = nextPage();
  page.firstElementChild.append(...header);
  groups.forEach((group) => {
    const block = document.createElement("div");
    block.className = "pdf-question";
    block.append(...group);
    const body = page.firstElementChild;
    const hadContent = body.childElementCount > 0;
    body.append(block);
    const padding = parseFloat(getComputedStyle(page).paddingTop);
    if (hadContent && body.offsetHeight > page.clientHeight - 2 * padding) {
      page = nextPage();
      page.firstElementChild.append(block);
    }
  });
  sheet.remove();
  return pages;
}

export async function downloadPaperPdf(markup, filename, typeset) {
  const host = document.createElement("div");
  host.className = "pdf-export";
  host.setAttribute("aria-hidden", "true");
  host.innerHTML = markup;
  const sheet = host.firstElementChild;
  sheet.removeAttribute("id");
  sheet.classList.add("pdf-page");
  document.body.append(host);
  try {
    await Promise.all([loadLibraries(), typeset(sheet), document.fonts.ready]);
    inlineMath(sheet);
    await Promise.all([...sheet.querySelectorAll("img")].map((img) => img.decode().catch(() => {})));
    const pages = paginate(sheet, host);
    const pdf = new window.jspdf.jsPDF({format:"a4", unit:"mm", compress:true});
    pdf.setProperties({title:filename.replace(/\.pdf$/,""), creator:"VBMath"});
    let printed = 0;
    for (const page of pages) {
      const height = page.clientHeight;
      const canvas = await window.html2canvas(page, {
        scale:2.25, backgroundColor:"#ffffff", logging:false, useCORS:true,
        windowWidth:1000, scrollX:0, scrollY:0, width:page.clientWidth, height:Math.max(height, page.scrollHeight),
        ignoreElements: (node) => node.parentElement === document.body ? node !== host : node.parentElement === host && node !== page
      });
      const scale = canvas.width / 210;
      const edge = Math.round(15 * scale);
      const length = Math.round(267 * scale);
      // Ordinary pages fit complete questions. Only oversized blocks need an overflow page.
      const contentBottom = edge + Math.ceil(page.firstElementChild.offsetHeight * canvas.width / page.clientWidth);
      for (let start = edge; start < Math.max(edge + 1, contentBottom); start += length) {
        if (printed++) pdf.addPage();
        const cut = document.createElement("canvas");
        cut.width = canvas.width;
        cut.height = Math.min(length, canvas.height - start);
        cut.getContext("2d").drawImage(canvas, 0, start, cut.width, cut.height, 0, 0, cut.width, cut.height);
        pdf.addImage(cut.toDataURL("image/jpeg", .96), "JPEG", 0, 15, 210, cut.height / scale);
        cut.width = cut.height = 0;
      }
      canvas.width = canvas.height = 0;
      page.remove();
    }
    for (let i = 1; i <= printed; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(80);
      pdf.text(i + " / " + printed, 105, 288, {align:"center"});
    }
    pdf.save(filename);
  } finally {
    host.remove();
  }
}
