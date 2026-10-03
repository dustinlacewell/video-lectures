# Guards

Not built. Proposal.

A guard keeps a finished video stable when the library or the engine changes. Two options were weighed: golden frames per video, and version pinning. Recommendation: golden frames, with a data guard for CI. Reasons below.

## Option A: version pinning

Each video pins `@studio/library@1.4.0`. A finished video never sees a new library.

- Needs real releases: a version per promotion, published tarballs or git tags, and several versions of one package in one pnpm workspace. `workspace:*` cannot do that; it always links the current tree.
- The site builds every video from one tree in one job (`site/build-all.ts`). With pins, the build needs N library checkouts.
- Fixes never reach old videos. The safe-area clamp, a bubble fix, a mouth fix: a finished video keeps the bug.
- A finished video is safe by construction, which is the one real advantage.

## Option B: golden frames

Each finished video keeps a set of sample frames. A change anywhere rebuilds the video and compares. A difference is a failure until a human watches and blesses it.

- One tree, one build, fixes flow everywhere.
- The parity tool already does this (studio-design A3). It reached zero differing pixels on 66 samples with a negative control. Frames are deterministic on one machine.
- Cost: one headless build and about 160 frames per video, one to two minutes. Linear in the number of finished videos.
- Weakness: it finds a change; it does not say whether the change is good. The human decides at bless time. That is the right place: the human already watches drafts.

## Recommendation: goldens, plus a data guard

Goldens for pixels on the dev box. A data guard everywhere, including CI.

```
videos/<slug>/golden/
  frames.json       tracked: samples and hashes
  png/              gitignored: the blessed frames, regenerated at bless so diffs can be shown
```

```ts
export interface Golden {
  blessedAt: string;              // ISO date
  commit: string;                 // the video repo commit blessed
  libraryHash: string;            // packages/library content hash at bless time; shown, never enforced
  info: string;                   // sha256 of __info() (timeline, beats, cues)
  samples: { t: number; why: string; frame: string; cam: string }[];   // why: 'even' | 'chapter-start' | 'beat-mid:physics.ghost' | 'action-end:ghostFail' | 'last'
}
```

Sample set per video: 40 even times; each chapter start ±0.2 s; every beat midpoint; every action start and end (once actions exist); `total − 0.001`. About 160 for the first video.

Commands (`packages/tools/guard`, the revived parity tool made permanent):

- `wm guard <slug>`: build, serve, `__info()` hash, `__cam(t)` and frame hash at every sample. Pass: all equal. Fail: before/after/diff PNGs in `.scratch/guard/<slug>/`, one line per differing sample, plus the control (frame at `t` must differ from `t + 0.5`).
- `wm guard --all`: every video whose `golden/frames.json` exists. Run before any library or engine commit lands. The librarian's step 7.
- `wm guard:bless <slug>`: after a human watch. Rewrites `frames.json` and `png/`. Refuses if the working tree is dirty.
- `wm guard:data <slug>`: `__info()` and `__cam` only. No pixels. Runs in CI.

## Why pixels stay on the dev box

Text rendering differs across machines even with the same font file (hinting, antialiasing). Goldens blessed on Windows would fail on the GitHub Actions runner for no reason. So CI runs `guard:data`, which is machine-independent: the timeline, the cues and the camera path. Pixel guards run where the frames were blessed. The Pages workflow fails on a data change; a pixel change needs the dev box, which is where the human blesses anyway.

## Locks

`production/locks.json` lists element ids the human has locked (a chapter, a beat, a line). The guard treats a locked element's samples as blocking; an unlocked video's samples are warnings. A delivered video is locked whole. During production, the guard reports and the producer reads the line count.

## Interaction with harvest

A promotion that moves code out of a video and generalizes it must leave the video's pixels unchanged. The guard proves it. The bean gaining `anchors()` and `wear` must not move a pixel of the first video: no bean wears anything there. If the librarian wants a visual improvement to reach an old video (the bubble clamp), it is a change order: the human watches, then blesses.
