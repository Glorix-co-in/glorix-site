"""Update and shuffle gallery.json.

This script:
  1) Scans `assets/gallery/` recursively for image files.
  2) Ensures each file is represented in `data/gallery.json` (adds missing ones).
  3) Randomizes the order so that consecutive entries are not from the same subfolder (event).

Usage:
  python scripts/update_gallery_json.py

Note: This will overwrite `data/gallery.json` in-place.
"""

import json
import os
import random
from collections import defaultdict


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
GALLERY_JSON = os.path.join(ROOT, "data", "gallery.json")
GALLERY_DIR = os.path.join(ROOT, "assets", "gallery")

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"}


def is_image_file(path: str) -> bool:
    return os.path.splitext(path)[1].lower() in IMAGE_EXTENSIONS


def get_group_key(src: str) -> str:
    """Return a grouping key for a gallery item based on its folder.

    For example:
      assets/gallery/bali photos/IMG.jpg -> 'bali photos'
      assets/gallery/IMG.jpg -> 'root'

    """
    # Normalize to forward slashes for consistent splitting.
    parts = src.replace("\\", "/").split("/")
    # Expect pattern: ['assets', 'gallery', ...]
    if len(parts) <= 3:
        return "root"
    return parts[2]


def scan_gallery_files() -> list[dict]:
    """Walk assets/gallery and return a sorted list of items for gallery.json."""
    items = []
    for dirpath, dirnames, filenames in os.walk(GALLERY_DIR):
        # Ignore hidden dirs or non-image files.
        for fname in sorted(filenames):
            if not is_image_file(fname):
                continue
            abs_path = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(abs_path, ROOT).replace("\\", "/")
            items.append({"src": rel_path, "alt": "Gallery Image"})
    return items


def load_existing() -> list[dict]:
    with open(GALLERY_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def save_items(items: list[dict]) -> None:
    with open(GALLERY_JSON, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
        f.write("\n")


def shuffle_no_consecutive_same_group(items: list[dict]) -> list[dict]:
    """Shuffle items so that no two consecutive items are from the same group.

    This uses a greedy approach similar to reorganize-string.
    """
    groups = defaultdict(list)
    for item in items:
        key = get_group_key(item["src"])
        groups[key].append(item)

    # Create a list of (count, key, items_list) to be used as a max-heap.
    heap = [(-len(lst), key, lst.copy()) for key, lst in groups.items() if lst]
    random.shuffle(heap)  # randomize tie order
    heap.sort()  # sort by negative count -> largest first

    result = []
    prev_key = None

    while heap:
        # pick the highest-count group that's not the same as prev_key
        for idx, (_, key, lst) in enumerate(heap):
            if key != prev_key:
                break
        else:
            # If only one group remains and it's the same as prev_key, we have to accept it.
            idx = 0

        count, key, lst = heap.pop(idx)
        # Pop one item from this group
        next_item = lst.pop()
        result.append(next_item)
        prev_key = key

        if lst:
            heap.append((-(len(lst)), key, lst))
            heap.sort()

    return result


def main() -> None:
    existing = load_existing()
    scanned = scan_gallery_files()

    # ensure all scanned images exist in JSON; keep any existing order for existing ones.
    existing_srcs = {item["src"] for item in existing}
    added = [item for item in scanned if item["src"] not in existing_srcs]

    combined = existing + added

    # Shuffle with no same-folder adjacency
    randomized = shuffle_no_consecutive_same_group(combined)

    save_items(randomized)
    print(f"Updated {GALLERY_JSON}: {len(scanned)} images (added {len(added)} new)\n")


if __name__ == "__main__":
    main()
