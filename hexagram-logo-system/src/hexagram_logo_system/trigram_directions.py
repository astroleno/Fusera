from __future__ import annotations

import json
from pathlib import Path

from .trigrams import load_trigrams
from .catalog import project_root

try:
    import cairosvg
except ImportError:  # pragma: no cover
    cairosvg = None


DIRECTIONS = [
    {
        "key": "minimal",
        "title": "Minimal Geometric",
        "summary": "纯几何、低元素数、强负空间，适合做主品牌母体。",
    },
    {
        "key": "dot",
        "title": "Dot Matrix",
        "summary": "点阵与圆角模块，偏数字系统感，适合做图标与组件语言。",
    },
    {
        "key": "line",
        "title": "Line System",
        "summary": "线系与节奏结构，偏科技、界面、信号与秩序感。",
    },
]


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


def _polygon(points: str, **kwargs: object) -> str:
    return _tag("polygon", points=points, **kwargs)


def _group(items: list[str], **kwargs: object) -> str:
    return f"<g {_attrs(**kwargs)}>\n    " + "\n    ".join(items) + "\n  </g>"


def _stroke(items: list[str], width: float = 4.6, opacity: float | None = None) -> str:
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


def _defs(items: list[str]) -> str:
    return "<defs>\n    " + "\n    ".join(items) + "\n  </defs>"


def _use(href: str, x: float, y: float, **kwargs: object) -> str:
    return _tag("use", href=href, x=f"{x:.2f}", y=f"{y:.2f}", **kwargs)


def _render_minimal_qian() -> str:
    return "\n  ".join([
        _stroke([_path("M18 68 C24 26 76 26 82 68"), _path("M30 58 C36 40 64 40 70 58")], width=5.4),
        _fill([_circle(50, 24, 3.2)]),
    ])


def _render_minimal_kun() -> str:
    return "\n  ".join([
        _fill([
            _rect(22, 64, 56, 10, 5),
            _rect(28, 48, 44, 9, 4.5),
            _rect(36, 34, 28, 8, 4),
        ])
    ])


def _render_minimal_zhen() -> str:
    return "\n  ".join([
        _fill([_polygon("50,18 62,18 54,38 68,38 40,80 46,56 34,56")]),
        _stroke([_path("M28 72 Q50 82 72 72")], width=4.4),
    ])


def _render_minimal_xun() -> str:
    return "\n  ".join([
        _stroke([
            _path("M20 40 C36 22 60 22 78 36"),
            _path("M22 58 C36 46 58 46 74 58"),
            _path("M28 74 C40 66 56 66 68 74"),
        ], width=4.4)
    ])


def _render_minimal_kan() -> str:
    return "\n  ".join([
        _stroke([
            _path("M50 18 C66 30 66 52 50 78 C34 52 34 30 50 18 Z"),
            _path("M50 34 C58 42 58 56 50 66 C42 56 42 42 50 34 Z"),
        ], width=4.6),
        _fill([_circle(50, 50, 2.8)]),
    ])


def _render_minimal_li() -> str:
    return "\n  ".join([
        _stroke([
            _path("M50 18 L66 42 L50 78 L34 42 Z"),
            _path("M50 32 L58 44 L50 58 L42 44 Z"),
        ], width=4.6),
        _fill([_circle(50, 44, 2.8)]),
    ])


def _render_minimal_gen() -> str:
    return "\n  ".join([
        _fill([_polygon("22,74 40,48 50,58 60,42 78,74")]),
        _stroke([_path("M34 34 L50 20 L66 34")], width=4.6),
    ])


def _render_minimal_dui() -> str:
    return "\n  ".join([
        _stroke([_path("M30 34 H70"), _path("M24 50 Q50 70 76 50")], width=4.6),
    ])


def _render_dot_qian() -> str:
    return "\n  ".join([
        _fill([
            _circle(50, 22, 2.8),
            _circle(40, 34, 2.8), _circle(50, 32, 3.2), _circle(60, 34, 2.8),
            _circle(34, 46, 3.0), _circle(42, 42, 2.8), _circle(50, 40, 3.0), _circle(58, 42, 2.8), _circle(66, 46, 3.0),
            _circle(28, 58, 3.2), _circle(38, 54, 3.0), _circle(50, 52, 3.6), _circle(62, 54, 3.0), _circle(72, 58, 3.2),
        ])
    ])


def _render_dot_kun() -> str:
    rows = [
        [44, 36, 12],
        [36, 48, 28],
        [28, 60, 44],
    ]
    items: list[str] = []
    for start_x, y, width in rows:
        step = 8
        count = int(width / step) + 1
        for idx in range(count):
            items.append(_rect(start_x + idx * step, y, 6, 6, 2.8))
    return "\n  ".join([_fill(items)])


