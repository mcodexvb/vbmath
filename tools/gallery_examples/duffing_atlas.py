"""Driven Duffing ensemble and stroboscopic Poincare section.
Run: python duffing_atlas.py (or --gif duffing.gif).
"""
import argparse
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

DT, DURATION, DAMPING, FORCING, FREQUENCY = .025, 120, .2, .3, 1.2

def rhs(s,t):
    x,v=s.T
    return np.c_[v,x-x**3-DAMPING*v+FORCING*np.cos(FREQUENCY*t)]

def simulate():
    x,v=np.meshgrid(np.linspace(-1.9,1.9,8),np.linspace(-1.25,1.25,4))
    s=np.c_[x.ravel(),v.ravel()];runs=[]
    for i in range(round(DURATION/DT)+1):
        runs.append(s.copy());t=i*DT
        a=rhs(s,t);b=rhs(s+DT*a/2,t+DT/2);c=rhs(s+DT*b/2,t+DT/2);d=rhs(s+DT*c,t+DT)
        s=s+DT*(a+2*b+2*c+d)/6
    return np.array(runs)

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--gif');args=parser.parse_args()
    runs=simulate();period=2*np.pi/FREQUENCY
    fig,(ax,bx)=plt.subplots(1,2,figsize=(13,7),gridspec_kw={'width_ratios':[3,1]},facecolor='#0a2424')
    def frame(s):
        for a in (ax,bx):
            a.clear();a.set_facecolor('#0a2424');a.set(xlim=(-2.4,2.4),ylim=(-1.9,1.9));a.tick_params(colors='#89bfa8')
        for i in range(32):
            color='#f3ce85' if i%2==0 else '#87cfdf'
            tail=runs[max(0,s-250):s+1,i]
            ax.plot(tail[:,0],tail[:,1],color=color,lw=.7,alpha=.5)
            ax.plot(*runs[s,i],'o',color=color,ms=2)
        times=np.arange(8*period,s*DT+.00001,period)
        if len(times):
            section=runs[np.rint(times/DT).astype(int)].reshape(-1,2)
            bx.scatter(*section.T,s=2,c='#f3ce85')
        ax.set_title(f'Driven Duffing · t = {s*DT:.1f}',color='white')
        bx.set_title('Poincaré section',color='white')
        return []
    animation=FuncAnimation(fig,frame,frames=range(0,len(runs),2),interval=50,cache_frame_data=False)
    if args.gif:animation.save(args.gif,writer='pillow',fps=20)
    else:plt.show()
