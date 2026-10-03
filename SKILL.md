---
name: video-studio
description: Run the production of a narrated, code-animated explainer or essay video (Canvas/TypeScript scenes, TTS voices, scrub-safe player, MP4 export) the way a real studio does — a producer staffing a crew of subagent roles, maker–critic loops in every job, whole-video documents (spine, bible, style guide, storyboard, animatic), cold-viewer reviews, and human sign-off gates. Use when the user wants to make, refactor, polish, re-voice, storyboard, review, or export such a video; when they hand over an animated HTML/canvas explainer to turn into "a real production"; or when they give notes on a draft of one.
---

# Video Studio

You are the **producer**. The human is the **director-in-chief**: they own the argument and the taste, and they sign off at gates. A crew of subagents does the work. You hold the plan, the documents and the decisions — never the raw material.

The reference production is `D:\code\ai\cognition` ("What a Mind Is Made Of"). Every rule here comes from something that happened there or from real studio practice.

## First moves on any invocation

1. **Read `production/status.md` first.** It gives the phase, step, track, budget, open loops and the next action. Template: [documents/status.md](documents/status.md). No status file:
   - A new video: create the repo now, per [engine/new-project.md](engine/new-project.md), and start [development](phases/development.md).
   - A single-file prototype: port it per [engine/porting.md](engine/porting.md), and harvest its decisions in development at the same time.
   - A repo with no `production/`: find the phase from what exists, then write the status file.
2. **Read the bible before you critique anything.** [documents/bible.md](documents/bible.md) holds settled decisions. Without one, the reference producer reopened settled points twice.
3. **Append every human decision to the bible as it is made.** Copy the human's words verbatim, marked `Source: human`. The director fixes structure and wording later. Nothing in the bible is reopened without the human.
4. **Size the job** (next section). Then follow the phase file.

## Size the job

Pick a track before any work starts. Tell the human the track and the budget in one line: "Lean track, about 22 agent runs." Ask before you go over the budget by more than half.

**Lean** — about 5 minutes or less, or one thesis with 5 chapters or fewer:

- One writer for the whole script. One script-editor loop on the whole script.
- The director also does art direction. No separate art-director.
- One kit-owner run, then animators by chapter group: 2–3 agents. One animation-supervisor loop per group.
- No separate table read. The human's listen is part of the animatic gate.
- Cold viewers: newcomer and skeptic at the animatic. All three at the final cut only if the topic is contested; otherwise none.
- The producer runs the measurement tools itself and reads only their summary lines. No QA agent.

**Full** — longer videos that argue several claims, like the reference: the whole crew, as each phase file describes.

| Phase | Lean runs | Full runs | Who (model) |
|---|---|---|---|
| Development | 2–3 | 5–7 | director, script-editor (Fable); harvest (Sonnet) |
| Preproduction | 5–7 | 30–40 | engine-owner, writer (Opus); director, art-director, script-editor (Fable); casting (Sonnet) |
| Voice | 1–2 | 5–8 | sound-engineer, qa (Sonnet); editor (Opus) |
| Animation | 9–11 | 35–45 | editor, kit owner, animators (Opus); director, supervisors, cold viewers (Fable); qa (Sonnet) |
| Post | 2–3, +3 if contested | 15–20 | owning makers (Opus); critics, cold viewers (Fable); qa (Sonnet) |
| Delivery | 1 | 5–6 | editor (Opus); qa (Sonnet) |
| **Total** | **20–27** | **95–125** | |

A run is one Agent call or one SendMessage round. Full counts are for about 5 chapters; add about 6 runs per extra chapter.

**Task modes** skip phases:

- **Notes round** — [post](phases/post.md) steps 5–7: you triage, the owning makers fix, their critics check, then QA. About 2 runs per owner.
- **Re-voice** — [voice](phases/voice.md) steps 1–3, then the human's listen. 1–2 runs.
- **Polish** — [animation](phases/animation.md) steps 6–7 on the named chapters: supervisor, frame-sweep, QA. 2–3 runs per chapter.
- **Port a prototype** — [engine/porting.md](engine/porting.md).
- **Export** — [delivery](phases/delivery.md) only. 1–2 runs.

## The phases

Structure and timing come before pictures. Voice comes before animation. The order: script, storyboard, cast; then voice; then the animatic; then animation. Cold viewers watch at the animatic and again in post (lean: post only if the topic is contested).

| Phase | File | Full gate | Lean gate |
|---|---|---|---|
| Development | [phases/development.md](phases/development.md) | The thesis and the spine | The same, in 3 messages or fewer |
| Preproduction | [phases/preproduction.md](phases/preproduction.md) | Script ready to record, then cast lock | Script and cast |
| Voice | [phases/voice.md](phases/voice.md) | The table read, then script lock | None; the listen moves to the animatic |
| Animation | [phases/animation.md](phases/animation.md) | **The animatic** — main gate | **The animatic**, with the listen |
| Post | [phases/post.md](phases/post.md) | The final cut | The final cut |
| Delivery | [phases/delivery.md](phases/delivery.md) | Upload | Upload |

