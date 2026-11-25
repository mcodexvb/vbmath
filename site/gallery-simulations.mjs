const W = 960, H = 480, TAU = 2 * Math.PI;
const GOLD = "#ffdc9d", BLUE = "#8edeee", MINT = "#a2e4c8", FAINT = "#aacbc9";
const range = (n, fn) => Array.from({length:n}, (_, i) => fn(i));
const mix = (a,b,t) => a + (b-a)*t;
function rk(state, dt, rhs) {
  const add = (k, h) => state.map((v,i) => v+h*k[i]);
  const a=rhs(state), b=rhs(add(a,dt/2)), c=rhs(add(b,dt/2)), d=rhs(add(c,dt));
  return state.map((v,i)=>v+dt*(a[i]+2*b[i]+2*c[i]+d[i])/6);
}
function sample(series, at) {
  const i = Math.max(0,Math.min(series.length-2,Math.floor(at)));
  const t = Math.max(0,Math.min(1,at-i));
  return series[i].map((v,k)=>mix(v,series[i+1][k],t));
}
function projection([xmin,xmax,ymin,ymax], [x,y,w,h]=[54,36,852,394]) {
  const scale=Math.min(w/(xmax-xmin),h/(ymax-ymin));
  return ([u,v])=>[x+w/2+(u-(xmin+xmax)/2)*scale,y+h/2-(v-(ymin+ymax)/2)*scale];
}
function stroke(ctx, points, color, width=1, alpha=1) {
  if (points.length<2) return;
  ctx.globalAlpha=alpha; ctx.strokeStyle=color; ctx.lineWidth=width;
  ctx.beginPath(); ctx.moveTo(...points[0]); points.slice(1).forEach(p=>ctx.lineTo(...p)); ctx.stroke();
  ctx.globalAlpha=1;
}
function disk(ctx,[x,y],r,color,alpha=1) {
  ctx.globalAlpha=alpha; ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fill(); ctx.globalAlpha=1;
}
function glow(ctx,pt,color) {
  disk(ctx,pt,10,color,.07); disk(ctx,pt,6.5,color,.2); disk(ctx,pt,3.6,color);
}
function coordinates(ctx,p,x,y,xName,yName) {
  stroke(ctx,[p([x[0],0]),p([x[1],0])],FAINT,1,.22);
  stroke(ctx,[p([0,y[0]]),p([0,y[1]])],FAINT,1,.22);
  const [ax,ay]=p([x[1],0]), [bx,by]=p([0,y[1]]);
  ctx.fillStyle="#b4cfca"; ctx.font="17px system-ui"; ctx.fillText(xName,ax+10,ay+6); ctx.fillText(yName,bx+8,by+5);
}
function trail(ctx,series,at,p,color,len=165) {
  let end=Math.floor(at);
  const size=Math.min(len,end);
  for(let band=0;band<8;band++){
    const a=end-size+Math.floor(size*band/8), b=end-size+Math.floor(size*(band+1)/8);
    const segment=series.slice(a,b+1).map(p);
    if(band===7)segment.push(p(sample(series,at)));
    stroke(ctx,segment,color,1.1+band*.16,.12+band*.105);
  }
  glow(ctx,p(sample(series,at)),color);
}

export function cylinderVelocity([x,y]) {
  const r2=x*x+y*y, a2=.72**2;
  if(r2 <= a2) return [0,0];
  return [1-a2*(x*x-y*y)/(r2*r2),-2*a2*x*y/(r2*r2)];
}
function fluid(ctx,back) {
  const p=projection([-4.6,4.6,-2.2,2.2],[45,27,870,426]);
  const q=(x,y)=>p([x,y]);
  const streams=range(55,i=>{
    const j=i-27, y=Math.sign(j||1)*(.025+2.04*Math.pow((Math.abs(j)+.25)/27.25,1.45));
    let state=[-4.7,y];
    const coordinates=[state];
    while(state[0]<4.7 && coordinates.length<650){
      state=rk(state,.025,cylinderVelocity);coordinates.push(state);
    }
    return {points:coordinates.map(p), start:(i*.61803398875)%1, y};
  });
  for(let iy=0;iy<38;iy++)for(let ix=0;ix<85;ix++){
    const x=-4.6+9.2*ix/84,y=-2.2+4.4*iy/37;
    if(Math.hypot(x,y)<.72)continue;
    const speed=Math.hypot(...cylinderVelocity([x,y]));
    const [a,b]=q(x,y);
    back.fillStyle=speed>1?"rgba(52,166,181,"+Math.min(.27,.02+(speed-1)*.31)+")":"rgba(214,162,92,"+Math.max(0,(1-speed)*.18)+")";
    back.fillRect(a-5.3,b-5.6,10.7,11.3);
  }
  streams.forEach(s=>stroke(back,s.points,"#b5e2db",.8,.24));
  const center=q(0,0), radius=q(.72,0)[0]-center[0];
  back.fillStyle="#101d22"; back.strokeStyle="#b7d0cc"; back.lineWidth=2;
  back.beginPath(); back.arc(...center,radius,0,TAU); back.fill(); back.stroke();
  const gradient=back.createLinearGradient(650,435,820,435);
  gradient.addColorStop(0,"#a67b50"); gradient.addColorStop(.5,"#21383e"); gradient.addColorStop(1,"#53baca");
  back.fillStyle=gradient; back.fillRect(650,432,170,5);
  back.fillStyle="#c4d9d1"; back.font="15px system-ui";
  back.fillText("0",650,458); back.fillText("|u| / U∞",698,458); back.fillText("2",812,458);
  return time=>{
    for(const s of streams){
      const length=s.points.length-1;
      const color=Math.abs(s.y)<.35?GOLD:Math.abs(s.y)<1.22?BLUE:MINT;
      for(let k=0;k<3;k++){
        const at=(time*40+(s.start+k/3)*length)%length;
        const end=sample(s.points,at), i=Math.floor(at);
        for(let strip=0;strip<3;strip++){
          const a=Math.max(0,i-19+strip*6), b=Math.max(0,i-13+strip*6);
          const tail=s.points.slice(a,b+1);
          if(strip===2)tail.push(end);
          stroke(ctx,tail,color,1.2+strip*.43,.23+strip*.27);
        }
        disk(ctx,end,2,color,.93);
      }
    }
    return "t = "+time.toFixed(1)+" s  ·  U∞ = 1  ·  Cylinder radius = 0.72";
  };
}

