"""Check voice clips against their script text with Whisper. Lists every clip with missing or wrong words.

uv run verify.py [clip_id ...]

Without ids it checks every clip in manifest.json. render.py uses the same check on each fresh clip.
"""

from __future__ import annotations

import difflib
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
os.environ.setdefault("HF_HOME", str(HERE / "models"))
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

MANIFEST = HERE / "manifest.json"
CLIPS = HERE / "clips"
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
        import librosa

        mono = audio.astype(np.float32)
        if sample_rate != RATE:
            mono = librosa.resample(mono, orig_sr=sample_rate, target_sr=RATE)
        out = self._asr(mono, generate_kwargs={"language": "en", "task": "transcribe"})
        return out["text"].strip()

    def check(self, audio: np.ndarray, sample_rate: int, text: str) -> Check:
        return compare(text, self.hear(audio, sample_rate))


def main() -> None:
    import soundfile as sf

    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    ids = set(sys.argv[1:])
    entries = [e for e in entries if not ids or e["id"] in ids]
    listener = Listener()
    bad = 0
    for e in entries:
        path = CLIPS / f"{e['id']}.wav"
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
