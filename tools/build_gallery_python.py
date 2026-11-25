"""Generate the standalone Python examples served by the VBMath Math Gallery."""
import inspect
import json
from pathlib import Path

import numpy as np


def lorenz():
    """Integrate the standard Lorenz system with fourth-order Runge–Kutta."""
    def rhs(state):
        x, y, z = state
        return np.array([10*(y-x), x*(28-z)-y, x*y-8*z/3])

    state = np.ones(3)
    step = 0.008
    orbit = []
    for i in range(3250):
        a = rhs(state)
        b = rhs(state + step*a/2)
        c = rhs(state + step*b/2)
        d = rhs(state + step*c)
        state += step*(a + 2*b + 2*c + d)/6
        if i >= 750:
            x, y, z = state
            orbit.append((x + 0.2*y, z))
    return [(np.array(orbit), "line")]


def fibonacci():
    """Join quarter circles inside adjoining Fibonacci squares."""
    squares = [(0,0,1), (1,0,1), (0,1,2), (-3,0,3), (-3,-5,5), (2,-5,8), (-3,3,13)]
    centers = [(1,1), (1,1), (0,1), (0,0), (2,0), (2,3), (-3,3)]
    layers = []
    for i, ((x, y, side), center) in enumerate(zip(squares, centers)):
        square = np.array([(x,y),(x+side,y),(x+side,y+side),(x,y+side),(x,y)])
        angle = np.linspace(np.pi+i*np.pi/2, np.pi+(i+1)*np.pi/2, 60)
        arc = np.asarray(center) + side*np.column_stack((np.cos(angle), np.sin(angle)))
        layers.extend([(square, "guide"), (arc, "gold")])
    return layers


def fourier():
    """Plot a two-tone signal and its one-sided discrete Fourier spectrum."""
    t = np.arange(128)/128
    y = 0.7*np.sin(2*np.pi*3*t) + 0.35*np.sin(2*np.pi*7*t)
    amplitude = 2*np.abs(np.fft.rfft(y))/len(t)
    layers = [(np.column_stack((t, y)), "line")]
    for k in np.flatnonzero(amplitude[:11] > 1e-5):
        x = 1.3 + k/10
        layers.append((np.array([(x,0),(x,amplitude[k])]), "gold"))
    return layers


def heat():
    """Evolve a Gaussian under u_t = u_xx with mass held constant."""
    x = np.linspace(-3, 3, 141)
    result = []
    for time, kind in zip([0,.16,.45,.95], ["gold","guide","guide","line"]):
        variance = .16 + 2*time
        y = .4/np.sqrt(variance)*np.exp(-x*x/(2*variance))
        result.append((np.column_stack((x,y)), kind))
    return result


def lissajous():
    """Combine perpendicular oscillations with a 3:2 frequency ratio."""
    t = np.linspace(0, 2*np.pi, 651)
    return [(np.column_stack((np.sin(3*t+np.pi/4), np.sin(2*t))), "line")]


def epicycloid():
    """Trace a point on a circle rolling outside a circle three times its radius."""
    t = np.linspace(0, 2*np.pi, 501)
    guide = np.column_stack((3*np.cos(t),3*np.sin(t)))
    curve = np.column_stack((4*np.cos(t)-np.cos(4*t),4*np.sin(t)-np.sin(4*t)))
    return [(guide,"guide"),(curve,"line")]


def logistic():
    """Sweep r and show the iterates after discarding transient values."""
    result = []
    for rates in np.array_split(np.linspace(2.8,4,308), 7):
        x = np.full_like(rates,.413)
        for _ in range(165):
            x = rates*x*(1-x)
        samples = []
        for _ in range(38):
            x = rates*x*(1-x)
            samples.extend(zip(rates,x))
        result.append((np.array(samples),"dots"))
    return result


def newton():
    """Use tangent lines to approximate the positive root of x² − 2."""
    x = np.linspace(0,3.1,101)
    result = [(np.column_stack((x,x*x-2)),"line")]
    x = 2.8
    for _ in range(4):
        y = x*x-2
        next_x = (x+2/x)/2
        result.extend([(np.array([(x,0),(x,y)]),"guide"),(np.array([(x,y),(next_x,0)]),"gold")])
        x = next_x
    return result


