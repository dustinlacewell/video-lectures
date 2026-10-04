import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { readRefs } from '../src/refs';
import { buildManifest, type Cast, type ChapterScript, type LineReader, type Refs, type VoiceLine } from '../src/manifest';

const HERE = fileURLToPath(new URL('.', import.meta.url));

/** A tiny beat shape standing in for the video's own BeatScript: just enough for the reader below. */
interface Beat { id: string; say?: string; speaker?: string | string[]; stagger?: number }

/** A reader that mirrors the video's real voiceLines.ts, kept small and local so these tests don't depend on any video. */
const reader: LineReader<Beat> = {
  lineOf: b => b.say,
  spokenText: say => say.replace(/\*/g, '').trim(),
  voiceLines: (b): VoiceLine[] => {
    if (!b.say) return [];
    const speakers = b.speaker ? (Array.isArray(b.speaker) ? b.speaker : [b.speaker]) : ['narrator'];
    const stagger = b.stagger ?? 0.15;
    return speakers.map((s, k) => ({ clip: speakers.length > 1 ? `${b.id}.${s}` : b.id, speaker: s, at: k * stagger }));
  },
};

/** A fake cast: "echo" is an alias of "one" (same ref, same style -> shares a voice key). Transcripts come from the ref clip. */
const CAST: Cast = {
  narrator: { ref: 'refs/narrator.wav' },
  one: { ref: 'refs/one.wav' },
  echo: { ref: 'refs/one.wav' },
  two: { ref: 'refs/two.wav', style: 'whispering' },
};

/** A one-chapter script with a duet line between the aliased speakers. */
const DUET: ChapterScript<Beat>[] = [{
  beats: [
    { id: 'z.ask', say: 'Are you there?' },
    { id: 'z.yes', say: 'Yes.', speaker: ['one', 'echo'] },
  ],
}];

const refsOf = (cast: Cast, hash = 'h'): Refs =>
  Object.fromEntries(Object.values(cast).map(m => [m.ref, { hash: hash + m.ref, text: 'transcript of ' + m.ref }]));

describe('buildManifest', () => {
  it('writes one job per speaker, aliased voices sharing a key, transcript from the ref', () => {
    const m = buildManifest(DUET, CAST, refsOf(CAST), reader);
    expect(m.map(e => e.id)).toEqual(['z.ask', 'z.yes.one', 'z.yes.echo']);
    const [one, echo] = [m[1], m[2]];
    expect(echo.voiceKey).toBe('one');
    expect(one.text).toBe('Yes.');
    expect(one.ref).toBe(CAST.one.ref);
    expect(one.refText).toBe('transcript of ' + CAST.one.ref);
    expect(echo.hash).toBe(one.hash);
    expect(m[0].hash).not.toBe(one.hash);
  });

  it('re-hashes a line when its ref audio, transcript or style changes', () => {
    const base = buildManifest(DUET, CAST, refsOf(CAST), reader)[1].hash;
    expect(buildManifest(DUET, CAST, refsOf(CAST, 'new audio'), reader)[1].hash).not.toBe(base);
    const withText: Cast = { ...CAST, one: { ...CAST.one, refText: 'other words' } };
    expect(buildManifest(DUET, withText, refsOf(CAST), reader)[1].hash).not.toBe(base);
    const withStyle: Cast = { ...CAST, one: { ...CAST.one, style: 'whispering' } };
    const styled = buildManifest(DUET, withStyle, refsOf(CAST), reader);
    expect(styled[1].hash).not.toBe(base);
    expect(styled[1].style).toBe('whispering');
    expect(styled[2].voiceKey).toBe('echo');
  });

  it('fails loudly when a ref clip or its transcript is missing', () => {
    expect(() => buildManifest(DUET, CAST, {}, reader)).toThrow(/not found/);
    const noText = Object.fromEntries(Object.entries(refsOf(CAST)).map(([k, v]) => [k, { hash: v.hash }]));
    expect(() => buildManifest(DUET, CAST, noText, reader)).toThrow(/no transcript/);
  });
});

describe('readRefs', () => {
  it('leaves out a cast ref whose clip file is missing', () => {
    expect(readRefs(CAST, HERE)).toEqual({});
  });
});
