// Simulation engine and exhibit catalogue from VBMath_Lab_v2.html.
let VBViz;

(() => {
const TAU = Math.PI * 2;
const C = { gold: '#e0bd6c', teal: '#7fd6c8', dim: 'rgba(224,189,108,.30)', faint: 'rgba(127,214,200,.20)', txt: 'rgba(224,189,108,.85)' };
const U = (w, h, k) => Math.min(w, h) * k;
const P = (c, pts, close) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); if (close) c.closePath(); c.stroke(); };
const dot = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
const circ = (c, x, y, r, col) => { c.strokeStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); };
const T = (c, s, x, y, al = 'center', col = C.txt) => { c.fillStyle = col; c.textAlign = al; c.fillText(s, x, y); };
const fade = (c, pts, col) => { c.strokeStyle = col; const n = pts.length; for (let i = 1; i < n; i++) { c.globalAlpha = (i / n) ** 1.5; c.beginPath(); c.moveTo(pts[i - 1][0], pts[i - 1][1]); c.lineTo(pts[i][0], pts[i][1]); c.stroke(); } c.globalAlpha = 1; };
const rk = (f, y, dt) => { const a = (b, k, s) => b.map((v, i) => v + k[i] * s), k1 = f(y), k2 = f(a(y, k1, dt / 2)), k3 = f(a(y, k2, dt / 2)), k4 = f(a(y, k3, dt)); return y.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); };
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

const X = {
  lissajous(c, w, h, t, s) {
    const u = U(w, h, .38), cx = w / 2, cy = h / 2, a = s.par.a ?? 3, b = s.par.b ?? 2, d = t * .3;
    c.strokeStyle = C.dim; P(c, [[cx - u * 1.15, cy], [cx + u * 1.15, cy]]); P(c, [[cx, cy - u * 1.15], [cx, cy + u * 1.15]]);
    const pts = []; for (let i = 0; i <= 500; i++) { const q = i / 500 * TAU; pts.push([cx + u * Math.sin(a * q + d), cy + u * Math.sin(b * q)]); }
    c.strokeStyle = C.gold; c.lineWidth = 1.8; P(c, pts); c.lineWidth = 1.4;
    const q = t * 1.1, x = cx + u * Math.sin(a * q + d), y = cy + u * Math.sin(b * q);
    c.strokeStyle = C.faint; P(c, [[x, cy - u * 1.15], [x, y]]); P(c, [[cx - u * 1.15, y], [x, y]]);
    dot(c, x, y, 4, C.teal); T(c, a + ' : ' + b, cx - u * 1.15, cy - u * 1.15, 'left');
  },
  epicycloid(c, w, h, t, s) {
    const R = 1, k = s.par.k ?? 3, r = R / k, u = U(w, h, .44) / (R + 2 * r), cx = w / 2, cy = h / 2;
    const pos = th => [cx + u * ((R + r) * Math.cos(th) - r * Math.cos((R + r) / r * th)), cy - u * ((R + r) * Math.sin(th) - r * Math.sin((R + r) / r * th))];
    const th = Math.min(TAU, (t * .7) % (TAU * 1.2)), all = [], cur = [];
    for (let i = 0; i <= 360; i++) { const a = i / 360 * TAU; all.push(pos(a)); if (a <= th) cur.push(all[i]); }
    c.strokeStyle = C.dim; P(c, all); c.strokeStyle = C.gold; c.lineWidth = 1.8; P(c, cur); c.lineWidth = 1.4;
    circ(c, cx, cy, R * u, C.faint);
    const cc = [cx + u * (R + r) * Math.cos(th), cy - u * (R + r) * Math.sin(th)], p = pos(th);
    circ(c, cc[0], cc[1], r * u, C.teal); c.strokeStyle = C.teal; P(c, [cc, p]); dot(c, p[0], p[1], 4, C.gold);
  },
  cycloid(c, w, h, t) {
    const r = Math.min(w * .8 / (4 * Math.PI), h * .28), x0 = (w - 4 * Math.PI * r) / 2, gy = h * .72;
    const th = (t * 1.3) % (4 * Math.PI * 1.15), tt = Math.min(th, 4 * Math.PI);
    const pt = a => [x0 + r * (a - Math.sin(a)), gy - r * (1 - Math.cos(a))];
    c.strokeStyle = C.dim; P(c, [[x0 - 10, gy], [x0 + 4 * Math.PI * r + 10, gy]]);
    const all = [], cur = []; for (let i = 0; i <= 400; i++) { const a = i / 400 * 4 * Math.PI; all.push(pt(a)); if (a <= tt) cur.push(all[i]); }
    c.strokeStyle = C.dim; P(c, all); c.strokeStyle = C.gold; c.lineWidth = 1.8; P(c, cur); c.lineWidth = 1.4;
    const cx = x0 + r * tt, cy = gy - r, p = pt(tt);
    circ(c, cx, cy, r, C.teal); c.strokeStyle = C.teal; P(c, [[cx, cy], p]); dot(c, cx, cy, 2.5, C.teal); dot(c, p[0], p[1], 4, C.gold);
  },
  roots(c, w, h, t, s) {
    const cx = w / 2, cy = h / 2, u = U(w, h, .36), n = s.par.n ?? 7, v = t * .9, k = Math.floor(v) % n;
    c.strokeStyle = C.dim; P(c, [[cx - u * 1.3, cy], [cx + u * 1.3, cy]]); P(c, [[cx, cy - u * 1.3], [cx, cy + u * 1.3]]);
    circ(c, cx, cy, u, C.faint);
    const z = (i, s = 1) => [cx + s * u * Math.cos(TAU * i / n), cy - s * u * Math.sin(TAU * i / n)];
    const pts = [...Array(n)].map((_, i) => z(i)); c.strokeStyle = C.gold; c.lineWidth = 1.8; P(c, pts, 1); c.lineWidth = 1.4;
    c.strokeStyle = C.teal; P(c, [[cx, cy], pts[k]]); c.beginPath(); c.arc(cx, cy, u * .28, 0, -TAU * k / n, true); c.stroke();
    pts.forEach((p, i) => { dot(c, p[0], p[1], i === k ? 5 : 3.2, i === k ? C.teal : C.gold); const q = z(i, 1.17); T(c, 'ω' + SUP[i], q[0], q[1] + 4, 'center', i === k ? C.teal : C.txt); });
    T(c, 'ω = e^(2πi/' + n + ')', w * .04, h * .08, 'left');
  },
  newton(c, w, h, t) {
    const f = x => x * x - 2, xs = [3]; for (let i = 0; i < 6; i++) xs.push(xs[i] - f(xs[i]) / (2 * xs[i]));
    const X0 = -.2, X1 = 3.3, Y0 = -3, Y1 = 9.5, mx = x => w * .08 + (x - X0) / (X1 - X0) * w * .84, my = y => h * .88 - (y - Y0) / (Y1 - Y0) * h * .78;
    c.strokeStyle = C.dim; P(c, [[mx(X0), my(0)], [mx(X1), my(0)]]); P(c, [[mx(0), my(Y0)], [mx(0), my(Y1)]]);
    const cv = []; for (let i = 0; i <= 120; i++) { const x = X0 + (X1 - X0) * i / 120; cv.push([mx(x), my(f(x))]); }
    c.strokeStyle = C.gold; c.lineWidth = 1.8; P(c, cv); c.lineWidth = 1.4;
    const st = t / 1.7, k = Math.floor(st) % 5, p = Math.min(1, (st % 1) * 1.5);
    for (let i = 0; i <= k; i++) {
      const a = xs[i], b = xs[i + 1], cur = i === k, q = cur ? p : 1; c.strokeStyle = cur ? C.teal : C.faint;
      P(c, [[mx(a), my(0)], [mx(a), my(f(a))]]); P(c, [[mx(a), my(f(a))], [mx(a + (b - a) * q), my(f(a) * (1 - q))]]);
      dot(c, mx(a), my(0), 3, cur ? C.teal : C.gold);
    }
    dot(c, mx(Math.SQRT2), my(0), 3, C.gold); T(c, '√2', mx(Math.SQRT2), my(0) + 18);
    T(c, 'x' + SUP[k + 1] + ' = ' + xs[k + 1].toFixed(6), w * .96, h * .1, 'right');
  },
  sierpinski(c, w, h, t) {
    const d = Math.min(6, Math.floor(t * .7) % 8), s = U(w, h, .92), y0 = h / 2 + s * .433;
    c.fillStyle = C.gold; c.globalAlpha = .92;
    const rec = (x, y, z, n) => { if (!n) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + z, y); c.lineTo(x + z / 2, y - z * .866); c.fill(); return; } const q = z / 2; rec(x, y, q, n - 1); rec(x + q, y, q, n - 1); rec(x + q / 2, y - q * .866, q, n - 1); };
    rec(w / 2 - s / 2, y0, s, d); c.globalAlpha = 1; T(c, 'step ' + d, w * .96, h * .1, 'right');
  },
  square(c, w, h, t, s) {
    const N = s.par.N ?? 5, u = h * .2, x0 = w * .2, y0 = h / 2, wx = w * .46; let x = x0, y = y0; s.h = s.h || [];
    for (let i = 0; i < N; i++) {
      const n = 2 * i + 1, r = u * 4 / (Math.PI * n), a = n * t * 1.1, nx = x + r * Math.cos(a), ny = y - r * Math.sin(a);
      circ(c, x, y, r, C.faint); c.strokeStyle = C.teal; P(c, [[x, y], [nx, ny]]); x = nx; y = ny;
    }
    if (s.dt) s.h.unshift(y); if (s.h.length > (w - wx) / 1.4) s.h.pop();
    c.strokeStyle = C.dim; P(c, [[wx, y0], [w * .97, y0]]); P(c, [[x, y], [wx, y]]);
    c.strokeStyle = C.gold; c.lineWidth = 1.8; P(c, s.h.map((v, i) => [wx + i * 1.4, v])); c.lineWidth = 1.4; dot(c, x, y, 3.5, C.gold);
    T(c, N + ' odd harmonics', w * .04, h * .08, 'left');
  },
  lorenz(c, w, h, t, s) {
    const f = ([x, y, z]) => [10 * (y - x), x * ((s.par.rho ?? 28) - z) - y, x * y - 8 / 3 * z]; s.p = s.p || [1, 1, 1]; s.tr = s.tr || [];
    for (let i = 0; i < 5 * s.speed; i++) { s.p = rk(f, s.p, .008); s.tr.push(s.p); } if (s.tr.length > 2400) s.tr.splice(0, s.tr.length - 2400);
    const A = .5 * Math.sin(t * .12), ca = Math.cos(A), sa = Math.sin(A), k = Math.min(w / 46, h / 60);
    const pr = ([x, y, z]) => [w / 2 + (x * ca - y * sa) * k, h / 2 - (z - 25) * k];
    fade(c, s.tr.map(pr), C.gold); const q = pr(s.p); dot(c, q[0], q[1], 3.5, C.teal);
  },
  pendulum(c, w, h, t, s) {
    const g = 9.81, f = ([a, b, p, q]) => { const d = a - b, den = 3 - Math.cos(2 * d);
      return [p, q, (-3 * g * Math.sin(a) - g * Math.sin(a - 2 * b) - 2 * Math.sin(d) * (q * q + p * p * Math.cos(d))) / den, (2 * Math.sin(d) * (2 * p * p + 2 * g * Math.cos(a) + q * q * Math.cos(d))) / den]; };
    s.y = s.y || [s.par.a1 ?? 2.2, 2.6, 0, 0]; s.tr = s.tr || []; const n = Math.max(1, Math.round(s.dt / .004)); for (let i = 0; i < n; i++) s.y = rk(f, s.y, s.dt / n);
    const L = U(w, h, .22), ox = w / 2, oy = h * .42, x1 = ox + L * Math.sin(s.y[0]), y1 = oy + L * Math.cos(s.y[0]), x2 = x1 + L * Math.sin(s.y[1]), y2 = y1 + L * Math.cos(s.y[1]);
    s.tr.push([x2, y2]); if (s.tr.length > 600) s.tr.shift(); fade(c, s.tr, C.teal);
    circ(c, ox, oy, 2 * L, C.faint); c.strokeStyle = C.gold; c.lineWidth = 1.8; P(c, [[ox, oy], [x1, y1], [x2, y2]]); c.lineWidth = 1.4;
    dot(c, ox, oy, 2.5, C.dim); dot(c, x1, y1, 5, C.gold); dot(c, x2, y2, 5, C.teal);
  },
  vanderpol(c, w, h, t, s) {
    const f = ([x, y]) => [y, (s.par.mu ?? 1.5) * (1 - x * x) * y - x], mx = x => w / 2 + x * w / 7.4, my = y => h / 2 - y * h / 9;
    s.q = s.q || [[.3, 0], [-2.5, 2], [2.8, -3], [0, 3.4], [-1, -.4]].map(p => ({ p, tr: [] }));
    c.strokeStyle = C.dim; P(c, [[w * .04, h / 2], [w * .96, h / 2]]); P(c, [[w / 2, h * .05], [w / 2, h * .95]]);
    s.q.forEach((o, i) => { for (let k = 0; k < 3 * s.speed; k++) o.p = rk(f, o.p, .02); o.tr.push([mx(o.p[0]), my(o.p[1])]); if (o.tr.length > 420) o.tr.shift(); fade(c, o.tr, i % 2 ? C.teal : C.gold); dot(c, mx(o.p[0]), my(o.p[1]), 3, i % 2 ? C.teal : C.gold); });
    T(c, 'x', w * .96, h / 2 - 8, 'right'); T(c, 'ẋ', w / 2 + 10, h * .08, 'left');
  },
  logistic(c, w, h, t, s) {
    const L = w * .06, R = w * .96, Tp = h * .06, B = h * .84, d = s.dpr || 1;
    if (s.key !== w + 'x' + h) {
      s.key = w + 'x' + h; const o = s.o = document.createElement('canvas'); o.width = w * d; o.height = h * d; const g = o.getContext('2d'); g.scale(d, d); g.fillStyle = 'rgba(224,189,108,.38)';
      for (let px = 0; px <= R - L; px++) { const r = 2.8 + 1.2 * px / (R - L); let x = .5; for (let i = 0; i < 250; i++) x = r * x * (1 - x); for (let i = 0; i < 90; i++) { x = r * x * (1 - x); g.fillRect(L + px, B - x * (B - Tp), 1, 1); } }
    }
    c.drawImage(s.o, 0, 0, w, h);
    c.strokeStyle = C.dim; P(c, [[L, B + 6], [R, B + 6]]); for (let r = 3; r <= 4.001; r += .2) { const x = L + (r - 2.8) / 1.2 * (R - L); P(c, [[x, B + 6], [x, B + 11]]); T(c, r.toFixed(1), x, B + 25); }
    const r = 2.8 + 1.2 * ((t * .05) % 1), x = L + (r - 2.8) / 1.2 * (R - L); c.strokeStyle = C.teal; P(c, [[x, Tp], [x, B]]);
    let v = .5; for (let i = 0; i < 300; i++) v = r * v * (1 - v); for (let i = 0; i < 8; i++) { v = r * v * (1 - v); dot(c, x, B - v * (B - Tp), 2.6, C.teal); }
    T(c, 'r = ' + r.toFixed(3), L + 4, Tp + 12, 'left');
  },
  heat(c, w, h, t, s) {
    const N = 160, L = w * .06, R = w * .94, B = h * .82, Tp = h * .12;
    if (!s.u || s.n > 7600) { s.n = 0; s.u = Float64Array.from({ length: N }, (_, i) => Math.exp(-(((i - N / 2) / 6) ** 2))); s.sn = [{ n: 0, u: s.u.slice() }]; }
    for (let k = 0; k < 24 * s.speed; k++) { const u = s.u, v = u.slice(); for (let i = 1; i < N - 1; i++) v[i] = u[i] + .45 * (u[i - 1] - 2 * u[i] + u[i + 1]); v[0] = v[N - 1] = 0; s.u = v; s.n++; if ([150, 600, 1800, 4200].includes(s.n)) s.sn.push({ n: s.n, u: v.slice() }); }
    const pl = u => Array.from(u, (v, i) => [L + i / (N - 1) * (R - L), B - v * (B - Tp)]);
    c.strokeStyle = C.dim; P(c, [[L, B], [R, B]]);
    s.sn.forEach((o, i) => { c.strokeStyle = C.faint; P(c, pl(o.u)); });
    const p = pl(s.u); c.fillStyle = 'rgba(224,189,108,.10)'; c.beginPath(); c.moveTo(L, B); p.forEach(q => c.lineTo(q[0], q[1])); c.lineTo(R, B); c.fill();
    c.strokeStyle = C.gold; c.lineWidth = 1.8; P(c, p); c.lineWidth = 1.4; T(c, 'x', R, B + 18, 'right'); T(c, 'u(x, t)', L, Tp - 8, 'left');
  },
  bezier(c, w, h, t) {
    const K = [[.12, .8], [.3, .12 + .1 * Math.sin(t)], [.7, .12 + .1 * Math.cos(t * .8)], [.88, .8]].map(p => [p[0] * w, p[1] * h]), u = (Math.sin(t * .6) + 1) / 2;
    const lp = (a, b) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    const L1 = [0, 1, 2].map(i => lp(K[i], K[i + 1])), L2 = [0, 1].map(i => lp(L1[i], L1[i + 1])), pt = lp(L2[0], L2[1]);
    c.strokeStyle = C.dim; P(c, K); c.strokeStyle = C.faint; P(c, L1); c.strokeStyle = C.teal; P(c, L2);
    const cur = []; for (let i = 0; i <= 80; i++) { const q = u * i / 80, m = 1 - q; cur.push([0, 1].map(j => m ** 3 * K[0][j] + 3 * m * m * q * K[1][j] + 3 * m * q * q * K[2][j] + q ** 3 * K[3][j])); }
    c.strokeStyle = C.gold; c.lineWidth = 2; P(c, cur); c.lineWidth = 1.4;
    K.forEach(p => dot(c, p[0], p[1], 3.2, C.dim)); L1.concat(L2).forEach(p => dot(c, p[0], p[1], 2.2, C.teal)); dot(c, pt[0], pt[1], 4.5, C.gold);
  }
};

