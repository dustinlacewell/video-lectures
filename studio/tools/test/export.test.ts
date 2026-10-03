import { describe, expect, it } from 'vitest';
import { captionCues, srt, stamp, vtt, words } from '../export/captions.ts';
import { timestamp, youtubeChapters } from '../export/chapters.ts';
import { framePlan, spotFrames } from '../export/plan.ts';
import { duckWindows, mixAt, placements, sampleAt } from '../export/voice.ts';
import { floatWav } from '../export/wav.ts';
import { BEATS } from './fixture.ts';

const LENGTHS = { 'zombie.ask': 2.5, 'zombie.yes.you': 1.2, 'zombie.yes.zombie': 1.4, 'zombie.toe': 0.5, 'zombie.claim': 3 };

describe('placements', () => {
  const ps = placements(BEATS, LENGTHS);

  it('puts each clip at chapter start + beat start + speaker stagger', () => {
    expect(ps.map((p) => [p.clip, p.t])).toEqual([
      ['zombie.ask', 7.4], ['zombie.yes.you', 11], ['zombie.yes.zombie', 11.25], ['zombie.toe', 14], ['zombie.claim', 19]
    ]);
  });

  it('skips a clip with no length, as the player does', () => {
    expect(placements(BEATS, { 'zombie.ask': 2.5 }).map((p) => p.clip)).toEqual(['zombie.ask']);
  });

  it('ducks over the union of sounding clips', () => {
    expect(duckWindows(ps, LENGTHS)).toEqual([[7.4, 9.9], [11, 12.65], [14, 14.5], [19, 22]]);
  });
});

describe('mixAt', () => {
  it('sums the overlap, clipped at both ends', () => {
    const dst = new Float32Array(4);
    mixAt(dst, new Float32Array([1, 2, 3]), -1);
    mixAt(dst, new Float32Array([10, 20, 30]), 2);
    expect(Array.from(dst)).toEqual([2, 3, 10, 20]);
  });

  it('places a time on the sample grid of a slice', () => {
    expect(sampleAt(26.5, 25, 48000)).toBe(72000);
    expect(sampleAt(24, 25, 48000)).toBe(-48000);
  });
});

describe('framePlan', () => {
  it('covers the whole video in ceil(total * fps) frames', () => {
    const p = framePlan(426.209, 30);
    expect(p.count).toBe(12787);
    expect(Math.abs(p.dur - 426.209)).toBeLessThan(1 / 30);
  });

  it('snaps a slice to frames', () => {
    expect(framePlan(100, 30, 25, 35)).toMatchObject({ first: 750, count: 300, start: 25, dur: 10 });
    expect(() => framePlan(100, 30, 35, 25)).toThrow(/empty slice/);
  });

  it('spot-checks the ends and spreads the rest', () => {
    const p = framePlan(100, 30, 25, 35);
    expect(spotFrames(p, [10, 26, 30, 34, 50], 4)).toEqual([750, 780, 1020, 1049]);
  });
});

describe('youtubeChapters', () => {
  it('starts at 0:00 and merges a chapter under 10 s into the next', () => {
    const r = youtubeChapters([{ start: 0, title: 'Title' }, { start: 6.2, title: 'Physics' }, { start: 75.9, title: 'Form' }], 200);
    expect(r.lines).toEqual(['0:00 Physics', '1:15 Form']);
    expect(r.merged).toEqual(['Title']);
  });

  it('formats hours', () => {
    expect(timestamp(3725.9)).toBe('1:02:05');
    expect(timestamp(59.99)).toBe('0:59');
  });
});

describe('captions', () => {
  const ps = placements(BEATS, LENGTHS);
  const cues = captionCues(BEATS, ps, LENGTHS, { you: 'You', zombie: 'Zombie' });

  it('makes one cue per voiced beat, from clip start to last clip end', () => {
    expect(cues.map((c) => [c.start, c.end])).toEqual([[7.4, 9.9], [11, 12.65], [14, 14.5], [19, 22]]);
  });

  it('names non-narrator speakers and italicizes *words*', () => {
    expect(cues[0].text).toBe('So let’s ask. Hey, are you <i>conscious</i>?');
    expect(cues[1].text).toBe('YOU & ZOMBIE: Yes. Obviously.');
    expect(cues[2].text).toBe('YOU: Ouch!');
  });

  it('drops quote marks around a whole line and keeps italic runs across words', () => {
    expect(words('“A *very big* deal”').map((w) => [w.text, w.markup])).toEqual([['A', 'A'], ['very', '<i>very'], ['big', 'big</i>'], ['deal', 'deal']]);
  });

  it('closes and reopens an italic run across a line break', () => {
    const beat = { ...BEATS.find((b) => b.id === 'zombie.claim')!, text: 'one two three four *five six seven eight nine ten eleven twelve* thirteen', kind: 'card' as const };
    const text = captionCues([beat], placements([beat], LENGTHS), LENGTHS, {})[0].text;
    expect(text).toBe('one two three four <i>five six seven</i>\n<i>eight nine ten eleven twelve</i> thirteen');
  });

  it('splits a long line into cues of two 42-character lines, timed by word share', () => {
    const long = Array.from({ length: 40 }, (_, i) => 'word' + i).join(' ');
    const beat = { ...BEATS.find((b) => b.id === 'zombie.claim')!, text: long, kind: 'card' as const };
    const out = captionCues([beat], placements([beat], LENGTHS), LENGTHS, {});
    expect(out.length).toBeGreaterThan(1);
    out.forEach((c) => {
      const lines = c.text.split('\n');
      expect(lines.length).toBeLessThanOrEqual(2);
      lines.forEach((l) => expect(l.length).toBeLessThanOrEqual(42));
    });
    expect(out[0].start).toBe(19);
    expect(out[out.length - 1].end).toBe(22);
    out.slice(1).forEach((c, i) => expect(c.start).toBe(out[i].end));
    expect(out.every((c) => c.text.split('\n').length === 2)).toBe(true);
  });

  it('writes SRT and VTT timestamps', () => {
    expect(stamp(3723.4567, ',')).toBe('01:02:03,457');
    expect(srt(cues).split('\n').slice(0, 3)).toEqual(['1', '00:00:07,400 --> 00:00:09,900', 'So let’s ask. Hey, are you <i>conscious</i>?']);
    expect(vtt(cues).startsWith('WEBVTT\n\n00:00:07.400 --> 00:00:09.900\n')).toBe(true);
  });
});

describe('floatWav', () => {
  it('writes an IEEE float stereo header and interleaved samples', () => {
    const b = floatWav([new Float32Array([0.5, -1]), new Float32Array([0.25, 1])], 48000);
    expect(b.toString('ascii', 0, 4)).toBe('RIFF');
    expect(b.readUInt16LE(20)).toBe(3);
    expect(b.readUInt16LE(22)).toBe(2);
    expect(b.readUInt32LE(40)).toBe(16);
    expect([0, 1, 2, 3].map((i) => b.readFloatLE(44 + i * 4))).toEqual([0.5, 0.25, -1, 1]);
  });
});
