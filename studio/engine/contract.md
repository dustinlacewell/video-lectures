# The engine contract

A video project MUST honor this contract. The roles, loops and tools in this skill depend on it. The reference implementation is `D:\code\ai\video-lectures\videos\what-a-mind-is-made-of` (commit `1b6be63`). Type shapes below are copied from it.

"MUST" is a hard rule. A tool or role breaks without it. "SHOULD" is the default; break it only with a reason in the bible (`documents/bible.md`).

A project that starts from a single-file prototype reaches this contract through [porting](porting.md).

## 1. Medium

- The video is TypeScript drawing on one Canvas 2D element.
- All drawing uses a virtual stage of 1280 x 720 (`W`, `H` in `engine/math.ts`). The renderer scales it to the real canvas size. Scenes MUST NOT read the real canvas size.
- Music and sound effects are synthesized with Web Audio. Voice is pre-rendered WAV clips (see `engine/voice-pipeline.md`).
- The player is a Vite page. The project has no `package.json` scripts. Workmark commands run everything (section 9).

## 2. Layers

Each folder is one layer. A layer MUST import only from the layers above it in this list.

| Folder | Purpose | Pure? |
|---|---|---|
| `script/` | What is said, shown and heard, and when. Pure data. | Pure. No drawing, no I/O. |
| `engine/` | Timeline, beat state, camera, text, overlays, audio, render loop. | Core is pure (`timeline`, `beatState`, `camera`, `audio/voiceLines`, `audio/voiceTrack`, `richText`, `safeArea.fitShift`). Shell does I/O (`canvas`, `text`, `render`, `audio/*` playback). |
| `kit/` | Characters and props: draw functions of options plus time. | Draw only. No timeline knowledge. |
| `scenes/` | One scene per chapter. Calls kit and engine. | Draw only. |
| `player/` | Composition root, clock, UI, debug globals. The only layer that fetches files. | Shell. |
| `voice/` | Manifest builder (TS) and synthesis (Python). | `manifest.ts` pure; `refs.ts` and `*.py` do I/O. |
| `test/` | Vitest unit tests of the pure core. | — |

Rules:

- `script/` MUST hold no drawing and no logic beyond camera functions (`CamFn`). It MAY import types from `engine/` (the reference imports `BeatState` for `CamFn`).
- `engine/` MUST NOT import from `kit/`, `scenes/` or `player/`.
- `kit/` MUST NOT know beats, chapters or the timeline. A kit function takes options and a time `t`. Example: `bean(o: BeanOpts)`.
- A scene MUST NOT reach past kit into raw canvas calls to redraw a kit character. If a character needs a new pose, the kit owner adds it.
- `player/main.ts` is the composition root. Construction happens there. Other modules receive what they need.

## 3. The script

`script/types.ts` defines the shapes. `script/index.ts` exports `SCRIPT: ChapterScript[]` in play order. `script/cast.ts` exports `CAST: Cast`.

```ts
export type SfxCue = [at: number, sfx: SfxName, arg?: number];      // seconds into the beat
export type SpeakerId = 'narrator' | 'you' | 'zombie' | 'friend' | 'aibot'; // per project

export interface CastMember {
  name: string;          // label in text and bubbles
  ref: string;           // reference clip, relative to voice/, e.g. 'refs/narrator.wav'
  refText?: string;      // exact transcript of ref; default: the .txt beside it
  style?: string;        // delivery direction; steers the cloned voice
  pad?: number;          // seconds of quiet after this speaker's line; default 0.6
}
export type Cast = Record<SpeakerId, CastMember>;

export interface Cam { x: number; y: number; z: number }
export type CamFn = (S: BeatState) => Cam;

export interface BeatScript {
  id: string;                          // "<chapterId>.<key>", stable; clips are named by it
  say?: string;                        // spoken line; a narrator line is also the caption
  speaker?: SpeakerId | SpeakerId[];   // default 'narrator'; array = chorus, one clip each
  stagger?: number;                    // chorus: seconds between each start; default 0.15
  card?: string;                       // full-screen card text; the narrator reads it aloud
  dur?: number;                        // minimum duration in seconds
  cam?: Cam | CamFn;                   // camera from this beat on
  camT?: number;                       // seconds to ease from the previous camera; default 1.8
  still?: boolean;                     // no slow zoom drift
  sfx?: SfxCue[];
}

export type ChapterCue = [beatId: string, at: number, sfx: SfxName, arg?: number];

export interface ChapterScript {
  id: string;            // prefix of every beat id
  title?: string;        // gives the chapter an automatic title-card beat
  short: string;         // label on chapter chips and menus
  root: number;          // music root, Hz
  scale: number[];       // music scale, semitones
  beats: BeatScript[];
  cues?: ChapterCue[];
}
```

