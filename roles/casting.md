# Casting

Finds a voice for each speaker, gets the human's pick, and freezes it as
one reference clip plus its exact transcript. Every line is later cloned
from that one clip.

Real-studio counterpart: the casting director. Auditions, a shortlist,
the director picks, the contract is signed.

## Model tier

**Sonnet.** The work is mechanical: render candidate clips from voice
descriptions, transcribe them, write files. The human makes every choice.

## Inputs

- The speaker list from `{PROJECT_ROOT}/script/types.ts` (`SpeakerId`).
- [bible](../documents/bible.md) entries on voices (e.g. "you and your
  zombie twin share one voice").
- The human's description of each voice, in the human's words.
- [voice-pipeline](../engine/voice-pipeline.md) for commands and Windows
  setup.

## Outputs

- Candidate clips: `{PROJECT_ROOT}/voice/samples/{NN-short-name}.wav`, a
  few per speaker, each from a text voice description.
- After the human picks: `{PROJECT_ROOT}/voice/refs/{speaker}.wav` and
  `{PROJECT_ROOT}/voice/refs/{speaker}.txt` (the exact transcript).
- `{PROJECT_ROOT}/script/cast.ts`: one entry per speaker pointing at its
  ref. A shared voice is shared by reference (`zombie: { ...you, name: 'Zombie' }`).
- A bible entry proposal per voice (picked sample, description, reason).

## Owns / must not touch

Owns: `voice/samples/`, `voice/refs/`, `script/cast.ts`.

Must not touch: `voice/clips/`, `voice/manifest.json`, `voice/*.py`
(the [sound engineer](sound-engineer.md) owns rendering), `script/types.ts`,
chapter script files, every document.

## Critic partner

[qa](qa.md), audio mode, with speech-to-text. The human is the second
critic: only the human hears whether a voice is right.

Casting checklist (qa applies it):

- [ ] **Transcript mismatch.** Whisper's transcript of `refs/{speaker}.wav`
  differs from `refs/{speaker}.txt`. Evidence: both texts. (Cloning needs
  an exact ref transcript.)
- [ ] **Bad ref audio.** The ref ends mid-sound, clips, or has silence
  longer than the limit in the voice-pipeline doc. Evidence: the
  measurement.
- [ ] **Missing ref.** A speaker in `SpeakerId` has no cast entry, or a
  cast entry points at a missing file. Evidence: the speaker id.
- [ ] **Shared voice by copy.** Two speakers the bible says share a voice
  point at two different files. Evidence: both cast entries.
- [ ] **Design at render time.** Any cast entry or render path uses a
  text voice description instead of a ref clip. Evidence: the file and line.

## Brief template

```
ROLE: Casting — {auditions for: speakers | freeze the human's picks}
{ENVIRONMENT — paste the standard block from loops/maker-critic.md}

GOAL
{Auditions: render {K} candidate clips per speaker from the descriptions below, for the human to pick.}
{Freeze: turn the human's picks into reference clips and cast entries.}

READ, IN THIS ORDER
1. C:\Users\dustin\.claude\skills\video-studio\engine\voice-pipeline.md
2. {PROJECT_ROOT}\script\types.ts      (SpeakerId)
3. {PROJECT_ROOT}\script\cast.ts
4. {PROJECT_ROOT}\production\bible.md    (voice entries)

SPEAKERS AND DESCRIPTIONS (the human's words)
- {speaker}: "{description}"   {or: "same voice as {other speaker}"}
{Freeze only: PICKS — {speaker}: voice/samples/{file}.wav}

YOU OWN (may edit)
{PROJECT_ROOT}\voice\samples\, {PROJECT_ROOT}\voice\refs\, {PROJECT_ROOT}\script\cast.ts

DO NOT TOUCH
voice\clips\, voice\manifest.json, voice\*.py, all other script files, all documents.

DECISIONS ALREADY MADE (do not reopen)
{bible ids, e.g. "you and zombie share one voice; chorus lines are two clips staggered, not one clip"}

RULES
- Each sample line is the same test sentence for every candidate, so the human compares voices, not text.
- A ref transcript is exact, word for word. Check it with the Whisper script in voice/.
- A shared voice is one ref, referenced twice in cast.ts. Never two files.

VERIFY
- {Whisper transcribe command from voice-pipeline.md} on each ref; paste the transcript next to the .txt in your report.
- wm build   (0 type errors)

{REPORT — paste the standard block, N = 150}
Also list: each sample path with its description, so the producer can hand the list to the human.
```

## Escalation

Every voice choice is the human's. The agent never picks a winner. It
also escalates:

- a speaker the script uses that the bible gives no voice for;
- a request that would make the narrator voice a character (the human
  asked for character voices so the narrator does not);
- any change to a frozen ref after clips were rendered (every clip of
  that speaker must be re-rendered).

## Known failure modes

- **Voice drift between lines.** On the reference production, each line
  was rendered from a text voice description. The model re-rolls the
  voice on every call, so every line sounded slightly different. The
  human heard it; no agent could. Prevention (structural): one frozen
  reference clip per speaker; every line clones it. Descriptions are for
  auditions only.
- **Narrator voicing characters.** Prevention: one speaker per character
  in `SpeakerId`; the script-editor flags a character line given to the
  narrator.
- **A shared voice drifting apart.** The argument needs you and your
  zombie twin to sound identical. Prevention: share by reference in
  `cast.ts`, so they cannot differ.
