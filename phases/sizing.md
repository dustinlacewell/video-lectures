# Sizing the job

Pick a track or a task mode before any work starts. Tell the human the
track and the budget in one line: "Lean track, about 26 runs." Record
both in `production/status.md`. The budget is the top of the typical
range. Ask the human before you go over it by more than half.

## What a run is

A run is one Agent spawn, or one SendMessage round to an agent. A
maker–critic loop is several runs: the maker, the critic, and each fix
round (the maker's fix plus the critic's re-check). The producer's own
work is not a run: copying files, running a tool and reading its
summary lines, comparing a report with the spine.

## Tracks

**Lean.** About 5 minutes or less, or one thesis with 5 chapters or
fewer. Each phase file has a "Lean" section with the exact steps.

- One director run does the whole development phase.
- The director also does art direction. One combined critic checks the
  script and the boards. One fix round at most.
- The producer runs the tools itself (clip-check, pacing-curve,
  frame-sweep, contact-sheet) and reads only the summary lines. No QA
  agent, no editor agent before delivery.
- Animators work in 2–3 chapter groups. Each group gets one supervisor
  pass and one fix round at most.
- Cold viewers: newcomer and skeptic at the animatic. All three again in
  post only if the topic is contested.

**Contested** means informed people in the field commonly reject the
thesis. A result that is settled but feels wrong (the Monty Hall
problem) is not contested; the skeptic at the animatic covers it.

**Full.** Longer videos that argue several claims, like the reference.
The whole crew, as each phase file describes.

## Lean budget

| Phase | Runs | What they are |
|---|---|---|
| Development | 1–2 | director; +1 harvest (Sonnet) if earlier material exists |
| Preproduction | 4–7 | writer, director (boards), combined critic, 1–2 fixes; +2 casting (audition, freeze) for new voices |
| Voice | 1 | sound engineer (render and verify) |
| Animation | 8–14 | 2 cold viewers; 0–2 animatic-gate fixes (writer, re-render); per group of 2–3: animator, supervisor, fix; +1 kit owner if the vocabulary adds symbols the kit lacks |
| Post | 3–6 | notes round: each owner's fix and its critic; +3 cold viewers if contested |
| Delivery | 1 | editor (export and package) |
| **Total** | **22–30 typical** | floor 18, ceiling about 31 |

## Full budget

For about 5 chapters. Add about 7 runs per extra chapter (writer, its
script fixes, its animator loop).

| Phase | Runs | What they are |
|---|---|---|
| Development | 5–7 | harvest; director (spine); spine loop: script-editor, fix, re-check, up to 3 rounds |
| Preproduction | 22–28 | style guide 3 (director, art-director, director's approval); casting 3 (declare, audition, freeze); 5 writers; script loop 6–9; whole-script pass 1; boards 4–5 (director, art-director, script-editor as critic, fixes) |
| Voice | 4–8 | sound engineer, QA, editor, director; +4 for line fixes (writer, script-editor, re-render, QA) |
| Animation | 36–46 | editor, 3 cold viewers, director record; 0–4 gate fixes; kit loop 3; per chapter 5 (animator, QA, supervisor, fix, re-check); director whole-video pass and its fixes 3 |
| Post | 16–24 | sound engineer, editor, QA, director; 3 cold viewers and the director's record; notes round: director split, owners' fixes and critics 6–12, QA |
| Delivery | 2–3 | editor (export, package), QA |
| **Total** | **85–115** | |

## One-time costs

These are not in the track budgets. Name them in the budget line when
they apply: "Lean track, about 26 runs, plus 6 one-time runs for the
new engine."

| Cost | When | Runs |
|---|---|---|
| Engine readiness | First production on an engine with open [contract §11](../engine/contract.md#11-reference-repo-gaps) gaps. [Preproduction](preproduction.md) step 0. | 2–3: engine owner, QA, fix |
| MP4 exporter | No exporter exists yet. Built in [animation](animation.md), after the animatic gate, per [export](../engine/export.md). | 3–4: engine owner (design, build), QA, fix |
| Port a prototype | The human hands over a single-file prototype. [Porting](../engine/porting.md). | 3–4: recon, engine owner, QA, fix |
| Voice stack | First render on this machine. | 1: sound engineer installs |

## Task modes

A task mode skips phases. Its budget is in the line below its steps.

### Notes round

The human's notes, or cold-viewer reports, on a draft. Runs the notes
round in [post](post.md#the-notes-round), steps 5–9. Status file track:
`notes round`. Four rules from there matter most:

- The producer verifies each finding on the actual frame or clip before
  routing it. A tool's guessed cause can be wrong.
- Cold-viewer findings are compared with the spine. "Answered but did
  not land" gets a fix that makes the answer land, not a new argument.
- A finding that attacks a bible entry goes to the human as a question.
  It is never fixed and never silently dropped.
- Ledger statuses include `human-decision`, `held` and `settled`.

Budget: about 2 runs per owner group (fix, critic), plus 1 per held
group after the answers. Full adds 1 QA run. Group chapters for an
owner the way the lean track groups animators.

### Polish

Named chapters look wrong; the script and timing stand. Runs
[animation](animation.md) steps 7–8 on those chapters.

1. The [animator](../roles/animator.md) fixes, per chapter group.
2. The [animation-supervisor](../roles/animation-supervisor.md)
   re-checks the new frames.
3. The producer runs [frame-sweep](../tools/frame-sweep.md) on the whole
   video, then merges.

Budget: 2 runs per group; 4 if the supervisor fails the first fix.

### Re-voice

Some lines sound wrong, or a voice changes. Runs [voice](voice.md) steps
1–3, then the human listens to the changed lines only.

Budget: 1 run (sound engineer); +2 if the words change (writer,
script-editor).

### Export

Runs [delivery](delivery.md) only. The exporter must exist; if not, add
its one-time cost first.

Budget: 1 run (editor); full adds 1 QA run.
