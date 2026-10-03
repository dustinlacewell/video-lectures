# MP4 export

> **NOT BUILT. This is a proposal.** No exporter exists in the reference repo (`D:\code\ai\cognition`). The audio part needs an engine change first (section 3). Build it as its own job, with a design pass and an adversary.

Goal: one MP4 that matches the live player frame for frame and sample for sample, plus a chapters list and a captions file for YouTube.

## First production on a new engine builds this

The first production that delivers an MP4 builds the exporter. Later productions copy it with the engine.

- **Owner:** the [engine owner](../roles/engine-owner.md) (contract section 10 lists the exporter as its file). Opus, its own brief.
- **Critic:** [QA](../roles/qa.md), in a [maker-critic loop](../loops/maker-critic.md). The engine owner never certifies its own export.
- **Needs first:** the pure `score()` (section 3). It is a readiness gap ([contract](contract.md) section 11), closed in [preproduction](../phases/preproduction.md) step 0.
- **When:** after the animatic is signed. The animatic has the real clips and the real timing, so the exporter is proven on the real video's length and audio before any animation is final.
- **Pass before delivery:** run `wm export` on the animatic build. QA runs all five checks in section 6 on that MP4 and records the results in `out/export.json`. All five pass. Only then does delivery export the final cut.

## Outputs

`wm export [--fps 30|60] [--size 1080|2160]` writes into `out/` (gitignored):

| File | Content |
|---|---|
| `out/<project>.mp4` | H.264 video + AAC audio, `+faststart` |
| `out/chapters.txt` | YouTube description chapter list |
| `out/captions.srt`, `out/captions.vtt` | Captions from the script |
| `out/export.json` | Settings, frame count, measured loudness, verification results |

## 1. Shape

Functional core, imperative shell:

- **Pure (Node, no browser):** frame times; voice-line placement; ducking windows; the music and sfx score; chapters text; captions text. All come from `SCRIPT`, `CAST` and `durations.json` through `buildTimeline` and `voiceLines`, the same way `wm voice:manifest` imports the script.
- **Shell:** headless Chromium (Playwright) for pixels and for `OfflineAudioContext`; ffmpeg for encode, loudness and mux.

## 2. Video

### A capture page

Add a second composition root, `player/capture.html` + `player/capture.ts`. It builds the same timeline and scenes as `player/main.ts`, but:

- no control bar, no audio, no clock loop;
- canvas size from the URL: `?w=1920` gives 1920 x 1080, `?w=3840` gives 3840 x 2160. The live player caps width at 1920 and follows `devicePixelRatio`, so it cannot give 4K or an exact size;
- the same debug globals (`engine/contract.md` section 8).

### Frame loop

```
N = ceil(total * fps)
for n in 0 .. N-1:
  T = n / fps
  __seek(T)
  bytes = frame from the canvas
  write bytes to ffmpeg stdin
```

- Before frame 0: `await document.fonts.ready`, then one `requestAnimationFrame`.
- Frame transfer: `canvas.toBlob('image/png')` → bytes to Node → ffmpeg `-f image2pipe -c:v png`. Raw RGBA (`-f rawvideo -pix_fmt rgba`) skips PNG encoding but moves about 8 MB per 1080p frame through the page bridge. Measure both on 100 frames; keep the faster.
- Stream. Do not write frame files to disk.
- Never `page.screenshot()`: it is slow and includes page chrome.

Video encode:

```
ffmpeg -f image2pipe -framerate <fps> -c:v png -i - \
  -c:v libx264 -preset slow -crf 18 -tune animation -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart out/video-only.mp4
```

Keep video and audio as separate steps, so an audio fix does not re-render frames.

## 3. Audio

### What blocks it today

The live audio is not a function of `T`:

- `auMusic(T, ch)` advances the sequencer at most one step per call, driven by the frame clock, and schedules each note at `ctx.currentTime`.
- Sound effects fire at `currentTime` when the clock passes a cue.
- The noise buffer (`engine/audio/synth.ts` `whiteNoise`) uses `Math.random`.
- Ducking follows which `HTMLAudioElement`s are live.

### The engine change

Add a pure score, used by both the live player and the exporter:

```ts
/** Every sound event of the video, from the timeline alone. */
score(tl: Timeline, clips: ClipLengths): {
  notes: { t: number; kind: 'tone' | 'hiss'; params: ... }[];  // music steps + sfx, absolute t
  pad: { t: number; root: number }[];                          // drone root changes at chapter starts
  voice: { clip: string; t: number; len: number }[];           // t = chapter.start + beat.start + line.at
  duck: [start: number, end: number][];                        // union of voice intervals
}
```

