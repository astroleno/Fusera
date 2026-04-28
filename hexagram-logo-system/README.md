# Hexagram Logo System

Deterministic first-pass logo system for the 64 hexagrams.

This workspace is intentionally separate from
[`reference/design/logo-generator-skill`](../reference/design/logo-generator-skill/README.md).
It borrows that skill's visual principles, but uses a structured,
repeatable pipeline so we can generate all 64 marks consistently.

## Goals

- Keep the folder structure clean and predictable
- Generate all 64 logos from canonical hexagram data
- Make the first pass deterministic and easy to iterate
- Export SVG first, then PNG, then a showcase page

## Structure

```text
hexagram-logo-system/
├── data/
│   └── hexagrams.json
├── output/
│   ├── png/
│   ├── showcase/
│   └── svg/
├── scripts/
  │   ├── build_contact_sheet.py
  │   ├── build_showcase.py
│   ├── build_trigram_contact_sheet.py
│   ├── build_trigram_showcase.py
│   ├── export_png_logos.py
│   ├── export_trigram_pngs.py
│   └── generate_svg_logos.py
│   └── generate_trigram_logos.py
├── src/
│   └── hexagram_logo_system/
│       ├── __init__.py
│       ├── catalog.py
│       ├── contact_sheet.py
│       ├── export.py
│       ├── generator.py
│       ├── trigrams.py
│       └── showcase.py
├── Makefile
└── requirements.txt
```

## Visual System

The current pass avoids directly drawing six Yao lines as the logo.
Instead it uses a semantic visual grammar:

- upper trigram contributes the atmosphere or force
- lower trigram contributes the vessel, terrain, or support
- selected hexagrams with strong named imagery get custom semantic motifs
- consistent whitespace and proportions keep the system logo-like instead of illustrative

This gives us a coherent starting system that is closer to the meaning of
the hexagrams and can still be refined later into stronger families,
alternates, or premium showcase renders.

## Usage

Generate SVGs and the HTML showcase:

```bash
python3 scripts/generate_svg_logos.py
python3 scripts/build_showcase.py
```

Set up a local virtual environment for PNG export:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/export_png_logos.py
```

Or use `make`:

```bash
make svg
make showcase
make setup
make png
make contact-sheet
make trigrams-svg
make trigrams-showcase
make trigrams-png
make trigrams-sheet
make all
```

## Notes

- SVG and HTML generation use the Python standard library only
- PNG export depends on `cairosvg`
- The output directory is part of the deliverable for review and iteration
