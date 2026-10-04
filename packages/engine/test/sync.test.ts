import { describe, expect, it } from 'vitest';
import { spokenText } from '../src/audio/voiceLines';
import { mkS } from '../src/beatState';
import type { ChapterScript } from '../src/script';
import { speechSeconds } from '../src/speech/speechTiming';
import { after, at, atEnd, resolveActions, type BeatActions, type VideoActions } from '../src/sync/actions';
import { ACTION_HOLD, PAYOFF_HOLD } from '../src/sync/beatLength';
import { timelineOf } from '../src/sync/timelineOf';
import { NO_MEDIA, estimatedTimes, normalWord, tokensOf, wordTime, type VoiceMedia } from '../src/sync/words';
import { FADE_OUT, buildTimeline, voiceDurations, type TimedChapter } from '../src/timeline';
import { CAST } from './fixtures';

/** Two untitled chapters: a narrator line, a two-speaker line with repeated words, a chapter end, and the video end. */
const SCRIPT: ChapterScript[] = [
  {
    id: 'a', short: 'A', root: 200, scale: [0], beats: [
      { id: 'a.try', say: 'Could it fall? Let’s try a ghost.' },
      { id: 'a.duet', say: '“A ghost, and a ghost again.”', speaker: ['you', 'zombie'], stagger: 0.2 },
      { id: 'a.end', say: 'The end.' }
    ]
  },
  { id: 'b', short: 'B', root: 200, scale: [0], beats: [{ id: 'b.last', say: 'Goodbye now.' }] }
];

const MEDIA: VoiceMedia = {
  lengths: { 'a.try': 2.8, 'a.duet.you': 2.0, 'a.duet.zombie': 2.1, 'a.end': 1.0, 'b.last': 1.2 },
  words: {
    'a.try': { stamp: 's', t: [[0, 0.3], [0.3, 0.45], [0.45, 0.9], [1.4, 1.7], [1.7, 1.95], [1.95, 2.05], [2.05, 2.6]] },
    'a.duet.you': { stamp: 's', t: [[0, 0.1], [0.1, 0.5], [0.6, 0.8], [0.8, 0.9], [0.9, 1.3], [1.3, 1.8]] },
    'a.duet.zombie': { stamp: 's', t: [[0, 0.2], [0.2, 0.6], [0.7, 0.9], [0.9, 1.0], [1.0, 1.4], [1.4, 2.0]] }
  }
};

const [TRY, DUET, END] = SCRIPT[0].beats;
const video = (actions?: VideoActions) => ({ script: SCRIPT, cast: CAST, actions: actions });
const beat = (ch: TimedChapter, key: string) => ch.beats[ch.idx[key]];