function mount(canvas, id) {
  const draw = X[id];
  if (!draw) throw new Error("Unknown exhibit: " + id);
  const context = canvas.getContext("2d");
  const state = {t:0, dt:0, speed:1, par:{}};
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0, height = 0, frame = 0, previous;
  let visible = false, playing = !reducedMotion.matches;
  const resetState = () => {
    for (const key of ["tr","y","p","q","u","h","key","r","co","V","pt"]) state[key] = null;
  };
  const paint = (dt) => {
    state.dt = dt;
    state.t += dt;
    context.clearRect(0,0,width,height);
    context.lineWidth = 1.4;
    context.lineJoin = context.lineCap = "round";
    context.font = '500 11px Inter, system-ui, sans-serif';
    draw(context,width,height,state.t,state);
  };
  const still = () => {
    resetState();
    state.t = 0;
    for (let step = 0; step < 120; step++) paint(1/30);
  };
  const tick = (now) => {
    const elapsed = previous === undefined ? 0 : Math.max(0,Math.min(.05,(now-previous)/1000));
    previous = now;
    paint(elapsed * state.speed);
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    previous = undefined;
    if (visible && width && playing && !document.hidden) frame = requestAnimationFrame(tick);
  };
  const fit = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    state.dpr = Math.min(devicePixelRatio || 1,2);
    canvas.width = Math.round(width * state.dpr);
    canvas.height = Math.round(height * state.dpr);
    context.setTransform(state.dpr,0,0,state.dpr,0,0);
    state.key = null;
    state.tr = state.h = null;
    if (visible && !playing) still();
    sync();
  };
  const resize = new ResizeObserver(fit);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && width && !playing) still();
    sync();
  });
  resize.observe(canvas);
  intersection.observe(canvas);
  document.addEventListener("visibilitychange",sync);
  return {
    state,
    get playing() { return playing; },
    setPlaying(value) { playing = value; sync(); },
    set(name,value) {
      state.par[name] = value;
      resetState();
      if (visible && width && !playing) still();
    },
    restart() {
      resetState();
      state.t = 0;
      if (visible && width) paint(0);
    },
    destroy() {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange",sync);
    }
  };
}
VBViz = { mount, X, H: { C, TAU, U, P, dot, circ, T, fade, rk } };
})();

/* VBMath extension: eddy, rocket, satellite, portrait. Load after vbmath-viz.js */
(() => {
const { X, H } = VBViz, { C, TAU, U, P, dot, circ, T, fade } = H;
X.eddy = (c, w, h, t, s) => {
  const g = s.par.g ?? 1.5, Ts = s.par.T ?? 1.1, Uf = .7, R = .1, xc = .4, k = w / 3.2, mx = x => x * k, my = y => h / 2 - y * k, dt = s.dt;
  const sh = i => ({ x: xc + .1, y: i % 2 ? -.07 : .07, G: (i % 2 ? 1 : -1) * g * .28 });
  const rs = p => { p.x = 0; p.y = (Math.random() - .5) * .7; p.c = p.y > 0; };
  if (!s.V) { s.V = []; s.acc = 0; s.n = 6; for (let i = 0; i < 6; i++) { const v = sh(i); v.x += .55 * Uf * Ts * (5 - i); s.V.push(v); } s.pt = Array.from({ length: 900 }, () => { const p = {}; rs(p); p.x = Math.random() * 3.2; return p; }); }
  if (dt > 0) { s.acc += dt; if (s.acc >= Ts) { s.acc -= Ts; s.V.push(sh(s.n++)); } s.V.forEach(v => v.x += .55 * Uf * dt); s.V = s.V.filter(v => v.x < 3.5); }
  c.globalAlpha = .8;
  for (const p of s.pt) {
    let dx = p.x - xc, dy = p.y, r2 = dx * dx + dy * dy; if (r2 < R * R * 1.05) { rs(p); dx = p.x - xc; dy = p.y; r2 = dx * dx + dy * dy; }
    const r4 = r2 * r2; let u = Uf * (1 - R * R * (dx * dx - dy * dy) / r4), v = -2 * Uf * R * R * dx * dy / r4;
    for (const o of s.V) { const ex = p.x - o.x, ey = p.y - o.y, f = o.G / (TAU * (ex * ex + ey * ey + .01)); u -= f * ey; v += f * ex; }
    p.x += u * dt; p.y += v * dt; if (p.x > 3.25 || Math.abs(p.y) > .9) rs(p);
    c.fillStyle = p.c ? C.teal : C.gold; c.fillRect(mx(p.x), my(p.y), 1.8, 1.8);
  }
  c.globalAlpha = 1; s.V.forEach(o => circ(c, mx(o.x), my(o.y), 9, 'rgba(255,255,255,.07)'));
  c.fillStyle = '#0b1d1a'; c.beginPath(); c.arc(mx(xc), my(0), R * k, 0, TAU); c.fill(); circ(c, mx(xc), my(0), R * k, C.gold);
  T(c, 'dye released upstream, shed vortices alternate in sign', w * .04, h * .08, 'left');
};
X.satellite = (c, w, h, t, s) => {
  const e = s.par.e ?? .5, a = Math.min(w * .4, h * .36 / Math.sqrt(1 - e * e)), b = a * Math.sqrt(1 - e * e), fx = w / 2 + a * e, fy = h / 2;
  const at = M => { let E = M; for (let i = 0; i < 7; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return [fx + a * (Math.cos(E) - e), fy - b * Math.sin(E), E]; };
  const el = []; for (let i = 0; i <= 200; i++) { const E = i / 200 * TAU; el.push([fx + a * (Math.cos(E) - e), fy - b * Math.sin(E)]); }
  c.strokeStyle = C.dim; P(c, el);
  const M0 = t * .6, wedge = (m, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(fx, fy); for (let i = 0; i <= 16; i++) { const p = at(m - .9 + .9 * i / 16); c.lineTo(p[0], p[1]); } c.fill(); };
  wedge(M0, 'rgba(224,189,108,.18)'); wedge(M0 + Math.PI, 'rgba(127,214,200,.18)');
  const [x, y, E] = at(M0), r = a * (1 - e * Math.cos(E)), vx = -a * Math.sin(E), vy = -b * Math.cos(E), vn = Math.hypot(vx, vy), q = Math.sqrt(2 * a / r - 1), L = 34 * q;
  dot(c, fx, fy, 10, '#2f8f84'); circ(c, fx, fy, 13, C.faint);
  c.strokeStyle = C.teal; P(c, [[x, y], [x + vx / vn * L, y + vy / vn * L]]); dot(c, x, y, 4.5, C.gold);
  T(c, 'e = ' + e.toFixed(2) + '   v = ' + q.toFixed(2) + ' v_circ', w * .04, h * .08, 'left'); T(c, 'both shaded wedges sweep equal areas in equal time', w / 2, h * .95);
};
X.rocket = (c, w, h, t, s) => {
  const mr = s.par.mr ?? 10, ve = .55, tw = 1.7, tb = (1 - 1 / mr) * ve / tw, md = (1 - 1 / mr) / tb;
  if (!s.r) { s.r = [0, 1, 0, 0, 1]; s.tr = []; s.T = 0; s.hold = 0; }
  let [x, y, vx, vy, m] = s.r;
  if (s.hold > 0) { s.hold -= s.dt; if (s.hold <= 0) { s.r = null; return; } }
  else {
    let bud = s.dt * (s.T < tb ? .25 : 1.6);
    while (bud > 0) {
      const d = Math.min(.002, bud); bud -= d; const r = Math.hypot(x, y); let ax = -x / r ** 3, ay = -y / r ** 3;
      if (s.T < tb) { const ux = x / r, uy = y / r; let dx, dy; if (s.T < .02) { dx = ux; dy = uy; } else if (s.T < .05) { dx = ux * .984 + uy * .18; dy = uy * .984 - ux * .18; } else { const sp = Math.hypot(vx, vy) || 1; dx = vx / sp; dy = vy / sp; } const a = md * ve / m; ax += a * dx; ay += a * dy; m -= md * d; }
      vx += ax * d; vy += ay * d; x += vx * d; y += vy * d; s.T += d;
      if (r < 1 && s.T > tb) { s.hold = 1.5; break; }
    }
    if (s.T > 7) s.hold = .01; s.r = [x, y, vx, vy, m];
  }
  const Rp = h * .18, cx = w / 2, cy = h * .6, mp = (X_, Y_) => [cx + X_ * Rp, cy - Y_ * Rp], gr = c.createRadialGradient(cx - Rp * .3, cy - Rp * .3, Rp * .1, cx, cy, Rp);
  gr.addColorStop(0, '#3a9a8e'); gr.addColorStop(1, '#10352f'); c.fillStyle = gr; c.beginPath(); c.arc(cx, cy, Rp, 0, TAU); c.fill(); circ(c, cx, cy, Rp * 1.04, C.faint);
  const p = mp(x, y); if (s.dt && s.hold <= 0) s.tr.push(p); if (s.tr.length > 1500) s.tr.shift(); c.lineWidth = 1.8; fade(c, s.tr, C.gold); c.lineWidth = 1.4;
  const sp = Math.hypot(vx, vy) || 1, ux = sp > .01 ? vx / sp : x / Math.hypot(x, y), uy = sp > .01 ? vy / sp : y / Math.hypot(x, y), dx = ux, dy = -uy, nx = -dy, ny = dx;
  c.fillStyle = C.gold; c.beginPath(); c.moveTo(p[0] + dx * 8, p[1] + dy * 8); c.lineTo(p[0] - dx * 5 + nx * 3.5, p[1] - dy * 5 + ny * 3.5); c.lineTo(p[0] - dx * 5 - nx * 3.5, p[1] - dy * 5 - ny * 3.5); c.fill();
  if (s.T < tb) { c.strokeStyle = C.teal; c.lineWidth = 2.5; P(c, [[p[0] - dx * 5, p[1] - dy * 5], [p[0] - dx * 15, p[1] - dy * 15]]); c.lineWidth = 1.4; }
  T(c, 'ideal Δv = ve·ln(m₀/m_f) = ' + (ve * Math.log(mr)).toFixed(2) + ' v_c', w * .04, h * .08, 'left');
  T(c, (s.hold > 0 && s.T > tb ? 'impact' : s.T < tb ? 'burn' : 'coast') + '   alt ' + (Math.hypot(x, y) - 1).toFixed(2) + ' R   v ' + sp.toFixed(2) + ' v_c', w * .04, h * .08 + 16, 'left');
};
X.portrait = (c, w, h, t, s) => {
  if (!s.co) {
    const Q = [[-.05,.95],[.3,.88],[.52,.65],[.56,.42],[.6,.25],[.7,.08],[.85,-.12],[.68,-.16],[.65,-.27],[.72,-.31],[.63,-.37],[.66,-.52],[.55,-.62],[.36,-.64],[.3,-.9],[.55,-1],[.95,-1.1],[-.95,-1.1],[-.55,-.85],[-.5,-.35],[-.72,.1],[-.66,.55],[-.4,.85]], n = Q.length, z = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < 8; j++) { const u = j / 8, p0 = Q[(i + n - 1) % n], p1 = Q[i], p2 = Q[(i + 1) % n], p3 = Q[(i + 2) % n]; z.push([0, 1].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u * u + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u ** 3))); }
    const N = z.length, co = []; for (let k = -70; k <= 70; k++) { let re = 0, im = 0; for (let j = 0; j < N; j++) { const a = -TAU * k * j / N, cs = Math.cos(a), sn = Math.sin(a); re += z[j][0] * cs - z[j][1] * sn; im += z[j][0] * sn + z[j][1] * cs; } re /= N; im /= N; co.push({ k, re, im, m: Math.hypot(re, im) }); }
    s.co = co.sort((p, q) => q.m - p.m); s.tr = [];
  }
  const M = Math.min(s.co.length, s.par.n ?? 40), u = U(w, h, .4), cx = w / 2, cy = h / 2, th = t * .12 * TAU; let x = 0, y = 0;
  for (let i = 0; i < M; i++) { const o = s.co[i], a = o.k * th, px = cx + x * u, py = cy - y * u; x += o.re * Math.cos(a) - o.im * Math.sin(a); y += o.re * Math.sin(a) + o.im * Math.cos(a); if (o.m * u > 1.5) { circ(c, px, py, o.m * u, 'rgba(127,214,200,.16)'); c.strokeStyle = C.teal; P(c, [[px, py], [cx + x * u, cy - y * u]]); } }
  if (s.dt) s.tr.push([cx + x * u, cy - y * u]); if (s.tr.length > 6000) s.tr.shift();
  c.lineWidth = 2; c.globalAlpha = .85; c.strokeStyle = C.gold; P(c, s.tr); c.globalAlpha = 1; c.lineWidth = 1.4; dot(c, cx + x * u, cy - y * u, 3.5, C.gold); T(c, M + ' rotating circles', w * .04, h * .08, 'left');
};
})();


