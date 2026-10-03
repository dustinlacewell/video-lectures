# pacing-curve

Measures pacing as a whole-video curve: per beat, how dense the words are, how long the silence before each line is, and how long the picture has gone without a pixel change. Per chapter: runtime, share of the video, words per second. For the whole video: the measured speaking rate, the number a writer budgets the next script with.

## Contract it relies on

`__info()` for beat times, `__seek(T)` plus the canvas for frames, the script data for words and kinds, and clip lengths (`durations.json`) for speech and silence. See [setup.md](setup.md).

## How it works

- Kind per beat: narration, character (one non-narrator speaker), chorus (several together), card, title, visual (no words).
- Words/s per beat: words in the beat's line or card, over the beat's length.
- Speech: from the beat start to the end of its last clip (clip offset plus length).
- Silence before a line: from the previous spoken clip's end to this beat's first clip.
- Speaking rate: spoken words over the runtime measured (all chapters, or the `--chapter` ones). Per speaker: the speaker's words over the speaker's clip seconds, and over the runtime. A chorus line counts for each speaker in it. A card counts for the narrator, who reads it.
- Visual-change proxy: every `--visual-step` seconds the canvas is drawn at 160 px wide in grey. Each frame is compared with the frame of the last significant change. A change is significant when more than `--share` of pixels move by more than `--delta` grey levels. Comparing with the last change, not the previous frame, makes slow drift add up. Per beat, "still" is the longest time since a change seen in the beat. Each chapter starts fresh.

## The visual measure counts pixels, not ideas

The visual-change proxy measures pixels that moved. It cannot judge whether a beat shows a new idea or repeats one. A camera drift or an idle wobble counts as change; a new idea drawn small may not. "No new idea" and "reinforcement" are judgements for the script-editor and the director, not numbers from this tool. On static animatic boards the proxy means little; ignore it there.

## Usage

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools pacing-curve (--url <url> | --build <dist>) [--script <path>] --out <dir> [options]
  --visual-step 0.5   seconds between frames for the visual proxy
  --delta 12          grey levels a pixel must move
  --share 0.03        share of pixels that must move
  --title <text>      chart title
  --chapter <id>      one chapter only; repeatable
```

About 40 s for a 7-minute video.

## Examples

Animator, self-check of one chapter's stills and silences:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools pacing-curve --build <scratch>\build --script <project>\script\index.ts --out <scratch>\pacing-physics --chapter physics
```

Critic (editor), the whole video:

```
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools pacing-curve --build <scratch>\build --script <project>\script\index.ts --out <scratch>\pacing --title "Cut 3"
```

Producer, the speaking rate for the next writer brief: run the critic's command, then read the bold line at the top of `pacing.md`.

Leave out `--script` when the page has `__script()`.

## Exit codes

`0` done. `1` the run failed. `2` bad options or no script source. Pacing findings never change the exit code.

## Output

- `pacing.md`: first the speaking rate, in bold: spoken words per second of runtime, then a table per speaker (lines, words, audio seconds, words/s of audio, words/s of runtime). Then the chapter table, densest and sparsest beats, longest stills, longest silences.
- `pacing.html`: one self-contained page, no external files. Three panels on one time axis with chapter bands: words/s per beat (bars, dashed video mean), seconds since the last visual change (line), silence before each line (dots). Hover any mark for its beat. A chapter table below.
- `beats.csv`: chapter, beat, kind, start, dur, words, words_per_s, speech_s, gap_s, max_still_s, visual_changes.
- `chapters.csv`: chapter, title, start, dur, share_pct, beats, words, words_per_s, speech_s, max_still_s.
- `visual.csv`: t, changed_share, since_change_s, for tuning the proxy.

The reference video measures 1.94 spoken words per second of runtime (826 words in 7:06.2). Its narrator speaks 3.06 words per second of audio.

## How a writer and a critic use it

The writer budgets a script with the bold rate: words = target seconds x rate. Use the rate of a finished video with the same voices; the engine's estimate before voice runs long.

The critic compares `chapters.csv` share with each chapter's weight in the spine: a minor chapter with a large share is a cut candidate. Flag beats far above the mean words/s (rushed) and long stills or long silences that the storyboard does not call for (dead). Cite the beat id and the CSV row. Read the curve for rhythm: a long flat stretch of equal bars is monotony.

## Limits

- Words/s over the beat length mixes speech rate with the pad after the line. Speech rate alone is words over `speech_s`.
- Clip seconds include each clip's lead-in and tail, so words/s of audio reads a little low.
- Beats with a missing clip show 0 speech and no silence value, and drop out of the speaker rows (the note under the table counts them). Run `clip-check` first.