Rules:

- Beat ids MUST be stable and unique across the video. Renaming an id orphans its voice clip and its notes.
- Every beat id MUST start with `<chapterId>.`. `keyOf()` throws otherwise.
- One chapter is one file `script/NN-<id>.ts`, exporting one `ChapterScript`.
- [Casting](../roles/casting.md) declares every speaker id at the start of preproduction, before writers start, from the spine's list of speaking characters: the `SpeakerId` union and one `CAST` entry per id in `script/cast.ts`. Types only: a `ref` may point at a clip that does not exist yet. A writer who needs a new id requests it through the producer.
- Speakers that MUST sound the same share one `CastMember` by spread: `zombie: { ...you, name: 'Zombie' }`. The manifest then gives them one voice.
- A beat with `say` or `card` has voice. A beat with neither is silent.
- `*word*` in `say`, `card` or a bubble is italic. It is stripped before speech synthesis.

## 4. Timing

`engine/timeline.ts` turns the script plus clip lengths into a `Timeline`. It is pure.

```ts
buildTimeline(SCRIPT, voiceDurations(SCRIPT, clips, CAST)): Timeline
```

A beat's duration is decided in this order:

1. **Voiced.** All of the beat's clips exist in `durations.json`. Then
   `voiced = max(line.at + clipLength) + max(pad of its speakers)`.
   The duration is `max(voiced, dur)`. A card beat with no `dur` uses `max(voiced, cardReadingTime)`.
   An explicit `dur` wins only when it is longer.
2. **Fixed.** No clip, or any clip missing: `dur` if set.
3. **Heuristic.** Else by word count `w`: card `3.0 + 0.42w`; other `max(4.6, 2.2 + 0.42w)`.

Other timing facts:

- Clip ids: the beat id for one speaker; `<beatId>.<speaker>` when several speak together.
- In a chorus, speaker `k` starts at `k * stagger`.
- A chapter with a `title` gets a first beat `<chapterId>._title`, 3.4 s, holding the first beat's camera.
- Chapter `start` is seconds from video start. Beat `start` is seconds from chapter start.

Rules:

- Animation MUST be timed to recorded clips, never to the heuristic. A scene times things with `S.since(key)`, `S.on(key, delay, dur)`, `S.pop(...)`, `S.bt` and `S.lp`. It MUST NOT hard-code a beat's length.
- A visual beat that needs more time than its line sets `dur`. It MUST NOT pad the line text.
- The test `test/voiceCoverage.test.ts` MUST pass: every clip the script plays has a length, and no beat ends before its clips end.

## 5. Determinism

Every frame MUST be a pure function of the time `T`. Scrubbing, headless screenshots, frame sweeps and MP4 export all depend on it.

- A draw pass has the type `(S: BeatState, cam: Cam, T: number) => void`. Its output MUST depend only on these inputs and constants.
- Draw code MUST NOT call `Math.random`, `Date.now`, `performance.now` or `new Date`.
- Randomness MUST come from `rng(seed)` in `engine/math.ts`, built from a constant seed or a hash of a stable index. A draw MUST NOT advance an rng that lives across frames.
- Draw code MUST NOT keep state between frames. Motion with history (particles, trails, bouncing) MUST be closed-form in `T`. Drawing `T = 30` cold MUST give the same pixels as playing up to 30.
- Caches MUST be keyed by every input they depend on. The text-wrap cache is cleared when fonts arrive (`clearWrapCache`).
- Fonts MUST be requested at boot (`player/fonts.ts` calls `document.fonts.load`), so `document.fonts.ready` waits for them. A tool MUST await `document.fonts.ready`, then wait one animation frame, before its first capture. Text measured with a fallback font wraps differently.
- The page MUST start paused. `__seek(T)` MUST draw synchronously before it returns.
- The sound-effect cue list (`Timeline.cues`) is pure data. Music and noise SHOULD also be a pure function of `T` (see `engine/export.md`).

## 6. Scenes

