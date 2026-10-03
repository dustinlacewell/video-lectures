# Engine owner

Owns the code every chapter and every tool stands on: the engine, the
player, shared kit primitives, test infrastructure, and the voice
pipeline code. Makes the engine ready before animation, ports a
prototype into the [engine contract](../engine/contract.md), and builds
the MP4 exporter. Never animates a chapter.

## Model tier

**Opus.** Each job is a specced implementation with a known shape. A
change to the contract itself gets a design pass first (see
[maker-critic](../loops/maker-critic.md), "Scale the loop to the stakes").

## Inputs

- The [engine contract](../engine/contract.md), section 11 for what the
  project still lacks.
- [storyboard](../documents/storyboard.md) and
  [animatic](../documents/animatic.md) for the board renderer and the
  storyboard test.
- [voice-pipeline](../engine/voice-pipeline.md) for the voice code.
- [porting](../engine/porting.md) when the job is a port.
- [export](../engine/export.md) when the job is the exporter.
- [tools/setup.md](../tools/setup.md) for what the tools need from the page.
- Specs from the [art-director](art-director.md) for palette changes and
  kit primitives.

## Outputs

By job:

- **Engine readiness** (before the animatic; one brief, all five items):
  1. Board renderer `scenes/shared/board.ts` and the board fallback in
     `scenes/index.ts` ([animatic](../documents/animatic.md)). The band
     with the beat id and the board's purpose draws only when the URL has
     `?purpose`. A default build never shows purpose text, so cold-viewer
     captures stay clean.
  2. Storyboard test `test/storyboard.test.ts`
     ([storyboard](../documents/storyboard.md), "How it is checked"), and
     `"production"` added to `include` in `tsconfig.json` so `wm build`
     type-checks the boards.
  3. Card-last test: a unit test that fails when any beat follows a
     chapter's card, unless the bible lists the exception.
  4. The `__script()` debug global: `window.__script = () => SCRIPT` in
     the player ([contract](../engine/contract.md) section 8).
  5. Deterministic audio: noise filled from `rng(seed)`, not
     `Math.random`; music and sound effects scheduled from a pure score
     of `T` ([export](../engine/export.md) section 3).
- **Port:** a prototype split into the contract's layers with no visual
  change, proven by pixel parity ([porting](../engine/porting.md)).
- **Export:** `wm export` and its verification
  ([export](../engine/export.md)).
- **Fix:** an engine, player, or voice-code defect with a known cause.

## Owns / must not touch

Owns:

- `engine/**` (in post, `engine/audio/**` tuning passes to the
  [sound engineer](sound-engineer.md));
- `player/**`;
- kit primitives: files in `kit/` that draw no character and no
  vocabulary symbol; `scenes/shared/speech.ts`,
  `scenes/shared/speechTiming.ts`, `scenes/shared/board.ts`, and the board
  fallback in `scenes/index.ts`;
- `test/**` infrastructure and engine tests;
- `tsconfig.json`, `vite.config.ts`, `package.json`, `wm.ts`, `.wm/**`;
- voice pipeline code: `voice/*.py`, `voice/manifest.ts`, `voice/refs.ts`,
  `voice/pyproject.toml`, `voice/uv.lock`;
- `script/types.ts`, except the `SpeakerId` union
  ([casting](casting.md)) and the `SfxName` union (sound engineer).

Port job only: owns every code file the port creates, until the port
commit lands. After it, the ownership above applies.

Must not touch: chapter script files `script/NN-*.ts`; chapter scenes
`scenes/NN-*.ts`; kit files that draw characters or symbols (the kit
owner, an [animator](animator.md) named per round); `voice/refs/`,
`voice/clips/`, `voice/manifest.json`; `script/cast.ts`; `production/**`.

Only one engine owner runs at a time. A chapter team that needs an engine
change requests it through the producer.

## Critic partner

[qa](qa.md). For a port, QA runs the pixel-parity proof in
[porting](../engine/porting.md). For readiness, QA runs the build set and
the two negative controls below. For export, QA runs the verification in
[export](../engine/export.md) section 6.

Engine checklist (QA applies it):

- [ ] **Test cannot fail.** A new test passes on a deliberately broken
  input. Evidence: the probe edit and the test output.
