# contact-sheet

Turns the video into what a cold viewer consumes: keyframe grids per chapter and a timestamped transcript. The cold viewer never sees the script source; this is their whole input. It also captures exact moments for an animator's self-check, and checks that every frame is a pure function of time.

## Contract it relies on

`__info()` for beat times, `__seek(T)` plus the canvas for frames, the script data for words and speakers (see [setup.md](setup.md)).

## Usage

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet (--url <url> | --build <dist>) [--script <path>] --out <dir> [options]
  --at 0.1,0.5,0.9       fractions of each beat to capture (the default: start, middle, end without fade frames)
  --times <t1,t2,...>    exact moments, in seconds from video start, instead of --at
  --chapter <id>         one chapter only; repeatable
  --twice                draw each captured frame twice and report frames that differ; exit 3 if any
  --purpose              show the animatic's purpose band (director's sheets only; see below)
  --thumb 480            thumbnail width in pixels
  --per-row <n>          thumbnails per row (default: the most frames any beat on the sheet has, at most 4)
  --beats-per-sheet 4    beats on one image; a chapter's sheets are balanced (10 beats -> 4, 3, 3)
```

About 30 s for a 7-minute video; about 40 s with `--twice`.

## The purpose band never reaches a cold viewer

The animatic's board renderer draws a band with the beat id and the board's purpose, but only when the page URL has `?purpose` ([engine contract](../engine/contract.md)). The purpose is the spine job in viewer-belief form. A cold viewer who reads it is no longer cold.

So contact-sheet always loads the page **without** `?purpose`, even when `--url` carries it. Other URL flags, such as `?boards`, stay.

`--purpose` turns the band on, for the director's own review of boards against purposes. **Warning: such sheets must never go to a cold viewer.** Each sheet then carries a red "DIRECTOR ONLY" bar, `transcript.md` carries the same line, and the run prints a warning. Write them to a folder of their own, so nobody mixes them up.

## `--times`: exact moments

Each time goes on the row of the beat playing at that moment. Sheets are named `sheets/times-<NN>-<chapter>-<part>.png`. No transcript is written. Times outside the video, or outside the `--chapter` you chose, are skipped with a warning. Use `--thumb 1280` to see a moment at full size.

## `--twice`: determinism check

Every frame must be a pure function of T, or scrubbing, export and every tool can show a different picture than playback. For each captured frame, the tool draws T, then draws a time half the video away and lets the page run two animation frames, then draws T again. It compares the two draws of T pixel for pixel, at full canvas size.

- `determinism.md` lists each frame that differs: time, beat, pixels changed, share of the frame.
- Exit code 3 if any frame differs.
- The check covers only the captured frames. Add `--at 0,0.25,0.5,0.75,0.999` for more per beat.
- Proof the check can fail: on a copy of the build whose `__seek` adds a random 6x6 square, every frame reports 72 changed pixels and the run exits 3.

## Examples

Animator, self-check of one chapter: the beat's middle and 0.05 s before its end, at full size, plus determinism:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build <scratch>\build --script <project>\script\index.ts --out <scratch>\check-physics --chapter physics --times 61.1,64.25 --thumb 1280 --twice
```

Critic (cold viewer or animation critic): the whole video, default frames, no purpose band:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build <scratch>\build --script <project>\script\index.ts --out <scratch>\cold
```

Producer, before a gate: the whole video with the determinism check. Exit 3 blocks the gate:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build <scratch>\build --script <project>\script\index.ts --out <scratch>\gate --twice
```

Director, boards against purposes (never for cold viewers):

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build <scratch>\build --script <project>\script\index.ts --out <scratch>\director-only --purpose
```

Leave out `--script` when the page has `__script()`.

## Exit codes

`0` done. `1` the run failed. `2` bad options or no script source. `3` `--twice` found a frame that differs.

## Output

- `sheets/<NN>-<chapter>-<part>.png`: one row per beat, labelled with the beat id and its start and end time; each frame labelled with its time. NN counts chapters from 1 in play order. About 1500 px wide, at most about 1400 px tall, so a vision model reads the captions.
- `sheets/times-<NN>-<chapter>-<part>.png` instead, with `--times`.
- `transcript.md` (not with `--times`): every beat in play order, one line each:
  - `[1:07.7] NARRATOR: In a physical world, ...`
  - `[4:05.1] YOU + ZOMBIE (together): Yes. Obviously. ...`
  - `[1:45.1] CARD (read aloud): ...`
  - `[1:04.3] TITLE CARD: Form is function`
  - `[0:00.0] (no words, 6.0 s)`

  Each chapter heading names its sheets.
- `determinism.md`, with `--twice`.

## How a critic uses it

Give the cold viewer `transcript.md` and the sheets in order, nothing else. They report what they now believe, and where they were bored, lost, or unconvinced, citing a time and a sheet path. Compare their beliefs with the spine.

An animation critic uses the same sheets to check each beat's frames against the storyboard and the visual vocabulary. Cite the sheet path and the frame time.

## Limits

- Three frames per beat miss motion between them. Use `frame-sweep` for framing and the animatic for motion.
- Character lines in speech bubbles appear in the transcript by speaker; the transcript does not say whether a line was shown as a caption or a bubble.
- `--twice` catches a frame that depends on earlier draws or on wall-clock time. It cannot catch a difference between a seek and real playback that both draws share.
