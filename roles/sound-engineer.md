# Sound engineer

Renders every voice line from the frozen cast, verifies each clip, and
writes the clip lengths the timeline uses. Owns the video's sound
vocabulary: each sound-effect name has one meaning, and each chapter's
music key. Owns the music and sound-effect code (`engine/audio/music.ts`,
`sfx.ts`, `synth.ts`) and tunes it in post. The chapter's
[animator](animator.md) places the sound cues.

## Model tier

- **Sonnet** for voice renders: manifest, render, verify, re-roll. The
  steps are fixed and documented.
- **Opus** for the Sounds table and for changes in
  `engine/audio/music.ts`, `sfx.ts` and `synth.ts`.

The sound engineer runs the voice renders but does not own the voice
pipeline code. A defect in that code (`voice/*.py`, `voice/manifest.ts`,
`voice/refs.ts`) or in voice playback (`engine/audio/voice*.ts`) goes to
the [engine owner](engine-owner.md).

## Inputs

- Locked script files `script/*.ts` and `script/cast.ts`.
- Frozen refs `voice/refs/{speaker}.wav` and `.txt` (from
  [casting](casting.md)).
- [voice-pipeline](../engine/voice-pipeline.md): commands, setup,
  verify thresholds.
- [spine](../documents/spine.md): chapter moods and motifs, for the
  Sounds table and the music keys.
- For post: the cue list from `__info().cues`.

## Outputs

- `voice/manifest.json`, `voice/clips/{clip-id}.wav`,
  `voice/clips/durations.json`, `index.json`, `failures.json`, all
  through `wm voice:render`.
- The "Sounds" table in
  [visual-vocabulary](../documents/style-guide/visual-vocabulary.md): one
  row per sound-effect name, with its one meaning. Written in
  preproduction: one table, no loop.
- The `SfxName` union in `script/types.ts`, matching the table.
- The fields `root` and `scale` in each `script/NN-<id>.ts`.
- Changes in `engine/audio/music.ts`, `sfx.ts`, `synth.ts`: the
  engine owner's requests for deterministic audio before the animatic;
  music, synths, levels and ducking in post.
- A render report: clips rendered, clips still flawed, total audio
  seconds, runtime before and after, and the measured narrator rate
  (words per second of runtime) for `production/status.md`.

## Owns / must not touch

Owns: generated voice files (`voice/manifest.json`, `voice/clips/`); the
Sounds table in `visual-vocabulary.md`; the `SfxName` union in
`script/types.ts`; the `root` and `scale` fields of each chapter script
file; `engine/audio/music.ts`, `engine/audio/sfx.ts`,
`engine/audio/synth.ts`.

