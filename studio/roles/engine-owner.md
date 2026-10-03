# Engine owner

Owns the code every chapter and every tool stands on: engine, player,
kit primitives, test infrastructure, and the voice pipeline code. Makes
the engine ready, ports prototypes into the
[engine contract](../engine/contract.md), and builds the MP4 exporter.
Never animates a chapter.

- **Owns:** `engine/**` except `engine/audio/music.ts`, `sfx.ts`,
  `synth.ts` (the [sound engineer](sound-engineer.md)); `player/**`;
  kit primitives (files in `kit/` that draw no character and no
  vocabulary symbol); `scenes/shared/speech.ts`, `speechTiming.ts`,
  `board.ts` and the board fallback in `scenes/index.ts`; `test/**`
  infrastructure and engine tests; the `__script()` global; the MP4
  exporter; `tsconfig.json`, `vite.config.ts`, `package.json`, `wm.ts`,
  `.wm/**`; `voice/*.py`, `voice/manifest.ts`, `voice/refs.ts`,
  `voice/pyproject.toml`, `voice/uv.lock`; `script/types.ts` except
  `SpeakerId` ([casting](casting.md)) and `SfxName` (sound engineer).
  New project and port: every file the job creates, until its commit
  lands.
- **Must not touch:** `script/NN-*.ts`, `scenes/NN-*.ts`; kit files that
  draw characters or symbols (the kit owner); `engine/audio/music.ts`,
  `sfx.ts`, `synth.ts`; `voice/refs/`, `voice/clips/`,
  `voice/manifest.json`; `script/cast.ts`; `production/**`.
- **Model:** Opus (new project copy steps: Sonnet). A change to the
  contract itself gets a design pass first.
- **Critic:** full track: [qa](qa.md). Lean: the producer runs the
  readiness VERIFY commands itself and reads their result lines. The
  exporter always gets QA, export set.
