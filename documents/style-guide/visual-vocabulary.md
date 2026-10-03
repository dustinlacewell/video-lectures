# Visual vocabulary

Every symbol, character, color code, and label style in the video, each
with one meaning. If a picture element carries meaning, it has a row.

Real-studio counterpart: the model sheets and the design bible of an
animated series. Every artist draws the same character the same way,
and a prop means the same thing in every episode.

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

## Owner and flow

- Owner: [art-director](../../roles/art-director.md). The art-director
  edits this file and owns the shared kit that draws the symbols.
- Approver: [director](../../roles/director.md) approves each new entry
  and each meaning change.
- Readers: [animator](../../roles/animator.md),
  [animation-supervisor](../../roles/animation-supervisor.md), the
  [storyboard](../storyboard.md) (boards list symbols by id),
  [cold-viewer](../../roles/cold-viewer.md) (to report what it thought a
  symbol meant).
- A chapter team that needs a symbol not in the list stops and sends a
  proposal up: look, meaning, beat. It does not draw a local one. The
  art-director adds it to the shared kit, then the chapter uses it.

## Where it lives

`production/style-guide/visual-vocabulary.md` in the video repo. The
code that draws each symbol lives in the shared kit (for example
`kit/spark.ts`), with one owner.

## Format

```markdown
# Visual vocabulary: <video title>

## Symbols
| Id | Look (drawn by) | Means (one meaning) | Never means | Used at |
|---|---|---|---|---|
| `<id>` | <what it looks like> (`kit/<file>.<fn>`) | <meaning> | <near meanings it must not carry> | <beat ids> |

## Colors
| Color | Means | Never means |

## Label styles
| Style | Means |

## Conflicts
- `<id>`: <uses that disagree, with beat ids> → <proposal> (status)
```

Ids are stable. Boards in the [storyboard](../storyboard.md) cite them,
and a test fails when a board cites an id that is not in the table.

## How it is checked

- [Animation-supervisor](../../roles/animation-supervisor.md) looks at
  rendered frames at each beat's midpoint and end. Failure: a symbol on
  screen with a meaning not in its row, or a drawn element that carries
  meaning and has no row. Evidence: screenshot path, beat id, row id.
- [Director](../../roles/director.md), whole-video pass after merge: a
  [contact sheet](../../tools/contact-sheet.md) of every chapter, read
  for one symbol at a time across chapters.
- A grep over `scenes/` for kit symbol calls (for example `check(`,
  `spark(`) lists every use with its file. Compare against "Used at".
- [Cold-viewer](../../loops/cold-viewer-review.md): reports what each
  symbol meant to it. A mismatch with the row is a defect.

## Filled example: "What a Mind Is Made Of"

Inventoried from `scenes/` and `kit/` in the final build.

