/* Imperative shell: render the page's own music and sound effects offline, deterministically, and bring the samples to Node.

   The player's synth (window.__synth) schedules every note at ctx.currentTime. Here its context is an OfflineAudioContext
   behind a proxy whose currentTime is a virtual clock. The clock walks the timeline the way playback does:
   pad on at 0; then at each tick the sound cues due, then the music sequencer; voice ducking at clip starts and ends.
   Math.random is seeded while the graph is built, so the noise buffer is the same on every run. */

import type { Page } from 'playwright';

export interface SynthJob {
  rate: number;
  /** Render [0, end) seconds. */
  end: number;
  cues: { t: number; type: string; arg?: number }[];
  duck: [number, number][];
  /** Sequencer tick, seconds. The live player ticks once per frame; a fine tick puts each note within `tick` of its step. */
  tick: number;
  seed: number;
}

/** Stereo samples of [0, job.end). */
export async function renderSynth(page: Page, job: SynthJob): Promise<Float32Array[]> {
  const has = await page.evaluate(function () { return typeof (window as any).__synth === 'function'; });
  if (!has) throw new Error('the page has no window.__synth(); the offline music render needs it (see export.md)');
  // tsx keeps function names with a __name() helper that the page lacks. A string is not transformed.
  await page.evaluate('globalThis.__name = globalThis.__name || function (f) { return f; }');
  const length = await page.evaluate(renderInPage, job);
  const chunk = 1 << 20, out = [new Float32Array(length), new Float32Array(length)];
  for (let c = 0; c < 2; c++) {
    for (let at = 0; at < length; at += chunk) {
      const b64 = await page.evaluate(takeChunk, { c: c, at: at, n: Math.min(chunk, length - at) });
      const b = Buffer.from(b64, 'base64');
      out[c].set(new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4), at);
    }
  }
  await page.evaluate(function () { delete (window as any).__vsMix; });
  return out;
}

/* The functions below run in the page. */

async function renderInPage(job: SynthJob): Promise<number> {
  const w = window as any, S = w.__synth();
  if (S.ctx()) throw new Error('the synth already has a live AudioContext; open a fresh page');
  const length = Math.ceil(job.end * job.rate), off = new OfflineAudioContext(2, length, job.rate);
  let now = 0;
  const ctx = new Proxy(off, {
    get: function (target, key) {
      if (key === 'currentTime') return now;
      const v = Reflect.get(target, key, target);
      return typeof v === 'function' ? v.bind(target) : v;
    }
  });
  const liveAC = w.AudioContext, liveRandom = Math.random;
  let seed = job.seed >>> 0;
  w.AudioContext = function () { return ctx; };
  Math.random = function () {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  try { S.init(); } finally { w.AudioContext = liveAC; Math.random = liveRandom; }
  if (S.ctx() !== ctx) throw new Error('__synth().init() did not take the offline context');

  const edges: { t: number; under: boolean }[] = [];
  job.duck.forEach(function (d) { edges.push({ t: d[0], under: true }, { t: d[1], under: false }); });
  let ci = 0, di = 0;
  S.pad(true);
  const ticks = Math.ceil(job.end / job.tick);
  for (let k = 0; k <= ticks; k++) {
    const T = Math.min(k * job.tick, job.end);
    while (ci < job.cues.length && job.cues[ci].t <= T) { now = job.cues[ci].t; S.sfx(job.cues[ci].type, job.cues[ci].arg); ci++; }
    while (di < edges.length && edges[di].t <= T) { now = edges[di].t; S.duck(edges[di].under); di++; }
    now = T;
    S.music(T);
  }
  const buf = await off.startRendering();
  w.__vsMix = [buf.getChannelData(0), buf.getChannelData(1)];
  return buf.length;
}

function takeChunk(a: { c: number; at: number; n: number }): string {
  const src = ((window as any).__vsMix as Float32Array[])[a.c].subarray(a.at, a.at + a.n);
  const bytes = new Uint8Array(src.buffer, src.byteOffset, src.byteLength);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 0x8000)));
  return btoa(s);
}