def sierpinski():
    """Remove each central triangle and repeat on the three corner triangles."""
    outer = np.array([[0,0],[1,0],[.5,np.sqrt(3)/2]])
    result = [(np.vstack((outer,outer[0])),"gold")]
    triangles = [outer]
    for _ in range(5):
        next_triangles, holes = [], []
        for a,b,c in triangles:
            ab,bc,ca = (a+b)/2,(b+c)/2,(c+a)/2
            holes.extend([ab,bc,ca,ab,[np.nan,np.nan]])
            next_triangles.extend([[a,ab,ca],[b,bc,ab],[c,ca,bc]])
        result.append((np.array(holes),"guide"))
        triangles = next_triangles
    return result


def roots():
    """Place the seven solutions of z⁷ = 1 around the unit circle."""
    theta = np.linspace(0,2*np.pi,181)
    angles = np.arange(7)*2*np.pi/7
    circle = np.column_stack((np.cos(theta),np.sin(theta)))
    vertices = np.column_stack((np.cos(angles),np.sin(angles)))
    return [(circle,"guide"),(np.vstack((vertices,vertices[0])),"line"),(vertices,"dots")]


def bezier():
    """Use de Casteljau interpolation to trace a cubic Bézier curve."""
    controls = np.array([[53,32],[139,146],[315,139],[426,21]],dtype=float)

    def levels(t):
        first = (1-t)*controls[:-1]+t*controls[1:]
        second = (1-t)*first[:-1]+t*first[1:]
        return first, second, (1-t)*second[0]+t*second[1]

    first, second, position = levels(.58)
    curve = np.array([levels(t)[2] for t in np.linspace(0,1,181)])
    return [(controls,"guide"),(first,"guide"),(second,"gold"),(curve,"line"),(position[None,:],"dots")]


def pendulum():
    """Draw level curves of the pendulum energy E = ω²/2 − cos θ."""
    result = []
    for energy in [-.75,-.25,.25,.72,1]:
        limit = np.arccos(-energy)
        theta = np.linspace(-limit,limit,101)
        velocity = np.sqrt(np.maximum(0,2*(energy+np.cos(theta))))
        curve = np.column_stack((np.r_[theta,theta[::-1]],np.r_[velocity,-velocity[::-1]]))
        result.append((curve,"gold" if energy==1 else "line"))
    return result


def cycloid():
    """Follow a rim point on a rolling unit circle for two revolutions."""
    t = np.linspace(0,4*np.pi,421)
    curve = np.column_stack((t-np.sin(t),1-np.cos(t)))
    angle = np.linspace(0,2*np.pi,181)
    phase = 2*np.pi*1.58
    wheel = np.column_stack((phase+np.cos(angle),1+np.sin(angle)))
    rim = np.array([phase-np.sin(phase),1-np.cos(phase)])
    return [(curve,"line"),(wheel,"guide"),(np.array([[phase,1],rim]),"gold"),(rim[None,:],"dots")]


def gibbs():
    """Compare square-wave Fourier partial sums through 13 odd harmonics."""
    x = np.linspace(-np.pi,np.pi,481)
    result = [(np.array([[-np.pi,-1],[0,-1],[0,1],[np.pi,1]]),"guide")]
    for count,kind in zip([1,3,13],["guide","line","gold"]):
        harmonics = np.arange(1,2*count,2)
        y = (4/np.pi)*np.sum(np.sin(np.outer(x,harmonics))/harmonics,axis=1)
        result.append((np.column_stack((x,y)),kind))
    return result


