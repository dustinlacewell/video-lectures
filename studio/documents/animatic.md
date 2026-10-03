# Animatic

A playable cut of the whole video before animation. Each beat shows its
storyboard board, timed by the real voice clips, with captions. The human
watches it in the normal player and signs off structure and pacing while
changes are still cheap.

## Why it exists

In the reference production, animation existed before voice, and real
narration changed the pacing with no one choosing it
([voice phase](../phases/voice.md)). An animatic makes pacing a decision
the human takes, on the real clips, before anyone animates.

## Owner and flow

- Builder: [editor](../roles/editor.md). Assembles the cut, judges pad
  and timing, and runs the tools on it.
- Board renderer and registry fallback (the placeholder scenes): the
  [engine owner](../roles/engine-owner.md), built in
  [preproduction](../phases/preproduction.md) step 0.
- Boards: the [art-director](../roles/art-director.md) (the director on
  the lean track) supplies the picture fields the renderer draws.
- Review record owner: [director](../roles/director.md).
- Sign-off: the human, at the gate in [animation](../phases/animation.md).
- Changes found here go to their owners: script lines to the
  [writer](../roles/writer.md) through the
  [script-editor](../roles/script-editor.md); boards to the
  art-director; chapter jobs and weights to the director.

## How it is produced

A project that honors the [engine contract](../engine/contract.md)
needs three small additions.

1. **Board renderer.** `scenes/shared/board.ts` is a normal scene. For
   the current beat it draws the chapter background, then the board's
   still if it has one, else its `figures` posed with the real kit (the
   vocabulary id picks the kit function). A figure whose id has no kit
   function yet (a PROPOSED row in the vocabulary) draws as a labelled
   box with its id, so boards work before the kit round. Captions come
   from the engine as usual. It is a pure function of time like every
   other scene.

   **The purpose band.** With `?purpose` in the URL, the renderer draws
   a thin band with the beat id and the board's purpose. Without the
   flag it draws no band. This is a contract rule:
   - The band is for the human and the director.
   - The purpose is the spine's chapter job in viewer-belief form. A
     cold viewer who reads it is no longer cold. Contact sheets for
     [cold viewers](../loops/cold-viewer-review.md) MUST be captured
     without `?purpose`.
2. **Fallback in the scene registry.** `scenes/index.ts` returns the
   board scene for any chapter that has no animated scene yet. A URL flag
   (`?boards`) forces boards for every chapter. As chapters are
   animated, they replace their boards one by one, so the animatic grows
   into the film.
3. **Real timing.** Nothing new. The timeline already sets each beat to
   clip length plus pad, from `voice/clips/durations.json`. The animatic
   needs the [voice phase](../phases/voice.md) done and
   [clip-check](../tools/clip-check.md) green. No estimated lengths.

Because the debug globals (`__seek`, `__info`) work as usual, every tool
runs on the animatic unchanged:

- [pacing-curve](../tools/pacing-curve.md): per beat words per second,
  beat length, new idea or reinforcement; per chapter runtime against
  the spine weight. (Seconds since last visual change means little on
  static boards; ignore it here.)
- [contact-sheet](../tools/contact-sheet.md): board frames plus the
  timestamped transcript, for [cold viewers](../loops/cold-viewer-review.md).
  Captured with `?boards` and without `?purpose`.

## How the human reviews it

In the normal player, with sound, start to finish, once. The URL has
`?purpose`, so the human sees what each board is meant to do. The scrubber's
chapter ticks let them jump back. They do not read files. The producer
then gives one decision at a time (see the gate in
[animation](../phases/animation.md)). Notes go to the
[notes ledger](notes-ledger.md).

## The review record

`production/animatic.md` in the video repo. One per signed animatic.
Owned by the director.

```markdown
# Animatic review: <video title>

- Build: <commit>, <date>
- Runtime: <m:ss>. Earlier estimate: <m:ss>.
- Chapters: <id> <seconds> (<share>%, weight <share>%) ...
- Pacing flags: <beat id>: <metric> (<value>)
- Cold viewers: <persona>: believes <...>; lost at <beat>; bored at <beat>
- Spine mismatches: <chapter>: job "<...>", viewers believe "<...>"
- Human decision: <signed | changes>, <date>
- Notes: ledger round <n>
```

## How it is checked

- [Clip-check](../tools/clip-check.md) before building: no missing
  clips, no beat shorter than its clip.
- Pacing-curve: a chapter whose share of runtime differs from its spine
  weight by more than half; a beat over the words-per-second ceiling.
- Cold viewers: each chapter's reported belief against its spine job.
- The director writes the record. The human signs.

## Filled example: "What a Mind Is Made Of"

The production had no animatic. This is the record it would have
produced on the real clips, against the spine's weights (full real
spine: `D:\code\ai\video-lectures\videos\what-a-mind-is-made-of\production\spine.md`).

```markdown
# Animatic review: What a Mind Is Made Of

- Build: (none; reconstructed)
- Runtime: 7:06.
- Chapters: physics 58 s (14%, weight 12%); form 49 s (12%, 10%);
  body 45 s (11%, 12%); words 55 s (13%, 12%); zombie 63 s (15%, 15%);
  inventory 52 s (12%, 10%); subtract 38 s (9%, 9%); animals 60 s (14%, 20%)
- Pacing flags: animals carries three claims in 14% of runtime.
  zombie.pain, inventory.zall, subtract.s1b repeat one idea.
- Cold viewers: (would run here)
- Spine mismatches: animals: job "for ethics, a mind is its cognition";
  likely belief "consciousness doesn't matter", with no reason given for
  self-models.
- Human decision: —
```

Two decisions would have reached the human here, one at a time:

1. The runtime on real voice, against the estimate
   ([voice phase](../phases/voice.md)): keep the new pace?
2. "The animals chapter carries three claims in one minute, and the
   trivia claim has no reason before it. Add a reason beat before it, or
   split the chapter? I recommend the reason beat."

Both are edits to script data and boards. After animation, either one
would have meant reworking finished scenes.
