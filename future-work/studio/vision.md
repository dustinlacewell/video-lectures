# The studio

Not built. Proposal.

## What it is

The studio is a platform inside the `video-lectures` monorepo. It makes narrated, code-animated lecture videos. An AI crew does the work. The producer (the main Claude session) runs the crew by the `studio/` skill. The human owns the argument and the taste.

The studio is not one pipeline. It is three things that work together.

1. **A living cut per video.** The film is always playable. It starts as a board reel with estimated timing. Departments swap in better pieces as they finish them: a voice take, a finished shot, a sound. See [living-cut.md](living-cut.md).
2. **Libraries that grow.** Characters, wardrobe, props, shots, sounds, voices, symbols. Every production adds to them. A catalog shows what the studio owns. See `libraries/` and [catalog.md](catalog.md).
3. **Production state as data.** Status, notes, ledger, checks and briefs are files that tools, agents and the app read and write. See [coordination.md](coordination.md).

## Why a living cut

Real studios cut the story reel first. Editorial is the hub. Every department replaces pieces of the reel until it is the film. Nothing is animated that the reel has not earned.

The first production did the reverse. Animation came first, from a word-count guess. Real voice came later and the runtime fell from 9:42 to 7:05. Nobody chose that pacing (history, item 7). Animators had timed their beats to lengths that then changed under them. The skill now says "voice before animation". The living cut makes that structural: the reel exists from day one, timing is always the best known, and every piece has a placeholder until a final arrives.

## The three capitals

Every production leaves the studio richer in three ways.

| Capital | From the first production | Where it goes |
|---|---|---|
| Assets | The bean rig, the ghost and spirit, the badges, the star, the speech bubble, the neural field behind the brain, nine sounds, four cast voices, the title card | `packages/library`, one card per item |
| Code | Rich text, safe-area clamping, speech timing, the sync engine (anchors, actions, holds), the board renderer, the parity tool | `packages/engine`, `packages/tools` |
| Process | Eleven writing rules, three checks files, the notes-to-checks loop, the maker-critic brief blocks | `studio/` (the skill) |

The mechanism is [harvest.md](harvest.md). A named role judges each invention and promotes the ones that will be used again. Guards ([guards.md](guards.md)) make a promotion safe for finished videos.

## What "easier" means

Measured against the first production:

- A new video starts with a cast, a bean, bubbles, a title card and a checklist shot from the library. Not a copy of the last repo with its content deleted.
- A beat is written as actors, actions and a camera, anchored to words. Not as `S.since('ghost') - 2.7`.
- Re-voicing one line re-renders one clip and re-encodes one chapter. Not everything.
- A note is pinned at a time in the app while the human watches. The ledger row starts filled in.
- An agent reads the status, the checks and the catalog as data. Nothing is pasted into a brief by hand.
- A change to a library piece runs every finished video's guard. Nothing breaks silently.

## Constraints kept

TypeScript and Canvas 2D. Every frame is a pure function of time. Python only for voice, one venv, one model folder. Windows dev box with an RTX 3090. The site is static on GitHub Pages. Functional core, imperative shell. Small files with real seams. No backward-compatibility shims. Docs as a hierarchy.
