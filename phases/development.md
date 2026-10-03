# Phase: development

Turn the human's idea into a thesis, a [spine](../documents/spine.md),
and a seeded [bible](../documents/bible.md). No script yet. This is the
cheapest place to fix the argument.

## Entry criteria

- The human has said, in their own words, what the video argues.
- The output formats are known (web page, MP4, both) and a rough length.
  The length picks the track ([SKILL.md](../SKILL.md), "Size the job").
- Any earlier material is listed by path: drafts, older versions, chat
  exports. If there are several versions, the human has said which is
  newest.

## Steps

0. **Make the repo.** A new video gets its repo now, per
   [new-project](../engine/new-project.md), so the spine, the bible and
   `production/status.md` land in `production/` from day one. A
   single-file prototype is ported per
   [porting](../engine/porting.md), in parallel with steps 1–5.
1. **Record the thesis.** The producer copies the human's words
   verbatim into the bible as entry B1, `Source: human`. It does not
   paraphrase and does not critique.
2. **Harvest settled decisions.** If earlier material exists, a Sonnet
   agent lists every decision in it with a verbatim quote and its source
   (file, version, date). Newest version wins. The
   [director](../roles/director.md) turns the list into bible entries
   marked "candidate". The producer does not judge the current draft
   against an older one.
3. **Draft the spine.** The director writes thesis, chain of claims,
   chapter jobs, cards, weights, setups and payoffs, motifs. Brief
   template: [director](../roles/director.md).
4. **Critique the spine.** [Script-editor](../roles/script-editor.md) in
   spine mode, in a [maker-critic loop](../loops/maker-critic.md), at
   most 3 rounds. Its checklist targets the known failures: two chapters
   with one job, a chapter with several claims, a term with no setup.
5. **Prepare the gate.** The director lists the decisions the human must
   take, in order, each with two choices and a recommendation.

## Gate: the argument

The human signs off the thesis, the chain of claims, and the bible seed.
One decision per message: two choices and a recommendation. Keep each
message tiny.

**Lean: 3 messages at most.**

1. The spine: chain of claims and chapter plan, one line each. Skip the
   thesis check when B1 is the human's own words.
2. All bible candidates in one list: approve all, or name the ones to
   drop.
3. The one spine defect that most needs the human, if any.

**Full**, in this order:

1. Thesis. "Here is the thesis in one sentence: <...>. Is this what the
   video argues? Yes, or change it. I recommend yes."
2. Chain of claims, shown as short numbered lines. "Is any step wrong or
   missing? I recommend approving as is" (or: "I recommend merging 6 and
   7, because they make one point").
3. Chapter plan: chapter titles with their jobs, one line each.
4. Each bible candidate the human did not state directly. Yes or no.
5. Each known spine defect that needs the human. One at a time.

On rejection: the human's words go into the
[notes ledger](../documents/notes-ledger.md) verbatim. The director
revises only what was rejected. The producer re-asks only that item.

The producer appends every answer to the bible verbatim, with source
"human, development gate". The director tidies the wording later.

A thesis change after this gate is a change order: see
[change-orders](../loops/change-orders.md).

## Exit criteria

- `production/spine.md` exists. Every chapter has one job, a card, and
  a weight. Every setup has a payoff, or the human accepted the gap.
- `production/bible.md` exists. The thesis is entry B1, in the human's
  words. Candidates are approved or removed.
- The "Open" list in the bible holds only items the human chose to defer.
- `production/status.md` names the track and the budget.

## Common failures

- **Relitigating, and judging new against old.** Search the bible
  before raising anything, and ask which version is newest. The
  [bible](../documents/bible.md) says what went wrong without one.
- **One point, three chapters.** Chapters 4–6 of the original made one
  point three times. The spine shows it as three job lines that say the
  same thing. Do not pass the gate with them.
- **Compression at the end.** The last chapter carried three claims in
  one minute, including the thesis's ethical half. Check claims per
  chapter against weight.
- **Unannounced terms.** "Self-model" first appears in the last chapter.
  "Ethics" first appears at minute six. A setup row with no "Planted"
  entry is a defect.
