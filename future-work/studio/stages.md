# Stages

Not built. Proposal.

Six stages. Each is small enough to finish and prove. The current lecture (`what-a-mind-is-made-of`) builds, plays and matches its guard after every stage, or the human watched it and blessed the change. A run is one agent spawn or one SendMessage round, as in `studio/phases/sizing.md`.

## Rules for every stage

- `git mv` for moves. No whole-file rewrites. Line endings untouched.
- The guard runs at the end of every step. Zero differing pixels, or a human watch and a bless.
- Docs move in the same commit as the code they describe. No "for context" copies.
- No shims. When a stage replaces a mechanism, the old one is deleted in that stage.
- The agent that writes a step never certifies it. A second agent runs the proof.

## Stage 1: Foundation

**Goal.** Shared packages and the voice sync engine, from studio-design.md Parts A and B, re-scoped to this architecture.

**What changes versus studio-design.md.**

1. Three packages, not one. `packages/engine` (`@studio/engine`), `packages/library` (`@studio/library`), `packages/voice` (`@studio/voice`) instead of `packages/studio`. The kit files (`bean`, `hand`, `scenery`, `icons`, `spark`) go to `packages/library/src/{characters,backgrounds,props}/`, not to the engine. Same `git mv` count; one more `package.json`. Reason: the engine contract already forbids engine → kit imports; a package boundary enforces it. See [monorepo-layout.md](monorepo-layout.md).
2. Import prefix `@studio/engine/<file>`, `@studio/library/<kind>/<name>`.
3. The parity tool is revived as `wm guard` and kept, not deleted. It lives in `studio/tools/guard/` (where the tools are today) and writes `videos/<slug>/golden/frames.json`. A3.0 becomes "guard HEAD vs HEAD: 0 px, control > 0". See [guards.md](guards.md).
4. Anchors are word-named (decision 1b): `at({ word: 'ghost' }, -0.4)`. No marks in `say`. Script text does not change.
5. `mountPlayer(video, scenes, el)` mounts into a given element, so the app can mount two players later.
6. `wm video:new` (A4 item 4) is deferred to stage 6. The scaffold should start from the library and the cut, which do not exist yet. The other pre-voice fixes (tests skip without clips, `runtime` computed into `meta.json`, clip-check with no clips) stay in stage 1.
7. The Python home is `packages/voice/py/` (venv, models, vendor; gitignored).

Everything else in studio-design.md stands: the seam (`video.ts` data-only plus `scenes/index.ts`), the two-line Vite config, `words.json`, anchors, actions, `act` and `sinceAct`, the beat length rule, the per-chapter migration order, the golden test for unmigrated beats, A then B.

**Deliverables.** The three packages; the video depending on them; `wm voice:words`, `wm guard`, `wm guard:bless`; `words.json` committed; all 20 offender beats migrated to actions; old `S.on`/`S.pop` delays deleted; docs `studio/engine/contract.md`, `new-project.md`, `voice-pipeline.md` rewritten from "copy" to "depend".

**Proof.** Guard 0 px at every A step. Part B core: golden test equal to today's timeline for unmigrated beats; guard 0 px before any scene migrates. Per chapter group: `wm test`, a contact sheet at action starts and ends, the human watches. At the end: `wm guard:bless` on the human's approval. `verify.py` 77 of 77 after the venv move; 0 clips re-rendered.

**Cost.** About 22 runs: Part A 8 (the `video:new` run removed), Part B 12, plus 1 Sonnet run for the three-package layout and 1 Opus run to turn parity into the guard with golden files.

**Harvest.** Code: the engine, speech bubbles, rich text, safe area, the sync engine, the guard. Assets: the five kit files moved into the library as files (no cards yet).

## Stage 2: The living cut

**Goal.** The reel is always playable, with placeholders, takes and picks, and incremental export.

**Deliverables.** `packages/cut`: elements, `takes.json`, `picks.json`, `wm voice:pick`, `wm voice:conform`, `wm voice:render --scratch`, `wm cut:status` writing `cut.json`, `cut/shots.json` with blank / board / scene dispatch in `render.ts`. The board renderer, `?boards`, `?purpose`, `__script()`, the card-last test and the storyboard test (engine contract section 11, all five readiness items). The QA tools move to `packages/tools` with `wm qa:contact-sheet`, `qa:frame-sweep`, `qa:pacing`, `qa:clip-check` (workmark replaces `pnpm --dir`). The pure `score(timeline)` and seeded noise. `wm export <slug>` with the per-chapter frame cache and ffmpeg concat. Player stage strip and `?boards` in the app shell.

**Proof.** The reel plays with every beat forced to `blank`, to `board`, and to `scene`. Guard 0 px with all `scene`. Picking a different take changes the audio without a rebuild. `wm export` twice gives byte-identical chapter files. Re-voice one line: exactly one chapter re-encodes (the log says which). `score()` twice is equal.

**Cost.** About 14 runs: cut package 2, readiness items 3 (engine owner, QA, fix), tools move 2 (Sonnet), score and export 4 (engine owner, sound engineer, QA, fix), scratch voice 1, adversary 2.

**Harvest.** Process: the reel replaces "voice before animation" as a rule with a structure. Code: the readiness items stop being per-video gaps.

