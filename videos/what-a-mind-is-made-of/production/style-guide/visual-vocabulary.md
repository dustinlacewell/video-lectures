# Visual vocabulary: What a Mind Is Made Of

Inventoried from `scenes/`, `kit/`, `engine/` and `script/` at build
1b6be63.

## Symbols
| Id | Look | Drawn by | Means (one meaning) | Never means | Used at |
|---|---|---|---|---|---|
| `you-bean` | orange round figure | `kit/bean.bean` (C.orange) | you, the viewer | anyone else | body, words, zombie, inventory, subtract, animals, title |
| `zombie-bean` | the same orange figure, second position | `kit/bean.bean` | your zombie; looks exactly like you on purpose | a different person | zombie, inventory, subtract |
| `other-bean` | teal round figure | `kit/bean.bean` (C.teal) | another person | you | words.ask1 (friend), form.pulley |
| `movie-zombie` | green figure, stitches, arms out | local to scenes/05 (`movieZombie`, on `kit/bean.bean`) | the wrong kind of zombie; shown only to be crossed out | the philosophical zombie | zombie.movie |
| `star` | lit: yellow four-point star with glow; unlit: dashed grey outline | `kit/spark.spark` | inner experience: lit = present, unlit = absent | cognition, value, "special" | zombie.diff, inventory, subtract, animals.ask |
| `star-question` | navy bubble holding a lit star and "?" | local to scenes/08 (`starQuestion`) | "does this being have inner experience?" | — | animals.ask |
| `question` | "?" glyph | local to scenes/02, scenes/08 | unknown | wrong, false | form.betray, animals.ask, animals.matters (AI) |
| `check` | green disc, white tick | `engine/draw.check` | see Conflicts | — | physics.finger, words.weigh, words.ask2, subtract.s1b, animals.matters |
| `fail` | red disc, white X | `engine/draw.cross` on a disc, in scenes/01, scenes/03 | an attempt to push matter failed | "not this one" | physics.ghost, .spirit, .thought, body.nogap |
| `reject-cross` | large red X stroke | `engine/draw.cross`, in scenes/05 | not this one; set aside | failure to push | zombie.movie |
| `strike` | red line through a word | local to scenes/04 | this word was not chosen | false | words.which |
| `trivia-stamp` | red-bordered stamp "TRIVIA" | local to scenes/08 (`triviaStamp`) | no moral or ethical import | false, unknown | animals.trivia |
| `badge` | colored disc, white icon | `kit/icons.badge` | one item of cognition (see Badges) | inner experience | body.list, body.trace, words.weigh, inventory, subtract, animals, title |
| `lattice` | jiggling pink and purple dots | local to scenes/01, scenes/03 | matter seen very close: particles | cognition | physics.atoms, body.you |
| `domino` | upright tile on the ground | local to scenes/01 (`domino`) | a physical object in a chain of pushes | — | physics.atoms..finger |
| `probe` | small yellow magnifier sweeping the lattice; tag "no extra push found" | local to scenes/01 (`lawProbes`) | the laws were tested here and nothing extra was found | — | physics.laws |
| `gap-marker` | yellow dashed span with end bars; tag "nothing reached it" | local to scenes/01 (`gapMarker`) | no push crossed this gap | — | physics.stop |
| `hand` | cartoon hand | `kit/hand.hand` | a physical push | — | physics.fall, physics.finger |
| `visitor` | ghost, spirit, thought cloud with a face | `kit/spirits.ghost`, `.spirit`, `.thought` | a non-physical would-be pusher | thinking, imagining | physics.ghost..thought; body.nogap (spirit only, bible B16) |
| `roller` | square block on a ramp that rounds off and rolls | local to scenes/02 (`shapeOnRamp`, `mysteryRoller`) | a shape decides what the thing does | — | form.thesis, form.betray |
| `form-function-tag` | cream tags "form" and "function", joined by a yellow "=", then an arrow | local to scenes/02 (`formFunctionTag`) | how form and function relate | — | form.thesis, form.betray; see Conflicts |
| `lever` | beam on a pivot, a rock | local to scenes/02 (`lever`) | a machine whose form fixes what it does | — | form.lever1, .lever2, .lever3 |
| `lever-gauges` | bars "lift" and "effort" | local to scenes/02 (`leverGauges`) | what this lever's form does: how far it lifts, how hard you push | — | form.lever2, form.lever3; see Conflicts |
| `pulley` | rope over a wheel, a crate | local to scenes/02 (`pulley`) | a machine whose form fixes what it does | — | form.pulley |
| `circuit` | two switches, gates labelled XOR and AND, lamps labelled "ones" and "twos", a sum tag | local to scenes/02 (`circuit`) | a machine that adds because of how it is wired | — | form.circuit, form.cut; see Conflicts |
| `scissors` | scissors cutting a wire | local to scenes/02 (`scissors`) | a change of form | — | form.cut |
| `brain` | pink ellipse | local to scenes/03, scenes/05, scenes/06 | the brain, as an object | cognition as a whole | body.muscle, zombie.must, inventory.cog |
| `neuron` | dim / flickering / bright yellow node | local to scenes/03 (`neuron`) | at rest / background activity / firing in the chain we follow | — | body.brain, body.trace |
| `scan` | cyan horizontal line sweeping down | local to scenes/05 (`theCopy`) | copying, particle for particle | — | zombie.copy |
| `boot` | a boot coming down on both toes | local to scenes/05 (`boot`) | a physical hurt, the same for both | — | zombie.toe |
| `thought-tag` | top-left pill, cloud icon, "Thought experiment" | `scenes/shared/thoughtTag` | we are inside a hypothetical | — | zombie.intro → end of subtract (bible B19) |
| `name-tag` | pill under a figure: YOU (cream), ZOMBIE (green) | `engine/text.tag` | who this figure is | — | zombie, inventory, subtract ("= ZOMBIE") |
| `bubble` | white speech bubble with tail | `engine/text.bubble` | a character says this line | narration | words, zombie |
| `cog-panel` | dark panel with an orange "cognition" tab, candidate rows with support bars | local to scenes/04 (`panel`) | cognition weighing candidates | a vote by the person | words.weigh, words.ask2 |
| `arrow` | yellow arrow | `engine/draw.arrow` | causes | "reveals", "therefore" | words.same, zombie.must; see Conflicts |
| `creature` | crow, dog, octopus | `kit/animals.crow`, `.dog`, `.octopus` | an animal, a being with cognition | — | animals.three onward |
| `ai-bot` | robot figure | `kit/aibot.aibot` | an AI, a being with cognition | — | animals.ai onward |
| `faculty-web` | lines between one being's badges | local to scenes/08 (`facultyWeb`) | how sophisticated its cognition is | — | animals.matters |
| `self-mark` | self badge with a check, or a dashed ring with a faded self icon and "?" | local to scenes/08 (`selfModel`, `selfMark`) | this being clearly models itself / no one can say | a ranking | animals.matters (bible B6); see Conflicts |
| `title-art` | "What a mind / is made of", subtitle, figure with badges | `scenes/shared/titleArt.titleScene` | the video's title | — | title.t, animals.end |
| `scenery` | stars, floaters, ground | `kit/scenery.stars`, `.floaters`, `.ground` | setting only; carries no meaning | anything | every chapter |
| `card` | full-screen text, words pop in | engine | the chapter's conclusion | a quote, a heading | every chapter's card beat |

