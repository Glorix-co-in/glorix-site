# Image assets

- Convert new raster images to AVIF before referencing or committing them to the site. AVIF is the default image format for this project.
- Use `uv run scripts/convert_events_to_avif_and_update_refs.py --assets-root <asset-folder> --quality 50 --dry-run` first, then rerun without `--dry-run`. ImageMagick's `magick` command must be available; see `scripts/magick_convert_avif.txt` for the direct command.
- If AVIF is unsuitable or the original format must remain in use, ask the user before proceeding.
