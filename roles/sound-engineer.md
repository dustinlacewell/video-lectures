# Sound engineer

Renders every voice line from the frozen cast, verifies each clip, and
writes the clip lengths the timeline uses. In post, tunes the
synthesized music, the sound-effect synths, and ducking. The chapter's
[animator](animator.md) places the sound cues.

Real-studio counterpart: the dialogue editor and recording engineer for
voice; the sound designer and re-recording mixer for effects and music.

## Model tier

- **Sonnet** for pipeline runs: manifest, render, verify, re-roll. The
  steps are fixed and documented.
- **Opus** for audio code changes: `engine/audio/`, player playback,
  `voice/*.py`. These are implementation with a known cause.

## Inputs

- Locked script files `script/*.ts` and `script/cast.ts`.
- Frozen refs `voice/refs/{speaker}.wav` and `.txt` (from
  [casting](casting.md)).
- [voice-pipeline](../engine/voice-pipeline.md): commands, Windows setup,
  verify thresholds.
- For post: the `SfxName` list in `script/types.ts` and the cue list
  from `__info().cues`.

## Outputs

- `voice/manifest.json` (one job per clip, with content hashes).
- `voice/clips/{beat-id}.wav`; a chorus line gets one clip per speaker,
  `{beat-id}.{speaker}.wav`. A card is a clip too: the narrator reads it.
- `voice/clips/durations.json` (clip id → seconds), read by the timeline.
- In post: changes in `engine/audio/` (music, sound-effect synths,
  levels, ducking).
- A render report: clips rendered, clips that still fail verify after
  all re-rolls, total audio seconds.

## Owns / must not touch

Owns: `voice/manifest.json`, `voice/clips/`, `voice/*.py`,
`voice/manifest.ts`; in post, `engine/audio/`.

Must not touch: `voice/refs/` and `script/cast.ts` (casting owns them);
every field in the chapter script files (a cue change goes to the
chapter's animator); `scenes/`, `kit/`; documents.

Rendering loads the model once for the whole batch. Only one render runs
at a time on the GPU.

## Critic partner

[qa](qa.md), audio mode: speech-to-text and measurement. Then the human
listens. The human is the only critic who hears.

Audio checklist (qa applies it):

- [ ] **Wrong words.** Whisper's transcript of a clip differs from its
  `say` text beyond contractions and punctuation. Evidence: clip id, both texts.
- [ ] **Ends mid-sound.** A clip's last 20 ms is loud (above the
  threshold in `voice/render.py`). Evidence: clip id and the dB value.
- [ ] **Missing clip.** A voiced line has no clip, or no entry in
  `durations.json`. Evidence: the clip id
  ([clip-check](../tools/clip-check.md); `test/voiceCoverage.test.ts`).
- [ ] **Beat shorter than its clips.** A beat ends before one of its
  clips ends. Evidence: clip id, clip end, beat length.
- [ ] **Stale clip.** A clip's hash in the manifest does not match the
  current script text, speaker, or ref. Evidence: clip id.
- [ ] **Orphan clip.** A clip file whose id is no longer in the script.
  Evidence: the file.
- [ ] **Player stops early.** `__voice()` shows a clip stopped before its
  length. Evidence: clip id, offset at stop, clip length.

## Brief template

```
ROLE: Sound engineer — {render voice | fix audio code: {defect} | tune music and sound effects}
{ENVIRONMENT — paste the standard block from loops/maker-critic.md}

GOAL
{Render: make every voice clip current and verified, and write durations.json.}
{Fix: {defect, with the evidence from the note or qa report}.}
{Mix: tune music, sound-effect synths, levels, and ducking in engine\audio\.}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\engine\voice-pipeline.md
2. {PROJECT_ROOT}\script\cast.ts, {PROJECT_ROOT}\script\types.ts
3. {PROJECT_ROOT}\voice\render.py   (verify rules: words, tail, re-roll attempts)
4. {Fix: the files named in the defect}  {Mix: {PROJECT_ROOT}\engine\audio\; the chapter script files, read-only}

YOU OWN (may edit)
{Render: voice\manifest.json, voice\clips\ (via the commands only)}
{Fix: {exact files}}
{Mix: {PROJECT_ROOT}\engine\audio\}

DO NOT TOUCH
voice\refs\, script\cast.ts, every field in the chapter script files, scenes\, kit\, documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids, e.g. "cards are narrated"; "chorus = one clip per speaker, staggered"}

RULES
- Check free disk space first. Rendering writes models and clips.
- Run the batch render once; it loads the model once. Do not render clip by clip.
- A clip that still fails after all re-rolls is reported by id. Do not change the script to make it pass.
- You cannot hear. Do not report that audio "sounds" right. Report measurements.

VERIFY
- wm voice:render   (report its summary line: clips, seconds of audio, still flawed)
- wm test           (voice coverage tests must pass)
- {verify script from voice-pipeline.md} on the changed clips

{REPORT — paste the standard block, N = 150}
Also list: clip ids still flawed, with the flaw; total runtime before and after if it changed.
```

## Escalation

- A clip that fails verify after all re-rolls: the producer decides
  between a re-roll budget increase and a script change (the writer, by note).
- Total runtime changes by more than a few seconds after a render: the
  [editor](editor.md) and the human must see it. Runtime is not changed silently.
- Any change to a frozen ref or the cast.
- A new sound effect name (it extends `SfxName`, a shared type).

## Known failure modes

- **Lines cut off at the end.** The human heard it. The cause was the
  player stopping each clip on its own clock 20–80 ms early, not the
  model. Prevention (structural): the player lets a clip end on its own;
  (check) the "player stops early" item via `__voice()`. Lesson: find the
  layer that causes a defect before adding a check at another layer.
- **Mid-sound endings from the model.** Prevention: the render-time
  verify loop re-rolls the seed up to 4 times when the tail is loud or
  Whisper misses words.
- **Voice drift.** Prevention: casting freezes refs; this role never
  renders from a text voice description.
- **Dead air on cards.** Silent cards felt like dead air in a narrated
  video. Prevention: cards are narrated (bible entry); the coverage test
  expects a clip for every card.
- **Environment failures.** The D: drive filled up. System Python 3.14
  was too new for the ML stack (fixed with a uv venv on 3.12). The fast
  path on Windows needed `triton-windows` and
  `TORCHINDUCTOR_USE_STATIC_CUDA_LAUNCHER=0`. Prevention: the disk check
  in the brief; setup steps in [voice-pipeline](../engine/voice-pipeline.md).
