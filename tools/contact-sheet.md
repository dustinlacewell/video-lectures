# contact-sheet

Turns the video into what a cold viewer consumes: keyframe grids per chapter and a timestamped transcript. The cold viewer never sees the script source; this is their whole input.

## Contract it relies on

`__info()` for beat times, `__seek(T)` plus the canvas for frames, the script data for words and speakers (see `setup.md`).

## Usage

```
pnpm contact-sheet --build <dir> [--script <project>/script/index.ts] --out <dir> [options]
  --at 0.1,0.5,0.9       fractions of each beat to capture (default; start, middle, end without fade frames)
  --thumb 480            thumbnail width in pixels
  --per-row <n>          thumbnails per row (default: frames per beat, at most 4)
  --beats-per-sheet 4    beats on one image; a chapter's sheets are balanced (10 beats -> 4, 3, 3)
  --chapter <id>         one chapter only; repeatable
```

About 30 s for a 7-minute video.

## Output

- `sheets/<NN>-<chapter>-<part>.png`: one row per beat, labelled with the beat id and its start and end time; each frame labelled with its time. NN counts chapters from 1 in play order. About 1500 px wide, at most about 1400 px tall, so a vision model reads the captions.
- `transcript.md`: every beat in play order, one line each:
  - `[1:07.7] NARRATOR: In a physical world, ...`
  - `[4:05.1] YOU + ZOMBIE (together): Yes. Obviously. ...`
  - `[1:45.1] CARD (read aloud): ...`
  - `[1:04.3] TITLE CARD: Form is function`
  - `[0:00.0] (no words, 6.0 s)`

  Each chapter heading names its sheets.

## How a critic uses it

Give the cold viewer `transcript.md` and the sheets in order, nothing else. They report what they now believe, and where they were bored, lost, or unconvinced, citing a time and a sheet path. Compare their beliefs with the spine.

An animation critic uses the same sheets to check each beat's frames against the storyboard and the visual vocabulary. Cite the sheet path and the frame time.

## Limits

- Three frames per beat miss motion between them. Use `frame-sweep` for framing and the animatic for motion.
- Character lines in speech bubbles appear in the transcript by speaker; the transcript does not say whether a line was shown as a caption or a bubble.
