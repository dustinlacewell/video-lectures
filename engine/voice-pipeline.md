# The voice pipeline

How lines in the script become WAV clips that set the video's timing. Built and used in `D:\code\ai\cognition`. File shapes are in `engine/contract.md` sections 3, 4 and 9.

## The flow

1. **Cast.** Each speaker has one frozen reference clip and its exact transcript.
2. **Manifest.** `wm voice:manifest` turns script + cast into one job per clip, each with a content hash.
3. **Render.** `wm voice:render` synthesizes every missing or stale clip. The model loads once.
4. **Verify.** Each new take is checked by speech-to-text and by its ending. A bad take is re-rolled.
5. **Trim.** Silence is cut with a margin, and both ends fade.
6. **Measure.** `durations.json` records each clip's length. The timeline reads it.
7. **Play.** The player plays each clip at its offset and lets it finish.

## Why it is shaped this way

Each structure fixes a defect that reached the human.

| Structure | Defect it removes |
|---|---|
| Clone every line from one frozen reference clip | Voice design from a text description rerolls the voice on every call. Each line sounded like a slightly different person. |
| Verified reference transcript | A wrong transcript makes the clone drift and mangle words. |
| Whisper check on every take | Agents cannot hear. Dropped and wrong words reached the human. |
| Mid-sound ending check | Some takes stopped mid-syllable. |
| Tail margin + fade on trim | A tight trim cut soft final consonants and breaths. |
| Clip plays to its own end | The player stopped clips on its own clock, 20–80 ms early. The human heard lines cut off. |
| Voice rendered before animation | Animation timed to a word-count guess, and real narration changed the pacing with no one choosing it ([voice phase](../phases/voice.md)). |

## 1. Cast and reference clips

Files: `script/cast.ts`, `voice/refs/<speaker>.wav`, `voice/refs/<speaker>.txt`. [Casting](../roles/casting.md) owns them and the `SpeakerId` type.

A speaker the human wants to keep from an earlier production is copied, not cast again ([new project](new-project.md) section 5). The steps below are for a new voice.

How to pick a voice:

1. Write two to four short text descriptions per speaker. Example: "posh British woman, mid-30s, dry and wry".
2. Render samples of one test passage per description:
   `uv run speak.py --text "<passage>" --voice "<description>" --out samples/NN-name.wav --seed <n>`
   Try two or three seeds for the favourite description; each seed is a different person.
3. The human listens and picks one file. Agents MUST NOT pick a voice.
4. Freeze it: copy the picked sample to `voice/refs/<speaker>.wav`. Aim for 8–15 s of natural speech with a mix of statements and a question. The reference narrator clip is 9.4 s.
5. Transcribe it: `uv run transcribe.py refs/<speaker>.wav`. Correct the text against what is actually said, word for word, fillers included. Save it as `voice/refs/<speaker>.txt`.
6. Casting adds the speaker to `SpeakerId` in `script/types.ts` and to `CAST`.

Rules:

- A reference clip MUST NOT change after sign-off. Changing it changes every hash, so every clip of that speaker re-renders.
- Speakers that must sound identical share one cast entry by spread. The manifest gives them one `voiceKey`.
- `style` steers delivery (tone, pace, emotion) on top of the clone. It does not change who speaks. A style line renders with guidance 4.0; a plain clone renders with 1.0.

## 2. Manifest

`voice/manifest.ts` (pure) and `voice/refs.ts` (reads the ref files) build `voice/manifest.json`.

- One entry per voice line: `voiceLines(beat)` gives one clip per speaker.
- Spoken text is `spokenText(say ?? card)`: `*` removed, quotes around the whole line removed.
- `hash = sha256(text + ref audio hash + refText + style)`, first 16 hex chars.
- A missing reference clip or transcript throws, naming the speaker.

## 3. Render

`voice/render.py`. Run through `wm voice:render`, which writes the manifest first.

