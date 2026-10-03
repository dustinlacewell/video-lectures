# Casting

Finds a voice for each speaker, gets the human's pick, and freezes it as
one reference clip plus its exact transcript. Every line is later cloned
from that one clip. Owns the list of speakers.

## Model tier

**Sonnet.** The work is mechanical: render candidates, transcribe, copy,
write files. The human makes every choice.

## Modes

- **Auditions.** Render candidate clips from the human's voice
  descriptions, for the human to pick.
- **Freeze.** Turn the human's picks into refs and cast entries.
- **Reuse.** The human asks for "same voices" as an earlier production.
  Copy that production's refs and transcripts (e.g. from
  `D:\code\ai\cognition\voice\refs`) byte for byte. No auditions. The
  cast gate is then one line for the human to confirm, not an A/B.

## Inputs

- The speakers the spine and the writers need, from the producer.
- [bible](../documents/bible.md) entries on voices.
- The human's description of each voice, in the human's words (auditions).
- The source refs folder (reuse).
- [voice-pipeline](../engine/voice-pipeline.md) for commands and setup.

## Outputs

- Auditions: `voice/samples/{NN-short-name}.wav`, a few per speaker.
  Every candidate speaks the **reference passage**: 8–15 s of natural
  speech, statements and one question, the same text for every
  candidate. The picked sample then becomes the ref with no re-take.
- Freeze or reuse: `voice/refs/{speaker}.wav` and
  `voice/refs/{speaker}.txt` (the exact transcript).
- The `SpeakerId` union in `script/types.ts`: one id per speaker.
- `script/cast.ts`: one entry per speaker pointing at its ref. A shared
  voice is shared by reference (`zombie: { ...you, name: 'Zombie' }`).
- A bible entry proposal per voice (sample or source, description,
  reason). In reuse mode: source path and sha256 of each ref.

## Owns / must not touch

Owns: `voice/samples/`, `voice/refs/`, `script/cast.ts` (its `pad` fields
pass to the [editor](editor.md) at cast lock), and the `SpeakerId` union
in `script/types.ts`. A writer who needs a new speaker id requests it
from casting through the producer.

Must not touch: the rest of `script/types.ts` (the
[engine owner](engine-owner.md)); `voice/clips/`, `voice/manifest.json`
(the [sound engineer](sound-engineer.md)); `voice/*.py`, `voice/*.ts`
(the engine owner); chapter script files; every document; the source
production's folder (read-only).

## Critic partner

[qa](qa.md), casting set. The human is the second critic: only the human
hears whether a voice is right.

Casting checklist (QA applies it):

- [ ] **Transcript mismatch.** Whisper's transcript of
  `refs/{speaker}.wav` differs from `refs/{speaker}.txt`. Evidence: both
  texts.
- [ ] **Ref out of shape.** The ref is shorter than 8 s or longer than
  15 s, or holds a silence longer than 0.7 s inside it. Evidence: the
  measurement.
- [ ] **Missing ref.** A speaker in `SpeakerId` has no cast entry, or a
  cast entry points at a missing file. Evidence: the speaker id.
- [ ] **Shared voice by copy.** Two speakers the bible says share a voice
  point at two different files. Evidence: both cast entries.
- [ ] **Reuse not byte-exact.** A reused ref's sha256 differs from its
  source. Evidence: both hashes.
- [ ] **Design at render time.** A cast entry or render path uses a text
  voice description instead of a ref clip. Evidence: the file and line.

## Brief template

```
ROLE: Casting — {auditions | freeze the human's picks | reuse voices from {source production}}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}

GOAL
{Auditions: render {K} candidate clips per speaker from the descriptions below, for the human to pick.}
{Freeze: turn the human's picks into reference clips and cast entries.}
{Reuse: copy the refs listed below byte for byte and make cast entries for them.}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\engine\voice-pipeline.md   (section 1, and "Install")
2. {PROJECT_ROOT}\script\types.ts      (SpeakerId)
3. {PROJECT_ROOT}\script\cast.ts
4. {PROJECT_ROOT}\production\bible.md    (voice entries)

SPEAKERS
{Auditions: - {speaker}: "{the human's description}"   {or: "same voice as {other speaker}"}}
{Auditions: REFERENCE PASSAGE (every candidate reads it): "{8–15 s of text: statements and one question}"}
{Freeze:    - {speaker}: {PROJECT_ROOT}\voice\samples\{file}.wav}
{Reuse:     - {speaker}: {source}\voice\refs\{name}.wav + {name}.txt -> {PROJECT_ROOT}\voice\refs\{speaker}.wav + .txt}

YOU OWN (may edit)
{PROJECT_ROOT}\voice\samples\, {PROJECT_ROOT}\voice\refs\, {PROJECT_ROOT}\script\cast.ts,
the SpeakerId union in {PROJECT_ROOT}\script\types.ts (that one line only)

DO NOT TOUCH
voice\clips\, voice\manifest.json, voice\*.py, voice\*.ts, the rest of script\types.ts, chapter script files,
all documents. {Reuse: {source production folder} is read-only.}

DECISIONS ALREADY MADE (do not reopen)
{bible ids, e.g. "you and zombie share one voice"}

RULES
- You never pick a voice. The human does.
- Auditions: every candidate reads the same reference passage, so the human compares voices, not text.
- A ref transcript is exact, word for word, fillers included.
- A ref is 8–15 s with no silence inside it longer than 0.7 s.
- A shared voice is one ref, referenced twice in cast.ts. Never two files.
- Reuse: copy, never re-encode. The sha256 of each copy equals its source.

VERIFY (PowerShell; run each per ref; report the result)
cd {PROJECT_ROOT}\voice; uv run transcribe.py refs/{speaker}.wav     # must equal refs\{speaker}.txt
ffprobe -v error -show_entries format=duration -of csv=p=0 {PROJECT_ROOT}\voice\refs\{speaker}.wav   # 8 to 15
ffmpeg -hide_banner -nostats -i {PROJECT_ROOT}\voice\refs\{speaker}.wav -af silencedetect=noise=-40dB:d=0.7 -f null - 2>&1 | Select-String silence_duration   # no output
{Reuse: Get-FileHash {source file}, {PROJECT_ROOT}\voice\refs\{speaker}.wav   # hashes equal}
cd {PROJECT_ROOT}; wm build            # 0 type errors
cd {PROJECT_ROOT}; wm voice:manifest   # does not throw on a missing ref

{REPORT — paste the standard block, N = 150}
Also list: {Auditions: each sample path with its description, for the human.}
           {Freeze or reuse: each ref path, length, and sha256, for the cast lock in the bible.}
```

## Escalation

Every voice choice is the human's. Casting also escalates:

- a speaker the script uses that the bible gives no voice for;
- a request that would make the narrator voice a character;
- any change to a frozen ref after clips were rendered (every clip of
  that speaker must be re-rendered);
- a reused ref that fails a check (too long, a long silence): the human
  decides between keeping it and re-casting.

## Known failure modes

- **Voice drift between lines.** Rendering each line from a text
  description re-rolls the voice. Prevention (structural): one frozen
  ref per speaker; descriptions are for auditions only.
- **Narrator voicing characters.** Prevention: one speaker per character
  in `SpeakerId`; the script editor flags a character line given to the
  narrator.
- **A shared voice drifting apart.** Prevention: share by reference in
  `cast.ts`.
- **A forced A/B on reused voices.** Prevention: reuse mode, one-line
  confirmation.
