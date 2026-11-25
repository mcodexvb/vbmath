import {galleryFigures, renderFigure} from "./math-figures.mjs";
import {mountSimulation, simulations} from "./gallery-simulations.mjs";

import {laboratory, mountLab} from "./gallery-lab.mjs";

const DURATION = 12000;
const SCALE = 7.4;
const SVG_NS = "http://www.w3.org/2000/svg";
const clamp = value => Math.max(0, Math.min(1, value));
const exhibits = [...laboratory, ...simulations, ...galleryFigures.map((figure, index) => ({...figure, index}))
  .filter(figure => !simulations.some(simulation => simulation.id === figure.id))];

export function mountGallery(root, {copy, loadCodes, initial}) {
  const list = root.querySelector(".gallery-list");
  const plot = root.querySelector(".gallery-plot");
  const title = root.querySelector("#gallery-figure-title");
  const caption = root.querySelector(".gallery-caption");
  const equation = root.querySelector(".gallery-equation");
  const telemetry = root.querySelector(".gallery-telemetry");
  const category = root.querySelector(".gallery-category");
  const play = root.querySelector("[data-gallery-play]");
  const replay = root.querySelector("[data-gallery-replay]");
  const timeline = root.querySelector("#gallery-timeline");
  const elapsed = root.querySelector(".gallery-elapsed");
  const source = root.querySelector(".gallery-code");
  const details = root.querySelector(".gallery-code-details");
  const copyButton = root.querySelector("[data-gallery-copy]");
  const codeStatus = root.querySelector(".gallery-code-status");
  let current = 0, clock = 0, active = false, raf = 0, previous, tracks = [], marker;
  let duration = DURATION, drawSimulation, options = {}, speed = 1, loop = true, customPath, visible = false;
  const parameterPanel = root.querySelector('.gallery-parameters');
  const stage = root.querySelector('.gallery-stage');
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}, {rootMargin:'100px'});observer.observe(stage);

  const buttons = exhibits.map((exhibit, index) => {
    const button = document.createElement("button");
    button.type = "button";
    const thumb = document.createElement('span'); thumb.className='gallery-thumbnail';
    if(exhibit.build) {const img=document.createElement('img');img.src='/assets/gallery/'+exhibit.id+'.webp';img.alt='';img.loading='lazy';img.width=480;img.height=270;thumb.append(img);}
    else if(!exhibit.build) thumb.innerHTML=renderFigure(exhibit.index).graphic;

    const label=document.createElement('strong');label.textContent=exhibit.title;
    const kind=document.createElement('small');kind.textContent=exhibit.kind||'Mathematical construction';
    button.append(thumb,kind,label);
    button.addEventListener("click", () => {select(index);stage.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
    list.append(button);
    return button;
  });
  function setParameters(exhibit){
    parameterPanel.replaceChildren();options={};
    const rebuild=()=>{playing(false);drawSimulation=mountLab(plot,exhibit,options);clock=0;paint(clock);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)playing(true);};
    for(const p of exhibit.controls||[]){
      const label=document.createElement('label'),input=document.createElement('input'),out=document.createElement('output');
      label.append(p.label+' ',out);input.type='range';Object.assign(input,{min:p.min,max:p.max,step:p.step,value:p.value});options[p.key]=p.value;out.value=p.value;label.append(input);
      input.addEventListener('input',()=>{out.value=input.value;});input.addEventListener('change',()=>{options[p.key]=Number(input.value);rebuild();});parameterPanel.append(label);
    }
    for(const [key,name,values] of exhibit.selects||[]){const label=document.createElement('label'),input=document.createElement('select');label.append(name);for(const [value,text] of values)input.add(new Option(text,value));options[key]=values[0][0];input.onchange=()=>{options[key]=input.value;rebuild();};label.append(input);parameterPanel.append(label);}
    for(const [key,name,value] of exhibit.toggles||[]){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=value;options[key]=value;input.onchange=()=>{options[key]=input.checked;paint(clock);};label.append(input,' '+name);parameterPanel.append(label);}
    if(exhibit.id==='fourier-portrait'){
      const button=document.createElement('button');button.className='btn btn-ghost';button.textContent='Draw your own';
      button.onclick=()=>{playing(false);customPath=[];plot.classList.add('is-drawing');plot.querySelector('canvas').getContext('2d').clearRect(0,0,960,540);button.textContent='Drag in the canvas; release to reconstruct';};parameterPanel.append(button);
      const reset=document.createElement('button');reset.className='btn btn-ghost';reset.textContent='Restore portrait';reset.onclick=()=>{customPath=null;delete options.path;plot.classList.remove('is-drawing');rebuild();};parameterPanel.append(reset);
    }
  }
  let drawing=false;
  plot.addEventListener('pointerdown',event=>{
    const canvas=plot.querySelector('canvas');if(!canvas)return;const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*960/r.width,y=(event.clientY-r.top)*540/r.height;
    if(exhibits[current].id==='duffing-atlas' && x<640){options.seed=[Math.max(-2.2,Math.min(2.2,(x-330)/125)),Math.max(-1.8,Math.min(1.8,(270-y)/125))];drawSimulation=mountLab(plot,exhibits[current],options);clock=0;paint(0);return;}
    if(!plot.classList.contains('is-drawing'))return;drawing=true;customPath=[[(x-540)/164,(y-247)/164]];plot.setPointerCapture(event.pointerId);
  });
  plot.addEventListener('pointermove',event=>{if(!drawing)return;const canvas=plot.querySelector('canvas'),r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*960/r.width,y=(event.clientY-r.top)*540/r.height,prev=customPath.at(-1);customPath.push([(x-540)/164,(y-247)/164]);const c=canvas.getContext('2d');c.strokeStyle='#f3ce85';c.lineWidth=2;c.beginPath();c.moveTo(540+prev[0]*164,247+prev[1]*164);c.lineTo(x,y);c.stroke();});
  const finishDrawing=()=>{if(!drawing)return;drawing=false;plot.classList.remove('is-drawing');if(customPath.length>3){customPath.push(customPath[0]);options.path=customPath;}drawSimulation=mountLab(plot,exhibits[current],options);clock=0;paint(0);playing(true);};
  plot.addEventListener('pointerup',finishDrawing);plot.addEventListener('pointercancel',finishDrawing);
  root.querySelector('[data-gallery-speed]').onchange=e=>{speed=Number(e.target.value);};
  root.querySelector('[data-gallery-loop]').onchange=e=>{loop=e.target.checked;};
  root.querySelector('[data-gallery-fullscreen]').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{stage.classList.toggle('gallery-expanded');}};
  root.querySelector('[data-gallery-snapshot]').onclick=()=>{const canvas=plot.querySelector('canvas');if(!canvas)return;const exported=document.createElement('canvas');exported.width=canvas.width;exported.height=canvas.height;const context=exported.getContext('2d');context.fillStyle='#0a2424';context.fillRect(0,0,exported.width,exported.height);context.drawImage(canvas,0,0);exported.toBlob(blob=>{if(!blob)return;const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=exhibits[current].id+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});};

  function paint(time) {
    if (drawSimulation) telemetry.textContent = drawSimulation(time / 1000);
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
    elapsed.textContent = (time / 1000).toFixed(1) + " / " + duration / 1000 + " s";
  }

  function playing(on) {
    cancelAnimationFrame(raf);
    active = on;
    previous = undefined;
    play.textContent = on ? "Pause" : "Play";
    if (on) raf = requestAnimationFrame(step);
  }

  function step(now) {
    if (!root.isConnected) {observer.disconnect();return;}
    if (previous !== undefined && !document.hidden && visible) clock = Math.min(duration, clock + speed * Math.min(80, now - previous));
    previous = now;
    if(visible && !document.hidden) paint(clock);
    if (clock >= duration) {if(loop){clock=0;raf=requestAnimationFrame(step);}else playing(false);}
    else raf = requestAnimationFrame(step);
  }

  function select(index) {
    playing(false);
    current = index;
    const exhibit = exhibits[index];
    const figure = exhibit.build ? exhibit : renderFigure(exhibit.index);
    title.textContent = figure.title;
    caption.textContent = figure.caption;
    equation.textContent = exhibit.equation || "";
    category.textContent = exhibit.kind || "Mathematical figure";
    telemetry.textContent = "";
    plot.classList.toggle("gallery-plot-simulation", Boolean(exhibit.build));
    plot.classList.remove("is-drawing");customPath=null;drawing=false;
    setParameters(exhibit);
    root.querySelector("[data-gallery-snapshot]").disabled=!exhibit.build;
    duration = exhibit.build ? exhibit.seconds * 1000 : DURATION;
    timeline.max = String(duration);
    drawSimulation = null;
    tracks = [];
    marker = null;
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === current)));
    if (exhibit.build) {
      drawSimulation = laboratory.includes(exhibit) ? mountLab(plot, exhibit,options) : mountSimulation(plot, exhibit);
    } else {
      plot.innerHTML = figure.graphic;
      const svg = plot.querySelector("svg");
      tracks = [...svg.querySelectorAll(".draw,.reveal")].map(node => {
      const draw = node.classList.contains("draw");
      const opacity = Number.parseFloat(getComputedStyle(node).opacity);
      const delay = (parseFloat(node.style.getPropertyValue("--step")) || 0) * SCALE;
      const duration = (node.classList.contains("trajectory") ? 105 : draw ? 620 : 230) * SCALE;
      if (draw) node.style.strokeDasharray = "1 1";
      return {node, delay, duration, draw, opacity};
      });
      if (svg.querySelector(".trajectory")) {
        marker = document.createElementNS(SVG_NS, "circle");
        marker.setAttribute("class", "point gallery-trace-head");
        marker.setAttribute("r", "3.2");
        svg.append(marker);
      }
    }
    history.replaceState(null, "", "?figure="+encodeURIComponent(exhibit.id));
    source.textContent = "";
    codeStatus.textContent = "";
    if (details.open) showCode(index);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    clock = reduced ? (exhibit.build ? duration * .62 : duration) : 0;
    paint(clock);
    if (!reduced) playing(true);
  }

  async function showCode(index, shouldCopy = false) {
    const id = exhibits[index].id;
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
    if (!active && clock >= duration) clock = 0;
    playing(!active);
    paint(clock);
  });
  replay.addEventListener("click", () => { clock = 0; paint(clock); playing(true); });
  timeline.addEventListener("input", () => { playing(false); clock = Number(timeline.value); paint(clock); });
  details.addEventListener("toggle", () => { if (details.open) showCode(current); });
  copyButton.addEventListener("click", () => showCode(current,true));
  select(Math.max(0,exhibits.findIndex(figure => figure.id === initial)));
}
