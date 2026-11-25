"""Complex Fourier epicycles reconstruct an original continuous-line portrait.
Run: python fourier_portrait.py (or --gif portrait.gif).
"""
import argparse
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

POINTS = [[-0.82, 0.95], [-0.94, 0.65], [-0.86, 0.28], [-0.7, -0.02], [-0.65, -0.38], [-0.57, -0.68], [-0.36, -0.9], [-0.06, -1.02], [0.25, -0.93], [0.46, -0.72], [0.53, -0.46], [0.55, -0.23], [0.68, -0.02], [0.57, 0.06], [0.56, 0.24], [0.49, 0.32], [0.58, 0.39], [0.49, 0.47], [0.48, 0.65], [0.3, 0.8], [0.07, 0.82], [-0.05, 0.74], [-0.1, 1.04], [0.13, 1.18], [0.58, 1.34], [0.83, 1.65], [-1.03, 1.65], [-0.85, 1.34], [-0.43, 1.18], [-0.34, 0.88], [-0.47, 0.65], [-0.53, 0.36], [-0.64, 0.18], [-0.64, -0.03], [-0.55, -0.14], [-0.46, -0.07], [-0.42, 0.12], [-0.48, 0.24], [-0.53, 0.12], [-0.5, -0.03], [-0.43, -0.23], [-0.29, -0.3], [-0.11, -0.24], [0.08, -0.38], [0.26, -0.42], [0.44, -0.33], [0.29, -0.31], [0.12, -0.3], [0.25, -0.2], [0.39, -0.19], [0.27, -0.15], [0.16, -0.23], [0.1, -0.31], [0.04, -0.02], [0.08, 0.17], [0.28, 0.23], [0.39, 0.18], [0.25, 0.3], [0.43, 0.34], [0.49, 0.38], [0.33, 0.42], [0.19, 0.41], [0.31, 0.48], [0.46, 0.47], [0.39, 0.61], [0.21, 0.69], [-0.02, 0.6], [-0.24, 0.44], [-0.31, 0.17], [-0.3, -0.05], [-0.38, -0.3], [-0.48, -0.49], [-0.37, -0.68], [-0.13, -0.79], [0.16, -0.79], [0.41, -0.66], [0.32, -0.9], [0.03, -1.12], [-0.32, -1.09], [-0.67, -0.89], [-0.87, -0.5], [-0.94, -0.08], [-0.82, 0.31], [-0.82, 0.95]]
TERMS, CYCLE, DURATION = 90, 45, 120
p = np.array(POINTS)
d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(p, axis=0), axis=1))]
s = np.arange(512)*d[-1]/512
z = np.interp(s,d,p[:,0]) + 1j*np.interp(s,d,p[:,1])
c = np.fft.fft(z)/len(z)
k = np.fft.fftfreq(len(z))*len(z)
order = np.argsort(-abs(c))[:TERMS]
c,k = c[order],k[order]
u = np.linspace(0,1,1501)
trace = np.exp(2j*np.pi*u[:,None]*k)@c
fig,ax = plt.subplots(figsize=(12,7),facecolor='#0a2424')

def frame(i):
    ax.clear();ax.set_facecolor('#0a2424')
    phase = (i/24 % CYCLE)/CYCLE
    chain = np.r_[0j,np.cumsum(c*np.exp(2j*np.pi*k*phase))]
    for origin,radius in zip(chain[:-1],abs(c)):
        ax.add_patch(plt.Circle((origin.real,origin.imag),radius,fill=False,color='#87cfdf',alpha=.25,lw=.6))
    ax.plot(chain.real,chain.imag,color='#87cfdf',lw=.7)
    n = int(phase*1500)+1
    ax.plot(trace[:n].real,trace[:n].imag,color='#f3ce85',lw=1.5)
    ax.plot(chain[-1].real,chain[-1].imag,'o',color='#f3ce85',ms=4)
    ax.set(xlim=(-2,2),ylim=(2,-1.6),aspect='equal');ax.axis('off')
    ax.set_title(f'A portrait, in circles · {TERMS} harmonics',color='white')
    return []

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--gif');args=parser.parse_args()
    animation=FuncAnimation(fig,frame,frames=DURATION*24,interval=1000/24,cache_frame_data=False)
    if args.gif:animation.save(args.gif,writer='pillow',fps=24)
    else:plt.show()
