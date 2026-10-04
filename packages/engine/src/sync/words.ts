/* Pure: where a named word falls in a beat's voice, in seconds from the beat start. */

import type { ClipLengths } from '../audio/voiceTrack';
import { lineOf, spokenText, voiceLines, type VoiceLine } from '../audio/voiceLines';
import type { BeatScript } from '../script';
import { speechSeconds } from '../speech/speechTiming';

/** Per clip: [start, end] seconds of each token of the clip's spoken text split on whitespace. voice/clips/words.json. */
export type ClipWords = Record<string, { stamp: string; t: [number, number][] }>;

/** What the voice pipeline measured. Either part may be empty; timing then falls back to estimates. */
export interface VoiceMedia { lengths: ClipLengths; words: ClipWords }

export const NO_MEDIA: VoiceMedia = { lengths: {}, words: {} };

/** A word, or a run of words, in a beat's line, named by its text. */
export interface WordRef {
  word: string;
  /** Which occurrence in the line, from 1. Default 1. */
  nth?: number;
  /** Whose clip times it, with that speaker's stagger. Default: the first speaker. */
  speaker?: string;
  /** The start of the first word or the end of the last. Default start. */
  edge?: 'start' | 'end';
}

/** Seconds from the beat start at which `ref` is heard. Throws, naming the beat and the word, when the line lacks it. */
export function wordTime(b: BeatScript, ref: WordRef, media: VoiceMedia): number {
  const text = spokenText(lineOf(b) ?? ''), tokens = tokensOf(text);
  const span = findWord(b.id, tokens, ref), line = lineFor(b, ref.speaker);
  const times = tokenTimes(tokens, media.words[line.clip], media.lengths[line.clip] || speechSeconds(text));
  return line.at + (ref.edge === 'end' ? times[span[1]][1] : times[span[0]][0]);
}

/** The tokens words.json times: the spoken text split on whitespace. */
export function tokensOf(text: string): string[] {
  const t = text.trim();
  return t ? t.split(/\s+/) : [];
}

/** Lower case, curly apostrophes made straight, punctuation and quotes stripped from both ends. */
export function normalWord(token: string): string {
  return token.toLowerCase().replace(/[‘’]/g, "'").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

/** [first, last] token index of the nth run of tokens that reads `ref.word`. */
export function findWord(beatId: string, tokens: string[], ref: WordRef): [number, number] {
  const want = tokensOf(ref.word).map(normalWord), have = tokens.map(normalWord), nth = ref.nth ?? 1;
  let seen = 0;
  for (let i = 0; want.length && i + want.length <= have.length; i++) {
    if (want.every(function (w, k) { return have[i + k] === w; }) && ++seen === nth) return [i, i + want.length - 1];
  }
  throw new Error('beat "' + beatId + '": no word "' + ref.word + '"' + (nth > 1 ? ' (occurrence ' + nth + ')' : '') + ' in its line "' + tokens.join(' ') + '"');
}

function lineFor(b: BeatScript, speaker: string | undefined): VoiceLine {
  const lines = voiceLines(b), line = speaker ? lines.find(function (l) { return l.speaker === speaker; }) : lines[0];
  if (!line) throw new Error('beat "' + b.id + '": no line spoken by "' + (speaker ?? 'anyone') + '"');
  return line;
}

/** Measured times when they fit the line, else the estimate. A clip voiced from older text does not fit. */
function tokenTimes(tokens: string[], measured: ClipWords[string] | undefined, length: number): [number, number][] {
  return measured && measured.t.length === tokens.length ? measured.t : estimatedTimes(tokens, length);
}

/** Each token takes a share of `length` by its letters; trailing .,:;!? each add a pause worth 3 letters after it. */
export function estimatedTimes(tokens: string[], length: number): [number, number][] {
  const letters = tokens.map(function (w) { return Math.max(1, normalWord(w).length); });
  const pauses = tokens.map(function (w) { return 3 * ((/[.,:;!?]+["”’']*$/.exec(w) || [''])[0].replace(/["”’']/g, '').length); });
  const total = letters.reduce(function (s, n, i) { return s + n + pauses[i]; }, 0);
  let before = 0;
  return tokens.map(function (_, i) {
    const t: [number, number] = [length * before / total, length * (before + letters[i]) / total];
    before += letters[i] + pauses[i];
    return t;
  });
}
