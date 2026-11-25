"""NumPy/Matplotlib versions of the gallery's numerical simulations."""
import inspect

import numpy as np


def integrate(rhs, seed, dt, steps):
    """Sample a fixed-step fourth-order Runge–Kutta solution."""
    p = np.asarray(seed, dtype=float)
    result = np.empty((steps+1,len(p)))
    for i in range(steps+1):
        result[i] = p
        if i == steps:
            break
        a = rhs(p)
        b = rhs(p + dt*a/2)
        c = rhs(p + dt*b/2)
        d = rhs(p + dt*c)
        p += dt*(a+2*b+2*c+d)/6
    return result


def animate(title, seconds, setup):
    import argparse
    import matplotlib.pyplot as plt
    from matplotlib.animation import FuncAnimation

    parser = argparse.ArgumentParser(description=title)
    parser.add_argument("--gif", metavar="PATH", help="save the animation as a GIF")
    args = parser.parse_args()
    fig, ax = plt.subplots(figsize=(9.6,5), layout="constrained")
    fig.patch.set_facecolor("#101f22")
    ax.set_facecolor("#102228")
    ax.set_title(title, color="#f0faf3", fontweight="bold")
    ax.tick_params(colors="#b0c9bf")
    for spine in ax.spines.values():
        spine.set_color("#48625e")
    update = setup(ax)
    status = ax.text(.02,.02,"", transform=ax.transAxes, color="#ffdc9d", fontsize=9,
                     bbox={"facecolor":"#102228","edgecolor":"none","alpha":.88})
    fps = 25

    def frame(i):
        status.set_text(update(i/fps))

    animation = FuncAnimation(fig, frame, frames=int(seconds*fps)+1,
                              interval=1000/fps, repeat=False)
    if args.gif:
        animation.save(args.gif, writer="pillow", fps=fps)
    else:
        plt.show()


def cylinder(ax):
    """Advect tracer particles through the analytical potential-flow field."""
    from matplotlib.colors import LinearSegmentedColormap
    from matplotlib.patches import Circle

    radius = .72

    def field(x,y):
        r2 = np.maximum(x*x+y*y, radius*radius)
        u = 1-radius**2*(x*x-y*y)/(r2*r2)
        v = -2*radius**2*x*y/(r2*r2)
        return u,v

    def velocity(point):
        if np.hypot(*point) <= radius:
            return np.zeros(2)
        return np.asarray(field(*point))

    x,y = np.meshgrid(np.linspace(-4.6,4.6,240),np.linspace(-2.2,2.2,120))
    speed = np.ma.masked_where(x*x+y*y <= radius**2,np.hypot(*field(x,y)))
    cmap = LinearSegmentedColormap.from_list("velocity",["#79604c","#193037","#49aebf"])
    ax.pcolormesh(x,y,speed,shading="auto",cmap=cmap,vmin=0,vmax=2,alpha=.62)
    paths = []
    for i in range(55):
        j = i-27
        y0 = np.sign(j or 1)*(.025+2.04*((abs(j)+.25)/27.25)**1.45)
        path = integrate(velocity,[-4.7,y0],.025,649)
        outside = np.flatnonzero(path[:,0]>=4.7)
        if len(outside):
            path = path[:outside[0]+1]
        ax.plot(*path.T,color="#a2cecc",lw=.55,alpha=.22)
        paths.append(path)
    ax.add_patch(Circle((0,0),radius,facecolor="#101d22",edgecolor="#c4d9d1"))
    ax.set(xlim=(-4.6,4.6),ylim=(-2.2,2.2),aspect="equal")
    markers = ax.scatter([],[],s=8,color="#ffdc9d")
    trails = [ax.plot([],[],color="#8edeee",lw=1.35,alpha=.7)[0] for _ in range(len(paths)*3)]

    def update(time):
        locations = []
        for i,path in enumerate(paths):
            for k in range(3):
                offset = (i*.61803398875 % 1 + k/3)*(len(path)-1)
                index = int((time*40+offset)%(len(path)-1))
                locations.append(path[index])
                trails[3*i+k].set_data(*path[max(0,index-16):index+1].T)
        markers.set_offsets(locations)
        return f"t = {time:.1f} s   |   U∞ = 1, radius = {radius}"

    return update


def double(ax):
    """Compare equal, undamped, initially near-identical double pendulums."""
    def rhs(p):
        a,b,u,v = p
        g = 9.81
        c,s = np.cos(a-b),np.sin(a-b)
        den = 2-c*c
        return np.array([u,v,(-2*g*np.sin(a)+g*np.sin(b)*c-s*(v*v+u*u*c))/den,
                         (2*s*(u*u+g*np.cos(a))+v*v*s*c)/den])

    states = np.array([integrate(rhs,[2.18,1.63+d,0,0],.01,12001) for d in (0,.001)])
    angles = states[:,:,:2]
    first = np.stack((np.sin(angles[:,:,0]),-np.cos(angles[:,:,0])),axis=-1)
    ends = first + np.stack((np.sin(angles[:,:,1]),-np.cos(angles[:,:,1])),axis=-1)
    colors = ("#ffdc9d","#8edeee")
    rods = [ax.plot([],[],color=c,lw=2,marker="o")[0] for c in colors]
    tails = [ax.plot([],[],color=c,lw=1,alpha=.6)[0] for c in colors]
    ax.set(xlim=(-2.1,2.1),ylim=(-2.1,2.1),aspect="equal")

    def update(time):
        i=int(time/.01)
        for j in range(2):
            rods[j].set_data(*np.vstack(([0,0],first[j,i],ends[j,i])).T)
            tails[j].set_data(*ends[j,max(0,i-440):i+1].T)
        delta=angles[0,i,1]-angles[1,i,1]
        separation=abs(np.arctan2(np.sin(delta),np.cos(delta)))
        return f"t = {time:.1f} s   |   |Δθ₂| = {separation:.3f} rad"

    return update


