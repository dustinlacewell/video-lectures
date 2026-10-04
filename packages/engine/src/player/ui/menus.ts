/* The contents of the two popover menus: chapters and speed. Each returns a function that marks the current choice. */

import type { TimedChapter } from '@studio/engine/timeline';
import { chapterLabel, clock } from './format';

export const SPEEDS = [1, 1.25, 1.5];

export function speedText(rate: number): string { return rate + '×'; }

/** One row per chapter: label and start time. Click jumps there. */
export function buildChapterMenu(panel: HTMLElement, chapters: TimedChapter[], pick: (ch: TimedChapter) => void): (ci: number) => void {
  const rows = chapters.map(function (ch) {
    const b = item('menuitem');
    b.innerHTML = '<span class="label"></span><span class="at"></span>';
    b.firstElementChild!.textContent = chapterLabel(ch);
    b.lastElementChild!.textContent = clock(ch.start);
    b.addEventListener('click', function () { pick(ch); });
    panel.appendChild(b);
    return b;
  });
  return function (ci) {
    rows.forEach(function (b, i) { b.setAttribute('aria-current', chapters[i].ci === ci ? 'true' : 'false'); });
  };
}

/** One row per speed. Click sets it. */
export function buildSpeedMenu(panel: HTMLElement, pick: (rate: number) => void): (rate: number) => void {
  const rows = SPEEDS.map(function (rate) {
    const b = item('menuitemradio');
    b.textContent = speedText(rate);
    b.addEventListener('click', function () { pick(rate); });
    panel.appendChild(b);
    return b;
  });
  return function (rate) {
    rows.forEach(function (b, i) { b.setAttribute('aria-checked', SPEEDS[i] === rate ? 'true' : 'false'); });
  };
}

function item(role: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button'; b.setAttribute('role', role); b.tabIndex = -1;
  return b;
}