describe('word times', () => {
  it('normalizes case, curly apostrophes, quotes and punctuation', () => {
    expect(['ghost.', 'Let’s', '“Hello,”', 'non-physical?'].map(normalWord)).toEqual(['ghost', "let's", 'hello', 'non-physical']);
  });

  it('reads a word start, its end, and a phrase from words.json', () => {
    expect(wordTime(TRY, { word: 'ghost' }, MEDIA)).toBe(2.05);
    expect(wordTime(TRY, { word: 'ghost', edge: 'end' }, MEDIA)).toBe(2.6);
    expect(wordTime(TRY, { word: "let's" }, MEDIA)).toBe(1.4);
    expect(wordTime(TRY, { word: 'try a ghost' }, MEDIA)).toBe(1.7);
    expect(wordTime(TRY, { word: 'try a ghost', edge: 'end' }, MEDIA)).toBe(2.6);
  });

  it('picks the nth occurrence', () => {
    expect(wordTime(DUET, { word: 'ghost' }, MEDIA)).toBe(0.1);
    expect(wordTime(DUET, { word: 'ghost', nth: 2 }, MEDIA)).toBe(0.9);
    expect(wordTime(DUET, { word: 'a', nth: 2 }, MEDIA)).toBe(0.8);
  });

  it('times a second speaker in its own clip, after its stagger', () => {
    expect(wordTime(DUET, { word: 'ghost', nth: 2, speaker: 'zombie' }, MEDIA)).toBeCloseTo(0.2 + 1.0, 12);
    expect(() => wordTime(DUET, { word: 'ghost', speaker: 'friend' }, MEDIA)).toThrow('no line spoken by "friend"');
  });

  it('fails loudly, naming beat and word, when the line lacks the word', () => {
    expect(() => wordTime(TRY, { word: 'spirit' }, MEDIA)).toThrow('beat "a.try": no word "spirit"');
    expect(() => wordTime(DUET, { word: 'ghost', nth: 3 }, MEDIA)).toThrow('beat "a.duet": no word "ghost" (occurrence 3)');
    expect(() => wordTime(TRY, { word: 'try ghost' }, MEDIA)).toThrow('no word "try ghost"');
  });

  it('without words.json, places words by letters over the clip length', () => {
    const tokens = tokensOf(spokenText(TRY.say!)), est = estimatedTimes(tokens, 2.8);
    expect(est[0][0]).toBe(0);
    est.slice(1).forEach((w, i) => expect(w[0]).toBeGreaterThan(est[i][0]));
    est.forEach(w => { expect(w[1]).toBeGreaterThan(w[0]); expect(w[1]).toBeLessThanOrEqual(2.8); });
    expect(wordTime(TRY, { word: 'ghost' }, { lengths: MEDIA.lengths, words: {} })).toBe(est[6][0]);
  });

  it('without any voice, places words over the speech estimate', () => {
    const text = spokenText(TRY.say!), est = estimatedTimes(tokensOf(text), speechSeconds(text));
    expect(wordTime(TRY, { word: 'ghost' }, NO_MEDIA)).toBe(est[6][0]);
  });

  it('ignores word times that do not fit the line (a clip voiced from older text)', () => {
    const stale = { lengths: MEDIA.lengths, words: { 'a.try': { stamp: 's', t: [[0, 1], [1, 2]] as [number, number][] } } };
    expect(wordTime(TRY, { word: 'ghost' }, stale)).toBe(estimatedTimes(tokensOf(spokenText(TRY.say!)), 2.8)[6][0]);
  });
});

describe('resolveActions', () => {
  const r9 = (x: number) => Math.round(x * 1e9) / 1e9;
  const place = (actions: BeatActions, b = TRY) => Object.fromEntries(resolveActions(b, actions, MEDIA).map(r => [r.name, [r9(r.t0), r9(r.t1)]]));

  it('starts at seconds, at words, after and with other actions', () => {
    expect(place({
      fixed: { at: 0.5, dur: 1 },
      enter: { at: at({ word: 'ghost' }, -0.4), dur: 1.2 },
      pass: { at: after('enter', 0.1), dur: 0.8 },
      fail: { at: { with: 'pass', shift: 0.3 }, dur: 0.4 },
      tail: { at: atEnd({ word: 'fall' }), dur: 0 }
    })).toEqual({ fixed: [0.5, 1.5], enter: [1.65, 2.85], pass: [2.95, 3.75], fail: [3.25, 3.65], tail: [0.9, 0.9] });
  });

  it('resolves a chain declared out of order', () => {
    expect(place({ second: { at: after('first'), dur: 1 }, first: { at: 1, dur: 1 } })).toEqual({ second: [2, 3], first: [1, 2] });
  });

  it('clamps a start before the beat to 0', () => {
    expect(place({ early: { at: at({ word: 'could' }, -1), dur: 1 } })).toEqual({ early: [0, 1] });
  });

  it('throws on a cycle, an unknown action, a missing word, or a negative dur', () => {
    expect(() => place({ p: { at: after('q'), dur: 1 }, q: { at: after('p'), dur: 1 } })).toThrow('beat "a.try": actions wait on each other: p -> q -> p');
    expect(() => place({ p: { at: after('nope'), dur: 1 } })).toThrow('beat "a.try": no action "nope"');
    expect(() => place({ p: { at: at({ word: 'spirit' }), dur: 1 } })).toThrow('beat "a.try": no word "spirit"');
    expect(() => place({ p: { at: 0, dur: -1 } })).toThrow('needs a dur');
  });
});

