"""Synthesize one WAV with Breeze TTS 2.

uv run speak.py --text "..." --out out.wav [--voice "<description>"] [--ref ref.wav --ref-text "..."] [--fast]

--voice is a natural-language voice description (the model has no named presets).
With --ref it steers the cloned voice instead (tone, pace, emotion).
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np

import breeze


def main() -> None:
    args = parse_args()
    tts = breeze.load(args.fast)
    req = breeze.request(args.text, args.voice, args.ref, args.ref_text)
    audio, seconds = breeze.synthesize(tts, req, args.cfg, args.seed)
    breeze.write_wav(args.out, audio, tts.sample_rate)
    report(args.out, audio, tts.sample_rate, seconds)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--text", required=True)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--voice", help="voice description, or direction when --ref is set")
    p.add_argument("--ref", type=Path, help="reference audio to clone")
    p.add_argument("--ref-text", help="exact transcript of --ref")
    p.add_argument("--cfg", type=float, help="guidance scale (default 4 with --voice, else 1)")
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--fast", action="store_true", help="CUDA-graph fast path (~14 GiB VRAM)")
    args = p.parse_args()
    if (args.ref is None) != (not args.ref_text):
        p.error("--ref and --ref-text go together")
    if args.cfg is None:
        args.cfg = 4.0 if args.voice else 1.0
    return args


def report(path: Path, audio: np.ndarray, sample_rate: int, seconds: float) -> None:
    import torch

    duration = len(audio) / sample_rate
    peak = torch.cuda.max_memory_allocated() / 2**30 if torch.cuda.is_available() else 0.0
    print(f"saved {path}  {sample_rate} Hz  audio {duration:.2f}s  synth {seconds:.2f}s  "
          f"RTF {seconds / duration:.2f}  peak VRAM {peak:.1f} GiB")


if __name__ == "__main__":
    main()