export function oscillatorVelocity([x,y]) {return [y,(1-x*x)*y-x];}
function oscillator(ctx,back) {
  const p=projection([-3.45,3.45,-3.5,3.5]);
  coordinates(back,p,[-3.1,3.1],[-3.15,3.15],"x","ẋ");
  const starts=[[.25,0],[3.2,0],[-3,2],[0,-3.2]];
  const series=starts.map(seed=>{
    let state=seed;
    return range(10002,()=>{const before=state;state=rk(state,.012,oscillatorVelocity);return before;});
  });
  series.forEach(path=>stroke(back,path.map(p),BLUE,1,.17));
  stroke(back,series[0].slice(-560).map(p),GOLD,1.2,.25);
  return time=>{
    const at=time/.012;
    series.forEach((path,i)=>trail(ctx,path,at,p,i===0?GOLD:i===1?BLUE:MINT,310));
    return "t = "+time.toFixed(1)+"  ·  μ = 1  ·  Inside and outside trajectories approach the same cycle";
  };
}

export function pendulumVelocity([a,b,u,v]) {
  const g=9.81,d=a-b,c=Math.cos(d),s=Math.sin(d),den=2-c*c;
  return [u,v,(-2*g*Math.sin(a)+g*Math.sin(b)*c-s*(v*v+u*u*c))/den,
    (2*s*(u*u+g*Math.cos(a))+v*v*s*c)/den];
}
function pendulum(ctx,back) {
  const p=projection([-2.08,2.08,-2.08,2.08],[56,22,848,436]);
  const bob=([a,b])=>[Math.sin(a)+Math.sin(b),-Math.cos(a)-Math.cos(b)];
  const series=[0,.001].map(delta=>{
    let state=[2.18,1.63+delta,0,0];
    return range(12002,()=>{const before=state;state=rk(state,.01,pendulumVelocity);return before;});
  });
  const pivot=p([0,0]);
  for (const r of [1,2]) {
    const mapped=p([r,0])[0]-pivot[0];
    back.strokeStyle="#91b5b34a";back.lineWidth=1;
    back.beginPath();back.arc(...pivot,mapped,0,TAU);back.stroke();
  }
  disk(back,pivot,4,"#d3e5da");
  const trails=series.map(run=>run.map(bob));
  return time=>{
    const at=time/.01;
    const states=series.map(run=>sample(run,at));
    states.forEach((state,i)=>{
      const color=i===0?GOLD:BLUE,a=state[0],p1=p([Math.sin(a),-Math.cos(a)]),p2=p(bob(state));
      trail(ctx,trails[i],at,p,color,440);
      stroke(ctx,[pivot,p1,p2],color,2.3,.9);
      disk(ctx,p1,4.5,color);
    });
    const delta=states[0][1]-states[1][1];
    return "t = "+time.toFixed(1)+" s  ·  Initial Δθ₂ = 0.001 rad  ·  Current |Δθ₂| = "+Math.abs(Math.atan2(Math.sin(delta),Math.cos(delta))).toFixed(3)+" rad";
  };
}

