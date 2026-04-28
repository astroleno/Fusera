from __future__ import annotations


def _attrs(**kwargs: object) -> str:
    attrs: list[str] = []
    for key, value in kwargs.items():
        if value is None:
            continue
        html_key = key.replace("_", "-")
        attrs.append(f'{html_key}="{value}"')
    return " ".join(attrs)


def _tag(name: str, **kwargs: object) -> str:
    return f"<{name} {_attrs(**kwargs)} />"


def _path(d: str, **kwargs: object) -> str:
    return _tag("path", d=d, **kwargs)


def _rect(x: float, y: float, width: float, height: float, rx: float, **kwargs: object) -> str:
    return _tag("rect", x=f"{x:.2f}", y=f"{y:.2f}", width=f"{width:.2f}", height=f"{height:.2f}", rx=f"{rx:.2f}", **kwargs)


def _circle(cx: float, cy: float, r: float, **kwargs: object) -> str:
    return _tag("circle", cx=f"{cx:.2f}", cy=f"{cy:.2f}", r=f"{r:.2f}", **kwargs)


def _ellipse(cx: float, cy: float, rx: float, ry: float, **kwargs: object) -> str:
    return _tag("ellipse", cx=f"{cx:.2f}", cy=f"{cy:.2f}", rx=f"{rx:.2f}", ry=f"{ry:.2f}", **kwargs)


def _polygon(points: str, **kwargs: object) -> str:
    return _tag("polygon", points=points, **kwargs)


def _group(items: list[str], **kwargs: object) -> str:
    return f"<g {_attrs(**kwargs)}>\n    " + "\n    ".join(items) + "\n  </g>"


def _stroke(items: list[str], width: float = 5.5) -> str:
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


def _motif_qian(role: str) -> list[str]:
    if role == "upper":
        return [
            _stroke(
                [
                    _path("M24 42 C31 19 69 19 76 42"),
                    _path("M34 49 C40 39 60 39 66 49"),
                ]
            ),
            _fill([_circle(50, 26, 3.2)]),
        ]
    return [_stroke([_path("M24 58 C31 81 69 81 76 58")])]


def _motif_kun(role: str) -> list[str]:
    if role == "upper":
        return [_fill([_rect(20, 22, 60, 10, 5), _rect(28, 38, 44, 8, 4)])]
    return [_fill([_rect(18, 62, 64, 11, 5.5), _rect(28, 77, 44, 7, 3.5)])]


def _motif_zhen(role: str) -> list[str]:
    if role == "upper":
        bolt = "48,16 60,16 52,34 66,34 40,60 46,42 34,42"
    else:
        bolt = "48,38 60,38 52,56 66,56 40,84 46,64 34,64"
    return [_fill([_polygon(bolt)])]


def _motif_xun(role: str) -> list[str]:
    if role == "upper":
        return [
            _stroke(
                [
                    _path("M24 34 C36 18 56 18 74 34"),
                    _path("M30 48 C42 34 58 34 70 48"),
                ]
            )
        ]
    return [
        _stroke(
            [
                _path("M26 68 C40 54 60 54 76 68"),
                _path("M22 82 C38 70 58 70 70 82"),
            ]
        )
    ]


def _motif_kan(role: str) -> list[str]:
    if role == "upper":
        return [
            _stroke([_path("M50 18 C63 28 64 46 50 58 C36 46 37 28 50 18 Z")]),
            _fill([_circle(50, 42, 3.5)]),
        ]
    return [
        _stroke([_path("M50 42 C63 52 64 70 50 82 C36 70 37 52 50 42 Z")]),
        _fill([_circle(50, 66, 3.5)]),
    ]


def _motif_li(role: str) -> list[str]:
    if role == "upper":
        return [
            _stroke([_path("M50 18 L68 38 L50 58 L32 38 Z")]),
            _fill([_circle(50, 38, 3.5)]),
        ]
    return [
        _stroke([_path("M50 42 L68 62 L50 82 L32 62 Z")]),
        _fill([_circle(50, 62, 3.5)]),
    ]


def _motif_gen(role: str) -> list[str]:
    if role == "upper":
        return [_fill([_polygon("28,48 50,18 72,48"), _rect(30, 48, 40, 6, 3)])]
    return [_fill([_polygon("26,78 50,46 74,78"), _rect(30, 78, 40, 6, 3)])]


def _motif_dui(role: str) -> list[str]:
    if role == "upper":
        return [_stroke([_path("M28 36 Q50 54 72 36"), _path("M34 28 H66")])]
    return [_stroke([_path("M28 64 Q50 82 72 64"), _path("M34 56 H66")])]


