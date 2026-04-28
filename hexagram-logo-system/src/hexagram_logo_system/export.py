from __future__ import annotations

from pathlib import Path

from .catalog import load_hexagrams, project_root

try:
    import cairosvg
except ImportError:  # pragma: no cover - runtime dependency guard
    cairosvg = None


def export_png_directory(
    svg_dir: Path | None = None,
    png_dir: Path | None = None,
    width: int = 1024,
    height: int = 1024,
) -> dict:
    if cairosvg is None:
        raise RuntimeError(
            "cairosvg is not installed. Run `make setup` or install requirements first."
        )

    root = project_root()
    source_dir = svg_dir or (root / "output" / "svg")
    target_dir = png_dir or (root / "output" / "png")
    target_dir.mkdir(parents=True, exist_ok=True)

    exported = 0
    for hexagram in load_hexagrams():
        svg_path = source_dir / f"{hexagram['slug']}.svg"
        png_path = target_dir / f"{hexagram['slug']}.png"
        cairosvg.svg2png(
            url=str(svg_path),
            write_to=str(png_path),
            output_width=width,
            output_height=height,
        )
        exported += 1

    return {
        "count": exported,
        "output_dir": target_dir,
    }
