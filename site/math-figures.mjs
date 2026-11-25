/* Small, self-contained plots. This module is requested only when the panel is visible. */
const TAU = 2 * Math.PI;
const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 170;
const interval = (n, fn) => Array.from({length: n}, (_, i) => fn(i));
const points = (n, fn) => interval(n + 1, i => fn(i / n));
const round = x => Math.round(x * 100) / 100;
const tag = (name, attrs, content = "") => {
  const attributes = Object.entries(attrs).map(([key, value]) => ' ' + key + '="' + value + '"').join("");
  return "<" + name + attributes + ">" + content + "</" + name + ">";
};
const path = (d, kind, delay = 0) => tag("path", {d, class: kind, pathLength: 1, style: "--step:" + delay + "ms"});
const line = (a, b, kind = "axis", delay = 0) => path("M" + a.join(",") + "L" + b.join(","), kind, delay);
const dot = ([cx, cy], r = 3, kind = "point", delay = 0) => tag("circle", {cx, cy, r, class: kind, style: "--step:" + delay + "ms"});
const text = (x, y, label, anchor = "middle") => tag("text", {x, y, "text-anchor": anchor}, label);
const trace = (data, project, kind = "draw", delay = 0) => path(data.map((pt, i) =>
  (i ? "L" : "M") + project(pt).join(",")).join(""), kind, delay);