def oscillator(ax):
    """Follow Van der Pol trajectories on both sides of the limit cycle."""
    def rhs(p):
        x,y = p
        return np.array([y,(1-x*x)*y-x])

    runs = [integrate(rhs,seed,.012,10001) for seed in ([.25,0],[3.2,0],[-3,2],[0,-3.2])]
    colors = ("#ffdc9d","#8edeee","#a2e4c8","#a2e4c8")
    tails, heads = [], []
    for run,c in zip(runs,colors):
        ax.plot(*run.T,color=c,lw=.6,alpha=.18)
        tails.append(ax.plot([],[],color=c,lw=1.4)[0])
        heads.append(ax.plot([],[],"o",color=c,ms=4)[0])
    ax.set(xlim=(-3.5,3.5),ylim=(-3.5,3.5),aspect="equal",xlabel="x",ylabel="dx/dt")

    def update(time):
        i=int(time/.012)
        for run,tail,head in zip(runs,tails,heads):
            tail.set_data(*run[max(0,i-310):i+1].T)
            head.set_data(*run[i:i+1].T)
        return f"t = {time:.1f}   |   μ = 1"

    return update


def lorenz_pair(ax):
    """Measure separation between two RK4 trajectories of the Lorenz system."""
    def rhs(p):
        x,y,z=p
        return np.array([10*(y-x),x*(28-z)-y,x*y-8*z/3])

    states=[integrate(rhs,[-8+d,8,25],.007,17144) for d in (0,1e-9)]
    runs=[np.column_stack((s[:,0]+.22*s[:,1],s[:,2])) for s in states]
    ax.plot(*runs[0].T,color="#aacbc9",lw=.65,alpha=.2)
    colors=("#ffdc9d","#8edeee")
    tails=[ax.plot([],[],color=c,lw=1.35)[0] for c in colors]
    heads=[ax.plot([],[],"o",color=c,ms=4)[0] for c in colors]
    ax.set(xlim=(-27,27),ylim=(2,52),aspect="equal",xlabel="x + 0.22y",ylabel="z")

    def update(time):
        i=int(time/.007)
        for run,tail,head in zip(runs,tails,heads):
            tail.set_data(*run[max(0,i-540):i+1].T)
            head.set_data(*run[i:i+1].T)
        return f"t = {time:.1f}   |   separation = {np.linalg.norm(states[0][i]-states[1][i]):.2e}"

    return update


def bifurcation(ax):
    """Build the bifurcation diagram and sweep a probe across it."""
    rates=np.linspace(2.8,4,850)
    xs=np.full_like(rates,.413)
    for _ in range(500):
        xs=rates*xs*(1-xs)
    for _ in range(95):
        xs=rates*xs*(1-xs)
        ax.scatter(rates,xs,s=.5,color="#97dcea",alpha=.37)
    cursor=ax.axvline(2.8,color="#ffdc9d",alpha=.6)
    points=ax.scatter([],[],s=12,color="#ffdc9d")
    ax.set(xlim=(2.8,4),ylim=(0,1),xlabel="Growth rate r",ylabel="Long-run x")

    def update(time):
        rate=2.8+1.2*time/120
        x=.413
        for _ in range(1000):
            x=rate*x*(1-x)
        samples=[]
        for _ in range(64):
            x=rate*x*(1-x)
            samples.append(round(x*500)/500)
        bins=np.unique(samples)
        cursor.set_xdata([rate,rate])
        points.set_offsets(np.column_stack((np.full(len(bins),rate),bins)))
        return f"r = {rate:.3f}   |   {len(bins)} occupied bins in displayed sample"

    return update


def standalone_simulations():
    models=[
        ("cylinder-flow","Flow around a cylinder",120,cylinder),
        ("double-pendulum","Double pendulum",120,double),
        ("van-der-pol","Van der Pol oscillator",120,oscillator),
        ("lorenz-attractor","Lorenz attractor",120,lorenz_pair),
        ("logistic-map","Logistic bifurcation",120,bifurcation),
    ]
    prefix="# Install: python -m pip install numpy matplotlib\nimport numpy as np\n\n\n"
    return {
        key: prefix + "\n\n\n".join(inspect.getsource(fn).rstrip() for fn in (integrate, model, animate))
        + f"\n\n\nif __name__ == '__main__':\n    animate({title!r}, {seconds}, {model.__name__})\n"
        for key,title,seconds,model in models
    }