Must not touch: `voice/refs/` and `script/cast.ts` (casting); the voice
pipeline code `voice/*.py`, `voice/*.ts` and the rest of `engine/`,
including `engine/audio/voice*.ts` (engine owner); every other field in the
chapter script files (a cue change goes to the chapter's animator); the
rest of `visual-vocabulary.md` (the [art-director](art-director.md));
`scenes/`, `kit/`; other documents.

Rendering loads the model once for the whole batch. Only one render runs
at a time on the GPU.

## Critic partner

[qa](qa.md), audio set: speech-to-text and measurement. Then the human
listens. The human is the only critic who hears. The Sounds table has no
loop; the director approves it with the vocabulary.

Audio checklist (QA applies it):

- [ ] **Wrong words.** Whisper's transcript of a clip differs from its
  text beyond contractions and punctuation. Evidence: clip id, both texts.
- [ ] **Ends mid-sound.** A clip's last 20 ms is louder than the verify
  threshold. Evidence: clip id and the dB value.
- [ ] **Missing clip.** A voiced line has no clip, or no entry in
  `durations.json`. Evidence: the clip id.
- [ ] **Beat shorter than its clips.** Evidence: clip id, clip end, beat
  length.
- [ ] **Stale clip.** A clip's manifest hash does not match its index
  entry. Evidence: clip id.
- [ ] **Orphan clip.** A clip whose id is no longer in the script.
  Evidence: the id.
- [ ] **Sound with two meanings.** A sound-effect name is cued for two
  meanings, or has no Sounds row. Evidence: the cue times and the row.

## Brief template

```
ROLE: Sound engineer — {render voice | write the Sounds table and music keys | tune music and sound effects}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}

GOAL
{Render: make every voice clip current and verified, and write durations.json.}
{Sounds: give each sound-effect name one meaning in the Sounds table, and set root and scale for every chapter.}
{Mix: tune music, sound-effect synths, levels, and ducking in engine\audio\music.ts, sfx.ts, synth.ts.}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\engine\voice-pipeline.md
2. {PROJECT_ROOT}\script\cast.ts, {PROJECT_ROOT}\script\types.ts
3. {Render: section 4, "Verify loop", of voice-pipeline.md above (words, tail, re-roll attempts). You run the pipeline; you do not edit its code.}
   {Sounds: {PROJECT_ROOT}\production\spine.md, {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md, {PROJECT_ROOT}\engine\audio\music.ts, sfx.ts}
   {Mix: {PROJECT_ROOT}\engine\audio\music.ts, sfx.ts, synth.ts; the chapter script files, read-only}

YOU OWN (may edit)
{Render: voice\manifest.json, voice\clips\ — only through the commands below}
{Sounds: the Sounds table in {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md; the SfxName union in {PROJECT_ROOT}\script\types.ts;
 the root and scale fields in {PROJECT_ROOT}\script\NN-*.ts}
{Mix: {PROJECT_ROOT}\engine\audio\music.ts, sfx.ts, synth.ts}

DO NOT TOUCH
voice\refs\, script\cast.ts, voice\*.py, voice\*.ts, the rest of engine\ (including engine\audio\voice*.ts),
every other field in the chapter script files, scenes\, kit\, the rest of visual-vocabulary.md, other documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids, e.g. "cards are narrated"; "chorus = one clip per speaker, staggered"}

RULES
- Check free disk space first. Rendering writes models and clips.
- Run the batch render once; it loads the model once. Do not render clip by clip.
- A clip that still fails after all re-rolls is reported by id. Do not change the script to make it pass.
- You cannot hear. Do not report that audio "sounds" right. Report measurements.
- One sound-effect name, one meaning. A new name is a proposal.

VERIFY (PowerShell)
{Render:}
cd {PROJECT_ROOT}; wm voice:render     # report its summary line: clips, seconds of audio, still flawed
cd {PROJECT_ROOT}\voice; uv run verify.py
cd {PROJECT_ROOT}; wm test             # voice coverage passes
cd {PROJECT_ROOT}; wm build
cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools clip-check --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --manifest {PROJECT_ROOT}\voice\manifest.json --out {SCRATCH}\clips
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools pacing-curve --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --out {SCRATCH}\pacing
  # runtime = sum of dur in chapters.csv; narrator rate = narration words / their beats' dur in beats.csv
{Sounds or mix:}
cd {PROJECT_ROOT}; wm build; wm test

{REPORT — paste the standard block, N = 150}
Also list: clip ids still flawed, with the flaw; runtime before and after; the measured narrator rate.
```

## Escalation

- A clip that fails verify after all re-rolls: the producer decides
  between a larger re-roll budget and a script change (the writer, by note).
- Runtime changes by more than a few seconds after a render: the
  [editor](editor.md) and the human must see it.
- Any change to a frozen ref or the cast.
- A new sound-effect name, or a meaning change for one.

## Known failure modes

- **Lines cut off at the end.** The cause was the player, not the model.
  Lesson: find the layer that causes a defect before adding a check at
  another layer. Details in [voice-pipeline](../engine/voice-pipeline.md).
- **Mid-sound endings from the model.** Prevention: the render-time
  verify loop re-rolls up to 4 times.
- **Voice drift.** Prevention: casting freezes refs; this role never
  renders from a text voice description.
- **A sound with two meanings.** The audio form of the checkmark
  problem. Prevention: the Sounds table.
- **Environment failures.** Disk full, wrong Python. Prevention: the disk
  check; setup in [voice-pipeline](../engine/voice-pipeline.md).
