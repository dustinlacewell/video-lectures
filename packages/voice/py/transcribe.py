"""Transcribe a WAV with Whisper, word by word with times. Use it to write a reference clip's exact transcript.

uv run transcribe.py refs/narrator.wav [more.wav ...]
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
os.environ.setdefault("HF_HOME", str(HERE / "models"))
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

import librosa  # noqa: E402
import torch  # noqa: E402
from transformers import pipeline  # noqa: E402

MODEL = "openai/whisper-large-v3-turbo"
RATE = 16000


def main() -> None:
    asr = pipeline("automatic-speech-recognition", model=MODEL, torch_dtype=torch.float16, device="cuda:0")
    for path in sys.argv[1:]:
        audio, _ = librosa.load(path, sr=RATE, mono=True)
        out = asr(audio, return_timestamps="word", generate_kwargs={"language": "en", "task": "transcribe"})
        print(f"== {path}  {len(audio) / RATE:.2f}s")
        print(out["text"].strip())
        for w in out["chunks"]:
            start, end = w["timestamp"]
            print(f"  {start:6.2f} {end if end is not None else float('nan'):6.2f}  {w['text'].strip()}")


if __name__ == "__main__":
    main()
