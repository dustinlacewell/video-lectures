/* Debug globals for tools (exporter, parity check). Shapes match the original single-file player. */

import { mkS } from '../engine/beatState';
import { camAt } from '../engine/camera';
import { chapterAt, type Cue, type Timeline } from '../engine/timeline';
import type { Playback } from './playback';

declare global {
  interface Window {
    /** Jump to T seconds and draw. */
    __seek(T: number): void;
    /** [chapter index, beat key, beat index, cam x, cam y, cam z] at T. */
    __cam(T: number): [number, string, number, number, number, number];
    /** Timing of every chapter and beat. Beat rows: [key, start, dur, global id]. Cues: every sound, sorted by time. */
    __info(): { total: number; chapters: { id: string; start: number; dur: number; beats: [string, number, number, string][] }[]; cues: Cue[] };
  }
}

export function exposeDebug(tl: Timeline, player: Playback): void {
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
}
