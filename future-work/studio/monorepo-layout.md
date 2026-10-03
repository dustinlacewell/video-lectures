# Monorepo layout

Not built. Proposal.

## Today

```
videos/<slug>/     one video: script, scenes, engine, kit, player, voice, production docs
studio/            the video-studio skill (markdown) and the QA tools (studio/tools)
site/              the series index
.wm/               workmark commands
```

Every video carries its own copy of the engine. There is no shared code.

## Proposed

```
packages/
  engine/      @studio/engine    timeline, beat state, camera, render, text, audio, player shell,
                                 speech, anchors, actions. Pure core, shell at the edge. No characters.
  library/     @studio/library   characters, wardrobe, props, backgrounds, shots, sounds, motifs,
                                 voices, symbols. Each item: code + card + preview + test.
  voice/       @studio/voice     manifest builder (TS) and the Python pipeline, one venv, one model folder.
  cut/         @studio/cut       the living cut: takes, picks, element status, the rebuild graph, export cache. Node only.
  tools/       @studio/tools     headless QA: contact sheet, frame sweep, pacing curve, clip check, guard.
  app/         @studio/app       the review and production app. Wraps the player.
studio/                          the skill: phases, roles, loops, documents. Markdown only.
videos/<slug>/                   script, scenes, shots, voice data, golden frames, production state.
site/                            the series index, plus /studio/ (app, catalog) when published.
.wm/                             workmark commands. One set for every video.
```

## Why these seams

- `engine` and `library` are separate because the engine contract already forbids the engine to import the kit. A package boundary makes the rule a build error.
- `cut` is separate from `engine` because the cut runs in Node and writes files. The engine runs in the browser and writes nothing.
- `tools` is separate because tools drive a built page through debug globals. They must not import scene code, or a critic sees what the maker saw.
- `app` is separate from the player because the public player stays small. The app is the producer's instrument.
- The skill stays in `studio/` as markdown. The `~/.claude/skills/video-studio` junction keeps working.

## Dependency direction

```
app  →  engine, library (read), cut (derived JSON only)
cut  →  engine (buildTimeline), voice (manifest)
tools  →  nothing of the above at runtime; they read the built page
videos/<slug>  →  engine, library, voice
library  →  engine (canvas, draw, palette, math)
engine  →  nothing in the repo
```

A dependency against this arrow is a build error (package `exports` plus `tsc` project references).

## What a video folder holds after the move

```
videos/<slug>/
  video.json          slug, title, description, poster, published   (no runtime: it is computed)
  video.ts            defineVideo({ script, cast, actions, shots })  data only, Node can import it
  script/             chapters as pure data; cast
  scenes/             draw code per chapter; .actions.ts and .shots.ts beside it
  voice/              refs, manifest.json, picks.json, clips/ (picked takes), takes/ (gitignored)
  golden/             guard samples: frames.json tracked, png/ gitignored
  production/         status.json, notes/, ledger.json, bible.md, spine.md, checks/, style-guide/
  cut/                shots.json: which version draws each beat
```

Stage 1 of [stages.md](stages.md) creates `engine`, `library`, `voice`. Later stages add `cut`, `tools`, `app`.
