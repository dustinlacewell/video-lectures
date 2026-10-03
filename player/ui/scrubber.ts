/* The scrub bar: a range input over a chapter-segmented track, with a hover tooltip naming the chapter and time. */

import type { Timeline } from '../../engine/timeline';
import { clock, pointLabel, segmentFill, segments } from './format';

export interface ScrubberEls {
  root: HTMLElement;
  track: HTMLElement;
  input: HTMLInputElement;
  tip: HTMLElement;
}

/** Returns the per-frame update: moves the fill and the thumb to T. */
export function createScrubber(els: ScrubberEls, tl: Timeline, seek: (T: number) => void): (T: number) => void {
  const segs = segments(tl), fills = buildTrack(els.track, segs);
  let dragging = false, lastSecond = -1;
  els.input.min = '0'; els.input.max = tl.total.toFixed(2); els.input.step = '0.1';

  els.input.addEventListener('input', function () { seek(parseFloat(els.input.value)); });
  els.input.addEventListener('pointerdown', function (e) { dragging = true; showTip(e); });
  els.root.addEventListener('pointermove', showTip);
  els.root.addEventListener('pointerleave', function () { if (!dragging) els.tip.hidden = true; });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  return function update(T) {
    const p = T / tl.total;
    fills.forEach(function (f, i) { f.style.transform = 'scaleX(' + segmentFill(segs[i], p) + ')'; });
    if (!dragging) els.input.value = T.toFixed(2);
    const s = Math.floor(T);
    if (s !== lastSecond) { lastSecond = s; els.input.setAttribute('aria-valuetext', clock(T) + ' of ' + clock(tl.total)); }
  };

  function endDrag(e: PointerEvent): void {
    if (!dragging) return;
    dragging = false;
    if (e.pointerType !== 'mouse') els.tip.hidden = true;
  }

  function showTip(e: PointerEvent): void {
    const r = els.track.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const at = pointLabel(tl, f * tl.total);
    els.tip.firstElementChild!.textContent = at.chapter;
    els.tip.lastElementChild!.textContent = at.time;
    els.tip.hidden = false;
    const half = els.tip.offsetWidth / 2, x = e.clientX - els.root.getBoundingClientRect().left;
    els.tip.style.left = Math.min(els.root.clientWidth - half, Math.max(half, x)) + 'px';
  }
}

/** One segment element per chapter, with a gap at each chapter start. Returns the fill elements. */
function buildTrack(track: HTMLElement, segs: { from: number; to: number }[]): HTMLElement[] {
  return segs.map(function (s, i) {
    const seg = document.createElement('div'), fill = document.createElement('div');
    seg.className = 'seg'; fill.className = 'fill';
    seg.style.left = (s.from * 100) + '%';
    seg.style.width = 'calc(' + ((s.to - s.from) * 100) + '% - ' + (i + 1 < segs.length ? 3 : 0) + 'px)';
    seg.appendChild(fill); track.appendChild(seg);
    return fill;
  });
}
