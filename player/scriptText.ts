/* Chapter chips and the full script under the player. Title chapter (index 0) gets neither. */

import type { TimedChapter, Timeline } from '../engine/timeline';

export function buildChapterChips(tl: Timeline, chips: HTMLElement, jump: (ch: TimedChapter) => void): void {
  tl.chapters.forEach(function (ch, i) {
    if (!i) return;
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = i + ' ' + ch.short; b.setAttribute('aria-label', 'Chapter ' + i + ': ' + ch.title);
    b.addEventListener('click', function () { jump(ch); });
    chips.appendChild(b);
  });
}

export function buildScriptText(tl: Timeline, script: HTMLElement): void {
  tl.chapters.forEach(function (ch, i) {
    if (!i) return;
    const d = document.createElement('div'); d.className = 'scene';
    const h = document.createElement('h3'); h.textContent = i + ' · ' + ch.title; d.appendChild(h);
    const p = document.createElement('p');
    p.textContent = chapterText(ch);
    d.appendChild(p); script.appendChild(d);
  });
}

/** Every caption and card in the chapter, in order, as one paragraph. */
export function chapterText(ch: TimedChapter): string {
  return ch.beats.filter(function (q) { return q.say || q.card; }).map(function (q) { return q.say || q.card; }).join(' ');
}

/** Mark the chip of the current chapter. */
export function markChip(chips: HTMLElement, ci: number): void {
  Array.prototype.forEach.call(chips.children, function (b: Element, j: number) { b.setAttribute('aria-current', j + 1 === ci ? 'true' : 'false'); });
}
