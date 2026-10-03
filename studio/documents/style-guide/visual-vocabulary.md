# Visual vocabulary

Every symbol, character, color code, label style and sound effect in the
video, each with one meaning. If a picture element or a sound carries
meaning, it has a row.

## Why it exists

In the reference production, four chapter agents worked in parallel and
invented visuals freely. Nobody checked them against a whole-video list,
because there was none.

- The green checkmark meant "tested" in the physics chapter (the human
  asked what three checkmarks meant while "searching for other forces").
  It meant "still has it" in the subtraction chapter, "clearly has it"
  in the animals chapter, and "chosen" in the words chapter.
- The ch8 agent put the inner-experience star in two places and restyled
  it inside a "?" bubble. An earlier version drew the dashed star there,
  which in chapters 5–7 means "absent". So the picture asked "absent?"
  when the line asked "present?".
- The ch2 agent's opening (a square rounding off and rolling; a
  "form = function" tag whose arrow flips) never went past anyone who
  held the whole video.

Sounds drift the same way. In the reference, `stamp` sounded for a
rejection, a foot stomp and a verdict.

## Owner and flow

- Owner: [art-director](../../roles/art-director.md); on the lean track,
  the [director](../../roles/director.md). The owner writes the rows:
  look, meaning, never-means. It never writes code.
- Sounds table: [sound-engineer](../../roles/sound-engineer.md). It owns
  `SfxName` and the synth for each sound.
- Approver: the director approves each new entry and each meaning
  change.
- Implementer: the kit owner, one [animator](../../roles/animator.md)
  named in the producer's brief for each round. It draws each character
  and prop in the shared kit (for example `kit/spark.ts`) from its row,
  then writes the kit function into the row's "Drawn by" cell.
- Readers: [animator](../../roles/animator.md),
  [animation-supervisor](../../roles/animation-supervisor.md), the
  [storyboard](../storyboard.md) (boards cite ids), and the board
  renderer.
- A chapter team that needs a symbol not in the list stops and sends a
  proposal up: look, meaning, beat. It does not draw a local one. The
  owner adds the row as PROPOSED, the kit owner draws it, then the
  chapter uses it.

## Where it lives

`production/style-guide/visual-vocabulary.md` in the video repo. The
code that draws each symbol lives in the shared kit, with one owner.

## Format

```markdown
# Visual vocabulary: <video title>

## Symbols
| Id | Look | Drawn by | Means (one meaning) | Never means | Used at |
|---|---|---|---|---|---|
| `<id>` | <what it looks like> | `kit/<file>.<fn>` or `PROPOSED` | <meaning> | <near meanings it must not carry> | <beat ids> |

## Sounds
| Id | Sounds like | Means (one meaning) | Never means | Used at |
|---|---|---|---|---|
| `<SfxName>` | <what it sounds like> | <meaning> | <near meanings> | <beat ids> |

## Colors
| Color | Means | Never means |

## Label styles
| Style | Means |

## Conflicts
- `<id>`: <uses that disagree, with beat ids> → <proposal> (status)
```

The Symbols and Sounds tables are parsed by the storyboard test
([engine contract](../../engine/contract.md) section 11). The grammar:

- The headings are exactly `## Symbols` and `## Sounds`. A table ends
  at the next `##` heading.