## Sounds
| Id | Sounds like | Means (one meaning) | Never means | Used at |
|---|---|---|---|---|
| `pop` | short rising sine | something appears: a figure, badge, bubble or label | a choice, a success | every chapter from physics on |
| `unpop` | short falling sine | something is taken away | failure | words.which, zombie.diff, subtract.s1a, subtract.s2b |
| `tick` | small knock | a domino tips | a clock | physics.fall, physics.finger |
| `thud` | low knock with noise | a falling thing lands | failure | physics.fall, physics.finger |
| `whoosh` | long noise sweep | a figure, panel or title sweeps in | — | title beats (engine), physics.ghost, .spirit, .thought, form.betray, body.nogap, words.weigh, inventory.z, subtract.s2a, animals.ai |
| `swish` | short noise sweep | a quick move: a swing, a flip, a sweep away | an arrival | physics.fall, .spirit, .finger, form.betray, form.lever3, words.same, zombie.toe, inventory.cog, subtract.s1a, animals.why |
| `fail` | two falling sawtooth notes | an attempt failed | "not chosen" | physics.ghost, .spirit, .thought, form.cut, body.nogap, zombie.movie |
| `ding` | bell, three partials | a result lands | — | title beats (engine), physics.laws, form.circuit, words.weigh, words.ask2, zombie.copy, inventory.cog, animals.matters; see Conflicts |
| `card` | three-note chord with noise | a conclusion card appears | a heading | every card beat (engine), animals.end; see Conflicts |
| `zap` | tiny square blip, pitch by arg | a neuron fires | — | body.brain, body.muscle |
| `blip` | tiny sine blip | an item is checked off | — | subtract.s1b |
| `yelp` | up-down triangle squeak | a character yelps in pain | — | zombie.toe |
| `stamp` | low square hit with noise | see Conflicts | — | zombie.movie, zombie.toe, animals.trivia |
| `rise` | rising triangle | a load goes up | improvement | form.lever1, form.lever3, form.pulley, body.lift, body.muscle |
| `fall` | falling triangle | a load goes down | failure | form.lever1, form.lever3, form.pulley, body.muscle |
| `click` | short high click | a switch closes or opens | a choice | form.circuit, form.cut |
| `snip` | two high noise snaps | a wire is cut | — | form.cut |
| `spark` | two high sines | the inner-experience star lights | an idea, cognition | zombie.diff, inventory.zlife, subtract.s2c, animals.ask, animals.matters |
| `scan` | slow rising sawtooth | copying, particle for particle | — | zombie.copy |
| `boo` | two detuned falling sines | a spooky figure appears | failure | physics.ghost, body.nogap, zombie.movie |
| `talk` | short triangle babble, pitch by arg | a mouth moves; no words heard | a voiced line | words.speak, zombie.sure |

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
  human flagged (R1-3). → One meaning: "yes, still has it". Replace in
  words with the `strike` on the loser only; in physics.finger, the
  falling domino is the evidence, drop the check. (art-director → director)
