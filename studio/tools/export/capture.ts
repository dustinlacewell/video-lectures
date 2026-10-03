/* Imperative shell: several headless player pages draw frames in parallel; frames come out in order. */

import type { Common } from '../shared/args.ts';
import { pngBytes } from '../shared/output.ts';
import { CANVAS_MARK, openSession, type Session } from '../shared/session.ts';

/** The page size the player is opened at. Its CSS caps the stage width; the device scale reaches the asked canvas width. */
const VIEWPORT = { width: 1920, height: 1080 };
/** The player stage width in CSS pixels at that viewport, for the first guess of the scale. */
const STAGE_GUESS = 1440;

/** `count` pages whose video canvas is exactly `width` pixels wide. */
export async function openPages(common: Common, width: number, count: number): Promise<Session[]> {
  const first = await openWide(common, width);
  const rest = await Promise.all(Array.from({ length: count - 1 }, function () {
    return openSession({ ...common, url: first.url, build: undefined }, { viewport: VIEWPORT, deviceScaleFactor: first.scale });
  }));
  return [first.session].concat(rest);
}

async function openWide(common: Common, width: number): Promise<{ session: Session; url: string; scale: number }> {
  let scale = width / STAGE_GUESS;
  for (let tries = 0; tries < 3; tries++) {
    const s = await openSession(common, { viewport: VIEWPORT, deviceScaleFactor: scale });
    if (s.canvas.width === width) return { session: s, url: common.build ? s.url : common.url!, scale: scale };
    const css = await s.page.evaluate(function (sel) { return (document.querySelector(sel) as HTMLCanvasElement).clientWidth; }, '[' + CANVAS_MARK + ']');
    await s.close();
    scale = width / css;
  }
  throw new Error('could not get a canvas ' + width + ' px wide; the player caps its canvas width (MAX_CANVAS_W)');
}

/** Draw each time in `times` and hand its PNG bytes to `sink`, in order. Keeps every page busy. */
export async function captureFrames(pages: Session[], times: number[], sink: (png: Buffer, i: number) => Promise<void>): Promise<void> {
  const K = pages.length, ahead = K * 3, pending = new Map<number, Promise<Buffer>>();
  let next = 0;
  function request(i: number): void {
    const p = pages[i % K].page.evaluate(grab, { t: times[i], sel: '[' + CANVAS_MARK + ']' }).then(pngBytes);
    p.catch(function () { /* awaited below */ });
    pending.set(i, p);
  }
  for (; next < Math.min(times.length, ahead); next++) request(next);
  for (let i = 0; i < times.length; i++) {
    const png = await pending.get(i)!;
    pending.delete(i);
    if (next < times.length) request(next++);
    await sink(png, i);
  }
}

/** In the page: draw T and return the canvas as a PNG data URL. */
function grab(a: { t: number; sel: string }): string {
  (window as any).__seek(a.t);
  return (document.querySelector(a.sel) as HTMLCanvasElement).toDataURL('image/png');
}

export async function closeAll(pages: Session[]): Promise<void> {
  await Promise.all(pages.slice(1).map(function (s) { return s.close(); }));
  if (pages[0]) await pages[0].close();
}
