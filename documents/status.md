# Status

The resume point. One short file that says where the production is and
what happens next. A new session reads it first and can act without
reading anything else.

## Why it exists

A production runs across many sessions and many agents. Without a
resume point, a new session rebuilds the state from the repo and the
chat. It can reopen a finished loop, or lose one that is half done in a
worktree.

## Owner and flow

- Owner: the producer. Nobody else edits it.
- The producer updates it at every gate and every agent hand-back (an
  agent's report arrives).
- It holds pointers, not content. Decisions go in the
  [bible](bible.md). Notes go in the [notes ledger](notes-ledger.md).
- Keep it to one screen. Replace stale lines. Do not append history;
  git keeps it.

## Where it lives

`production/status.md` in the video repo. Commit it at every gate.

## Format

```markdown
# Status: <video title>

- Phase: <development | preproduction | voice | animation | post | delivery>, step <n>: <step name>
- Track: <lean | full | notes round | re-voice | polish | port | export>
- Budget: <used> of <total> agent runs
- Narrator rate: <spoken words per second of runtime>, <measured: pacing-curve run <date> | default 2.0, not yet measured>
- Last gate: <gate>, <passed | rejected: one line>, <date>
- Pending human question: <the question, verbatim | none>
- Next action: <one line>

## Open loops

| Role | Round | Worktree | Branch | Evidence ({SCRATCH}) | Last report | Waiting on |
|---|---|---|---|---|---|---|
| <animator, zombie> | <2 of 3> | <absolute path or none> | <branch> | <{PROJECT_ROOT}\.scratch\animator-zombie-r2> | <{PROJECT_ROOT}\.scratch\animation-supervisor-zombie-r1\report.md> | <supervisor re-check> |

"Last report" is the newest report in the loop: the critic's findings
while the maker fixes, the maker's fix report while the critic
re-checks. A new session resumes the loop from it
([maker-critic](../loops/maker-critic.md), "Scratch and resume").

## Frozen

<none | all loops frozen by a change order, <date>: one line; see bible B<n>>
```

## How it is checked

At the start of a session the producer compares "Open loops" with
`git worktree list` and `git branch`. A worktree with no row, or a row
with no worktree, is fixed before anything else. Each row's "Last
report" path MUST exist; a loop without one restarts its round.

The narrator rate is spoken words per second of runtime. The producer
records it before any script is written. The writer plans word counts
with it (see [preproduction](../phases/preproduction.md)).

- Reference voices reused: 1.94, measured by
  [pacing-curve](../tools/pacing-curve.md) on the reference (826 words
  in 7:06).
- A new narrator: start at 2.0. After the first render, replace it with
  the measured value.
