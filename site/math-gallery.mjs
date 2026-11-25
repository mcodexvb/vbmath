import {galleryFigures, renderFigure} from "./math-figures.mjs";

const DURATION = 3300;
const SCALE = 2.05;
const SVG_NS = "http://www.w3.org/2000/svg";
const clamp = value => Math.max(0, Math.min(1, value));

export function mountGallery(root, {copy, loadCodes, initial}) {
  const list = root.querySelector(".gallery-list");
  const plot = root.querySelector(".gallery-plot");
  const title = root.querySelector("#gallery-figure-title");
  const caption = root.querySelector(".gallery-caption");
  const play = root.querySelector("[data-gallery-play]");
  const replay = root.querySelector("[data-gallery-replay]");
  const timeline = root.querySelector("#gallery-timeline");
  const elapsed = root.querySelector(".gallery-elapsed");
  const source = root.querySelector(".gallery-code");
  const details = root.querySelector(".gallery-code-details");
  const copyButton = root.querySelector("[data-gallery-copy]");
  const codeStatus = root.querySelector(".gallery-code-status");
  let current = 0, clock = 0, active = false, raf = 0, previous, tracks = [], marker;

  const buttons = galleryFigures.map(({title: label}, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => select(index));
    list.append(button);
    return button;
  });

  function paint(time) {
    const markerTrack = tracks.find(({node, delay, duration}) =>
      node.classList.contains("trajectory") && time >= delay && time < delay + duration);
    tracks.forEach(({node, delay, duration, draw, opacity}) => {
      const amount = clamp((time - delay) / duration);
      if (draw) node.style.strokeDashoffset = String(1 - amount);
      else node.style.opacity = String(amount * opacity);
    });
    if (marker) {
      marker.style.display = markerTrack ? "" : "none";
      if (markerTrack) {
        const {node, delay, duration} = markerTrack;
        const point = node.getPointAtLength(node.getTotalLength() * clamp((time - delay) / duration));
        marker.setAttribute("cx", point.x);
        marker.setAttribute("cy", point.y);
      }
    }
    timeline.value = String(Math.round(time));
    timeline.setAttribute("aria-valuetext", (time / 1000).toFixed(1) + " seconds");
    elapsed.textContent = (time / 1000).toFixed(1) + " / 3.3 s";
  }

  function playing(on) {
    cancelAnimationFrame(raf);
    active = on;
    previous = undefined;
    play.textContent = on ? "Pause" : "Play";
    if (on) raf = requestAnimationFrame(step);
  }

  function step(now) {
    if (!root.isConnected) return;
    if (previous !== undefined && !document.hidden) clock = Math.min(DURATION, clock + Math.min(50, now - previous));
    previous = now;
    paint(clock);
    if (clock >= DURATION) playing(false);
    else raf = requestAnimationFrame(step);
  }

  function select(index) {
    playing(false);
    current = index;
    const figure = renderFigure(index);
    title.textContent = figure.title;
    caption.textContent = figure.caption;
    plot.innerHTML = figure.graphic;
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === current)));
    const svg = plot.querySelector("svg");
    tracks = [...svg.querySelectorAll(".draw,.reveal")].map(node => {
      const draw = node.classList.contains("draw");
      const opacity = Number.parseFloat(getComputedStyle(node).opacity);
      const delay = (parseFloat(node.style.getPropertyValue("--step")) || 0) * SCALE;
      const duration = (node.classList.contains("trajectory") ? 105 : draw ? 620 : 230) * SCALE;
      if (draw) node.style.strokeDasharray = "1 1";
      return {node, delay, duration, draw, opacity};
    });
    marker = null;
    if (svg.querySelector(".trajectory")) {
      marker = document.createElementNS(SVG_NS, "circle");
      marker.setAttribute("class", "point gallery-trace-head");
      marker.setAttribute("r", "3.2");
      svg.append(marker);
    }
    source.textContent = "";
    if (details.open) showCode(index);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    clock = reduced ? DURATION : 0;
    paint(clock);
    if (!reduced) playing(true);
  }

  async function showCode(index, shouldCopy = false) {
    const id = galleryFigures[index].id;
    codeStatus.textContent = "Loading Python…";
    try {
      const codes = await loadCodes();
      const code = codes[id];
      if (typeof code !== "string") throw Error("Missing Python example");
      if (!root.isConnected || current !== index) return;
      codeStatus.textContent = "";
      source.textContent = code;
      if (shouldCopy) await copy(code);
    } catch {
      if (root.isConnected && current === index) codeStatus.textContent = "Could not load the code. Try again.";
    }
  }

  play.addEventListener("click", () => {
    if (!active && clock >= DURATION) clock = 0;
    playing(!active);
    paint(clock);
  });
  replay.addEventListener("click", () => { clock = 0; paint(clock); playing(true); });
  timeline.addEventListener("input", () => { playing(false); clock = Number(timeline.value); paint(clock); });
  details.addEventListener("toggle", () => { if (details.open) showCode(current); });
  copyButton.addEventListener("click", () => showCode(current,true));
  select(Math.max(0,galleryFigures.findIndex(figure => figure.id === initial)));
}
