/* Imperative shell: open a headless player page and talk to it only through the contract globals. */

import { chromium, type Browser, type Page } from 'playwright';
import type { Common } from './args.ts';
import type { Info } from './contract.ts';
import { serveDir, type Served } from './serve.ts';

export interface Session {
  page: Page;
  /** The page URL in use (the local server when --build). */
  url: string;
  info: Info;
  /** Canvas size in pixels. */
  canvas: { width: number; height: number };
  /** Jump to T and draw. */
  seek(T: number): Promise<void>;
  /** Draw T and return the canvas scaled to `width` pixels wide as a PNG data URL. */
  frame(T: number, width: number): Promise<string>;
  /** Draw T and return grey levels (0-255) of the canvas scaled to w x h. */
  grey(T: number, w: number, h: number): Promise<number[]>;
  /** Draw T, draw `away`, let the page run two animation frames, draw T again, and count the canvas pixels
      that differ between the two draws of T. A pure function of T gives 0. */
  redraw(T: number, away: number): Promise<{ changed: number; pixels: number }>;
  close(): Promise<void>;
}

export interface SessionOptions {
  /** Scripts to run in the page before its own code (e.g. canvas instrumentation). */
  initScripts?: string[];
  viewport?: { width: number; height: number };
  /** Rewrite the page URL before loading it (e.g. add or strip a flag). */
  pageUrl?: (url: string) => string;
}

/** Attribute put on the video canvas once it is found. Page-side helpers find the canvas by it. */
export const CANVAS_MARK = 'data-vs-canvas';

export async function openSession(common: Common, opts: SessionOptions = {}): Promise<Session> {
  const served: Served | undefined = common.build ? await serveDir(common.build) : undefined;
  const base = served ? served.url : common.url!;
  const url = opts.pageUrl ? opts.pageUrl(base) : base;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await openPage(browser, url, opts);
    const canvas = await markCanvas(page, common.canvas);
    const info = await page.evaluate(function () { return (window as any).__info(); }) as Info;
    return {
      page: page, url: url, info: info, canvas: canvas,
      seek: function (T) { return page.evaluate(function (t) { (window as any).__seek(t); }, T); },
      frame: function (T, width) { return page.evaluate(drawScaledPng, { t: T, w: width, sel: '[' + CANVAS_MARK + ']' }); },
      grey: function (T, w, h) { return page.evaluate(drawScaledGrey, { t: T, w: w, h: h, sel: '[' + CANVAS_MARK + ']' }); },
      redraw: async function (T, away) {
        const sel = '[' + CANVAS_MARK + ']';
        await page.evaluate(keepPixels, { t: T, sel: sel });
        await page.evaluate(seekAndSettle, away);
        return page.evaluate(countChanged, { t: T, sel: sel });
      },
      close: async function () { await browser.close(); if (served) await served.close(); }
    };
  } catch (e) {
    await browser.close();
    if (served) await served.close();
    throw e;
  }
}

/** Load the page, wait for the contract globals, web fonts, and two settled frames. */
async function openPage(browser: Browser, url: string, opts: SessionOptions): Promise<Page> {
  const ctx = await browser.newContext({ viewport: opts.viewport ?? { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const s of opts.initScripts ?? []) await page.addInitScript(s);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(function () { const w = window as any; return typeof w.__info === 'function' && typeof w.__seek === 'function'; }, null, { timeout: 30000 });
  await page.evaluate(async function () {
    await document.fonts.ready;
    await new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });
  });
  return page;
}

/** Tag the video canvas so later calls find it: the given selector, else the largest canvas. */
async function markCanvas(page: Page, selector: string | undefined): Promise<{ width: number; height: number }> {
  const size = await page.evaluate(function (a) {
    const list = a.sel ? Array.from(document.querySelectorAll(a.sel)) : Array.from(document.querySelectorAll('canvas'));
    const cvs = (list as HTMLCanvasElement[]).sort(function (p, q) { return q.width * q.height - p.width * p.height; })[0];
    if (!cvs) return null;
    cvs.setAttribute(a.mark, '');
    return { width: cvs.width, height: cvs.height };
  }, { sel: selector ?? '', mark: CANVAS_MARK });
  if (!size) throw new Error('no canvas found' + (selector ? ' for ' + selector : ''));
  return size;
}

/* The functions below run in the page. */

function keepPixels(a: { t: number; sel: string }): void {
  (window as any).__seek(a.t);
  const c = document.querySelector(a.sel) as HTMLCanvasElement;
  (window as any).__vsKept = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
}

async function seekAndSettle(t: number): Promise<void> {
  (window as any).__seek(t);
  await new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });
}

function countChanged(a: { t: number; sel: string }): { changed: number; pixels: number } {
  (window as any).__seek(a.t);
  const c = document.querySelector(a.sel) as HTMLCanvasElement;
  const now = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data, kept = (window as any).__vsKept as Uint8ClampedArray;
  let changed = 0;
  for (let i = 0; i < now.length; i += 4) {
    if (now[i] !== kept[i] || now[i + 1] !== kept[i + 1] || now[i + 2] !== kept[i + 2] || now[i + 3] !== kept[i + 3]) changed++;
  }
  return { changed: changed, pixels: now.length / 4 };
}

function drawScaledPng(a: { t: number; w: number; sel: string }): string {
  (window as any).__seek(a.t);
  const src = document.querySelector(a.sel) as HTMLCanvasElement;
  if (a.w >= src.width) return src.toDataURL('image/png');
  const dst = document.createElement('canvas');
  dst.width = a.w; dst.height = Math.round(src.height * a.w / src.width);
  const x = dst.getContext('2d')!;
  x.imageSmoothingQuality = 'high';
  x.drawImage(src, 0, 0, dst.width, dst.height);
  return dst.toDataURL('image/png');
}

function drawScaledGrey(a: { t: number; w: number; h: number; sel: string }): number[] {
  (window as any).__seek(a.t);
  const src = document.querySelector(a.sel) as HTMLCanvasElement;
  const dst = document.createElement('canvas');
  dst.width = a.w; dst.height = a.h;
  const x = dst.getContext('2d', { willReadFrequently: true })!;
  x.imageSmoothingQuality = 'high';
  x.drawImage(src, 0, 0, a.w, a.h);
  const d = x.getImageData(0, 0, a.w, a.h).data, out: number[] = new Array(a.w * a.h);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) out[j] = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
  return out;
}