def animate(title, layers, equal=False, demo=""):
    """Render the geometry progressively. Add --gif to export a looping animation."""
    import argparse
    import matplotlib.pyplot as plt
    from matplotlib.animation import FuncAnimation

    parser = argparse.ArgumentParser(description=title)
    parser.add_argument("--gif", metavar="PATH", help="save the animation as a GIF")
    args = parser.parse_args()
    fig, ax = plt.subplots(figsize=(9,4.8), layout="constrained")
    fig.patch.set_facecolor("#101f22")
    ax.set_facecolor("#14292b")
    ax.set_title(title, color="#f0faf3", fontweight="bold")
    ax.grid(alpha=.16)
    ax.tick_params(colors="#b0c9bf")
    for spine in ax.spines.values():
        spine.set_color("#48625e")
    if equal:
        ax.set_aspect("equal", adjustable="box")
    labels = {
        "lorenz": ("x + 0.2y", "z"),
        "heat": ("Position", "Temperature"),
        "logistic": ("Growth rate r", "Long-term x"),
        "newton": ("x", "x² − 2"),
        "pendulum": ("Angle θ", "Angular velocity ω"),
        "gibbs": ("x", "Amplitude"),
    }
    if demo in labels:
        ax.set_xlabel(labels[demo][0], color="#b0c9bf")
        ax.set_ylabel(labels[demo][1], color="#b0c9bf")
    if demo == "fourier":
        ax.set_xticks([0,.5,1,1.6,2], ["0",".5","1","3","7"])
        ax.set_xlabel("Sample-window time (left)   |   Frequency bin (right)", color="#b0c9bf")
    colors = {"guide":"#91aaa4","line":"#8be6bc","gold":"#f3c57b","dots":"#8be6bc"}
    artists = []
    for xy,kind in layers:
        finite = xy[np.isfinite(xy).all(axis=1)]
        ax.update_datalim(finite)
        style = {"marker":".","linestyle":"None","markersize":2.7} if kind=="dots" else {
            "linestyle":"--" if kind=="guide" else "-","linewidth":1.2 if kind=="guide" else 1.9}
        artist, = ax.plot([], [], color=colors[kind], **style)
        artists.append(artist)
    ax.autoscale_view()
    fps = 30
    drawing_frames = 110
    total_frames = drawing_frames + 32

    def update(frame):
        for i,(artist,(xy,_)) in enumerate(zip(artists,layers)):
            delay = drawing_frames*.56*i/max(1,len(layers)-1)
            fraction = np.clip((frame-delay)/(drawing_frames*.43),0,1)
            end = int(fraction*len(xy))
            artist.set_data(xy[:end,0],xy[:end,1])
        return artists

    animation = FuncAnimation(fig, update, frames=total_frames, interval=1000/fps, blit=True, repeat=False)
    if args.gif:
        animation.save(args.gif, writer="pillow", fps=fps)
    else:
        plt.show()


EXHIBITS = [
    ("lorenz-attractor","Lorenz attractor",lorenz,True),
    ("fibonacci-spiral","Fibonacci spiral",fibonacci,True),
    ("fourier-transform","Fourier transform",fourier,False),
    ("heat-equation","Heat equation",heat,False),
    ("lissajous-curve","Lissajous curve",lissajous,True),
    ("epicycloid","Epicycloid",epicycloid,True),
    ("logistic-map","Logistic map",logistic,False),
    ("newtons-method","Newton’s method",newton,False),
    ("sierpinski-triangle","Sierpiński triangle",sierpinski,True),
    ("seventh-roots-of-unity","Seventh roots of unity",roots,True),
    ("bezier-construction","Bézier construction",bezier,True),
    ("pendulum-phase-portrait","Pendulum phase portrait",pendulum,False),
    ("cycloid","Cycloid",cycloid,True),
    ("gibbs-phenomenon","Gibbs phenomenon",gibbs,False),
]


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    prefix = "# Install dependencies: python -m pip install numpy matplotlib\nimport numpy as np\n\n\n"
    runner = inspect.getsource(animate).rstrip()
    output = root / "site" / "data" / "gallery-python.json"
    output.write_text(json.dumps({
        key: prefix + inspect.getsource(fn).rstrip() + "\n\n\n" + runner
        + f"\n\n\nif __name__ == '__main__':\n    animate({title!r}, {fn.__name__}(), equal={equal}, demo={fn.__name__!r})\n"
        for key,title,fn,equal in EXHIBITS
    },ensure_ascii=False,separators=(",",":")) + "\n",encoding="utf-8")
