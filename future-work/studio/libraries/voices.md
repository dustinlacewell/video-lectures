# Library: voices

Not built. Proposal.

A voice is a frozen reference clip and its exact transcript. Every line of a speaker is cloned from it. The first production proved this: voice design from a text description rerolled the voice per call (history, item 10). Freezing one reference fixed it.

## Data shape

```ts
// packages/library/src/voices/voice.ts
export interface Voice {
  id: string;             // 'voice.narrator-posh', 'voice.bean-chipper'
  ref: string;            // 'ref.wav' beside the card; 5–12 s, mono
  refText: string;        // exact transcript; the pipeline needs it
  style?: string;         // default delivery direction
  pad?: number;           // default seconds of quiet after a line; today 0.6
  rate?: number;          // measured spoken words per second; the writer plans with it
}
```

The video's cast then cites a voice instead of carrying a file:

```ts
// videos/<slug>/script/cast.ts
export const CAST = {
  narrator: { name: 'Narrator', voice: 'voice.narrator-posh' },
  you:      { name: 'You',      voice: 'voice.bean-chipper' },
  zombie:   { name: 'Zombie',   voice: 'voice.bean-chipper' },   // same voice: the argument made audible
  friend:   { name: 'Friend',   voice: 'voice.bean-warm' },
};
```

`CastMember.ref` and `refText` go away. The manifest builder resolves `voice` to the library's ref path and transcript. The manifest hash still includes the ref audio hash, so a changed reference re-renders every line of that speaker, as it must.

## Where it lives

```
packages/library/src/voices/
  narrator-posh/   ref.wav, ref.txt, voice.card.ts
  bean-chipper/
  bean-warm/
  aibot/
```

Reference wavs are tracked. They are small (under 1 MB each). Clips stay in the video.

A video-only voice (a guest character) lives in `videos/<slug>/voice/refs/` as today and is cited by path. Harvest promotes it when a second video wants it.

## How a video uses it

`wm voice:manifest <slug>` reads the cast, resolves each `voice` through the catalog, writes the manifest. `wm voice:render <slug>` runs as today in `packages/voice`, with one venv and one model folder (studio-design A2.5).

Casting's job shrinks: pick voices from the catalog, audition only for a speaker the library lacks.

## How an item gets in

Casting makes a new voice inside the video: audition from a text description, freeze the best take as `ref.wav`, transcribe it, verify with Whisper. Harvest moves the folder into the library and writes the card. Criterion: the voice is not a one-video gag.

The narrator's measured rate (1.94 words per second on the first production, from the pacing curve) goes on the card. The status file's "Narrator rate" line then comes from the catalog, not from a default.

## Preview

The catalog plays the reference clip and shows its transcript, style, pad and rate. A short rendered sample line ("The quick brown fox...") is rendered once at promotion and stored beside the card, so the human hears the cloned voice, not only the reference.