```ts
export type DrawFn = (S: BeatState, cam: Cam, T: number) => void;
export interface Scene {
  bg: [string, string];  // gradient top, bottom; bottom is also the fade colour
  accent: string;        // card and title-card colour
  back?: DrawFn;         // screen space, before the camera
  draw: DrawFn;          // world space, inside the camera
  over?: DrawFn;         // screen space, after the camera
}
```

- `scenes/index.ts` exports `SCENES: Record<chapterId, Scene>`. Every chapter id MUST have a scene.
- One chapter's scene lives in `scenes/NN-<id>.ts`. It MAY split into `scenes/NN-<id>.<part>.ts` (for example `.layout.ts` for positions, `.network.ts`). Those files belong to the chapter.
- `scenes/shared/` holds helpers used by several chapters. It has one owner, like `kit/`.
- Render order per frame (`engine/render.ts`): background gradient, `back`, `draw` under the camera, `over`, chapter fades, title card / card / caption, grain and vignette.

## 7. Engine services

Scenes MUST use these instead of drawing their own.

- **Captions.** The engine draws a narrator `say` as the caption. A scene MUST NOT draw narrator text.
- **Cards.** The engine draws `card` beats (full-screen, words pop in) and chapter title cards.
- **Speech bubbles.** A non-narrator line is drawn by its scene through `scenes/shared/speech.ts`:
  ```ts
  const sp = speech(S, holds?);      // holds: { [beatKey]: untilBeatKey | null }
  bean({ ..., talk: sp.talk('you') }); // mouth flaps while 'you' speaks
  sp.bubbles({ you: { x, y, size?, maxW? } }); // tail tip at (x, y), world space
  ```
  A bubble pops in when its speaker starts and leaves when the next beat starts, unless `holds` keeps it.
- **Safe area.** Nothing readable may leave the frame. `SAFE_MARGIN` is 16 virtual px. `tag()` and `bubble()` fit themselves in screen space, whatever the camera does. A custom text box SHOULD call `onScreenShift(box, keep)` or `labelShift(box)` from `engine/safeArea.ts`.
- **Rich text.** `txt`, `tw`, `wrap`, `tag` and `bubble` accept `*italic*` markup. `wrapMarkup` keeps spans valid across line breaks.

## 8. Debug globals

The player page MUST expose these on `window`. Headless tools use only these.

```ts
interface Window {
  /** Jump to T seconds and draw, synchronously. */
  __seek(T: number): void;
  /** [chapter index, beat key, beat index, cam x, cam y, cam z] at T. */
  __cam(T: number): [number, string, number, number, number, number];
  /** Timing of every chapter and beat, and every sound cue sorted by time. */
  __info(): {
    total: number;                                  // seconds
    chapters: {
      id: string;
      start: number;                                // seconds from video start
      dur: number;
      beats: [key: string, start: number, dur: number, id: string][]; // start from chapter start
    }[];
    cues: { t: number; type: SfxName; arg?: number }[];             // t from video start
  };
  /** Voice clips sounding now: clip id, seconds into the clip, paused. Empty while paused. */
  __voice(): { id: string; offset: number; paused: boolean }[];
  /** The clock T in seconds. */
  __t(): number;
  /** The script as data: SCRIPT itself. Tools read chapter id, title, short,
   *  and per beat: id, say, card, speaker, stagger, dur. */
  __script(): ChapterScript[];
}
```

- `__script()` is one line in the player's debug globals: `window.__script = () => SCRIPT`. The [tools](../tools/setup.md) use it when the page has it. Without it, every tool needs `--script <path>/script/index.ts`. The reference repo lacks it (section 11).

- The stage MUST be one `<canvas id="cv">`. Its backing width is `min(1920, clientWidth x devicePixelRatio)`; height follows 16:9. A tool sets the viewport to get the size it needs.
- Clip lengths are served at `<base>durations.json`; clips at `<base><clipId>.wav`, where `<base>` is `import.meta.env.BASE_URL` (Vite `publicDir` is `voice/clips`). The site serves a video at `/<slug>/`, so a relative or root URL breaks there.
- Global beat id `= chapterId + '.' + key`. Absolute beat start `= chapter.start + beat.start`.

## 9. Files and commands

