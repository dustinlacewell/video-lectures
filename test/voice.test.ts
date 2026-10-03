import { describe, expect, it } from 'vitest';
import { captionOf, spokenText, voiceLines } from '../engine/audio/voiceLines';
import { activeClips } from '../engine/audio/voiceTrack';
import { DEFAULT_PAD, buildTimeline, firstCueAt, voiceDurations } from '../engine/timeline';
import { SCRIPT } from '../script';
import { CAST } from '../script/cast';
import type { ChapterScript } from '../script/types';
import { buildManifest } from '../voice/manifest';

const beat = (tl: ReturnType<typeof buildTimeline>, id: string) =>
  tl.chapters.flatMap(ch => ch.beats).find(b => b.id === id)!;

/** A one-chapter script with a duet line. */
const DUET: ChapterScript[] = [{
  id: 'z', short: 'z', root: 220, scale: [0],
  beats: [
    { id: 'z.ask', say: 'Are you conscious?' },
    { id: 'z.yes', say: '“Yes. *Obviously.*”', speaker: ['you', 'zombie'] },
    { id: 'z.slow', say: 'Yes.', speaker: ['you', 'zombie'], stagger: 0.5 }
  ]
}];

describe('voice durations', () => {
  it('times a voiced beat as clip length + pad', () => {
    const tl = buildTimeline(SCRIPT, voiceDurations(SCRIPT, { 'physics.atoms': 3 }, CAST));
    expect(beat(tl, 'physics.atoms').dur).toBeCloseTo(3 + DEFAULT_PAD, 9);
  });

  it('keeps a scripted dur only when it is longer than clip + pad', () => {
    const short = buildTimeline(SCRIPT, voiceDurations(SCRIPT, { 'physics.spirit': 1 }, CAST));
    expect(beat(short, 'physics.spirit').dur).toBe(5.2);
    const long = buildTimeline(SCRIPT, voiceDurations(SCRIPT, { 'physics.spirit': 6 }, CAST));
    expect(beat(long, 'physics.spirit').dur).toBeCloseTo(6 + DEFAULT_PAD, 9);
  });

  it('falls back to the scripted timing when clips are missing', () => {
    const base = buildTimeline(SCRIPT);
    expect(voiceDurations(SCRIPT, {}, CAST)).toEqual({});
    expect(buildTimeline(SCRIPT, voiceDurations(SCRIPT, {}, CAST))).toEqual(base);
  });

  it('times several speakers by the last one to finish, each starting stagger later', () => {
    const d = voiceDurations(DUET, { 'z.yes.you': 2.5, 'z.yes.zombie': 2.0, 'z.slow.you': 1, 'z.slow.zombie': 1 }, CAST);
    expect(d['z.yes']).toBeCloseTo(Math.max(0 + 2.5, 0.15 + 2.0) + DEFAULT_PAD, 9);
    expect(d['z.slow']).toBeCloseTo(0.5 + 1 + DEFAULT_PAD, 9);
  });

  it('falls back when any speaker of a line has no clip', () => {
    expect(voiceDurations(DUET, { 'z.yes.you': 2.5 }, CAST)['z.yes']).toBeUndefined();
  });
});

describe('voice lines', () => {
  it('names a single speaker clip by beat and several by beat.speaker', () => {
    expect(voiceLines(DUET[0].beats[0])).toEqual([{ clip: 'z.ask', speaker: 'narrator', at: 0 }]);
    expect(voiceLines(DUET[0].beats[1])).toEqual([
      { clip: 'z.yes.you', speaker: 'you', at: 0 },
      { clip: 'z.yes.zombie', speaker: 'zombie', at: 0.15 }
    ]);
  });

  it('strips caption-only formatting from spoken text', () => {
    expect(spokenText('“Yes. *Obviously.*”')).toBe('Yes. Obviously.');
    expect(spokenText('Say “I am conscious” now.')).toBe('Say “I am conscious” now.');
  });

  it('captions narrator lines only', () => {
    expect(captionOf(DUET[0].beats[0])).toBe('Are you conscious?');
    expect(captionOf(DUET[0].beats[1])).toBeUndefined();
  });

  it('finds the clips sounding at T and how far into each', () => {
    const clips = { 'z.ask': 2, 'z.yes.you': 2.5, 'z.yes.zombie': 2.0 };
    const tl = buildTimeline(DUET, voiceDurations(DUET, clips, CAST));
    const yes = beat(tl, 'z.yes');
    expect(activeClips(tl, 1, clips)).toEqual([{ clip: 'z.ask', offset: 1 }]);
    expect(activeClips(tl, 2.3, clips)).toEqual([]);
    expect(activeClips(tl, yes.start + 0.1, clips).map(a => a.clip)).toEqual(['z.yes.you']);
    const both = activeClips(tl, yes.start + 1, clips);
    expect(both.map(a => a.clip)).toEqual(['z.yes.you', 'z.yes.zombie']);
    expect(both[1].offset).toBeCloseTo(0.85, 9);
  });
});

describe('cast and manifest', () => {
  it('gives the zombie exactly your voice', () => {
    expect(CAST.zombie.voice).toBe(CAST.you.voice);
    expect(CAST.zombie.pad).toBe(CAST.you.pad);
  });

  it('writes one job per speaker, aliased voices sharing a key, hash on text + voice', () => {
    const m = buildManifest(DUET, CAST);
    expect(m.map(e => e.id)).toEqual(['z.ask', 'z.yes.you', 'z.yes.zombie', 'z.slow.you', 'z.slow.zombie']);
    const [you, zombie] = [m[1], m[2]];
    expect(zombie.voiceKey).toBe('you');
    expect(you.text).toBe('Yes. Obviously.');
    expect(zombie.hash).toBe(you.hash);
    expect(m[0].hash).not.toBe(you.hash);
  });
});

describe('cue reset', () => {
  it('keeps a cue exactly at T to play', () => {
    const cues = [{ t: 1, type: 'pop' as const }, { t: 2, type: 'pop' as const }];
    expect(firstCueAt(cues, 2)).toBe(1);
    expect(firstCueAt(cues, 2.01)).toBe(2);
    expect(firstCueAt(cues, 0)).toBe(0);
  });
});
