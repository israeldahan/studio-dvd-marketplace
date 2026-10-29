#!/bin/bash
# Renders a die-line PDF to PNG with sips (pdftoppm/fitz are not installed on this Mac).
# Usage: render_pdf.sh <file.pdf> <out_dir> [max_pixels=4000]
set -euo pipefail
if [ $# -lt 2 ]; then echo "usage: render_pdf.sh <file.pdf> <out_dir> [max_pixels]" >&2; exit 1; fi
mkdir -p "$2"
OUT="$2/$(basename "${1%.*}").png"
sips -s format png -Z "${3:-4000}" "$1" --out "$OUT" >/dev/null
echo "$OUT"
