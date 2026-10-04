/* Imperative shell: read raw canvas pixels from an open session, at full resolution. */

import type { Page } from 'playwright';
import type { Session } from '../shared/session.ts';
import { CANVAS_MARK } from '../shared/session.ts';
import { sha256 } from './hash.ts';

/** Seek to T, read the canvas's raw RGBA bytes at full size, and hash them. */
export async function frameHash(session: Session, T: number): Promise<string> {
  return sha256(await rawPixels(session.page, T));
}

/** Seek to T and return a PNG data URL `width` px wide (for a human reference image; the bless default is reduced, not full size). */
export function framePng(session: Session, T: number, width: number): Promise<string> {
  return session.frame(T, width);
}

async function rawPixels(page: Page, T: number): Promise<Buffer> {
  const b64 = await page.evaluate(function (a) {
    (window as any).__seek(a.t);
    const c = document.querySelector('[' + a.mark + ']') as HTMLCanvasElement;
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    const CHUNK = 32768;
    let bin = '';
    for (let i = 0; i < d.length; i += CHUNK) bin += String.fromCharCode.apply(null, Array.from(d.subarray(i, i + CHUNK)));
    return btoa(bin);
  }, { t: T, mark: CANVAS_MARK });
  return Buffer.from(b64, 'base64');
}
