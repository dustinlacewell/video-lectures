"""Breeze TTS 2: load the model once, then synthesize many requests. Shared by speak.py and render.py."""

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

import time  # noqa: E402
from dataclasses import dataclass, replace  # noqa: E402

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


@dataclass
class Breeze:
    runtime: object
    tokenizer: object
    audio_tokenizer: object
    model: object

    @property
    def sample_rate(self) -> int:
        return self.runtime.sample_rate


def load(fast: bool) -> Breeze:
    ckpt = Path(snapshot_download(MODEL_REPO, revision=MODEL_REVISION))
    tokenizer, model, audio_tokenizer = load_runtime(ckpt, device=resolve_device(), attn_implementation="eager")
    update_generation_config_for_breeze(model)
    config = FastStreamingConfig(max_new_tokens=1500, max_seq_len=2048, fast_all=fast, repetition_penalty=1.1)
    runtime = FastBreezeStreamingRuntime(model, audio_tokenizer, config, tokenizer=tokenizer)
    if runtime.fast_enabled:
        profile = load_warmup_profile(VENDOR / "configs" / "fast.json")
        runtime.warmup_from_profile(replace(profile, codec_chunk_frames=runtime.codec_chunk_frames))
    return Breeze(runtime, tokenizer, audio_tokenizer, model)


def request(text: str, voice: str | None = None, ref: Path | None = None, ref_text: str | None = None) -> dict:
    req = {"id": "speak", "text": text, "speaker": "S0"}
    if voice:
        req["instruction"] = voice.strip()
    if ref:
        req["ref_audio_path"] = str(ref)
        req["ref_text"] = (ref_text or "").strip()
    return req


def synthesize(tts: Breeze, req: dict, cfg: float, seed: int) -> tuple[np.ndarray, float]:
    """Audio samples and synthesis wall seconds."""
    set_all_seeds(seed)
    template = get_template(select_template_name(req))
    inputs = prepare_inputs(
        tts.tokenizer, tts.audio_tokenizer, tts.model, [req], template,
        guidance_scale=cfg, guidance_scale_ref=None, guidance_scale_ins=None,
    )
    start = time.perf_counter()
    chunks = [c.audio for c in tts.runtime.iter_audio_chunks(inputs, request_id=req["id"], seed=seed)]
    return np.concatenate(chunks), time.perf_counter() - start


def write_wav(path: Path, audio: np.ndarray, sample_rate: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(path, audio, sample_rate, subtype="PCM_16")