| Path | Content | Written by |
|---|---|---|
| `voice/refs/<speaker>.wav` + `.txt` | Frozen reference clip and its exact transcript | Casting, once: made fresh, or copied from an earlier production ([new project](new-project.md) section 5) |
| `voice/manifest.json` | One synthesis job per clip | `wm voice:manifest` |
| `voice/clips/<clipId>.wav` | Rendered clip (tracked: the site build needs it) | `wm voice:render` |
| `voice/clips/durations.json` | `{ [clipId]: seconds }`, 3 decimals (tracked) | `wm voice:render` |
| `voice/clips/index.json` | `{ [clipId]: "<hash>.r<renderVersion>" }` | `wm voice:render` |
| `voice/clips/failures.json` | `{ [clipId]: "what is still wrong" }` | `wm voice:render` |

Manifest entry:

```ts
interface ManifestEntry {
  id: string;          // clip id; file is voice/clips/<id>.wav
  beat: string;        // beat id
  speaker: SpeakerId;
  voiceKey: SpeakerId; // first cast key with this exact voice; aliases share it
  ref: string;
  refText: string;
  style?: string;
  text: string;        // spoken text: say ?? card, '*' and outer quotes removed
  hash: string;        // sha256(text, ref audio hash, refText, style), first 16 hex
}
```

Workmark commands live once, at the monorepo root (`D:\code\ai\video-lectures\.wm`). Each video command takes the video's slug as its project argument. Run them from anywhere in the repo. In this skill's docs, a bare `wm test` means `wm test <slug>`.

- `wm dev <slug>` — Vite dev server (interactive).
- `wm build <slug>` — `tsc --noEmit`, then `vite build` into the video's `dist/`.
- `wm test <slug>` — `vitest run`.
- `wm voice:manifest <slug>` — write `voice/manifest.json`.
- `wm voice:render <slug>` — manifest, then synthesize every missing or stale clip.
- `wm site:build` — every video at `dist/<slug>/` plus the series index, into the root `dist/`. `site:dev` and `site:preview` serve it.

Generated files MUST NOT be edited by hand.

## 10. Ownership for parallel work

Parallel agents MUST own disjoint files. Each works in its own git worktree. In the reference video, four chapter agents merged cleanly because ownership was disjoint.

| Files | Owner |
|---|---|
| `engine/**` except `engine/audio/music.ts`, `sfx.ts` and `synth.ts` (so including `engine/audio/voice*.ts`); `player/**`; `script/types.ts` (except `SpeakerId` and `SfxName`); `test/**` infrastructure (engine tests, `test/storyboard.test.ts`, `test/card-last.test.ts`); `tsconfig.json`, `vite.config.ts`, `.wm/**`; the board renderer `scenes/shared/board.ts` and the board fallback in `scenes/index.ts`; kit primitives (`kit/` files that draw no character and no symbol), `scenes/shared/speech.ts`, `scenes/shared/speechTiming.ts`; the `__script()` global; the voice pipeline code (`voice/*.py`, `voice/manifest.ts`, `voice/refs.ts`, `voice/pyproject.toml`, `voice/uv.lock`); the MP4 exporter ([export](export.md)) | The [engine owner](../roles/engine-owner.md): one Opus agent on its own brief, never a chapter animator |
| `SpeakerId` in `script/types.ts`, `script/cast.ts`, `voice/refs/**` | [Casting](../roles/casting.md). It declares the speaker ids at the start of preproduction (section 3). Frozen at cast lock; then `pad` passes to the editor. |
| `root` and `scale` of every chapter; `SfxName` and the vocabulary's Sounds table; `engine/audio/music.ts`, `engine/audio/sfx.ts`, `engine/audio/synth.ts`; generated voice files, written only by `wm voice:render` | [Sound engineer](../roles/sound-engineer.md). It runs the voice renders; it does not own the voice pipeline code. |
| `kit/` files that draw characters or vocabulary symbols; `scenes/shared/` files that draw symbols | The kit owner: one [animator](../roles/animator.md), named in the producer's brief for each round. It draws the characters and props the visual vocabulary defines. Chapter animators request changes; they do not edit. |
| Each chapter's `id`; chapter order in `script/index.ts` and `scenes/index.ts` (adding, removing, reordering chapters) | [Director](../roles/director.md) |
| `script/NN-<id>.ts`: `say`, `card`, `speaker`, `stagger`, beat order and ids, `title`, `short` | [Writer](../roles/writer.md). These change voice or timing. |
| `script/NN-<id>.ts`: `cam`, `camT`, `still`, `sfx`, `cues`, `dur` (a minimum) | That chapter's animator |
| `scenes/NN-<id>.ts`, `scenes/NN-<id>.*.ts` | That chapter's animator |
| `production/**` | Director, except: the visual vocabulary's symbols and the board picture fields ([art-director](../roles/art-director.md); the director on the lean track); the vocabulary's Sounds table (sound engineer); `notes-ledger.md`, `status.md` and `checks/<role>.md` (producer; see [notes to checks](../loops/notes-to-checks.md)). The producer also appends the human's decisions to `bible.md` ([bible](../documents/bible.md)). |