def _render_dot_zhen() -> str:
    return "\n  ".join([
        _fill([
            _circle(50, 24, 2.8),
            _circle(54, 32, 3.0),
            _circle(48, 40, 3.0),
            _circle(58, 48, 3.2),
            _circle(44, 58, 3.2),
            _circle(52, 66, 3.4),
            _circle(40, 74, 3.4),
        ]),
        _fill([_rect(24, 70, 52, 6, 3)], opacity=0.9),
    ])


def _render_dot_xun() -> str:
    capsules = [
        (28, 34, 12, -18),
        (40, 30, 16, -10),
        (58, 30, 14, 4),
        (24, 52, 14, -12),
        (40, 50, 18, 0),
        (60, 52, 12, 14),
        (34, 68, 16, 10),
        (54, 68, 14, 18),
    ]
    items = [
        _rect(x, y, w, 5.6, 2.8, transform=f"rotate({angle}, {x + w / 2:.2f}, {y + 2.8:.2f})")
        for x, y, w, angle in capsules
    ]
    return "\n  ".join([_fill(items)])


def _render_dot_kan() -> str:
    return "\n  ".join([
        _fill([
            _circle(50, 22, 3.0),
            _circle(44, 32, 3.0), _circle(56, 32, 3.0),
            _circle(40, 44, 3.2), _circle(50, 42, 3.2), _circle(60, 44, 3.2),
            _circle(42, 58, 3.2), _circle(58, 58, 3.2),
            _circle(46, 70, 3.4), _circle(54, 70, 3.4),
            _circle(50, 80, 3.2),
        ])
    ])


def _render_dot_li() -> str:
    return "\n  ".join([
        _fill([
            _circle(50, 22, 3.0),
            _circle(44, 34, 3.0), _circle(56, 34, 3.0),
            _circle(38, 46, 3.2), _circle(50, 42, 3.4), _circle(62, 46, 3.2),
            _circle(42, 58, 3.0), _circle(58, 58, 3.0),
            _circle(46, 70, 2.8), _circle(54, 70, 2.8),
        ]),
        _fill([_circle(50, 54, 4.2)], opacity=0.15),
    ])


def _render_dot_gen() -> str:
    coords = [(50, 26), (44, 38), (56, 38), (38, 50), (50, 50), (62, 50), (30, 64), (42, 64), (54, 64), (66, 64)]
    return "\n  ".join([_fill([_circle(x, y, 3.2 if y < 60 else 3.6) for x, y in coords])])


def _render_dot_dui() -> str:
    return "\n  ".join([
        _fill([
            _circle(36, 36, 3.0), _circle(50, 34, 3.4), _circle(64, 36, 3.0),
            _circle(30, 50, 3.0), _circle(40, 58, 3.2), _circle(50, 62, 3.4), _circle(60, 58, 3.2), _circle(70, 50, 3.0),
        ])
    ])


def _render_line_qian() -> str:
    return "\n  ".join([
        _stroke([_path("M18 68 C24 28 76 28 82 68"), _path("M22 60 C28 34 72 34 78 60"), _path("M30 50 C36 38 64 38 70 50")], width=3.6),
        _fill([_circle(50, 22, 2.8)]),
    ])


def _render_line_kun() -> str:
    return "\n  ".join([
        _stroke([_path("M24 36 H76"), _path("M20 46 H80"), _path("M18 56 H82"), _path("M20 66 H80"), _path("M24 76 H76")], width=3.4)
    ])


def _render_line_zhen() -> str:
    return "\n  ".join([
        _stroke([_path("M50 22 V74"), _path("M36 38 L50 52"), _path("M64 38 L50 52"), _path("M28 66 Q50 82 72 66")], width=3.8),
        _fill([_circle(50, 52, 3.0)]),
    ])


def _render_line_xun() -> str:
    return "\n  ".join([
        _stroke([
            _path("M20 40 C34 26 56 26 76 40"),
            _path("M24 52 C38 42 58 42 72 52"),
            _path("M28 64 C42 58 58 58 68 64"),
            _path("M32 76 C44 72 56 72 64 76"),
        ], width=3.6)
    ])


def _render_line_kan() -> str:
    return "\n  ".join([
        _stroke([
            _path("M50 20 C60 28 66 42 64 56 C62 68 56 76 50 82 C44 76 38 68 36 56 C34 42 40 28 50 20 Z"),
            _path("M42 46 C46 40 54 40 58 46"),
            _path("M40 58 C46 64 54 64 60 58"),
        ], width=3.8)
    ])


