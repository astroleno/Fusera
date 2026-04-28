from __future__ import annotations

import json
from pathlib import Path

from .catalog import project_root
from .trigrams import load_trigrams

try:
    import cairosvg
except ImportError:  # pragma: no cover
    cairosvg = None


def _attrs(**kwargs: object) -> str:
    attrs: list[str] = []
    for key, value in kwargs.items():
        if value is None:
            continue
        attrs.append(f'{key.replace("_", "-")}="{value}"')
    return " ".join(attrs)


def _tag(name: str, **kwargs: object) -> str:
    return f"<{name} {_attrs(**kwargs)} />"


def _path(d: str, **kwargs: object) -> str:
    return _tag("path", d=d, **kwargs)


def _circle(cx: float, cy: float, r: float, **kwargs: object) -> str:
    return _tag("circle", cx=f"{cx:.2f}", cy=f"{cy:.2f}", r=f"{r:.2f}", **kwargs)


def _rect(x: float, y: float, width: float, height: float, rx: float, **kwargs: object) -> str:
    return _tag(
        "rect",
        x=f"{x:.2f}",
        y=f"{y:.2f}",
        width=f"{width:.2f}",
        height=f"{height:.2f}",
        rx=f"{rx:.2f}",
        **kwargs,
    )


def _ellipse(cx: float, cy: float, rx: float, ry: float, **kwargs: object) -> str:
    return _tag("ellipse", cx=f"{cx:.2f}", cy=f"{cy:.2f}", rx=f"{rx:.2f}", ry=f"{ry:.2f}", **kwargs)


def _polygon(points: str, **kwargs: object) -> str:
    return _tag("polygon", points=points, **kwargs)


def _group(items: list[str], **kwargs: object) -> str:
    return f"<g {_attrs(**kwargs)}>\n    " + "\n    ".join(items) + "\n  </g>"


def _stroke(items: list[str], width: float = 4.8, opacity: float | None = None) -> str:
    return _group(
        items,
        fill="none",
        stroke="currentColor",
        stroke_width=f"{width:.2f}",
        stroke_linecap="round",
        stroke_linejoin="round",
        opacity=None if opacity is None else f"{opacity:.2f}",
    )


def _fill(items: list[str], opacity: float | None = None) -> str:
    return _group(items, fill="currentColor", opacity=None if opacity is None else f"{opacity:.2f}")


TASTE_LABELS = {
    "qian": "vaulted arc",
    "kun": "stacked ground",
    "zhen": "rupture",
    "xun": "drift bands",
    "kan": "inner void",
    "li": "radiant core",
    "gen": "sealed peak",
    "dui": "open basin",
}


def _render_qian() -> str:
    return "\n  ".join(
        [
            _stroke([_path("M18 68 C25 30 75 30 82 68")], width=5.2),
        ]
    )


def _render_kun() -> str:
    return "\n  ".join(
        [
            _stroke([
                _path("M26 62 H74"),
                _path("M34 42 H66"),
            ], width=6.4)
        ]
    )


def _render_zhen() -> str:
    return "\n  ".join(
        [
            _stroke([_path("M56 20 L44 46 H58 L46 80")], width=6.0),
        ]
    )


def _render_xun() -> str:
    return "\n  ".join(
        [
            _stroke([
                _path("M22 40 C36 26 58 26 78 38"),
                _path("M24 62 C38 52 56 52 72 60"),
            ], width=4.1)
        ]
    )


def _render_kan() -> str:
    return "\n  ".join(
        [
            _stroke([_path("M50 18 C64 30 66 52 50 80 C34 52 36 30 50 18 Z")], width=4.8),
        ]
    )


def _render_li() -> str:
    return "\n  ".join(
        [
            _stroke([_path("M50 18 L64 42 L50 80 L36 42 Z")], width=4.8),
        ]
    )


def _render_gen() -> str:
    return "\n  ".join(
        [
            _stroke([_path("M24 74 L40 48 L50 58 L60 42 L76 74")], width=5.8),
        ]
    )


def _render_dui() -> str:
    return "\n  ".join(
        [
            _stroke([
                _path("M32 34 H68"),
                _path("M24 48 Q50 68 76 48"),
            ], width=4.6),
        ]
    )


RENDERERS = {
    "qian": _render_qian,
    "kun": _render_kun,
    "zhen": _render_zhen,
    "xun": _render_xun,
    "kan": _render_kan,
    "li": _render_li,
    "gen": _render_gen,
    "dui": _render_dui,
}


def render_taste_svg(trigram: dict) -> str:
    body = RENDERERS[trigram["key"]]()
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" color="#121212" role="img" aria-labelledby="{trigram['slug']}-taste-title {trigram['slug']}-taste-desc">
  <title id="{trigram['slug']}-taste-title">{trigram['title_cn']} · taste</title>
  <desc id="{trigram['slug']}-taste-desc">{trigram['name_cn']} | {TASTE_LABELS[trigram['key']]} | {trigram['concept']}</desc>
  {body}
