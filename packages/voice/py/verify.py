"""Check voice clips against their script text with Whisper. Lists every clip with missing or wrong words.

uv run verify.py --video <dir> [clip_id ...]

<dir> is a video folder (e.g. videos/<slug>); its voice/ holds manifest.json and clips/.
HERE (this package) holds the model; it is not the video's data.

Without ids it checks every clip in manifest.json. render.py uses the same check on each fresh clip.
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
os.environ.setdefault("HF_HOME", str(HERE / "models"))
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

MODEL = "openai/whisper-large-v3-turbo"
RATE = 16000

CONTRACTIONS = {
    "let's": "let us", "i'm": "i am", "it's": "it is", "that's": "that is", "don't": "do not",
    "doesn't": "does not", "isn't": "is not", "can't": "cannot", "won't": "will not", "you're": "you are",
    "we're": "we are", "they're": "they are", "what's": "what is", "there's": "there is", "here's": "here is",
    "i've": "i have", "you've": "you have", "i'll": "i will", "you'll": "you will", "i'd": "i would",
}
# Whisper writes British spellings now and then. They are the same word.
SPELLINGS = {"humour": "humor", "colour": "color", "behaviour": "behavior", "favourite": "favorite"}


@dataclass
class Check:
    """How a heard clip differs from its text. Each miss is (where, expected words, heard words)."""

    heard: str
    misses: list[tuple[str, str, str]]

    @property
    def ok(self) -> bool:
        return not self.misses

    def describe(self) -> str:
        return "; ".join(f"{where}: '{want}' -> '{got}'" for where, want, got in self.misses)


def words(text: str) -> list[str]:
    """Lower-case words with punctuation dropped, contractions expanded and dotted letters joined (A.I. -> ai)."""
    t = text.lower().replace("’", "'").replace("‘", "'")
    t = re.sub(r"\b(?:[a-z]\.){2,}", lambda m: m.group(0).replace(".", "") + " ", t)
    t = re.sub(r"[^a-z0-9' ]+", " ", t)
    out: list[str] = []
    for w in t.split():
        w = SPELLINGS.get(w.strip("'"), w.strip("'"))
        out.extend(CONTRACTIONS.get(w, w).split())
    return [w for w in out if w]


def align(text: str, chunks: list[tuple[str, float, float]]) -> list[list[float]]:
    """Script tokens (text.split(), in order) -> one [start, end] seconds pair per token.

    Normalizes each script token and each heard chunk with `words()` into 0..n normal words, each
    tagged with its source index; matches the two sequences with SequenceMatcher. A token's time
    spans its first matched chunk's start to its last matched chunk's end. An unmatched token's
    time is interpolated between its nearest matched neighbours. Output length == len(text.split()).
    """
    tokens = text.split()
    want = _tag_words(tokens, words)
    got = _tag_words([c[0] for c in chunks], words)
    matched: dict[int, tuple[float, float]] = {}
    sm = difflib.SequenceMatcher(a=[w for w, _ in want], b=[w for w, _ in got], autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op not in ("equal", "replace"):
            continue
        for i, j in zip(range(i1, i2), range(j1, j2)):
            tok_i, chunk_i = want[i][1], got[j][1]
            start, end = chunks[chunk_i][1], chunks[chunk_i][2]
            lo, hi = matched.get(tok_i, (start, end))
            matched[tok_i] = (min(lo, start), max(hi, end))
    return _fill_gaps(len(tokens), matched)


def _tag_words(items: list[str], normalize) -> list[tuple[str, int]]:
    """Each item may normalize to 0..n words; each is tagged with its source index."""
    return [(w, i) for i, item in enumerate(items) for w in normalize(item)]


def _fill_gaps(n: int, matched: dict[int, tuple[float, float]]) -> list[list[float]]:
    """Unmatched tokens get times interpolated between their nearest matched neighbours."""
    out: list[list[float] | None] = [list(matched[i]) if i in matched else None for i in range(n)]
    for i in range(n):
        if out[i] is not None:
            continue
        lo = next((out[j][1] for j in range(i - 1, -1, -1) if out[j] is not None), 0.0)
        hi = next((out[j][0] for j in range(i + 1, n) if out[j] is not None), lo)
        out[i] = [lo, hi]
    return out  # type: ignore[return-value]


def compare(expected: str, heard: str) -> Check:
    """Word-level diff. A miss at the last expected word is 'end', at the first 'start', else 'middle'."""
    want, got = words(expected), words(heard)
    misses = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=want, b=got, autojunk=False).get_opcodes():
        if op == "equal":
            continue
        where = "end" if i2 >= len(want) and i1 < len(want) else "start" if i1 == 0 else "middle"
        if op == "insert":
            where = "extra"
        misses.append((where, " ".join(want[i1:i2]), " ".join(got[j1:j2])))
    return Check(heard, misses)


class Listener:
    """Whisper on the GPU, loaded once."""

    def __init__(self) -> None:
        import torch
        from transformers import pipeline

        self._asr = pipeline("automatic-speech-recognition", model=MODEL, torch_dtype=torch.float16, device="cuda:0")

    def hear(self, audio: np.ndarray, sample_rate: int) -> str:
        return self._transcribe(audio, sample_rate)["text"].strip()

    def hear_words(self, audio: np.ndarray, sample_rate: int) -> list[tuple[str, float, float]]:
        """Each heard word as (text, start, end) seconds, in order. An open-ended last word gets end = start."""
        chunks = self._transcribe(audio, sample_rate, return_timestamps="word")["chunks"]
        out = []
        for c in chunks:
            start, end = c["timestamp"]
            out.append((c["text"].strip(), start, end if end is not None else start))
        return out

    def _transcribe(self, audio: np.ndarray, sample_rate: int, **kwargs):
        import librosa

        mono = audio.astype(np.float32)
        if sample_rate != RATE:
            mono = librosa.resample(mono, orig_sr=sample_rate, target_sr=RATE)
        return self._asr(mono, generate_kwargs={"language": "en", "task": "transcribe"}, **kwargs)

    def check(self, audio: np.ndarray, sample_rate: int, text: str) -> Check:
        return compare(text, self.hear(audio, sample_rate))


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--video", type=Path, required=True, help="a video folder, e.g. videos/<slug>")
    p.add_argument("clip_ids", nargs="*", help="check only these clip ids (default: every clip)")
    return p.parse_args()


def main() -> None:
    import soundfile as sf

    args = parse_args()
    voice_dir = args.video.resolve() / "voice"
    clips_dir = voice_dir / "clips"
    entries = json.loads((voice_dir / "manifest.json").read_text(encoding="utf-8"))
    ids = set(args.clip_ids)
    entries = [e for e in entries if not ids or e["id"] in ids]
    listener = Listener()
    bad = 0
    for e in entries:
        path = clips_dir / f"{e['id']}.wav"
        if not path.exists():
            print(f"MISSING  {e['id']}")
            bad += 1
            continue
        audio, sr = sf.read(path, dtype="float32")
        c = listener.check(audio, sr, e["text"])
        if not c.ok:
            bad += 1
            print(f"MISMATCH {e['id']}  {len(audio) / sr:.2f}s  {c.describe()}  | heard: {c.heard}")
    print(f"{len(entries) - bad} of {len(entries)} clips match")


if __name__ == "__main__":
    main()
