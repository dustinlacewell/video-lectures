# frame-sweep

Steps through the video at a fixed time step and finds drawn text and images that the frame edge cuts, or that sit inside the safe margin. This is the "label half off screen" note, caught by a machine.

## Contract it relies on

`__info()` and `__seek(T)`. Every frame must be a pure function of T, so a seek draws exactly what playback shows. The video must draw on a 2D canvas.

## How it works

1. An init script wraps `fillText`, `strokeText` and `drawImage` on the 2D canvas context. For each call on the video canvas it records the box in screen pixels: text boxes come from `measureText` (actual glyph bounds, so alignment and baseline count), mapped through the current transform (camera, zoom, rotation).
2. For each sample time it seeks with recording on and classifies each box: inside, in the margin, cut by the edge, wholly outside (not visible, ignored), or a frame-sized backdrop image (ignored).
3. Hits of the same text in consecutive samples join into a time range. Ranges shorter than `--min` are dropped as slides: a label leaving the frame with a camera move.
4. For the worst ranges it writes the frame of the worst moment with the box outlined.

## Usage

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools frame-sweep (--url <url> | --build <dist>) [--script <path>] --out <dir> [options]
  --step 0.1              seconds between samples
  --chapter-step id=0.05  a finer step for one chapter; repeatable
  --margin 16             safe margin, in pixels of the reference frame
  --ref-width 1280        width of the reference frame (the project's virtual width)
  --min 0.4               shorter ranges are ignored as slides
  --max-shots 60          marked frames to write, worst first
  --chapter <id>          one chapter only; repeatable
```

About 1 minute for a 7-minute video at 0.1 s.

## Examples

Animator, self-check of one chapter at a finer step:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools frame-sweep --build <scratch>\build --script <project>\script\index.ts --out <scratch>\sweep-physics --chapter physics --step 0.05
```

Critic (QA), the whole video:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools frame-sweep --build <scratch>\build --script <project>\script\index.ts --out <scratch>\sweep
```

Producer, proof the sweep can fail before trusting a clean result. This run must report margin ranges:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools frame-sweep --build <scratch>\build --script <project>\script\index.ts --out <scratch>\sweep-control --margin 120
```

Leave out `--script` when the page has `__script()`.

## Exit codes

`0` done. `1` the run failed. `2` bad options or no script source. Findings never change the exit code: read `sweep.md`.

## Output

- `sweep.md`: counts, then one line per range: time span, beat, text, edges crossed, depth in reference pixels, worst moment, and the marked frame path. Cut ranges first, then margin ranges.
- `sweep.json`: the same, with boxes, plus settings and draw counts.
- `frames/<NN>.png`: the marked frame for finding NN (red: cut, amber: margin).

The header states how many text draws were recorded. Zero text draws means the instrumentation saw nothing (wrong canvas, or text drawn another way) and the result is void.

## How a critic uses it

Each cut range is a defect unless the storyboard says the text leaves the frame on purpose. Cite the range line and the frame path. Margin ranges are softer: check them against the style guide's framing rule. A clean result proves only that drawn text and images stay in frame; it says nothing about shapes.

## Limits

- Vector shapes (characters, bubbles' backgrounds, props drawn with paths) are not measured. Only text and images are. A bubble whose background is cut while its text is not goes unseen.
- A clip region (`ctx.clip()`) can hide text the sweep counts as visible.
- Rich text drawn as several runs reports each run as its own text.
- `globalAlpha` near 0 skips a draw; a transparent `fillStyle` does not.
- Proof the check can fail: run it with `--margin 120`; it then reports margin ranges.
