/* Wire buttons, the seek bar, the space key, resize and full screen to playback. */

import type { PlayerEls } from './dom';
import type { Playback } from './playback';

export function wireControls(els: PlayerEls, player: Playback): void {
  els.play.addEventListener('click', player.toggle);
  els.stage.addEventListener('click', player.toggle);
  els.seek.addEventListener('input', function () { player.seek(parseFloat(els.seek.value)); });
  els.snd.addEventListener('click', function () {
    const on = player.toggleSound();
    els.snd.textContent = on ? 'Sound on' : 'Sound off'; els.snd.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  els.spd.addEventListener('click', function () { els.spd.textContent = 'Speed ' + player.cycleSpeed() + '×'; });
  els.full.addEventListener('click', function () { toggleFullscreen(els.stage); });
  document.addEventListener('fullscreenchange', function () { setTimeout(player.fit, 60); });
  document.addEventListener('keydown', function (e) {
    const tg = e.target && (e.target as HTMLElement).tagName;
    if (e.code === 'Space' && tg !== 'BUTTON' && tg !== 'INPUT') { e.preventDefault(); player.toggle(); }
  });
  window.addEventListener('resize', player.fit);
}

function toggleFullscreen(stage: HTMLElement): void {
  const p = document.fullscreenElement ? document.exitFullscreen() : (stage.requestFullscreen ? stage.requestFullscreen() : null);
  if (p && p.catch) p.catch(function () {});
}

/** Re-measure text once the display fonts arrive. */
export function onFontsLoaded(fn: () => void): void {
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('600 40px Fredoka'), document.fonts.load('700 40px Fredoka'), document.fonts.load('500 40px Fredoka')])
      .then(fn).catch(function () {});
  }
}
