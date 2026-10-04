# Porting a single-file prototype

How to turn a prototype video (one HTML file with a canvas and inline script) into a project that honors the [engine contract](contract.md), with proof that nothing on screen changed. The reference video started this way: a 1,680-line HTML file, ported into `D:\code\ai\video-lectures\videos\what-a-mind-is-made-of` at commit `10736a2`.

The port changes the code's shape only. Every intentional change waits until the port is proven and committed.

## Two tracks, in parallel

| Track | Who | Output |
|---|---|---|
| Port | recon agent, then the [engine owner](../roles/engine-owner.md), then [QA](../roles/qa.md) | the contract project, pixel-identical to the prototype |
| Harvest | [director](../roles/director.md), in the development phase | bible candidates and a draft spine from the prototype's script and the human's earlier threads |

The harvest reads the prototype and the human's material. It writes only `production/` documents. It does not touch code. The port does not apply any harvested decision. Both tracks meet after the port commit: from then on, harvested decisions become script and scene changes through the normal roles.

## The procedure

1. **Recon** (Sonnet). Map the prototype and report:
   - its tech (canvas size, fonts, audio, timing source);
   - its structure (chapters, beats, how a beat's length is set, camera, sound cues);
   - the full script text, in order;
   - its debug globals (`__seek`, `__info`, `__cam`) and where its cue list lives;
   - every `Math.random`, `Date.now` and state kept between frames.
   The report goes into the engine owner's brief. It is not a document.
2. **Make the prototype comparable.** The parity tool drives both pages through `__seek(T)`, `__info()` and `__cam(T)`. The reference prototype already had these three globals. If a prototype lacks one, the engine owner adds it to a copy of the prototype: globals only, no drawing change. The copy is the original from then on.
3. **Port** (engine owner, Opus). Split the file into the contract layout ([contract](contract.md) section 2): `script/`, `kit/` and `scenes/` in the new video; the player and the generic runtime go to `@studio/engine`, generic characters and props to `@studio/library`, both already built by the first ported video. Rules:
   - No visual change. A bug in the prototype is ported as it is and listed in the report. It is fixed after the port commit, in its own commit (reference: `7c8ed90`, "visitor jumps, double fades, dead code").
   - Pin the old timeline: capture the prototype's `__info()` and cue list into `test/fixtures/original-timeline.json` (`node tools/parity.ts --write-fixture`), and assert in `test/timeline.test.ts` that the port's total, chapter and beat starts and durations, and cues equal it.
4. **Prove** (QA, Sonnet). Run `wm parity`. Pass rule:
   - timelines, cues, DOM text and cameras: identical;
   - frames: 0 differing pixels at every sampled time, or each differing frame explained as antialias noise (a few edge pixels, small `maxDelta`; QA looks at the diff image);
   - negative control: reports differing pixels (above 0).
   QA reports the tool's summary lines. The engine owner never certifies its own port.
5. **Commit.** One commit for the port, with the result in the message. Reference: "Pixel-identical to the original HTML (wm parity: 0 of 66 frames differ, runtime 582.36 s)."
6. **Delete the proof** when the first intentional change starts. It now pins the old video and fails on every real change. Delete in the same series:
   - `tools/parity.ts`, `.wm/commands/parity.ts`, and its dev dependencies (`pngjs`);
   - `test/fixtures/original-timeline.json` and the tests that read it;
   - comments that name the parity tool.
   Reference: `3dcb7df`, `f5c743e`, `5195825`.

## The parity tool

One temporary file in the video repo, `tools/parity.ts`, about 190 lines. Recover the reference version with `git -C D:\code\ai\video-lectures\videos\what-a-mind-is-made-of show 10736a2:tools/parity.ts` and adapt it. Its design:

- **Command.** `.wm/commands/parity.ts` runs `pnpm vite build`, then `node tools/parity.ts`. Env: `ORIGINAL_HTML` (path to the prototype), `PARITY_DPR` (default 2).
- **Pages.** Vite `preview` serves the build. The prototype opens from `file://`. Both open in one headless Chromium context: viewport 1280 x 900, `deviceScaleFactor` 2.
- **Ready.** Load each web font by name, await `document.fonts.ready`, wait two animation frames, then check the font loaded. Throw if not. A fallback font wraps text differently and fails every frame.
- **Checks, in order.** Each structural difference is one failure line.
  1. Timeline: `__info()` total, each chapter's start and duration, each beat's `[key, start, dur]`. Exact.
  2. Sound cues: the port's `__info().cues` against the prototype's cue list, joined as `t|type|arg` lines. Exact. The reference prototype kept its cues private; an init script wrapped `Array.prototype.sort` and recorded the cue array when the page sorted it at boot.
  3. Page text: the script panel, chapter chips and scrubber max. Exact.
  4. Cameras: `__cam(T)` at every sampled time. Exact.
  5. Frames: `__seek(T)`, then the canvas as PNG, in both pages. Count pixels where any channel differs. Write `out/parity/diff-<T>.png` for each frame that differs (differing pixels red, the rest dimmed). Report the worst frame and its `maxDelta`.
- **Sampled times** (66 in the reference):
  - 40 evenly spaced over the runtime, from 0.37 s;
  - 0.2 s before and after every chapter start, which lands mid-fade;
  - one per chapter at the fourth beat's start + 0.9 s, which lands mid camera move;
  - the last frame, `total - 0.001`.
- **Negative control.** Compare the prototype at the middle sample `t` with the port at `t + 0.5`. Zero differing pixels means the diff cannot fail. That is a failure.
- **Exit.** Exit code 1 on any structural failure. Frame mismatches are printed for QA to judge by the pass rule above.