## Stage 3: Library cards and the catalog

**Goal.** Everything the studio owns has a card, a preview and a test, and a page shows it.

**Deliverables.** `card.ts` and `LibraryCard`. Cards for every moved kit file. Harvest of: the ghost, spirit, thought, crow, dog, octopus and aibot rigs; the sulk, hop, point and reach poses; `neuralField` from `03-body.network.ts`; the domino and the lever as props; the nine sounds with `SfxName` derived from the library; the four voices with `CastMember.voice` replacing `ref`; the symbols from the first video's vocabulary that are not in Conflicts. Bean `anchors()` and `wear`. `wm catalog:build`, `catalog.json`, the static catalog page at `/studio/catalog/`. `studio/roles/librarian.md` and `packages/library/harvest.json`. The vocabulary doc gains the `library:` row form.

**Proof.** Guard 0 px on the first video after every promotion (the bean gaining `wear` moves nothing). Manifest hashes unchanged after the voice move: `wm voice:render` renders 0 clips. The catalog page shows every card with a preview; `wm catalog` lists them. Each card's test has a negative control. The storyboard test resolves a `library:` row.

**Cost.** About 12 runs: card type and build 1, rigs and poses 2, props and background 1, sounds 1 (sound engineer), voices 1, symbols 1, catalog page 1, librarian role doc 1 (Sonnet), QA and fix 2, adversary on the manifest hashes 1.

**Harvest.** Assets: all of the table in [harvest.md](harvest.md) except shots. Process: the librarian role.

## Stage 4: Production state as data, and the app

**Goal.** Status, notes, ledger and briefs are data. The human reviews in the app.

**Deliverables.** `status.json`, `notes/`, `ledger.json`, `locks.json`; `wm status`, `wm note`, `wm ledger`, `wm brief`. The first video's `production/status.md` and `notes-ledger.md` converted once. `packages/app` local mode with the write API; panels Play (stage strip), Notes, Status, Takes (pick). Skill docs updated: `documents/status.md`, `loops/notes-to-checks.md` step 5, `loops/maker-critic.md` brief blocks now generated.

**Proof.** A fresh session runs `wm status <slug>` and states the next action without reading anything else. A note added in the app at 48.2 s appears in `wm ledger split`. `wm brief animator --group physics` produces a brief a second agent judges complete against the role file. `wm status` warns on a loop with no worktree (probe: add a fake loop).

**Cost.** About 10 runs: shapes and commands 2, conversion of the first video 1 (Sonnet), app local mode 3, skill docs 1 (Sonnet), QA 2, adversary on the write API 1.

**Harvest.** Process: the skill reads data instead of pasting tables.

## Stage 5: Authoring

**Goal.** A beat is actors, actions and a camera. Templates make common shots one line.

**Deliverables.** `ShotSpec`, `compileShot`, `frame` cameras, boards as specs with `purpose`. Templates `shot.visitorTry`, `shot.checklist`, `shot.twoBeansTalking`, `shot.lineup`, and the title and chapter card wrappers. The physics and animals chapters migrated to specs (physics has the visitors; animals has the lineup and the checklist). The Compare panel in the app. The grep test that fails on a numeric delay in `scenes/`.

**Proof.** Physics and animals: guard 0 px against the stage 1 goldens (the timing was fixed in stage 1; the spec reproduces it). Any difference is a bug, not a bless. `wm catalog shot.visitorTry` shows params and a five-frame preview. The human toggles Compare at the ghost beat and sees no difference.

**Cost.** About 14 runs: spec and compiler 2, frame camera 1, templates 3, physics migration 2, animals migration 2, Compare 1, QA 2, adversary on determinism 1.

**Harvest.** Assets: the six shot templates. Code: the compiler. Process: the animator role is rewritten around specs.

## Stage 6: Second production, dry run

**Goal.** Prove that a new video starts rich and that the studio stays stable.

**Deliverables.** `wm video:new <slug>`: a video that cites library voices, has one chapter with `shot.titleCard` and `shot.twoBeansTalking`, boards on, scratch voice ready, `wm test` and `wm build` green with zero clips. `wm guard:data` in `.github/workflows/pages.yml`. The end-of-production harvest run on the first video, including its process rows. `studio/phases/sizing.md` gains the harvest cost. `studio/engine/new-project.md` rewritten.

**Proof.** The scaffold builds and plays as a reel in under a minute. CI fails on a probe that changes a beat length in the first video, then passes when reverted. The harvest ledger has a row for every candidate in [harvest.md](harvest.md), each `promoted` or `declined` with a reason.

**Cost.** About 6 runs: scaffold 2, CI 1 (Sonnet), harvest pass 2 (librarian, QA), docs 1 (Sonnet). Then the second video's own production is the real proof, on the skill's lean track.

**Harvest.** Process: the skill's first production on the studio, measured against the first video's history.

## Total

About 78 runs across six stages, plus one human watch per chapter group in stage 1, one at the animatic gate in stage 2, and one per migrated chapter in stage 5.

## Open questions

1. Stage 2 is the largest after stage 1 because export sits in it. Split export into its own stage after 3? Recommend no: the per-chapter cache is what makes the cut incremental, and the skill already owes the exporter.