- A clip is stale when its WAV is missing, or `index.json[id] != "<hash>.r<RENDER_VERSION>"`.
- Bump `RENDER_VERSION` when rendering or trimming changes. Every clip then re-renders.
- The model loads once per run (about 50 s with warm-up). Then every stale clip renders in one loop.
- `PromptCodec` encodes each distinct reference clip once and reuses the codes. Every line of a speaker uses identical reference codes.
- Seed per take: `(crc32(clipId) + attempt * 1_000_003) & 0x7FFFFFFF`. Takes are repeatable. Two speakers saying the same line still differ.
- Progress and flaws print per clip. `index.json` and `failures.json` are written after each clip, so a crash loses nothing.

## 4. Verify loop

For each take, `flaws_of` collects:

- **Output cap.** Raw audio at or near 120 s is a runaway take.
- **Mid-sound end.** The raw take's last 20 ms is louder than −35 dB relative to its peak.
- **Wrong words.** Whisper (`openai/whisper-large-v3-turbo`, on the GPU) transcribes the trimmed clip. A word-level diff against the text lists misses as start, middle, end or extra. The compare lower-cases, drops punctuation, expands contractions, joins dotted letters (A.I. → ai) and maps British spellings.

A take with no flaws is kept. Else the loop re-rolls, up to 4 takes, and keeps the take with the fewest flaws. A clip still flawed goes to `failures.json`. The sound engineer reports every entry there to the producer. The usual fix is a script change (rewording) or a human listen.

`uv run verify.py [clipId ...]` re-checks existing clips without rendering.

## 5. Trim

On each take:

- Silence threshold: −40 dB relative to the peak.
- Keep 50 ms before the first loud sample and 120 ms after the last.
- Raised-cosine fade in over 5 ms and out over 30 ms, so no cut clicks.
- Write 16-bit PCM WAV at the model's sample rate.

## 6. Durations

After rendering, `measure` reads every clip's length into `voice/clips/durations.json` (`{ clipId: seconds }`, 3 decimals). It is tracked in git. The timing rule that consumes it is in `engine/contract.md` section 4.

After any re-render:

- Run `wm test`. `test/voiceCoverage.test.ts` fails on a missing clip or a beat shorter than its clips.
- Run the clip check (`tools/clip-check`). Report runtime change per chapter to the director. A changed runtime is a pacing change; the director decides, not the render.

## 7. Playback

`engine/audio/voice.ts` (shell) and `engine/audio/voiceTrack.ts` (pure).

- `activeClips(tl, T, clips)` lists clips that should sound at `T` and the offset into each.
- One `HTMLAudioElement` per clip. On start or jump, it seeks to the exact offset.
- Drift: re-seek when the clip drifts more than `0.25 x rate` s from the clock. Right after a clip starts sounding, snap once if it lags more than 40 ms.
- Clips of the next beat preload.

**The stop rule.** A sounding clip stops only when the viewer pauses, the viewer seeks, or the clip reaches its own end. It MUST NOT stop because the timeline's clock says the clip is over. Audio runs a little behind the clock; stopping on the clock cut the last 20–80 ms of lines. In code:

```ts
stopsNow(wanted, finished, move) = !wanted && (finished || !move.playing || move.jumped)
```

**Ducking.** While any clip sounds, the music bus drops 8 dB (gain `10^(-8/20)`) with a 0.08 s time constant, and comes back after. Sound effects are not ducked.

## Breeze TTS 2 specifics

The model in use. Chosen as the top open-weights model on the Artificial Analysis TTS arena at the time.

