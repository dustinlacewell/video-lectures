# clip-check

Compares the timeline the player actually built with the voice clips. It catches lines that fell back to estimated timing, clips cut off by their beat, dead air, script `dur` values that override the voice, and clips no beat uses.

## Contract it relies on

- Beat lengths from the page's `__info()`: the timeline the player built, after the voice clip lengths were applied.
- Clip lengths from `durations.json` next to the page (what the player itself loaded), or `--durations <file>`.
- Which clips each beat should play, from the script data and the contract's clip naming rule (see `setup.md`).
- Optional: the voice manifest (`--manifest`, a JSON array of `{ id }`), to find clips that were planned but never rendered.

`__voice()` is not used: it reports only clips sounding during playback, so it is empty after a headless seek.

## Checks

- Missing: a spoken beat or card with any clip absent. The beat then runs on the script's estimated timing.
- Runs past its beat: clip offset plus length is longer than the beat. The line is cut or overlaps the next beat.
- Dead air: the beat is more than `--dead-air` times its speech. Cards often trip this on purpose: the engine keeps a card's reading time.
- Script dur wins: the script's `dur` is longer than clip plus pad. Someone timed the beat before the voice existed, or the visual needs the time. Each one is a decision to confirm.
- Orphans: clip lengths that no beat uses (renamed or deleted beats).
- With `--manifest`: manifest entries with no clip (not rendered), and expected clips the manifest lacks.

## Usage

```
pnpm clip-check --build <dir> [--script <project>/script/index.ts] --out <dir> [options]
  --manifest <project>/voice/manifest.json
  --dead-air 2        ratio of beat length to speech
  --pad 0.6           quiet the engine adds after a line (the contract default)
  --chapter <id>      one chapter only (orphans are still judged against the whole video)
```

Takes a few seconds.

## Output

- `clips.md`: counts, then one line per finding with beat id and start time.
- `clips.json`: the same findings as data.

## How a critic uses it

Missing, runs-past and orphans are defects: fix before the animatic gate. For each dead-air or dur-wins line, check the storyboard: if no visual needs the time, shorten the beat. Cite the beat id and the line.

## Limits

- The check trusts `durations.json`. It does not open the audio files; a clip that ends mid-word is the voice verify loop's job.
- Per-speaker pads are not read; one `--pad` applies to all speakers.
