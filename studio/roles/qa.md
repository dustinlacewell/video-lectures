# QA (critic)

Runs machine checks on the build and reports measurements: tools, tests,
speech-to-text, grep. Does not judge taste or meaning. Does not fix.

- **Track:** full only. One exception: the export set, when the engine
  owner builds the exporter, runs on both tracks. On lean, the producer
  runs the commands below itself and reads only the result lines (most
  often B2 frame-sweep, A1 verify, A3 clip-check).
- **Owns:** nothing in the project. Writes only under `{SCRATCH}`.
  Leaves `git status` clean.
- **Must not touch:** every project file.
- **Model:** Sonnet. Every check is a command with a pass rule.
- **Sense:** measurement. It catches text off screen for 0.1 s between
  frames, a clip 30 ms longer than its beat, a random number at draw
  time.
- **Brief template:** [below](#brief-template). Sets: build, audio,
  casting, pacing, port, export.

Tool docs: [setup](../tools/setup.md),
[frame-sweep](../tools/frame-sweep.md), [clip-check](../tools/clip-check.md),
[pacing-curve](../tools/pacing-curve.md),
[contact-sheet](../tools/contact-sheet.md).

## Checklist

Commands are PowerShell. Add `--chapter {id}` (repeatable) to narrow a
tool.

Build set (every round, every maker):

```
B0  cd {PROJECT_ROOT}; wm build {SLUG}
    cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build      # the build every tool below reads
B1  cd {PROJECT_ROOT}; wm test {SLUG}
B2  pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools frame-sweep --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --out {SCRATCH}\sweep
B3  pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --twice --out {SCRATCH}\det
B4  Grep tool, pattern: Math\.random|Date\.now|performance\.now|new Date   paths: {PROJECT_ROOT}\scenes, {PROJECT_ROOT}\kit, {PROJECT_ROOT}\engine
```

| Check | Cmd | Pass rule | Evidence on fail |
|---|---|---|---|
| Types and build | B0 | 0 errors | first 5 error lines |
| Unit tests | B1 | all pass | failing test names |
| Off-screen text and images | B2 | 0 cut ranges; text-draw count above 0 | `sweep.md` line, frame path |
| Determinism | B3 | exit 0 (exit 3 = a frame differs) | time, beat id, pixel count |
| Randomness at draw time | B4 | no hits in draw or audio-scheduling code | file:line |

Audio set (after any voice render):

```
A1  cd {PROJECT_ROOT}\voice; uv run verify.py
A2  read {PROJECT_ROOT}\voice\clips\failures.json
A3  pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools clip-check --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --manifest {PROJECT_ROOT}\voice\manifest.json --out {SCRATCH}\clips
A4  cd {PROJECT_ROOT}; node -e "const m=require('./voice/manifest.json'),i=require('./voice/clips/index.json');for(const e of m)if(!(i[e.id]||'').startsWith(e.hash+'.'))console.log(e.id)"
A5  cd {PROJECT_ROOT}; wm test {SLUG}
```

| Check | Cmd | Pass rule | Evidence on fail |
|---|---|---|---|
| Words match, ends cleanly | A1 | no flawed clip | clip id, flaw, transcript |
| Render failures | A2 | empty | clip id, text |
| Clips vs beats | A3 | no missing, runs-past, or orphan line | `clips.md` line |
| Clips current | A4 | no output | stale clip ids |
| Coverage | A5 | voiceCoverage passes | failing test |

Casting set: the VERIFY commands in [casting](casting.md)'s brief, per
new ref. Reused refs: hashes only.

Pacing set (when the brief names the editor):

```
P1  pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools pacing-curve --build {SCRATCH}\build --script {PROJECT_ROOT}\script\index.ts --out {SCRATCH}\pacing
P2  A3 above
```

| Check | Cmd | Pass rule | Evidence on fail |
|---|---|---|---|
| Pacing curve | P1, `beats.csv` | each beat within the bible's targets | `beats.csv` row, target |
| Runtime | P1, sum of `dur` in `chapters.csv` | equals last approved, or a ledger row explains it | both runtimes |
| Weights | P1, `share_pct` vs spine weight | within the bible's tolerance | chapter, share, weight |
| Clip check | P2 | no missing, runs-past, or orphan line | `clips.md` line |

Port set: `cd {PROJECT_ROOT}; wm parity`, with the negative control and
pass rule in [porting](../engine/porting.md) step 4.

Export set: every check in [export](../engine/export.md) section 6.

Then apply the maker's checklist from its role file, if named, and the
project checks, using the same outputs.

Not a QA item: anything that needs judgment of meaning. Those belong to
the [script-editor](script-editor.md), the
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
SCRATCH: {PROJECT_ROOT}\.scratch\qa-r{N}   (gitignored; every tool output goes here)

GOAL
Run the named checks and report measurements. Do not fix. Do not judge taste or meaning.

READ, IN THIS ORDER (and nothing else)
1. C:\Users\dustin\.claude\skills\video-studio\roles\qa.md   (checklist, commands, report format)
2. C:\Users\dustin\.claude\skills\video-studio\tools\setup.md and the doc of each tool you run, in that folder
3. {maker's role file, for its checklist, if named}
4. {Pacing set: {PROJECT_ROOT}\production\bible.md (pacing targets, exceptions)}
5. {Port: C:\Users\dustin\.claude\skills\video-studio\engine\porting.md. Export: ...\engine\export.md section 6}

CHECKS TO RUN
Sets: {list}
Scope: {all | chapters {ids}: add --chapter {id} to each tool | clip ids {list}}

PROJECT CHECKS (from {PROJECT_ROOT}\production\checks\qa.md)
{paste the file verbatim, or "none"}

YOU OWN
Nothing. Leave git status clean. Tools start and stop their own server; stop any you start.

REPORT
Use the report format in your role file. At most 250 words.
```

## Escalation

- A tool fails or cannot run: report "not run" and why.
- A failure whose fix is not in the maker's owned files.
- A pass rule that needs a number the bible does not set yet.

## Known failure modes

- **"Should pass" reported as pass.** Prevention: ran, passed, and not
  run are separate.
- **A void sweep.** Zero text draws means the sweep saw nothing.
  Prevention: the pass rule requires a count above 0.
- **Audio judged by ear claims.** Agents cannot hear. Prevention:
  transcript and signal measurements only; the human listens.
