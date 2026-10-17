#!/usr/bin/env python3
"""Convert images under assets/ to AVIF and update repository references.

This script:
  1) Walks assets/ recursively and converts each source image to a sibling .avif file
     using ImageMagick's `magick` command.
    2) Rewrites text references in the repository so paths like assets/foo.avif remain
     assets/foo.avif.

Usage:
  python scripts/convert_events_to_avif_and_update_refs.py
  python scripts/convert_events_to_avif_and_update_refs.py --quality 50 --dry-run

Options:
  --quality          AVIF quality passed to ImageMagick (default: 50)
  --assets-root      Folder to scan for source images (default: assets)
  --overwrite        Recreate .avif files even when they already exist
  --dry-run          Show intended conversions and edits without writing changes
  --no-update-refs   Convert files but do not rewrite text references
"""

from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path
from typing import Dict, Iterable


SOURCE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"}
TEXT_EXTENSIONS = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".py",
    ".txt",
}

IMAGE_REF_PATTERN = re.compile(
    r"assets/([^\"'\n\r]+?)\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)"
)


def is_source_image(path: Path) -> bool:
    return path.is_file() and path.suffix in SOURCE_EXTENSIONS


def to_avif_path(src: Path) -> Path:
    return src.with_suffix(".avif")


def convert_with_magick(src: Path, dest: Path, quality: int, dry_run: bool) -> bool:
    if dry_run:
        print(f"[DRY] magick \"{src}\" -quality {quality} \"{dest}\"")
        return True

    dest.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["magick", str(src), "-quality", str(quality), str(dest)],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"Failed to convert {src}")
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return False

    print(f"Converted {src.name} -> {dest.name}")
    return True


def collect_image_map(repo_root: Path, events_root: Path) -> Dict[str, str]:
    mapping: Dict[str, str] = {}
    for path in sorted(events_root.rglob("*")):
        if not is_source_image(path):
            continue

        dest = to_avif_path(path)
        src_rel = path.relative_to(repo_root).as_posix()
        dest_rel = dest.relative_to(repo_root).as_posix()
        mapping[src_rel] = dest_rel
    return mapping


def update_text_file(path: Path, replacements: Dict[str, str], dry_run: bool) -> bool:
    try:
        original = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return False

    updated = original
    changed = False
    for source, target in replacements.items():
        if source in updated:
            updated = updated.replace(source, target)
            changed = True

    def replace_image(match: re.Match[str]) -> str:
        return f"assets/{match.group(1)}.avif"

    regex_updated = IMAGE_REF_PATTERN.sub(replace_image, updated)
    if regex_updated != updated:
        updated = regex_updated
        changed = True

    if not changed:
        return False

    if dry_run:
        print(f"[DRY] Would update {path}")
        return True

    path.write_text(updated, encoding="utf-8")
    print(f"Updated {path}")
    return True


def iter_text_files(root: Path) -> Iterable[Path]:
    script_path = Path(__file__).resolve()
    for path in sorted(root.rglob("*")):
        if path == script_path:
            continue
        if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS:
            yield path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quality", type=int, default=50)
    parser.add_argument("--assets-root", default="assets")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-update-refs", action="store_true")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    assets_root = (repo_root / args.assets_root).resolve()

    if not assets_root.exists():
        print(f"Assets folder not found: {assets_root}")
        return 1

    replacements = collect_image_map(repo_root, assets_root)
    if not replacements:
        print(f"No source images found in {assets_root}")
        return 0

    converted = 0
    for source_rel, target_rel in replacements.items():
        src = repo_root / Path(source_rel)
        dest = repo_root / Path(target_rel)

        if dest.exists() and not args.overwrite:
            print(f"Skipping existing {dest.relative_to(repo_root)}")
            continue

        if convert_with_magick(src, dest, args.quality, args.dry_run):
            converted += 1

    if not args.no_update_refs:
        text_files = list(iter_text_files(repo_root))
        for path in text_files:
            update_text_file(path, replacements, args.dry_run)

    print(f"Done. {converted} conversions processed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())