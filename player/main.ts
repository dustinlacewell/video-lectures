/* Composition root: load voice clip lengths, build the timeline, bind the canvas, wire the page, start the clock. */

import { createVoiceTrack } from '../engine/audio/voice';
import type { ClipLengths } from '../engine/audio/voiceTrack';
import { setContext } from '../engine/canvas';
import { buildTimeline, voiceDurations } from '../engine/timeline';
import { SCENES } from '../scenes';
import { SCRIPT } from '../script';
import { CAST } from '../script/cast';
import { onFontsLoaded, wireControls } from './controls';
import { exposeDebug } from './debug';
import { findElements } from './dom';
import { createPlayback } from './playback';
import { buildChapterChips, buildScriptText } from './scriptText';

/** Voice clips and their lengths are served next to the page (Vite publicDir = voice/clips). */
const clipUrl = (clip: string) => './' + encodeURIComponent(clip) + '.wav';

boot(await loadClipLengths());

function boot(clips: ClipLengths): void {
  const tl = buildTimeline(SCRIPT, voiceDurations(SCRIPT, clips, CAST));
  const els = findElements();
  setContext(els.cv.getContext('2d')!);

  const voice = createVoiceTrack(tl, clips, clipUrl);
  const player = createPlayback(tl, SCENES, els, voice);
  buildChapterChips(tl, els.chips, player.jumpTo);
  buildScriptText(tl, els.script, CAST);
  wireControls(els, player);
  exposeDebug(tl, player, voice);

  player.fit();
  onFontsLoaded(player.fontsLoaded);
  player.start();
}

/** Clip lengths from durations.json, or none: then every beat falls back to its scripted timing. */
async function loadClipLengths(): Promise<ClipLengths> {
  try {
    const r = await fetch('./durations.json');
    return r.ok ? await r.json() as ClipLengths : {};
  } catch {
    return {};
  }
}