describe('timelineOf: the beat length rule', () => {
  const voiceOnly = timelineOf(video(), MEDIA);
  const tryLen = (actions: BeatActions) => beat(timelineOf(video({ a: { try: actions } }), MEDIA).chapters[0], 'try').dur;

  it('with no actions, is the voice-only timeline', () => {
    expect(voiceOnly).toEqual(buildTimeline(SCRIPT, voiceDurations(SCRIPT, MEDIA.lengths, CAST), CAST));
    expect(timelineOf(video({}), MEDIA)).toEqual(voiceOnly);
    expect(beat(voiceOnly.chapters[0], 'try').dur).toBeCloseTo(2.8 + 0.6, 12);
  });

  it('keeps the voice length when actions end early enough', () => {
    expect(tryLen({ x: { at: 0, dur: 1 } })).toBeCloseTo(3.4, 12);
    expect(tryLen({ x: { at: at({ word: 'ghost' }), dur: 1, hold: 0 } })).toBeCloseTo(3.4, 12);
  });

  it('holds ACTION_HOLD after an action, PAYOFF_HOLD after a payoff, or the action hold', () => {
    expect(tryLen({ x: { at: at({ word: 'ghost' }), dur: 1 } })).toBeCloseTo(3.05 + ACTION_HOLD, 12);
    expect(tryLen({ x: { at: at({ word: 'ghost' }), dur: 1, payoff: true } })).toBeCloseTo(3.05 + PAYOFF_HOLD, 12);
    expect(tryLen({ x: { at: at({ word: 'ghost' }), dur: 1, payoff: true, hold: 2 } })).toBeCloseTo(5.05, 12);
  });

  it("ignores an action with hold 'none'", () => {
    expect(tryLen({ x: { at: 1, dur: 9, hold: 'none' } })).toBeCloseTo(3.4, 12);
  });

  it('keeps an explicit dur as a floor', () => {
    const script = [{ ...SCRIPT[0], beats: [{ ...TRY, dur: 6 }, DUET, END] }, SCRIPT[1]];
    const tl = timelineOf({ script, cast: CAST, actions: { a: { try: { x: { at: 1, dur: 1 } } } } }, MEDIA);
    expect(beat(tl.chapters[0], 'try').dur).toBe(6);
  });

  it('extends an unvoiced beat past its word estimate', () => {
    const est = beat(timelineOf(video(), NO_MEDIA).chapters[0], 'try').dur;
    const tl = timelineOf(video({ a: { try: { x: { at: est, dur: 1 } } } }), NO_MEDIA);
    expect(beat(tl.chapters[0], 'try').dur).toBeCloseTo(est + 1 + ACTION_HOLD, 12);
  });

  it('adds the fade-out to a chapter-ending beat, not to the video end', () => {
    const tl = timelineOf(video({ a: { end: { x: { at: 0, dur: 2 } } }, b: { last: { y: { at: 0, dur: 2 } } } }), MEDIA);
    expect(beat(tl.chapters[0], 'end').dur).toBeCloseTo(2 + ACTION_HOLD + FADE_OUT, 12);
    expect(beat(tl.chapters[1], 'last').dur).toBeCloseTo(2 + ACTION_HOLD, 12);
  });

  it('moves later beats and chapters by the growth', () => {
    const tl = timelineOf(video({ a: { try: { x: { at: at({ word: 'ghost' }), dur: 1 } } } }), MEDIA);
    const grow = 3.05 + ACTION_HOLD - 3.4;
    expect(beat(tl.chapters[0], 'duet').start).toBeCloseTo(beat(voiceOnly.chapters[0], 'duet').start + grow, 12);
    expect(tl.chapters[1].start).toBeCloseTo(voiceOnly.chapters[1].start + grow, 12);
    expect(tl.total).toBeCloseTo(voiceOnly.total + grow, 12);
  });
});