- `star` restyled: animals.ask draws a new `star-question` bubble, local
  to the chapter, and puts the star in two places. → Move it into the
  kit, or ask with the bare `question` next to an unlit-but-solid star.
  (art-director)
- `star` unlit look: one viewer read the dashed star as "uncertain", not
  "absent" (R3-22). The grey figure under the star at subtract.s2c read
  as "dead" (R3-16). A dashed outline also means "no one can say" in
  `self-mark` for the AI. Dashed means "absent" in one place and
  "unknown" in another. → art-director drafts two looks; one human
  question. (held)
- Yellow means two opposite things. The `star` (inner experience) is
  yellow, and so is everything cognitive: the COGNITION tag, the firing
  chain, the dashed links from items to the body, the faculty web, the
  "inner experience" label. The video's central contrast is drawn in one
  color. → Yellow for cognition and causes; give the star its own color.
  (art-director → human, it is the most visible change)
- `arrow` direction: form.betray flips the yellow arrow in
  `form-function-tag` to point from "function" to "form", meaning
  "reveals". Everywhere else a yellow arrow means "causes". The flip
  reads as "function causes form". A cyan "?" appears on the
  `roller` at the same moment; one viewer could not read it (R3-13).
  → Use a different mark for "reveals" (an eye, or a dotted arrow).
  (art-director, fix now)
- `lever-gauges`: one viewer could not read the "lift" and "effort" bars
  (R3-11). No line names them. → Name them in a line, or cut them.
  (art-director, fix now)
- `circuit` labels: XOR, AND, "ones" and "twos" are technical names no
  line says (R3-10). → Plain labels or none. (art-director, fix now)
- `self-mark` "?": one viewer read the AI's "?" as ranking the AI lowest,
  while narration says "the same is true of AI" (R3-21). Touches bible B6.
  → art-director drafts first; one human question. (held)
- `you-bean` color: the lever user in form.lever1 to form.lever3 is orange, so it reads
  as you. Nothing in the line says it is you. → Teal (`other-bean`). (animator)
- Badge colors drift: plan is purple in body and animals, orange in
  inventory and subtract. Talent is purple, green, and teal in three
  places. Humor is green in inventory, orange in animals. Eye is teal in
  body, blue in animals. → One color per icon, set in `kit/icons`, not
  at each call. (structural; kit owner)
- Habit is a circular arrow in inventory, a clock in words.weigh. → One icon.
- `visitor` vs `thought-tag`: the physics "thought" visitor is a white
  cloud with a face; the thought-experiment tag is a cream cloud. A cloud
  means "non-physical pusher" in ch1 and "we are imagining" in ch5–7.
  Low risk; keep, but do not add a third cloud. (art-director)
- The red X has two forms with two meanings (`fail`, `reject-cross`).
  Acceptable only because the shapes differ. Do not add a third.
- Sound `stamp` has three meanings: a rejection (zombie.movie, with
  `fail`), a foot stomp (zombie.toe), a verdict (animals.trivia). →
  Keep it for the verdict stamp only; the stomp gets `thud`; the
  rejection already has `fail`. (sound-engineer)
- Sound `ding` marks a result landing, but also sounds on every chapter
  title, where nothing has been shown yet. → Low risk; keep, but do not
  use it for "correct". (sound-engineer)
- Sound `card` closes the video at animals.end, a beat after the last
  card. → Follows the bible B13 decision on that beat (Q5). (sound-engineer)