- **Code:** `https://github.com/breezeblue-ai/breeze-tts`, cloned to `voice/vendor/breeze-tts` at commit `58ec70c`. `breeze.py` puts it on `sys.path`.
- **Weights:** Hugging Face `BreezeBlue/Breeze-TTS-2`, revision `3e28c5151381a722f1d8661b4118c298caa77aa4`. Downloaded on first run.
- **License:** code is Apache-2.0. Weights and self-hosted outputs are research and non-commercial only. Fine for an unmonetized channel. A monetized video MUST swap the model.
- **VRAM:** about 7.7 GiB eager, about 14.4 GiB on the fast path (CUDA graphs). The reference machine is an RTX 3090 (24 GB); `render.py` uses the fast path by default (`--no-fast` turns it off).
- **Python:** 3.12 in a uv venv (`requires-python = ">=3.12,<3.13"`). System Python 3.14 was too new for the ML stack.
- **Torch:** `torch==2.9.1`, `torchaudio==2.9.1` from the `cu128` index, pinned to the vendor's `requirements.txt`.
- **Windows fast-path fixes:**
  - `triton-windows<3.6` in the dependencies.
  - `TORCHINDUCTOR_USE_STATIC_CUDA_LAUNCHER=0`. Inductor's static CUDA launcher overflows a 32-bit C `long` on Windows. `breeze.py` sets it before importing torch.
- **`HF_HOME`:** MUST be set before `huggingface_hub` is imported; the library reads it at import. `breeze.py`, `verify.py` and `transcribe.py` set it to `voice/models` at the top, with `setdefault`, so an outer `HF_HOME` still wins.
- **Limits:**
  - The fast path is warmed for sequences up to 512 tokens. Keep each line to one beat's sentence or two. Split a long passage into beats.
  - `max_new_tokens=1500` caps output at about 120 s. A take that reaches it is a runaway; the verify loop flags it.
- **Harmless warning:** a "sox not found" warning at load. Ignore it.

### Install

From the project's `voice/` folder:

```bash
git clone https://github.com/breezeblue-ai/breeze-tts vendor/breeze-tts
git -C vendor/breeze-tts checkout 58ec70c
uv sync                      # makes voice/.venv on Python 3.12
uv run speak.py --text "Testing one two." --out samples/test.wav --voice "calm adult narrator"
```

The first run downloads the weights into `voice/models`. `voice/vendor/`, `voice/models/` and `.venv/` are gitignored.

### Disk

Plan for about 15 GB on the project's drive before installing:

- `voice/.venv`: about 5 GB (torch with CUDA).
- `voice/models`: 8.7 GB measured (Breeze about 7 GB, Whisper large-v3-turbo about 1.6 GB).
- Clips: small (80 clips is a few tens of MB).

Check free space first. The D: drive filled up during the reference project.

## Swapping the TTS model

`render.py`, `speak.py` and the manifest do not know the model. Only `voice/breeze.py` does. A new model is a new module with the same four functions:

```python
def load(fast: bool) -> Handle                       # Handle has .sample_rate: int
def request(text: str, voice: str | None = None,
            ref: Path | None = None, ref_text: str | None = None) -> dict
def synthesize(tts: Handle, req: dict, cfg: float, seed: int) -> tuple[np.ndarray, float]  # mono float audio, wall seconds
def write_wav(path: Path, audio: np.ndarray, sample_rate: int) -> None
```

Requirements for a replacement:

- It MUST clone from a reference clip plus transcript. A model that only takes a text description brings back the per-line voice drift.
- It MUST be seedable, so takes are repeatable.
- It SHOULD encode each reference once and reuse it.

Steps:

1. Write `voice/<model>.py` with the four functions. Point the imports in `render.py` and `speak.py` at it.
2. Bump `RENDER_VERSION`.
3. Keep the frozen reference clips; they are plain audio and do not depend on the model. Render one sample line per speaker with the new model. The human listens and signs off on each voice again.
4. `wm voice:render`, then `uv run verify.py`, then `wm test`.
5. Every clip length changes. Re-run the clip check and the pacing curve. Animation timed with `S.since`/`S.on` follows; anything keyed to fixed seconds inside a beat needs an animator's check.
