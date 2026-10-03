/* Film grain and vignette, drawn over everything in screen space. */

import { c } from './canvas';
import { H, W, rng } from './math';

let grain: HTMLCanvasElement | null = null;
let grainPat: CanvasPattern | null = null;

function makeGrain(): HTMLCanvasElement {
  const g = document.createElement('canvas'); g.width = g.height = 256;
  const x = g.getContext('2d')!, d = x.createImageData(256, 256), r = rng(77);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = r() < 0.5 ? 0 : 255;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.floor(r() * 46);
  }
  x.putImageData(d, 0, 0);
  return g;
}

/** Drop the cached pattern. Call when the canvas is resized. */
export function resetGrain(): void { grainPat = null; }

export function drawGrain(T: number): void {
  if (!grain) grain = makeGrain();
  if (!grainPat) grainPat = c.createPattern(grain, 'repeat');
  const f = Math.floor(T * 12), ox = (f * 97) % 256, oy = (f * 57) % 256;
  c.save(); c.globalAlpha = 0.5; c.translate(-ox, -oy); c.fillStyle = grainPat!; c.fillRect(ox, oy, W, H); c.restore();
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(8,4,30,0)'); g.addColorStop(1, 'rgba(8,4,30,0.5)');
  c.globalAlpha = 1; c.fillStyle = g; c.fillRect(0, 0, W, H);
}
