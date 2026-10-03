"""Render every voice clip in manifest.json that is missing or stale. Loads the model once.

uv run render.py [--no-fast]

Writes clips/<id>.wav, clips/index.json {id: hash} and clips/durations.json {id: seconds}.
Run `wm voice:manifest` first (or `wm voice:render`, which does both).
"""

from __future__ import annotations

import argparse
import json
import time
import zlib
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "manifest.json"
CLIPS = HERE / "clips"
INDEX = CLIPS / "index.json"
DURATIONS = CLIPS / "durations.json"

CFG = 4.0
SILENCE_DB = -40.0
KEEP_LEAD = 0.05
KEEP_TAIL = 0.10
OUTPUT_CAP = 120.0


def main() -> None:
    args = parse_args()
    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    index = read_json(INDEX)
    todo = [e for e in entries if is_stale(e, index)]
    started = time.perf_counter()
    if todo:
        render_all(todo, index, args.fast)
    index = {e["id"]: index[e["id"]] for e in entries if e["id"] in index}
    write_json(INDEX, index)
    durations = measure(entries)
    write_json(DURATIONS, durations)
    print(f"rendered {len(todo)} of {len(entries)} clips in {time.perf_counter() - started:.1f}s; "
          f"{len(durations)} clips, {sum(durations.values()):.1f}s of audio")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--fast", action=argparse.BooleanOptionalAction, default=True, help="CUDA-graph fast path (default on)")
    return p.parse_args()


def is_stale(entry: dict, index: dict) -> bool:
    return not clip_path(entry["id"]).exists() or index.get(entry["id"]) != entry["hash"]


def render_all(todo: list[dict], index: dict, fast: bool) -> None:
    import breeze

    tts = breeze.load(fast)
    for n, entry in enumerate(todo, 1):
        audio, seconds = breeze.synthesize(tts, breeze.request(entry["text"], entry["voice"]), CFG, seed_of(entry["id"]))
        raw = len(audio) / tts.sample_rate
        audio = trim(audio, tts.sample_rate)
        breeze.write_wav(clip_path(entry["id"]), audio, tts.sample_rate)
        index[entry["id"]] = entry["hash"]
        write_json(INDEX, index)
        warn = "  WARNING: hit the output cap" if raw >= OUTPUT_CAP - 1 else ""
        print(f"[{n}/{len(todo)}] {entry['id']}  {len(audio) / tts.sample_rate:.2f}s  synth {seconds:.1f}s{warn}", flush=True)


def seed_of(clip_id: str) -> int:
    """A fixed seed per clip: repeatable, but two speakers saying one line still differ."""
    return zlib.crc32(clip_id.encode("utf-8")) & 0x7FFFFFFF


def trim(audio: np.ndarray, sample_rate: int) -> np.ndarray:
    """Cut leading and trailing silence, keeping a short margin."""
    level = np.abs(audio)
    peak = float(level.max()) if len(level) else 0.0
    if peak <= 0:
        return audio
    loud = np.nonzero(level > peak * 10 ** (SILENCE_DB / 20))[0]
    start = max(0, loud[0] - int(KEEP_LEAD * sample_rate))
    end = min(len(audio), loud[-1] + 1 + int(KEEP_TAIL * sample_rate))
    return audio[start:end]


def measure(entries: list[dict]) -> dict[str, float]:
    out = {}
    for e in entries:
        path = clip_path(e["id"])
        if path.exists():
            info = sf.info(path)
            out[e["id"]] = round(info.frames / info.samplerate, 3)
    return out


def clip_path(clip_id: str) -> Path:
    return CLIPS / f"{clip_id}.wav"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
