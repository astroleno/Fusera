from __future__ import annotations

import json
from pathlib import Path

from .catalog import load_hexagrams, project_root
from .motifs import motif_label, render_mark


CANVAS_SIZE = 100


def render_hexagram_svg(hexagram: dict) -> str:
    body = render_mark(hexagram)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_SIZE} {CANVAS_SIZE}" fill="none" color="#111111" role="img" aria-labelledby="{hexagram['slug']}-title {hexagram['slug']}-desc">
  <title id="{hexagram['slug']}-title">{hexagram['index']:02d} {hexagram['title_cn']}</title>
  <desc id="{hexagram['slug']}-desc">{hexagram['short_name_cn']} | {motif_label(hexagram)} | {hexagram['upper_trigram_cn']} over {hexagram['lower_trigram_cn']}</desc>
  {body}
</svg>
"""


def generate_svg_directory(output_dir: Path | None = None) -> dict:
    root = project_root()
    target_dir = output_dir or (root / "output" / "svg")
    target_dir.mkdir(parents=True, exist_ok=True)

    hexagrams = load_hexagrams()
    manifest: list[dict] = []

    for hexagram in hexagrams:
        svg = render_hexagram_svg(hexagram)
        svg_path = target_dir / f"{hexagram['slug']}.svg"
        svg_path.write_text(svg, encoding="utf-8")

        manifest.append(
            {
                "index": hexagram["index"],
                "slug": hexagram["slug"],
                "title_cn": hexagram["title_cn"],
                "short_name_cn": hexagram["short_name_cn"],
                "pinyin": hexagram["pinyin"],
                "line_signature": hexagram["line_signature"],
                "upper_trigram": hexagram["upper_trigram"],
                "lower_trigram": hexagram["lower_trigram"],
                "motif_label": motif_label(hexagram),
                "svg_path": str(svg_path.relative_to(root)),
            }
        )

    manifest_path = root / "output" / "hexagrams.manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    return {
        "count": len(hexagrams),
        "manifest_path": manifest_path,
        "output_dir": target_dir,
    }
