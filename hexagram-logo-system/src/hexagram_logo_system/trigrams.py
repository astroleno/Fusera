from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .catalog import project_root

try:
    import cairosvg
except ImportError:  # pragma: no cover - runtime dependency guard
    cairosvg = None


TRIGRAM_DATA_PATH = project_root() / "data" / "trigrams.json"


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


def _circle(cx: float, cy: float, r: float, **kwargs: object) -> str:
    return _tag("circle", cx=f"{cx:.2f}", cy=f"{cy:.2f}", r=f"{r:.2f}", **kwargs)


def _polygon(points: str, **kwargs: object) -> str:
    return _tag("polygon", points=points, **kwargs)


def _group(items: list[str], **kwargs: object) -> str:
    return f"<g {_attrs(**kwargs)}>\n    " + "\n    ".join(items) + "\n  </g>"


def _stroke(items: list[str], width: float = 5.0) -> str:
    return _group(
        items,
        fill="none",
        stroke="currentColor",
        stroke_width=f"{width:.2f}",
        stroke_linecap="round",
        stroke_linejoin="round",
    )


def _fill(items: list[str]) -> str:
    return _group(items, fill="currentColor")


def load_trigrams(path: Path | None = None) -> list[dict]:
    source = path or TRIGRAM_DATA_PATH
    with source.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _render_qian(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke(
                [
                    _path("M18 70 C26 24 74 24 82 70"),
                    _path("M28 64 C34 42 66 42 72 64"),
                    _path("M40 56 C44 48 56 48 60 56"),
                ],
                width=5.2,
            ),
            _fill([_circle(50, 23, 2.8)]),
        ]
    )


def _render_kun(_: dict) -> str:
    return "\n  ".join(
        [
            _fill(
                [
                    _path("M18 70 Q50 58 82 70 L82 78 Q50 88 18 78 Z"),
                    _path("M26 50 Q50 42 74 50 L74 58 Q50 66 26 58 Z"),
                    _path("M34 31 Q50 26 66 31 L66 38 Q50 43 34 38 Z"),
                ]
            )
        ]
    )


def _render_zhen(_: dict) -> str:
    return "\n  ".join(
        [
            _fill([_polygon("50,18 64,18 54,40 70,40 38,80 46,54 30,54")]),
            _stroke([_path("M28 72 Q50 84 72 72")], width=4.5),
        ]
    )


def _render_xun(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke(
                [
                    _path("M22 42 C34 22 60 22 78 38"),
                    _path("M18 58 C34 46 56 46 72 58"),
                    _path("M24 74 C38 66 54 66 66 74"),
                ],
                width=4.6,
            )
        ]
    )


def _render_kan(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke(
                [
                    _path("M50 18 C66 30 66 50 50 68 C34 50 34 30 50 18 Z"),
                    _path("M50 32 C58 40 58 52 50 60 C42 52 42 40 50 32 Z"),
                ],
                width=4.8,
            ),
            _fill([_circle(50, 46, 2.8)]),
        ]
    )


def _render_li(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke(
                [
                    _path("M50 18 L66 42 L50 78 L34 42 Z"),
                    _path("M50 30 L58 42 L50 56 L42 42 Z"),
                    _path("M22 44 H30"),
                    _path("M70 44 H78"),
                ],
                width=4.5,
            ),
            _fill([_circle(50, 42, 2.6)]),
        ]
    )


def _render_gen(_: dict) -> str:
    return "\n  ".join(
        [
            _fill([_polygon("22,72 42,44 50,54 58,38 78,72")]),
            _stroke([_path("M34 34 L50 20 L66 34"), _path("M50 20 V44")], width=4.6),
        ]
    )


def _render_dui(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke(
                [
                    _path("M30 32 H70"),
                    _path("M24 48 Q50 70 76 48"),
                    _path("M34 56 Q50 68 66 56"),
                ],
                width=4.6,
            )
        ]
    )


