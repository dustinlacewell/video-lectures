"""Render every voice clip in manifest.json that is missing or stale. Loads the model once.

Every line clones its speaker's reference clip (refs/<speaker>.wav + transcript); each clip is encoded once.
Each fresh clip is checked: Whisper must hear every word, and the speech must not stop mid-sound.
A clip that fails is rendered again with another seed, up to ATTEMPTS times; the best take is kept.
Each fresh or changed clip also gets its word timings refreshed in clips/words.json (see words.py).

uv run render.py --video <dir> [--no-fast]

<dir> is a video folder (e.g. videos/<slug>); its voice/ holds manifest.json, refs/ and clips/.
HERE (this package) holds the model, the vendor runtime and the venv; it is not the video's data.

Writes clips/<id>.wav, clips/index.json {id: hash}, clips/durations.json {id: seconds},
clips/words.json {id: {stamp, t}} for the fresh clips, and clips/failures.json {id: what is still
wrong} for clips no take got right. Run `wm voice:manifest` first (or `wm voice:render`, which does both).
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

# Bump when rendering or trimming changes, so every clip renders again.
RENDER_VERSION = 2
# A plain clone has no negative prompt, so it runs without guidance. A style line uses guidance to follow the style.
CLONE_CFG = 1.0
STYLE_CFG = 4.0
ATTEMPTS = 4
SILENCE_DB = -40.0
KEEP_LEAD = 0.05
# Keep this much after the last loud sample, then fade out, so a soft final consonant or breath survives.
KEEP_TAIL = 0.12
FADE_IN = 0.005
FADE_OUT = 0.03
# Raw speech that is still this loud in its last 20 ms stopped mid-sound.
OPEN_END_DB = -35.0
OUTPUT_CAP = 120.0


def main() -> None:
    args = parse_args()
    video_dir = args.video.resolve()
    voice_dir = video_dir / "voice"
    clips_dir = voice_dir / "clips"
    index_path, durations_path, failures_path = clips_dir / "index.json", clips_dir / "durations.json", clips_dir / "failures.json"
    entries = json.loads((voice_dir / "manifest.json").read_text(encoding="utf-8"))
    index, failures = read_json(index_path), read_json(failures_path)
    todo = [e for e in entries if is_stale(e, index, clips_dir)]
    started = time.perf_counter()
    if todo:
        render_all(todo, index, failures, voice_dir, clips_dir, index_path, failures_path, args.fast)
    ids = {e["id"] for e in entries}
    write_json(index_path, {k: v for k, v in index.items() if k in ids})
    write_json(failures_path, {k: v for k, v in failures.items() if k in ids})
    durations = measure(entries, clips_dir)
    write_json(durations_path, durations)
    print(f"rendered {len(todo)} of {len(entries)} clips in {time.perf_counter() - started:.1f}s; "
          f"{len(durations)} clips, {sum(durations.values()):.1f}s of audio; {len(failures)} still flawed")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--video", type=Path, required=True, help="a video folder, e.g. videos/<slug>")
    p.add_argument("--fast", action=argparse.BooleanOptionalAction, default=True, help="CUDA-graph fast path (default on)")
    return p.parse_args()


def stamp(entry: dict) -> str:
    """The index value: the line's hash plus the render settings that made it."""
    return f"{entry['hash']}.r{RENDER_VERSION}"


def is_stale(entry: dict, index: dict, clips_dir: Path) -> bool:
    return not clip_path(clips_dir, entry["id"]).exists() or index.get(entry["id"]) != stamp(entry)


def render_all(todo: list[dict], index: dict, failures: dict, voice_dir: Path, clips_dir: Path,
               index_path: Path, failures_path: Path, fast: bool) -> None:
    import breeze
    from verify import Listener
    from words import update_one

    tts, listener = breeze.load(fast), Listener()
    words = read_json(clips_dir / "words.json")
    for n, entry in enumerate(todo, 1):
        audio, flaws, takes = best_take(tts, listener, entry, voice_dir)
        path = clip_path(clips_dir, entry["id"])
        breeze.write_wav(path, audio, tts.sample_rate)
        index[entry["id"]] = stamp(entry)
        words[entry["id"]] = update_one(listener, path, entry, index)
        failures.pop(entry["id"], None)
        if flaws:
            failures[entry["id"]] = "; ".join(flaws)
        write_json(index_path, index)
        write_json(failures_path, failures)
        write_json(clips_dir / "words.json", {k: v for k, v in words.items() if k in index})
        note = f"  FLAWED: {'; '.join(flaws)}" if flaws else ""
        print(f"[{n}/{len(todo)}] {entry['id']}  {len(audio) / tts.sample_rate:.2f}s  take {takes}{note}", flush=True)


