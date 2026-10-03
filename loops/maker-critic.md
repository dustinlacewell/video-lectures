# Maker–critic loop

Every job is done by a maker and checked by a critic. The critic is a
different agent with a different brief. The producer (the main session)
runs the loop and breaks ties. The human settles what the producer cannot.

## Why the critic must be a different agent

A maker that checks its own work checks its intent, not its output. On
the reference production, chapter agents invented local symbols and
judged them fine. Nobody with a whole-video view looked. A maker's
"done" is a claim. Only a clean critic round makes it a result.

## The different-senses rule

A critic is useful only if it perceives something the maker cannot.
Give each critic an instrument the maker did not use while making.

| Critic | Sense | Instrument | What it catches that the maker misses |
|---|---|---|---|
| [script-editor](../roles/script-editor.md) | Cold reading | Fresh context; reads the whole script plus the documents, not the maker's notes | Claims repeated across chapters, terms drifting, stipulations contradicted later |
| [animation-supervisor](../roles/animation-supervisor.md) | Vision | Headless frames at exact times, taken by `__seek(t)`; no scene code | Things off screen, wrong layer order, symbols with the wrong meaning |
| [qa](../roles/qa.md) | Measurement | Tools in `tools/`, unit tests, grep | Clipped text every 0.1 s, missing clips, clip-vs-beat drift, randomness at draw time |
| [qa](../roles/qa.md) (audio) | Speech-to-text and signal | Whisper transcript vs script; tail energy of each clip | Wrong words, lines that end mid-sound |
| [cold-viewer](../roles/cold-viewer.md) | Fresh whole-video context | Contact sheet plus timestamped transcript | What the video actually argues, where it drags, what repeats |
| The human | Hearing and taste | Watches the build | Voice drift, cut-off lines, taste |

Agents cannot hear. Two audio defects reached the human on the reference
production (voice drift between lines, lines cut 20–80 ms early). Treat
the human as the only true ear. Prefer structural fixes for audio over
checks (see [notes-to-checks](notes-to-checks.md)).

## The protocol

1. **Maker round.** The producer spawns the maker with the brief from its
   role file. The maker does the work, runs its own verify commands, and
   reports. The report is a claim.
2. **Critic round.** The producer spawns the critic as a new Agent call.
   Never ask the maker to review itself. Never pass the maker's reasoning
   to the critic. Pass only: the files changed, the documents, the
   checklist, and where to put evidence.
3. **Findings.** The critic reports findings. Each finding is either
   *blocking* (it breaks a checklist item) or a *note* (taste or
   suggestion; at most three per round; the maker may ignore them).
4. **Fix round.** The producer sends the blocking findings to the maker
   (SendMessage to the same maker keeps its context).
5. **Re-check.** The producer sends the fix report to the same critic
   (SendMessage). The critic re-checks its open findings and re-runs its
   full checklist on the changed files only.
6. **Stop.** Stop when a critic round has zero blocking findings. Stop
   after round 3 at most. Open findings after round 3 go to escalation.

On the lean track, stop after round 2. Animation on lean gets one
supervisor pass and at most one fix round. The fix round's own verify
commands close it; findings still open go to the notes round.

A cold viewer is the exception: never reuse one. Each review needs fresh
agents (see [cold-viewer-review](cold-viewer-review.md)).

## Scratch and resume

`{SCRATCH}` is `{PROJECT_ROOT}\.scratch\<brief-id>-r<N>`. The brief id
is the role, plus the chapter when several run at once
(`animator-zombie`, `supervisor-zombie`). `N` is the loop round. The
folder is in the main checkout, even when the agent works in a worktree,
so the evidence outlives the worktree. `.scratch/` is gitignored
([new project](../engine/new-project.md) section 4).

Every agent writes its probes, screenshots, tool outputs and its report
there. The report also goes to `{SCRATCH}\report.md`. The
[status](../documents/status.md) file points at the last report of each
open loop.

**Resume in a new session.** The old agents are gone; SendMessage cannot
reach them. Re-brief the maker as a fresh spawn: its brief, plus the
critic's last report (`report.md` path from the status file) as the
blocking findings. The re-check is a fresh critic with the same
checklist and that report. The round number goes on.