function mapper([xmin, xmax, ymin, ymax], [x, y, w, h]) {
  return ([u, v]) => [round(x + w * (u - xmin) / (xmax - xmin)), round(y + h * (ymax - v) / (ymax - ymin))];
}
function fitted(data, [x, y, w, h] = [28, 11, 424, 148]) {
  const xs = data.map(pt => pt[0]), ys = data.map(pt => pt[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min(w / ((maxX - minX) || 1), h / ((maxY - minY) || 1));
  const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
  return ([u, v]) => [round(x + w / 2 + scale * (u - midX)), round(y + h / 2 - scale * (v - midY))];
}
const cartesian = bounds => mapper(bounds, [35, 14, 410, 130]);

function lorenz() {
  const step = 0.008;
  const f = ([x, y, z]) => [10 * (y - x), x * (28 - z) - y, x * y - 8 * z / 3];
  const shifted = (p, k, scale) => p.map((v, i) => v + k[i] * scale);
  let state = [1, 1, 1];
  const orbit = interval(3250, () => {
    const a = f(state), b = f(shifted(state, a, step / 2));
    const c = f(shifted(state, b, step / 2)), d = f(shifted(state, c, step));
    state = state.map((v, i) => v + step * (a[i] + 2 * b[i] + 2 * c[i] + d[i]) / 6);
    return [state[0] + 0.2 * state[1], state[2]];
  }).slice(750);
  const project = fitted(orbit);
  // Separate the completed trajectory into strokes so the trace advances in time.
  return interval(10, i => trace(orbit.slice(i * 250, (i + 1) * 250 + 1), project, i % 3 === 2 ? "draw alt trajectory" : "draw trajectory", i * 105)).join("")
    + dot(project(orbit.at(-1)), 3, "point reveal", 1120);
}

function fibonacci() {
  const corners = [[0,0,1], [1,0,1], [0,1,2], [-3,0,3], [-3,-5,5], [2,-5,8], [-3,3,13]];
  const endpoints = [[0,1], [1,0], [2,1], [0,3], [-3,0], [2,-5], [10,3], [-3,16]];
  const project = fitted(corners.flatMap(([x,y,s]) => [[x,y], [x+s,y+s]]));
  const unit = project([1,0])[0] - project([0,0])[0];
  return corners.map(([x,y,s], i) => {
    const [left, top] = project([x,y+s]);
    const size = round(s * unit);
    const [cx, cy] = project([x+s/2, y+s/2]);
    const square = tag("rect", {x:left, y:top, width:size, height:size, class:"guide reveal", style:"--step:" + i * 125 + "ms"});
    const arc = path("M" + project(endpoints[i]) + "A" + size + "," + size + " 0 0 0 " + project(endpoints[i+1]), "draw alt", 80+i*125);
    return square + (s >= 3 ? text(cx, cy + 4, s) : "") + arc;
  }).join("");
}

function fourier() {
  const n = 128;
  const samples = interval(n, i => 0.7 * Math.sin(TAU * 3 * i / n) + 0.35 * Math.sin(TAU * 7 * i / n));
  const amplitudes = interval(11, k => {
    let re = 0, im = 0;
    for (let j = 0; j < n; j++) {
      re += samples[j] * Math.cos(TAU * j * k / n);
      im += samples[j] * Math.sin(TAU * j * k / n);
    }
    return Math.hypot(re, im) * 2 / n;
  });
  const wave = mapper([0,n-1,-1.1,1.1], [30,32,186,105]);
  const spectrum = mapper([0,10,0,0.8], [275,32,178,105]);
  return text(121, 21, "Signal") + text(360, 21, "Frequency spectrum")
    + line(wave([0,0]), wave([n-1,0])) + line(wave([0,-1.1]), wave([0,1.1]))
    + line(spectrum([0,0]), spectrum([10,0])) + line(spectrum([0,0]), spectrum([0,0.8]))
    + trace(samples.map((y,i) => [i,y]), wave)
    + amplitudes.map((a,k) => a > 1e-5 ? line(spectrum([k,0]), spectrum([k,a]), "draw alt stem-plot", 410+k*35)
      + text(spectrum([k,0])[0], 152, k) : "").join("");
}

function heat() {
  const p = cartesian([-3,3,0,1.05]);
  // For u_t = u_xx, Gaussian variance grows by 2t and its integral stays constant.
  const times = [0, 0.16, 0.45, 0.95];
  return line(p([-3,0]), p([3,0])) + text(240, 162, "Position")
    + times.map((t,i) => {
      const variance = 0.16 + 2*t;
      return trace(points(140, s => {
        const x = 6*s-3;
        return [x, 0.4/Math.sqrt(variance) * Math.exp(-x*x/(2*variance))];
      }), p, i === 0 ? "draw alt" : i === times.length - 1 ? "draw" : "draw faint", i*220);
    }).join("");
}

function lissajous() {
  const curve = points(650, t => [Math.sin(TAU * 3 * t + Math.PI/4), Math.sin(TAU * 2 * t)]);
  const p = fitted(curve, [190,10,144,148]);
  return line(p([-1.13,0]), p([1.13,0])) + line(p([0,-1.1]),p([0,1.1]))
    + text(106, 89, "3 : 2") + trace(curve,p) + dot(p(curve.at(-1)),3,"point reveal",950);
}

function epicycloid() {
  const curve = points(500, t => {
    const a = TAU*t;
    return [4*Math.cos(a)-Math.cos(4*a), 4*Math.sin(a)-Math.sin(4*a)];
  });
  const p = fitted(curve);
  const [cx,cy] = p([0,0]);
  return tag("circle",{cx,cy,r:round(p([3,0])[0]-cx),class:"guide"})
    + trace(curve,p) + interval(3,i=>dot(p(curve[Math.round(i*500/3)]),2.5,"point reveal",850)).join("");
}

function logistic() {
  const p = mapper([2.8,4,0.02,1.02], [39,9,407,133]);
  const clouds = interval(7, batch => {
    const bins = new Set();
    for(let j=0;j<44;j++) {
      const r=2.8+1.2*(batch*44+j)/307;
      let x=0.413;
      for(let k=0;k<165;k++) x=r*x*(1-x);
      for(let k=0;k<38;k++){
        x=r*x*(1-x);
        bins.add(p([r,x]).map(Math.round).join(","));
      }
    }
    return path([...bins].map(pt=>"M"+pt+"h.2").join(""),"cloud reveal",batch*130);
  });
  return line(p([2.8,0.02]),p([4,0.02])) + line(p([2.8,0.02]),p([2.8,1.02]))
    + text(39,158,"2.8") + text(446,158,"4") + text(244,158,"Growth rate r") + clouds.join("");
}

function newton() {
  const p = mapper([0,3.1,-2.3,7.5], [36,13,406,127]);
  const f = x => x*x-2;
  let x = 2.8;
  const segments = interval(4, i => {
    const next = (x+2/x)/2;
    const a = line(p([x,0]),p([x,f(x)]),"draw faint",170+i*240)
      + line(p([x,f(x)]),p([next,0]),"draw alt",255+i*240);
    x = next;
    return a;
  });
  return line(p([0,0]),p([3.1,0])) + line(p([0,-2.3]),p([0,7.5]))
    + trace(points(100,t=>[3.1*t,f(3.1*t)]),p) + segments.join("")
    + dot(p([Math.SQRT2,0]),3,"point reveal",1100) + text(p([Math.SQRT2,0])[0],155,"√2");
}

function sierpinski() {
  let triangles = [[[166,145],[314,145],[240,16]]];
  const midpoint = (a,b)=>a.map((x,i)=>(x+b[i])/2);
  const outline = tri => "M"+tri.map(pt=>pt.map(round).join(",")).join("L")+"Z";
  const holes = interval(5,i=>{
    const next=[];
    const paths=triangles.map(([a,b,c])=>{
      const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);
      next.push([a,ab,ca],[b,bc,ab],[c,ca,bc]);
      return outline([ab,bc,ca]);
    });
    triangles=next;
    return path(paths.join(""),"guide reveal",i*185+120);
  });
  return path(outline([[166,145],[314,145],[240,16]]),"draw alt")+holes.join("");
}

function roots() {
  const p = fitted([[-1,-1],[1,1]], [168,14,144,144]);
  const vertices = interval(7, i=>[Math.cos(TAU*i/7),Math.sin(TAU*i/7)]);
  const [cx,cy]=p([0,0]);
  return line(p([-1.15,0]),p([1.15,0])) + line(p([0,-1.1]),p([0,1.1]))
    +tag("circle",{cx,cy,r:72,class:"guide"})
    +trace([...vertices,vertices[0]],p,"draw",100)
    +vertices.map((pt,i)=>dot(p(pt),3,"point reveal",160+110*i)).join("");
}

function bezier() {
  const controls = [[53,32],[139,146],[315,139],[426,21]];
  const blend=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
  const levels=t=>{
    const one=controls.slice(1).map((b,i)=>blend(controls[i],b,t));
    const two=one.slice(1).map((b,i)=>blend(one[i],b,t));
    return [one,two,blend(two[0],two[1],t)];
  };
  const flip=([x,y])=>[round(x),round(170-y)];
  const [one,two,result]=levels(0.58);
  return trace(controls,flip,"guide") + controls.map(pt=>dot(flip(pt),2.5,"point")).join("")
    + trace(one,flip,"draw faint",200) + trace(two,flip,"draw alt",395)
    + trace(points(180,t=>levels(t)[2]),flip,"draw",540) + dot(flip(result),4,"point reveal",900);
}

function pendulum() {
  const p = cartesian([-Math.PI,Math.PI,-2.5,2.5]);
  const levels = [-0.75,-0.25,0.25,0.72,1];
  return line(p([-Math.PI,0]),p([Math.PI,0])) + line(p([0,-2.5]),p([0,2.5]))
    + text(40,12,"Angular velocity","start") + text(444,159,"Angle","end")
    + levels.map((energy,i)=>{
      const limit=Math.acos(-energy);
      const half=points(100,t=>{
        const angle=(2*t-1)*limit;
        return [angle,Math.sqrt(Math.max(0,2*(energy+Math.cos(angle))))];
      });
      const curve=half.concat(half.slice().reverse().map(([x,y])=>[x,-y]));
      return trace(curve,p,i===levels.length-1?"draw alt":"draw",i*160);
    }).join("");
}

function cycloid() {
  const curve=points(420,s=>{
    const t=TAU*2*s;
    return [t-Math.sin(t),1-Math.cos(t)];
  });
  const p=fitted([...curve,[TAU*2,0]],[27,18,426,135]);
  const t=TAU*1.58;
  const [cx,cy]=p([t,1]);
  const pt=p([t-Math.sin(t),1-Math.cos(t)]);
  return line(p([0,0]),p([TAU*2,0])) + trace(curve,p)
    + tag("circle",{cx,cy,r:round(cy-p([t,2])[1]),class:"guide reveal",style:"--step:710ms"})
    + line([cx,cy],pt,"draw alt",710) + dot(pt,3.5,"point reveal",890);
}

function gibbs() {
  const p=cartesian([-Math.PI,Math.PI,-1.32,1.32]);
  const target=[[-Math.PI,-1],[0,-1],[0,1],[Math.PI,1]];
  return line(p([-Math.PI,0]),p([Math.PI,0])) + line(p([0,-1.26]),p([0,1.26]))
    + trace(target,p,"guide")
    + [1,3,13].map((terms,i)=>trace(points(480,t=>{
      const x=(2*t-1)*Math.PI;
      let value=0;
      for(let k=1;k<terms*2;k+=2) value+=Math.sin(k*x)/k;
      return [x,4*value/Math.PI];
    }),p,["draw faint","draw","draw alt"][i],i*300)).join("");
}

const figures = [
  ["Lorenz attractor", "A trajectory alternates irregularly between two lobes in a model of convection.", lorenz],
  ["Fibonacci spiral", "Quarter circles connect across squares with successive Fibonacci side lengths.", fibonacci],
  ["Fourier transform", "A two-tone signal has spectral peaks at 3 and 7 cycles per sample window.", fourier],
  ["Heat equation", "A narrow temperature peak spreads and flattens as heat diffuses.", heat],
  ["Lissajous curve", "Two perpendicular oscillations with a 3:2 frequency ratio trace this closed curve.", lissajous],
  ["Epicycloid", "A point on a circle rolling around the outside of another circle traces three cusps.", epicycloid],
  ["Logistic map", "As the growth rate increases, one stable value splits into two and then into many.", logistic],
  ["Newton’s method", "Successive tangent lines give better approximations to the positive root of x² − 2.", newton],
  ["Sierpiński triangle", "Removing the central triangle at each scale reveals a self-similar pattern.", sierpinski],
  ["Seventh roots of unity", "The seven solutions of z⁷ = 1 are equally spaced around the unit circle.", roots],
  ["Bézier construction", "Successive linear interpolations locate a point on a cubic Bézier curve.", bezier],
  ["Pendulum phase portrait", "Closed paths show oscillation. The outer boundary separates swinging from full rotation.", pendulum],
  ["Cycloid", "A point fixed to the rim of a rolling circle traces a series of arches.", cycloid],
  ["Gibbs phenomenon", "Adding Fourier terms sharpens a square wave, while overshoot remains near the jump.", gibbs],
];

export function mountHomeFigure(panel) {
  const [title, caption, draw] = figures[Math.floor(Math.random() * figures.length)];
  const graphic = tag("svg", {
    viewBox: "0 0 " + VIEW_WIDTH + " " + VIEW_HEIGHT,
    "aria-hidden": "true",
    focusable: "false"
  }, draw());
  panel.innerHTML = '<div class="daily-figure-plot playing">' + graphic + '</div>'
    + '<figcaption class="sr">' + title + '. ' + caption + '</figcaption>';
  panel.removeAttribute("aria-busy");
}

export { mountHomeFigure as mountDailyFigure };
