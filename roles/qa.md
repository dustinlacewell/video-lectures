# QA (critic)

Runs every machine check on the build and reports measurements. Its
sense is measurement: tools, tests, speech-to-text, grep. It does not
judge taste or meaning and does not fix. This file is the checklist,
the exact commands, and how to report.

## Model tier

**Sonnet.** Every check is a command with a pass rule. The brief lists
which sets to run.

## Sense

Measurement. It catches what neither eyes nor reading catch: text off
screen for 0.1 s between frames, a clip 30 ms longer than its beat, a
random number at draw time.

## Inputs

- The project at `{PROJECT_ROOT}`.
- The tool docs: [setup](../tools/setup.md),
  [frame-sweep](../tools/frame-sweep.md),
  [clip-check](../tools/clip-check.md),
  [pacing-curve](../tools/pacing-curve.md),
  [contact-sheet](../tools/contact-sheet.md).
- [voice-pipeline](../engine/voice-pipeline.md) for the Whisper commands.
- The checklist of the maker it checks ([sound-engineer](sound-engineer.md),
  [editor](editor.md), [casting](casting.md),
  [engine-owner](engine-owner.md)), when the brief names one.
- Project checks: `production/checks/qa.md`, pasted into the brief.
  Only measurable items belong there.

## Outputs

A check report. Tool outputs under `{SCRATCH}`.

## Owns / must not touch

Owns nothing in the project. Writes only under `{SCRATCH}`. Leaves
`git status` clean.

## Checklist

Commands are PowerShell, numbered to match the tables. Add
`--chapter {id}` to a tool command to narrow it to one chapter.

Build set (every round, every maker):

```
B0  cd {PROJECT_ROOT}; wm build
    cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build      # the build every tool below reads
B1  cd {PROJECT_ROOT}; wm test
B2  pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools frame-sweep --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --out {SCRATCH}\sweep
B3  pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --twice --out {SCRATCH}\det
B4  Grep tool, pattern: Math\.random|Date\.now|performance\.now|new Date   paths: {PROJECT_ROOT}\scenes, {PROJECT_ROOT}\kit, {PROJECT_ROOT}\engine
```

| Check | Cmd | Pass rule | Evidence on fail |
|---|---|---|---|
| Types and build | B0 | 0 errors | first 5 error lines |
| Unit tests, incl. storyboard and card-last | B1 | all pass | failing test names |
| Off-screen text and images | B2 | 0 cut ranges; text-draw count above 0 | `sweep.md` line, frame path |
| Determinism | B3 | exit 0; `determinism.md` lists 0 differing frames (exit 3 = a frame differs) | time, beat id, pixel count |
| Randomness at draw time | B4 | no hits in draw or audio-scheduling code | file:line |

Audio set (after any voice render, or when the brief names the sound
engineer):

```
A1  cd {PROJECT_ROOT}\voice; uv run verify.py
A2  read {PROJECT_ROOT}\voice\clips\failures.json
A3  pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools clip-check --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --manifest {PROJECT_ROOT}\voice\manifest.json --out {SCRATCH}\clips
A4  cd {PROJECT_ROOT}; node -e "const m=require('./voice/manifest.json'),i=require('./voice/clips/index.json');for(const e of m)if(!(i[e.id]||'').startsWith(e.hash+'.'))console.log(e.id)"
A5  cd {PROJECT_ROOT}; wm test
```

| Check | Cmd | Pass rule | Evidence on fail |
|---|---|---|---|
| Words match, ends cleanly | A1 | no flawed clip | clip id, flaw, transcript |
| Render failures | A2 | empty | clip id, text |
| Clips vs beats | A3 | no missing, runs-past, or orphan line | `clips.md` line |
| Clips current | A4 | no output | stale clip ids |
| Coverage | A5 | voiceCoverage passes | failing test |

Casting set (when the brief names casting): the VERIFY commands in
[casting](casting.md)'s brief template, per ref: transcript equals
`.txt`; length 8–15 s; no internal silence over 0.7 s; reuse hashes equal.

Pacing set (when the brief names the editor):

```
P1  pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools pacing-curve --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --out {SCRATCH}\pacing
P2  A3 above
```

| Check | Cmd | Pass rule | Evidence on fail |
|---|---|---|---|
| Pacing curve | P1, `beats.csv` | each beat within the bible's targets | `beats.csv` row, target |
| Runtime | P1, sum of `dur` in `chapters.csv` | equals last approved, or a ledger row explains it | both runtimes |
| Weights | P1, `share_pct` in `chapters.csv` vs spine weight | within the bible's tolerance | chapter, share, weight |
| Clip check | P2 | no missing, runs-past, or orphan line | `clips.md` line |

Port set (when the brief names a port): `cd {PROJECT_ROOT}; wm parity`,
with the negative control and pass rule in
[porting](../engine/porting.md), step 4: identical timelines and cues,
0 differing pixels (or each diff image explained as antialias noise),
and a negative control that reports differing pixels. Report the tool's
summary lines.

Export set (when the brief names the export): every check in
[export](../engine/export.md) section 6.

Then apply the maker's checklist from its role file, if named, and the
project checks, using the same outputs.

Not a QA item: anything that needs judgment of meaning ("no new idea",
a false claim, a confusing symbol). Those belong to the
[script-editor](script-editor.md), the
[animation-supervisor](animation-supervisor.md), and cold viewers.
Whether the player stops a clip early cannot be measured headless; the
human listens for it.

## Report format

```
QA — {sets} — round {R}
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
ROLE: QA (critic) — {build | audio | casting | pacing | port | export} checks{, for the {maker role} checklist}, round {R}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}

GOAL
Run the named checks and report measurements. Do not fix. Do not judge taste or meaning.

READ, IN THIS ORDER (and nothing else)
1. C:\Users\dustin\.claude\skills\video-studio\roles\qa.md   (checklist, commands, report format)
2. C:\Users\dustin\.claude\skills\video-studio\tools\setup.md and the doc of each tool you run, in that folder
3. {maker's role file, for its checklist, if named}
4. {PROJECT_ROOT}\production\bible.md   (pacing targets, exceptions) — pacing set only
5. {Port: C:\Users\dustin\.claude\skills\video-studio\engine\porting.md. Export: ...\engine\export.md section 6}

CHECKS TO RUN
Sets: {list}
Scope: {all | chapters {ids}: add --chapter {id} to each tool | clip ids {list}}

PROJECT CHECKS (from {PROJECT_ROOT}\production\checks\qa.md)
{paste the file verbatim, or "none"}

YOU OWN
Nothing. Outputs under {SCRATCH}. Leave git status clean.
Tools start and stop their own server. If you start one, stop it before you report.

REPORT
Use the report format in your role file. At most 250 words.
```

## Escalation

- A tool fails or cannot run: report "not run" and why. The producer
  decides whether to fix the tool first.
- A failure whose fix is not in the maker's owned files.
- A pass rule that needs a number the bible does not set yet.

## Known failure modes

- **"Should pass" reported as pass.** Prevention: the report separates
  ran, passed, and not run.
- **Frames miss brief clipping.** Prevention: the frame sweep every 0.1 s.
- **A void sweep.** Zero text draws means the sweep saw nothing.
  Prevention: the pass rule requires a count above 0.
- **Audio judged by ear claims.** Agents cannot hear. Prevention: audio
  checks are transcript and signal measurements only; the human listens.
- **Locked worktree on Windows.** Prevention: stop any server you started.