def _render_line_li() -> str:
    return "\n  ".join([
        _stroke([
            _path("M50 18 L64 42 L50 78 L36 42 Z"),
            _path("M50 28 L56 40 L50 52 L44 40 Z"),
            _path("M24 48 H34"),
            _path("M66 48 H76"),
        ], width=3.8),
        _fill([_circle(50, 40, 2.6)]),
    ])


def _render_line_gen() -> str:
    return "\n  ".join([
        _stroke([
            _path("M22 76 H78"),
            _path("M30 66 H70"),
            _path("M38 56 H62"),
            _path("M50 22 L72 48"),
            _path("M50 22 L28 48"),
        ], width=3.6)
    ])


def _render_line_dui() -> str:
    return "\n  ".join([
        _stroke([
            _path("M28 32 H72"),
            _path("M24 48 Q50 68 76 48"),
            _path("M30 58 Q50 74 70 58"),
            _path("M36 68 Q50 78 64 68"),
        ], width=3.6)
    ])


STYLE_RENDERERS = {
    "minimal": {
        "qian": _render_minimal_qian,
        "kun": _render_minimal_kun,
        "zhen": _render_minimal_zhen,
        "xun": _render_minimal_xun,
        "kan": _render_minimal_kan,
        "li": _render_minimal_li,
        "gen": _render_minimal_gen,
        "dui": _render_minimal_dui,
    },
    "dot": {
        "qian": _render_dot_qian,
        "kun": _render_dot_kun,
        "zhen": _render_dot_zhen,
        "xun": _render_dot_xun,
        "kan": _render_dot_kan,
        "li": _render_dot_li,
        "gen": _render_dot_gen,
        "dui": _render_dot_dui,
    },
    "line": {
        "qian": _render_line_qian,
        "kun": _render_line_kun,
        "zhen": _render_line_zhen,
        "xun": _render_line_xun,
        "kan": _render_line_kan,
        "li": _render_line_li,
        "gen": _render_line_gen,
        "dui": _render_line_dui,
    },
}


def render_direction_svg(trigram: dict, direction_key: str) -> str:
    body = STYLE_RENDERERS[direction_key][trigram["key"]]()
    title = f"{trigram['title_cn']} · {direction_key}"
    desc = f"{trigram['name_cn']} | {trigram['concept']} | {direction_key}"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" color="#111111" role="img" aria-labelledby="{trigram['slug']}-{direction_key}-title {trigram['slug']}-{direction_key}-desc">
  <title id="{trigram['slug']}-{direction_key}-title">{title}</title>
  <desc id="{trigram['slug']}-{direction_key}-desc">{desc}</desc>
  {body}
</svg>
"""


def generate_direction_svg_directory(output_root: Path | None = None) -> dict:
    root = project_root()
    base_dir = output_root or (root / "output" / "trigram-directions")
    base_dir.mkdir(parents=True, exist_ok=True)
    trigrams = load_trigrams()
    manifest: list[dict] = []

    for direction in DIRECTIONS:
        style_dir = base_dir / direction["key"] / "svg"
        style_dir.mkdir(parents=True, exist_ok=True)
        for trigram in trigrams:
            svg = render_direction_svg(trigram, direction["key"])
            svg_path = style_dir / f"{trigram['slug']}.svg"
            svg_path.write_text(svg, encoding="utf-8")
            manifest.append(
                {
                    "direction": direction["key"],
                    "direction_title": direction["title"],
                    "slug": trigram["slug"],
                    "key": trigram["key"],
                    "title_cn": trigram["title_cn"],
                    "name_cn": trigram["name_cn"],
                    "concept": trigram["concept"],
                    "svg_path": str(svg_path.relative_to(root)),
                }
            )

    manifest_path = base_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"count": len(manifest), "output_dir": base_dir, "manifest_path": manifest_path}


def export_direction_png_directory(output_root: Path | None = None, width: int = 1024, height: int = 1024) -> dict:
    if cairosvg is None:
        raise RuntimeError("cairosvg is not installed. Run `make setup` first.")
    root = project_root()
    base_dir = output_root or (root / "output" / "trigram-directions")
    count = 0
    for direction in DIRECTIONS:
        svg_dir = base_dir / direction["key"] / "svg"
        png_dir = base_dir / direction["key"] / "png"
        png_dir.mkdir(parents=True, exist_ok=True)
        for trigram in load_trigrams():
            svg_path = svg_dir / f"{trigram['slug']}.svg"
            png_path = png_dir / f"{trigram['slug']}.png"
            cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), output_width=width, output_height=height)
            count += 1
    return {"count": count, "output_dir": base_dir}


def build_direction_showcase(output_path: Path | None = None) -> Path:
    root = project_root()
    target = output_path or (root / "output" / "trigram-directions" / "showcase" / "index.html")
    target.parent.mkdir(parents=True, exist_ok=True)
    trigrams = load_trigrams()

    columns = []
    for direction in DIRECTIONS:
        cards = []
        for trigram in trigrams:
            cards.append(
                f"""
          <article class="card">
            <div class="mark"><img src="../{direction['key']}/svg/{trigram['slug']}.svg" alt="{trigram['title_cn']} {direction['title']}" loading="lazy" /></div>
            <div class="meta">
              <div class="sig">{trigram['signature']} · {trigram['element_cn']}</div>
              <h3>{trigram['name_cn']}</h3>
              <p>{trigram['concept']}</p>
            </div>
          </article>