TRIGRAM_MARKS = {
    "qian": _motif_qian,
    "kun": _motif_kun,
    "zhen": _motif_zhen,
    "xun": _motif_xun,
    "kan": _motif_kan,
    "li": _motif_li,
    "gen": _motif_gen,
    "dui": _motif_dui,
}


THEME_LABELS = {
    "01-qian": "天印",
    "02-kun": "地势",
    "03-tun": "萌芽",
    "04-meng": "蒙泉",
    "11-tai": "通门",
    "12-pi": "闭门",
    "24-fu": "回环",
    "27-yi": "养口",
    "29-kan": "重渊",
    "30-li": "明焰",
    "37-jia-ren": "家火",
    "48-jing": "井眼",
    "50-ding": "鼎器",
    "52-gen": "山门",
    "55-feng": "丰芒",
    "56-lu-travel": "旅灯",
    "61-zhong-fu": "内信",
    "63-ji-ji": "已渡",
    "64-wei-ji": "未渡",
}


def _center_piece(hexagram: dict) -> list[str]:
    upper = hexagram["upper_trigram"]
    lower = hexagram["lower_trigram"]
    if upper == lower:
        if upper in {"qian", "dui"}:
            return [_fill([_circle(50, 50, 4.2)])]
        if upper in {"kun", "gen"}:
            return [_fill([_rect(44, 46, 12, 8, 4)])]
        if upper in {"kan", "li"}:
            return [_stroke([_ellipse(50, 50, 9, 6)])]
        return [_fill([_polygon("50,44 56,50 50,56 44,50")])]
    if {upper, lower} == {"qian", "kun"}:
        return [_fill([_rect(47, 44, 6, 12, 3)])]
    if {upper, lower} == {"kan", "li"}:
        return [_fill([_circle(50, 50, 3.2)])]
    return [_fill([_circle(50, 50, 2.8)])]


def _default_mark(hexagram: dict) -> str:
    pieces: list[str] = []
    pieces.extend(TRIGRAM_MARKS[hexagram["upper_trigram"]]("upper"))
    pieces.extend(TRIGRAM_MARKS[hexagram["lower_trigram"]]("lower"))
    pieces.extend(_center_piece(hexagram))
    return "\n  ".join(pieces)


def _mark_qian(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M20 60 C28 24 72 24 80 60"), _path("M30 68 C36 44 64 44 70 68")]),
            _fill([_circle(50, 28, 3.2), _circle(50, 72, 3.2)]),
        ]
    )


def _mark_kun(_: dict) -> str:
    return "\n  ".join(
        [
            _fill([
                _rect(20, 60, 60, 12, 6),
                _rect(28, 42, 44, 10, 5),
                _rect(36, 24, 28, 8, 4),
            ])
        ]
    )


def _mark_tun(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M50 18 C62 28 62 44 50 54 C38 44 38 28 50 18 Z")]),
            _fill([
                _path("M50 72 C40 69 34 62 34 54 C42 56 48 60 50 66 C52 60 58 56 66 54 C66 62 60 69 50 72 Z", fill="currentColor"),
                _rect(47, 60, 6, 16, 3),
            ]),
        ]
    )


def _mark_meng(_: dict) -> str:
    return "\n  ".join(
        [
            _fill([_polygon("26,62 50,24 74,62")]),
            _stroke([_path("M50 38 C57 44 57 54 50 60 C43 54 43 44 50 38 Z")], width=4.5),
        ]
    )


def _mark_tai(_: dict) -> str:
    return "\n  ".join(
        [
            _fill([_rect(24, 66, 12, 16, 5), _rect(64, 66, 12, 16, 5)]),
            _stroke([_path("M30 48 H70"), _path("M36 32 C42 22 58 22 64 32")]),
        ]
    )


def _mark_pi(_: dict) -> str:
    return "\n  ".join(
        [
            _fill([_rect(24, 62, 12, 20, 5), _rect(64, 62, 12, 20, 5), _rect(38, 48, 24, 10, 5)]),
            _stroke([_path("M28 30 H72")]),
        ]
    )


def _mark_fu(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M72 48 C72 28 56 20 42 24 C28 28 22 42 24 54 C26 68 38 78 52 78")]),
            _fill([_path("M46 70 L58 64 L56 78 Z", fill="currentColor"), _circle(38, 34, 3.2)]),
        ]
    )