```markdown
# Visual vocabulary: What a Mind Is Made Of

## Symbols
| Id | Look (drawn by) | Means (one meaning) | Never means | Used at |
|---|---|---|---|---|
| `you-bean` | orange round figure (`kit/bean`, C.orange) | you, the viewer | anyone else | body, words, zombie, inventory, subtract, animals, title |
| `zombie-bean` | the same orange figure, second position | your zombie; looks exactly like you on purpose | a different person | zombie, inventory, subtract |
| `other-bean` | teal round figure | another person | you | words.ask1 (friend), form.pulley |
| `movie-zombie` | green figure, stitches, arms out | the wrong kind of zombie; shown only to be crossed out | the philosophical zombie | zombie.movie |
| `star` | lit: yellow four-point star with glow; unlit: dashed grey outline (`kit/spark`) | inner experience: lit = present, unlit = absent | cognition, value, "special" | zombie.diff, inventory, subtract, animals.ask |
| `star-question` | navy bubble holding a lit star and "?" (local to scenes/08) | "does this being have inner experience?" | — (not in kit) | animals.ask |
| `question` | "?" glyph | unknown | wrong, false | form.betray, animals.ask, animals.matters (AI) |
| `check` | green disc, white tick (`engine/draw.check`) | see Conflicts | — | physics.finger, words.weigh, words.ask2, subtract.s1b, animals.matters |
| `fail` | red disc, white X | an attempt to push matter failed | "not this one" | physics.ghost, .spirit, .thought, body.nogap |
| `reject-cross` | large red X stroke | not this one; set aside | failure to push | zombie.movie |
| `strike` | red line through a word | this word was not chosen | false | words.which |
| `trivia-stamp` | red-bordered stamp "TRIVIA" | no moral or ethical import | false, unknown | animals.trivia |
| `badge` | colored disc, white icon (`kit/icons.badge`) | one item of cognition (see Badges) | inner experience | body.list, body.trace, words.weigh, inventory, subtract, animals, title |
| `lattice` | jiggling pink and purple dots | matter seen very close: particles | cognition | physics.atoms, body.you |
| `hand` | cartoon hand (`kit/hand`) | a physical push | — | physics.fall, physics.finger |
| `visitor` | ghost, spirit, thought cloud with a face (`kit/spirits`) | a non-physical would-be pusher | thinking, imagining | physics.ghost..thought; body.nogap (spirit only, bible B16) |
| `brain` | pink ellipse | the brain, as an object | cognition as a whole | body.muscle, zombie.must, inventory.cog |
| `neuron` | dim / flickering / bright yellow node | at rest / background activity / firing in the chain we follow | — | body.brain, body.trace |
| `scan` | cyan horizontal line sweeping down | copying, particle for particle | — | zombie.copy |
| `thought-tag` | top-left pill, cloud icon, "Thought experiment" | we are inside a hypothetical | — | zombie.intro → end of subtract (bible B19) |
| `name-tag` | pill under a figure: YOU (cream), ZOMBIE (green) | who this figure is | — | zombie, inventory, subtract ("= ZOMBIE") |
| `bubble` | white speech bubble with tail (`engine/text.bubble`) | a character says this line | narration | words, zombie |
| `cog-panel` | dark panel "cognition", candidate rows with support bars | cognition weighing candidates | a vote by the person | words.weigh, words.ask2 |
| `arrow` | yellow arrow | causes | "reveals", "therefore" | words.same, zombie.must; see Conflicts |
| `card` | full-screen text, words pop in | the chapter's conclusion | a quote, a heading | every chapter's last beat |

## Badges
| Icon | Means | Color |
|---|---|---|
| memory | memories, remembering | pink #FF5C8A |
| love | loves, wanting | red #F0435E |
| plan | plans, deciding | see Conflicts |
| eye | perceiving, what you saw | see Conflicts |
| habit | habits | teal #12A99A |
| belief, talent, fear, humor | the item named | see Conflicts |
| book | what you learned | purple |
| self | self-model | teal #12A99A |
| tool, puzzle, language, cup, clock | the item named | — |

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
| yellow text on ink | a claim the line is making ("same response", "selected by cognition") |
| cream text on ink | a neutral name ("form", "function", "YOU") |
| pink pill | a feeling or a subtraction ("the ouch", "minus cognition") |
| grey text | an absence ("no inner experience") |

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
- `you-bean` color: the lever user in form.lever is orange, so it reads
  as you. Nothing in the line says it is you. → Teal (`other-bean`). (animator)
- Badge colors drift: plan is purple in body and animals, orange in
  inventory and subtract. Talent is purple, green, and teal in three
  places. Humor is green in inventory, orange in animals. Eye is teal in
  body, blue in animals. → One color per icon, set in `kit/icons`, not
  at each call. (structural; art-director)
- Habit is a circular arrow in inventory, a clock in words.weigh. → One icon.
- `visitor` vs `thought-tag`: the physics "thought" visitor is a white
  cloud with a face; the thought-experiment tag is a cream cloud. A cloud
  means "non-physical pusher" in ch1 and "we are imagining" in ch5–7.
  Low risk; keep, but do not add a third cloud. (art-director)
- The `red X` has two forms with two meanings (`fail`, `reject-cross`).
  Acceptable only because the shapes differ. Do not add a third.
```

## Notes on the example

- The `check` conflict is the one the human found. The yellow conflict
  is bigger and nobody found it. A row-per-symbol table finds both,
  because you cannot fill in "Means (one meaning)" for yellow.
- Moving badge colors into the kit is a structural fix: after it, a
  chapter cannot pick its own color for "plan".
