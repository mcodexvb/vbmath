"""Regularized inviscid vortex-particle roll-up; not a viscous CFD solver.
Run: python vortex_laboratory.py --scene sheet (or pair / street).
Add --gif flow.gif to export. Parameters match the gallery defaults.
"""
import argparse
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

DT, DURATION, CORE, STRENGTH = .08, 120, .15, 1

def initial(scene):
    if scene == 'pair':
        return np.array([[-.7, 0, 3], [.7, 0, -3.]])
    if scene == 'street':
        return np.array([[-3.5+.5*i, .42 if i % 2 else -.42, 1 if i % 2 else -1] for i in range(14)])
    x = np.linspace(-3.3, 3.3, 44)
    return np.c_[x, .13*np.sin(2*x), np.full(44, .14)]

def velocity(points, blobs):
    delta = points[:, None, :] - blobs[None, :, :2]
    f = blobs[None, :, 2]/(2*np.pi*((delta**2).sum(axis=2)+CORE**2))
    return np.stack(((-delta[:, :, 1]*f).sum(axis=1), (delta[:, :, 0]*f).sum(axis=1)), axis=1)

def simulate(scene):
    blobs=initial(scene); blobs[:, 2] *= STRENGTH
    x,y=np.meshgrid(np.linspace(-4.2,4.2,60),np.linspace(-1.6,1.6,7))
    points=np.c_[x.ravel(),y.ravel()]; history=[]; cores=[]
    for _ in range(round(DURATION/DT)+1):
        history.append(points.copy()); cores.append(blobs[:, :2].copy())
        mid=blobs.copy(); mid[:, :2] += DT/2*velocity(blobs[:, :2],blobs)
        points += DT*velocity(points+DT/2*velocity(points,blobs),mid)
        blobs[:, :2] += DT*velocity(blobs[:, :2]+DT/2*velocity(blobs[:, :2],blobs),mid)
    return np.array(history),np.array(cores)

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--scene',choices=['sheet','pair','street'],default='sheet');parser.add_argument('--gif');args=parser.parse_args()
    history,cores=simulate(args.scene)
    fig,ax=plt.subplots(figsize=(13,7),facecolor='#0a2424')
    def frame(s):
        ax.clear();ax.set_facecolor('#0a2424')
        center=cores[s].mean(axis=0) if args.scene=='pair' else np.zeros(2)
        a=history[max(0,s-32):s+1:2]-center
        for i in range(420):
            ax.plot(a[:,i,0],a[:,i,1],color='#f3ce85' if i<210 else '#87cfdf',lw=.6,alpha=.6)
        ax.scatter(*(history[s]-center).T,s=2,c=['#f3ce85']*210+['#87cfdf']*210)
        ax.set(xlim=(-5.16,5.16),ylim=(-2.9,2.9),aspect='equal');ax.axis('off')
        ax.set_title(f'Vortex laboratory · t = {s*DT:.1f}',color='white')
        return []
    animation=FuncAnimation(fig,frame,frames=len(history),interval=DT*1000,cache_frame_data=False)
    if args.gif:animation.save(args.gif,writer='pillow',fps=round(1/DT))
    else:plt.show()
