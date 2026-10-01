#!/usr/bin/env python3
"""Compose and render an original 30-second hip-hop trailer score.

Every sound is synthesized here: no recordings, loops, copyrighted samples, or
external audio assets are used. Requires NumPy, SciPy and ffmpeg. The fixed seed,
48 kHz grid and twelve 96 BPM bars make the composition reproducible.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48_000
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
DURATION = 30.0
N = int(SR * DURATION)
ROOT = Path(__file__).resolve().parents[2]
RNG = np.random.default_rng(19952026)


def midi(note: float) -> float:
    return 440 * 2 ** ((note - 69) / 12)


def clock(duration: float) -> np.ndarray:
    return np.arange(round(duration * SR), dtype=np.float64) / SR


def filt(x: np.ndarray, hz, mode='lowpass', order=3) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, hz, mode, fs=SR, output='sos'), x)


def edge(x: np.ndarray, attack=.003, release=.018) -> np.ndarray:
    x = x.copy()
    a, r = min(len(x), round(attack * SR)), min(len(x), round(release * SR))
    if a: x[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if r: x[-r:] *= np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return x


def place(bus: np.ndarray, x: np.ndarray, when: float, gain=1.0, pan=0.0) -> None:
    start = round(when * SR)
    if start < 0:
        x, start = x[-start:], 0
    count = min(len(x), N - start)
    if count <= 0: return
    angle = (pan + 1) * np.pi / 4
    if x.ndim == 1:
        bus[start:start+count, 0] += x[:count] * gain * math.cos(angle)
        bus[start:start+count, 1] += x[:count] * gain * math.sin(angle)
    else:
        bus[start:start+count] += x[:count] * gain


def kick(modern=False, strength=1.0) -> np.ndarray:
    t = clock(.53 if modern else .43)
    frequency = 47 + (117 if modern else 92) * np.exp(-t / .027)
    phase = 2 * np.pi * np.cumsum(frequency) / SR
    body = np.sin(phase) * np.exp(-t / (.145 if modern else .12))
    knock = .20 * np.sin(phase * 2.04) * np.exp(-t / .045)
    snap = filt(RNG.normal(size=len(t)), [1100, 7800], 'bandpass') * np.exp(-t / .0045) * .32
    return edge(np.tanh((body + knock + snap) * 1.6) / 1.3, .001, .025) * strength


def snare(modern=False, ghost=False) -> np.ndarray:
    t = clock(.38 if modern else .31)
    noise = filt(RNG.normal(size=len(t)), [550, 10500], 'bandpass')
    body = (np.sin(2*np.pi*185*t) + .38*np.sin(2*np.pi*337*t)) * np.exp(-t/.045)
    tail = noise * (.78*np.exp(-t/.055) + .23*np.exp(-t/.14))
    if modern:
        # Three tiny synthesized noise bursts create a wide clap rather than a
        # sampled snare; its flutter arrives within 13 ms of the same grid hit.
        for onset in (0, .006, .012):
            tail += .35 * noise * np.where(t >= onset, np.exp(-np.maximum(t-onset, 0)/.022), 0)
    return edge(np.tanh(1.1*(tail + .55*body)), .0007, .03) * (.26 if ghost else 1)


def hat(opened=False, modern=False) -> np.ndarray:
    duration = .29 if opened else .086 if modern else .072
    t = clock(duration)
    partials = sum(np.sin(2*np.pi*f*t + RNG.uniform(0, 2*np.pi)) for f in (4250, 5630, 7117, 9233, 10810)) / 5
    noise = filt(RNG.normal(size=len(t)), 6200, 'highpass')
    x = (.46*noise + .32*partials) * np.exp(-t/(.079 if opened else .018))
    return edge(x, .0004, .009)


def rim() -> np.ndarray:
    t = clock(.065)
    x = (np.sin(2*np.pi*1760*t) + .4*np.sin(2*np.pi*2341*t)) * np.exp(-t/.008)
    return edge(x, .0004, .008)


def cymbal(duration=1.35) -> np.ndarray:
    t = clock(duration)
    x = filt(RNG.normal(size=len(t)), [3300, 15000], 'bandpass')
    x += .15*sum(np.sin(2*np.pi*f*t) for f in (3807, 5899, 7483, 11317))
    return edge(x*np.exp(-t/.31), .002, .16)


def rhodes(note: float, duration=.65, mellow=False) -> np.ndarray:
    t = clock(duration)
    f = midi(note)
    mod = np.sin(2*np.pi*f*2.003*t) * 1.15*np.exp(-t/.13)
    bell = np.sin(2*np.pi*f*t + mod)
    bell += .25*np.sin(2*np.pi*f*2*t)*np.exp(-t/.085)
    bell += .10*np.sin(2*np.pi*f*3.997*t)*np.exp(-t/.045)
    bell += .032*filt(RNG.normal(size=len(t)), 3400)*np.exp(-t/.013)
    env = np.exp(-t/(.40 if mellow else .24))
    # Imperfect homemade key timbre, including a tiny original wow/flutter.
    trem = 1 + .065*np.sin(2*np.pi*4.7*t) + .013*np.sin(2*np.pi*21*t)
    return edge(filt(bell*env*trem, 2700 if mellow else 6600), .007, .075)


def chord(notes, duration=.52, mellow=False) -> np.ndarray:
    x = np.zeros((round(duration*SR), 2))
    for i, note in enumerate(notes):
        voice = rhodes(note, duration, mellow)
        p = np.linspace(-.7, .7, len(notes))[i]
        x[:, 0] += voice*np.cos((p+1)*np.pi/4)
        x[:, 1] += voice*np.sin((p+1)*np.pi/4)
    return x / len(notes)**.65


def pad(notes, duration=2.55) -> np.ndarray:
    t = clock(duration)
    x = np.zeros((len(t), 2))
    for i,note in enumerate(notes):
        f = midi(note)
        for channel, detune in enumerate((-.0018, .0018)):
            voice = np.sin(2*np.pi*f*(1+detune)*t) + .27*np.sin(2*np.pi*f*2*t)
            x[:, channel] += voice / len(notes)
    env = np.minimum(t/.26, 1)*np.minimum((duration-t)/.45, 1)
    return x*np.maximum(env, 0)[:, None]


def bass(note, duration=.45, modern=False, glide=None) -> np.ndarray:
    t = clock(duration)
    frequencies = np.full(len(t), midi(note))
    if glide is not None:
        start = max(.03, duration-.16)
        fraction = np.clip((t-start)/.14, 0, 1)
        frequencies *= 2 ** ((glide-note)*fraction/12)
    phase = 2*np.pi*np.cumsum(frequencies)/SR
    if modern:
        fundamental = np.sin(phase)
        harmonics = .17*np.sin(phase*2) + .11*np.sin(phase*3)
        x = .75*np.tanh((fundamental + harmonics)*1.8)
        env = np.exp(-t/.98)
        return edge(filt(x*env, 1450), .006, min(.095,duration*.3))
    x = np.sin(phase) + .29*np.sin(phase*2.006)*np.exp(-t/.10) + .10*np.sin(phase*3.01)
    x += .045*filt(RNG.normal(size=len(t)), 1900)*np.exp(-t/.013)
    return edge(np.tanh(x*1.12)*np.exp(-t/.20), .006, .045)


def impact() -> np.ndarray:
    t = clock(.8)
    phase = 2*np.pi*np.cumsum(35+54*np.exp(-t/.14))/SR
    return edge(np.sin(phase)*np.exp(-t/.19), .002, .12)


def riser(duration, falling=False) -> np.ndarray:
    t = clock(duration)
    noise = RNG.normal(size=len(t))
    x = filt(noise, [1800, 12000], 'bandpass')
    env = (1-t/duration)**1.4 if falling else (t/duration)**1.8
    pitch = 170*np.exp(t/duration*2.2)
    phase = np.cumsum(pitch)*2*np.pi/SR
    x = .27*x + .08*np.sin(phase)
    return edge(x*env, .02, .025)


def vinyl() -> np.ndarray:
    # Procedurally generated surface hiss and tiny irregular ticks. This has
    # never been extracted from a record, film, recording or sample library.
    t = clock(DURATION)
    noise = filt(RNG.normal(size=N), [330, 6200], 'bandpass') * .0035
    noise *= 1 + .13*np.sin(2*np.pi*.77*t)
    for when in RNG.uniform(.08, 12.4, 38):
        index = round(when*SR)
        tick = RNG.normal(size=70)*np.exp(-np.arange(70)/11)*RNG.uniform(.005,.016)
        noise[index:index+len(tick)] += tick
    return noise


def compose() -> tuple[np.ndarray, list[dict]]:
    drums = np.zeros((N,2)); music = drums.copy(); low = drums.copy(); fx = drums.copy()
    duck = np.zeros(N)
    events = []
    # F# minor ninth / D major ninth / B minor eleven / C# dominant. The same
    # melodic fingerprint survives the switch in drums and bass articulation.
    changes = [([54,57,61,64,68],30),([50,54,57,61,64],26),([47,50,54,57,61],35),([49,53,56,59,63],25)]
    progression = [0,1,2,3,0,0,1,2,3,0,1,0]
    motif = [(0,73),(.75,76),(1.25,78),(1.75,76),(2.5,73),(3.25,71),(3.5,69)]
    boom_patterns = [[0,6,9,14],[0,3,8,11],[0,7,10,14],[0,5,8,15],[0,6,10]]
    trap_patterns = [[0,3,7,10,14],[0,6,9,13],[0,2,7,11,15],[0,5,10,12],[0,3,7,10,14]]
    markers = {0:'archive opens',2.5:'first network',7.5:'scene growth',12.5:'trap era switch',20:'connection reveal',25:'anthem / invitation'}
    for when,label in markers.items():
        place(fx,impact(),when,.38)
        place(drums,cymbal(1.18),when,.20 if when<12.5 else .30, -.18 if when in (2.5,20) else .12)
        events.append({'time':when,'type':'sync-hit','label':label})

    for bar in range(12):
        start = bar*BAR
        modern = bar>=5
        anthem = bar>=10
        notes,root = changes[progression[bar]]
        # Chopped Rhodes fragments add displacement and leave room for drums.
        chops = [0,1.5,2.75] if not modern else [0,1.75,3.25]
        if anthem: chops = [0,.75,1.5,2.75]
        for i,b in enumerate(chops):
            duration = .57 if i==0 else .39
            if start+b*BEAT > 29.1: continue
            place(music,chord(notes,duration,not modern),start+b*BEAT,.27 if not modern else .23)
        if anthem:
            place(music,pad([n+12 for n in notes],2.2),start,.19)
        elif bar in (1,3,6,8):
            place(music,pad(notes,2.2),start,.065)

        for i,(b,note) in enumerate(motif):
            if bar%2 and i in (1,4): continue
            if bar%4==3: note = 72 if i in (2,3) else note-1
            when = start+b*BEAT
            if when>29.05:continue
            gain = .19 if modern else .16
            if anthem:gain *= 1.12
            place(music,rhodes(note,.54),when,gain,-.18 if i%2==0 else .18)
            if anthem:place(music,rhodes(note-12,.48),when,.070,.35 if i%2 else -.35)

        pattern = boom_patterns[bar%5] if not modern else trap_patterns[(bar-5)%5]
        if anthem: pattern = [0,3,6,8,11,14] if bar==10 else [0,4,7,10,12]
        for i,step in enumerate(pattern):
            when = start+step*BEAT/4
            if when>29.23:continue
            if not modern and step%2:when+=.020
            place(drums,kick(modern),when,.82 if modern else .72)
            events.append({'time':round(when,5),'type':'kick','bar':bar+1})
            idx = round(when*SR);count=min(round(.30*SR),N-idx)
            duck[idx:idx+count] = np.maximum(duck[idx:idx+count],np.exp(-np.arange(count)/SR/.09))
            if not modern:
                bass_note=root+12+(7 if i==len(pattern)-1 and bar%2 else 0)
                place(low,bass(bass_note,.36 if step>=12 else .49),when,.37)

        snare_steps = [4,12] if not modern else [8]
        for step in snare_steps:
            when=start+step*BEAT/4
            if when>29.1:continue
            place(drums,snare(modern),when+(0 if anthem else .003),.51 if modern else .49)
            if not modern:place(drums,rim(),when+.009,.075,.2)
        if not modern and bar in (1,3):place(drums,snare(ghost=True),start+11*BEAT/4+.022,.30,-.25)
        if modern and bar in (6,8,10):place(drums,snare(True,True),start+15*BEAT/4,.42,.23)

        # Eight-note swing in the dusty section, tighter sixteen-note hats in
        # the modern section, with changing holes, rolls, velocity and panning.
        hat_steps=range(0,16,2) if not modern else range(16)
        for step in hat_steps:
            if modern and (step+bar)%9==0:continue
            when=start+step*BEAT/4
            if not modern and step%4==2:when+=.038
            if modern and step%2:when+=.009
            if when>29.22:continue
            strength=(.087 if modern else .090)*(1 if step%4==0 else .68)*RNG.uniform(.87,1.09)
            place(drums,hat(modern=modern),when,strength, .21+RNG.uniform(-.12,.12))
        if bar not in (0,4,11):place(drums,hat(True,modern),start+14*BEAT/4,.105,-.32)
        if modern:
            roll_steps = [6,14] if bar%2==0 else [3,15]
            for step in roll_steps:
                for j in range(4 if step==14 else 3):
                    when=start+step*BEAT/4+j*BEAT/16
                    if when>29.2:continue
                    place(drums,hat(modern=True),when,.075*(.75+.13*j),-.22+j*.13)
            # Mono 808 uses long envelopes and actual pitch-continuous glides.
            bass_events=[(0,.84,root,None),(1.5,.54,root,root+7),(2.75,.64,root+12,root)]
            if bar%2:bass_events=[(0,1.14,root,None),(2,.44,root+7,root),(3,.52,root,root-2)]
            for b,length,note,glide in bass_events:
                when=start+b*BEAT
                if when+length>29.28:length=max(.12,29.28-when)
                if when>=29.15:continue
                place(low,bass(note,length,True,glide),when,.47 if not anthem else .51)

        if bar==4:
            # A reversed chord and drum fill announce the hard generation cut.
            rev=chord(changes[0][0],.51,True)[::-1].copy()
            rev*=np.linspace(0,1,len(rev))[:,None]
            place(fx,rev,11.96,.16)
            place(fx,riser(.52),11.95,.34,-.25)
            for j in range(4):place(drums,snare(True,True),12.08+j*.078125,.30+j*.045,-.2+j*.13)
        if bar==9:
            place(fx,riser(.86),24.10,.30,.22)
            for j in range(5):place(drums,snare(True,True),24.49+j*.09375,.26+j*.065,-.28+j*.11)

    # The final beat is a resolved F# accent; its short release falls naturally
    # to silence at 30 s instead of chopping a full-length loop at the boundary.
    ending=29.375
    place(drums,kick(True),ending,.80)
    place(drums,snare(True),ending,.45)
    place(low,bass(30,.57,True),ending,.46)
    place(music,chord([54,57,61,66],.57),ending,.32)
    place(music,rhodes(78,.57),ending,.17)
    events.append({'time':ending,'type':'resolved-final-beat','label':'natural decay to 30 seconds'})

    # Subtle original surface texture switches down in the cleaner modern era.
    hiss=vinyl();hiss[round(12.5*SR):]*=.38
    place(fx,hiss,0,1.0,0)
    music*= (1-.19*duck)[:,None]
    low*= (1-.35*duck)[:,None]

    # Tape-like filtered cross delays create space without washing out transients.
    wet=np.zeros_like(music)
    for delay,gain in ((.117,.10),(.234,.065),(.469,.035)):
        offset=round(delay*SR)
        wet[offset:,0]+=filt(music[:-offset,1],3700)*gain
        wet[offset:,1]+=filt(music[:-offset,0],3700)*gain
    mix=drums+music+low+fx+wet
    # Gentle bus saturation generates our own harmonics, never hard clipping.
    mix=np.tanh(mix*1.14)/1.14
    # Smooth boundary envelopes preserve the final downbeat and its full decay.
    intro=round(.004*SR);mix[:intro]*=np.sin(np.linspace(0,np.pi/2,intro))[:,None]**2
    tail=round(.39*SR);mix[-tail:]*=np.cos(np.linspace(0,np.pi/2,tail))[:,None]**2
    mix[-1]=0
    return mix.astype(np.float32),events


def loudness_report(path: Path, extra='') -> dict:
    args=['ffmpeg','-hide_banner','-nostats','-i',str(path),'-af',extra+'loudnorm=I=-14:TP=-1:LRA=8:print_format=json','-f','null','-']
    done=subprocess.run(args,capture_output=True,text=True,check=True)
    matches=re.findall(r'\{\s*"input_i".*?\}',done.stderr,re.S)
    if not matches:raise RuntimeError('ffmpeg did not return a loudness measurement')
    return json.loads(matches[-1])


def render(output: Path) -> dict:
    output.parent.mkdir(parents=True,exist_ok=True)
    mix,events=compose()
    raw=output.with_name('.beat-unnormalized.wav')
    wavfile.write(raw,SR,mix)
    measured=loudness_report(raw)
    effect=('loudnorm=I=-14:TP=-1:LRA=8:'
            f'measured_I={measured["input_i"]}:measured_TP={measured["input_tp"]}:'
            f'measured_LRA={measured["input_lra"]}:measured_thresh={measured["input_thresh"]}:'
            f'offset={measured["target_offset"]}:linear=true:print_format=json')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(raw),'-af',effect,
                    '-ar',str(SR),'-ac','2','-c:a','pcm_s24le',str(output)],check=True)
    raw.unlink()
    sr,pcm=wavfile.read(output)
    normalized=pcm.astype(np.float64)/2**31
    final=loudness_report(output)
    section_stats=[]
    for start,end,name in [(0,12.5,'boom bap'),(12.5,25,'half-time trap'),(25,30,'anthem / resolve')]:
        x=normalized[round(start*sr):round(end*sr)]
        rms=float(np.sqrt(np.mean(x*x)))
        section_stats.append({'start':start,'end':end,'name':name,'rmsDbfs':round(20*np.log10(max(rms,1e-12)),2),
                              'samplePeakDbfs':round(20*np.log10(max(np.max(np.abs(x)),1e-12)),2)})
    report={'originalComposition':True,'externalAudioAssets':[], 'seed':19952026,
            'sampleRate':sr,'channels':int(pcm.shape[1]),'samples':len(pcm),'duration':len(pcm)/sr,
            'bpm':BPM,'meter':'4/4','bars':12,'beatSeconds':BEAT,'barSeconds':BAR,
            'key':'F# minor','format':'24-bit PCM WAV','samplePeakDbfs':round(20*np.log10(np.max(np.abs(normalized))),3),
            'clippedSamples':int(np.sum(np.abs(normalized)>=1)),
            'finalSampleAmplitude':normalized[-1].tolist(),'loudness':final,'sections':section_stats,
            'syncMarkers':[e for e in events if e['type'] in ('sync-hit','resolved-final-beat')],
            'events':events}
    if len(pcm)!=N or sr!=SR or pcm.shape!=(N,2):raise RuntimeError('Incorrect trailer audio grid')
    if report['clippedSamples']:raise RuntimeError('Clipped output samples')
    if abs(float(final['input_i'])+14)>.6:raise RuntimeError('Integrated loudness outside target tolerance')
    if float(final['input_tp'])>-.8:raise RuntimeError('True peak exceeds intended headroom')
    output.with_name('beat-analysis.json').write_text(json.dumps(report,indent=2)+'\n')
    return report


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=ROOT/'.cache/trailer/beat.wav')
    args=parser.parse_args()
    report=render(args.output)
    print(json.dumps({k:report[k] for k in ('duration','sampleRate','channels','bpm','bars','samplePeakDbfs','clippedSamples','loudness','sections')},indent=2))


if __name__=='__main__':main()
