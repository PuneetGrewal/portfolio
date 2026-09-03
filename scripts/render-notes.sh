#!/usr/bin/env bash
#
# Renders every PDF in public/notes to page images in public/note-previews,
# which is what the notes page displays instead of an embedded PDF viewer.
# Run this after adding or replacing a note; the images are committed.
#
#   ./scripts/render-notes.sh
#
# Needs poppler (pdftoppm, pdfinfo) and ImageMagick (magick):
#   brew install poppler imagemagick
#
# Writes, per note, using a slug of the file name that lib/notes.ts recomputes:
#   <slug>-p<n>.png    one per page, 150 DPI, shown in the lightbox
#   <slug>-thumb.png   page one at 640px, shown on the card
#
# Notes are quantised to 64 colours. These are pen-on-paper renders with small
# palettes, so it is visually lossless and roughly a third of the size.

set -euo pipefail

cd "$(dirname "$0")/.."

notes_dir="public/notes"
out_dir="public/note-previews"

for tool in pdftoppm pdfinfo magick; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "error: $tool not found. brew install poppler imagemagick" >&2
    exit 1
  fi
done

mkdir -p "$out_dir"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

shopt -s nullglob
for pdf in "$notes_dir"/*.pdf; do
  base="$(basename "$pdf")"
  slug="$(echo "$base" \
    | sed -E 's/\.pdf$//I' \
    | sed -E 's/[^a-zA-Z0-9]+/-/g; s/^-+|-+$//g' \
    | tr 'A-Z' 'a-z')"
  pages="$(pdfinfo "$pdf" | awk '/^Pages:/{print $2}')"

  for page in $(seq 1 "$pages"); do
    pdftoppm -png -r 150 -f "$page" -l "$page" -singlefile "$pdf" "$tmp/raw"
    magick "$tmp/raw.png" -colors 64 -strip "$out_dir/${slug}-p${page}.png"
  done

  pdftoppm -png -r 150 -f 1 -l 1 -singlefile "$pdf" "$tmp/raw"
  magick "$tmp/raw.png" -resize 640x -colors 64 -strip "$out_dir/${slug}-thumb.png"

  printf '%-36s %s page(s)\n' "$slug" "$pages"
done

echo
echo "wrote $(ls -1 "$out_dir" | wc -l | tr -d ' ') files to $out_dir"
