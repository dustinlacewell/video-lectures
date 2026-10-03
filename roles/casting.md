# Casting

Owns the list of speakers. Declares the speaker ids, finds a voice for
each with the human, and freezes it as one reference clip plus its exact
transcript. Every line is later cloned from that one clip.

- **Owns:** the `SpeakerId` union in `script/types.ts`; `script/cast.ts`
  (its `pad` fields pass to the [editor](editor.md) at cast lock);
  `voice/samples/`; `voice/refs/`.
- **Must not touch:** the rest of `script/types.ts` (the
  [engine owner](engine-owner.md)); `voice/clips/`, `voice/manifest.json`
  (the [sound engineer](sound-engineer.md)); `voice/*.py`, `voice/*.ts`;
  chapter script files; every document; a source production's folder.
- **Model:** Sonnet. The human makes every choice.
- **Critic:** full track: [qa](qa.md), casting set. The human is the
  second critic: only the human hears a voice.
- **Brief template:** [below](#brief-template). Modes: declare,
  auditions, freeze. Reuse needs no agent.

## Modes

- **Declare.** At the start of preproduction, before the writer: one
  speaker id per speaking character in the spine, in `SpeakerId`, and
  one stub entry per id in `script/cast.ts`. A stub's `ref` may point at
  a clip that does not exist yet. Later ids come from writers, through
  the producer.
- **Auditions.** Render candidate clips from the human's voice
  descriptions. Every candidate reads the same **reference passage**:
  8–15 s of natural speech, statements and one question. The picked
  sample becomes the ref with no re-take.
- **Freeze.** Turn the human's picks into `voice/refs/{speaker}.wav`
  and `.txt`, and point each cast entry at its ref.
- **Reuse (the producer, no agent).** The human asks for "same voices"
  as an earlier production. After declare, the producer:
  1. copies each source ref and its `.txt` byte for byte into
     `voice/refs/`, renamed to the new speaker id if it differs (e.g.
     `friend.wav` → `host.wav`);
  2. checks `Get-FileHash` of source and copy: equal;
  3. points each cast entry at its ref;
  4. records source path, length, and sha256 in the bible's cast lock.

  Reuse needs no voice stack. A reused ref that already rendered a
  production is grandfathered: the 8–15 s and Whisper checks do not
  apply (the reference `you.wav` is 7.0 s and works). The cast gate is
  one line for the human to confirm.

A shared voice is shared by reference in `cast.ts`
(`zombie: { ...you, name: 'Zombie' }`), never by a second file.

## Casting checklist

QA applies it to new refs (full track). On lean, casting runs its own
VERIFY and the human listens at the cast gate.

- [ ] **Transcript mismatch.** Whisper's transcript of the ref differs
  from its `.txt`. Evidence: both texts.
- [ ] **Ref out of shape** (new refs only). Shorter than 8 s, longer
  than 15 s, or a silence inside longer than 0.7 s. Evidence: the
  measurement.
- [ ] **Missing ref.** A speaker in `SpeakerId` has no cast entry, or,
  after freeze or reuse, an entry points at a missing file. Evidence:
  the speaker id.
- [ ] **Shared voice by copy.** Two speakers the bible says share a voice
  point at two files. Evidence: both entries.
- [ ] **Reuse not byte-exact.** A reused ref's sha256 differs from its
  source. Evidence: both hashes.
- [ ] **Design at render time.** A cast entry or render path uses a text
  voice description instead of a ref clip. Evidence: file and line.

## Brief template

```
ROLE: Casting — {declare speaker ids | auditions | freeze the human's picks}
{ENVIRONMENT — paste the standard block from C:\Users\dustin\.claude\skills\video-studio\loops\maker-critic.md, filled}
SCRATCH: {PROJECT_ROOT}\.scratch\casting-r{N}   (gitignored)

GOAL
{Declare: add one speaker id per speaking character below to SpeakerId, and one stub cast.ts entry per id.}
{Auditions: render {K} candidate clips per speaker from the descriptions below, for the human to pick.}
{Freeze: turn the human's picks into reference clips and cast entries.}

READ, IN THIS ORDER
1. {Auditions or freeze: C:\Users\dustin\.claude\skills\video-studio\engine\voice-pipeline.md (section 1, and "Install")}
2. {PROJECT_ROOT}\script\types.ts      (SpeakerId)
3. {PROJECT_ROOT}\script\cast.ts
4. {PROJECT_ROOT}\production\bible.md    (voice entries)

SPEAKERS
{Declare:   - {speaker id}: {character, from {PROJECT_ROOT}\production\spine.md}   {ref: voice\refs\{speaker id}.wav}}
{Auditions: - {speaker}: "{the human's description}"   {or: "same voice as {other speaker}"}}
{Auditions: REFERENCE PASSAGE (every candidate reads it): "{8–15 s of text: statements and one question}"}
{Freeze:    - {speaker}: {PROJECT_ROOT}\voice\samples\{file}.wav}

YOU OWN (may edit)
{PROJECT_ROOT}\script\cast.ts; the SpeakerId union in {PROJECT_ROOT}\script\types.ts (that one line only);
{auditions or freeze: {PROJECT_ROOT}\voice\samples\, {PROJECT_ROOT}\voice\refs\}

DO NOT TOUCH
voice\clips\, voice\manifest.json, voice\*.py, voice\*.ts, the rest of script\types.ts, chapter script files, all documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids, e.g. "you and zombie share one voice"; "the narrator never voices a character"}

RULES
- You never pick a voice. The human does.
- One id per speaking character. The narrator never voices a character.
- Auditions: every candidate reads the same reference passage.
- A ref transcript is exact, word for word, fillers included.
- A new ref is 8–15 s with no silence inside it longer than 0.7 s.
- A shared voice is one ref, referenced twice in cast.ts. Never two files.

VERIFY (PowerShell)
cd {PROJECT_ROOT}; wm build            # 0 type errors
{Freeze, per new ref:}
cd {PROJECT_ROOT}\voice; uv run transcribe.py refs/{speaker}.wav     # must equal refs\{speaker}.txt
ffprobe -v error -show_entries format=duration -of csv=p=0 {PROJECT_ROOT}\voice\refs\{speaker}.wav   # 8 to 15
ffmpeg -hide_banner -nostats -i {PROJECT_ROOT}\voice\refs\{speaker}.wav -af silencedetect=noise=-40dB:d=0.7 -f null - 2>&1 | Select-String silence_duration   # no output
cd {PROJECT_ROOT}; wm voice:manifest   # does not throw

{REPORT — paste the standard block, N = 150}
Also list: {Declare: each id and its character.} {Auditions: each sample path with its description, for the human.}
{Freeze: each ref path, length, and sha256, for the cast lock in the bible.}
```

## Escalation

Every voice choice is the human's. Casting also escalates:

- a speaker the script uses that the bible gives no voice for;
- a request that would make the narrator voice a character;
- any change to a frozen ref after clips were rendered (every clip of
  that speaker must be re-rendered);
- a new ref that fails a check: the human keeps it or re-casts.

## Known failure modes

- **Voice drift between lines.** Rendering from a text description
  re-rolls the voice. Prevention: one frozen ref per speaker.
- **Narrator voicing characters.** Prevention: one id per character;
  the script editor flags a character line given to the narrator.
- **A forced A/B or a stall on reused voices.** Prevention: reuse is a
  producer copy with a hash check; proven refs are grandfathered.