const META=[
{id:'portrait',title:'A portrait, in circles',eq:'z(t) = Σ cₖ·e^(ikt)',desc:'A single closed line is split into rotating circles (a discrete Fourier transform). Each circle has a size and speed; chained tip to tail, their sum redraws the line. More circles, finer detail.',tags:['Fourier series','Superposition'],p:[['n','Circles',2,70,1,40]]},
{id:'eddy',title:'Eddy: von Kármán vortex street',eq:'v = U∞·(potential flow) + Σ Γᵢ/(2π)·(−dy, dx)/(r²+ε²)',desc:'Flow past a cylinder sheds vortices alternately from each side. Here the vortices are point sources of spin (Lamb–Oseen cores), and dye particles are carried by the combined flow.',tags:['Vorticity','Numerical integration'],p:[['g','Vortex strength',.4,3,.1,1.5],['T','Shedding period',.5,2,.1,1.1]]},
{id:'lorenz',title:'Lorenz attractor',eq:'ẋ = σ(y−x),  ẏ = x(ρ−z)−y,  ż = xy−βz',desc:'A simplified model of atmospheric convection. Trajectories never repeat and never settle, yet stay on a butterfly-shaped set. Two starts that differ slightly end up far apart.',tags:['Chaos','Phase space'],p:[['rho','ρ',10,40,1,28]]},
{id:'pendulum',title:'Double pendulum',eq:'Lagrangian: L = T − V, with two coupled angles θ₁, θ₂',desc:'Two rods joined end to end. Energy is conserved, but motion is chaotic for large swings; the teal path traces the lower bob.',tags:['Chaos','Conservation law','Numerical integration'],p:[['a1','Start angle θ₁',.3,3,.1,2.2]]},
{id:'vanderpol',title:'Van der Pol oscillator',eq:'ẍ − μ(1−x²)ẋ + x = 0',desc:'A self-sustaining oscillator: it pumps energy in at small amplitude and drains it at large amplitude. Every start spirals onto the same closed loop.',tags:['Limit cycle','Phase space'],p:[['mu','μ',.1,4,.1,1.5]]},
{id:'logistic',title:'Logistic bifurcation',eq:'xₙ₊₁ = r·xₙ(1 − xₙ)',desc:'A population model. As r grows, the long-term behaviour doubles from a fixed point to 2, 4, 8 cycles, then chaos, with windows of order inside it. The teal dots are the long-term values at the marked r.',tags:['Bifurcation','Iteration','Chaos'],p:[]},
{id:'satellite',title:'Satellite orbit',eq:'r³/T² = const,  v² = μ(2/r − 1/a)',desc:'Kepler’s laws: orbits are ellipses with the planet at one focus, the satellite speeds up near the planet, and the radius vector sweeps equal areas in equal times.',tags:['Orbit','Conservation law'],p:[['e','Eccentricity',0,.85,.05,.5]]},
{id:'rocket',title:'Rocket launch',eq:'Δv = vₑ·ln(m₀/m_f)',desc:'Tsiolkovsky’s rocket equation with gravity and a gravity turn. Mass ratio decides whether the rocket falls back (suborbital), reaches orbit, or escapes. Units: Earth radius and circular orbit speed.',tags:['Conservation law','Orbit','Numerical integration'],p:[['mr','Mass ratio m₀/m_f',5,14,.5,10]]},
{id:'epicycloid',title:'Epicycloid',eq:'x = (R+r)cos θ − r cos((R+r)θ/r)',desc:'The path of a point on a circle rolling around the outside of another. The ratio R/r sets the number of cusps.',tags:['Parametric curve','Rolling'],p:[['k','Cusps (R/r)',2,8,1,3]]},
{id:'cycloid',title:'Cycloid',eq:'x = r(θ − sin θ),  y = r(1 − cos θ)',desc:'The path of a point on a wheel rolling along a line. It is also the curve of fastest descent (brachistochrone).',tags:['Parametric curve','Rolling'],p:[]},
{id:'lissajous',title:'Lissajous curve',eq:'x = sin(at + δ),  y = sin(bt)',desc:'Two perpendicular oscillations. When the frequencies have a simple ratio the curve closes; the phase δ rotates it in 3D-like fashion.',tags:['Parametric curve','Superposition'],p:[['a','a',1,7,1,3],['b','b',1,7,1,2]]},
{id:'square',title:'Fourier square wave',eq:'f(t) = (4/π) Σ sin((2k+1)t)/(2k+1)',desc:'A square wave is a sum of odd sine harmonics. Each circle is one harmonic; the tip height traces the wave. More terms, sharper corners (and a small overshoot, the Gibbs effect).',tags:['Fourier series','Superposition'],p:[['N','Harmonics',1,15,1,5]]},
{id:'heat',title:'Heat equation',eq:'∂u/∂t = α ∂²u/∂x²',desc:'A hot spot spreads and flattens. Total heat is conserved while the peak falls like 1/√t. Faint curves are earlier times.',tags:['Diffusion','Conservation law','Numerical integration'],p:[]},
{id:'newton',title:'Newton’s method',eq:'xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)',desc:'Follow the tangent line down to the axis to get the next guess. Here f(x) = x² − 2, so the iterates home in on √2, roughly doubling the correct digits each step.',tags:['Iteration','Convergence'],p:[]},
{id:'sierpinski',title:'Sierpiński triangle',eq:'N = 3ⁿ triangles, dimension = ln 3 / ln 2 ≈ 1.585',desc:'Repeatedly remove the middle triangle. The limit has zero area but is more than a line: a fractal.',tags:['Self-similarity','Iteration'],p:[]},
{id:'roots',title:'Roots of unity',eq:'zⁿ = 1  ⇒  z = e^(2πik/n)',desc:'The n solutions of zⁿ = 1 are evenly spaced on the unit circle and form a regular polygon. Multiplying by ω rotates by 2π/n.',tags:['Roots of unity','Parametric curve'],p:[['n','n',3,9,1,7]]},
{id:'bezier',title:'Bézier curve',eq:'B(t) = Σ C(n,i)(1−t)ⁿ⁻ⁱtⁱ Pᵢ',desc:'De Casteljau’s construction: repeatedly interpolate between control points at the same fraction t. The final point lies on the curve. Used in fonts and vector graphics.',tags:['Iteration','Parametric curve'],p:[]}
];
/* ---- new exhibits ---- */
(()=>{const{X,H}=VBViz,{TAU}=H;
X.clifford=(c,w,h,t,s)=>{const a=(s.par.a??-1.7)+.12*Math.sin(t*.25),b=(s.par.b??1.8)+.1*Math.cos(t*.2),cc=-.9,d=-1.2,u=Math.min(w,h)*.21;let x=.1,y=.1;c.globalCompositeOperation='lighter';for(let i=0;i<7000;i++){const nx=Math.sin(a*y)+cc*Math.cos(a*x),ny=Math.sin(b*x)+d*Math.cos(b*y);x=nx;y=ny;if(i<20)continue;c.fillStyle=`hsla(${(i/7000*140+t*20+170)%360},90%,62%,.2)`;c.fillRect(w/2+x*u*1.25,h/2+y*u*1.25,1.4,1.4)}c.globalCompositeOperation='source-over';H.T(c,'a = '+a.toFixed(2)+'   b = '+b.toFixed(2),w*.04,h*.08,'left')};
X.spiro=(c,w,h,t,s)=>{const k=s.par.k??5,d=s.par.d??.8,r=1/k,u=Math.min(w,h)*.42,P=th=>[w/2+u*((1-r)*Math.cos(th)+d*r*Math.cos((1-r)/r*th)),h/2-u*((1-r)*Math.sin(th)-d*r*Math.sin((1-r)/r*th))],p=Math.min(1,(t*.3)%1.35),N=700,e=p*TAU;c.strokeStyle=H.C.faint;c.beginPath();c.arc(w/2,h/2,u,0,TAU);c.stroke();c.lineWidth=2;let q=P(0);for(let i=1;i<=N*p;i++){const th=i/N*TAU,n=P(th);c.strokeStyle=`hsl(${(th*28+t*20)%360},88%,64%)`;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(n[0],n[1]);c.stroke();q=n}c.lineWidth=1.2;const cx=w/2+u*(1-r)*Math.cos(e),cy=h/2-u*(1-r)*Math.sin(e);c.strokeStyle=H.C.dim;c.beginPath();c.arc(cx,cy,u*r,0,TAU);c.stroke();H.dot(c,q[0],q[1],4,H.C.gold);H.T(c,(k-1)+' lobes, pen at '+d.toFixed(2)+' r',w*.04,h*.08,'left')};
})();
META.push({id:'clifford',title:'Clifford attractor',eq:'xₙ₊₁ = sin(a yₙ) + c cos(a xₙ),  yₙ₊₁ = sin(b xₙ) + d cos(b yₙ)',desc:'Seven thousand iterates of one simple map, drawn with additive light. Tiny changes to a and b rewrite the whole shape: chaos as ornament.',tags:['Chaos','Iteration','Phase space'],p:[['a','a',-2,2,.05,-1.7],['b','b',-2,2,.05,1.8]]},
{id:'spiro',title:'Spirograph',eq:'x = (1−r)cos θ + d·r·cos((1−r)θ/r)',desc:'A pen inside a small circle rolling inside a larger one draws a hypotrochoid. The ratio sets the number of lobes; the pen offset sets how sharp they are.',tags:['Rolling','Parametric curve'],p:[['k','Ratio R/r',3,12,1,5],['d','Pen offset',.2,1.4,.05,.8]]});
/* ---- gallery ---- */
const CAT={chaos:['Chaos & dynamics',330,275,['lorenz','pendulum','vanderpol','logistic','clifford']],wave:['Waves & Fourier',190,225,['portrait','square','lissajous','spiro']],curve:['Curves & geometry',42,18,['epicycloid','cycloid','bezier','roots']],frac:['Fractals & iteration',150,175,['sierpinski','newton']],phys:['Physics & flow',262,205,['eddy','satellite','rocket','heat']]};
const TIP={portrait:'Drag the circle count down to 3: watch the shape dissolve into a blob.',eddy:'Raise vortex strength and shorten the period to see the street become turbulent.',lorenz:'Two nearly identical starting points: how long until they part ways?',pendulum:'Release from a high angle and compare two runs: that is sensitive dependence.',vanderpol:'Try μ near 0 (a plain sine) and then large (sudden relaxation jumps).',logistic:'Find the window of period 3 near r ≈ 3.83.',satellite:'Raise eccentricity and watch the speed change near the focus.',rocket:'Lower the mass ratio until the rocket can no longer reach orbit.',epicycloid:'Integer ratios close the curve; others never repeat.',cycloid:'The cycloid is also the brachistochrone: the fastest slide between two points.',lissajous:'Ratios 1:2, 2:3, 3:4 give the classic knots.',square:'Count the overshoot at each corner: it never goes away (Gibbs).',heat:'Peak height falls like 1/√t: check it against the faint curves.',newton:'Change the start mentally: any positive guess finds √2.',sierpinski:'Each step multiplies the triangles by three but the area by ¾.',roots:'Set n = 6 and picture the hexagon: multiply by ω to rotate a vertex.',bezier:'Move through t and see how the construction nests lines inside lines.',clifford:'Nudge a by 0.05 repeatedly: the symmetry changes entirely.',spiro:'Ratio 7 with a small offset gives a rosette; raise the offset for loops.'};
/* ---- v2 extension: improved exhibits + university-syllabus exhibits ---- */
(()=>{const{X,H}=VBViz,{C,TAU,U,P,dot,circ,T,rk}=H,SB='₀₁₂₃₄₅₆₇₈₉',sub=n=>String(n).replace(/\d/g,d=>SB[d]);
const MONO='500 11px "JetBrains Mono",ui-monospace,Menlo,monospace',SANS='500 11px Inter,system-ui,sans-serif';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const nice=r=>{const p=10**Math.floor(Math.log10(r/4)),m=r/4/p;return p*(m<1.5?1:m<3.5?2:m<7.5?5:10)};
const fadeB=(c,pts,col,n=24,lw=1.6)=>{const L=pts.length;if(L<2)return;c.strokeStyle=col;c.lineWidth=lw;const k=Math.ceil(L/n);for(let i=0;i<L-1;i+=k){c.globalAlpha=.07+.93*(i/L)**1.4;c.beginPath();c.moveTo(pts[i][0],pts[i][1]);for(let j=i+1;j<=Math.min(i+k,L-1);j++)c.lineTo(pts[j][0],pts[j][1]);c.stroke()}c.globalAlpha=1;c.lineWidth=1.4};
const box=(c,x,y,w,h)=>{c.fillStyle='rgba(6,20,24,.72)';c.beginPath();c.roundRect?c.roundRect(x,y,w,h,8):c.rect(x,y,w,h);c.fill()};
const lut=(stops,n=256)=>{const o=[];for(let i=0;i<n;i++){const v=i/(n-1);let j=0;while(j<stops.length-2&&v>stops[j+1][0])j++;const[a,A]=stops[j],[b,B]=stops[j+1],f=clamp((v-a)/(b-a),0,1);o.push(A.map((q,k)=>q+(B[k]-q)*f))}return o};
const hsl=(h,s,l)=>{const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};return[f(0),f(8),f(4)]};
/* pan / pinch / wheel zoom + on-canvas buttons; view = s.vw {cx,cy,sc}  (screen = w/2+(x-cx)sc , h/2-(y-cy)sc) */
const zoomable=(c,s)=>{const cv=c.canvas;if(s.zb===cv)return;s.zb=cv;cv.style.touchAction='none';const ptrs=new Map();let lastD=0;
const R=()=>cv.getBoundingClientRect(),zoomAt=(px,py,f)=>{const v=s.vw,r=R();if(!v)return;const x=v.cx+(px-r.width/2)/v.sc,y=v.cy-(py-r.height/2)/v.sc;v.sc=clamp(v.sc*f,5,1e13);v.cx=x-(px-r.width/2)/v.sc;v.cy=y+(py-r.height/2)/v.sc;s.dirty=1};
cv.addEventListener('wheel',e=>{e.preventDefault();const r=R();zoomAt(e.clientX-r.left,e.clientY-r.top,Math.exp(-e.deltaY*.0015))},{passive:false});
cv.addEventListener('pointerdown',e=>{const r=R(),px=e.clientX-r.left,py=e.clientY-r.top;if(px>r.width-38&&px<r.width-6&&py>6&&py<110){const i=Math.floor((py-8)/34);if(i===0)zoomAt(r.width/2,r.height/2,1.7);else if(i===1)zoomAt(r.width/2,r.height/2,1/1.7);else if(i===2){s.vw=null;s.dirty=1}return}
ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});cv.setPointerCapture?.(e.pointerId)});
cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId),v=s.vw;if(!p||!v)return;const r=R();if(ptrs.size===1){v.cx-=(e.clientX-p.x)/v.sc;v.cy+=(e.clientY-p.y)/v.sc;s.dirty=1}else{const o=[...ptrs.entries()].find(([k])=>k!==e.pointerId)[1],d0=Math.hypot(p.x-o.x,p.y-o.y);p.x=e.clientX;p.y=e.clientY;const d=Math.hypot(p.x-o.x,p.y-o.y);if(d0>0)zoomAt((p.x+o.x)/2-r.left,(p.y+o.y)/2-r.top,d/d0)}p.x=e.clientX;p.y=e.clientY});
const up=e=>{ptrs.delete(e.pointerId)};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('dblclick',e=>{const r=R();zoomAt(e.clientX-r.left,e.clientY-r.top,e.shiftKey?.4:2.2)})};
const zbtns=(c,w)=>{c.save();c.font='600 16px system-ui';c.textAlign='center';['+','−','⌂'].forEach((g,i)=>{const x=w-36,y=8+i*34;box(c,x,y,28,28);c.strokeStyle=C.dim;c.strokeRect(x,y,28,28);c.fillStyle=C.gold;c.fillText(g,x+14,y+20)});c.restore()};

