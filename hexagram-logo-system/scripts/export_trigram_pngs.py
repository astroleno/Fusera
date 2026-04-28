#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = PROJECT_ROOT / "src"
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))

from hexagram_logo_system.trigrams import export_trigram_png_directory  # noqa: E402


if __name__ == "__main__":
    result = export_trigram_png_directory()
    print(f"Exported {result['count']} trigram PNG logos in {result['output_dir']}")
