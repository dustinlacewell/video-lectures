# The studio app

Not built. Proposal.

The review and production app. It plays the living cut, shows its state, takes notes pinned to a moment, compares versions, shows the board reel, the catalog and the status. It wraps the public player; it does not replace it.

## Two modes

- **Local** (`wm studio <slug>`): Vite dev server for one video with a small write API. The app writes notes, picks and locks into the video's `production/` and `voice/` folders. This is where the human reviews.
- **Published** (`/studio/` on the site): static, read-only. Catalog, status pages, the reel of any video. For sharing a cut with a cold viewer or for the human on another machine.

The site is static on GitHub Pages, so writes happen only in local mode. The data files are the seam: the app writes JSON, the tools and agents read it ([coordination.md](coordination.md)).

## Panels

**Play.** The player as today (scrubber with chapter ticks, speed, sound, fullscreen, keys). Plus a stage strip under the scrubber: one segment per beat, colored by shot stage (placeholder, scratch voice, draft, final, locked) from `cut.json`. The human sees at a glance what is still a board.

**Notes.** Press `N` while playing: the clock pauses, a box opens with `T`, the beat id and a frame thumbnail already filled in. The human types the note. It is written to `production/notes/<id>.json` with `by: 'human'`. The notes list shows every note at its time on the scrubber. Clicking one seeks there. This replaces typing notes from memory with a guessed timestamp, which the first production did (history, item 8).

**Compare.** Two builds side by side or A/B toggled, locked to one clock: the working tree against a git ref or against the last blessed goldens. Uses `wm guard`'s build-at-ref step. For "is the new ghost timing better" the human toggles at 0:48 and watches both.

**Board.** The reel with every beat forced to `board` (the `?boards` flag from the engine contract section 11, with `?purpose` for the purpose band). The animatic gate is watched here.

**Takes.** For the current beat: every take of each line with a play button, the verify result and the pick. Clicking a take picks it (writes `picks.json`) and the player uses it at once. The human hears the re-roll in context instead of in a folder.

**Catalog.** [catalog.md](catalog.md).

**Status.** `production/status.json` rendered: phase, budget, pending question, open loops. The ledger as a table with its evidence links. Read-only in the app; the producer writes it.

## What it needs from the engine

- The debug globals (`__seek`, `__info`, `__cam`, `__voice`, `__t`, `__script`). The app uses only these plus `mountPlayer`.
- `__info().stages` per beat (living-cut.md).
- A second player instance for Compare: the player must mount twice on one page with separate audio contexts. Today `main.ts` assumes one canvas; `mountPlayer(video, scenes, el)` fixes that in stage 1.

## What is built when

| Stage | App |
|---|---|
| 2 | Stage strip on the player; `?boards`; Takes panel (read) |
| 4 | Local mode with write API; Notes; Status; Takes (pick) |
| 3 | Catalog page (static) |
| 5 | Compare |

Order follows [stages.md](stages.md). The catalog page is stage 3 because the cards exist then; it is static and needs no write API.

## Where it lives

`packages/app`. It imports `@studio/engine` for the player and reads `dist/<slug>/cut.json`, `dist/studio/catalog.json`, `videos/<slug>/production/*.json`. Published output goes to `dist/studio/`. The write API is one Vite plugin with four routes: `POST /api/note`, `POST /api/pick`, `POST /api/lock`, `POST /api/bless`. Each route is a thin shell over a pure function in `packages/cut`.