/* ===== 1. Newton: zoom + iteration table ===== */
const NF=[[x=>x*x-2,x=>2*x,'x² − 2',Math.SQRT2],[x=>x**3-2*x-5,x=>3*x*x-2,'x³ − 2x − 5',2.0945514815],[x=>Math.cos(x)-x,x=>-Math.sin(x)-1,'cos x − x',.7390851332],[x=>x**3-2*x+2,x=>3*x*x-2,'x³ − 2x + 2  (cycles from 0!)',-1.7692923542]];
X.newton=(c,w,h,t,s)=>{zoomable(c,s);const fi=clamp(s.par.fn??1,1,4)-1,[f,df,name,root]=NF[fi],x0=s.par.x0??3,nk=fi+'|'+x0;
if(!s.vw||s.nk!==nk){s.nk=nk;const sp=Math.max(Math.abs(x0-root)*1.5,1.8);s.vw={cx:(x0+root)/2,cy:clamp(f(x0)/3,-4,4),sc:Math.min(w,h*1.3)*.8/sp}}
const v=s.vw,mx=x=>w/2+(x-v.cx)*v.sc,my=y=>h/2-(y-v.cy)*v.sc,xs=[x0];
for(let i=0;i<9;i++){const x=xs[i],d=df(x);if(!isFinite(x)||Math.abs(d)<1e-9||Math.abs(x)>1e6)break;xs.push(x-f(x)/d)}
const NI=Math.min(xs.length-1,7);if(NI<1)return;
const xl=v.cx-w/2/v.sc,xr=v.cx+w/2/v.sc,yb=v.cy-h/2/v.sc,yt=v.cy+h/2/v.sc,st=nice(xr-xl),sy=nice(yt-yb);
c.font=MONO;c.strokeStyle='rgba(127,214,200,.10)';
for(let x=Math.ceil(xl/st)*st;x<xr;x+=st){P(c,[[mx(x),0],[mx(x),h]]);T(c,(+x.toFixed(12)).toString(),mx(x),clamp(my(0)+14,12,h-4),'center','rgba(224,189,108,.6)')}
for(let y=Math.ceil(yb/sy)*sy;y<yt;y+=sy)P(c,[[0,my(y)],[w,my(y)]]);
c.strokeStyle=C.dim;P(c,[[0,my(0)],[w,my(0)]]);P(c,[[mx(0),0],[mx(0),h]]);
const cv=[];for(let px=0;px<=w;px+=2){const x=xl+px/v.sc,y=f(x);cv.push([px,clamp(my(y),-1e4,1e4)])}c.strokeStyle=C.gold;c.lineWidth=2;P(c,cv);c.lineWidth=1.4;
const stp=t/1.8,k=s.par.fix?NI-1:Math.floor(stp)%NI,pr=s.par.fix?1:Math.min(1,(stp%1)*1.4);
for(let i=0;i<=k;i++){const a=xs[i],b=xs[i+1],cur=i===k,q=cur?pr:1;c.strokeStyle=cur?C.teal:C.faint;c.lineWidth=cur?2:1.2;P(c,[[mx(a),my(0)],[mx(a),my(f(a))]]);P(c,[[mx(a),my(f(a))],[mx(a+(b-a)*q),my(f(a)*(1-q))]]);dot(c,mx(a),my(0),3.5,cur?C.teal:C.gold);if(i>0&&mx(a)>0&&mx(a)<w)T(c,'x'+sub(i),mx(a),my(0)-8)}
c.lineWidth=1.4;dot(c,mx(root),my(0),3,'#fff');
/* table */
const rows=Math.min(k+1,6),r0=k+1-rows+1,bw=Math.min(w-52,300),bh=18+rows*14+16;box(c,6,6,bw,bh);c.font=MONO;
T(c,'f(x) = '+name,12,19,'left');
for(let i=r0;i<=k+1;i++){const y=34+(i-r0)*14,e=Math.abs(xs[i]-root);T(c,'x'+sub(i)+' = '+xs[i].toFixed(10),12,y,'left',i===k+1?C.teal:C.txt);if(bw>230)T(c,'err '+(e<1e-15?'<1e-15':e.toExponential(1)),bw-2,y,'right',C.txt)}
T(c,'zoom ×'+(v.sc/(Math.min(w,h*1.3)*.8/1.8)).toExponential(1).replace('e+0','e').replace('e','·10^'),12,bh,'left','rgba(159,196,189,.8)');
if(!s.zh&&!s.par.fix){T(c,'scroll / pinch / drag to zoom · double-tap to zoom in',w/2,h-8);}
zbtns(c,w)};

