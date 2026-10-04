# Voice sync: anchors, actions, beat length

The sync engine times animation to the words the voice speaks. A scene asks "how far along is action X", not "how many seconds since the beat started". Code: `src/sync/`.

## Data

- `voice/clips/words.json`: per clip, `{ stamp, t: [[start, end], ...] }`, one pair per token of the clip's spoken text split on whitespace. The player loads it next to `durations.json`. Missing file, missing entry, or a token count that does not fit the line: the engine estimates (below).
- Actions: one file per chapter next to its scene, `scenes/<nn>-<chapter>.actions.ts`, exporting a `ChapterActions`. The animator owns it. It is pure data: no drawing imports.
- Registration: `video.ts` collects them, `defineVideo({ script, cast, actions: { physics: physicsActions } })`. `video.ts` stays data-only, so Node (tests, build, tools) builds the same timeline as the player.

## Types (`src/sync/actions.ts`)

```ts
type ChapterActions = Record<beatKey, Record<actionName, ActionSpec>>;
interface ActionSpec {
  at: Start;                 // seconds | at({ word }, shift) | atEnd({ word }) | after(name, gap) | { with: name, shift }
  dur: number;
  ease?: 'ease' | 'linear' | 'in' | 'out' | 'back';   // curve of S.act; default 'ease'
  payoff?: boolean;          // default hold PAYOFF_HOLD instead of ACTION_HOLD
  hold?: number | 'none';    // stillness after it ends; 'none': may run past the beat
  sfx?: [when: 'start' | 'end' | seconds, sfx, arg?][];
}
```

Anchors name the word: `{ word, nth?, speaker?, edge? }`. `word` may be a phrase. Matching ignores case, quotes, and punctuation at token ends. `nth` counts from 1. `speaker` times the word in that speaker's clip, stagger included; default the first speaker. The script text never changes. A reworded line that drops the word throws `beat "<id>": no word "<word>"` when the timeline is built, so `wm test` fails.

`after` and `with` refer to actions of the same beat. Action names are unique in the chapter.

## Example: the ghost beat

```ts
ghost: {
  ghostEnter: { at: at({ word: 'ghost' }, -0.4), dur: 1.2, sfx: [['start', 'boo']] },
  ghostPass:  { at: after('ghostEnter', 0.6), dur: 0.8, sfx: [['start', 'whoosh']] },
  ghostFail:  { at: after('ghostPass', 0.1), dur: 0.4, payoff: true, sfx: [['start', 'fail']] },
}
```

The scene reads `S.act('ghostEnter')` (0 to 1) and `S.sinceAct('ghostFail')`.

## Scene API (`BeatState`)

- `S.act(name)`: progress along its curve; 0 before the start, 1 after the end.
- `S.sinceAct(name)`: seconds since its start; negative before.
- `S.actT(name)`: its start in seconds from chapter start (the clock of `S.t`).

Any beat of the chapter can read any action of the chapter. An unknown name throws.

## Beat length

```
base   = today's rule: last clip end + pad, at least dur (or a card's reading time);
         without clips, dur or the word estimate
held   = max over actions with hold != 'none' of  end + hold
         hold default: ACTION_HOLD 0.6 s; payoff: PAYOFF_HOLD 1.2 s
tail   = FADE_OUT 0.4 s on a chapter's last beat when another chapter follows, else 0
length = max(base, held + tail)
```

Actions only extend a beat. A beat with no actions keeps today's length exactly: the goldens in `test/__golden__/` and the video's `test/__golden__/timeline.json` pin it.

## Estimates

Without word times, each token takes a share of the clip length by its letters, and trailing `.,:;!?` add a pause worth 3 letters. Without a clip length, the length is `speechSeconds` of the line. So a new video's anchors work before any voice exists.

## Entry point

`timelineOf(video, { lengths, words })` in `src/sync/timelineOf.ts`. It places the actions, sets the beat lengths, and calls `buildTimeline`, which lays the beats end to end and turns action sounds into cues.

## Not yet

The old helpers `S.on`, `S.pop` and `S.since` with delays stay until the last scene migrates. Then they are deleted.
