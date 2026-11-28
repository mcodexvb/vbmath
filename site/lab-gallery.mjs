// Math Gallery: an explorable essay. Each idea gets a few lines of explanation,
// a live figure, its controls directly underneath, and things to try.
import {exhibits, exhibitCategories, exhibitTips, mountExhibit} from "./lab-exhibits.mjs?v=3.4";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// Order of the essay: from waves and curves, through iteration, to chaos and physics.
const ORDER = ["wave", "curve", "frac", "uni", "chaos", "phys"];
const INTRO = {
  wave: "Almost every repeating shape can be built by adding simple waves. Turn the number of terms up and down and watch the picture sharpen or blur.",
  curve: "Roll a circle along a line or around another circle and a point on it draws a curve. Small changes in a ratio give completely different families.",
  frac: "Repeat one simple rule again and again. Sometimes the answer settles quickly; sometimes it builds structure at every scale.",
  uni: "Ideas straight from the B.Sc. and M.Sc. syllabus: complex dynamics, series, matrices, population models and optimisation.",
  chaos: "Deterministic rules whose long-term behaviour cannot be predicted in practice, because tiny differences grow exponentially.",
  phys: "Motion under forces and flows: orbits, rockets, heat spreading along a rod, and vortices shed behind an obstacle."
};
// Notes from the VBMath Lab file, matched to the controls each exhibit has here.
const NOTES = {
  portrait: {seen: "Audio and image compression, signal filtering.", tries: ["Slide to 5 circles: only the coarse outline survives.", "Go to 70: fine corners and details return."]},
  square: {seen: "Synthesizers, digital signals and Gibbs ringing in signal processing.", tries: ["One harmonic is a pure sine. Add more and watch the corners sharpen.", "Switch to the triangle wave: its spectrum bars shrink much faster."]},
  lissajous: {seen: "Oscilloscope frequency comparison and vibration analysis.", tries: ["Set a = b: an ellipse that opens and closes as δ drifts.", "Try coprime pairs such as 5 : 4 for a dense woven knot."]},
  interference: {seen: "Noise-cancelling headphones, antenna arrays and the double-slit experiment.", tries: ["Two sources: count the bright fringes on the screen curve.", "Shrink the wavelength: the fringes become finer and more numerous."]},
  spiro: {seen: "The classic drawing toy, and the geometry of gear teeth.", tries: ["Pen offset 1.0 gives pointed cusps; above 1.0 the curve forms loops."]},
  epicycloid: {seen: "Cycloidal gear tooth profiles.", tries: ["k = 2 draws a nephroid; every extra step adds one cusp."]},
  cycloid: {seen: "Brachistochrone slides and Huygens’ cycloidal pendulum clock.", tries: ["Watch the tracing point as it touches the ground: for an instant it is at rest."]},
  bezier: {seen: "Fonts, SVG paths, CAD and animation easing.", tries: ["Follow one level of the construction: each coloured line slides at the same fraction t."]},
  roots: {seen: "The fast Fourier transform, and Gauss’s construction of the regular 17-gon.", tries: ["Raise n and watch the chords weave a rose-like web."]},
  newton: {seen: "How calculators compute square roots; root-finding in solvers.", tries: ["Watch the error readout: the exponent roughly doubles each step.", "Start far from the root and compare the first jump."]},
  sierpinski: {seen: "Fractal antennas and Pascal’s triangle mod 2.", tries: ["Count the triangles at each step: 1, 3, 9, 27, …"]},
  mandel: {seen: "Complex dynamics and fractal art; the Mandelbrot set is a map of all Julia sets.", tries: ["Zoom into the boundary: it never gets simpler.", "Switch to Julia mode and slide c: inside the Mandelbrot set the Julia set is one piece, outside it shatters into dust."]},
  lorenz: {seen: "Why weather forecasts fail beyond a week or two.", tries: ["Watch the separation graph grow by orders of magnitude.", "Set ρ near 14: the motion spirals in and settles. At 28 it never does."]},
  pendulum: {seen: "Robot-arm dynamics and classroom chaos demonstrations.", tries: ["Watch the twin: for a while it shadows the main pendulum, then breaks away."]},
  vanderpol: {seen: "Early radio circuits, heartbeat and neuron models.", tries: ["μ ≈ 0.1: a near-circular loop.", "μ = 4: sharp, relaxation-style jumps."]},
  logistic: {seen: "Population ecology and the study of routes to chaos.", tries: ["Follow the sweep to r ≈ 3.83: a window of period-3 order inside the chaos."]},
  clifford: {seen: "Generative art and the study of strange attractors.", tries: ["Change a by 0.05 at a time and watch the structure bloom and collapse."]},
  satellite: {seen: "GPS and communications satellites, comet orbits.", tries: ["e = 0 gives a circle at constant speed.", "At 0.85 the satellite whips past the planet and crawls at the far end."]},
  rocket: {seen: "Mission design, and why real rockets are built in stages.", tries: ["Sweep the mass ratio from 5 to 16 and compare the paths against the ideal Δv readout."]},
  heat: {seen: "Cooling of materials, spreading of pollutants, and option pricing.", tries: ["Compare cold ends with insulated ends: only one keeps its heat."]},
  eddy: {seen: "Chimneys, bridge cables and ocean wakes that sing in the wind.", tries: ["Raise the strength: the wake swirls harder.", "Shorten the period for a tightly packed street."]}
};
const CONCEPTS = {
  "Fourier series": "Any periodic shape is a sum of waves, or rotating circles, of different sizes and speeds.",
  "Superposition": "Complex behaviour built by adding simple parts together.",
  "Chaos": "Deterministic rules with unpredictable long-term outcomes: tiny differences grow exponentially.",
  "Phase space": "A map of every state a system can be in; each trajectory is one possible history.",
  "Limit cycle": "An isolated closed orbit that nearby trajectories spiral toward.",
  "Bifurcation": "A sudden qualitative change in behaviour as a parameter crosses a threshold.",
  "Iteration": "Repeating a rule, feeding each output back in as the next input.",
  "Convergence": "Successive approximations closing in on a fixed value.",
  "Self-similarity": "Each part resembles the whole at a smaller scale.",
  "Conservation law": "A quantity (energy, area swept, total heat) that stays constant as the system evolves.",
  "Diffusion": "Spreading from high to low concentration; peaks flatten while the total is conserved.",
  "Orbit": "The path of a body bound by gravity, an ellipse for two bodies.",
  "Vorticity": "Local spinning of a fluid; vortices form in wakes behind obstacles.",
  "Parametric curve": "A curve given by position functions of one parameter, usually time.",
  "Rolling": "Curves traced by a point on a circle that rolls without slipping.",
  "Numerical integration": "Stepping a differential equation forward in small time steps (Runge–Kutta 4 or finite differences).",
  "Complex dynamics": "Iterating a function of a complex number; the points that stay bounded form fractal sets.",
  "Interference": "Waves add. Crest on crest reinforces, crest on trough cancels, producing fringes.",
  "Eigenvalues": "The stretch factors along directions that a matrix does not turn."
};

