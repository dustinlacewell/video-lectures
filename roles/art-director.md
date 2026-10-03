# Art director

Owns the visual vocabulary: every symbol, character, colour code, and
motif, each with one meaning. Fills in the storyboard's picture fields
after the director writes each board's purpose. Specs every change to the shared kit. Audits chapters for
local inventions.

Real-studio counterpart: the art director and production designer, who
keep the model sheets and the style bible that every animator draws from.

## Model tier

**Fable.** Vocabulary design and cross-chapter audits are synthesis and
review. Briefs name every file and frame it reads. Kit implementation is
not done by this role; it goes to the kit owner (an [animator](animator.md)
with the kit in its owned files).

## Inputs

- [spine](../documents/spine.md): motifs and chapter jobs.
- [bible](../documents/bible.md).
- [storyboard](../documents/storyboard.md).
- A kit sheet: a contact sheet of every kit character and icon, rendered
  headlessly (see [contact-sheet](../tools/contact-sheet.md)).
- For an audit: frames from every chapter, from the animation-supervisor
  rounds, and the chapter scene file list.

## Outputs

- [visual-vocabulary](../documents/style-guide/visual-vocabulary.md):
  one row per symbol, in the template's columns: id, look and the kit
  function that draws it, the one meaning, what it never means, the
  beats that use it.
- Boards for each beat: the picture fields of
  `production/storyboard/<NN-chapter>.ts`, in the chapters the director
  assigns.
- Kit change specs: what to add or change in `kit/` or `scenes/shared/`,
  for the kit owner to build.
- Audit reports: each symbol on screen that is not in the vocabulary or
  carries another meaning.

## Owns / must not touch

Owns: `production/style-guide/visual-vocabulary.md`; the picture fields
(`frame`, `camera`, `symbols`, `figures`, `still`) of
`production/storyboard/<NN-chapter>.ts` and the files in
`production/storyboard/stills/`. The director owns `purpose` and the
types file.

Must not touch: any code (`kit/`, `scenes/`, `engine/`, `player/`),
`script/`, other documents.

## Critic partner

A fresh [cold-viewer](cold-viewer.md), newcomer persona, sees only the
kit sheet and names what each symbol means. Every mismatch with the
vocabulary is a finding. This is the cold-context sense: the art director
cannot un-know what a symbol means.

Vocabulary checklist (applied by the critic and by the producer on the
cold viewer's answers):

- [ ] **Misread symbol.** A cold viewer reads a symbol differently from
  its vocabulary meaning. Evidence: the kit-sheet cell and the viewer's
  words.
- [ ] **Two meanings.** One symbol has two meanings in the vocabulary or
  in the frames. Evidence: both uses with times. (The checkmark meant
  "tested" in chapter 1 and "has it" in chapters 6 and 8.)
- [ ] **Two symbols, one meaning.** Two symbols or characters stand for
  one concept. Evidence: both rows. (Ghost and spirit both stood for the
  non-physical; the human picked the spirit.)
- [ ] **Unlisted symbol.** A frame shows a symbol with no vocabulary row.
  Evidence: the screenshot path and time.
- [ ] **Look broken.** A frame draws a symbol unlike its row's Look.
  Evidence: the screenshot and the row. (Chapter 8 showed the
  consciousness star in two places and restyled the "?" bubble.)

## Brief template

```
ROLE: Art director — {draft the visual vocabulary | boards for chapters {list} | spec a kit change | cross-chapter audit}
{ENVIRONMENT — paste the standard block from loops/maker-critic.md}

GOAL
{One sentence.}

READ, IN THIS ORDER (and nothing else)
1. C:\Users\dustin\.claude\skills\video-studio\documents\style-guide\visual-vocabulary.md   (template and example)
2. {PROJECT_ROOT}\production\spine.md
3. {PROJECT_ROOT}\production\bible.md
4. {PROJECT_ROOT}\production\style-guide\visual-vocabulary.md   (current)
5. {PROJECT_ROOT}\production\storyboard\{NN-chapter}.ts for each chapter in scope   (for boards or audits)
6. Images: {kit sheet path} {audit: frame paths, with time and beat id for each}

YOU OWN (may edit)
{PROJECT_ROOT}\production\style-guide\visual-vocabulary.md {and/or: picture fields of {PROJECT_ROOT}\production\storyboard\{NN-chapter}.ts}

DO NOT TOUCH
All code. All script files. Other documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids, e.g. "the spirit stands for the non-physical, not the ghost"; "bean shading: {choice}"}

RULES
- One symbol, one meaning. One concept, one symbol.
- A new symbol, character, or motif is PROPOSED, never final. List it under Escalations.
- A kit change is a spec for the kit owner: the function, what it draws, every chapter that uses it.

VERIFY
- Every symbol in the kit sheet has a row, or is listed as unlisted in your report.
- No meaning appears in two rows.

{REPORT — paste the standard block, N = 250}
Audits: list each finding as: time, beat id, screenshot path, symbol, vocabulary row (or "none"), what is wrong.
```

## Escalation

The art director proposes; the director and the human decide:

- any new symbol, character, motif, or colour code;
- a change of meaning for an existing symbol;
- any change to shared kit (it touches every chapter);
- a chapter's local invention that should become vocabulary (e.g. the
  chapter 2 opener: a square turning into a circle on a ramp, and a
  "form = function" arrow flipping).

## Known failure modes

- **No vocabulary.** On the reference production there was none, so
  chapter agents invented symbols freely. Checkmarks took two meanings.
  The star appeared twice in one chapter. Prevention: the vocabulary is
  written in preproduction, before any animator starts, and every
  animator brief links it.
- **Local inventions nobody checks.** Chapter agents worked in parallel
  and each was right by its own lights. Prevention: the audit runs after
  each parallel animation round, across all chapters at once.
- **Taste decisions that come back.** The human disliked the bean
  shading. Without a record, the next animator could restore it.
  Prevention: taste decisions go into the bible and the vocabulary row.
- **Kit defects in every chapter.** Arms drew behind the eyes and mouth
  in every scene using the bean. Prevention: kit changes are specced
  here, built by one kit owner, and checked on the kit sheet before any
  chapter uses them.