- Music steps: one every 0.52 s (`STEP`) at `n * STEP`, pitched from the chapter at that time, with the same pattern, octave and bass rules as `auMusic`. The live sequencer plays a step when the next frame crosses `n * STEP`, so live notes land up to one frame late; the score puts them on time.
- Sfx: `Timeline.cues` already holds absolute times.
- Noise: fill from `rng(seed)`, not `Math.random`.
- The live player then schedules from `score` a little ahead of the clock. One source of truth for both.

Also extend the debug contract so headless tools can see voice placement: `__info()` gains `lines: [clip: string, t: number][]`, or a new `__lines()` returns the `voice` list above.

### Offline render

In the capture page:

1. `new OfflineAudioContext(2, ceil(total * 48000), 48000)`.
2. Build the same graph as `auInit`: master gain 0.9 → compressor → destination; music bus; echo bus (delay 0.34 s, feedback 0.34, wet 0.4); pad with lowpass at 620 Hz.
3. Schedule every note and sfx at its `t`.
4. Decode each voice clip (`decodeAudioData`) and start it at its `t`. It plays to its own end, the same as the live stop rule.
5. Ducking: on the music bus, `setTargetAtTime(10^(-8/20), start, 0.08)` at each window start and `setTargetAtTime(1, end, 0.08)` at each end.
6. `startRendering()` → Float32 stereo → 48 kHz WAV bytes to Node → `out/mix.wav`.

### Loudness

YouTube normalizes to about −14 LUFS. Target −14 LUFS integrated, −1 dBTP true peak. Two-pass `loudnorm`:

```
ffmpeg -i out/mix.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -
ffmpeg -i out/mix.wav -af loudnorm=I=-14:TP=-1:LRA=11:measured_I=..:measured_TP=..:measured_LRA=..:measured_thresh=..:offset=..:linear=true -ar 48000 out/mix.norm.wav
```

### Mux

```
ffmpeg -i out/video-only.mp4 -i out/mix.norm.wav -c:v copy -c:a aac -b:a 192k -movflags +faststart out/<project>.mp4
```

Do not pass `-shortest`. The lengths must already agree; verification checks it.

## 4. Chapters file

From the timeline, in Node:

```
00:00 <chapter 0 title or short>
01:12 <chapter 1 title or short>
...
```

- One line per chapter, `M:SS` (or `H:MM:SS`), time = `floor(chapter.start)`.
- YouTube rules: the first line MUST be `00:00`; at least 3 chapters; each at least 10 s. Merge a shorter chapter into the next and say so in the report.

## 5. Captions file

From the script, not from speech-to-text:

- One cue per voice line. Start = the line's absolute `t`. End = `t + clip length`, not the beat end.
- Text = `spokenText(say ?? card)`. `*word*` becomes `<i>word</i>`.
- A non-narrator line gets the speaker's `name`: `ZOMBIE: Yes. Obviously.` A chorus line gets one cue with both names.
- Split long lines: at most 2 lines of 42 characters per cue. Split a long line into sequential cues, timed by word share.
- Write SRT (`00:01:02,345`) and VTT (`00:01:02.345`).

## 6. Verification

Run all of these after every export. Record results in `out/export.json`.

1. **Duration.** `ffprobe` video duration equals `N / fps`. `|N / fps - total| < 1 / fps`. The audio stream is within one frame of the video.
2. **Spot frames.** Pick 10 times: the midpoint of one beat in each chapter, plus the first and last frame. Snap each to a frame: `T = round(T * fps) / fps`. Decode that frame from the MP4 (`ffmpeg -ss T -frames:v 1`). Render the same `T` in the capture page at the same size. Compare. PSNR SHOULD be above 35 dB (H.264 loss only). Lower means a determinism bug or a frame offset.
3. **Audio sync, 3 points.** Pick three voice clips: early, middle, late. Cross-correlate each clip against the exported audio in a ±200 ms window around its scheduled `t`. The offset MUST be under 20 ms.
4. **Loudness.** `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`: integrated −14 ± 0.5 LUFS; true peak ≤ −1 dBTP.
5. **Determinism precheck** (before a long export): render 5 times twice each, once cold and once after seeking elsewhere first. The pixels MUST be identical.

## 7. Time and disk

Estimates for the reference video (7:06, 426.2 s). Measure on the first export and replace these.

| Setting | Frames | Capture time | MP4 size |
|---|---|---|---|
| 1080p30 | 12,786 | 20–35 min | 300–600 MB |
| 1080p60 | 25,572 | 40–70 min | 400–800 MB |
| 2160p30 | 12,786 | 1.5–2.5 h | 1–2 GB |

- Frame files are not written, so disk use is the MP4s plus the mix: 426 s of 48 kHz stereo float is about 160 MB.
- Keep 5 GB free on the output drive.
