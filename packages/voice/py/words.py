"""Word timings for every voice clip, kept in sync with the render hash cache.

uv run words.py --video <dir>

<dir> is a video folder (e.g. videos/<slug>); its voice/ holds manifest.json and clips/.
HERE (this package) holds the model; it is not the video's data.

For each clip whose words.json stamp differs from its clips/index.json stamp, runs Whisper once
with word timestamps (verify.Listener.hear_words) and aligns the heard words onto the script's own
tokens (verify.align) -- the clip's manifest `text`, split on whitespace. Writes
clips/words.json {id: {stamp, t}}, t being one [start, end] pair per token, in clip-relative
seconds, sorted by key.

This is the backfill pass: `wm voice:words` runs it alone, with no render. render.py calls the
same two functions on each clip it renders, so a render also refreshes that clip's words.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import soundfile as sf

from verify import Listener, align

RATE = 16000


def main() -> None:
    args = parse_args()
    voice_dir = args.video.resolve() / "voice"
    clips_dir = voice_dir / "clips"
    manifest = json.loads((voice_dir / "manifest.json").read_text(encoding="utf-8"))
    index = read_json(clips_dir / "index.json")
    existing = read_json(clips_dir / "words.json")
    todo = [e for e in manifest if existing.get(e["id"], {}).get("stamp") != index.get(e["id"])]
    if not todo:
        print(f"words up to date for {len(manifest)} clips")
        return
    listener = Listener()
    out = update_many(listener, clips_dir, todo, index, existing, {e["id"] for e in manifest})
    write_json(clips_dir / "words.json", out)
    print(f"words.json: {len(out)} clips, {len(todo)} refreshed")


def update_many(listener: Listener, clips_dir: Path, todo: list[dict], index: dict,
                 existing: dict, keep_ids: set[str]) -> dict:
    """The backfill loop: words for every entry in todo, kept beside the untouched existing entries."""
    out = {k: v for k, v in existing.items() if k in keep_ids}
    for n, entry in enumerate(todo, 1):
        path = clips_dir / f"{entry['id']}.wav"
        if not path.exists():
            continue
        out[entry["id"]] = update_one(listener, path, entry, index)
        print(f"[{n}/{len(todo)}] {entry['id']}", flush=True)
    return out


def update_one(listener: Listener, path: Path, entry: dict, index: dict) -> dict:
    """One clip's words.json entry: align its heard words onto its script text, stamped with its index hash."""
    audio, sr = sf.read(path, dtype="float32")
    chunks = listener.hear_words(audio, sr)
    return {"stamp": index.get(entry["id"], ""), "t": align(entry["text"], chunks)}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--video", type=Path, required=True, help="a video folder, e.g. videos/<slug>")
    return p.parse_args()


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