## The evidence rule

A finding without evidence is dropped. No exceptions. Valid evidence:

- **Text:** the quoted line, its beat id, and its file and line number.
- **Picture:** the screenshot path and the time `t` it was taken at.
- **Audio:** the clip id, the Whisper transcript, and the script line.
- **Measurement:** the tool command, the number, and the threshold it breaks.
- **Rule:** the document and the entry that the work breaks
  (bible entry, terminology row, visual-vocabulary row, spine chapter job).

"The visuals are unclear" is not a finding. This one, checked on the
reference video's frames, is: "At 2:27.2 (`body.name`, the card) the
words 'This' and 'machinery' overlap while the words pop in. The settled
card at 2:29.4 is spaced right (sheet `04-body-3.png`)."

## What a critic may and may not do

- It may take throwaway probes: extra screenshots, a temporary edit to
  prove a bug, a scratch script. All probe output goes under `{SCRATCH}`.
- It must leave a clean tree. `git status` at the end shows no changes
  it made. It says so in its report.
- It does not fix. It reports. A critic that fixes becomes a second maker
  with nobody checking it.

## Escalation

The producer decides a dispute when a document settles it. Cite the entry.

The producer sends it to the human when:

- maker and critic still disagree after round 3;
- the fix needs a new symbol, a new term, a new motif, or a change to a
  chapter's job (these are director decisions; see
  [director](../roles/director.md));
- the fix changes shared kit, the engine, or a document owned by another role;
- the dispute is taste.

Give the human one question, two choices, and a recommendation.

## Scale the loop to the stakes

- One-word text fixes from a notes round: batch them into one job. One
  script-editor pass covers the batch.
- A chapter's animation, a chapter's script, a kit change: full loop.
- Anything that changes a shared document or the engine contract: full
  loop, then the human signs.

## Parallel loops

Run chapter loops in parallel only when file ownership is disjoint. Each
role file lists what it owns. One agent owns the shared kit per round. On
the reference production, four chapter agents ran in parallel worktrees
and merged cleanly because no two touched the same file.

On Windows, a worktree stays locked while an agent process or a preview
server in it lives. Each brief tells the agent to stop any server it
started before it reports.

## Standard brief blocks

Every brief template in `roles/` starts with the environment block and ends
with the report block. Paste both, filled in.

### Environment block

```
ENVIRONMENT
- Windows 11. Shells: Git Bash and PowerShell. Use absolute paths. The working directory resets between calls.
- Project root: {PROJECT_ROOT}. Production documents: {PROJECT_ROOT}\production. Scratch for your probes, screenshots and report: {SCRATCH} ({PROJECT_ROOT}\.scratch\<brief-id>-r<N>, gitignored).
- The project honors the engine contract: C:\Users\dustin\.claude\skills\video-studio\engine\contract.md
  (script is pure data with stable beat ids; every frame is a pure function of time; page globals __seek(t), __info(), __cam(), __voice()).
- Workspace commands: `wm build` (type-check and build), `wm test` (unit tests), `wm voice:manifest`, `wm voice:render`.
- Python only through the uv venv in {PROJECT_ROOT}/voice (Python 3.12). Never system Python.
- Edit files with the Edit and Write tools. Do not rewrite files with sed, Python, or heredocs: that changes line endings. The one exception: a command this brief gives verbatim.
- Do not open or drive GUI windows. Headless Playwright at exact times via __seek(t) is allowed and expected.
- Edit only the files you own (listed below). If you need another file changed, stop and report it.
- Work in {WORKTREE} if given (a worktree under {PROJECT_ROOT}\.claude\worktrees\). Stop any server you started before you report.
- Do not commit unless this brief says so. Check free disk space before any render.
```

### Report block

```
REPORT (at most {N} words; facts only; no pasted files or logs)
Write it to {SCRATCH}\report.md too.
- Files changed: path, one line each.
- Verify: each command run and its result line (pass counts, error count).
- Evidence: paths of screenshots or outputs you made.
- Escalations: anything you needed but did not own or decide.
- Open questions: one line each.
```
