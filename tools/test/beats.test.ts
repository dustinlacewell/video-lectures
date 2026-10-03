import { describe, expect, it } from 'vitest';
import { beatAt, onlyChapters, wordCount } from '../shared/beats.ts';
import { clock } from '../shared/format.ts';
import { BEATS, CHAPTERS } from './fixture.ts';

describe('timedBeats', () => {
  const byId = Object.fromEntries(BEATS.map((b) => [b.id, b]));

  it('puts beats on the global clock', () => {
    expect(byId['zombie.ask'].start).toBe(7.4);
    expect(byId['zombie.ask'].dur).toBe(3.6);
  });

  it('classifies every kind of beat', () => {
    expect(BEATS.map((b) => b.kind)).toEqual(['visual', 'title', 'narration', 'chorus', 'character', 'card']);
    expect(byId['zombie._title'].text).toBe('Meet your zombie twin');
  });

  it('names chorus clips per speaker and staggers them', () => {
    expect(byId['zombie.yes'].lines).toEqual([
      { clip: 'zombie.yes.you', speaker: 'you', at: 0 },
      { clip: 'zombie.yes.zombie', speaker: 'zombie', at: 0.25 }
    ]);
    expect(byId['zombie.claim'].lines).toEqual([{ clip: 'zombie.claim', speaker: 'narrator', at: 0 }]);
    expect(byId['intro.t'].lines).toEqual([]);
  });

  it('keeps the explicit dur', () => {
    expect(byId['zombie.toe'].explicitDur).toBe(5);
  });
});

describe('helpers', () => {
  it('counts words, not punctuation or italic marks', () => {
    expect(wordCount('So let’s ask. Hey, are you *conscious*?')).toBe(7);
    expect(wordCount(' - ')).toBe(0);
    expect(wordCount(undefined)).toBe(0);
  });

  it('finds the beat at a time', () => {
    expect(beatAt(BEATS, 0)?.id).toBe('intro.t');
    expect(beatAt(BEATS, 7.39)?.id).toBe('zombie._title');
    expect(beatAt(BEATS, 25.9)?.id).toBe('zombie.claim');
  });

  it('filters chapters and rejects unknown ones', () => {
    expect(onlyChapters(CHAPTERS, BEATS, ['zombie']).beats).toHaveLength(5);
    expect(onlyChapters(CHAPTERS, BEATS, []).beats).toHaveLength(6);
    expect(() => onlyChapters(CHAPTERS, BEATS, ['nope'])).toThrow(/no chapter "nope"/);
  });

  it('formats clock times', () => {
    expect(clock(0)).toBe('0:00.0');
    expect(clock(65.25)).toBe('1:05.3');
    expect(clock(59.96)).toBe('1:00.0');
  });
});
