/* Web Audio graph and the two voices everything is built from: tone and filtered noise. */

export interface AudioState {
  ctx: AudioContext | null;
  on: boolean;
  step: number;
  root?: number;
  master: GainNode;
  noise: AudioBuffer;
  fx: GainNode;
  pad: GainNode;
  po: OscillatorNode[];
}

/** Shared synth state. Graph nodes exist once `ctx` is set. */
export const AU = { ctx: null, on: true, step: -1 } as unknown as AudioState;

export function auInit(): void {
  if (AU.ctx) return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const x = new AC();
  AU.ctx = x;
  AU.master = x.createGain(); AU.master.gain.value = AU.on ? 0.9 : 0;
  const comp = x.createDynamicsCompressor(); AU.master.connect(comp); comp.connect(x.destination);
  AU.noise = whiteNoise(x);
  AU.fx = echoBus(x);
  AU.pad = x.createGain(); AU.pad.gain.value = 0;
  const lp = x.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 620; AU.pad.connect(lp); lp.connect(AU.master);
  AU.po = [0, 1, 2].map(function (k) {
    const o = x.createOscillator(); o.type = k === 1 ? 'triangle' : 'sine'; o.frequency.value = 110; o.detune.value = (k - 1) * 7;
    o.connect(AU.pad); o.start(); return o;
  });
}

function whiteNoise(x: AudioContext): AudioBuffer {
  const nb = x.createBuffer(1, x.sampleRate, x.sampleRate), d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return nb;
}

/** A gain that feeds master directly and through a feedback delay. */
function echoBus(x: AudioContext): GainNode {
  const fx = x.createGain();
  const dl = x.createDelay(1), fb = x.createGain(), wet = x.createGain();
  dl.delayTime.value = 0.34; fb.gain.value = 0.34; wet.gain.value = 0.4;
  fx.connect(AU.master); fx.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(AU.master);
  return fx;
}

/** Oscillator note gliding f0 -> f1 with a fast attack and exponential decay. */
export function tone(f0: number, f1: number, dur: number, type?: OscillatorType, gain?: number, dest?: AudioNode | null, delay?: number): void {
  const x = AU.ctx!, t = x.currentTime + (delay || 0), o = x.createOscillator(), g = x.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain!, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || AU.master); o.start(t); o.stop(t + dur + 0.05);
}

/** Filtered noise burst, filter sweeping f0 -> f1. */
export function hiss(dur: number, ftype: BiquadFilterType, f0: number, f1: number, q: number, gain: number, attack?: number, delay?: number): void {
  const x = AU.ctx!, t = x.currentTime + (delay || 0), s = x.createBufferSource(), f = x.createBiquadFilter(), g = x.createGain();
  s.buffer = AU.noise; s.loop = true; f.type = ftype; f.Q.value = q || 1;
  f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + (attack || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(AU.master); s.start(t); s.stop(t + dur + 0.05);
}
