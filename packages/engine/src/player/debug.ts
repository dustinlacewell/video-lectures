/* Debug globals for headless tools (exporter, review screenshots). */

import { auMusic, auPad, duckMusic } from '@studio/engine/audio/music';
import { sfx } from '@studio/engine/audio/sfx';
import { AU, auInit } from '@studio/engine/audio/synth';
import type { VoiceTrack } from '@studio/engine/audio/voice';
import { mkS } from '@studio/engine/beatState';
import { camAt } from '@studio/engine/camera';
import { chapterAt, type Cue, type Timeline } from '@studio/engine/timeline';
import type { Playback } from './playback';

declare global {
  interface Window {
    /** Jump to T seconds and draw. */
    __seek(T: number): void;
    /** [chapter index, beat key, beat index, cam x, cam y, cam z] at T. */
    __cam(T: number): [number, string, number, number, number, number];
    /** Timing of every chapter and beat. Beat rows: [key, start, dur, global id]. Cues: every sound, sorted by time. */
    __info(): { total: number; chapters: { id: string; start: number; dur: number; beats: [string, number, number, string][] }[]; cues: Cue[] };
    /** Voice clips playing now: clip id, seconds into the clip, paused. */
    __voice(): { id: string; offset: number; paused: boolean }[];
    /** The clock T in seconds. */
    __t(): number;
    /** The synth the player drives, for an offline render. `init` builds the graph on `new AudioContext()`;
        the others are what playback calls: `music(T)` per frame, `pad(on)` on play, `duck(under)` while a voice clip sounds. */
    __synth(): { init(): void; ctx(): BaseAudioContext | null; music(T: number): void; pad(on: boolean): void; duck(under: boolean): void; sfx(type: Cue['type'], arg?: number): void };
  }
}

export function exposeDebug(tl: Timeline, player: Playback, voice: VoiceTrack): void {
  window.__voice = voice.now;
  window.__t = player.time;
  window.__seek = function (v) { player.seek(v); };
  window.__cam = function (v) {
    const ch = chapterAt(tl, v), S = mkS(ch, v - ch.start), cm = camAt(ch, S);
    return [ch.ci, S.b.key, S.bi, cm.x, cm.y, cm.z];
  };
  window.__info = function () {
    return {
      total: tl.total,
      chapters: tl.chapters.map(function (ch) {
        return { id: ch.id, start: ch.start, dur: ch.dur, beats: ch.beats.map(function (b): [string, number, number, string] { return [b.key, b.start, b.dur, b.id]; }) };
      }),
      cues: tl.cues
    };
  };
  window.__synth = function () {
    return {
      init: auInit, ctx: function () { return AU.ctx; }, pad: auPad, duck: duckMusic, sfx: sfx,
      music: function (T) { auMusic(T, chapterAt(tl, T)); }
    };
  };
}
