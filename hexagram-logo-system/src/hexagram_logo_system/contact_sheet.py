from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .catalog import load_hexagrams, project_root


CARD_SIZE = 240
PADDING = 20
LABEL_HEIGHT = 58
COLUMNS = 4
BACKGROUND = "#f4f1ea"
CARD_BG = "#ffffff"
TEXT = "#111111"
MUTED = "#6d6861"
LINE = "#e6e0d6"


def _load_font(size: int) -> ImageFont.ImageFont:
    for name in ("PingFang.ttc", "STHeiti Light.ttc", "Arial Unicode.ttf", "Arial.ttf"):
        try:
            return ImageFont.truetype(name, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def build_contact_sheet(output_path: Path | None = None) -> Path:
    root = project_root()
    target = output_path or (root / "output" / "showcase" / "contact-sheet.png")
    png_dir = root / "output" / "png"
    target.parent.mkdir(parents=True, exist_ok=True)

    hexagrams = load_hexagrams()
    rows = (len(hexagrams) + COLUMNS - 1) // COLUMNS
    canvas_width = (CARD_SIZE * COLUMNS) + (PADDING * (COLUMNS + 1))
    canvas_height = ((CARD_SIZE + LABEL_HEIGHT) * rows) + (PADDING * (rows + 1))

    image = Image.new("RGB", (canvas_width, canvas_height), BACKGROUND)
    draw = ImageDraw.Draw(image)
    title_font = _load_font(22)
    label_font = _load_font(18)
    meta_font = _load_font(13)

    for idx, hexagram in enumerate(hexagrams):
        row = idx // COLUMNS
        col = idx % COLUMNS

        x = PADDING + col * (CARD_SIZE + PADDING)
        y = PADDING + row * (CARD_SIZE + LABEL_HEIGHT + PADDING)

        draw.rounded_rectangle(
            (x, y, x + CARD_SIZE, y + CARD_SIZE + LABEL_HEIGHT),
            radius=18,
            fill=CARD_BG,
            outline=LINE,
            width=1,
        )

        png_path = png_dir / f"{hexagram['slug']}.png"
        mark = Image.open(png_path).convert("RGBA")
        mark.thumbnail((136, 136))
        mx = x + (CARD_SIZE - mark.width) // 2
        my = y + 28 + (CARD_SIZE - 56 - mark.height) // 2
        image.paste(mark, (mx, my), mark)

        label_y = y + CARD_SIZE + 10
        draw.text((x + 16, label_y), f"{hexagram['index']:02d}", fill=MUTED, font=meta_font)
        draw.text((x + 16, label_y + 14), hexagram["title_cn"], fill=TEXT, font=label_font)
        draw.text(
            (x + 16, label_y + 36),
            f"{hexagram['upper_trigram_cn']}上 / {hexagram['lower_trigram_cn']}下",
            fill=MUTED,
            font=meta_font,
        )

    draw.text((PADDING, 10), "六十四卦 Logo Contact Sheet", fill=TEXT, font=title_font)
    image.save(target)
    return target
