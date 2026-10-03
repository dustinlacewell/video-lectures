# Coordination

Not built. Proposal.

Production state is data. Status, notes, ledger, checks, locks and briefs are files that tools, agents and the app read and write. The skill keeps its phases, roles and loops; it stops hand-maintaining tables in markdown.

## Why

The first production had no record of settled decisions, so the coordinator relitigated two points (history, item 2). The skill fixed that with the bible. But the status, the ledger and the checks are still markdown tables that the producer edits by hand and pastes into briefs. A table that is pasted drifts. A file that is read cannot.

## Stored versus derived

Stored: what a human or the producer decided. Derived: what the repo implies. Derived files live under `dist/` or `.scratch/` and are never edited.

| File | Stored or derived | Written by | Read by |
|---|---|---|---|
| `production/status.json` | stored | producer (`wm status set ...`) | app, a new session, `wm brief` |
| `production/notes/<id>.json` | stored | human (app), cold viewers, tools (`wm note add`) | producer, `wm ledger` |
| `production/ledger.json` | stored | producer (`wm ledger ...`) | app, `wm brief` |
| `production/locks.json` | stored | human (app) or producer | guard, cut |
| `production/bible.md`, `spine.md`, `style-guide/*.md` | stored | director, art director; the producer appends human decisions | everyone; `wm brief` extracts entries by id |
| `production/checks/<role>.md` | stored | producer | `wm brief` |
| `production/briefs/<role>-r<N>.md` | derived | `wm brief` | the agent |
| `dist/<slug>/cut.json` | derived | `wm cut:status` | app, tools |
| `dist/studio/catalog.json` | derived | `wm catalog:build` | app, `wm brief` |

## Shapes

```ts
// production/status.json
export interface Status {
  phase: 'development' | 'preproduction' | 'voice' | 'animation' | 'post' | 'delivery';
  step: { n: number; name: string };
  track: 'lean' | 'full' | 'notes round' | 'polish' | 're-voice' | 'export' | 'port';
  budget: { used: number; total: number; askAt: number };
  narratorRate: { value: number; source: 'catalog' | 'measured' | 'default' };
  lastGate?: { name: string; result: 'passed' | 'rejected'; note?: string; on: string };
  pendingQuestion?: { id: string; text: string; sentOn: string };
  nextAction: string;
  loops: Loop[];
  frozen?: { since: string; bible: string };
}
export interface Loop {
  role: string; group?: string; round: number; of: number;
  worktree?: string; branch?: string; evidence: string; lastReport: string; waitingOn: string;
}

// production/notes/<id>.json  — one note as said, pinned to a moment
export interface Note {
  id: string;                         // 'n-2026-10-03-07'
  at: number;                         // seconds from video start
  beat: string;
  by: 'human' | 'cold-viewer' | 'tool' | string;   // or a role name
  text: string;                       // verbatim
  frame?: string;                     // thumbnail path, written by the app
  made: string;
}

// production/ledger.json  — notes split into atoms and what each became
export interface Atom {
  id: string; note: string;           // note id
  text: string; beat: string; at: number;
  verified: string;                   // what the frame or clip showed (notes-to-checks step 1)
  class: 'precision' | 'consistency' | 'clarity' | 'framing' | 'rhythm' | 'taste';
  outcome: 'structural' | 'tool' | 'checklist' | 'document' | 'taste-fix' | 'human-decision' | 'settled' | 'no-action';
  produced?: string;                  // path of the check, test, or document entry
  owner?: string;                     // role
  status: 'open' | 'held' | 'fixed' | 'closed';
  pair?: { draft: string; fix: string };   // style learning, step 6
}
```

Markdown stays for prose a human writes and reads: the bible, the spine, the style guide, the checks. Each bible entry already has a stable id (`B<n>`); `wm brief` extracts entries by id. Checks stay a markdown checklist; `wm brief` pastes the file.

## Commands

- `wm status <slug>` prints the status in the skill's one-screen format. `wm status set <slug> --phase post --step 6 ...` writes one field. A new session reads it first, as the skill says, and it is never stale because nothing else edits it.
- `wm note add <slug> --at 48.2 --by cold-viewer --text "..."` from an agent; the app does the same for the human.
- `wm ledger split <slug> <noteId>` opens the atoms for a note; `wm ledger set <slug> <atomId> --status fixed --produced ...`.
- `wm brief <slug> <role> [--group physics,form] [--round 2]` writes `production/briefs/<role>-r<N>.md` from: the role's template in `studio/roles/<role>.md`, the environment block filled, the ownership table for the group, the bible entries the role must not reopen, the project checks file, the library block from the catalog ([catalog.md](catalog.md)), the open atoms assigned to the role, and the report block. The producer reads it once and spawns the agent with its path.
- `wm cut:status <slug>` writes `cut.json` (living-cut.md). Also prints one line per chapter: beats final / draft / placeholder, lines final / scratch / missing.

## How the producer skill uses it

The skill's "First moves" become: `wm status <slug>`; read the bible; size the job. The status file's "How it is checked" (compare open loops with `git worktree list`) becomes part of `wm status`: it prints a warning line for a loop with no worktree or a worktree with no loop.

The notes round (`loops/notes-to-checks.md`) keeps its seven steps. Step 1 (verify on the evidence) gets the frame thumbnail from the note for free. Step 5 (record and route) is `wm ledger set`. Step 7 (promote a generic check) gets the librarian's harvest rows as its list of candidates ([harvest.md](harvest.md)).

The sizing table gains one line under one-time costs: "Harvest, end of production: 4 runs".

## Agents and the data

An agent never edits these files directly. It reports; the producer writes. The one exception is `wm note add` for cold viewers and tools, because a note is evidence and the producer must not rephrase it. This keeps the skill's rule that the producer owns the ledger and the status.
