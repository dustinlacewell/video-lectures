/* The control bar: wires each control to playback and returns the per-frame update that redraws them. */

import type { Timeline } from '@studio/engine/timeline';
import type { PlayerEls } from '../dom';
import type { Playback, PlayState } from '../playback';
import { clock, menuChapters } from './format';
import { canFullscreen, isFullscreen, toggleFullscreen } from './fullscreen';
import { icon, type IconName } from './icons';
import { buildChapterMenu, buildSpeedMenu, speedText } from './menus';
import { createPopover } from './popover';
import { createScrubber } from './scrubber';

export function createControlBar(els: PlayerEls, tl: Timeline, player: Playback): (s: PlayState) => void {
  const scrub = createScrubber({ root: els.scrub, track: els.track, input: els.seek, tip: els.tip }, tl, player.seek);
  const menus = wireMenus(els, tl, player);
  wireButtons(els, player);
  els.total.textContent = clock(tl.total);
  els.bigPlay.innerHTML = icon('play');

  let last = { playing: null as boolean | null, sound: null as boolean | null, second: -1, chapter: -1, rate: 0 };
  return function update(s) {
    scrub(s.T);
    if (s.playing !== last.playing) setIcon(els.play, s.playing ? 'pause' : 'play', s.playing ? 'Pause (k)' : 'Play (k)');
    if (s.soundOn !== last.sound) setIcon(els.snd, s.soundOn ? 'soundOn' : 'soundOff', s.soundOn ? 'Mute (m)' : 'Unmute (m)');
    if (Math.floor(s.T) !== last.second) els.cur.textContent = clock(s.T);
    if (s.chapter !== last.chapter) menus.chapter(s.chapter);
    if (s.rate !== last.rate) { els.spd.textContent = speedText(s.rate); els.spd.setAttribute('aria-label', 'Playback speed ' + speedText(s.rate)); menus.speed(s.rate); }
    els.bigPlay.hidden = s.playing || (s.T > 0.05 && s.T < s.total - 0.05);
    els.player.classList.toggle('paused', !s.playing);
    last = { playing: s.playing, sound: s.soundOn, second: Math.floor(s.T), chapter: s.chapter, rate: s.rate };
  };
}

function wireButtons(els: PlayerEls, player: Playback): void {
  els.play.addEventListener('click', player.toggle);
  els.stage.addEventListener('click', player.toggle);
  els.snd.addEventListener('click', player.toggleSound);
  els.full.hidden = !canFullscreen();
  els.full.addEventListener('click', function () { toggleFullscreen(els.player); });
  showFullscreenState(els.full);
  document.addEventListener('fullscreenchange', function () { showFullscreenState(els.full); });
}

function wireMenus(els: PlayerEls, tl: Timeline, player: Playback): { chapter: (ci: number) => void; speed: (rate: number) => void } {
  const chapPop = createPopover(els.chap, els.chapMenu, function () { spdPop.close(); });
  const spdPop = createPopover(els.spd, els.spdMenu, function () { chapPop.close(); });
  setIcon(els.chap, 'chapters', 'Chapters');
  return {
    chapter: buildChapterMenu(els.chapMenu, menuChapters(tl), function (ch) { player.jumpTo(ch); chapPop.close(); }),
    speed: buildSpeedMenu(els.spdMenu, function (rate) { player.setSpeed(rate); spdPop.close(); })
  };
}

function showFullscreenState(b: HTMLButtonElement): void {
  const on = isFullscreen();
  setIcon(b, on ? 'fullOff' : 'fullOn', on ? 'Exit full screen (f)' : 'Full screen (f)');
}

function setIcon(b: HTMLButtonElement, name: IconName, label: string): void {
  b.innerHTML = icon(name);
  b.setAttribute('aria-label', label);
  b.title = label;
}