"""
            )
        columns.append(
            f"""
        <section class="column">
          <header class="column-head">
            <h2>{direction['title']}</h2>
            <p>{direction['summary']}</p>
          </header>
          <div class="stack">
            {''.join(cards)}
          </div>
        </section>
"""
        )

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>八卦现代风格方向</title>
  <style>
    :root {{
      --bg: #f6f2ea;
      --panel: rgba(255,255,255,0.78);
      --ink: #141414;
      --muted: #666158;
      --line: rgba(20,20,20,0.08);
      --shadow: 0 20px 70px rgba(20,20,20,0.08);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      color: var(--ink);
      font-family: "Iowan Old Style", "Palatino Linotype", "Songti SC", serif;
      background:
        radial-gradient(circle at 10% 14%, rgba(172, 150, 113, 0.12), transparent 28%),
        radial-gradient(circle at 90% 80%, rgba(100, 122, 145, 0.10), transparent 26%),
        var(--bg);
    }}
    header.page {{
      max-width: 1480px;
      margin: 0 auto;
      padding: 72px 28px 24px;
    }}
    .eyebrow {{
      font-size: 12px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--muted);
    }}
    h1 {{
      margin: 12px 0 16px;
      font-size: clamp(40px, 6vw, 72px);
      letter-spacing: 0.04em;
      font-weight: 500;
    }}
    .intro {{
      max-width: 780px;
      color: var(--muted);
      line-height: 1.85;
      font-size: 16px;
    }}
    main {{
      max-width: 1480px;
      margin: 0 auto;
      padding: 0 28px 80px;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(3, minmax(300px, 1fr));
      gap: 18px;
      align-items: start;
    }}
    .column {{
      display: grid;
      gap: 16px;
    }}
    .column-head {{
      padding: 22px;
      border: 1px solid var(--line);
      border-radius: 24px;
      background: var(--panel);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }}
    .column-head h2 {{
      margin: 0 0 10px;
      font-size: 28px;
      font-weight: 600;
    }}
    .column-head p {{
      margin: 0;
      color: var(--muted);
      line-height: 1.8;
      font-size: 14px;
    }}
    .stack {{
      display: grid;
      gap: 14px;
    }}
    .card {{
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 14px;
      align-items: center;
      padding: 16px;
      border-radius: 22px;
      border: 1px solid var(--line);
      background: var(--panel);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }}
    .mark {{
      display: grid;
      place-items: center;
      height: 112px;
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.55));
      border: 1px solid rgba(20,20,20,0.05);
    }}
    .mark img {{
      width: 76px;
      height: 76px;
    }}
    .meta {{
      display: grid;
      gap: 6px;
    }}
    .sig {{
      font-size: 11px;
      letter-spacing: 0.16em;
      color: var(--muted);
    }}
    h3 {{
      margin: 0;
      font-size: 22px;
      font-weight: 600;
    }}
    .meta p {{
      margin: 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--muted);
    }}
    @media (max-width: 1180px) {{
      .grid {{
        grid-template-columns: 1fr;
      }}
    }}
  </style>
</head>
<body>
  <header class="page">
    <div class="eyebrow">Style Directions from logo-generator-skill patterns</div>
    <h1>八卦现代风格提案</h1>
    <p class="intro">
      这轮不再把八卦做成“卦义插画”，而是严格往现代 logo 语言上靠。
      我按参考 skill 里的三条高频路径先做出方向稿：纯几何极简、点阵模块、线系结构。
      这更接近品牌系统和数字产品图标，而不是符号转写。
    </p>
  </header>
  <main>
    <div class="grid">
      {''.join(columns)}
    </div>
  </main>
</body>
</html>
"""
    target.write_text(html, encoding="utf-8")
    return target
