/* Composition root: load voice clip lengths, build the timeline, bind the canvas, wire the page, start the clock. */

import { createVoiceTrack } from '../engine/audio/voice';
import type { ClipLengths } from '../engine/audio/voiceTrack';
import { setContext } from '../engine/canvas';
import { buildTimeline, voiceDurations } from '../engine/timeline';
import { SCENES } from '../scenes';
import { SCRIPT } from '../script';
import { CAST } from '../script/cast';
import { exposeDebug } from './debug';
import { findElements } from './dom';
import { onFontsLoaded } from './fonts';
import { createPlayback, type Playback } from './playback';
import { createAutoHide } from './ui/autoHide';
import { createControlBar } from './ui/controlBar';
import { toggleFullscreen } from './ui/fullscreen';
import { bindKeyboard } from './ui/keyboard';
import type { KeyAction } from './ui/keymap';

/** Voice clips and their lengths are served at the base path (Vite publicDir = voice/clips). */
const BASE = import.meta.env.BASE_URL;
const clipUrl = (clip: string) => BASE + encodeURIComponent(clip) + '.wav';

boot(await loadClipLengths());

function boot(clips: ClipLengths): void {
  const tl = buildTimeline(SCRIPT, voiceDurations(SCRIPT, clips, CAST));
  const els = findElements();
  setContext(els.cv.getContext('2d')!);

  const voice = createVoiceTrack(tl, clips, clipUrl);
  const player = createPlayback(tl, SCENES, els.cv, voice);
  const updateBar = createControlBar(els, tl, player);
  const autoHide = createAutoHide(els.player);
  player.onFrame(function (s) { updateBar(s); autoHide.setPlaying(s.playing); });
  bindKeyboard(function (a) { runKey(a, player, tl.total, els.player); });
  exposeDebug(tl, player, voice);

  new ResizeObserver(player.fit).observe(els.cv);
  onFontsLoaded(player.fontsLoaded);
  player.start();
}

function runKey(a: KeyAction, player: Playback, total: number, box: HTMLElement): void {
  switch (a.kind) {
    case 'toggle': player.toggle(); break;
    case 'seekBy': player.seek(Math.min(total, Math.max(0, player.time() + a.by))); break;
    case 'seekTo': player.seek(a.to === 'start' ? 0 : total); break;
    case 'mute': player.toggleSound(); break;
    case 'fullscreen': toggleFullscreen(box); break;
  }
}

/** Clip lengths from durations.json, or none: then every beat falls back to its scripted timing. */
async function loadClipLengths(): Promise<ClipLengths> {
  try {
    const r = await fetch(BASE + 'durations.json');
    return r.ok ? await r.json() as ClipLengths : {};
  } catch {
    return {};
  }
}