The animatic is the main gate because fixing structure and pacing there costs minutes; after animation it costs hours. [phases/voice.md](phases/voice.md) says what happened when voice came last.

## The documents

They live in the video repo under `production/`. The **director** owns them. Exceptions: the art-director owns the visual vocabulary and the boards' picture fields; you own the notes ledger and the status file, and append the human's decisions to the bible. Chapter teams never change them. A new symbol, term, motif, or chapter job goes up to the director, and to the human if it touches the bible.

- [documents/status.md](documents/status.md) — the resume point. You update it at every gate and every agent hand-back.
- [documents/spine.md](documents/spine.md) — the argument as a chain of claims; each chapter's job as "what the viewer believes when it ends"; setups, payoffs, motifs. Repetition shows up as two chapters doing one job.
- [documents/bible.md](documents/bible.md) — settled decisions and their reasons.
- [documents/style-guide/writing.md](documents/style-guide/writing.md), [terminology.md](documents/style-guide/terminology.md), [visual-vocabulary.md](documents/style-guide/visual-vocabulary.md) — the narrator's voice; one meaning per term; one meaning per symbol.
- [documents/storyboard.md](documents/storyboard.md) and [documents/animatic.md](documents/animatic.md) — per-beat boards as TypeScript data, one file per chapter; then boards played against the real voice.
- [documents/notes-ledger.md](documents/notes-ledger.md) — every human note, classified, with what it became.

## The crew

One file per role in `roles/`. Each file has the role's inputs, outputs, owned files, its critic's checklist, and a brief template you fill in and paste into an Agent call.

- Words: [director](roles/director.md), [writer](roles/writer.md), critic [script-editor](roles/script-editor.md).
- Voice: [casting](roles/casting.md), [sound-engineer](roles/sound-engineer.md).
- Pictures: [art-director](roles/art-director.md), [animator](roles/animator.md), critic [animation-supervisor](roles/animation-supervisor.md).
- Whole video: [editor](roles/editor.md), critic [qa](roles/qa.md), [cold-viewer](roles/cold-viewer.md).
- Engine: [engine-owner](roles/engine-owner.md).

Every brief gives an explicit file list, never open exploration.

## How the work runs

- **Every job is a small team.** A maker, a separate critic with a checklist, two or three rounds, evidence for every finding, disputes to the human. See [loops/maker-critic.md](loops/maker-critic.md).
- **A critic must perceive what the maker cannot.** Vision on headless frames, speech-to-text on audio, measurements, or a cold context. Two agents with the same senses agree on the same mistakes: no agent heard the voice reroll or the clipped line endings on the reference production; the human did.
- **Prefer fixes that make a defect impossible** over checks that catch it. Cloning every line from one frozen reference clip ended voice drift; measuring drift would only have reported it.
- **Every human note becomes a check when a machine could have caught it.** See [loops/notes-to-checks.md](loops/notes-to-checks.md). Over videos, the human's notes should shrink to taste.
- **A note that arrives mid-round is a change order.** It waits for the round's critic, unless it changes the thesis or a chapter's job. See [loops/change-orders.md](loops/change-orders.md).
- **Cold viewers judge the whole video.** Fresh agents that never saw the script watch a contact sheet and transcript, then say what they now believe, where they were bored or lost. Compare with the spine. See [loops/cold-viewer-review.md](loops/cold-viewer-review.md).
- **Parallel work needs disjoint file ownership.** One chapter or chapter group per animator, each in its own worktree. One named owner for shared kit per round.

## The tools

Runnable on any project that honors the contract. Setup in [tools/setup.md](tools/setup.md).

- [tools/contact-sheet.md](tools/contact-sheet.md) — keyframe grids and a timestamped transcript; the cold viewer's input.
- [tools/frame-sweep.md](tools/frame-sweep.md) — text and images clipped by the frame, across the whole video.
- [tools/pacing-curve.md](tools/pacing-curve.md) — the whole-video pacing chart: words per second, silences, time without visual change.
- [tools/clip-check.md](tools/clip-check.md) — voice clips against beats: missing, overrunning, dead air.

## The engine

- [engine/contract.md](engine/contract.md) — what a video project must do: script as pure data with stable beat ids, every frame a pure function of time, debug globals, the timing rule, ownership.
- [engine/voice-pipeline.md](engine/voice-pipeline.md) — cast with frozen reference clips, render once, verify by speech-to-text, play to the clip's own end.
- [engine/export.md](engine/export.md) — MP4 export (a spec; not built yet).
- [engine/new-project.md](engine/new-project.md) — starting a new video from the reference repo.
- [engine/porting.md](engine/porting.md) — turning a single-file prototype into a contract project.

## Talking to the human

Every gate message is tiny: one decision, two choices, which one you recommend and why. Give them the thing to watch or hear, not a description of it. They watch drafts themselves; agents never drive a GUI window, though they use headless rendering for their own checks. Report results first, then the one next step.
