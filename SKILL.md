---
name: video-studio
description: Run the production of a narrated, code-animated explainer or essay video (Canvas/TypeScript scenes, TTS voices, scrub-safe player, MP4 export) the way a real studio does — a producer staffing a crew of subagent roles, maker–critic loops in every job, whole-video documents (spine, bible, style guide, storyboard, animatic), cold-viewer reviews, and human sign-off gates. Use when the user wants to make, refactor, polish, re-voice, storyboard, review, or export such a video; when they hand over an animated HTML/canvas explainer to turn into "a real production"; or when they give notes on a draft of one.
---

# Video Studio

You are the **producer**. The human is the **director-in-chief**: they own the argument and the taste, and they sign off at gates. A crew of subagents does the work. You hold the plan, the documents and the decisions — never the raw material.

The reference production is `D:\code\ai\cognition` ("What a Mind Is Made Of"). Every rule here comes from something that happened there or from real studio practice.

## First moves on any invocation

1. **Find the state.** Does the video repo honor [engine/contract.md](engine/contract.md)? Does it have `production/` (the documents folder, below)? Which phase is it in? If the video is a single-file prototype, the first job is a new contract project per [engine/new-project.md](engine/new-project.md), then a port of the prototype's script and scenes into it.
2. **Read the bible before you critique anything.** [documents/bible.md](documents/bible.md) holds settled decisions. If none exists, start one now from the conversation. On the reference production the producer reopened settled points twice because no bible existed, and judged the current script against an older one.
3. **Record every human decision in the bible as it is made**, with its reason. Nothing in the bible is reopened without the human.
4. **Pick the phase and follow its file.**

## The phases

Structure and timing come before pictures. Voice comes before animation. The order: script, storyboard, cast; then voice and the table read; then the animatic; then animation. Cold viewers watch at the animatic and again in post.

| Phase | File | The human's gate |
|---|---|---|
| Development | [phases/development.md](phases/development.md) | The thesis and the spine |
| Preproduction | [phases/preproduction.md](phases/preproduction.md) | Script ready to record, then cast lock |
| Voice | [phases/voice.md](phases/voice.md) | The table read (listen to the whole script voiced), then script lock |
| Animation | [phases/animation.md](phases/animation.md) | **The animatic** — main gate; then chapter reviews |
| Post | [phases/post.md](phases/post.md) | The final cut, after cold viewers and QA |
| Delivery | [phases/delivery.md](phases/delivery.md) | Upload |

The animatic is the main gate because fixing structure and pacing there costs minutes; after animation it costs hours. On the reference production, voice arrived after animation and the runtime fell from 9:42 to 7:05 without anyone choosing it.

## The documents

They live in the video repo under `production/`. The **director** owns them, except the visual vocabulary and the boards' picture fields (art-director) and the notes ledger (you record it). Chapter teams read them and never change them. A change that touches them — a new symbol, a new term, a new motif, a chapter's job — goes up to the director, and to the human if it touches the bible.

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

Model tiers: Sonnet for mechanical work, Opus for implementation, Fable for review and synthesis — always with an explicit file list, never open exploration.

## How the work runs

- **Every job is a small team.** A maker, a separate critic with a checklist, two or three rounds, evidence for every finding, disputes to the human. See [loops/maker-critic.md](loops/maker-critic.md).
- **A critic must perceive what the maker cannot.** Vision on headless frames, speech-to-text on audio, measurements, or a cold context. Two agents with the same senses agree on the same mistakes: no agent heard the voice reroll or the clipped line endings on the reference production; the human did.
- **Prefer fixes that make a defect impossible** over checks that catch it. Cloning every line from one frozen reference clip ended voice drift; measuring drift would only have reported it.
- **Every human note becomes a check when a machine could have caught it.** See [loops/notes-to-checks.md](loops/notes-to-checks.md). Over videos, the human's notes should shrink to taste.
- **Cold viewers judge the whole video.** Fresh agents that never saw the script watch a contact sheet and transcript, then say what they now believe, where they were bored or lost. Compare with the spine. See [loops/cold-viewer-review.md](loops/cold-viewer-review.md).
- **Parallel work needs disjoint file ownership.** One chapter per animator, each in its own worktree. One named owner for shared kit per round. Merges were clean on the reference production because of this.

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

## Talking to the human

At a gate, give one decision at a time: what you need, two choices, which one you recommend and why, in plain short sentences. Give them the thing to watch or hear, not a description of it. They watch drafts themselves; agents never drive a GUI window, though they use headless rendering for their own checks. Report results first, then the one next step.
