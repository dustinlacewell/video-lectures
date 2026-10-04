import { describe, expect, it } from 'vitest';
import { mkS } from '../src/beatState';
import { DEFAULT_PAD, buildTimeline, voiceDurations } from '../src/timeline';
import { POP, shownLines, speechSeconds, talkTime, talkWindow } from '../src/speech/speechTiming';
import { CAST } from './fixtures';
import type { ChapterScript } from '../src/script';

const CH: ChapterScript[] = [{
  id: 'z', short: 'z', root: 220, scale: [0],
  beats: [
    { id: 'z.ask', say: 'Are you conscious?' },
    { id: 'z.yes', say: 'Yes. Obviously.', speaker: ['you', 'zombie'], stagger: 0.5 },
    { id: 'z.held', say: 'Coffee.', speaker: 'friend', dur: 6 },
    { id: 'z.after', say: 'Then the narrator talks.' }
  ]
}];

const timed = (clips: Record<string, number> = {}, cast = CAST) => buildTimeline(CH, voiceDurations(CH, clips, cast), cast).chapters[0];
const at = (key: string, bt: number, clips?: Record<string, number>) => { const ch = timed(clips); return mkS(ch, ch.beats[ch.idx[key]].start + bt); };

describe('talk windows', () => {
  it('has no window for the narrator', () => {
    const ch = timed();
    expect(talkWindow(ch.beats[ch.idx.ask], 'narrator')).toBeUndefined();
  });

  it('starts each speaker at its stagger and ends the last one a pad before the beat ends', () => {
    const ch = timed({ 'z.yes.you': 1.5, 'z.yes.zombie': 1.5 }), b = ch.beats[ch.idx.yes];
    expect(b.dur).toBeCloseTo(0.5 + 1.5 + DEFAULT_PAD, 9);
    expect(talkWindow(b, 'you')).toEqual({ start: 0, end: 1.5 });
    expect(talkWindow(b, 'zombie')!.start).toBe(0.5);
    expect(talkWindow(b, 'zombie')!.end).toBeCloseTo(2.0, 9);
  });

  it('ends the last speaker its cast pad before the beat ends', () => {
    const cast = { ...CAST, zombie: { ...CAST.zombie, pad: 1.2 } };
    const b = timed({ 'z.yes.you': 1.5, 'z.yes.zombie': 1.5 }, cast).beats[1];
    expect(b.dur).toBeCloseTo(0.5 + 1.5 + 1.2, 9);
    expect(talkWindow(b, 'zombie')!.end).toBeCloseTo(2.0, 9);
  });

  it('caps the mouth by the line length when the beat is held longer', () => {
    const ch = timed(), b = ch.beats[ch.idx.held];
    expect(b.dur).toBe(6);
    expect(talkWindow(b, 'friend')).toEqual({ start: 0, end: speechSeconds('Coffee.') });
  });

  it('reports seconds into the line only while speaking', () => {
    expect(talkTime(at('yes', 0.3), 'zombie')).toBeUndefined();
    expect(talkTime(at('yes', 0.7), 'zombie')).toBeCloseTo(0.2, 9);
    expect(talkTime(at('held', 5), 'friend')).toBeUndefined();
  });
});

describe('shown lines', () => {
  it('shows no bubble for a narrator line', () => {
    expect(shownLines(at('ask', 1))).toEqual([]);
  });

  it('pops each speaker in at its own start', () => {
    expect(shownLines(at('yes', 0.3)).map(l => l.who)).toEqual(['you']);
    expect(shownLines(at('yes', 0.5 + POP)).map(l => [l.who, l.scale])).toEqual([['you', 1], ['zombie', 1]]);
  });

  it('lets a bubble go when the next beat starts, unless held', () => {
    expect(shownLines(at('after', 1))).toEqual([]);
    expect(shownLines(at('after', 1), { held: null }).map(l => l.who)).toEqual(['friend']);
    expect(shownLines(at('after', 1), { yes: 'after' })).toEqual([]);
  });

  it('rejects a hold naming a beat that does not exist', () => {
    expect(() => shownLines(at('after', 1), { held: 'nope' })).toThrow(/nope/);
  });
});