TRIGRAM_RENDERERS = {
    "qian": _render_qian,
    "kun": _render_kun,
    "zhen": _render_zhen,
    "xun": _render_xun,
    "kan": _render_kan,
    "li": _render_li,
    "gen": _render_gen,
    "dui": _render_dui,
}


def render_trigram_svg(trigram: dict) -> str:
    body = TRIGRAM_RENDERERS[trigram["key"]](trigram)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" color="#111111" role="img" aria-labelledby="{trigram['slug']}-title {trigram['slug']}-desc">
  <title id="{trigram['slug']}-title">{trigram['title_cn']}</title>
  <desc id="{trigram['slug']}-desc">{trigram['name_cn']} | {trigram['concept']}</desc>
  {body}
</svg>
"""


def generate_trigram_svg_directory(output_dir: Path | None = None) -> dict:
    root = project_root()
    target_dir = output_dir or (root / "output" / "trigrams" / "svg")
    target_dir.mkdir(parents=True, exist_ok=True)

    trigrams = load_trigrams()
    manifest: list[dict] = []
    for trigram in trigrams:
        svg = render_trigram_svg(trigram)
        svg_path = target_dir / f"{trigram['slug']}.svg"
        svg_path.write_text(svg, encoding="utf-8")
        manifest.append(
            {
                "key": trigram["key"],
                "slug": trigram["slug"],
                "title_cn": trigram["title_cn"],
                "name_cn": trigram["name_cn"],
                "pinyin": trigram["pinyin"],
                "element_cn": trigram["element_cn"],
                "signature": trigram["signature"],
                "concept": trigram["concept"],
                "svg_path": str(svg_path.relative_to(root)),
            }
        )

    manifest_path = root / "output" / "trigrams" / "manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return {"count": len(trigrams), "output_dir": target_dir, "manifest_path": manifest_path}


def export_trigram_png_directory(
    svg_dir: Path | None = None,
    png_dir: Path | None = None,
    width: int = 1024,
    height: int = 1024,
) -> dict:
    if cairosvg is None:
        raise RuntimeError("cairosvg is not installed. Run `make setup` first.")

    root = project_root()
    source_dir = svg_dir or (root / "output" / "trigrams" / "svg")
    target_dir = png_dir or (root / "output" / "trigrams" / "png")
    target_dir.mkdir(parents=True, exist_ok=True)

    count = 0
    for trigram in load_trigrams():
        svg_path = source_dir / f"{trigram['slug']}.svg"
        png_path = target_dir / f"{trigram['slug']}.png"
        cairosvg.svg2png(
            url=str(svg_path),
            write_to=str(png_path),
            output_width=width,
            output_height=height,
        )
        count += 1

    return {"count": count, "output_dir": target_dir}


def build_trigram_showcase(output_path: Path | None = None) -> Path:
    root = project_root()
    target = output_path or (root / "output" / "trigrams" / "showcase" / "index.html")
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
          <div class="eyebrow">{trigram['signature']} · {trigram['element_cn']}</div>
          <h2>{trigram['title_cn']}</h2>
          <p class="name">{trigram['name_cn']} · {trigram['pinyin']}</p>
          <p class="concept">{trigram['concept']}</p>
          <p class="rationale">{trigram['rationale']}</p>
        </div>
      </article>
"""
        )

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>八卦 Logo System</title>
  <style>
    :root {{
      --bg: #f5f1e8;
      --panel: rgba(255, 252, 246, 0.82);
      --ink: #121212;
      --muted: #655f57;
      --line: rgba(18, 18, 18, 0.09);
      --shadow: 0 24px 80px rgba(18, 18, 18, 0.08);
    }}
    * {{
      box-sizing: border-box;
    }}
    body {{
      margin: 0;
      color: var(--ink);
      font-family: "Iowan Old Style", "Palatino Linotype", "Songti SC", serif;
      background:
        radial-gradient(circle at 8% 12%, rgba(146, 129, 101, 0.14), transparent 28%),
        radial-gradient(circle at 90% 84%, rgba(90, 116, 132, 0.12), transparent 24%),
        var(--bg);
    }}
    header {{
      max-width: 1100px;
      margin: 0 auto;
      padding: 88px 24px 36px;
    }}
    .eyebrow {{
      font-size: 12px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }}
    h1 {{
      margin: 10px 0 14px;
      font-size: clamp(42px, 7vw, 78px);
      letter-spacing: 0.06em;
      font-weight: 500;
    }}
    .intro {{
      max-width: 760px;
      color: var(--muted);
      font-size: 16px;
      line-height: 1.9;
    }}
    main {{
      max-width: 1100px;
      margin: 0 auto;
      padding: 12px 24px 88px;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
    }}
    .card {{
      display: grid;
      gap: 18px;
      padding: 22px;
      border-radius: 26px;
      border: 1px solid var(--line);
      background: var(--panel);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }}
    .mark {{
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.52));
      border: 1px solid rgba(18,18,18,0.05);
    }}
    .mark img {{
      width: 128px;
      height: 128px;
    }}
    .meta {{
      display: grid;
      gap: 8px;
    }}
    .meta .eyebrow {{
      font-size: 11px;
    }}
    h2 {{
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }}
    .name {{
      margin: 0;
      font-size: 14px;
      color: var(--muted);
    }}
    .concept {{
      margin: 0;
      font-size: 14px;
      color: var(--ink);
    }}
    .rationale {{
      margin: 0;
      font-size: 14px;
      line-height: 1.8;
      color: var(--muted);
    }}
  </style>
