# Phase: development

Turn the human's idea into a thesis, a [spine](../documents/spine.md)
and a seeded [bible](../documents/bible.md). No script yet. This is the
cheapest place to fix the argument.

## Entry criteria

- The human has said, in their own words, what the video argues.
- A rough length is known. It picks the track ([sizing](sizing.md)).
- Output formats default to the parent production's (web page and MP4
  on the reference). Ask only when there is no parent.
- Earlier material is listed by path: drafts, older versions, chat
  exports. If there are several versions, the human has said which is
  newest.
- If the human said "same style as X", X's repo path is known. X is the
  parent production.

## Steps, both tracks

0. **Make the repo.** A new video: the producer creates it per
   [new-project](../engine/new-project.md). No agent. A single-file
   prototype: the [engine owner](../roles/engine-owner.md) ports it per
   [porting](../engine/porting.md), in parallel with the steps below.
   Engine readiness is not here; it is [preproduction](preproduction.md)
   step 0.
1. **Record the thesis.** The producer copies the human's words verbatim
   into the bible as entry B1, `Source: human`. No paraphrase, no
   critique.
2. **Inherit the style.** With a parent production, the producer copies
   X's `production/style-guide/*` (writing, terminology, visual
   vocabulary) into this repo's `production/style-guide/`. The director
   adapts the copies; it does not start from blank.

## Steps, lean

3. **One director run.** The [director](../roles/director.md) writes:
   - the spine;
   - the bible seed: candidates from earlier material, and the parent's
     bible entries that set style rather than topic;
   - the style guide, adapted from the parent's copies, or new;
   - a truth check of the spine: each claim in the chain is true under
     the bible's stipulations. A stipulation the chain needs but the
     bible lacks becomes a candidate.

   If earlier material exists, a Sonnet harvest run lists its decisions
   first (full track, step 3). One more run.

## Steps, full

3. **Harvest settled decisions.** If earlier material exists, a Sonnet
   agent lists every decision in it with a verbatim quote and its source
   (file, version, date). Newest version wins. The director turns the
   list into bible candidates. The producer does not judge the current
   draft against an older one.
4. **Draft the spine.** The director writes thesis, chain of claims,
   chapter jobs, cards, weights, setups and payoffs, motifs.
5. **Critique the spine.** [Script-editor](../roles/script-editor.md) in
   spine mode, in a [maker-critic loop](../loops/maker-critic.md), at
   most 3 rounds. Its checklist includes the truth check above, two
   chapters with one job, a chapter with several claims, and a term with
   no setup.
6. **Prepare the gate.** The director lists the decisions the human must
   take, in order, each with two choices and a recommendation.

The full track writes the style guide in preproduction step 1.

## Gate: the argument

The human signs off the thesis, the chain of claims and the bible seed.
One decision per message: two choices and a recommendation.

**Lean**, usually 3 or 4 messages:

1. The spine: chain of claims and chapter plan, one line each. Skip the
   thesis check when B1 is the human's own words.
2. Each candidate the argument's truth depends on (a stipulation, a
   rule of the puzzle), one per message.
3. All other candidates in one list: approve all, or name the ones to
   drop.
4. The one spine defect that most needs the human, if any.

**Full**, in this order:

1. Thesis. "Here is the thesis in one sentence: <...>. Is this what the
   video argues? I recommend yes."
2. Chain of claims, as short numbered lines. "Is any step wrong or
   missing? I recommend approving it as is."
3. Chapter plan: titles with their jobs, one line each.
4. Each bible candidate the human did not state directly. Yes or no.
5. Each known spine defect that needs the human. One at a time.

On rejection: the human's words go into the
[notes ledger](../documents/notes-ledger.md) verbatim. The director
revises only what was rejected. The producer re-asks only that item.
The producer appends every answer to the bible verbatim, with source
"human, development gate".

A thesis change after this gate is a change order:
[change-orders](../loops/change-orders.md).

## Exit criteria

- `production/spine.md`: every chapter has one job, a card and a weight.
  Every setup has a payoff, or the human accepted the gap.
- `production/bible.md`: B1 is the thesis in the human's words.
  Candidates are approved or removed. "Open" holds only what the human
  deferred.
- Lean: the three style-guide files exist.
- `production/status.md` names the track and the budget.

## Common failures

- **Relitigating, and judging new against old.** Search the bible before
  raising anything. Ask which version is newest.
- **One point, three chapters.** Chapters 4–6 of the original made one
  point three times. The spine shows it as three job lines that say the
  same thing.
- **Compression at the end.** The last chapter carried three claims in
  one minute. Check claims per chapter against weight.
- **Unannounced terms.** "Self-model" first appeared in the last
  chapter. A setup row with no "Planted" entry is a defect.
- **A false chain.** In a dry run the chain said "one time in three",
  which needs the car placed at random. The bible listed only the host's
  rules. The truth check catches it before the human signs.
