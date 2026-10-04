# guard

Proves a finished video's pixels have not moved. Samples about 60 pinned moments (even spacing, every chapter boundary, every beat midpoint, the last frame), hashes each frame's raw pixels, and compares the hashes to the blessed golden. Also compares `__info()`'s total runtime and every beat's start time.

See [guards.md](../../future-work/studio/guards.md) for the design and why goldens, not version pins.

## Contract it relies on

`__info()` for beat times and runtime, `__seek(T)` plus the canvas for frames (see `setup.md`).

## Usage

```
pnpm --dir studio\tools guard (--url <url> | --build <dist>) [--script <path>] --out <dir> [--golden <dir>]
pnpm --dir studio\tools guard:bless (--url <url> | --build <dist>) [--script <path>] --out <dir> --golden <dir> [--force]
```

Run through workmark instead of pnpm directly:

```
wm guard <slug>
wm guard:bless <slug> [--force]
wm guard <slug> --control
```

`wm guard` and `wm guard:bless` type-check and build the video first, then run the tool against `dist/`.

## `wm guard`

Builds, opens the page, and for every sample in `videos/<slug>/golden/frames.json`:

- hashes the canvas's raw RGBA pixels at full resolution (SHA-256) and compares to the golden hash;
- compares `__info().total` and every beat's chapter + key + start time to the golden's recorded digest.

Exit 0 if every sample matches and `__info()` is unchanged. Exit 3 with one line per differing sample (time, clock, why it was sampled) and a note if `__info()` changed.

`--golden <dir>` overrides the default (`<out>/../golden`; `wm guard` passes `videos/<slug>/golden`).

## `--control`: negative control

`wm guard <slug> --control` ignores the golden. It hashes the frame at a sample time and at that time plus half the video (wrapping), and the run must find them different. This proves the hash is sensitive to the frame, not comparing a constant to itself. Exit 3 if the two hashes match.

## `wm guard:bless`

Builds, captures every sample time fresh, and writes `videos/<slug>/golden/frames.json` plus up to 12 reference PNGs (480px wide by default, `--ref-width`) under `golden/png/`, evenly spread across the samples. The PNGs are for a human to look at; nothing reads them back.

Refuses when the working tree has uncommitted changes outside `golden/` — bless after a human has watched the result and the rest of the change is already committed. `--force` skips the check.

## Output: `videos/<slug>/golden/`

```
frames.json   tracked: blessedAt, commit, libraryHash (shown, never enforced), info digest, one { t, why, frame } per sample
png/          tracked: up to 12 reference PNGs, regenerated at every bless
```

## Sample set

About 60 times: ~40 evenly spaced, each chapter start +-0.2s, every beat's midpoint, and the last frame. Deduplicated to one sample per instant.

## Exit codes

`0` done, matches the golden. `1` the run failed. `2` bad options, no script source, or (bless) a dirty tree without `--force`. `3` a sample's pixels or `__info()` differ from the golden, or (`--control`) the two sampled frames matched when they must not.

## How the librarian uses it

Run `wm guard --all` style sweeps before any library or engine change lands (today: the one video). A pixel difference is not itself a defect — the human watches the new frames and either fixes the change or runs `wm guard:bless` to accept it.

## Limits

- Pixel goldens are blessed and checked on one machine: text rendering (hinting, antialiasing) differs across machines even with the same font file. A CI-safe check compares only `__info()`; see guards.md for the planned `guard:data`.
- A hash match proves the bytes are identical; it says nothing about whether a change is good. That judgment is the human's, at bless time.
