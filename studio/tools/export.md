# export

Renders the video to an MP4 with its own voice, music and sound effects. Also writes a YouTube chapter list and captions. The design it follows is [export](../engine/export.md); this file says what is built.

## Contract it relies on

- `__info()`: chapters, beats, `total`, and `cues` (every sound effect, absolute time).
- `__seek(T)`: draws T. Frames are a pure function of T.
- `__synth()`: the player's synth, so the music and sound effects render offline (see Audio). Without it the tool writes a voice-only track and says so.
- The script as data (`__script()` or `--script`), and `durations.json` next to the page. Voice clips are fetched from the page folder, `<clip id>.wav`, the same files the player plays.
- The cast module (`CAST`, for speaker names in captions): `--cast`, else `cast.ts` next to `--script`.

## Video

- Opens `--workers` headless pages at 1920 x 1080 with a device scale that makes the canvas exactly `--width` pixels wide. The player caps its canvas at 1920.
- For each frame n: `T = n / fps`, `__seek(T)`, `canvas.toDataURL('image/png')`. Pages draw in parallel; frames go to ffmpeg's stdin in order. No frame files.
- x264, CRF 18, preset medium, `-tune animation`, yuv420p, BT.709, `+faststart`. Frames: `ceil(total * fps)`.

## Audio

- Voice: each clip starts at chapter start + beat start + `k * stagger` (speaker k), and plays to its end. Clips with no length in `durations.json` are skipped, as the player skips them. Clips are resampled to 48 kHz and summed in Node.
- Music and sound effects: in the page, an `OfflineAudioContext` (48 kHz, stereo) stands behind a proxy whose `currentTime` is a virtual clock. `__synth().init()` builds the player's own graph on it, with `Math.random` seeded (the noise buffer). The clock then walks the timeline the way playback does: pad on at 0; each sound cue at its exact time; the sequencer every 1 ms (a note lands within 1 ms of its step; live, within one frame); music ducked over the union of voice clips. Two renders differ by at most 3e-7 (about -130 dBFS).
- Mix = synth output + voice at unity, as in the browser. Loudness: two-pass `loudnorm` to -14 LUFS integrated (linear when no peak would clip, else loudnorm's dynamic mode), then a -3 dBFS sample limiter, because the resample and the AAC encoder raise the peaks again. AAC 192k. Reference video: -14.1 LUFS, -1.6 dBTP.

## Measured (reference video, 426.2 s, 1080p30, 16 cores, 8 workers)

- Frames: 24.5 fps, 8.7 min for 12,787 frames. Offline music and voice: 57 s. Whole run: 11.6 min.
- MP4: 1.07 GB at CRF 18. The moving film grain costs most of the bits.
- Spot frames: 36.0-38.0 dB PSNR.

## Usage

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools export (--url <url> | --build <dist>) [--script <project>\script\index.ts] --out <dir> [options]
  --fps 30            frames per second
  --width 1920        canvas width, at most 1920
  --from <s> --to <s> render only this slice
  --no-music          voice only
  --workers 4         parallel pages; 8 gives about 30 fps on 16 cores
  --crf 18 --preset medium
  --name <name>       output name (default: the project folder of --script)
  --cast <file.ts>    module exporting CAST
  --reuse-video       keep the rendered frames in <out>\work; redo only audio, mux and checks
```

Build the player with base `/` first: `pnpm --dir <project> exec vite build --outDir <scratch>\build`.

## Examples

A 10 s check of a busy stretch:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools export --build <scratch>\build --script <project>\script\index.ts --out <repo>\out --from 25 --to 35 --workers 8
```

The whole video:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools export --build <scratch>\build --script <project>\script\index.ts --out <repo>\out --workers 8
```

## Output

- `<name>.mp4` (a slice: `<name>.<from>-<to>.mp4`).
- `chapters.txt`: `m:ss Title` lines for the description. The first is `0:00`. A chapter under 10 s merges into the next (the tool prints which).
- `captions.srt`, `captions.vtt`: one cue per voiced beat, clip start to clip end. Character lines carry `NAME:`, a chorus `YOU & ZOMBIE:`. `*word*` becomes `<i>word</i>`. At most two lines of 42 characters per cue; longer lines split into cues timed by word share.
- `export.json`: settings, frame count, timings, frames per second, loudness before normalizing, the voice clips in the slice with their times, and the checks.
- `work\<name>.video.mp4` (frames only) and `work\<name>.mix.wav` (32-bit float mix before normalizing).

## Checks (in export.json)

- `duration`, `frames`, `audioDuration` from ffprobe; `wholeMinusTotal` for a full render (must be under one frame).
- `loudnessI`, `truePeak` of the MP4 (EBU R128).
- `psnr`: the first and last frame and up to 8 beat midpoints, decoded from the MP4 and compared with a fresh `__seek` capture. H.264 loss alone gives about 36-39 dB; much lower means a determinism bug or a frame offset.

Not built yet from [export](../engine/export.md) section 6: audio cross-correlation per clip, and the cold/warm determinism precheck (`contact-sheet --twice` covers it).

## Exit codes

`0` done. `1` the run failed. `2` bad options. A failed music render does not fail the run: the MP4 is voice only and `export.json` has `musicWarning`.
