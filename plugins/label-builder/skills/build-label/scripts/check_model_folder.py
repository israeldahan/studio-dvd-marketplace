#!/usr/bin/env python3
"""Checks a new-label folder before building: die-line, details file, required fields,
forbidden words, barcode, and files that look open in Illustrator.

Usage: check_model_folder.py <model_folder> [--client bond]
Required fields come from assets/model-details-template.txt (the "חובה" section);
forbidden words from assets/clients/<client>/forbidden-words.txt. No label text lives here.
"""
import argparse
import pathlib
import sys

SKILL = pathlib.Path(__file__).resolve().parent.parent
DETAILS_NAME = "פרטי דגם.txt"


def read_pairs(path):
    pairs = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.lstrip().startswith("#") or ":" not in line:
            continue
        key, val = line.split(":", 1)
        pairs[key.strip()] = val.strip()
    return pairs


def required_fields():
    fields, in_required = [], False
    for line in (SKILL / "assets" / "model-details-template.txt").read_text(encoding="utf-8").splitlines():
        if line.startswith("# ---"):
            in_required = "חובה" in line
        elif in_required and ":" in line and not line.startswith("#"):
            fields.append(line.split(":", 1)[0].strip())
    return fields


def forbidden_words(client):
    path = SKILL / "assets" / "clients" / client / "forbidden-words.txt"
    if not path.exists():
        return []
    return [w.strip() for w in path.read_text(encoding="utf-8").splitlines() if w.strip() and not w.startswith("#")]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder")
    ap.add_argument("--client", default="bond")
    args = ap.parse_args()
    folder = pathlib.Path(args.folder)
    problems, notes = [], []

    pdfs = sorted(p.name for p in folder.glob("*.pdf"))
    if not pdfs:
        problems.append("אין קובץ שבלונה (PDF) בתיקייה")
    elif len(pdfs) > 1:
        notes.append("יש כמה קובצי PDF, צריך לוודא איזה מהם השבלונה: " + ", ".join(pdfs))
    else:
        notes.append("שבלונה: " + pdfs[0])

    details = folder / DETAILS_NAME
    pairs = {}
    if not details.exists():
        problems.append(f"חסר הקובץ {DETAILS_NAME} (להעתיק מ-assets/model-details-template.txt)")
    else:
        pairs = read_pairs(details)
        for field in required_fields():
            if not pairs.get(field):
                problems.append(f"שדה חובה ריק: {field}")
        text = details.read_text(encoding="utf-8").lower()
        for word in forbidden_words(args.client):
            if word.lower() in text:
                problems.append(f"מילה אסורה ב-{DETAILS_NAME}: {word}")

    model = pairs.get("דגם", "").strip()
    if model:
        candidates = list(folder.glob(f"barcode_{model}.*")) + list((folder.parent / "ברקודים").glob(f"barcode_{model}.*"))
        if candidates:
            notes.append("ברקוד: " + ", ".join(str(c) for c in candidates))
        else:
            problems.append(f"לא נמצא barcode_{model}.* בתיקייה או ב-../ברקודים")

    tmps = [p.name for p in folder.glob("~ai-*.tmp")]
    if tmps:
        notes.append("יש קובצי ~ai-*.tmp, כלומר קובץ פתוח ב-Illustrator או קובץ שנפל. לא נוגעים בהם.")

    for n in notes:
        print("info:", n)
    for p in problems:
        print("חסר/בעיה:", p)
    print("OK" if not problems else f"{len(problems)} בעיות")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
