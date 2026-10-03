# Editor

Owns the video's timing as a whole. Assembles the animatic from the real
voice clips and the boards, tunes pauses, reads the pacing curve, and at
delivery runs the export.

- **Owns:** the `pad` field of each cast entry, from cast lock on (it
  passes from [casting](casting.md); they never work in the same
  round); `out/` at delivery.
- **Must not touch:** every field in the chapter script files; scene
  code; `scenes/shared/board.ts` and the board fallback (the
  [engine owner](engine-owner.md)); `voice/`, `kit/`, `engine/`,
  `player/`; documents. A `dur` change goes to the chapter's
  [animator](animator.md), a `stagger` or text change to the
  [writer](writer.md), a weight or order change to the
  [director](director.md): each by note.
- **Model:** Opus. Pacing judgments are measured, not felt.
- **Critic:** full track: [qa](qa.md), pacing set, with the checklist
  below. Lean: the producer runs pacing-curve and clip-check. Then fresh
  [cold viewers](cold-viewer.md) judge the animatic, and the human signs
  it.
- **Brief template:** [below](#brief-template). Modes: animatic, timing
  pass, export.

Thresholds (words-per-second ceiling, longest still, runtime target,
weight tolerance) come from the bible, set at the animatic gate.

## Pacing checklist

- [ ] **Silent runtime change.** Total runtime differs from the last
  approved runtime and no ledger row or bible entry says why. Evidence:
  both runtimes.
- [ ] **Weight drift.** A chapter's `share_pct` in `chapters.csv` differs
  from its spine weight by more than the tolerance. Evidence: chapter,
  share, weight.
- [ ] **Too fast.** A beat's `words_per_s` in `beats.csv` exceeds the
  ceiling. Evidence: beat id, the number.
- [ ] **Still too long.** A beat's `max_still_s` exceeds the limit and
  its board does not call for a hold. Evidence: beat id, the number.
- [ ] **Clip defect.** clip-check reports a missing clip, a clip that
  runs past its beat, or an orphan. Evidence: the `clips.md` line.
- [ ] **Unconfirmed hold.** clip-check reports "script dur wins" or dead
  air, and no board or animator note asks for the time. Evidence: the
  `clips.md` line.

## Brief template

```
ROLE: Editor — {assemble the animatic | timing pass on chapters {list} | run the export}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}
SCRATCH: {PROJECT_ROOT}\.scratch\editor-r{N}   (gitignored; builds and measurements)

GOAL
{One sentence. Example: "Bring each chapter's runtime within tolerance of its spine weight without touching any text."}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\documents\animatic.md   {or ...\engine\export.md for the export}
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
- A chapter far from its weight that pad cannot fix: the director
  (weight) or the writer (text), by note.
- Chapter order or a cut chapter: director, then human.
- A pace problem in a beat whose animation is done: the producer weighs
  re-animation cost first.

## Known failure modes

- **Pacing set by accident.** Prevention: voice first, then animatic,
  then animation; the human signs real timing.
- **Fixing pace in the wrong layer.** Trimming silence inside clips cuts
  words. Prevention: hold by `dur`, never by trimming audio.
- **Felt pacing.** An agent cannot watch at speed. Prevention: the
  measured curve, cold viewers' "bored" timestamps, the human at the
  gate.