export function mountLabGallery(root, {initial, setFigure}) {
  const byId = new Map(exhibits.map((e) => [e.id, e]));
  const cats = ORDER.filter((k) => exhibitCategories[k]).map((k) => {
    const [name, , , ids] = exhibitCategories[k];
    return {k, name, list: ids.map((id) => byId.get(id)).filter(Boolean)};
  });
  const placed = new Set(cats.flatMap((c) => c.list.map((e) => e.id)));
  const rest = exhibits.filter((e) => !placed.has(e.id));
  if (rest.length) cats.push({k: "more", name: "More", list: rest});

  const control = ([key, label, min, max, step, value]) => {
    // controls written as "Mode (1 Mandelbrot, 2 Julia)" become a row of buttons
    const m = label.match(/^(.*?)\s*\((\d[^)]*)\)$/);
    const choices = m ? m[2].split(/,\s*/).map((x) => { const q = x.match(/^(\d+)\s+(.+)$/); return q ? [+q[1], q[2]] : null; }) : null;
    if (choices && choices.every(Boolean) && step === 1 && choices.length === max - min + 1)
      return `<div class="gx-ctl gx-choice" role="radiogroup" aria-label="${esc(m[1])}"><span class="gx-lab">${esc(m[1])}</span><span class="gx-opts">${choices.map(([v, t]) =>
        `<button type="button" role="radio" data-key="${esc(key)}" data-val="${v}" aria-checked="${v === value}">${esc(t)}</button>`).join("")}</span></div>`;
    return `<label class="gx-ctl"><span class="gx-lab">${esc(label)}</span><input type="range" data-key="${esc(key)}" min="${min}" max="${max}" step="${step}" value="${value}"><output>${value}</output></label>`;
  };
  const figure = (e, n) => {
    const notes = NOTES[e.id] || {};
    const tip = exhibitTips[e.id];
    return `<section class="gx-ex" id="${esc(e.id)}" data-id="${esc(e.id)}">
      <h3><a href="#${esc(e.id)}" class="gx-anchor" aria-label="Link to ${esc(e.title)}">#</a>${esc(e.title)}</h3>
      <p>${esc(e.desc)}</p>
      <p class="gx-eq"><code>${esc(e.eq)}</code></p>
      <figure class="gx-sketch">
        <div class="gx-stage"><canvas role="img" aria-label="${esc(e.title)}, live simulation"></canvas><span class="gx-n" aria-hidden="true">${n}</span></div>
        <div class="gx-bar" role="group" aria-label="Playback for ${esc(e.title)}">
          <button type="button" data-act="play">Pause</button><button type="button" data-act="restart">Restart</button><button type="button" data-act="png">Save PNG</button><button type="button" data-act="full">Full screen</button>
        </div>
        <div class="gx-ctls">${e.p.map(control).join("")}<label class="gx-ctl"><span class="gx-lab">Speed</span><input type="range" data-key="speed" min="0" max="3" step="0.1" value="1"><output>1</output></label></div>
        ${tip ? `<figcaption class="gx-tip">${esc(tip)}</figcaption>` : ""}
      </figure>
      ${notes.tries?.length ? `<ul class="gx-try">${notes.tries.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${notes.seen ? `<p class="gx-seen"><strong>Seen in:</strong> ${esc(notes.seen)}</p>` : ""}
    </section>`;
  };
  let n = 0;
  const usedTags = new Map();
  exhibits.forEach((e) => e.tags.forEach((t) => { if (!usedTags.has(t)) usedTags.set(t, []); usedTags.get(t).push(e); }));
  root.innerHTML = `<div class="gx">
    <header class="gx-head"><canvas class="gx-headfig" aria-hidden="true"></canvas>
      <div class="gx-headtext"><h2>Mathematics you can play with</h2><p>${exhibits.length} live simulations, each with its equation, a short explanation and controls to change it.</p></div></header>
    <nav class="gx-toc" aria-label="Topics"><ul>${cats.map((c) => `<li><a href="#t-${c.k}">${esc(c.name)}</a></li>`).join("")}<li><a href="#concepts">Concepts</a></li></ul></nav>
    <div class="gx-body">
      ${cats.map((c) => `<section class="gx-topic" id="t-${c.k}"><h2>${esc(c.name)}</h2>${INTRO[c.k] ? `<p class="gx-intro">${esc(INTRO[c.k])}</p>` : ""}${c.list.map((e) => figure(e, ++n)).join("")}</section>`).join("")}
      <section class="gx-topic" id="concepts"><h2>Concepts</h2><p class="gx-intro">The ideas that connect the exhibits, with links to the exhibits that show them.</p>
        <dl class="gx-concepts">${Object.entries(CONCEPTS).filter(([k]) => usedTags.has(k)).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)} <span class="gx-links">${usedTags.get(k).map((e) => `<a href="#${esc(e.id)}">${esc(e.title)}</a>`).join(" · ")}</span></dd>`).join("")}</dl></section>
    </div></div>`;

  const sims = [];
  root.querySelectorAll(".gx-ex").forEach((sec) => {
    const id = sec.dataset.id, canvas = sec.querySelector("canvas");
    const sim = mountExhibit(canvas, id);
    sims.push(sim);
    byId.get(id).p.forEach(([key, , , , , value]) => sim.set(key, value));
    const play = sec.querySelector('[data-act="play"]');
    const syncPlay = () => { play.textContent = sim.playing ? "Pause" : "Play"; };
    syncPlay();
    sec.addEventListener("input", (ev) => {
      const r = ev.target.closest("input[type=range]");
      if (!r) return;
      r.nextElementSibling.value = r.value;
      if (r.dataset.key === "speed") sim.state.speed = r.valueAsNumber; else sim.set(r.dataset.key, r.valueAsNumber);
    });
    sec.addEventListener("click", (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.key) {
        b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
        sim.set(b.dataset.key, +b.dataset.val);
        return;
      }
      const act = b.dataset.act;
      if (act === "play") { sim.setPlaying(!sim.playing); syncPlay(); }
      else if (act === "restart") sim.restart();
      else if (act === "full") sec.querySelector(".gx-stage").requestFullscreen?.().catch(() => {});
      else if (act === "png") {
        const out = document.createElement("canvas");
        out.width = canvas.width; out.height = canvas.height;
        const g = out.getContext("2d");
        g.fillStyle = "#0b2026"; g.fillRect(0, 0, out.width, out.height); g.drawImage(canvas, 0, 0);
        out.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob); a.download = "vbmath-" + id + ".png"; a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        });
      }
    });
    if (!document.fullscreenEnabled) sec.querySelector('[data-act="full"]').hidden = true;
  });

  // a quiet live figure behind the page title
  const head = mountExhibit(root.querySelector(".gx-headfig"), "lissajous");
  head.set("a", 5); head.set("b", 4);
  sims.push(head);

  // in-page links scroll smoothly, and the address remembers the exhibit for sharing
  root.querySelectorAll(".gx-toc a, .gx-anchor, .gx-concepts a").forEach((a) => a.addEventListener("click", (ev) => {
    const target = root.querySelector(a.getAttribute("href"));
    if (!target) return;
    ev.preventDefault();
    target.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"});
    if (target.classList.contains("gx-ex")) setFigure(target.id);
  }));
  if (initial && byId.has(initial)) requestAnimationFrame(() => root.querySelector("#" + CSS.escape(initial))?.scrollIntoView({block: "start"}));

  return () => sims.forEach((s) => s.destroy());
}