</svg>
"""


def generate_taste_svg_directory(output_dir: Path | None = None) -> dict:
    root = project_root()
    target_dir = output_dir or (root / "output" / "trigram-taste" / "svg")
    target_dir.mkdir(parents=True, exist_ok=True)

    manifest: list[dict] = []
    for trigram in load_trigrams():
        svg = render_taste_svg(trigram)
        svg_path = target_dir / f"{trigram['slug']}.svg"
        svg_path.write_text(svg, encoding="utf-8")
        manifest.append(
            {
                "key": trigram["key"],
                "slug": trigram["slug"],
                "title_cn": trigram["title_cn"],
                "name_cn": trigram["name_cn"],
                "concept": trigram["concept"],
                "taste_label": TASTE_LABELS[trigram["key"]],
                "svg_path": str(svg_path.relative_to(root)),
            }
        )

    manifest_path = root / "output" / "trigram-taste" / "manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"count": len(manifest), "output_dir": target_dir, "manifest_path": manifest_path}


def export_taste_png_directory(
    svg_dir: Path | None = None,
    png_dir: Path | None = None,
    width: int = 1024,
    height: int = 1024,
) -> dict:
    if cairosvg is None:
        raise RuntimeError("cairosvg is not installed. Run `make setup` first.")
    root = project_root()
    source_dir = svg_dir or (root / "output" / "trigram-taste" / "svg")
    target_dir = png_dir or (root / "output" / "trigram-taste" / "png")
    target_dir.mkdir(parents=True, exist_ok=True)

    count = 0
    for trigram in load_trigrams():
        svg_path = source_dir / f"{trigram['slug']}.svg"
        png_path = target_dir / f"{trigram['slug']}.png"
        cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), output_width=width, output_height=height)
        count += 1
    return {"count": count, "output_dir": target_dir}


def build_taste_showcase(output_path: Path | None = None) -> Path:
    root = project_root()
    target = output_path or (root / "output" / "trigram-taste" / "showcase" / "index.html")
    target.parent.mkdir(parents=True, exist_ok=True)

    cards: list[str] = []
    for trigram in load_trigrams():
        cards.append(
            f"""
      <article class="card">
        <div class="mark">
          <img src="../svg/{trigram['slug']}.svg" alt="{trigram['title_cn']}" loading="lazy" />
        </div>
        <div class="meta">
          <div class="sig">{trigram['signature']} · {trigram['element_cn']}</div>
          <h2>{trigram['title_cn']}</h2>
          <p class="tag">{TASTE_LABELS[trigram['key']]}</p>
        </div>
      </article>
"""
        )

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>八卦 Taste Pass</title>
  <style>
    :root {{
      --bg: #f7f6f3;
      --panel: #ffffff;
      --ink: #111111;
      --muted: #787774;
      --line: #eaeaea;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      color: var(--ink);
      font-family: "SF Pro Display", "Geist Sans", "Helvetica Neue", sans-serif;
      background: var(--bg);
    }}
    header {{
      max-width: 1260px;
      margin: 0 auto;
      padding: 96px 32px 48px;
    }}
    .eyebrow {{
      color: var(--muted);
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }}
    h1 {{
      margin: 10px 0 14px;
      font-size: clamp(40px, 6vw, 64px);
      line-height: 1;
      letter-spacing: -0.04em;
      font-weight: 600;
      max-width: 9ch;
      text-wrap: balance;
    }}
    .intro {{
      max-width: 40ch;
      color: var(--muted);
      line-height: 1.7;
      font-size: 14px;
    }}
    main {{
      max-width: 1260px;
      margin: 0 auto;
      padding: 0 32px 112px;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 22px;
    }}
    .card {{
      border: 1px solid var(--line);
      border-radius: 18px;
      background: var(--panel);
      padding: 32px 32px 28px;
      display: grid;
      gap: 16px;
    }}
    .mark {{
      height: 260px;
      display: grid;
      place-items: center;
      padding-bottom: 8px;
    }}
    .mark img {{
      width: 94px;
      height: 94px;
    }}
    .meta {{
      display: grid;
      gap: 6px;
    }}
    .sig {{
      color: var(--muted);
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }}
    h2 {{
      margin: 0;
      font-size: 22px;
      letter-spacing: -0.03em;
      font-weight: 600;
    }}
    .tag {{
      margin: 0;
      color: var(--muted);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }}
    @media (max-width: 1100px) {{
      .grid {{ grid-template-columns: 1fr; }}
    }}
    @media (max-width: 680px) {{
      .grid {{ grid-template-columns: 1fr; }}
      h1 {{ max-width: none; }}
      header {{ padding: 72px 22px 36px; }}
      main {{ padding: 0 22px 80px; }}
      .card {{ padding: 24px; }}
      .mark {{ height: 220px; }}
    }}
  </style>
</head>
<body>
  <header>
    <div class="eyebrow">Taste-skill aligned pass</div>
    <h1>Bagua marks, reduced further.</h1>
    <p class="intro">
      这次直接统一成单笔触家族。每个卦只保留最少的骨架关系，
      让区别来自轮廓，而不是来自装饰。
    </p>
  </header>
  <main>
    <section class="grid">
      {''.join(cards)}
    </section>
  </main>
</body>
</html>
"""
    target.write_text(html, encoding="utf-8")
    return target