def _mark_yi(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M28 34 Q50 16 72 34"), _path("M28 66 Q50 84 72 66")]),
            _fill([_rect(30, 44, 40, 12, 6)]),
        ]
    )


def _mark_kan(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M50 16 C66 28 66 48 50 60 C34 48 34 28 50 16 Z"), _path("M50 40 C60 48 60 62 50 74 C40 62 40 48 50 40 Z")]),
            _fill([_circle(50, 50, 3.2)]),
        ]
    )


def _mark_li(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M50 16 L70 40 L50 64 L30 40 Z"), _path("M50 36 L62 50 L50 64 L38 50 Z")]),
            _fill([_circle(50, 40, 3.4)]),
        ]
    )


def _mark_jia_ren(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M24 44 L50 22 L76 44")]),
            _fill([_rect(32, 44, 36, 24, 8), _circle(50, 56, 4)]),
            _stroke([_path("M50 68 V78")], width=4.5),
        ]
    )


def _mark_jing(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_rect(28, 24, 44, 44, 10), _path("M50 20 V72"), _path("M24 46 H76")], width=4.8),
            _fill([_circle(50, 46, 4)]),
        ]
    )


def _mark_ding(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M32 30 H68"), _path("M36 34 V44"), _path("M64 34 V44"), _path("M30 46 Q50 70 70 46")]),
            _fill([_rect(34, 42, 32, 18, 8), _rect(36, 62, 6, 14, 3), _rect(58, 62, 6, 14, 3), _rect(47, 62, 6, 18, 3)]),
        ]
    )


def _mark_gen(_: dict) -> str:
    return "\n  ".join(
        [
            _fill([_polygon("24,70 40,46 50,58 60,42 76,70")]),
            _stroke([_path("M36 34 C42 26 58 26 64 34")], width=4.8),
        ]
    )


def _mark_feng(_: dict) -> str:
    return "\n  ".join(
        [
            _fill([_circle(50, 50, 8)]),
            _stroke([
                _path("M50 18 V30"),
                _path("M50 70 V82"),
                _path("M18 50 H30"),
                _path("M70 50 H82"),
                _path("M28 28 L36 36"),
                _path("M64 64 L72 72"),
                _path("M28 72 L36 64"),
                _path("M64 36 L72 28"),
            ])
        ]
    )


def _mark_lu_travel(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M40 28 H60"), _path("M34 34 Q50 18 66 34")]),
            _fill([_rect(38, 36, 24, 28, 10), _circle(50, 50, 4), _rect(47, 64, 6, 14, 3)]),
        ]
    )


def _mark_zhong_fu(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_ellipse(50, 50, 26, 18), _ellipse(50, 50, 12, 20)]),
            _fill([_circle(50, 50, 3.5)]),
        ]
    )


def _mark_ji_ji(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M24 62 C34 54 44 54 50 62 C56 54 66 54 76 62"), _path("M28 48 L42 36 L58 36 L72 48")]),
            _fill([_rect(46, 36, 8, 26, 4)]),
        ]
    )


def _mark_wei_ji(_: dict) -> str:
    return "\n  ".join(
        [
            _stroke([_path("M24 62 C34 54 44 54 50 62 C56 54 66 54 76 62"), _path("M28 48 L42 36"), _path("M58 36 L72 48")]),
            _fill([_circle(50, 44, 3.5)]),
        ]
    )


SPECIAL_MARKS = {
    "01-qian": _mark_qian,
    "02-kun": _mark_kun,
    "03-tun": _mark_tun,
    "04-meng": _mark_meng,
    "11-tai": _mark_tai,
    "12-pi": _mark_pi,
    "24-fu": _mark_fu,
    "27-yi": _mark_yi,
    "29-kan": _mark_kan,
    "30-li": _mark_li,
    "37-jia-ren": _mark_jia_ren,
    "48-jing": _mark_jing,
    "50-ding": _mark_ding,
    "52-gen": _mark_gen,
    "55-feng": _mark_feng,
    "56-lu-travel": _mark_lu_travel,
    "61-zhong-fu": _mark_zhong_fu,
    "63-ji-ji": _mark_ji_ji,
    "64-wei-ji": _mark_wei_ji,
}


def motif_label(hexagram: dict) -> str:
    slug = hexagram["slug"]
    if slug in THEME_LABELS:
        return THEME_LABELS[slug]
    return f"{hexagram['upper_element_cn']}气 / {hexagram['lower_element_cn']}形"


def render_mark(hexagram: dict) -> str:
    renderer = SPECIAL_MARKS.get(hexagram["slug"], _default_mark)
    return renderer(hexagram)
