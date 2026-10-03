/* Pure: one sheet as an HTML page. The shell screenshots it into a PNG. */

import { clock } from '../shared/format.ts';
import type { Sheet } from './plan.ts';

/** A captured frame: its time and a PNG data URL. */
export interface Frame { t: number; src: string }

/** `banner`: a warning line under the title, e.g. that the sheet shows the purpose band. */
export interface SheetLayout { thumbWidth: number; perRow: number; banner?: string }

export function sheetHtml(sheet: Sheet, frames: Frame[][], layout: SheetLayout): string {
  const banner = layout.banner ? '<p class="banner">' + esc(layout.banner) + '</p>' : '';
  const ch = sheet.chapter;
  const title = (ch.index + 1) + '. ' + ch.id + (ch.title ? ' - ' + ch.title : '') + ' (part ' + sheet.part + ')';
  const rows = sheet.beats.map(function (b, i) {
    const head = esc(b.id) + ' <span>' + clock(b.start) + ' to ' + clock(b.start + b.dur) + '</span>';
    const cells = frames[i].map(function (f) { return '<figure><img src="' + f.src + '"><figcaption>' + clock(f.t) + '</figcaption></figure>'; }).join('');
    return '<section><h2>' + head + '</h2><div class="row">' + cells + '</div></section>';
  }).join('');
  return '<!doctype html><html><head><meta charset="utf-8"><style>' + css(layout) + '</style></head><body><h1>' + esc(title) + '</h1>' + banner + rows + '</body></html>';
}

function css(l: SheetLayout): string {
  const gap = 8, width = l.perRow * l.thumbWidth + (l.perRow - 1) * gap;
  return [
    'body{margin:0;padding:16px;background:#111;color:#eee;font:16px/1.3 system-ui,sans-serif;width:' + width + 'px}',
    'h1{font-size:22px;margin:0 0 12px}',
    '.banner{margin:0 0 12px;padding:6px 10px;background:#a00;color:#fff;font-weight:700}',
    'section{margin:0 0 14px}',
    'h2{font-size:18px;margin:0 0 6px;font-weight:600}',
    'h2 span{font-weight:400;color:#aaa;margin-left:10px}',
    '.row{display:grid;grid-template-columns:repeat(' + l.perRow + ',' + l.thumbWidth + 'px);gap:' + gap + 'px}',
    'figure{margin:0}',
    'img{display:block;width:' + l.thumbWidth + 'px;border:1px solid #444}',
    'figcaption{font-size:14px;color:#ccc;margin-top:2px}'
  ].join('');
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