def best_take(tts, listener, entry: dict, voice_dir: Path) -> tuple[np.ndarray, list[str], int]:
    """Render until a take has no flaws, up to ATTEMPTS; else keep the take with the fewest."""
    import breeze

    best: tuple[np.ndarray, list[str], int] | None = None
    for attempt in range(ATTEMPTS):
        raw, _ = breeze.synthesize(tts, request_of(entry, voice_dir), cfg_of(entry), seed_of(entry["id"], attempt))
        audio = trim(raw, tts.sample_rate)
        flaws = flaws_of(raw, audio, tts.sample_rate, listener, entry["text"])
        if best is None or len(flaws) < len(best[1]):
            best = (audio, flaws, attempt + 1)
        if not flaws:
            break
    return best


def flaws_of(raw: np.ndarray, audio: np.ndarray, sample_rate: int, listener, text: str) -> list[str]:
    out = []
    if len(raw) / sample_rate >= OUTPUT_CAP - 1:
        out.append("hit the output cap")
    end = tail_db(raw, sample_rate)
    if end > OPEN_END_DB:
        out.append(f"stops mid-sound ({end:.0f} dB)")
    heard = listener.check(audio, sample_rate, text)
    if not heard.ok:
        out.append(f"heard '{heard.heard}' ({heard.describe()})")
    return out


def request_of(entry: dict, voice_dir: Path):
    """Clone the speaker's reference clip; the style, if any, steers delivery."""
    import breeze

    return breeze.request(entry["text"], entry.get("style"), voice_dir / entry["ref"], entry["refText"])


def cfg_of(entry: dict) -> float:
    return STYLE_CFG if entry.get("style") else CLONE_CFG


def seed_of(clip_id: str, attempt: int = 0) -> int:
    """A fixed seed per clip and attempt: repeatable, but two speakers saying one line still differ."""
    return (zlib.crc32(clip_id.encode("utf-8")) + attempt * 1_000_003) & 0x7FFFFFFF


def tail_db(audio: np.ndarray, sample_rate: int) -> float:
    """Level of the last 20 ms against the peak, in dB."""
    peak = float(np.abs(audio).max()) if len(audio) else 0.0
    if peak <= 0:
        return -200.0
    last = audio[-max(1, int(0.02 * sample_rate)):]
    return 20 * np.log10(float(np.sqrt(np.mean(last ** 2))) / peak + 1e-10)


def trim(audio: np.ndarray, sample_rate: int) -> np.ndarray:
    """Cut leading and trailing silence, keeping a margin, and fade both ends so no cut clicks."""
    level = np.abs(audio)
    peak = float(level.max()) if len(level) else 0.0
    if peak <= 0:
        return audio
    loud = np.nonzero(level > peak * 10 ** (SILENCE_DB / 20))[0]
    start = max(0, loud[0] - int(KEEP_LEAD * sample_rate))
    end = min(len(audio), loud[-1] + 1 + int(KEEP_TAIL * sample_rate))
    return fade(audio[start:end].astype(np.float32), int(FADE_IN * sample_rate), int(FADE_OUT * sample_rate))


def fade(audio: np.ndarray, fade_in: int, fade_out: int) -> np.ndarray:
    """Raised-cosine fade in over the first fade_in samples and out over the last fade_out."""
    out = audio.copy()
    n_in, n_out = min(fade_in, len(out)), min(fade_out, len(out))
    if n_in:
        out[:n_in] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n_in, dtype=np.float32))
    if n_out:
        out[-n_out:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, n_out, dtype=np.float32))
    return out


def measure(entries: list[dict], clips_dir: Path) -> dict[str, float]:
    out = {}
    for e in entries:
        path = clip_path(clips_dir, e["id"])
        if path.exists():
            info = sf.info(path)
            out[e["id"]] = round(info.frames / info.samplerate, 3)
    return out


def clip_path(clips_dir: Path, clip_id: str) -> Path:
    return clips_dir / f"{clip_id}.wav"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
