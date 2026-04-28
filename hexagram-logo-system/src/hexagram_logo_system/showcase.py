from __future__ import annotations

from pathlib import Path

from .catalog import load_hexagrams, project_root
from .motifs import motif_label


def build_showcase(output_path: Path | None = None) -> Path:
    root = project_root()
    target = output_path or (root / "output" / "showcase" / "index.html")
    target.parent.mkdir(parents=True, exist_ok=True)

    cards: list[str] = []
    for hexagram in load_hexagrams():
        svg_path = f"../svg/{hexagram['slug']}.svg"
        cards.append(
            f"""
      <article class="card">
        <div class="mark-frame">
          <img src="{svg_path}" alt="{hexagram['title_cn']}" loading="lazy" />
        </div>
        <div class="meta">
          <div class="index">{hexagram['index']:02d}</div>
          <h2>{hexagram['title_cn']}</h2>
          <p>{hexagram['short_name_cn']} · {hexagram['pinyin']}</p>
          <p>{motif_label(hexagram)} · {hexagram['upper_trigram_cn']}上 / {hexagram['lower_trigram_cn']}下</p>
        </div>
      </article>
"""
        )

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>64 卦 Logo System</title>
  <style>
    :root {{
      --bg: #f4f1ea;
      --panel: rgba(255, 255, 255, 0.82);
      --text: #111111;
      --muted: #5d5a54;
      --line: rgba(17, 17, 17, 0.09);
      --shadow: 0 24px 80px rgba(17, 17, 17, 0.08);
    }}

    * {{
      box-sizing: border-box;
    }}

    body {{
      margin: 0;
      font-family: "Times New Roman", "Songti SC", "Noto Serif SC", serif;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(198, 184, 159, 0.22), transparent 28%),
        radial-gradient(circle at bottom right, rgba(130, 145, 127, 0.14), transparent 24%),
        var(--bg);
    }}

    header {{
      padding: 72px 24px 28px;
      text-align: center;
    }}

    h1 {{
      margin: 0;
      font-size: clamp(38px, 8vw, 72px);
      font-weight: 500;
      letter-spacing: 0.08em;
    }}

    .subtitle {{
      margin: 14px auto 0;
      max-width: 760px;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.8;
    }}

    main {{
      max-width: 1440px;
      margin: 0 auto;
      padding: 20px 24px 72px;
    }}

    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
    }}

    .card {{
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-height: 320px;
      padding: 22px;
      border: 1px solid var(--line);
      border-radius: 24px;
      background: var(--panel);
      backdrop-filter: blur(20px);
      box-shadow: var(--shadow);
    }}

    .mark-frame {{
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.45));
      border: 1px solid rgba(17, 17, 17, 0.06);
    }}

    .mark-frame img {{
      width: 118px;
      height: 118px;
    }}

    .meta {{
      display: grid;
      gap: 6px;
    }}

    .index {{
      font-size: 12px;
      letter-spacing: 0.2em;
      color: var(--muted);
    }}

    h2 {{
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }}

    p {{
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }}
  </style>
</head>
<body>
  <header>
    <h1>六十四卦 Logo System</h1>
    <p class="subtitle">
      第一版采用可重复生成的几何线条系统，将六爻结构转化为统一、克制、可批量迭代的 logo 草案。
      这一步先解决系统一致性，再为后续精选款的高端视觉深化留接口。
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
