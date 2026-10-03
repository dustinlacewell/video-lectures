# QA (critic)

Runs every machine check on the build and reports measurements. It is
the critic whose sense is measurement: tools, tests, speech-to-text,
grep. It does not judge taste and does not fix. This file is the
checklist and how to report.

Real-studio counterpart: the technical QC pass before delivery, and the
dialogue editor's sync check.

## Model tier

**Sonnet.** Every check is a command with a pass rule. The brief lists
which checks to run.

## Sense

Measurement. It catches what neither eyes nor reading catch: text off
screen for 0.1 s between screenshots, a clip 30 ms longer than its beat,
a random number at draw time.

## Inputs

- The project at `{PROJECT_ROOT}` (built).
- The tool docs: [frame-sweep](../tools/frame-sweep.md),
  [clip-check](../tools/clip-check.md),
  [pacing-curve](../tools/pacing-curve.md),
  [contact-sheet](../tools/contact-sheet.md).
- [voice-pipeline](../engine/voice-pipeline.md) for the Whisper verify command.
- The checklist of the maker it is checking (sound engineer, editor,
  casting), when the brief names one.

## Outputs

A check report. Tool outputs under `{SCRATCH}`.

## Owns / must not touch

Owns nothing in the project. Writes only under `{SCRATCH}`. Leaves
`git status` clean.

## Checklist

Run the checks the brief names. Default: all of the build set.

Build set (every round, every maker):

| Check | Command | Pass rule | Evidence on fail |
|---|---|---|---|
| Types and build | `wm build` | 0 errors | first 5 error lines |
| Unit tests | `wm test` | all pass | failing test names |
| Off-screen text and boxes | frame sweep, step 0.1 s | 0 findings | time, beat id, item, bounds |
| Determinism | screenshot the same `t` twice in fresh pages, compare pixels | 0 differing pixels | `t`, both paths, pixel count |
| Randomness at draw time | grep `Math.random`, `Date.now`, `performance.now` in `scenes/`, `kit/`, `engine/` | no hits in draw paths | file:line |
| Card is last | each chapter's last beat is its card, or the bible lists the exception | true | chapter, ids after the card |

Audio set (after any voice render, or when the brief names the sound
engineer or casting):

| Check | Command | Pass rule | Evidence on fail |
|---|---|---|---|
| Words match | Whisper verify script (voice-pipeline doc) | no mismatches | clip id, script text, transcript |
| Ends cleanly | tail level check in the render report | no clip flagged | clip id, dB |
| Clips vs beats | clip check | no missing, orphan, or overlong clips | clip id, lengths |
| Clips current | manifest hashes vs script, cast, refs | all current | stale clip ids |
| Player plays to end | `__voice()` sampled near each clip's end | offset reaches clip length | clip id, last offset, length |

Pacing set (when the brief names the editor):

| Check | Command | Pass rule | Evidence on fail |
|---|---|---|---|
| Pacing curve | pacing curve | every beat within the bible's targets | beat id, metric, value, target |
| Runtime | `__info().total` | equals last approved, or a ledger row explains it | both runtimes |
| Weights | per-chapter share vs spine weight | within the bible's tolerance | chapter, share, weight |

Then apply the maker's checklist from its role file, if named, using
the same outputs.

## Report format

```
QA — {scope} — round {R}
Ran: {check names}
Failed ({count}):
1. {check}: {evidence per the table}
...
Passed: {check names}
Not run: {check}: {why}
Outputs: {SCRATCH paths}
Clean tree: yes/no
```

At most 250 words. Numbers, not adjectives. A check not run is reported
as not run, never as passed.

## Brief template

```
ROLE: QA (critic) — {build | audio | pacing} checks{, for the {maker role} checklist}, round {R}
{ENVIRONMENT — paste the standard block from loops/maker-critic.md}

GOAL
Run the named checks and report measurements. Do not fix. Do not judge taste.

READ, IN THIS ORDER (and nothing else)
1. C:\Users\dustin\.claude\skills\video-studio\roles\qa.md   (checklist and report format)
2. The tool docs for the checks you run: C:\Users\dustin\.claude\skills\video-studio\tools\{frame-sweep|clip-check|pacing-curve}.md
3. {maker's role file, for its checklist, if named}
4. {PROJECT_ROOT}\production\bible.md   (pacing targets, exceptions) — for pacing and card checks only

CHECKS TO RUN
{list from the checklist}
Scope: {all | chapters {list} | time range {a}–{b} s | clip ids {list}}

YOU OWN
Nothing. Outputs under {SCRATCH}. Leave git status clean.
If a check needs a running dev server, start it headless, use it, and stop it before you report.

{REPORT — use the report format in your role file}
```

## Escalation

- A tool fails or cannot run: report "not run" and why. The producer
  decides whether to fix the tool first.
- A failure whose fix is not in the maker's owned files.
- A pass rule that needs a number the bible does not set yet.

## Known failure modes

- **"Should pass" reported as pass.** Prevention: the report separates
  ran, passed, and not run.
- **Screenshots miss brief clipping.** Midpoint and end frames skip what
  happens in between. Prevention: the frame sweep at every 0.1 s, one
  of the machine checks that worked on the reference production.
- **Audio judged by ear claims.** Agents cannot hear; two audio defects
  reached the human. Prevention: audio checks are transcript and signal
  measurements only, and the human still listens.
- **Locked worktree on Windows.** A preview server left running held the
  folder. Prevention: the brief says to stop any server before reporting.
