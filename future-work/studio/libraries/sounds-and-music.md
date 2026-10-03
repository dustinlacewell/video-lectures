# Library: sounds and music

Not built. Proposal.

Sound effects and music motifs. Every sound carries one meaning. Every motif is a mood a chapter can pick.

## Data shape

```ts
// packages/library/src/sounds/sound.ts
export interface Sound {
  id: string;                               // 'sound.ding'
  /** Pure. Writes the sound into the context at time t0. Deterministic given seed. */
  play(ctx: BaseAudioContext, t0: number, arg?: number, seed?: number): void;
  seconds: number;                          // for the catalog and the export mix
}

// packages/library/src/music/motif.ts
export interface Motif {
  id: string;                               // 'motif.calm'
  root: number;                             // Hz
  scale: number[];                          // semitones
  pattern: string;                          // name of a pure pattern function in engine/audio/music.ts
}
```

`SfxName` stops being a hand-kept union. It becomes `keyof typeof SOUNDS`, derived from the library. A script that cues a sound the library lacks fails to type-check.

The synth is already deterministic except for the noise buffer (`Math.random` in `engine/audio/synth.ts`). The engine contract section 11 already asks for a seeded noise and a pure `score(timeline)`. The library depends on that work; it does not repeat it.

## Where it lives

```
packages/library/src/sounds/   tick.ts, thud.ts, ding.ts, stamp.ts, rise.ts, fall.ts, boo.ts, whoosh.ts, fail.ts, click.ts, each with .card.ts
packages/library/src/music/    calm.ts, tense.ts, ... each with .card.ts
```

The synth primitives (oscillator envelopes, noise, filters) stay in `engine/audio/synth.ts`. A sound file is a short pure composition of them.

## Meaning travels with the sound

The visual vocabulary's Sounds table gives each sound one meaning per video. In the first production `stamp` meant a rejection, a stomp and a verdict. The library card carries the meaning (`means`, `neverMeans`), and the video's vocabulary row cites the card. A video that wants `stamp` for a stomp must either accept "a verdict" or ask for a new sound. See [symbols.md](symbols.md) for the same rule on pictures.

## How a video uses it

- In a beat: `sfx: [[0.1, 'boo']]` as today, or inside an action: `sfx: [['start', 'boo']]` (studio-design B3). The second form is preferred because the sound and the picture share one time.
- A chapter picks a motif: `music: 'motif.calm'` instead of `root: 220, scale: [0, 2, 3, 5, 7, 8, 10]`.

## How an item gets in

A sound engineer writes a new sound in the video first (`videos/<slug>/sounds/`), with its vocabulary row. Harvest promotes it when its meaning is general. The library test for a sound: rendering it twice into an `OfflineAudioContext` gives equal buffers; its length matches `seconds`.

## Preview

The catalog renders each sound and a four-bar sample of each motif into a wav through `OfflineAudioContext` headless and shows a play button and a waveform strip. The agents get the wav path; they cannot hear, so the card's `summary` must say what it sounds like in words ("bell, three partials").
