#!/usr/bin/env python3
"""Route a website/landing-page brief to the local prompt knowledge base.

Usage:
  python scripts/kb_router.py --brief "AI automation SaaS dark glass video hero" --top 6
  echo "金融科技 高级 暗色 视频背景" | python scripts/kb_router.py --top 5 --format json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

ALIASES: Dict[str, List[str]] = {
    # Industry
    "ai_saas": ["ai", "人工智能", "智能体", "agent", "automation", "自动化", "workflow", "工作流", "saas", "no-code", "无代码", "designer"],
    "agency_studio": ["agency", "studio", "creative", "design", "portfolio", "工作室", "设计", "创意", "作品集"],
    "finance_fintech": ["finance", "financial", "fintech", "invoice", "bank", "金融", "财务", "发票", "账单"],
    "cybersecurity_security": ["security", "cyber", "password", "encryption", "secure", "安全", "密码", "加密", "数据安全", "网络安全"],
    "real_estate_architecture": ["real estate", "property", "architecture", "地产", "房地产", "建筑", "空间"],
    "ecommerce_luxury": ["ecommerce", "commerce", "shop", "retail", "beauty", "skincare", "电商", "零售", "美妆", "护肤", "奢侈品"],
    "web3_nft": ["web3", "nft", "collectible", "crypto", "链", "藏品"],
    "energy_solar": ["solar", "energy", "clean energy", "光伏", "能源", "太阳能"],
    "logistics": ["logistics", "supply chain", "shipping", "物流", "供应链"],
    "agriculture_nature": ["farming", "agriculture", "nature", "botanical", "organic", "农业", "自然", "植物"],
    "art_museum_culture": ["art", "museum", "gallery", "editorial", "艺术", "博物馆", "画廊"],
    "space_futuristic": ["space", "cosmic", "stellar", "launch", "futuristic", "太空", "宇宙", "未来"],

    # Style
    "dark_cinematic": ["dark", "black", "cinematic", "moody", "premium", "暗色", "黑色", "电影感", "高级感"],
    "liquid_glass": ["glass", "glassmorphism", "liquid glass", "frosted", "blur", "毛玻璃", "液态玻璃", "玻璃拟态"],
    "luxury_minimal": ["luxury", "minimal", "premium", "high-end", "奢华", "极简", "高级"],
    "bold_typography": ["bold typography", "huge", "massive", "headline", "大标题", "强排版"],
    "gradient_glow": ["gradient", "glow", "neon", "orb", "渐变", "光晕", "霓虹"],
    "organic_nature": ["organic", "botanical", "nature", "green", "自然", "植物", "绿色"],
    "cosmic_space": ["cosmic", "space", "stellar", "orbit", "宇宙", "太空", "星球"],
    "clean_white": ["white", "clean", "minimal white", "白底", "干净", "留白"],
    "cyber_futuristic": ["cyber", "futuristic", "neural", "tech", "赛博", "科技感", "未来感"],
    "editorial_art": ["editorial", "serif", "museum", "gallery", "杂志", "艺术展"],

    # Interaction
    "video_background": ["video", "background video", "hls", "mux", "mp4", "视频", "视频背景"],
    "scroll_parallax": ["scroll", "parallax", "scroll-driven", "sticky", "scrub", "滚动", "视差", "吸顶"],
    "css_3d": ["3d", "perspective", "rotatex", "rotatey", "translatez", "立体", "透视"],
    "canvas_frame": ["canvas", "frame", "requestvideoframecallback", "帧", "画布"],
    "marquee": ["marquee", "ticker", "logo strip", "跑马灯", "滚动 logo"],
    "cursor_follow": ["cursor", "mouse", "pointer", "光标", "鼠标跟随"],
    "loader_animation": ["loader", "preloader", "loading", "加载动画"],
    "contact_form": ["contact", "form", "waitlist", "email", "联系", "表单", "留资", "预约"],
}

TAG_FIELDS = [
    "industry_tags",
    "style_tags",
    "interaction_tags",
    "stack_tags",
    "layout_tags",
    "asset_tags",
]

FIELD_WEIGHTS = {
    "industry_tags": 7,
    "style_tags": 5,
    "interaction_tags": 5,
    "layout_tags": 3,
    "stack_tags": 2,
    "asset_tags": 1,
}

QUALITY_BONUS = {
    "long_spec_or_code": 8,
    "high_detail_spec": 10,
    "usable_spec": 7,
    "thin_reference": 1,
    "stub_or_empty": -50,
}


TECH_SKILLS: Dict[str, Dict[str, Any]] = {
    "gsap-landing-motion": {
        "file": "skills/08-gsap-landing-motion/SKILL.md",
        "reason": "GSAP / ScrollTrigger / timeline / pin-scrub motion requested",
        "aliases": ["gsap", "greensock", "scrolltrigger", "scroll trigger", "splittext", "scrambletext", "morphsvg", "flip", "scrollsmoother", "timeline", "pin", "scrub", "吸顶动效", "滚动驱动"],
    },
    "threejs-landing-visuals": {
        "file": "skills/09-threejs-landing-visuals/SKILL.md",
        "reason": "Real Three.js / WebGL / GLB / shader / 3D model requested",
        "aliases": ["three.js", "threejs", "three js", "webgl", "glb", "gltf", "shader", "particle", "particles", "3d model", "3d 模型", "真实 3d", "webgl 背景", "产品模型", "r3f", "react three fiber"],
    },
}



def normalize(text: str) -> str:
    return text.lower().replace("_", " ").replace("-", " ")


def contains_alias(text_norm: str, alias: str) -> bool:
    a = normalize(alias)
    if not a:
        return False
    if re.search(r"[\u4e00-\u9fff]", a) or any(ch in a for ch in [" ", "/", ".", "#", "@"]):
        return a in text_norm
    if re.fullmatch(r"[a-z0-9]+", a):
        return re.search(rf"(?<![a-z0-9]){re.escape(a)}(?![a-z0-9])", text_norm) is not None
    return a in text_norm


def tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+|[\u4e00-\u9fff]+", normalize(text))


def load_inventory(root: Path) -> List[Dict[str, Any]]:
    path = root / "kb" / "prompt_inventory.json"
    if not path.exists():
        raise FileNotFoundError(f"Cannot find inventory: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    return data["prompts"]


def query_alias_hits(query: str) -> List[str]:
    q = normalize(query)
    hits = []
    for tag, aliases in ALIASES.items():
        if any(contains_alias(q, alias) for alias in aliases):
            hits.append(tag)
    return hits



def recommend_tech_skills(query: str) -> List[Dict[str, str]]:
    q = normalize(query)
    selected: List[Dict[str, str]] = []
    hit_names: set[str] = set()
    for name, cfg in TECH_SKILLS.items():
        if any(contains_alias(q, alias) for alias in cfg["aliases"]):
            hit_names.add(name)
            selected.append({"name": name, "file": cfg["file"], "reason": cfg["reason"]})
    if {"gsap-landing-motion", "threejs-landing-visuals"}.issubset(hit_names):
        selected.append({
            "name": "gsap-threejs-composer",
            "file": "skills/10-gsap-threejs-composer/SKILL.md",
            "reason": "Both GSAP and Three.js are requested; coordinate timeline, render loop, cleanup, and fallbacks",
        })
    return selected

def score_item(query: str, item: Dict[str, Any], alias_hits: Iterable[str]) -> Tuple[float, List[str]]:
    q = normalize(query)
    q_tokens = set(tokens(query))
    alias_hits = set(alias_hits)
    score = 0.0
    reasons: List[str] = []

    # Quality baseline.
    quality = item.get("quality", "")
    score += QUALITY_BONUS.get(quality, 0)
    if quality == "stub_or_empty":
        reasons.append("downranked: stub_or_empty")

    # Exact ID/title match can rescue a stub when explicitly requested.
    title = normalize(item.get("title", ""))
    filename = normalize(item.get("filename", ""))
    item_id = str(item.get("id", ""))
    if item_id and re.search(rf"\b{re.escape(item_id)}\b", q):
        score += 40
        reasons.append(f"explicit id match {item_id}")
    title_tokens = set(tokens(item.get("title", "")))
    overlap = q_tokens & title_tokens
    if overlap:
        bump = 3 * len(overlap)
        score += bump
        reasons.append("title overlap: " + ", ".join(sorted(overlap)[:5]))
    if title and title in q:
        score += 20
        reasons.append("exact title phrase")
    if filename and filename in q:
        score += 20
        reasons.append("filename phrase")

    # Tag/alias matching.
    for field in TAG_FIELDS:
        weight = FIELD_WEIGHTS.get(field, 1)
        tags = set(item.get(field, []))
        matched = sorted(tags & alias_hits)
        if matched:
            score += weight * len(matched)
            reasons.append(f"{field}: " + ", ".join(matched))
        # direct tag words in query
        direct = []
        for tag in tags:
            tag_phrase = tag.replace("_", " ")
            if tag in q or tag_phrase in q:
                direct.append(tag)
        if direct:
            score += (weight + 1) * len(set(direct))
            reasons.append(f"direct {field}: " + ", ".join(sorted(set(direct))))

    # General content hints from summary.
    summary = normalize(item.get("summary", ""))
    for tok in q_tokens:
        if len(tok) >= 4 and tok in summary:
            score += 0.5

    # If request needs rich implementation, penalize thin references unless exact match.
    rich_need = any(x in alias_hits for x in ["video_background", "scroll_parallax", "css_3d", "contact_form"])
    if rich_need and quality in {"thin_reference", "stub_or_empty"} and not ("explicit id" in " ".join(reasons) or "exact title" in " ".join(reasons)):
        score -= 8

    return score, reasons[:8]


def route(query: str, root: Path, top: int) -> List[Dict[str, Any]]:
    inventory = load_inventory(root)
    hits = query_alias_hits(query)
    scored = []
    for item in inventory:
        score, reasons = score_item(query, item, hits)
        if score > -20:
            scored.append((score, item, reasons))
    scored.sort(key=lambda x: (x[0], x[1].get("chars", 0)), reverse=True)
    results = []
    for score, item, reasons in scored[:top]:
        results.append({
            "score": round(score, 2),
            "id": item["id"],
            "title": item["title"],
            "file": item["file"],
            "quality": item["quality"],
            "summary": item.get("summary", ""),
            "industry_tags": item.get("industry_tags", []),
            "style_tags": item.get("style_tags", []),
            "interaction_tags": item.get("interaction_tags", []),
            "stack_tags": item.get("stack_tags", []),
            "layout_tags": item.get("layout_tags", []),
            "reasons": reasons,
        })
    return results


def print_markdown(query: str, results: List[Dict[str, Any]], tech_skills: List[Dict[str, str]] | None = None) -> None:
    print("# KB Route Results")
    print()
    print(f"Brief: {query}")
    print()
    if tech_skills:
        print("## Recommended technical skills")
        print()
        for s in tech_skills:
            print(f"- `{s['name']}` — `{s['file']}`: {s['reason']}")
        print()
    if not results:
        print("No candidates found.")
        return
    print("## Recommended references")
    print()
    for idx, r in enumerate(results, 1):
        role = "Primary candidate" if idx == 1 and r["quality"] != "stub_or_empty" else "Supporting candidate"
        print(f"### {idx}. {r['id']} — {r['title']} ({role})")
        print()
        print(f"- Score: {r['score']}")
        print(f"- Quality: `{r['quality']}`")
        print(f"- File: `{r['file']}`")
        print(f"- Summary: {r['summary']}")
        tags = r["industry_tags"][:3] + r["style_tags"][:3] + r["interaction_tags"][:3]
        if tags:
            print("- Tags: " + ", ".join(f"`{t}`" for t in tags))
        if r["reasons"]:
            print("- Why: " + "; ".join(r["reasons"]))
        print()
    print("## Next step")
    print()
    print("Open the primary prompt plus 1–3 supporting prompts, extract patterns, then create a Route Card and SITE_SPEC.")


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Route a landing-page brief to prompt KB candidates.")
    parser.add_argument("--brief", "-b", default="", help="Brief text. If omitted, stdin is used.")
    parser.add_argument("--top", "-n", type=int, default=6, help="Number of candidates to return.")
    parser.add_argument("--format", "-f", choices=["markdown", "json"], default="markdown")
    parser.add_argument("--root", default=None, help="Package root. Defaults to parent of scripts/.")
    args = parser.parse_args(argv)

    brief = args.brief.strip() or sys.stdin.read().strip()
    if not brief:
        print("Error: provide --brief or stdin text.", file=sys.stderr)
        return 2

    root = Path(args.root).resolve() if args.root else Path(__file__).resolve().parents[1]
    results = route(brief, root, args.top)
    tech_skills = recommend_tech_skills(brief)
    if args.format == "json":
        print(json.dumps({"brief": brief, "tech_skills": tech_skills, "results": results}, ensure_ascii=False, indent=2))
    else:
        print_markdown(brief, results, tech_skills)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
