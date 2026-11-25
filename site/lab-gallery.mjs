import {exhibits, exhibitCategories, exhibitTips, mountExhibit} from "./lab-exhibits.mjs";

const find = (root, selector) => root.querySelector(selector);

export function mountLabGallery(root, {initial, setFigure}) {
  root.innerHTML = `
    <div class="lab-gallery">
      <aside class="lab-exhibits" aria-label="Choose a mathematical exhibit">
        <label for="lab-search">Find an exhibit</label>
        <input type="search" id="lab-search" placeholder="Search exhibits" autocomplete="off">
        <label for="lab-topic">Topic</label>
        <select id="lab-topic"><option value="">All topics</option></select>
        <div class="lab-count muted" role="status"></div>
        <div class="lab-list"></div>
      </aside>
      <div class="lab-workspace">
        <header class="lab-exhibit-head">
          <h2 id="lab-title"></h2>
          <p id="lab-equation" class="lab-equation"></p>
        </header>
        <div class="lab-stage"></div>
        <div class="lab-actions" role="group" aria-label="Playback">
          <button type="button" class="btn btn-primary btn-sm" data-play></button>
          <button type="button" class="btn btn-ghost btn-sm" data-restart>Restart</button>
          <button type="button" class="btn btn-ghost btn-sm" data-save>Save PNG</button>
          <button type="button" class="btn btn-ghost btn-sm" data-fullscreen>Full screen</button>
        </div>
        <p class="lab-description" id="lab-description"></p>
        <p class="lab-tip muted"></p>
        <div class="lab-parameters" role="group" aria-label="Simulation parameters"></div>
      </div>
    </div>`;
  const search = find(root,"#lab-search");
  const topic = find(root,"#lab-topic");
  const list = find(root,".lab-list");
  const count = find(root,".lab-count");
  const stage = find(root,".lab-stage");
  const parameters = find(root,".lab-parameters");
  const play = find(root,"[data-play]");
  const fullscreen = find(root,"[data-fullscreen]");
  const categories = new Map();
  const settings = new Map();
  let current, simulation, canvas;

  for (const [key,[label,,,ids]] of Object.entries(exhibitCategories)) {
    topic.add(new Option(label,key));
    for (const id of ids) categories.set(id,key);
  }
  const redrawList = () => {
    const query = search.value.trim().toLowerCase();
    const shown = exhibits.filter((exhibit) => {
      const matchesTopic = !topic.value || categories.get(exhibit.id) === topic.value;
      return matchesTopic && [exhibit.title, exhibit.eq, ...exhibit.tags].join(" ").toLowerCase().includes(query);
    });
    list.replaceChildren(...shown.map((exhibit) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = exhibit.title;
      button.setAttribute("aria-pressed", String(exhibit === current));
      button.onclick = () => {
        select(exhibit);
        if (matchMedia("(max-width:760px)").matches) {
          find(root,"#lab-title").scrollIntoView({block:"start"});
        } else find(root,".lab-list [aria-pressed=true]")?.focus();
      };
      return button;
    }));
    count.textContent = shown.length === exhibits.length ? exhibits.length + " exhibits" :
      shown.length + " of " + exhibits.length + " exhibits";
  };
  const syncPlayback = () => {
    play.textContent = simulation.playing ? "Pause" : "Play";
  };
  const control = (name, min, max, step, value, apply) => {
    const label = document.createElement("label");
    const title = document.createElement("span");
    title.textContent = name;
    const slider = document.createElement("input");
    slider.type = "range";
    Object.assign(slider, {min, max, step, value});
    const output = document.createElement("output");
    output.value = slider.value;
    slider.oninput = () => { output.value = slider.value; };
    slider.onchange = () => apply(slider.valueAsNumber);
    label.append(title, slider, output);
    return label;
  };
  function select(exhibit) {
    if (current === exhibit) return;
    simulation?.destroy();
    current = exhibit;
    canvas = document.createElement("canvas");
    canvas.setAttribute("role","img");
    canvas.setAttribute("aria-labelledby","lab-title");
    canvas.setAttribute("aria-describedby","lab-description");
    stage.replaceChildren(canvas);
    simulation = mountExhibit(canvas, exhibit.id);
    const values = settings.get(exhibit.id) || {};
    settings.set(exhibit.id, values);
    find(root,"#lab-title").textContent = exhibit.title;
    find(root,"#lab-equation").textContent = exhibit.eq;
    find(root,"#lab-description").textContent = exhibit.desc;
    find(root,".lab-tip").textContent = exhibitTips[exhibit.id] || "";
    parameters.replaceChildren(...exhibit.p.map(([key, name, min, max, step, value]) => {
      const initialValue = values[key] ?? value;
      simulation.set(key,initialValue);
      return control(name,min,max,step,initialValue,(next) => {
        values[key] = next;
        simulation.set(key,next);
      });
    }));
    simulation.state.speed = values.speed ?? 1;
    parameters.append(control("Speed", .2, 3, .1, simulation.state.speed, (speed) => {
      simulation.state.speed = speed;
      values.speed = speed;
    }));
    fullscreen.hidden = !stage.requestFullscreen;
    syncPlayback();
    redrawList();
    setFigure(exhibit.id);
  }
  search.oninput = redrawList;
  topic.onchange = redrawList;
  play.onclick = () => { simulation.setPlaying(!simulation.playing); syncPlayback(); };
  find(root,"[data-restart]").onclick = () => simulation.restart();
  find(root,"[data-save]").onclick = () => {
    const image = document.createElement("canvas");
    image.width = canvas.width;
    image.height = canvas.height;
    const context = image.getContext("2d");
    context.fillStyle = "#091d24";
    context.fillRect(0,0,image.width,image.height);
    context.drawImage(canvas,0,0);
    const id = current.id;
    image.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "vbmath-" + id + ".png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url),1000);
    });
  };
  fullscreen.onclick = () => stage.requestFullscreen().catch(() => {});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const updateMotion = () => {
    if (reduced.matches) { simulation.setPlaying(false); syncPlayback(); }
  };
  reduced.addEventListener("change",updateMotion);
  select(exhibits.find(({id}) => id === initial) || exhibits[0]);
  return () => {
    simulation.destroy();
    reduced.removeEventListener("change",updateMotion);
  };
}