- **Brief template:** [below](#brief-template). Modes: readiness, new
  project (port only), port, export, fix.

Only one engine owner runs at a time. A chapter team that needs an
engine change requests it through the producer.

## Jobs

- **Readiness** (start of preproduction, in parallel with casting
  declare). One brief, five items. Every test passes on a project with
  **zero boards and no production documents**: each check runs on a
  fixture in `test/fixtures/`, and on the project it checks only what
  exists (no `production/storyboard/` yet: that part reports "skipped").
  1. Board renderer `scenes/shared/board.ts` and the board fallback in
     `scenes/index.ts` ([animatic](../documents/animatic.md)). The purpose
     band draws only when the URL has `?purpose`.
  2. Storyboard test `test/storyboard.test.ts`
     ([storyboard](../documents/storyboard.md), "How it is checked"), and
     `"production"` in `tsconfig.json` `include`. Its sound check fails on
     a sound the script cues that has no Sounds row, not on every
     `SfxName`.
  3. Card-last test `test/card-last.test.ts`: fails when a beat follows
     a chapter's card, unless the bible lists the exception.
  4. `window.__script = () => SCRIPT` in the player
     ([contract](../engine/contract.md) section 8).
  5. Pure audio score of `T` and its unit test
     ([export](../engine/export.md) section 3). The synth changes it
     needs go to the sound engineer as a request.
- **New project** (port only; otherwise the producer follows
  [new-project](../engine/new-project.md) by hand). Copy the reference
  repo with its content removed, per new-project.md.
- **Port.** Split a prototype into the contract's layers with no visual
  change, proven by pixel parity ([porting](../engine/porting.md)). Build
  the parity tool as `wm parity` for the port; delete it after.
- **Export.** The first production on an engine with no exporter builds
  `wm export` per [export](../engine/export.md), in the animation phase,
  verified on the animatic build. Critic: QA, export set.
- **Fix.** An engine, player, or voice-code defect. If the cause is
  unknown, find it first and state it with evidence; then write a test
  that fails on the defect; then fix.

## Engine checklist

QA applies it (full track). On lean, the engine owner's report must show
each negative control, and the producer checks the exit codes.

- [ ] **Test cannot fail.** A new test passes on a deliberately broken
  input. Evidence: the probe edit and the test output.
- [ ] **Readiness needs boards.** `wm test` fails on a project with no
  `production/` folder. Evidence: the failing test.
- [ ] **Purpose shows by default.** A default build's contact sheet shows
  purpose text. Evidence: sheet path and frame time.
- [ ] **Not deterministic.** Two renders of one `T` differ, or two calls
  of the score differ. Evidence: the `--twice` output or the test name.
- [ ] **Tools need `--script`.** A tool run without `--script` fails.
  Evidence: the command and its error.
- [ ] **Parity broken** (port). A differing frame not explained as
  antialias noise, or a negative control that reports nothing
  ([porting](../engine/porting.md) step 4). Evidence: time, pixel count,
  diff image path.

## Brief template

Fill `{PROJECT_ROOT}` with the worktree path when the agent works in one.

```
ROLE: Engine owner — {engine readiness | new project for the port of {prototype} | port {prototype path} | build MP4 export | fix: {defect}}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}
SCRATCH: {PROJECT_ROOT}\.scratch\engine-owner-r{N}   (gitignored; builds, sheets, probe output)

GOAL
{Readiness: make the five readiness items exist and pass on a project with zero boards and no production documents.}
{New project: create {PROJECT_ROOT} from the reference repo per new-project.md, so wm --help, wm test and wm build pass.}
{Port: split {prototype path} into the contract layers with zero visual change.}
{Export: build wm export to the spec and pass its verification on the animatic build.}
{Fix: {defect, with the evidence}. If the cause is not known, find it first.}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\engine\contract.md
2. {Readiness: C:\Users\dustin\.claude\skills\video-studio\documents\storyboard.md, ...\documents\animatic.md,
    ...\documents\style-guide\visual-vocabulary.md (section "Format"), ...\engine\export.md section 3}
   {New project: C:\Users\dustin\.claude\skills\video-studio\engine\new-project.md; the reference's tracked files: git -C {reference} ls-files}
   {Port: C:\Users\dustin\.claude\skills\video-studio\engine\porting.md, and the recon report pasted below}
   {Export: C:\Users\dustin\.claude\skills\video-studio\engine\export.md}
3. C:\Users\dustin\.claude\skills\video-studio\tools\setup.md
4. {Not new project: {PROJECT_ROOT}\engine\, {PROJECT_ROOT}\player\main.ts, {PROJECT_ROOT}\scenes\index.ts, {PROJECT_ROOT}\test\}
5. {art-director spec, pasted below, if any}

YOU OWN (may edit)
{exact files for this job, from "Owns" in roles\engine-owner.md}
{New project: every file new-project.md creates, except voice\refs\ and production\ documents. Project name: {name}.}

DO NOT TOUCH
script\NN-*.ts, scenes\NN-*.ts, kit files that draw characters or symbols, engine\audio\music.ts, sfx.ts, synth.ts,
voice\refs\, voice\clips\, voice\manifest.json, script\cast.ts, production\. {New project: the reference repo is read-only.}

DECISIONS ALREADY MADE (do not reopen)
{bible ids and one-line summaries}

RULES
- Every frame is a pure function of T. No Math.random, Date, or performance.now at draw time or in audio scheduling.
- Pure core, shell at the edge: the score, the storyboard check, and the card check are pure functions with unit tests.
- Every new test gets a negative control: break its input on purpose, see it fail, revert. Report both runs.
- Readiness: tests run on fixtures; on the project, a check whose input does not exist yet reports "skipped", not a failure.
- The purpose band draws only with ?purpose in the URL.
- Port: no intentional visual change until parity is proven. Then the parity tool is deleted.
- New project: .gitattributes (* text=auto eol=lf) is the first commit, alone. Commit by explicit path.

VERIFY (run each; report the result line)
cd {PROJECT_ROOT}; wm build                    # 0 type errors
cd {PROJECT_ROOT}; wm test                     # all pass
{Readiness:}
cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools clip-check --build {SCRATCH}\build --out {SCRATCH}\clips
                                               # exit 0 with no --script, so __script() works
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {SCRATCH}\build --out {SCRATCH}\sheet --twice
                                               # exit 0 (exit 3 = a frame differs)
{New project: cd {PROJECT_ROOT}; wm --help   # lists build, dev, test, voice:manifest, voice:render; and the checks in new-project.md "Verify"}
{Port: cd {PROJECT_ROOT}; wm parity   (pass rule in engine\porting.md step 4)}
{Export: cd {PROJECT_ROOT}; wm export, then every check in engine\export.md section 6, on the animatic build}

{REPORT — paste the standard block, N = 200}
Also list: each new test and its negative-control result; any contract change (none expected; a change is an escalation).
```

## Escalation

- Any change to the engine contract (a global, a type shape, the timing
  rule): design pass, then the human signs.
- A kit primitive that turns out to draw a vocabulary symbol: it belongs
  to the kit owner.
- A palette change without an art-director spec.
- A port where parity cannot reach zero differing pixels.

## Known failure modes

- **Readiness that waits for boards.** Tests built against the project's
  boards made preproduction a cycle. Prevention: fixtures; skip what does
  not exist yet.
- **Tests that cannot fail.** Prevention: a negative control per test.
- **A port that changes pixels.** Prevention: parity first
  ([porting](../engine/porting.md)), changes after.
- **An exporter nobody schedules.** Prevention: the first production on
  a new engine builds it on the animatic.
- **Locked worktree on Windows.** Prevention: stop any server you
  started before you report.