/* ===== 2. Lorenz: twin trajectories ===== */
X.lorenz=(c,w,h,t,s)=>{const rho=s.par.rho??28,gap=10**-(s.par.gap??4),TL=s.par.tl??5000,f=([x,y,z])=>[10*(y-x),x*(rho-z)-y,x*y-8/3*z];
if(!s.p){s.p=[1,1,1];s.q=[1+gap,1,1];s.tr=[[],[]];s.h=[]}
const n=Math.round(5*s.speed);for(let i=0;i<n;i++){s.p=rk(f,s.p,.008);s.q=rk(f,s.q,.008);s.tr[0].push(s.p);s.tr[1].push(s.q);if(i%2===0)s.h.push(Math.log10(Math.hypot(s.p[0]-s.q[0],s.p[1]-s.q[1],s.p[2]-s.q[2])+1e-12))}
s.tr.forEach(a=>{if(a.length>TL)a.splice(0,a.length-TL)});if(s.h.length>900)s.h.splice(0,s.h.length-900);
const A=.5*Math.sin(t*.1),ca=Math.cos(A),sa=Math.sin(A),k=Math.min(w/46,h/58),pr=([x,y,z])=>[w/2+(x*ca-y*sa)*k,h*.47-(z-25)*k];
fadeB(c,s.tr[0].map(pr),C.gold,30,1.5);fadeB(c,s.tr[1].map(pr),'#f472b6',30,1.5);
const a=pr(s.p),b=pr(s.q);dot(c,a[0],a[1],4,C.gold);dot(c,b[0],b[1],4,'#f472b6');
const d=s.h.length?s.h[s.h.length-1]:-4;c.font=MONO;T(c,'start gap 10'+('⁻'+String(s.par.gap??4).replace(/\d/g,x=>SUP9[x])),w*.04,h*.07,'left');T(c,'now Δ = '+(10**d).toExponential(1),w*.04,h*.07+15,'left',d>0?'#f472b6':C.txt);
const gx=w*.04,gy=h*.93,gw=Math.min(w*.5,230),gh=34;box(c,gx-4,gy-gh-14,gw+8,gh+20);c.strokeStyle=C.faint;P(c,[[gx,gy],[gx+gw,gy]]);
const hp=s.h.map((v,i)=>[gx+i/900*gw,gy-clamp((v+8)/10,0,1)*gh]);c.strokeStyle=C.teal;P(c,hp);T(c,'log₁₀ separation (grows ×e^λt, then saturates)',gx,gy-gh-4,'left','rgba(159,196,189,.9)');
if(d>0.6)T(c,'the two paths are now unrelated',w/2,h*.07,'center','#f472b6')};
const SUP9={0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹'};

/* ===== 3. Double pendulum: short trail, twin ===== */
X.pendulum=(c,w,h,t,s)=>{const g=9.81,f=([a,b,p,q])=>{const d=a-b,den=3-Math.cos(2*d);return[p,q,(-3*g*Math.sin(a)-g*Math.sin(a-2*b)-2*Math.sin(d)*(q*q+p*p*Math.cos(d)))/den,(2*Math.sin(d)*(2*p*p+2*g*Math.cos(a)+q*q*Math.cos(d)))/den]};
const a1=s.par.a1??2.2,twin=(s.par.tw??1)>0;if(!s.y){s.y=[a1,2.6,0,0];s.q=[a1+.001,2.6,0,0];s.tr=[[],[]]}
const n=Math.max(1,Math.round(s.dt/.002));for(let i=0;i<n;i++){s.y=rk(f,s.y,s.dt/n);s.q=rk(f,s.q,s.dt/n)}
const L=U(w,h,.2),ox=w/2,oy=h*.4,pos=y=>{const x1=ox+L*Math.sin(y[0]),y1=oy+L*Math.cos(y[0]);return[x1,y1,x1+L*Math.sin(y[1]),y1+L*Math.cos(y[1])]};
const draw=(y,i,col,al)=>{const p=pos(y);if(s.dt>0)s.tr[i].push([p[2],p[3]]);if(s.tr[i].length>85)s.tr[i].shift();c.globalAlpha=al;fadeB(c,s.tr[i],col,17,2);c.strokeStyle=col;c.lineWidth=2.4;P(c,[[ox,oy],[p[0],p[1]],[p[2],p[3]]]);c.lineWidth=1.4;dot(c,p[0],p[1],6,col);dot(c,p[2],p[3],7,col);c.globalAlpha=1};
if(twin)draw(s.q,1,'#f472b6',.7);draw(s.y,0,C.gold,1);
c.fillStyle='rgba(255,255,255,.18)';c.fillRect(ox-24,oy-5,48,3);dot(c,ox,oy,3.5,'#fff');c.font=MONO;T(c,'t = '+s.t.toFixed(1)+' s',w*.04,h*.07,'left');
if(twin)T(c,'twin differs by 0.001 rad: |Δθ₂| = '+Math.abs(s.y[1]-s.q[1]).toFixed(3)+' rad',w*.04,h*.07+15,'left',Math.abs(s.y[1]-s.q[1])>.5?'#f472b6':C.txt)};

/* ===== 4. Van der Pol: many streams, inside + outside, flow field ===== */
X.vanderpol=(c,w,h,t,s)=>{const mu=s.par.mu??1.5,f=([x,y])=>[y,mu*(1-x*x)*y-x],mx=x=>w/2+x*w/8,my=y=>h/2-y*h/(mu>2.5?14:10);
if(!s.q){const o=[[3.3,4],[-3.3,-4],[0,4.5],[3.6,-1],[-3.6,1],[2,-4.4],[-2,4.4],[1.4,3.6]],i=[[.05,.05],[-.3,.2],[.5,-.4],[-.6,-.1],[.2,.8],[0,-.9]];s.q=[...o.map(p=>({p,tr:[],o:1})),...i.map(p=>({p,tr:[],o:0}))]}
c.strokeStyle='rgba(127,214,200,.16)';for(let i=-3;i<=3;i++)for(let j=-4;j<=4;j++){const x=i*1.1,y=j*(mu>2.5?1.6:1.1),[u,v]=f([x,y]),m=Math.hypot(u/ (w/8),v/(h/10))||1,l=Math.min(14,w*.03),px=mx(x),py=my(y),dx=u*(w/8)/Math.hypot(u*w/8,v*h/10||1)*l,dy=-v*(h/10)/Math.hypot(u*w/8||1,v*h/10)*l;P(c,[[px,py],[px+dx,py+dy]])}
c.strokeStyle=C.dim;P(c,[[w*.03,h/2],[w*.97,h/2]]);P(c,[[w/2,h*.04],[w/2,h*.96]]);
s.q.forEach(o=>{const col=o.o?C.gold:C.teal;for(let k=0;k<3*s.speed;k++)o.p=rk(f,o.p,.02);o.tr.push([mx(o.p[0]),my(o.p[1])]);if(o.tr.length>330)o.tr.shift();fadeB(c,o.tr,col,14,1.5);dot(c,mx(o.p[0]),my(o.p[1]),3.2,col)});
c.font=MONO;T(c,'x',w*.97,h/2-8,'right');T(c,'ẋ',w/2+8,h*.07,'left');T(c,'gold: start outside the loop, teal: start inside',w*.04,h*.07,'left');T(c,'all 14 paths converge on the same limit cycle',w*.04,h*.93,'left')};

/* ===== 5. Logistic map: regimes, period, Lyapunov, zoom ===== */
const RG=[[2.8,3,'period 1',140],[3,3.4495,'period 2',190],[3.4495,3.5441,'period 4',235],[3.5441,3.5699,'8…',275],[3.5699,3.8284,'chaos',340],[3.8284,3.8415,'period 3',35],[3.8415,4.001,'chaos',340]],ZR=[[2.8,4],[3.4,4],[3.74,3.88]];
X.logistic=(c,w,h,t,s)=>{const zi=clamp(s.par.z??1,1,3)-1,[lo,hi]=ZR[zi],L=w*.06,R=w*.96,Tp=h*.1,B=h*.76,d=s.dpr||1,key=w+'x'+h+'z'+zi;
if(s.key!==key){s.key=key;const o=s.o=document.createElement('canvas');o.width=w*d;o.height=h*d;const g=o.getContext('2d');g.scale(d,d);g.fillStyle='rgba(224,189,108,.42)';const tr=zi===2?900:300;for(let px=0;px<=R-L;px+=.5){const r=lo+(hi-lo)*px/(R-L);let x=.5;for(let i=0;i<tr;i++)x=r*x*(1-x);for(let i=0;i<90;i++){x=r*x*(1-x);g.fillRect(L+px,B-x*(B-Tp),1,1)}}}
c.drawImage(s.o,0,0,w,h);const X_=r=>L+(r-lo)/(hi-lo)*(R-L);
c.font=MONO;RG.forEach(([a,b,n,hu])=>{const x0=clamp(X_(a),L,R),x1=clamp(X_(b),L,R);if(x1<=x0)return;c.fillStyle=`hsla(${hu},80%,60%,.5)`;c.fillRect(x0,B+8,x1-x0,6);if(x1-x0>46)T(c,n,(x0+x1)/2,B+28,'center','rgba(241,236,220,.8)')});
c.strokeStyle=C.dim;const st=nice(hi-lo);for(let r=Math.ceil(lo/st)*st;r<=hi+1e-9;r+=st){const x=X_(r);P(c,[[x,B+14],[x,B+18]]);T(c,r.toFixed(zi===2?3:2),x,B+h*.1+10)}
const fix=s.par.r??2.8,r=fix>2.8001?fix:lo+((t*.04)%1)*(hi-lo),x=X_(r);c.strokeStyle=C.teal;P(c,[[x,Tp],[x,B]]);
let v=.5;for(let i=0;i<2000;i++)v=r*v*(1-v);const seq=[];let lam=0;for(let i=0;i<256;i++){v=r*v*(1-v);seq.push(v);lam+=Math.log(Math.abs(r*(1-2*v))+1e-12)}lam/=256;
let per=0;for(let p=1;p<=64&&!per;p++){let ok=true;for(let i=0;i+p<256;i++)if(Math.abs(seq[i+p]-seq[i])>1e-6){ok=false;break}if(ok)per=p}
seq.slice(0,10).forEach(q=>dot(c,x,B-q*(B-Tp),2.6,C.teal));
c.font=MONO;box(c,6,4,Math.min(w-12,290),34);T(c,'r = '+r.toFixed(4)+'   λ = '+lam.toFixed(3),12,19,'left');T(c,per?'period '+per+' (stable cycle, λ<0)':'aperiodic: chaos (λ>0)',12,33,'left',per?C.teal:'#f472b6')};

/* ===== 6. Satellite ===== */
X.satellite=(c,w,h,t,s)=>{const e=s.par.e??.5,a=Math.min(w*.38,h*.34/Math.sqrt(1-e*e)),b=a*Math.sqrt(1-e*e),fx=w/2+a*e,fy=h*.46;
if(!s.st){s.st=[...Array(45)].map((_,i)=>[(Math.sin(i*91.7)*.5+.5)*w,(Math.sin(i*37.3)*.5+.5)*h,.6+i%3*.4])}
c.fillStyle='rgba(255,255,255,.35)';s.st.forEach(q=>c.fillRect(q[0],q[1]*1,q[2],q[2]));
const at=M=>{let E=M;for(let i=0;i<8;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));return[fx+a*(Math.cos(E)-e),fy-b*Math.sin(E),E]};
const el=[];for(let i=0;i<=240;i++){const E=i/240*TAU;el.push([fx+a*(Math.cos(E)-e),fy-b*Math.sin(E)])}c.setLineDash([4,5]);c.strokeStyle=C.dim;P(c,el);c.setLineDash([]);
const M0=t*.55,wedge=(m,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(fx,fy);for(let i=0;i<=18;i++){const p=at(m-.9+.9*i/18);c.lineTo(p[0],p[1])}c.fill()};wedge(M0,'rgba(224,189,108,.18)');wedge(M0+Math.PI,'rgba(127,214,200,.16)');
const tr=[];for(let i=0;i<=40;i++){const p=at(M0-.0225*(40-i)*8/3);tr.push([p[0],p[1]])}fadeB(c,tr,C.teal,20,3);
const gr=c.createRadialGradient(fx-6,fy-6,2,fx,fy,12);gr.addColorStop(0,'#7fe0d2');gr.addColorStop(1,'#14574f');c.fillStyle=gr;c.beginPath();c.arc(fx,fy,12,0,TAU);c.fill();circ(c,fx,fy,15,'rgba(127,214,200,.25)');
const[x,y,E]=at(M0),r=a*(1-e*Math.cos(E)),vx=-a*Math.sin(E),vy=-b*Math.cos(E),vn=Math.hypot(vx,vy),q=Math.sqrt(2/(r/a)-1),Lv=26+30*q;
c.strokeStyle='rgba(224,189,108,.5)';P(c,[[fx,fy],[x,y]]);const ex=x+vx/vn*Lv,ey=y-0*0+vy/vn*Lv;c.strokeStyle='#f472b6';c.lineWidth=2;P(c,[[x,y],[ex,ey],[ex-(vx/vn*8-vy/vn*4),ey-(vy/vn*8+vx/vn*4)]]);P(c,[[ex,ey],[ex-(vx/vn*8+vy/vn*4),ey-(vy/vn*8-vx/vn*4)]]);c.lineWidth=1.4;
c.fillStyle=C.gold;c.fillRect(x-4,y-4,8,8);c.fillStyle='rgba(127,214,200,.8)';c.fillRect(x-11,y-1.5,6,3);c.fillRect(x+5,y-1.5,6,3);
dot(c,fx+a*(1-e)*-1+0,fy,0,'#0000');c.font=MONO;const pe=[fx+a*(1-e),fy],ap=[fx-a*(1+e),fy];dot(c,pe[0],pe[1],3,'#fff');dot(c,ap[0],ap[1],3,'#fff');T(c,'periapsis',pe[0],pe[1]+16);T(c,'apoapsis',ap[0],ap[1]+16);
const KE=q*q/2,PE=-1/(r/a),bx=w*.04,by=h*.9,sc=Math.min(w*.18,70);T(c,'e = '+e.toFixed(2)+'   r = '+(r/a).toFixed(2)+'a   v = '+q.toFixed(2)+' v₀',w*.04,h*.07,'left');
c.fillStyle='rgba(127,214,200,.7)';c.fillRect(bx,by-26,KE*sc,6);c.fillStyle='rgba(224,189,108,.7)';c.fillRect(bx,by-16,-PE*sc,6);c.fillStyle='#fff';c.fillRect(bx+.5*sc-1,by-30,2,24);T(c,'KE',bx+KE*sc+16,by-20,'left');T(c,'|PE|',bx-PE*sc+22,by-10,'left');T(c,'KE − |PE| = −½ always (energy conserved)',bx,by+6,'left')};