- A data row starts with `` | ` ``. Its first cell is one id in
  backticks, and nothing else.
- An id matches `[a-z][a-z0-9-]*`. Ids are unique within their table.
- Every sound the script uses (a beat's `sfx`, a chapter's `cues`) has
  a Sounds row, and every Sounds row is an `SfxName`. An `SfxName`
  nothing uses needs no row.
- A missing vocabulary file counts as empty tables.
- "Drawn by" names the code that draws the symbol: a kit or engine
  function in backticks. It is `PROPOSED` while no function exists. The
  board renderer draws a PROPOSED symbol as a labelled box
  ([animatic](../animatic.md)). "local to <scene>" marks a symbol that
  skipped the kit: a defect for the kit owner.

Ids are stable. Boards cite them; renaming one breaks every board that
does.

## How it is checked

- The storyboard test ([storyboard](../storyboard.md)): a board that
  cites an id with no row fails. A sound the script uses with no Sounds
  row fails.
- [Animation-supervisor](../../roles/animation-supervisor.md) looks at
  rendered frames at each beat's midpoint and end. Failure: a symbol on
  screen with a meaning not in its row, or a drawn element that carries
  meaning and has no row. Evidence: screenshot path, beat id, row id.
- [Director](../../roles/director.md), whole-video pass after merge: a
  [contact sheet](../../tools/contact-sheet.md) of every chapter, read
  for one symbol at a time across chapters.
- A grep over `scenes/` for kit symbol calls (for example `check(`,
  `spark(`) lists every use with its file. Compare against "Used at".
  The same grep over `script/*.ts` for each sound name checks the
  Sounds table's "Used at".
- [Cold viewers](../../loops/cold-viewer-review.md) never read this
  file. They report what each symbol meant to them; the synthesis agent
  compares that with the row. A mismatch is a defect.

## Filled example: "What a Mind Is Made Of"

An excerpt, inventoried from `scenes/`, `kit/`, `engine/` and `script/`
in the final build. Full real version:
`D:\code\ai\video-lectures\videos\what-a-mind-is-made-of\production\style-guide\visual-vocabulary.md`
(every symbol, sound, badge and conflict).

```markdown
# Visual vocabulary: What a Mind Is Made Of

## Symbols
| Id | Look | Drawn by | Means (one meaning) | Never means | Used at |
|---|---|---|---|---|---|
| `you-bean` | orange round figure | `kit/bean.bean` (C.orange) | you, the viewer | anyone else | body, words, zombie, inventory, subtract, animals, title |
| `star` | lit: yellow four-point star with glow; unlit: dashed grey outline | `kit/spark.spark` | inner experience: lit = present, unlit = absent | cognition, value, "special" | zombie.diff, inventory, subtract, animals.ask |
| `star-question` | navy bubble holding a lit star and "?" | local to scenes/08 (`starQuestion`) | "does this being have inner experience?" | — | animals.ask |
| `check` | green disc, white tick | `engine/draw.check` | see Conflicts | — | physics.finger, words.weigh, words.ask2, subtract.s1b, animals.matters |
| `fail` | red disc, white X | `engine/draw.cross` on a disc, in scenes/01, scenes/03 | an attempt to push matter failed | "not this one" | physics.ghost, .spirit, .thought, body.nogap |
| `reject-cross` | large red X stroke | `engine/draw.cross`, in scenes/05 | not this one; set aside | failure to push | zombie.movie |
| `badge` | colored disc, white icon | `kit/icons.badge` | one item of cognition (see Badges) | inner experience | body.list, body.trace, words.weigh, inventory, subtract, animals, title |
| `self-mark` | self badge with a check, or a dashed ring with a faded self icon and "?" | local to scenes/08 (`selfModel`, `selfMark`) | this being clearly models itself / no one can say | a ranking | animals.matters (bible B6); see Conflicts |
| `arrow` | yellow arrow | `engine/draw.arrow` | causes | "reveals", "therefore" | words.same, zombie.must; see Conflicts |

## Sounds
| Id | Sounds like | Means (one meaning) | Never means | Used at |
|---|---|---|---|---|
| `tick` | small knock | a domino tips | a clock | physics.fall, physics.finger |
| `thud` | low knock with noise | a falling thing lands | failure | physics.fall, physics.finger |
| `ding` | bell, three partials | a result lands | — | title beats (engine), physics.laws, form.circuit, words.weigh, words.ask2, zombie.copy, inventory.cog, animals.matters; see Conflicts |
| `stamp` | low square hit with noise | see Conflicts | — | zombie.movie, zombie.toe, animals.trivia |
| `rise` | rising triangle | a load goes up | improvement | form.lever1, form.lever3, form.pulley, body.lift, body.muscle |
| `fall` | falling triangle | a load goes down | failure | form.lever1, form.lever3, form.pulley, body.muscle |

## Colors
| Color | Means | Never means |
|---|---|---|
| yellow | see Conflicts | — |
| orange figure | you (and your zombie) | anyone else |
| grey | absent, removed | — |
| red disc / stroke | failed, rejected | — |

## Label styles
| Style | Means |
|---|---|
| yellow pill, ink text | a claim the line is making ("same response", "selected by cognition", "COGNITION"); also the "inner experience" label at zombie.diff (see Conflicts: yellow) |
| cream text on an ink pill | a neutral name ("form", "function") |
| cream pill, ink text | a name tag for you ("YOU") |
| green pill, ink text | a name tag for the zombie ("ZOMBIE", "= ZOMBIE") |
| pink pill, white text | a subtraction ("minus inner experience", "minus cognition"); the feelings at zombie.pain ("the ouch") |
| grey pill, ink text | an absence ("no inner experience") |

## Conflicts
- `check` has four meanings: the push worked (physics.finger); this
  answer was chosen (words); this item is still there (subtract.s1b);
  this being clearly models itself (animals.matters). In the port it
  also meant "tested" (three teal checks at physics.laws), which the
  human flagged. → One meaning: "yes, still has it". Replace in words
  with the `strike` on the loser only; in physics.finger, the falling
  domino is the evidence, drop the check. (art-director → director)
- `star` restyled: animals.ask draws a new `star-question` bubble, local
  to the chapter, and puts the star in two places. → Move it into the
  kit, or ask with the bare `question` next to an unlit-but-solid star.
  (art-director)
- `star` unlit look: a dashed outline means "absent" on the star and
  "unknown" on the AI's "?" in `self-mark`. One viewer read the dashed
  star as "uncertain", not "absent" (R3-22). → art-director drafts two
  looks; one human question. (held)
- Yellow means two opposite things. The `star` (inner experience) is
  yellow, and so is everything cognitive: the COGNITION tag, the firing
  chain, the dashed links from items to the body, the faculty web, the
  "inner experience" label. The video's central contrast is drawn in one
  color. → Yellow for cognition and causes; give the star its own color.
  (art-director → human, it is the most visible change)
- `arrow` direction: form.betray flips the yellow arrow to point from
  "function" to "form", meaning "reveals". Everywhere else a yellow arrow
  means "causes". The flip reads as "function causes form". → Use a
  different mark for "reveals" (an eye, or a dotted arrow). (art-director)
- Badge colors drift: plan is purple in body and animals, orange in
  inventory and subtract. Talent is purple, green, and teal in three
  places. Humor is green in inventory, orange in animals. Eye is teal in
  body, blue in animals. → One color per icon, set in `kit/icons`, not
  at each call. (structural; kit owner)
- The red X has two forms with two meanings (`fail`, `reject-cross`).
  Acceptable only because the shapes differ. Do not add a third.
- Sound `stamp` has three meanings: a rejection (zombie.movie, with
  `fail`), a foot stomp (zombie.toe), a verdict (animals.trivia). →
  Keep it for the verdict stamp only; the stomp gets `thud`; the
  rejection already has `fail`. (sound-engineer)
```

## Notes on the example

- The `check` conflict is the one the human found. The yellow conflict
  is bigger and nobody found it. A row-per-symbol table finds both,
  because you cannot fill in "Means (one meaning)" for yellow.
- Moving badge colors into the kit is a structural fix: after it, a
  chapter cannot pick its own color for "plan".
- Several symbols are "local to" one chapter's scene. Each is a symbol
  that skipped the kit. The kit owner moves it into the kit, or the
  row marks it as one chapter's only.
