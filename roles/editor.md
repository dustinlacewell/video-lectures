# Editor

Owns the video's timing as a whole. Builds the animatic from the real
voice clips and the storyboard, tunes beat holds and pauses, reads the
pacing curve, and later assembles and exports the final cut.

Real-studio counterpart: the editor, who cuts the animatic from the
scratch track and storyboards, and later the picture edit.

## Model tier

**Opus.** Assembly and timing changes are implementation against the
spine weights and the bible's pacing targets. The pacing judgment that
goes to the human is measured, not felt.

## Inputs

- Rendered voice clips and `voice/clips/durations.json`.
- [spine](../documents/spine.md): chapter weights.
- [storyboard](../documents/storyboard.md).
- [bible](../documents/bible.md): pacing targets set at the animatic gate
  (words per second ceiling, longest still stretch, runtime target).
- [pacing-curve](../tools/pacing-curve.md) output.
- [animatic](../documents/animatic.md) for the animatic's form in this
  medium.

## Outputs

- The animatic build: the real player, real clips, boards as
  placeholder scenes, cards. See [animatic](../documents/animatic.md).
- Timing changes: `pad` values in `script/cast.ts`. Changes to `dur`
  (owned by the chapter's [animator](animator.md)) or `stagger` (owned
  by the [writer](writer.md)) go to their owners as notes.
- A pacing report: runtime, per-chapter runtime vs weight, beats over a
  target, each with the pacing-curve evidence.
- At delivery: the exported MP4, per [export](../engine/export.md).

## Owns / must not touch

Owns: the `pad` field of each cast entry, from cast lock on; the board
renderer `scenes/shared/board.ts` and the board fallback in
`scenes/index.ts` (see [animatic](../documents/animatic.md)); `out/` at
delivery.

Must not touch: every field in the chapter script files; chapter scene
code; `voice/`; `kit/`, `engine/`; documents (it proposes weight or
order changes to the director).

Ownership of `pad` passes from casting to the editor at cast lock. They
never work in the same round.

## Critic partner

[qa](qa.md) runs [pacing-curve](../tools/pacing-curve.md) and
[clip-check](../tools/clip-check.md) and applies the checklist below.
Then fresh cold viewers judge the whole video
([cold-viewer-review](../loops/cold-viewer-review.md)). The human signs
the animatic.

Pacing checklist (qa applies it; thresholds come from the bible):

- [ ] **Silent runtime change.** Total runtime differs from the last
  approved runtime and no ledger row or bible entry records why.
  Evidence: both runtimes. (Runtime fell from 9:42 to 7:05 when real
  narration replaced estimates, and nobody chose it.)
- [ ] **Weight drift.** A chapter's share of runtime differs from its
  spine weight by more than the bible's tolerance. Evidence: chapter,
  share, weight.
- [ ] **Too fast.** A beat's words per second exceed the ceiling.
  Evidence: beat id, the number.
- [ ] **Still too long.** Seconds since the last visual change exceed the
  limit. Evidence: beat id, time range, the number.
- [ ] **No new idea.** A run of reinforcement beats longer than the limit
  with no new idea. Evidence: the beat ids and the curve.
- [ ] **Dead hold.** A `dur` shorter than the beat's clips (the timeline
  ignores it; it misleads readers). Evidence: beat id, `dur`, clip
  length. The fix goes to the chapter's animator.
- [ ] **Clipped line.** A beat ends before its clips end. Evidence: from
  clip-check.

## Brief template

```
ROLE: Editor — {build the animatic | timing pass on chapters {list} | assemble and export the final cut}
{ENVIRONMENT — paste the standard block from loops/maker-critic.md}

GOAL
{One sentence. Example: "Bring each chapter's runtime within tolerance of its spine weight without touching any text."}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\documents\animatic.md   {or engine\export.md for delivery}
2. {PROJECT_ROOT}\production\spine.md   (weights)
3. {PROJECT_ROOT}\production\bible.md   (pacing targets; decisions)
4. {pacing-curve output path}
5. {PROJECT_ROOT}\script\{chapter files}, {PROJECT_ROOT}\script\cast.ts
6. {PROJECT_ROOT}\engine\timeline.ts   (how dur, pad, and clip lengths combine; read-only)

YOU OWN (may edit)
pad fields in {PROJECT_ROOT}\script\cast.ts
{animatic: {PROJECT_ROOT}\scenes\shared\board.ts and the board fallback in {PROJECT_ROOT}\scenes\index.ts} {delivery: {PROJECT_ROOT}\out\}

DO NOT TOUCH
Every field in the chapter script files. Chapter scene files, kit\, engine\, voice\. All documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids: runtime target, pacing targets, chapter order}

RULES
- A beat lasts its clip length plus pad. dur wins only if longer. Hold a beat by raising dur, never by trimming audio.
- Fix pace with pad first. A hold (dur) goes to the chapter's animator, a chorus stagger to the writer, a text cut to the writer: each by note.
- Report runtime before and after. Never change runtime silently.

VERIFY
- wm build, wm test   (pass)
- Pacing curve re-run: see C:\Users\dustin\.claude\skills\video-studio\tools\pacing-curve.md
- Clip check: see C:\Users\dustin\.claude\skills\video-studio\tools\clip-check.md
- {delivery: the MP4 checks in engine\export.md}

{REPORT — paste the standard block, N = 200}
Also list: runtime before → after; each chapter share vs weight; beats still over a target.
```

## Escalation

- Any runtime change outside the bible's target: the human decides.
- A chapter far from its weight that holds cannot fix: the director
  (spine weight) or the writer (text), by note.
- Chapter order or a cut chapter: director, then human.
- A pace problem in a beat whose animation is done: the producer weighs
  re-animation cost before deciding.

## Known failure modes

- **Pacing set by accident.** Animation existed before voice; real clips
  replaced the word-count estimate and the video lost 2:37. Prevention
  (structural): voice first, then animatic, then animation. The editor
  cuts the animatic from real clips, so the human signs real timing.
- **Fixing pace in the wrong layer.** Trimming silence inside clips or
  stopping clips early cuts words (the player once stopped clips 20–80
  ms early and the human heard it). Prevention: the "hold by `dur`,
  never by trimming audio" rule.
- **Felt pacing.** An agent cannot watch the video at speed. Prevention:
  pacing is the measured curve plus cold viewers' "bored" timestamps;
  the human watches at the gate.
