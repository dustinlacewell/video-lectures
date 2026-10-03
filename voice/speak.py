"""Synthesize one WAV with Breeze TTS 2.

uv run speak.py --text "..." --out out.wav [--voice "<description>"] [--ref ref.wav --ref-text "..."] [--fast]

--voice is a natural-language voice description (the model has no named presets).
With --ref it steers the cloned voice instead (tone, pace, emotion).
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Windows: Inductor's static CUDA launcher overflows a 32-bit C long; the fast path needs it off.
os.environ.setdefault("TORCHINDUCTOR_USE_STATIC_CUDA_LAUNCHER", "0")
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

HERE = Path(__file__).resolve().parent
os.environ.setdefault("HF_HOME", str(HERE / "models"))

VENDOR = HERE / "vendor" / "breeze-tts"
sys.path.insert(0, str(VENDOR))

import argparse  # noqa: E402
import time  # noqa: E402
from dataclasses import replace  # noqa: E402

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
from huggingface_hub import snapshot_download  # noqa: E402

from breeze_infer.runtime import (  # noqa: E402
    load_runtime,
    resolve_device,
    set_all_seeds,
    update_generation_config_for_breeze,
)
from breeze_infer.templates import get_template, prepare_inputs, select_template_name  # noqa: E402
from models.fast_streaming import FastBreezeStreamingRuntime, FastStreamingConfig  # noqa: E402
from models.warmup_profile import load_warmup_profile  # noqa: E402

MODEL_REPO = "BreezeBlue/Breeze-TTS-2"
MODEL_REVISION = "3e28c5151381a722f1d8661b4118c298caa77aa4"


def main() -> None:
    args = parse_args()
    runtime, tokenizer, audio_tokenizer, model = load(args.fast)
    request = build_request(args)
    inputs = prepare(request, args, tokenizer, audio_tokenizer, model)
    audio, seconds = synthesize(runtime, inputs, args.seed)
    write_wav(args.out, audio, runtime.sample_rate)
    report(args.out, audio, runtime.sample_rate, seconds)


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


def load(fast: bool):
    ckpt = Path(snapshot_download(MODEL_REPO, revision=MODEL_REVISION))
    tokenizer, model, audio_tokenizer = load_runtime(ckpt, device=resolve_device(), attn_implementation="eager")
    update_generation_config_for_breeze(model)
    config = FastStreamingConfig(max_new_tokens=1500, max_seq_len=2048, fast_all=fast, repetition_penalty=1.1)
    runtime = FastBreezeStreamingRuntime(model, audio_tokenizer, config, tokenizer=tokenizer)
    if runtime.fast_enabled:
        profile = load_warmup_profile(VENDOR / "configs" / "fast.json")
        runtime.warmup_from_profile(replace(profile, codec_chunk_frames=runtime.codec_chunk_frames))
    return runtime, tokenizer, audio_tokenizer, model


def build_request(args: argparse.Namespace) -> dict:
    request = {"id": "speak", "text": args.text, "speaker": "S0"}
    if args.voice:
        request["instruction"] = args.voice.strip()
    if args.ref:
        request["ref_audio_path"] = str(args.ref)
        request["ref_text"] = args.ref_text.strip()
    return request


def prepare(request, args, tokenizer, audio_tokenizer, model):
    set_all_seeds(args.seed)
    template = get_template(select_template_name(request))
    return prepare_inputs(
        tokenizer, audio_tokenizer, model, [request], template,
        guidance_scale=args.cfg, guidance_scale_ref=None, guidance_scale_ins=None,
    )


def synthesize(runtime, inputs, seed: int) -> tuple[np.ndarray, float]:
    start = time.perf_counter()
    chunks = [c.audio for c in runtime.iter_audio_chunks(inputs, request_id="speak", seed=seed)]
    return np.concatenate(chunks), time.perf_counter() - start


def write_wav(path: Path, audio: np.ndarray, sample_rate: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(path, audio, sample_rate, subtype="PCM_16")


def report(path: Path, audio: np.ndarray, sample_rate: int, seconds: float) -> None:
    import torch

    duration = len(audio) / sample_rate
    peak = torch.cuda.max_memory_allocated() / 2**30 if torch.cuda.is_available() else 0.0
    print(f"saved {path}  {sample_rate} Hz  audio {duration:.2f}s  synth {seconds:.2f}s  "
          f"RTF {seconds / duration:.2f}  peak VRAM {peak:.1f} GiB")


if __name__ == "__main__":
    main()