/* ===== 7. Rocket: pitch programme, auto camera, orbit read-out ===== */
X.rocket=(c,w,h,t,s)=>{const mr=s.par.mr??10,pp=s.par.pp??.5,ve=.6,mdot=1.4/ve,tb=(1-1/mr)/mdot,tv=.04;
if(!s.r){s.r={x:0,y:1,vx:0,vy:0,m:1,T:0,end:0,why:''};s.tr=[];s.vr=1.6}
const q=s.r;if(q.end>0){q.end-=s.dt;if(q.end<=0){s.r=null;return}}else{const sim=s.dt*(q.T<tb?.06:1.2),n=clamp(Math.ceil(sim/.0008),1,90),d=sim/n;
for(let i=0;i<n;i++){const r=Math.hypot(q.x,q.y),ux=q.x/r,uy=q.y/r;let ax=-ux/r/r,ay=-uy/r/r;
if(q.T<tb){const th=Math.PI/2*Math.min(1,Math.max(0,(q.T-tv)/(tb-tv)))**pp,dx=ux*Math.cos(th)+uy*Math.sin(th),dy=uy*Math.cos(th)-ux*Math.sin(th),a=mdot*ve/q.m;ax+=a*dx;ay+=a*dy;q.m-=mdot*d;q.th=th}
q.vx+=ax*d;q.vy+=ay*d;q.x+=q.vx*d;q.y+=q.vy*d;q.T+=d;if(Math.hypot(q.x,q.y)<1&&q.T>.05){q.end=1.6;q.why='crashed';break}}
if(q.T>tb+13||Math.hypot(q.x,q.y)>10){q.end=1.2}}
const rr=Math.hypot(q.x,q.y),sp=Math.hypot(q.vx,q.vy),eps=sp*sp/2-1/rr,hh=q.x*q.vy-q.y*q.vx;s.vr+=(Math.max(1.6,rr*1.3)-s.vr)*.04;
const sc=Math.min(w,h)*.5/s.vr,cx=w/2,cy=h/2,mp=(x,y)=>[cx+x*sc,cy-y*sc];
const gr=c.createRadialGradient(cx-sc*.3,cy-sc*.3,sc*.1,cx,cy,sc);gr.addColorStop(0,'#3a9a8e');gr.addColorStop(1,'#10352f');c.fillStyle=gr;c.beginPath();c.arc(cx,cy,sc,0,TAU);c.fill();circ(c,cx,cy,sc*1.03,'rgba(127,214,200,.25)');
if(s.dt&&q.end<=0)s.tr.push([q.x,q.y]);if(s.tr.length>4000)s.tr.shift();fadeB(c,s.tr.map(p=>mp(p[0],p[1])),C.gold,40,2);
const p=mp(q.x,q.y),burn=q.T<tb&&q.end<=0,ang=burn?(q.th??0):0,ux=q.x/rr,uy=q.y/rr;let dx=sp>.02?q.vx/sp:ux,dy=sp>.02?q.vy/sp:uy;dy=-dy;const nx=-dy,ny=dx;
c.fillStyle='#f1ecdc';c.beginPath();c.moveTo(p[0]+dx*9,p[1]+dy*9);c.lineTo(p[0]-dx*6+nx*4,p[1]-dy*6+ny*4);c.lineTo(p[0]-dx*6-nx*4,p[1]-dy*6-ny*4);c.fill();
if(burn){c.fillStyle='#f97316';c.beginPath();c.moveTo(p[0]-dx*6+nx*3,p[1]-dy*6+ny*3);c.lineTo(p[0]-dx*(14+6*Math.random())  ,p[1]-dy*(14+6*Math.random()));c.lineTo(p[0]-dx*6-nx*3,p[1]-dy*6-ny*3);c.fill()}
c.font=MONO;T(c,'Δv ideal = vₑ ln(m₀/m_f) = '+(ve*Math.log(mr)).toFixed(2)+' v꜀',w*.04,h*.07,'left');
let res,col=C.txt;if(burn)res='burning…';else if(q.why==='crashed'||(eps<0&&(-1/(2*eps))*(1-Math.sqrt(Math.max(0,1+2*eps*hh*hh)))<1)){const a=-1/(2*eps),ec=Math.sqrt(Math.max(0,1+2*eps*hh*hh));res=eps<0?'SUBORBITAL: periapsis '+(a*(1-ec)).toFixed(2)+' R is underground':'';col='#f472b6'}
else if(eps>=0){res='ESCAPE: v > √2 v꜀ at this height';col='#7fe0d2'}else{const a=-1/(2*eps),ec=Math.sqrt(1+2*eps*hh*hh);res='ORBIT: periapsis '+(a*(1-ec)).toFixed(2)+' R, apoapsis '+(a*(1+ec)).toFixed(2)+' R';col='#7fe0d2'}
T(c,res,w*.04,h*.07+15,'left',col);T(c,'alt '+(rr-1).toFixed(2)+' R   v '+sp.toFixed(2)+' v꜀   pitch '+(ang*180/Math.PI).toFixed(0)+'°',w*.04,h*.95,'left')};

/* ===== 8. Fourier: rotating circles + unrolled wave + spectrum ===== */
X.square=(c,w,h,t,s)=>{const N=s.par.N??5,wf=clamp(s.par.wf??1,1,3),th=t*1.1,cx=w*.2,cy=h*.46,u=Math.min(h*.27,w*.12);
const term=k=>wf===1?(k%2?4/(Math.PI*k):0):wf===2?2/Math.PI*(k%2?1:-1)/k:(k%2?8/(Math.PI**2)*(((k-1)/2)%2?-1:1)/k/k:0),ideal=a=>{const m=((a%TAU)+TAU)%TAU;return wf===1?(m<Math.PI?1:-1):wf===2?(m<Math.PI?m/Math.PI:m/Math.PI-2)*1:(m<Math.PI?-1+2*m/Math.PI:3-2*m/Math.PI)*-1};
const ks=[];for(let k=1;ks.length<N&&k<80;k++)if(term(k))ks.push(k);let x=cx,y=cy;
ks.forEach(k=>{const r=term(k)*u,a=k*th,nx=x+r*Math.cos(a),ny=y-r*Math.sin(a);if(Math.abs(r)>1)circ(c,x,y,Math.abs(r),'rgba(127,214,200,.22)');c.strokeStyle=C.teal;P(c,[[x,y],[nx,ny]]);x=nx;y=ny});
const x0=cx+u*1.6,pw=(w*.97-x0)/(TAU*1.4);c.strokeStyle=C.faint;c.setLineDash([5,5]);P(c,[[cx,cy],[x0,cy]]);c.setLineDash([]);P(c,[[x0,cy-u*1.5],[x0,cy+u*1.5]]);
c.strokeStyle='rgba(224,189,108,.28)';const id=[];for(let px=0;px<=w*.97-x0;px+=2)id.push([x0+px,cy-ideal(th-px/pw)*u*(wf===3?1:1)*(wf===1?1:1)]);
if(wf===1){c.beginPath();id.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke()}else P(c,id);
const hist=[];for(let px=0;px<=w*.97-x0;px+=2){const a=th-px/pw;let yy=0;ks.forEach(k=>yy+=term(k)*Math.sin(k*a));hist.push([x0+px,cy-yy*u])}c.strokeStyle=C.gold;c.lineWidth=2.2;P(c,hist);c.lineWidth=1.4;
c.strokeStyle='rgba(224,189,108,.5)';P(c,[[x,y],[x0,hist[0][1]]]);dot(c,x,y,4,C.gold);dot(c,x0,hist[0][1],3.5,C.teal);
const mxv=Math.max(...hist.map(p=>(cy-p[1])/u));c.font=MONO;T(c,['square','sawtooth','triangle'][wf-1]+' wave, '+ks.length+' harmonics',w*.04,h*.07,'left');
if(wf<3)T(c,'peak '+mxv.toFixed(3)+(wf===1?' vs 1 (Gibbs overshoot ≈ 9% of the jump)':' (ideal → 1)'),w*.04,h*.07+15,'left');
const bx=w*.04,by=h*.93,bw=Math.min(14,(w*.5)/Math.max(ks.length,1)-2);T(c,'amplitude spectrum',bx,by-40,'left','rgba(159,196,189,.9)');ks.forEach((k,i)=>{const a=Math.abs(term(k))/1.3*34;c.fillStyle=C.teal;c.fillRect(bx+i*(bw+2),by-a,bw,a);if(bw>9)T(c,k,bx+i*(bw+2)+bw/2,by+11)})};

/* ===== 9. Heat: waterfall + rod colour + BC / IC choices ===== */
const HM=lut([[0,[8,22,60]],[.25,[40,60,170]],[.5,[190,50,140]],[.75,[250,150,50]],[1,[255,244,200]]]);
X.heat=(c,w,h,t,s)=>{const N=160,ic=clamp(s.par.ic??1,1,3),ins=(s.par.bc??1)===2,k=s.par.k??.4,L=w*.07,R=w*.95,Tp=h*.17,B=h*.55;
if(!s.u||s.n>14000){s.n=0;s.u=Float64Array.from({length:N},(_,i)=>ic===1?Math.exp(-(((i-N/2)/6)**2)):ic===2?.6*Math.exp(-(((i-N*.28)/5)**2))+Math.exp(-(((i-N*.72)/8)**2)):i<N/2?1:0);s.rows=[];s.sn=[];s.h0=s.u.reduce((a,b)=>a+b,0)}
for(let q=0;q<24*s.speed;q++){const u=s.u,v=u.slice();for(let i=1;i<N-1;i++)v[i]=u[i]+k*(u[i-1]-2*u[i]+u[i+1]);if(ins){v[0]=u[0]+k*2*(u[1]-u[0]);v[N-1]=u[N-1]+k*2*(u[N-2]-u[N-1])}else v[0]=v[N-1]=0;s.u=v;s.n++;if(s.n%60===0){s.rows.push(Float32Array.from(v));if(s.rows.length>70)s.rows.shift()}}
const x=i=>L+i/(N-1)*(R-L),y=v=>B-v*(B-Tp);c.strokeStyle='rgba(127,214,200,.12)';for(let g=0;g<=4;g++)P(c,[[L,y(g/4)],[R,y(g/4)]]);c.strokeStyle=C.dim;P(c,[[L,B],[R,B]]);
const p=Array.from(s.u,(v,i)=>[x(i),y(v)]);c.fillStyle='rgba(224,189,108,.12)';c.beginPath();c.moveTo(L,B);p.forEach(q=>c.lineTo(q[0],q[1]));c.lineTo(R,B);c.fill();
for(let i=0;i<N;i+=2){const m=HM[clamp(Math.round(s.u[i]*255),0,255)];c.fillStyle=`rgb(${m[0]},${m[1]},${m[2]})`;c.fillRect(x(i),B+4,(R-L)/N*2+.5,14)}
c.strokeStyle=C.gold;c.lineWidth=2;P(c,p);c.lineWidth=1.4;
if(s.rows.length){if(!s.img||s.img.width!==N){s.img=document.createElement('canvas');s.img.width=N;s.img.height=70}const g=s.img.getContext('2d'),d=g.createImageData(N,70);s.rows.forEach((r,j)=>{for(let i=0;i<N;i++){const m=HM[clamp(Math.round(r[i]*255),0,255)],o=(j*N+i)*4;d.data[o]=m[0];d.data[o+1]=m[1];d.data[o+2]=m[2];d.data[o+3]=255}});g.putImageData(d,0,0);c.imageSmoothingEnabled=true;const wy=B+26,wh=h*.97-wy;c.drawImage(s.img,0,0,N,s.rows.length,L,wy,R-L,wh*s.rows.length/70);T(c,'position x →  ·  time ↓  (each row a snapshot)',L,wy-3,'left','rgba(159,196,189,.9)')}
const tot=s.u.reduce((a,b)=>a+b,0)/s.h0;c.font=MONO;T(c,'u(x,t)',L,Tp-10,'left');T(c,'τ = '+s.n+'   peak '+Math.max(...s.u).toFixed(2)+'   heat left '+(tot*100).toFixed(0)+'%'+(ins?' (insulated: conserved)':' (ends held at 0°)'),R,Tp-10,'right')};

