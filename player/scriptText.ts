/* Chapter chips and the full script under the player. Title chapter (index 0) gets neither. */

import { spokenText } from '../engine/audio/voiceLines';
import type { TimedBeat, TimedChapter, Timeline } from '../engine/timeline';
import type { Cast } from '../script/types';

export function buildChapterChips(tl: Timeline, chips: HTMLElement, jump: (ch: TimedChapter) => void): void {
  tl.chapters.forEach(function (ch, i) {
    if (!i) return;
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = i + ' ' + ch.short; b.setAttribute('aria-label', 'Chapter ' + i + ': ' + ch.title);
    b.addEventListener('click', function () { jump(ch); });
    chips.appendChild(b);
  });
}

export function buildScriptText(tl: Timeline, script: HTMLElement, cast: Cast): void {
  tl.chapters.forEach(function (ch, i) {
    if (!i) return;
    const d = document.createElement('div'); d.className = 'scene';
    const h = document.createElement('h3'); h.textContent = i + ' · ' + ch.title; d.appendChild(h);
    const p = document.createElement('p');
    p.textContent = chapterText(ch, cast);
    d.appendChild(p); script.appendChild(d);
  });
}

/** Every line and card in the chapter, in order, as one paragraph. Character lines read `Speaker: "line"`. */
export function chapterText(ch: TimedChapter, cast: Cast): string {
  return ch.beats.filter(function (q) { return q.say || q.card; }).map(function (q) { return lineText(q, cast); }).join(' ');
}

function lineText(b: TimedBeat, cast: Cast): string {
  if (!b.say || b.caption) return (b.say || b.card)!;
  const who = b.speakers.map(function (s) { return cast[s].name; }).join(' & ');
  return who + ': “' + spokenText(b.say) + '”';
}

/** Mark the chip of the current chapter. */
export function markChip(chips: HTMLElement, ci: number): void {
  Array.prototype.forEach.call(chips.children, function (b: Element, j: number) { b.setAttribute('aria-current', j + 1 === ci ? 'true' : 'false'); });
}
