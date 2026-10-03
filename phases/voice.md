# Phase: voice

Record every line with the settled cast, verify each clip, and measure
real durations. Animation is timed to these clips, never to estimates.

## Entry criteria

- Preproduction gate passed: script written, every speaker pointed at a
  frozen reference clip.
- The TTS environment works on this machine. If not, the
  [sound engineer](../roles/sound-engineer.md) installs it first (a
  one-time run; see [voice pipeline](../engine/voice-pipeline.md) for the
  Windows fixes).

## Steps

1. **Render.** The sound engineer builds the manifest (one entry per
   clip, with a content hash of text, reference and style) and runs the
   batch render. Only changed hashes re-render.
2. **Verify each clip.** The render loop transcribes each new clip with
   speech-to-text and compares it to the script. It rejects a clip that
   ends mid-sound and re-rolls the seed, up to 4 times. Failures are
   listed by clip id.
3. **Check clips against the timeline.** Run
   [clip-check](../tools/clip-check.md): no missing clips, no beat
   shorter than its clip, `durations.json` written. Lean: the producer.
   Full: [QA](../roles/qa.md).
4. **Measure.** Run [pacing-curve](../tools/pacing-curve.md) on the
   voiced timeline. The producer replaces the narrator rate in
   `production/status.md` with the measured value. Lean: the producer
   runs it and goes on to the [animatic](animation.md). Full: the
   [editor](../roles/editor.md) runs it, and the
   [director](../roles/director.md) compares each chapter's runtime to
   its spine weight.
5. **Table read build** (full). The editor gives the human a player link
   with real voice and captions.
6. **Line fixes** (full). A changed line goes to the
   [writer](../roles/writer.md), then the
   [script-editor](../roles/script-editor.md) (one-word fixes batched
   into one pass), then steps 1–3 for the changed hashes only.

Lean runs: 1 (the sound engineer, steps 1–2).

## Gate: table read

**Lean: no gate here.** The listen and the script lock move into the
[animatic gate](animation.md#gate-the-animatic).

**Full.** Agents cannot hear. The human is the only ear, so keep the
listen short.

1. "Listen once, start to end (<m:ss>). Note any line that sounds wrong:
   wrong word, odd stress, cut off, wrong voice. Beat id or time is
   enough." "Cut off" covers the player stopping a clip early. No
   headless tool measures that, so this listen is its only check.
2. If real runtime differs from the estimate by more than 10%: "Real
   voice runs <m:ss>; the estimate was <m:ss>. Keep this pace? I
   recommend yes, because <reason>."
3. "Lock the script and the voice? I recommend yes." Only when the
   step 1 notes are fixed.

On rejection: each noted line becomes a ledger row. Re-render only
those. Give the human the list of times to re-check, not the whole
video.

The re-voice task mode runs steps 1–3, then the human listens to the
changed lines ([sizing](sizing.md#re-voice)).

## Exit criteria

- Zero verify failures. Clip-check green.
- `voice/clips/durations.json` committed. The timeline uses it.
- The narrator rate in `production/status.md` is the measured value.
- Full: chapter runtimes recorded in the spine next to their weights;
  bible "Locks": script and voice locked at <commit>.

## Common failures

- **Animation before voice.** On the reference the runtime went from
  9:42 to 7:06 when real narration replaced the word-count estimate.
  Nobody chose it. Animators had timed motion to lengths that vanished.
- **Lines cut off.** The human heard lines end early. The player
  stopped clips on its own clock 20–80 ms early. Check the playback
  path, not only the files.
- **Drift between lines.** Solved by cloning from one frozen clip. If
  drift is heard, check that every line uses the reference.
- **Machine setup.** The D: drive was full. System Python 3.14 was too
  new; a uv venv on 3.12 worked. Details in
  [voice pipeline](../engine/voice-pipeline.md).
- **Silent cards.** Silent cards felt like dead air. Cards are narrated
  (bible B14); they get clips too.
