#!/usr/bin/env python3
"""Convert .ARW (Sony RAW) files to .jpg using rawpy + Pillow.

Usage:
  python convert_arw_to_jpg.py [DIRECTORY] [--overwrite]

If DIRECTORY is omitted, the current working directory is used.
"""
import os
import sys
from pathlib import Path

try:
    import rawpy
except Exception:
    print("Missing dependency: rawpy. Install with: python -m pip install rawpy")
    sys.exit(2)

try:
    from PIL import Image
except Exception:
    print("Missing dependency: Pillow. Install with: python -m pip install pillow")
    sys.exit(2)

import numpy as np


def convert_dir(dirpath: Path, overwrite=False):
    arw_files = sorted([p for p in dirpath.iterdir() if p.suffix.lower() == '.arw'])
    if not arw_files:
        print(f"No .ARW files found in {dirpath}")
        return 0

    converted = 0
    for p in arw_files:
        out = p.with_suffix('.jpg')
        if out.exists() and not overwrite:
            print(f"Skipping (exists): {out.name}")
            continue
        try:
            with rawpy.imread(str(p)) as raw:
                rgb = raw.postprocess()
            img = Image.fromarray(rgb)
            img.save(out, 'JPEG', quality=95)
            print(f"Converted: {p.name} -> {out.name}")
            converted += 1
        except Exception as e:
            print(f"Failed: {p.name} -> {e}")
    print(f"Done. Converted {converted} file(s).")
    return converted


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Convert .ARW files to .jpg')
    parser.add_argument('directory', nargs='?', default='.', help='Directory to scan for .ARW files')
    parser.add_argument('--overwrite', action='store_true', help='Overwrite existing .jpg files')
    args = parser.parse_args()
    target = Path(args.directory).resolve()
    if not target.exists() or not target.is_dir():
        print(f"Directory not found: {target}")
        sys.exit(2)
    convert_dir(target, overwrite=args.overwrite)