/* ===== 10. Clifford: density + palette ===== */
const CP=lut([[0,[6,8,28]],[.2,[44,22,110]],[.42,[170,36,140]],[.66,[255,120,60]],[.88,[255,214,120]],[1,[255,250,225]]]);
X.clifford=(c,w,h,t,s)=>{const a=(s.par.a??-1.7)+.12*Math.sin(t*.25),b=(s.par.b??1.8)+.1*Math.cos(t*.2),cc=-.9,d=-1.2,W=Math.ceil(w/2),Hh=Math.ceil(h/2);
if(!s.im||s.im.width!==W||s.im.height!==Hh){s.im=document.createElement('canvas');s.im.width=W;s.im.height=Hh;s.cnt=new Uint16Array(W*Hh)}
if(s.dt>0||!s.done){const cnt=s.cnt,u=Math.min(W,Hh)*.21*1.25;cnt.fill(0);let x=.1,y=.1,mxc=1;for(let i=0;i<60000;i++){const nx=Math.sin(a*y)+cc*Math.cos(a*x),ny=Math.sin(b*x)+d*Math.cos(b*y);x=nx;y=ny;if(i<20)continue;const px=(W/2+x*u)|0,py=(Hh/2+y*u)|0;if(px>=0&&px<W&&py>=0&&py<Hh){const k=py*W+px;if(++cnt[k]>mxc)mxc=cnt[k]}}
const g=s.im.getContext('2d'),im=g.createImageData(W,Hh),lm=Math.log(1+mxc*.6);for(let i=0;i<cnt.length;i++){const v=cnt[i]?Math.min(1,Math.log(1+cnt[i])/lm):0,m=CP[Math.round(v**.8*255)];im.data[i*4]=m[0];im.data[i*4+1]=m[1];im.data[i*4+2]=m[2];im.data[i*4+3]=v>0?255:0}g.putImageData(im,0,0);s.done=1}
c.fillStyle='#050615';c.fillRect(0,0,w,h);c.drawImage(s.im,0,0,w,h);c.font=MONO;T(c,'a = '+a.toFixed(2)+'   b = '+b.toFixed(2)+'   (colour = how often the orbit visits a pixel)',w*.04,h*.07,'left','rgba(255,240,210,.85)')};

/* ===== NEW: university syllabus exhibits ===== */
/* Mandelbrot / Julia with deep zoom */
const MP=[...Array(512)].map((_,i)=>hsl((i*.9+220)%360,.85,.25+.35*(.5+.5*Math.sin(i/40))));
X.mandel=(c,w,h,t,s)=>{zoomable(c,s);const jm=(s.par.jm??1)===2,it=s.par.it??150,jr=s.par.jr??-.8,ji=s.par.ji??.156,key=[jm,it,jr,ji,w,h].join();
if(s.jm!==jm||!s.vw){s.jm=jm;s.vw={cx:jm?0:-.5,cy:0,sc:Math.min(w/3.4,h/2.5)};s.dirty=1}
const v=s.vw,RS=w>500?2:1.6,W=Math.ceil(w/RS),Hh=Math.ceil(h/RS);
if(s.dirty||s.mk!==key){s.dirty=0;s.mk=key;if(!s.img||s.img.width!==W||s.img.height!==Hh){s.img=document.createElement('canvas');s.img.width=W;s.img.height=Hh}const g=s.img.getContext('2d'),im=g.createImageData(W,Hh),D=im.data,ls=Math.log(2);
for(let py=0;py<Hh;py++)for(let px=0;px<W;px++){const X0=v.cx+(px*RS-w/2)/v.sc,Y0=v.cy-(py*RS-h/2)/v.sc;let zr=jm?X0:0,zi=jm?Y0:0,cr=jm?jr:X0,ci=jm?ji:Y0,n=0,zr2=zr*zr,zi2=zi*zi;
while(n<it&&zr2+zi2<256){zi=2*zr*zi+ci;zr=zr2-zi2+cr;zr2=zr*zr;zi2=zi*zi;n++}
const o=(py*W+px)*4;if(n>=it){D[o]=D[o+1]=D[o+2]=6;D[o+3]=255}else{const nu=n+1-Math.log(Math.log(zr2+zi2)/2)/ls,m=MP[((nu*8)|0)%512];D[o]=m[0];D[o+1]=m[1];D[o+2]=m[2];D[o+3]=255}}g.putImageData(im,0,0)}
c.drawImage(s.img,0,0,w,h);c.font=MONO;box(c,6,6,Math.min(w-52,262),34);T(c,(jm?'Julia set, c = '+jr.toFixed(3)+' + '+ji.toFixed(3)+'i':'Mandelbrot set  zₙ₊₁ = zₙ² + c'),12,21,'left');T(c,'zoom ×'+(v.sc/Math.min(w/3.4,h/2.5)).toExponential(1)+'   iterations '+it,12,35,'left');zbtns(c,w)};

/* Taylor polynomials */
const TF=[['sin x',k=>k%2?(((k-1)/2)%2?-1:1)/fact(k):0,Math.sin,[-7,7,-3,3],0],['cos x',k=>k%2?0:((k/2)%2?-1:1)/fact(k),Math.cos,[-7,7,-3,3],0],['eˣ',k=>1/fact(k),Math.exp,[-4,3,-2,8],0],['ln(1 + x)',k=>k?((k%2)?1:-1)/k:0,x=>Math.log(1+x),[-1.2,3,-3,3],1],['1/(1 − x)',()=>1,x=>1/(1-x),[-2.5,2.5,-4,6],1]];
function fact(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r}
X.taylor=(c,w,h,t,s)=>{const fi=clamp(s.par.fn??1,1,5)-1,n=s.par.n??5,[nm,co,f,[x0,x1,y0,y1],rad]=TF[fi],mx=x=>w*.04+(x-x0)/(x1-x0)*w*.92,my=y=>h*.9-(y-y0)/(y1-y0)*h*.82,pol=x=>{let r=0,p=1;for(let k=0;k<=n;k++){r+=co(k)*p;p*=x}return r};
c.strokeStyle='rgba(127,214,200,.12)';for(let x=Math.ceil(x0);x<=x1;x++)P(c,[[mx(x),0],[mx(x),h]]);for(let y=Math.ceil(y0);y<=y1;y++)P(c,[[0,my(y)],[w,my(y)]]);c.strokeStyle=C.dim;P(c,[[0,my(0)],[w,my(0)]]);P(c,[[mx(0),0],[mx(0),h]]);
if(rad){c.setLineDash([5,5]);c.strokeStyle='#f472b6';[-1,1].forEach(r=>P(c,[[mx(r),0],[mx(r),h]]));c.setLineDash([])}
const cl=y=>clamp(my(y),-20,h+20),a=[],b=[];for(let px=0;px<=w;px+=2){const x=x0+(px-w*.04)/(w*.92)*(x1-x0);if(x<x0||x>x1)continue;const yf=f(x),yp=pol(x);if(isFinite(yf)&&yf>y0-8&&yf<y1+8)a.push([px,cl(yf)]);else if(a.length){c.strokeStyle=C.gold;c.lineWidth=2.4;P(c,a);a.length=0}b.push([px,cl(yp)])}
c.strokeStyle=C.gold;c.lineWidth=2.4;P(c,a);c.strokeStyle=C.teal;c.lineWidth=2;P(c,b);c.lineWidth=1.4;
const xe=(x0+x1)/2+(x1-x0)*.3*Math.sin(t*.4),ef=f(xe),ep=pol(xe);if(isFinite(ef)){c.strokeStyle='#f472b6';P(c,[[mx(xe),my(ef)],[mx(xe),clamp(my(ep),0,h)]]);dot(c,mx(xe),my(ef),4,C.gold);dot(c,mx(xe),clamp(my(ep),0,h),4,C.teal)}
c.font=MONO;box(c,6,6,Math.min(w-12,300),48);T(c,'gold: f(x) = '+nm+'     teal: Taylor degree '+n,12,21,'left');T(c,'x = '+xe.toFixed(2)+'   error |f − Pₙ| = '+(isFinite(ef)?Math.abs(ef-ep).toExponential(1):'—'),12,35,'left','#f472b6');T(c,rad?'pink dashes: radius of convergence R = 1':'converges for every x (R = ∞)',12,49,'left','rgba(159,196,189,.9)')};

/* Linear algebra: matrix as a map, eigenvectors, SVD */
X.eigen=(c,w,h,t,s)=>{const A=[[s.par.a??1.4,s.par.b??.6],[s.par.c??.3,s.par.d??.9]],tau=.5-.5*Math.cos(t*.6),M=[[1+(A[0][0]-1)*tau,A[0][1]*tau],[A[1][0]*tau,1+(A[1][1]-1)*tau]],cx=w/2,cy=h/2,u=Math.min(w,h)*.1,ap=(x,y,m=M)=>[cx+u*(m[0][0]*x+m[0][1]*y),cy-u*(m[1][0]*x+m[1][1]*y)];
c.strokeStyle='rgba(127,214,200,.18)';for(let i=-6;i<=6;i++){P(c,[ap(i,-6),ap(i,6)]);P(c,[ap(-6,i),ap(6,i)])}
const circ_=[],ci=[];for(let i=0;i<=120;i++){const a=i/120*TAU;circ_.push(ap(Math.cos(a),Math.sin(a)));ci.push([cx+u*Math.cos(a),cy-u*Math.sin(a)])}c.strokeStyle='rgba(224,189,108,.28)';P(c,ci);c.fillStyle='rgba(224,189,108,.12)';c.beginPath();circ_.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.fill();c.strokeStyle=C.gold;c.lineWidth=2.2;P(c,circ_);c.lineWidth=1.4;
const[a,b,cc,d]=[A[0][0],A[0][1],A[1][0],A[1][1]],tr=a+d,det=a*d-b*cc,disc=tr*tr/4-det;c.font=MONO;
if(disc>=0){const sq=Math.sqrt(disc),ls=[tr/2+sq,tr/2-sq];ls.forEach((l,i)=>{let vx,vy;if(Math.abs(b)>1e-6){vx=b;vy=l-a}else if(Math.abs(cc)>1e-6){vx=l-d;vy=cc}else{vx=i?0:1;vy=i?1:0}const n=Math.hypot(vx,vy);vx/=n;vy/=n;c.strokeStyle=i?'#f472b6':C.teal;c.lineWidth=2;P(c,[[cx-vx*u*5,cy+vy*u*5],[cx+vx*u*5,cy-vy*u*5]]);c.lineWidth=1.4;const e=ap(vx,vy);dot(c,e[0],e[1],4,i?'#f472b6':C.teal)});T(c,'λ₁ = '+ls[0].toFixed(3)+'   λ₂ = '+ls[1].toFixed(3),w*.04,h*.07,'left')}else T(c,'λ = '+(tr/2).toFixed(2)+' ± '+Math.sqrt(-disc).toFixed(2)+'i  (rotation: no real eigenvector)',w*.04,h*.07,'left','#f472b6');
const e1=ap(1,0),e2=ap(0,1);c.strokeStyle=C.gold;P(c,[[cx,cy],[cx+u,cy]]);P(c,[[cx,cy],[cx,cy-u]]);c.strokeStyle='#fff';P(c,[[cx,cy],e1]);P(c,[[cx,cy],e2]);
const ata=[[a*a+cc*cc,a*b+cc*d],[a*b+cc*d,b*b+d*d]],tt=ata[0][0]+ata[1][1],dd=ata[0][0]*ata[1][1]-ata[0][1]**2,sg=Math.sqrt(Math.max(0,tt/2+Math.sqrt(Math.max(0,tt*tt/4-dd)))),sm=Math.sqrt(Math.max(0,tt/2-Math.sqrt(Math.max(0,tt*tt/4-dd))));
T(c,'tr = '+tr.toFixed(2)+'   det = '+det.toFixed(2)+'   singular values '+sg.toFixed(2)+', '+sm.toFixed(2),w*.04,h*.07+15,'left');T(c,'unit circle → ellipse; eigenvectors keep their direction; area × |det|',w*.04,h*.95,'left')};

