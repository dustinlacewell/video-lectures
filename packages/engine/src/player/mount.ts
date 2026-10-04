/* Composition root: load the measured voice, build the timeline, bind the canvas, wire the page, start the clock. */

import { createVoiceTrack } from '../audio/voice';
import { setContext } from '../canvas';
import type { SceneMap } from '../render';
import { timelineOf } from '../sync/timelineOf';
import type { VoiceMedia } from '../sync/words';
import type { VideoData } from '../video';
import { exposeDebug } from './debug';
import { buildPlayer } from './dom';
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

/** Build the player inside `el` and start it on `video`, drawn by `scenes`. */
export async function mountPlayer(video: VideoData, scenes: SceneMap, el: HTMLElement): Promise<void> {
  boot(video, scenes, el, { lengths: await loadClipJson('durations.json'), words: await loadClipJson('words.json') });
}

function boot(video: VideoData, scenes: SceneMap, el: HTMLElement, media: VoiceMedia): void {
  const tl = timelineOf(video, media);
  const els = buildPlayer(el);
  setContext(els.cv.getContext('2d')!);

  const voice = createVoiceTrack(tl, media.lengths, clipUrl);
  const player = createPlayback(tl, scenes, els.cv, voice);
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

/** durations.json (clip lengths) or words.json (word times), or nothing: then timing falls back to estimates. */
async function loadClipJson<T extends object>(name: string): Promise<T> {
  try {
    const r = await fetch(BASE + name);
    return r.ok ? await r.json() as T : {} as T;
  } catch {
    return {} as T;
  }
}
