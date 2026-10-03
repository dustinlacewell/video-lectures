# The living cut

Not built. Proposal.

The cut is the hub. It is the always-playable current version of the film. Every department works around it and swaps its pieces in when they are ready.

## Elements

An element is one addressable piece of the film. Each has versions. The cut picks one version per element.

```ts
// packages/cut/src/elements.ts
export type ElementKind =
  | 'line'    // one speaker's text in one beat; id = clip id, e.g. 'physics.ghost' or 'zombie.ask.you'
  | 'take'    // one rendered voice clip of a line; several per line
  | 'shot'    // the picture of one beat; id = beat id
  | 'cue'     // one sound effect at a time; id = '<beat>#<action or index>'
  | 'music'   // one chapter's root and scale; id = chapter id
  | 'asset';  // a library item the video uses; id = catalog id

/** How finished a piece is. Derived, never typed by hand. */
export type Stage = 'missing' | 'placeholder' | 'scratch' | 'draft' | 'final' | 'locked';

export interface Element {
  kind: ElementKind;
  id: string;
  stage: Stage;
  version: string;      // a take stamp, a shot version name, or a content hash
  dependsOn: string[];  // element ids, for the rebuild graph
}
```

What is stored and what is derived:

- **Stored: choices.** `voice/picks.json` (which take per line), `cut/shots.json` (which version per beat), `production/locks.json` (which elements the human has locked).
- **Derived: everything else.** `wm cut:status <slug>` computes every element's stage and version from the repo and writes `dist/<slug>/cut.json`. The app and the agents read that file. Nobody edits it.

## Voice: takes and picks

Today one wav per clip id is overwritten on each render. A new take destroys the old one. The human cannot compare, and a re-roll cannot be undone.

```
voice/takes/<clipId>/<stamp>.wav    every take kept; gitignored
voice/takes.json                    { [clipId]: TakeRecord[] }; tracked
voice/picks.json                    { [clipId]: stamp }; tracked; the take in the cut
voice/clips/<clipId>.wav            the picked take, copied by `wm voice:conform`; tracked, as today
```

```ts
export interface TakeRecord {
  stamp: string;                     // '<hash>.r<renderVersion>[.s<seed>]'
  kind: 'scratch' | 'final';         // scratch: fast render, no verify loop; a placeholder voice
  seconds: number;
  verify: 'ok' | 'rerolled' | 'failed';
  made: string;                      // ISO date
}
```

- `wm voice:render <slug>` renders a final take for every line whose picked take is missing or stale, then picks it. Same as today, plus the take record.
- `wm voice:render <slug> --scratch` renders scratch takes for lines with no take. Fast. Marks them `scratch`. The reel plays with a real voice on day one of preproduction.
- `wm voice:pick <slug> <clipId> <stamp>` changes a pick. `wm voice:conform <slug>` copies picks into `clips/`.
- Line stage: `missing` (no take), `scratch`, `final` (picked take is final and verified), `locked`.

A line whose text changes gets a new hash, so its old takes are stale and a new render runs. Nothing else re-renders. This is today's hash cache, kept.

## Shots: placeholders to finals

Each beat has a shot. A shot has three versions, and the cut picks one.

```ts
// videos/<slug>/cut/shots.json
{ "physics.ghost": "scene", "physics.spirit": "board", "form.circuit": "blank" }
```

- `blank`: the engine draws the beat's caption on the chapter background. Needs nothing.
- `board`: the board renderer draws the storyboard panel for the beat (`scenes/shared/board.ts` from engine contract section 11; purpose band with `?purpose`). Needs a board file.
- `scene`: the chapter's draw code, or a compiled shot spec ([authoring.md](authoring.md)).

The default when `shots.json` has no entry: `scene` if the chapter has a scene, else `board` if a board exists, else `blank`. The file exists to override: an animator can send a beat back to its board while reworking it, and the reel keeps playing.

Shot stage: `placeholder` (blank or board), `draft` (scene exists, supervisor has not passed it), `final` (supervisor passed), `locked`.

## Playable at all times

What the engine and data model must guarantee:

- A timeline builds with zero clips (word-count estimate, as today) and with any mix of clips.
- An anchor resolves with no `words.json` (proportional fallback, studio-design B2).
- A beat with no scene draws something (`blank` or `board`).
- A missing sound plays silence and logs once.
- A missing library asset is a build error, never a runtime hole. Assets are code.

So the reel plays at the end of development: the script as captions on backgrounds, estimated timing, no voice. At the end of preproduction: boards plus scratch voice. After the voice phase: final voice, boards. During animation: finals replace boards beat by beat.

## The rebuild graph

What depends on what. An arrow means "a change upstream invalidates downstream".

```
script line text ─┬─> manifest hash ─> take (render) ─> clip length ─┬─> beat length ─> chapter timing ─> timeline
                  │                                 └─> word timings ─┘        ▲                              │
                  └─> caption, bubble text                                     │                              ▼
actions (.actions.ts) ──────────────────────────────────────────────────────────┘                   frames of that chapter
shot spec or scene code ───────────────────────────────────────────────────────────────────────────> frames of that chapter
library item ─> every shot that imports it ────────────────────────────────────────────────────────> frames of those chapters
cast ref ─> manifest hash of every line of that speaker ─> takes
```

Granularity, and why:

- **Voice**: per line. The manifest hash already does this.
- **Word timings**: per take. Stamp-keyed (studio-design B1).
- **Timeline**: whole video, but it is pure and takes milliseconds. Not cached.
- **Frames**: per chapter. A scene reads other beats of its chapter (`S.since(key)`), and a beat's length moves its neighbours. So the chapter is the smallest unit whose pixels are a pure function of its own inputs. Cache key: `sha(chapter timing, chapter scene files, library package hash, media stamps of the chapter)`.
- **Export**: per chapter. `wm export <slug>` renders each chapter whose key changed into `.scratch/export/<chapter>.<key>.mp4`, then concatenates with ffmpeg. The music and sound mix runs once over the whole timeline through `OfflineAudioContext` (it is cheap) and is muxed at the end. Re-voicing one line re-encodes one chapter.

## What changes in the engine

- `buildTimeline(video, media)` takes the picked media. Unchanged from studio-design B4.
- `render.ts` reads `shots.json` through `VideoData.shots` and dispatches to blank, board or scene. One new pure function `shotVersion(beat, picks, hasScene, hasBoard)`.
- `__info()` gains `stages` per beat so tools can show the cut's state on a contact sheet.

## Open questions

1. Scratch voice: Breeze in fast mode with no verify loop, or a cheaper system voice? Recommend Breeze fast: same timing character as the final.