</head>
<body>
  <header>
    <div class="eyebrow">Bagua Canonical Marks</div>
    <h1>八卦母体 Logo</h1>
    <p class="intro">
      这一轮先不扩六十四卦，而是把八卦做成八个可独立成立的母体标记。
      每个图形都尽量从卦意和自然意象出发，而不是把三爻直接画成符号。
      后续六十四卦会基于这八个母体继续组合、变体和精修。
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


def _load_font(size: int) -> ImageFont.ImageFont:
    for name in ("PingFang.ttc", "STHeiti Light.ttc", "Arial Unicode.ttf", "Arial.ttf"):
        try:
            return ImageFont.truetype(name, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def build_trigram_contact_sheet(output_path: Path | None = None) -> Path:
    root = project_root()
    target = output_path or (root / "output" / "trigrams" / "showcase" / "contact-sheet.png")
    png_dir = root / "output" / "trigrams" / "png"
    target.parent.mkdir(parents=True, exist_ok=True)

    trigrams = load_trigrams()
    columns = 4
    card_w = 280
    card_h = 340
    pad = 20
    rows = (len(trigrams) + columns - 1) // columns
    canvas = Image.new("RGB", ((card_w * columns) + pad * (columns + 1), (card_h * rows) + pad * (rows + 1)), "#f5f1e8")
    draw = ImageDraw.Draw(canvas)
    title_font = _load_font(28)
    label_font = _load_font(22)
    meta_font = _load_font(14)

    draw.text((pad, 8), "八卦 Canonical Marks", fill="#111111", font=title_font)

    for idx, trigram in enumerate(trigrams):
        row = idx // columns
        col = idx % columns
        x = pad + col * (card_w + pad)
        y = pad + row * (card_h + pad) + 28

        draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=22, fill="#fffdf8", outline="#e9e0d4", width=1)

        png_path = png_dir / f"{trigram['slug']}.png"
        mark = Image.open(png_path).convert("RGBA")
        mark.thumbnail((144, 144))
        mx = x + (card_w - mark.width) // 2
        my = y + 34
        canvas.paste(mark, (mx, my), mark)

        ty = y + 208
        draw.text((x + 18, ty), f"{trigram['signature']} · {trigram['element_cn']}", fill="#6a6359", font=meta_font)
        draw.text((x + 18, ty + 20), trigram["title_cn"], fill="#111111", font=label_font)
        draw.text((x + 18, ty + 50), trigram["concept"], fill="#4f4a44", font=meta_font)

    canvas.save(target)
    return target
