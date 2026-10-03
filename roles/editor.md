# Editor

Owns the video's timing as a whole. Assembles the animatic from the real
voice clips and the boards, tunes holds and pauses, reads the pacing
curve, and at delivery runs the export.

## Model tier

**Opus.** Timing changes are implementation against the spine weights
and the bible's pacing targets. The pacing judgment that goes to the
human is measured, not felt.

## Inputs

- Rendered voice clips and `voice/clips/durations.json`.
- [spine](../documents/spine.md): chapter weights.
- [storyboard](../documents/storyboard.md).
- [bible](../documents/bible.md): pacing targets set at the animatic gate
  (words per second ceiling, longest still, runtime target, weight
  tolerance).
- [pacing-curve](../tools/pacing-curve.md) and
  [clip-check](../tools/clip-check.md) output.
- [animatic](../documents/animatic.md) for the animatic's form.
- At delivery: [export](../engine/export.md).

## Outputs

- The animatic cut: the build with every chapter on its boards, checked
  with the tools. The editor does not build the board renderer; the
  [engine owner](engine-owner.md) does.
- Pad and timing judgments. The editor sets `pad` values in
  `script/cast.ts`. Changes to `dur` (the chapter's
  [animator](animator.md)) or `stagger` and text (the
  [writer](writer.md)) go to their owners as notes.
- A pacing report: runtime, per-chapter share vs weight, beats over a
  target, each with its CSV row.
- At delivery: `wm export` output in `out/`.

## Owns / must not touch

Owns: the `pad` field of each cast entry, from cast lock on; `out/` at
delivery.

Must not touch: every field in the chapter script files; scene code;
`scenes/shared/board.ts` and the board fallback (engine owner; request
changes); `voice/`; `kit/`, `engine/`, `player/`; documents (it proposes
weight or order changes to the [director](director.md)).

Ownership of `pad` passes from [casting](casting.md) to the editor at
cast lock. They never work in the same round.

## Critic partner

[qa](qa.md), pacing set, applies the checklist below. Then fresh cold
viewers judge the whole video
([cold-viewer-review](../loops/cold-viewer-review.md)). The human signs
the animatic.

Pacing checklist (QA applies it; thresholds come from the bible):

- [ ] **Silent runtime change.** Total runtime differs from the last
  approved runtime and no ledger row or bible entry records why.
  Evidence: both runtimes.
- [ ] **Weight drift.** A chapter's `share_pct` in `chapters.csv` differs
  from its spine weight by more than the bible's tolerance. Evidence:
  chapter, share, weight.
- [ ] **Too fast.** A beat's `words_per_s` in `beats.csv` exceeds the
  ceiling. Evidence: beat id, the number.
- [ ] **Still too long.** A beat's `max_still_s` in `beats.csv` exceeds
  the limit and its board does not call for a hold. Evidence: beat id,
  the number.
- [ ] **Clip defect.** clip-check reports a missing clip, a clip that
  runs past its beat, or an orphan. Evidence: the `clips.md` line.
- [ ] **Unconfirmed hold.** clip-check reports "script dur wins" or dead
  air, and no board or animator note asks for the time. Evidence: the
  `clips.md` line.

## Brief template

Fill `{PROJECT_ROOT}` with the worktree path when the agent works in one.

```
ROLE: Editor — {assemble the animatic | timing pass on chapters {list} | run the export}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}

GOAL
{One sentence. Example: "Bring each chapter's runtime within tolerance of its spine weight without touching any text."}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\documents\animatic.md   {or C:\Users\dustin\.claude\skills\video-studio\engine\export.md for the export}
2. {PROJECT_ROOT}\production\spine.md   (weights)
3. {PROJECT_ROOT}\production\bible.md   (pacing targets; decisions)
4. {PROJECT_ROOT}\script\cast.ts, then {PROJECT_ROOT}\script\{chapter files}   (read-only except pad)
5. {PROJECT_ROOT}\engine\timeline.ts   (how dur, pad, and clip lengths combine; read-only)

YOU OWN (may edit)
pad fields in {PROJECT_ROOT}\script\cast.ts. {Export: {PROJECT_ROOT}\out\}

DO NOT TOUCH
Every field in the chapter script files. Scene files, scenes\shared\, kit\, engine\, player\, voice\. All documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids: runtime target, pacing targets, chapter order}

RULES
- A beat lasts its clip length plus pad. dur wins only if longer. Hold a beat by raising dur, never by trimming audio.
- Fix pace with pad first. A hold (dur) goes to the chapter's animator, a stagger or a text cut to the writer: each by note.
- Report runtime before and after. Never change runtime silently.

MEASURE (PowerShell; run before and after your change)
cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build-{before|after}
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools pacing-curve --build {SCRATCH}\build-{before|after} --script {PROJECT_ROOT}\script\index.ts --out {SCRATCH}\pacing-{before|after}
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools clip-check --build {SCRATCH}\build-{before|after} --script {PROJECT_ROOT}\script\index.ts --manifest {PROJECT_ROOT}\voice\manifest.json --out {SCRATCH}\clips-{before|after}
Runtime = the sum of dur in chapters.csv. Share = share_pct in chapters.csv.

VERIFY
cd {PROJECT_ROOT}; wm test   # all pass
{Export: cd {PROJECT_ROOT}; wm export, then every check in engine\export.md section 6, results in out\export.json}

{REPORT — paste the standard block, N = 200}
Also list: runtime before -> after; each chapter's share vs weight; beats still over a target, with their CSV rows.
```

## Escalation

- Any runtime change outside the bible's target: the human decides.
- A chapter far from its weight that holds cannot fix: the director
  (spine weight) or the writer (text), by note.
- Chapter order or a cut chapter: director, then human.
- A pace problem in a beat whose animation is done: the producer weighs
  re-animation cost before deciding.

## Known failure modes

- **Pacing set by accident.** Prevention: voice first, then animatic,
  then animation; the human signs real timing. The history is in
  [phases/voice.md](../phases/voice.md).
- **Fixing pace in the wrong layer.** Trimming silence inside clips or
  stopping clips early cuts words. Prevention: "hold by `dur`, never by
  trimming audio".
- **Felt pacing.** An agent cannot watch at speed. Prevention: the
  measured curve plus cold viewers' "bored" timestamps; the human
  watches at the gate.