describe('timelineOf: actions in the chapter', () => {
  const sfxActions: VideoActions = {
    a: {
      try: { enter: { at: at({ word: 'ghost' }, -0.4), dur: 1, ease: 'linear' } },
      end: { boom: { at: 0.2, dur: 0.5, sfx: [['start', 'whoosh'], ['end', 'fail'], [0.25, 'blip', 2]] } }
    }
  };

  it('places each action at chapter time with its beat and curve', () => {
    const ch = timelineOf(video(sfxActions), MEDIA).chapters[0];
    expect(ch.acts.enter).toEqual({ beat: 'try', start: 1.65, dur: 1, ease: 'linear' });
    expect(ch.acts.boom.beat).toBe('end');
    expect(ch.acts.boom.start).toBeCloseTo(beat(ch, 'end').start + 0.2, 12);
    expect(ch.acts.boom.ease).toBe('ease');
  });

  it('turns action sounds into cues at absolute time that move with earlier beats', () => {
    const cuesOf = (actions: VideoActions) => {
      const tl = timelineOf(video(actions), MEDIA), end = tl.chapters[0].start + beat(tl.chapters[0], 'end').start;
      return { end: end, cues: tl.cues.filter(q => q.t >= end) };
    };
    const base = cuesOf(sfxActions);
    expect(base.cues.map(q => [q.t - base.end, q.type, q.arg])).toEqual([[0.2, 'whoosh', undefined], [0.45, 'blip', 2], [0.7, 'fail', undefined]].map(([t, ...r]) => [expect.closeTo(t as number, 12), ...r]));
    const grown = cuesOf({ a: { ...sfxActions.a, try: { enter: { at: at({ word: 'ghost' }), dur: 3 } } } });
    expect(grown.cues.map(q => q.t)).toEqual(base.cues.map(q => expect.closeTo(q.t + grown.end - base.end, 12)));
    expect(grown.end).toBeGreaterThan(base.end);
  });

  it('throws on an unknown chapter or beat, a name used twice, or a missing word', () => {
    expect(() => timelineOf(video({ zz: {} }), MEDIA)).toThrow('actions for unknown chapter "zz"');
    expect(() => timelineOf(video({ a: { nope: {} } }), MEDIA)).toThrow('chapter "a": actions for unknown beat "nope"');
    expect(() => timelineOf(video({ a: { try: { x: { at: 0, dur: 1 } }, end: { x: { at: 0, dur: 1 } } } }), MEDIA)).toThrow('action "x" is in beats "try" and "end"');
    expect(() => timelineOf(video({ a: { duet: { x: { at: at({ word: 'spirit' }), dur: 1 } } } }), MEDIA)).toThrow('beat "a.duet": no word "spirit"');
  });
});

describe('BeatState: act, sinceAct, actT', () => {
  const ch = timelineOf(video({
    a: {
      try: { lin: { at: 1, dur: 2, ease: 'linear' }, smooth: { at: 1, dur: 2 }, snap: { at: 1.5, dur: 0 } },
      duet: { later: { at: 0.5, dur: 1, hold: 'none' } }
    }
  }), MEDIA).chapters[0];

  it('is 0 before, follows its curve, and is 1 after', () => {
    expect(mkS(ch, 0.5).act('lin')).toBe(0);
    expect(mkS(ch, 1.5).act('lin')).toBeCloseTo(0.25, 12);
    expect(mkS(ch, 2).act('smooth')).toBeCloseTo(0.5, 12);
    expect(mkS(ch, 1.6).act('smooth')).toBeLessThan(mkS(ch, 1.6).act('lin'));
    expect(mkS(ch, 3.5).act('lin')).toBe(1);
    expect([mkS(ch, 1.49).act('snap'), mkS(ch, 1.5).act('snap')]).toEqual([0, 1]);
  });

  it('gives seconds since the start (negative before) and the start on the chapter clock', () => {
    expect(mkS(ch, 0.25).sinceAct('lin')).toBeCloseTo(-0.75, 12);
    expect(mkS(ch, 2.5).sinceAct('lin')).toBeCloseTo(1.5, 12);
    expect(mkS(ch, 0).actT('later')).toBeCloseTo(beat(ch, 'duet').start + 0.5, 12);
  });

  it('reads any action of the chapter from any beat', () => {
    const S = mkS(ch, beat(ch, 'end').start + 0.1);
    expect(S.is('end')).toBe(true);
    expect(S.act('lin')).toBe(1);
    expect(S.sinceAct('later')).toBeCloseTo(beat(ch, 'end').start + 0.1 - (beat(ch, 'duet').start + 0.5), 12);
  });

  it('throws on an action the chapter does not have', () => {
    expect(() => mkS(ch, 0).act('zzz')).toThrow('chapter "a" has no action "zzz"');
  });
});