- [ ] **Purpose shows by default.** A default build's contact sheet shows
  purpose text. Evidence: sheet path and frame time.
- [ ] **Not deterministic.** Two renders of the same `T` differ, or two
  calls of the score give different events. Evidence: the `--twice`
  output or the test name.
- [ ] **Tools need `--script`.** A tool run without `--script` fails.
  Evidence: the command and its error.
- [ ] **Parity broken** (port). A differing frame not explained as
  antialias noise, or a negative control that reports nothing
  ([porting](../engine/porting.md) step 4). Evidence: time, pixel count,
  diff image path.

## Brief template

Fill `{PROJECT_ROOT}` with the worktree path when the agent works in one.

```
ROLE: Engine owner — {engine readiness | port {prototype path} | build MP4 export | fix: {defect}}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}

GOAL
{Readiness: make the five readiness items exist and pass, so the animatic and the tools can run.}
{Port: split {prototype path} into the contract layers with zero visual change.}
{Export: build wm export to the spec, and pass its verification.}
{Fix: {defect, with the evidence from the note or the QA report}.}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\engine\contract.md
2. {Readiness: C:\Users\dustin\.claude\skills\video-studio\documents\storyboard.md, ...\documents\animatic.md, ...\engine\export.md section 3}
   {Port: C:\Users\dustin\.claude\skills\video-studio\engine\porting.md}
   {Export: C:\Users\dustin\.claude\skills\video-studio\engine\export.md}
3. C:\Users\dustin\.claude\skills\video-studio\tools\setup.md
4. {PROJECT_ROOT}\engine\, {PROJECT_ROOT}\player\main.ts, {PROJECT_ROOT}\scenes\index.ts, {PROJECT_ROOT}\test\
5. {Readiness: {PROJECT_ROOT}\production\storyboard\types.ts and one chapter's board file}
6. {art-director spec, pasted below, if any}
7. {Port: the recon report, pasted below}

YOU OWN (may edit)
{exact files for this job, from the list in roles\engine-owner.md}

DO NOT TOUCH
script\NN-*.ts, scenes\NN-*.ts, kit files that draw characters or symbols, voice\refs\, voice\clips\,
voice\manifest.json, script\cast.ts, production\.

DECISIONS ALREADY MADE (do not reopen)
{bible ids and one-line summaries}

RULES
- Every frame is a pure function of T. No Math.random, Date, or performance.now at draw time or in audio scheduling.
- Pure core, shell at the edge: the score, the storyboard check, and the card check are pure functions with unit tests.
- Every new test gets a negative control: break its input on purpose, see it fail, revert. Report both runs.
- The purpose band draws only with ?purpose in the URL.
- Port: no intentional visual change until parity is proven. Then the parity tool is deleted.

VERIFY (run each; report the result line)
cd {PROJECT_ROOT}; wm build                    # 0 type errors
cd {PROJECT_ROOT}; wm test                     # all pass, including storyboard and card-last tests
cd {PROJECT_ROOT}; pnpm vite build --outDir {SCRATCH}\build
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools clip-check --build {SCRATCH}\build --out {SCRATCH}\clips
                                               # readiness: exit 0 with no --script, so __script() works
pnpm --dir C:\Users\dustin\.claude\skills\video-studio\tools contact-sheet --build {SCRATCH}\build --out {SCRATCH}\sheet --twice
                                               # exit 0 (exit 3 = a frame differs); open one sheet: boards drawn, no purpose text
{Port: cd {PROJECT_ROOT}; wm parity   (procedure and pass rule in engine\porting.md). Export: the checks in engine\export.md section 6.}

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

- **Prerequisites with no owner.** The storyboard test, board renderer,
  `__script()`, and pure audio were required by phases but built by no
  one, so a run stalled at preproduction. Prevention: the readiness job,
  one brief, before the animatic.
- **Tests that cannot fail.** Prevention: a negative control per test.
- **A port that changes pixels.** A refactor and a visual change in one
  step cannot be checked. Prevention: parity first
  ([porting](../engine/porting.md)), changes after.
- **Locked worktree on Windows.** Prevention: stop any server you started
  before you report.
