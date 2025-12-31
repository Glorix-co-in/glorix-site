#!/usr/bin/env python3
"""Convert images to WebP (quality=90), move originals to backup, and update data/gallery.json.

Usage:
  python convert_to_webp_and_update_json.py --folders "bali photos" "seasons photos" \
       --quality 90 --backup-dir "assets/gallery/originals" --move

Options:
  --folders        One or more folder names under assets/gallery to process (default: both 'bali photos' and 'seasons photos')
  --quality        WebP quality (default: 90)
  --backup-dir     Where to move/copy original files (default: assets/gallery/originals)
  --move           Move originals to backup (default: move). Use --copy to copy instead.
  --copy           Copy originals to backup instead of moving.
  --update-json    Update data/gallery.json to reference .webp (default: True)
  --dry-run        Show what would be done without making changes
"""
from pathlib import Path
import argparse
import shutil
import json
import sys
from PIL import Image

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}


def convert_image_to_webp(src: Path, dest: Path, quality: int, dry_run: bool=False):
    if dry_run:
        print(f"[DRY] Would convert {src} -> {dest} (quality={quality})")
        return True
    try:
        img = Image.open(src)
        # Convert mode for compatibility
        if img.mode in ("RGBA", "LA"):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, 'WEBP', quality=quality, method=6)
        return True
    except Exception as e:
        print(f"Failed to convert {src}: {e}")
        return False


def process_folder(gallery_root: Path, folder_name: str, backup_root: Path, quality: int, move_originals: bool, dry_run: bool=False):
    folder_path = gallery_root / folder_name
    if not folder_path.exists() or not folder_path.is_dir():
        print(f"Folder not found: {folder_path}")
        return {}

    processed = {}

    files = sorted([p for p in folder_path.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS])
    if not files:
        print(f"No images found in {folder_path}")
        return {}

    backup_folder = backup_root / folder_name
    if not dry_run:
        backup_folder.mkdir(parents=True, exist_ok=True)

    for p in files:
        webp_path = p.with_suffix('.webp')
        # Skip if webp already exists and is new (you may want to --overwrite later)
        if webp_path.exists():
            print(f"Skipping (webp exists): {webp_path.name}")
            continue
        ok = convert_image_to_webp(p, webp_path, quality, dry_run=dry_run)
        if not ok:
            continue
        # Move or copy original
        if move_originals:
            if dry_run:
                print(f"[DRY] Would move {p} -> {backup_folder / p.name}")
            else:
                shutil.move(str(p), str(backup_folder / p.name))
                print(f"Moved original {p.name} -> {backup_folder / p.name}")
        else:
            if dry_run:
                print(f"[DRY] Would copy {p} -> {backup_folder / p.name}")
            else:
                shutil.copy2(str(p), str(backup_folder / p.name))
                print(f"Copied original {p.name} -> {backup_folder / p.name}")
        processed[f"assets/gallery/{folder_name}/{p.name}"] = f"assets/gallery/{folder_name}/{webp_path.name}"
    return processed


def update_gallery_json(gallery_json_path: Path, replacements: dict, dry_run: bool=False):
    if not replacements:
        print("No replacements to make in gallery.json")
        return 0
    if not gallery_json_path.exists():
        print(f"gallery.json not found at {gallery_json_path}")
        return 0
    with gallery_json_path.open('r', encoding='utf-8') as f:
        data = json.load(f)

    changed = 0
    keys = set(replacements.keys())

    for item in data:
        src = item.get('src')
        if src in replacements:
            new = replacements[src]
            print(f"Updating {src} -> {new}")
            item['src'] = new
            changed += 1

    if changed == 0:
        print("No matching entries in gallery.json were updated.")
        return 0

    if dry_run:
        print(f"[DRY] Would write {changed} changes to {gallery_json_path}")
        return changed

    # Backup gallery.json
    shutil.copy2(str(gallery_json_path), str(gallery_json_path.with_suffix('.json.bak')))
    with gallery_json_path.open('w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated {changed} entries in {gallery_json_path} (backup saved as .json.bak)")
    return changed


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--folders', nargs='+', default=['bali photos', 'seasons photos'])
    parser.add_argument('--quality', type=int, default=90)
    parser.add_argument('--backup-dir', default='assets/gallery/originals')
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--move', action='store_true', help='Move originals to backup (default)')
    group.add_argument('--copy', action='store_true', help='Copy originals to backup instead of moving')
    parser.add_argument('--no-update-json', action='store_true', help="Don't update data/gallery.json")
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--gallery-root', default='assets/gallery')
    parser.add_argument('--gallery-json', default='data/gallery.json')
    args = parser.parse_args()

    gallery_root = Path(args.gallery_root)
    backup_root = Path(args.backup_dir)
    gallery_json = Path(args.gallery_json)

    move_originals = args.move or not args.copy
    all_replacements = {}

    for folder in args.folders:
        print(f"Processing folder: {folder}")
        replacements = process_folder(gallery_root, folder, backup_root, quality=args.quality, move_originals=move_originals, dry_run=args.dry_run)
        all_replacements.update(replacements)

    if not args.no_update_json:
        update_gallery_json(gallery_json, all_replacements, dry_run=args.dry_run)

    print("Done.")