export function lorenzVelocity([x,y,z]) {return [10*(y-x), x*(28-z)-y,x*y-8*z/3];}
function lorenz(ctx,back) {
  const p=projection([-27,27,2,52],[58,16,844,448]);
  const project=([x,y,z])=>[x+.22*y,z];
  const series=[0,1e-9].map(delta=>{
    let state=[-8+delta,8,25];
    return range(17145,()=>{const previous=state;state=rk(state,.007,lorenzVelocity);return previous;});
  });
  const lines=series.map(run=>run.map(project));
  stroke(back,lines[0].slice(0,3900).map(p),FAINT,.85,.14);
  return time=>{
    const at=time/.007;
    const one=sample(series[0],at),two=sample(series[1],at);
    lines.forEach((trace,i)=>trail(ctx,trace,at,p,i===0?GOLD:BLUE,540));
    return "t = "+time.toFixed(1)+"  ·  Initial separation = 10⁻⁹  ·  Current separation = "+Math.hypot(...one.map((v,i)=>v-two[i])).toExponential(2);
  };
}

function logistic(ctx,back) {
  const P=([r,x])=>[54+(r-2.8)/1.2*852,429-x*386];
  back.fillStyle="#97dcea";
  for(let i=0;i<850;i++){
    const r=2.8+1.2*i/849;
    let x=.413;
    for(let j=0;j<500;j++) x=r*x*(1-x);
    const pixels=new Set();
    for(let j=0;j<95;j++){x=r*x*(1-x);pixels.add(Math.round(P([r,x])[1]));}
    for(const y of pixels){
      back.globalAlpha=pixels.size<=5?.62:.33;
      back.fillRect(P([r,0])[0],y,1.5,1.5);
    }
  }
  back.globalAlpha=1;
  stroke(back,[P([2.8,0]),P([4,0])],FAINT,1,.38);
  for(const r of [2.8,3,3.2,3.4,3.6,3.8,4]){
    const pos=P([r,0]);back.fillStyle="#aacbc9";back.font="15px system-ui";back.fillText(r.toFixed(1),pos[0]-11,455);
  }
  return time=>{
    const r=2.8+1.2*time/120;
    let x=.413, spots=[];
    for(let i=0;i<1000;i++)x=r*x*(1-x);
    for(let i=0;i<64;i++){x=r*x*(1-x);spots.push(Math.round(x*500)/500);}
    const bins=[...new Set(spots)];
    stroke(ctx,[P([r,0]),P([r,1])],GOLD,1.5,.5);
    bins.forEach(x=>disk(ctx,P([r,x]),bins.length>12?1.8:4,GOLD));
    return "r = "+r.toFixed(3)+"  ·  "+bins.length+" occupied bins among the displayed iterates";
  };
}

export const simulations = [
  {id:"cylinder-flow",title:"Flow around a cylinder",caption:"Follow tracer particles through an incompressible, inviscid flow. The colour field shows the local speed.",equation:"ϕ = U∞(r + a²/r) cos θ   ·   u = ∇ϕ",kind:"Potential flow",seconds:120,build:fluid},
  {id:"double-pendulum",title:"Double pendulum",caption:"Two identical pendulums are released 0.001 radians apart. Watch how their paths separate.",equation:"Two coupled pendulums   ·   m₁ = m₂, ℓ₁ = ℓ₂, g = 9.81",kind:"Sensitivity to initial conditions",seconds:120,build:pendulum},
  {id:"van-der-pol",title:"Van der Pol oscillator",caption:"Trajectories started inside and outside the limit cycle converge to the same periodic motion.",equation:"ẋ = y   ·   ẏ = μ(1 − x²)y − x",kind:"Dissipative dynamics",seconds:120,build:oscillator},
  {id:"lorenz-attractor",title:"Lorenz attractor",caption:"Two trajectories start a billionth of a unit apart. Their separation is measured in the original three-dimensional coordinates.",equation:"ẋ = σ(y − x)   ·   ẏ = x(ρ − z) − y   ·   ż = xy − βz",kind:"Deterministic chaos",seconds:120,build:lorenz},
  {id:"logistic-map",title:"Logistic bifurcation",caption:"Sweep the growth rate and watch the long-run values split into branches and spread through chaotic bands.",equation:"xₙ₊₁ = rxₙ(1 − xₙ)   ·   2.8 ≤ r ≤ 4",kind:"Period doubling",seconds:120,build:logistic},
];

export function mountSimulation(plot, exhibit) {
  const surface=document.createElement("canvas"), background=document.createElement("canvas");
  for(const canvas of [surface,background]){canvas.width=W;canvas.height=H;}
  surface.setAttribute("aria-hidden","true");
  const ctx=surface.getContext("2d"), back=background.getContext("2d");
  if(!ctx || !back) throw Error("Canvas unavailable");
  ctx.lineJoin="round";ctx.lineCap="round";
  plot.replaceChildren(surface);
  const draw=exhibit.build(ctx,back);
  return time=>{
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(background,0,0);
    return draw(time);
  };
}