- A change to a shared file (kit, shared scenes, engine, types) goes to its owner as a request. The owner lands it first. Chapter work rebases on it.
- A new symbol or motif goes to the vocabulary owner before it is drawn ([visual vocabulary](../documents/style-guide/visual-vocabulary.md)). A new term goes to the director ([terminology](../documents/style-guide/terminology.md)).
- Voice clips (`*.wav`) are gitignored. A worktree has `durations.json`, so its timing is right, but it has no audio. Copy `voice/clips/*.wav` into the worktree if the agent needs sound.

## 11. Reference repo gaps

Where `D:\code\ai\video-lectures\videos\what-a-mind-is-made-of` does not yet meet this contract or the skill. A new project copies these gaps. The engine owner closes each one in [preproduction](../phases/preproduction.md) step 0, the only place they are scheduled, and reports the verify output.

In the commands, `<scratch>` is the agent's scratch folder and `<preview>` is a running preview of the build. Tool commands use the one form in [setup](../tools/setup.md): `pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools <tool> ...`.

| Gap | Close it | Verify |
|---|---|---|
| No `__script()` global. Tools need `--script`. | Add `window.__script = () => SCRIPT` to the player's debug globals (section 8). | `pnpm vite build --outDir <scratch>\build` in the project, then `pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools clip-check --build <scratch>\build --out <scratch>\cc`, with no `--script`. It MUST succeed. |
| `tsconfig.json` does not include `production/`. Board files are never type-checked. | Add `"production"` to `include`. Make `production/` first if the project has none. | Put `const x: number = 'a';` in a file under `production/storyboard/`; `wm build` MUST fail. Remove it; `wm build` MUST pass. |
| No test that fails on a beat after a card. Three chapters in the reference break that rule ([bible](../documents/bible.md) example, Open). | `test/card-last.test.ts`: a pure check `beatsAfterCard(chapters)` over `SCRIPT`. Exceptions are beat ids listed in the test, each citing a bible entry. | `wm test` passes. The test file also runs the check on a fixture chapter with a beat after its card and expects one violation. |
| No storyboard test and no vocabulary parser. | `test/storyboard.test.ts` with the failures in [storyboard](../documents/storyboard.md), "How it is checked". It parses the Symbols and Sounds tables of `production/style-guide/visual-vocabulary.md` ([visual vocabulary](../documents/style-guide/visual-vocabulary.md), "Format"). | `wm test` passes, with zero board files too. Fixture cases MUST each fail: an unknown symbol id, a `{id}` in frame text not in the vocabulary, a missing `purpose`, a sound the script uses (a beat's `sfx` or a chapter's `cues`) with no Sounds row. A fixture with an unused `SfxName` and no Sounds row MUST pass: the check fails only on a used sound. |
| No board renderer, board fallback, `?boards` or `?purpose` flag. | `scenes/shared/board.ts` and the fallback in `scenes/index.ts`, as in [animatic](../documents/animatic.md). | `wm build` passes. `pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --url "<preview>/?boards" --purpose --out <scratch>\a` and `pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --url "<preview>/?boards" --out <scratch>\b`. contact-sheet strips `?purpose` from `--url` by design ([contact-sheet](../tools/contact-sheet.md)); only `--purpose` turns the band on. QA looks at one sheet of each. The purpose band MUST show in `a` and MUST NOT show in `b`. |
| Music and sound effects are not a pure function of `T`. MP4 export needs that first. | The pure `score()` in [export](export.md) section 3. The engine owner builds `score()` and its test. The changes it needs in `engine/audio/music.ts`, `sfx.ts` and `synth.ts` (seeded noise, scheduling from the score) go to the sound engineer as a request (section 10). | A unit test: `score()` twice on the same timeline gives equal output. Then the determinism precheck in [export](export.md) section 6. |
