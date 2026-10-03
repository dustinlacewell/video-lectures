# pacing-curve

Measures pacing as a whole-video curve: per beat, how dense the words are, how long the silence before each line is, and how long the picture has gone without a visual change. Per chapter: runtime, share of the video, words per second.

## Contract it relies on

`__info()` for beat times, `__seek(T)` plus the canvas for frames, the script data for words and kinds, and clip lengths (`durations.json`) for speech and silence. See `setup.md`.

## How it works

- Kind per beat: narration, character (one non-narrator speaker), chorus (several together), card, title, visual (no words).
- Words/s: words in the beat's line or card, over the beat's length.
- Speech: from the beat start to the end of its last clip (clip offset plus length).
- Silence before a line: from the previous spoken clip's end to this beat's first clip.
- Visual-change proxy: every `--visual-step` seconds the canvas is drawn at 160 px wide in grey. Each frame is compared with the frame of the last significant change. A change is significant when more than `--share` of pixels move by more than `--delta` grey levels. Comparing with the last change, not the previous frame, makes slow drift add up. Per beat, "still" is the longest time since a change seen in the beat. Each chapter starts fresh.

## Usage

```
pnpm pacing-curve --build <dir> [--script <project>/script/index.ts] --out <dir> [options]
  --visual-step 0.5   seconds between frames for the visual proxy
  --delta 12          grey levels a pixel must move
  --share 0.03        share of pixels that must move
  --title <text>      chart title
  --chapter <id>      one chapter only
```

About 40 s for a 7-minute video.

## Output

- `pacing.html`: one self-contained page, no external files. Three panels on one time axis with chapter bands: words/s per beat (bars, dashed video mean), seconds since the last visual change (line), silence before each line (dots). Hover any mark for its beat. A chapter table below.
- `pacing.md`: chapter table, densest and sparsest beats, longest stills, longest silences.
- `beats.csv`: chapter, beat, kind, start, dur, words, words_per_s, speech_s, gap_s, max_still_s, visual_changes.
- `chapters.csv`: chapter, title, start, dur, share_pct, beats, words, words_per_s, speech_s, max_still_s.
- `visual.csv`: t, changed_share, since_change_s, for tuning the proxy.

## How a critic uses it

Compare `chapters.csv` share with each chapter's weight in the spine: a minor chapter with a large share is a cut candidate. Flag beats far above the mean words/s (rushed) and long stills or long silences that the storyboard does not call for (dead). Cite the beat id and the CSV row. Read the curve for rhythm: a long flat stretch of equal bars is monotony.

## Limits

- The visual proxy counts pixels, not ideas. Camera drift and idle motion count as change; a new idea drawn small may not. It cannot tell a new idea from a reinforcement; that judgement stays with the critic.
- Words/s over the beat length mixes speech rate with the pad after the line. Speech rate alone is words over `speech_s`.
- Beats with a missing clip show 0 speech and no silence value. Run `clip-check` first.
