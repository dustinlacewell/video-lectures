# Change orders

A change order is a human note that arrives while work is in flight.
This loop decides what stops and what goes on.

## First, always

The producer copies the note verbatim into the
[notes ledger](../documents/notes-ledger.md). Any decision in it goes
into the [bible](../documents/bible.md) verbatim, marked
`Source: human`. Then the producer sizes the note.

## Three sizes

| The note | What happens |
|---|---|
| Touches work in a running round, but the round's inputs still hold | It waits. The round's critic reports first. The note then joins the critic's blocking findings in the maker's next fix round. |
| Invalidates the round: it changes the maker's inputs (its lines, boards, or document rows), or the round's output will be thrown away | Stop that round now. Keep its worktree. Re-brief the maker with the change. Other loops go on. |
| Changes the thesis or a chapter's job | Freeze all loops. See below. |

A note about work no loop has started goes through
[notes-to-checks](notes-to-checks.md) when that work begins.

## Freeze

1. **Stop.** No new round starts. Nothing merges. Each running agent is
   stopped at its next hand-back. Record the freeze in
   `production/status.md`.
2. **Blast radius.** A Sonnet agent lists what the change touches:
   - chapters (the changed one, and every chapter that sets up or pays
     off its claim in the [spine](../documents/spine.md));
   - clips to re-render (beat ids in changed lines);
   - scene files;
   - documents (spine rows, bible entries, terminology, vocabulary
     rows, boards);
   - the agent runs this adds to the budget.
3. **Ask one question.** Two choices and a recommendation. Example:
   "Changing chapter 3's job touches chapters 3 and 5, 14 clips,
   `scenes/03-doors.ts`, and spine rows 3 and 5. About 6 more runs. Do
   it now, or after this cut, in the notes round? I recommend now:
   chapter 3 is not animated yet."
4. **Record.** The human's answer goes into the bible verbatim. Entries
   it replaces are marked `Superseded by B<n>`.
5. **Thaw.** The director updates the spine and other documents. The
   status file lists which loops restart from the new documents and
   which resume as they were. Unaffected loops resume first.

## Why it exists

Chapter loops run in parallel. A late note can make a whole round's
work useless, or it can wait an hour at no cost. Without a rule, the
producer either stops everything for a typo or lets animators draw a
chapter whose job just changed.
