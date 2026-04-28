from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJECT_ROOT / "data" / "hexagrams.json"


@dataclass(frozen=True)
class Trigram:
    key: str
    name_cn: str
    element_cn: str
    lines_bottom_to_top: tuple[int, int, int]
    width_profile: tuple[int, int, int]
    shift_profile: tuple[int, int, int]


TRIGRAMS = {
    "qian": Trigram("qian", "乾", "天", (1, 1, 1), (52, 56, 60), (0, 0, 0)),
    "kun": Trigram("kun", "坤", "地", (0, 0, 0), (60, 56, 52), (0, 0, 0)),
    "zhen": Trigram("zhen", "震", "雷", (1, 0, 0), (58, 50, 42), (-5, -1, 3)),
    "xun": Trigram("xun", "巽", "风", (0, 1, 1), (42, 50, 58), (3, -1, -5)),
    "kan": Trigram("kan", "坎", "水", (0, 1, 0), (46, 60, 46), (-3, 0, -3)),
    "li": Trigram("li", "离", "火", (1, 0, 1), (60, 46, 60), (3, 0, 3)),
    "gen": Trigram("gen", "艮", "山", (0, 0, 1), (44, 50, 60), (-6, -3, 0)),
    "dui": Trigram("dui", "兑", "泽", (1, 1, 0), (60, 50, 44), (0, 3, 6)),
}


def project_root() -> Path:
    return PROJECT_ROOT


def load_hexagrams(path: Path | None = None) -> list[dict]:
    source = path or DATA_PATH
    with source.open("r", encoding="utf-8") as handle:
        raw = json.load(handle)

    hexagrams: list[dict] = []
    for item in raw:
        lower = TRIGRAMS[item["lower_trigram"]]
        upper = TRIGRAMS[item["upper_trigram"]]
        lines = list(lower.lines_bottom_to_top + upper.lines_bottom_to_top)

        enriched = {
            **item,
            "lower_trigram_cn": lower.name_cn,
            "upper_trigram_cn": upper.name_cn,
            "lower_element_cn": lower.element_cn,
            "upper_element_cn": upper.element_cn,
            "lines_bottom_to_top": lines,
            "line_signature": "".join(str(bit) for bit in reversed(lines)),
        }
        hexagrams.append(enriched)

    return hexagrams


def iter_hexagrams(path: Path | None = None) -> Iterable[dict]:
    return load_hexagrams(path)