/* Lotka–Volterra predator–prey */
X.lotka=(c,w,h,t,s)=>{const al=s.par.al??.8,gm=s.par.gm??.6,f=([x,y])=>[al*x-x*y,x*y-gm*y],wide=w>h*1.25,pw=wide?w*.5:w,ph=wide?h:h*.62,mx=x=>pw*.1+x/(3.2)*pw*.84,my=y=>ph*.88-y/(3.2)*ph*.78;
if(!s.q){const ST=[[gm*1.3,al*1.3],[gm*1.8,al*1.8],[gm*.5,al*.5]];s.q=ST.map(p=>({p,tr:[]}));s.h=[]}
c.strokeStyle=C.dim;P(c,[[pw*.1,ph*.88],[pw*.95,ph*.88]]);P(c,[[pw*.1,ph*.1],[pw*.1,ph*.88]]);
s.q.forEach((o,i)=>{for(let k=0;k<4*s.speed;k++)o.p=rk(f,o.p,.01);o.tr.push([mx(o.p[0]),my(o.p[1])]);if(o.tr.length>1100)o.tr.shift();c.globalAlpha=.8;c.strokeStyle=[C.gold,C.teal,'#f472b6'][i];P(c,o.tr);c.globalAlpha=1;dot(c,mx(o.p[0]),my(o.p[1]),3.5,[C.gold,C.teal,'#f472b6'][i])});
dot(c,mx(gm),my(al),4,'#fff');c.font=MONO;T(c,'equilibrium (γ, α)',mx(gm)+8,my(al)-6,'left');T(c,'prey x →',pw*.95,ph*.88+14,'right');T(c,'predator y',pw*.1+4,ph*.1,'left');
const o=s.q[0];s.h.push(o.p.slice());if(s.h.length>400)s.h.shift();const tx=wide?pw+w*.04:w*.08,tw=wide?w*.44:w*.84,ty=wide?h*.1:ph+h*.06,th=wide?h*.78:h*.3;c.strokeStyle=C.dim;P(c,[[tx,ty+th],[tx+tw,ty+th]]);P(c,[[tx,ty],[tx,ty+th]]);
[[0,C.gold],[1,C.teal]].forEach(([j,col])=>{c.strokeStyle=col;P(c,s.h.map((p,i)=>[tx+i/400*tw,ty+th-clamp(p[j]/3.2,0,1)*th]))});T(c,'prey (gold) and predator (teal) vs time: lagging cycles',tx,ty-6,'left');
const V=o.p[0]-gm*Math.log(o.p[0])+o.p[1]-al*Math.log(o.p[1]);T(c,'conserved V = '+V.toFixed(4),w*.04,h*.95,'left')};

/* Gradient descent */
const GD=[[(x,y)=>x*x+10*y*y,(x,y)=>[2*x,20*y],[-3,3,-2,2],[-2.5,1.5],.09],[(x,y)=>(1-x)**2+100*(y-x*x)**2,(x,y)=>[-2*(1-x)-400*x*(y-x*x),200*(y-x*x)],[-2,2,-1,3],[-1.5,2],.0018],[(x,y)=>(x*x+y-11)**2+(x+y*y-7)**2,(x,y)=>[4*x*(x*x+y-11)+2*(x+y*y-7),2*(x*x+y-11)+4*y*(x+y*y-7)],[-5,5,-5,5],[-.5,-4],.012]];
X.graddesc=(c,w,h,t,s)=>{const fi=clamp(s.par.fn??1,1,3)-1,[f,gr,[x0,x1,y0,y1],st,sc]=GD[fi],lr=(s.par.lr??.6)*sc,mo=s.par.mo??0,mx=x=>(x-x0)/(x1-x0)*w,my=y=>h-(y-y0)/(y1-y0)*h,key=fi+'|'+w+'|'+h,cv=c.canvas;
if(!s.ck||s.fk!==fi){s.fk=fi;s.p=null}
if(!s.cl){s.cl=1;cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),g=GD[s.fk],[a,b,cc,d]=g[2];s.st0=[a+(e.clientX-r.left)/r.width*(b-a),d-(e.clientY-r.top)/r.height*(d-cc)];s.p=null})}
if(s.ck!==key){s.ck=key;const W=Math.ceil(w/3),Hh=Math.ceil(h/3),o=s.bg=document.createElement('canvas');o.width=W;o.height=Hh;const g=o.getContext('2d'),im=g.createImageData(W,Hh);for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const v=f(x0+(i+.5)/W*(x1-x0),y1-(j+.5)/Hh*(y1-y0)),l=Math.log10(1+Math.abs(v)),b=.5+.5*Math.cos(l*9),k=(j*W+i)*4,q=clamp(l/3.2,0,1);im.data[k]=20+q*60+b*18;im.data[k+1]=50+(1-q)*70+b*18;im.data[k+2]=70+(1-q)*60+b*22;im.data[k+3]=255}g.putImageData(im,0,0)}
c.drawImage(s.bg,0,0,w,h);
if(!s.p){s.p=(s.st0&&s.sf===fi?s.st0:st).slice();s.sf=s.st0?fi:-1;s.v=[0,0];s.tr=[s.p.slice()];s.it=0}
const sp=Math.max(1,Math.round(2*s.speed));if(s.dt>0&&Math.abs(f(...s.p))<1e7)for(let k=0;k<sp;k++){const g=gr(...s.p);s.v=[mo*s.v[0]-lr*g[0],mo*s.v[1]-lr*g[1]];s.p=[s.p[0]+s.v[0],s.p[1]+s.v[1]];s.tr.push(s.p.slice());s.it++}if(s.tr.length>1500)s.tr.shift();
fadeB(c,s.tr.map(p=>[mx(p[0]),my(p[1])]),C.gold,40,2);const q=s.p;dot(c,mx(q[0]),my(q[1]),5,'#fff');const fv=f(...q),g=gr(...q),gn=Math.hypot(g[0],g[1]);c.font=MONO;box(c,6,6,Math.min(w-12,250),48);
T(c,['f = x² + 10y²','Rosenbrock (banana valley)','Himmelblau (4 minima)'][fi],12,21,'left');T(c,'iter '+s.it+'   f = '+(Math.abs(fv)>1e6?'diverged':fv.toFixed(4)),12,35,'left',Math.abs(fv)>1e6?'#f472b6':C.txt);T(c,'|∇f| = '+(gn>1e6?'∞':gn.toFixed(4))+'   step = '+(lr/sc).toFixed(2)+'×',12,49,'left');T(c,'tap anywhere to choose a new starting point',w/2,h-8)};

/* ===== registry ===== */
const M=(id,title,eq,desc,tags,p)=>META.push({id,title,eq,desc,tags,p});
M('mandel','Mandelbrot & Julia sets (zoom)','zₙ₊₁ = zₙ² + c','The Mandelbrot set is every complex c for which iterating z → z² + c from 0 stays bounded. Zoom in with scroll, pinch or the + button: the boundary never gets simpler. Switch to Julia mode to fix c and iterate over z instead.',['Iteration','Complex dynamics','Self-similarity'],[['jm','Mode (1 Mandelbrot, 2 Julia)',1,2,1,1],['it','Max iterations',40,500,10,150],['jr','Julia c (real)',-1.5,1.5,.01,-.8],['ji','Julia c (imag)',-1.5,1.5,.01,.156]]);
M('taylor','Taylor polynomials','f(x) ≈ Σₖ f⁽ᵏ⁾(0) xᵏ / k!','Polynomials built from derivatives at 0 hug a function near the origin, and the fit spreads outward as the degree grows. For ln(1+x) and 1/(1−x) it stops at the radius of convergence R = 1, however large the degree.',['Taylor series','Convergence'],[['fn','Function (1 sin, 2 cos, 3 eˣ, 4 ln(1+x), 5 geometric)',1,5,1,1],['n','Degree n',0,15,1,5]]);
M('eigen','Eigenvectors & singular values','A v = λ v   ,   A = U Σ Vᵀ','A 2×2 matrix maps the unit circle to an ellipse. Eigenvectors are the directions that are only stretched, never turned (eigenvalue = stretch factor). Singular values are the ellipse’s semi-axes. Complex eigenvalues mean rotation.',['Linear algebra','Eigenvalues'],[['a','a₁₁',-2,2,.1,1.4],['b','a₁₂',-2,2,.1,.6],['c','a₂₁',-2,2,.1,.3],['d','a₂₂',-2,2,.1,.9]]);
M('lotka','Lotka–Volterra predator–prey','ẋ = αx − xy ,  ẏ = xy − γy','Prey grow, predators eat prey and grow, then starve: populations cycle forever. The closed orbits come from a conserved quantity V(x,y), and the centre is an equilibrium at (γ, α).',['Population dynamics','Phase space','Conservation law'],[['al','Prey growth α',.3,1.5,.05,.8],['gm','Predator death γ',.3,1.5,.05,.6]]);
M('graddesc','Gradient descent','xₖ₊₁ = xₖ − η∇f(xₖ) + β(xₖ − xₖ₋₁)','The workhorse of optimisation and machine learning. Too large a step diverges, too small crawls; in narrow valleys (Rosenbrock) plain descent zig-zags and momentum β helps. Tap the map to pick a starting point.',['Optimization','Iteration','Convergence'],[['fn','Surface (1 bowl, 2 Rosenbrock, 3 Himmelblau)',1,3,1,1],['lr','Step size (× stable limit)',.05,1.3,.05,.6],['mo','Momentum β',0,.95,.05,0]]);
const upd=(id,f)=>f(META.find(m=>m.id===id));
upd('newton',m=>{m.desc='Follow the tangent to the axis for the next guess; correct digits roughly double each step. Table shows every iterate and its error. Zoom (scroll, pinch, + / −) into the root to see the curve turn into its own tangent. Try function 4 starting at 0: Newton cycles forever.';m.p=[['fn','Function (1–4)',1,4,1,1],['x0','Start x₀',-3,4,.1,3]];m.tags=['Iteration','Convergence']});
upd('lorenz',m=>{m.desc='Atmospheric convection model. Two trajectories (gold, pink) start a tiny distance apart: the graph shows their separation growing exponentially until they are completely unrelated. Sensitive dependence on initial conditions.';m.p=[['rho','ρ',10,40,1,28],['gap','Initial gap (10⁻ⁿ)',1,9,1,4],['tl','Trail length',500,9000,250,5000]]});
upd('pendulum',m=>{m.desc='Two rods joined end to end. Energy is conserved but the motion is chaotic for large swings. A twin released 0.001 rad away (pink) tracks the gold one for a while, then diverges. Short trail = the last 1.4 seconds.';m.p=[['a1','Start angle θ₁',.3,3,.1,2.2],['tw','Show twin (0/1)',0,1,1,1]]});
upd('vanderpol',m=>{m.desc='A self-sustaining oscillator that pumps energy in at small amplitude and drains it at large amplitude. Paths started outside (gold) spiral in, paths started inside (teal) spiral out, all onto one limit cycle. Arrows show the flow.'});
upd('logistic',m=>{m.p=[['r','Fix r (2.8 = auto sweep)',2.8,4,.001,2.8],['z','Zoom window (1 full, 2 chaos, 3 period-3)',1,3,1,1]];m.desc='xₙ₊₁ = r xₙ(1−xₙ). As r grows the long-term behaviour doubles: period 1, 2, 4, 8… then chaos at r ≈ 3.5699 (Feigenbaum), with an island of period 3 at 3.8284. The readout gives the detected period and the Lyapunov exponent λ (λ<0 stable, λ>0 chaos). The coloured strip names each regime.'});
upd('satellite',m=>{m.desc='Kepler’s laws: elliptical orbits with the planet at one focus; equal areas in equal times (both wedges); and energy conservation: kinetic energy rises exactly as potential energy falls. Pink arrow = velocity.'});
upd('rocket',m=>{m.p=[['mr','Mass ratio m₀/m_f',5,16,.5,10],['pp','Pitch programme (low = flatter)',.3,1.2,.1,.5]];m.eq='Δv = vₑ·ln(m₀/m_f)  (gravity & pitch losses reduce it)';m.desc='Single stage launched vertically, then pitched over to horizontal by burnout. Low mass ratio: falls back. Around 10: reaches an ellipse. Above ~14: near escape. The camera follows the rocket and the read-out classifies the trajectory.'});
upd('square',m=>{m.title='Fourier series: square, saw & triangle';m.p=[['N','Harmonics',1,25,1,5],['wf','Wave (1 square, 2 saw, 3 triangle)',1,3,1,1]];m.desc='Circles rotate at integer multiples of a base frequency; the height of the chain tip is the wave. The faint curve is the ideal wave; near a jump the partial sums overshoot by about 9% however many terms (Gibbs). Spectrum bars show how fast amplitudes decay: 1/k for square, 1/k² for triangle.'});
upd('heat',m=>{m.title='Heat equation (rod)';m.p=[['ic','Initial heat (1 spot, 2 two spots, 3 step)',1,3,1,1],['bc','Ends (1 held cold, 2 insulated)',1,2,1,1],['k','Diffusion speed',.1,.45,.05,.4]];m.desc='Heat flows from hot to cold. Top: temperature curve. Colour strip: the rod itself. Waterfall: every row is a later moment, so you see the spike spread and fade. Held-cold ends drain heat away; insulated ends conserve it, the rod levels to a constant.'});
upd('clifford',m=>{m.desc='Sixty thousand iterates of one simple map, coloured by how often each pixel is visited (dark → violet → magenta → orange → white). Tiny changes to a and b rewrite the whole shape.'});
CAT.uni=['BSc / MSc syllabus',15,340,['mandel','taylor','eigen','lotka','graddesc']];
Object.assign(TIP,{mandel:'Zoom into the “seahorse valley” near −0.75 + 0.1i, then switch to Julia mode and slide c.',taylor:'Pick ln(1+x) and push the degree to 15: the fit stays perfect inside |x|<1 and explodes outside.',eigen:'Set a₁₂ = −a₂₁ and a₁₁ = a₂₂ to get a pure rotation: the eigenvectors vanish.',lotka:'Raise α: how do the cycles change for predators vs prey?',graddesc:'On Rosenbrock, raise the step until it diverges, then add momentum 0.9.'});
})();

export { META as exhibits, CAT as exhibitCategories, TIP as exhibitTips };
export const mountExhibit = VBViz.mount;
