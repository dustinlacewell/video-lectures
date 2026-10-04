import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { voiceLines } from '@studio/engine/audio/voiceLines';
import { SCRIPT } from '../script';
import { CAST } from '../script/cast';
import type { Cast, ChapterScript } from '../script/types';
import { buildManifest, type Refs } from '../voice/manifest';
import { readRefs } from '../voice/refs';

/** A one-chapter script with a duet line. */
const DUET: ChapterScript[] = [{
  id: 'z', short: 'z', root: 220, scale: [0],
  beats: [
    { id: 'z.ask', say: 'Are you conscious?' },
    { id: 'z.yes', say: '“Yes. *Obviously.*”', speaker: ['you', 'zombie'] },
    { id: 'z.slow', say: 'Yes.', speaker: ['you', 'zombie'], stagger: 0.5 }
  ]
}];

/** A one-chapter script with a single card. */
const CARD: ChapterScript[] = [{ id: 'c', short: 'c', root: 220, scale: [0], beats: [{ id: 'c.claim', card: 'Form *is* function.' }] }];

/** Fake reference clips: an audio hash and transcript per cast ref. */
const refsOf = (cast: Cast, hash = 'h'): Refs =>
  Object.fromEntries(Object.values(cast).map(m => [m.ref, { hash: hash + m.ref, text: 'transcript of ' + m.ref }]));

describe('read-out cards', () => {
  it('writes a card job that reads the card without formatting', () => {
    expect(buildManifest(CARD, CAST, refsOf(CAST))[0].text).toBe('Form is function.');
  });

  it('reads every card in the script', () => {
    const cards = SCRIPT.flatMap(ch => ch.beats).filter(b => b.card);
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach(b => expect(voiceLines(b).map(l => l.clip)).toEqual([b.id]));
  });
});

describe('cast and manifest', () => {
  it('gives the zombie exactly your voice', () => {
    const { name: _y, ...you } = CAST.you, { name: _z, ...zombie } = CAST.zombie;
    expect(zombie).toEqual(you);
  });

  it('writes one job per speaker, aliased voices sharing a key, transcript from the ref', () => {
    const m = buildManifest(DUET, CAST, refsOf(CAST));
    expect(m.map(e => e.id)).toEqual(['z.ask', 'z.yes.you', 'z.yes.zombie', 'z.slow.you', 'z.slow.zombie']);
    const [you, zombie] = [m[1], m[2]];
    expect(zombie.voiceKey).toBe('you');
    expect(you.text).toBe('Yes. Obviously.');
    expect(you.ref).toBe(CAST.you.ref);
    expect(you.refText).toBe('transcript of ' + CAST.you.ref);
    expect(zombie.hash).toBe(you.hash);
    expect(m[0].hash).not.toBe(you.hash);
  });

  it('re-hashes a line when its ref audio, transcript or style changes', () => {
    const base = buildManifest(DUET, CAST, refsOf(CAST))[1].hash;
    expect(buildManifest(DUET, CAST, refsOf(CAST, 'new audio'))[1].hash).not.toBe(base);
    const withText: Cast = { ...CAST, you: { ...CAST.you, refText: 'other words' } };
    expect(buildManifest(DUET, withText, refsOf(CAST))[1].hash).not.toBe(base);
    const withStyle: Cast = { ...CAST, you: { ...CAST.you, style: 'whispering' } };
    const styled = buildManifest(DUET, withStyle, refsOf(CAST));
    expect(styled[1].hash).not.toBe(base);
    expect(styled[1].style).toBe('whispering');
    expect(styled[2].voiceKey).toBe('zombie');
  });

  it('finds every cast ref clip and transcript in voice/refs', () => {
    const refs = readRefs(CAST, fileURLToPath(new URL('../voice', import.meta.url)));
    expect(buildManifest(SCRIPT, CAST, refs).length).toBeGreaterThan(0);
  });

  it('fails loudly when a ref clip or its transcript is missing', () => {
    expect(() => buildManifest(DUET, CAST, {})).toThrow(/not found/);
    const noText = Object.fromEntries(Object.entries(refsOf(CAST)).map(([k, v]) => [k, { hash: v.hash }]));
    expect(() => buildManifest(DUET, CAST, noText)).toThrow(/no transcript/);
  });
});
