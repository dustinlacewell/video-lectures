/* Pure: join the page timeline (__info) with the script into one flat list of timed beats. */

import type { Info, ScriptBeat, ScriptChapter } from './contract.ts';

/** narration: the narrator speaks. character: one other speaker. chorus: several speak together.
    card: full-screen card text (read aloud by the narrator). title: chapter title card. visual: no words. */
export type BeatKind = 'narration' | 'character' | 'chorus' | 'card' | 'title' | 'visual';

/** One voice clip of a beat, `at` seconds after the beat starts. */
export interface ClipLine { clip: string; speaker: string; at: number }

export interface Beat {
  id: string;
  chapter: string;
  /** Position of the chapter in play order. */
  chapterIndex: number;
  /** Seconds from video start. */
  start: number;
  dur: number;
  kind: BeatKind;
  /** Spoken or shown words: `say`, else `card`, else the chapter title for a title beat. */
  text?: string;
  speakers: string[];
  words: number;
  /** The script's explicit minimum duration, if any. */
  explicitDur?: number;
  /** Voice clips this beat should play, by the contract's naming rule. */
  lines: ClipLine[];
}

export interface Chapter { id: string; index: number; title?: string; start: number; dur: number }

/** Contract defaults (engine/audio/voiceLines.ts in the reference project). */
export const DEFAULT_SPEAKER = 'narrator';
export const DEFAULT_STAGGER = 0.15;
const TITLE_KEY = '_title';

export function chaptersOf(info: Info, script: ScriptChapter[]): Chapter[] {
  const titles = new Map(script.map(function (c) { return [c.id, c.title]; }));
  return info.chapters.map(function (c, i) { return { id: c.id, index: i, title: titles.get(c.id), start: c.start, dur: c.dur }; });
}

export function timedBeats(info: Info, script: ScriptChapter[]): Beat[] {
  const byId = new Map<string, ScriptBeat>();
  script.forEach(function (c) { c.beats.forEach(function (b) { byId.set(b.id, b); }); });
  const titles = new Map(script.map(function (c) { return [c.id, c.title]; }));
  return info.chapters.flatMap(function (c, ci) {
    return c.beats.map(function (row): Beat {
      const [key, start, dur, id] = row, sb = byId.get(id);
      const base = { id: id, chapter: c.id, chapterIndex: ci, start: c.start + start, dur: dur };
      if (sb) return { ...base, ...describe(sb) };
      if (key === TITLE_KEY) return { ...base, kind: 'title', text: titles.get(c.id), speakers: [], words: 0, lines: [] };
      return { ...base, kind: 'visual', speakers: [], words: 0, lines: [] };
    });
  });
}

function describe(b: ScriptBeat): Pick<Beat, 'kind' | 'text' | 'speakers' | 'words' | 'explicitDur' | 'lines'> {
  const text = b.say ?? b.card;
  const speakers = text === undefined ? [] : speakersOf(b);
  return { kind: kindOf(b, speakers), text: text, speakers: speakers, words: wordCount(text), explicitDur: b.dur, lines: clipLines(b, speakers) };
}

export function speakersOf(b: ScriptBeat): string[] {
  if (!b.speaker) return [DEFAULT_SPEAKER];
  return Array.isArray(b.speaker) ? b.speaker : [b.speaker];
}

function kindOf(b: ScriptBeat, speakers: string[]): BeatKind {
  if (b.say === undefined) return b.card === undefined ? 'visual' : 'card';
  if (speakers.length > 1) return 'chorus';
  return speakers[0] === DEFAULT_SPEAKER ? 'narration' : 'character';
}

/** One clip per speaker: "<beatId>" alone, "<beatId>.<speaker>" when several speak; speaker k starts k * stagger in. */
export function clipLines(b: ScriptBeat, speakers: string[]): ClipLine[] {
  if (b.say === undefined && b.card === undefined) return [];
  const several = speakers.length > 1, stagger = b.stagger ?? DEFAULT_STAGGER;
  return speakers.map(function (s, k) { return { clip: several ? b.id + '.' + s : b.id, speaker: s, at: k * stagger }; });
}

export function wordCount(text: string | undefined): number {
  if (!text) return 0;
  return text.replace(/\*/g, '').split(/\s+/).filter(function (w) { return /[\p{L}\p{N}]/u.test(w); }).length;
}

/** Keep only the named chapters and their beats. No names keeps all. Unknown names throw. */
export function onlyChapters(chapters: Chapter[], beats: Beat[], ids: string[]): { chapters: Chapter[]; beats: Beat[] } {
  if (!ids.length) return { chapters: chapters, beats: beats };
  const known = new Set(chapters.map(function (c) { return c.id; }));
  ids.forEach(function (id) { if (!known.has(id)) throw new Error('no chapter "' + id + '"; chapters: ' + Array.from(known).join(', ')); });
  const keep = new Set(ids);
  return { chapters: chapters.filter(function (c) { return keep.has(c.id); }), beats: beats.filter(function (b) { return keep.has(b.chapter); }) };
}

/** The beat playing at T (seconds from video start). Beats must be in time order. */
export function beatAt(beats: Beat[], T: number): Beat | undefined {
  let r: Beat | undefined;
  for (const b of beats) { if (b.start <= T) r = b; else break; }
  return r;
}
