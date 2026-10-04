/* Pure: the brain network of the body chapter, and its always-on background firing.
   Positions are in world units. Nothing here draws. */

import { TAU, cl, rng } from '@studio/engine/math';
import { CHAIN } from './03-body.layout';

export type Pt = [number, number];

/** Centre of the brain. */
export const BR: Pt = [640, 290];

/** The firing chain we follow: neurons that fire in order, into the nerve. */
export const PATH: Pt[] = [[586, 298], [602, 280], [621, 299], [640, 279], [659, 297], [675, 283], [692, 304]];

/** Neurons the trace runs back through, in order: what you saw, learned, wanted. Spread across the network. */
export const TRACE: Pt[] = [[606, 266], [636, 312], [680, 264]];
/** Where each trace neuron's badge sits. No neuron is placed under a badge. */
export const TRACE_BADGE: Pt[] = [[594, 263], [650, 312], [668, 258]];

/** All neurons: the chain first, then the trace neurons, then scattered ones. */
export const NODES: Pt[] = scatterNodes();

/** Background links. Chain-to-chain links are not in this list. */
export const EDGES: [number, number][] = nearestEdges();

const ADJ: number[][] = adjacency();

function scatterNodes(): Pt[] {
  const r = rng(31), n: Pt[] = PATH.concat(TRACE);
  while (n.length < 26) {
    const a = r() * TAU, d = Math.sqrt(r());
    const p: Pt = [BR[0] + Math.cos(a) * 60 * d, BR[1] + Math.sin(a) * 32 * d];
    const clear = n.every(function (q) { return Math.hypot(q[0] - p[0], q[1] - p[1]) >= 11; })
      && TRACE_BADGE.every(function (q) { return Math.hypot(q[0] - p[0], q[1] - p[1]) >= 14; });
    if (clear) n.push(p);
  }
  return n;
}

/** Each non-chain neuron links to its two nearest neighbours. */
function nearestEdges(): [number, number][] {
  const e: [number, number][] = [];
  for (let i = CHAIN; i < NODES.length; i++) {
    const d = NODES.map(function (q, k): [number, number] { return [Math.hypot(q[0] - NODES[i][0], q[1] - NODES[i][1]), k]; }).sort(function (a, b) { return a[0] - b[0]; });
    for (let j = 1; j <= 2; j++) e.push([i, d[j][1]]);
  }
  return e;
}

function adjacency(): number[][] {
  const adj: number[][] = NODES.map(function () { return []; });
  EDGES.forEach(function (e) {
    if (adj[e[0]].indexOf(e[1]) < 0) adj[e[0]].push(e[1]);
    if (adj[e[1]].indexOf(e[0]) < 0) adj[e[1]].push(e[0]);
  });
  return adj;
}

/* ---- Background firing ---- */

/** A pulse on its way along a link: where it is and how strongly it shows (0..1). */
export interface Pulse { x: number; y: number; a: number }

export interface Activity {
  pulses: Pulse[];
  /** Per neuron, 0..1: how brightly it flashes as a pulse arrives. */
  flash: number[];
}

/** Pulses alive at any moment. */
const SPARKS = 22;
/** Hops in one walk, before the pulse dies and a new one starts elsewhere. */
const HOPS = 5;

/**
 * Background firing at time T. Each spark walks the network a few hops, dies, and restarts at another
 * neuron. Every walk is chosen by hashing (spark, walk, step), so the result is a pure function of T.
 */
export function activity(T: number): Activity {
  const flash = NODES.map(function () { return 0; });
  const pulses: Pulse[] = [];
  for (let k = 0; k < SPARKS; k++) {
    const hop = 0.3 + 0.22 * hash(k, 0, 1), g = T / hop + hash(k, 0, 2) * HOPS * 7;
    const w = Math.floor(g / HOPS), s = Math.floor(g) - w * HOPS, f = g - Math.floor(g);
    const walk = walkOf(k, w, s + 1);
    const a = cl(Math.min((s + f) / 0.5, (HOPS - s - f) / 0.5));
    const p = NODES[walk[s]], q = NODES[walk[s + 1]];
    pulses.push({ x: p[0] + (q[0] - p[0]) * f, y: p[1] + (q[1] - p[1]) * f, a: a });
    if (s > 0) flash[walk[s]] = Math.max(flash[walk[s]], cl(1 - f / 0.6));
  }
  return { pulses: pulses, flash: flash };
}

/** Neuron indices of walk w of spark k, up to `steps` hops. Starts on a non-chain neuron; avoids turning straight back. */
function walkOf(k: number, w: number, steps: number): number[] {
  const out = [CHAIN + Math.floor(hash(k, w, 0) * (NODES.length - CHAIN))];
  for (let i = 1; i <= steps; i++) {
    const at = out[i - 1], prev = i > 1 ? out[i - 2] : -1;
    const opts = ADJ[at].length > 1 ? ADJ[at].filter(function (n) { return n !== prev; }) : ADJ[at];
    out.push(opts[Math.floor(hash(k, w, i + 1) * opts.length)]);
  }
  return out;
}

/** Integer hash of three ints to [0, 1). */
export function hash(a: number, b: number, c: number): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b | 0) + 0x632be59b, 0xc2b2ae35) ^ Math.imul((c | 0) + 0x27d4eb2f, 0x165667b1);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
