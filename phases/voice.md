# Phase: voice

Record every line with the locked cast, verify each clip, measure real
durations, and let the human hear the whole script once. Animation is
timed to these clips, never to estimates.

## Entry criteria

- Preproduction gate passed: script written, cast locked with frozen
  reference clips.
- The TTS environment works on this machine. See
  [voice pipeline](../engine/voice-pipeline.md) for the setup and the
  Windows fixes.

## Steps

1. **Render.** [Sound engineer](../roles/sound-engineer.md) builds the
   manifest (one entry per clip, with a content hash of text, reference,
   and style) and runs the batch render. The model loads once. Only
   changed hashes re-render.
2. **Verify each clip.** The render loop transcribes each new clip with
   speech-to-text and compares it to the script. It rejects a clip that
   ends mid-sound and re-rolls the seed, up to 4 times. Failures are
   listed by clip id.
3. **Check clips against the timeline.** [QA](../roles/qa.md) runs
   [clip-check](../tools/clip-check.md): no missing clips, no beat
   shorter than its clip, `durations.json` written.
4. **Measure.** The [editor](../roles/editor.md) runs
   [pacing-curve](../tools/pacing-curve.md) on the voiced timeline. The
   [director](../roles/director.md) compares each chapter's runtime to
   its spine weight.
5. **Table read build.** The editor gives the human a player link with
   real voice and captions. Boards show if they exist; the question at
   this gate is only the voice.
6. **Line fixes.** A changed line goes to the
   [writer](../roles/writer.md), then the
   [script-editor](../roles/script-editor.md) (batch one-word fixes into
   one pass), then steps 1–3 for the changed hashes only.

Lean: the producer runs clip-check and pacing-curve itself and reads
only the summary lines. Skip step 5; the animatic is the listen.

## Gate: table read

**Lean: no gate here.** The listen and the script lock move into the
[animatic gate](animation.md). Go on to the animatic after step 3.

**Full:** agents cannot hear. The human is the only ear, so make the listen short
and focused.

1. "Listen once, start to end (<m:ss>). Note any line that sounds wrong:
   wrong word, odd stress, cut off, wrong voice. Beat id or time is
   enough." No recommendation needed; this is a listen. "Cut off"
   covers the player stopping a clip early. No headless tool can
   measure that ([qa](../roles/qa.md)), so this listen is its only
   check. Lean: this list is asked at the
   [animatic gate](animation.md) instead.
2. If real runtime differs from the estimate by more than 10%: "Real
   voice runs <m:ss>; the estimate was <m:ss>. Keep this pace? I
   recommend yes, because <reason>."
3. "Lock the script and the voice? I recommend yes." (Only when step 1
   notes are fixed.)

On rejection: each noted line becomes a ledger row. Re-render only those.
Give the human the list of their times to re-check, not the whole video.

Re-voice task mode runs this phase alone: steps 1–3, then the human's
listen of the changed lines.

## Measure the narrator's rate

After the first render, the producer replaces the narrator rate in
`production/status.md` with the measured value: spoken words per
second of runtime, from the pacing curve (the sound engineer's render
report gives it). Re-measure after the voice locks. The next production
with this narrator plans its word budget from it.

## Exit criteria

- Zero verify failures. Clip-check green.
- `voice/clips/durations.json` committed. The timeline uses it.
- Chapter runtimes recorded in the spine next to their weights.
- Bible "Locks": script and voice locked at <commit>.

## Common failures

- **Animation before voice.** In the reference production the runtime
  went from 9:42 to 7:05 when real narration replaced the word-count
  estimate. Nobody chose it. Animators had timed motion to lengths that
  vanished. This phase exists to stop that.
- **Lines cut off.** The human heard lines end early. The cause was the
  player stopping clips on its own clock 20–80 ms early, not the model.
  Check the playback path, not only the files.
- **Drift between lines.** Solved at cast lock by cloning from one frozen
  clip. If drift is heard, check that every line uses the reference.
- **Machine setup.** The D: drive was full. System Python 3.14 was too
  new; a uv venv on 3.12 worked. Windows needed `triton-windows` and
  `TORCHINDUCTOR_USE_STATIC_CUDA_LAUNCHER=0`. Details in
  [voice pipeline](../engine/voice-pipeline.md).
- **Silent cards.** Cards were silent at first, which felt like dead air
  in a narrated video. Cards are narrated (bible B14); they get clips too.
