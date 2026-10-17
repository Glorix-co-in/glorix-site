#!/usr/bin/env python3
"""
Sort `data/artists.json` alphabetically by the `name` field (case-insensitive).
Creates a backup at `data/artists.json.bak` before overwriting.
Usage: python scripts/sort_artists_json.py
"""
import json
from pathlib import Path
import sys

ARTISTS_PATH = Path("data/artists.json")
BACKUP_PATH = ARTISTS_PATH.with_suffix(".json.bak")


def load_artists(path: Path):
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw)
    if not isinstance(data, list):
        raise SystemExit(f"{path} does not contain a JSON array")
    return data, raw


def save_artists(path: Path, artists):
    json_text = json.dumps(artists, ensure_ascii=False, indent=2) + "\n"
    path.write_text(json_text, encoding="utf-8")


def main():
    if not ARTISTS_PATH.exists():
        print(f"ERROR: {ARTISTS_PATH} not found", file=sys.stderr)
        sys.exit(1)

    artists, original_text = load_artists(ARTISTS_PATH)
    sorted_artists = sorted(artists, key=lambda a: a.get("name", "").lower())

    if sorted_artists == artists:
        print("No changes — `data/artists.json` is already sorted.")
        return

    # backup and overwrite
    BACKUP_PATH.write_text(original_text, encoding="utf-8")
    save_artists(ARTISTS_PATH, sorted_artists)
    print(f"Sorted {len(sorted_artists)} artists and updated '{ARTISTS_PATH}'.")
    print(f"Backup written to '{BACKUP_PATH}'.")


if __name__ == "__main__":
    main()
