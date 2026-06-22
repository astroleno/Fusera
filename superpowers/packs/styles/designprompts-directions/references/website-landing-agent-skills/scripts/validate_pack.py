#!/usr/bin/env python3
"""Basic validation for the website landing skills bundle."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    errors = []
    skills = sorted((ROOT / "skills").glob("*/SKILL.md"))
    if not skills:
        errors.append("No SKILL.md files found")
    for skill in skills:
        txt = skill.read_text(encoding="utf-8")
        if not txt.startswith("---") or "description:" not in txt:
            errors.append(f"Bad skill front matter: {skill}")
        for rel in referenced_local_paths(txt):
            if "/" not in rel and not (skill.parent / rel).exists():
                continue
            if not resolve_reference(skill.parent, rel).exists():
                errors.append(f"Missing skill reference from {skill}: {rel}")

    patterns = sorted((ROOT / "kb" / "patterns").glob("*.md"))
    if len([p for p in patterns if p.name != "README.md"]) < 8:
        errors.append("Expected at least 8 pattern recipe files in kb/patterns")

    inv_path = ROOT / "kb" / "prompt_inventory.json"
    if not inv_path.exists():
        errors.append("Missing kb/prompt_inventory.json")
    else:
        data = json.loads(inv_path.read_text(encoding="utf-8"))
        prompts = data.get("prompts", [])
        if data.get("prompt_count") and data.get("prompt_count") != len(prompts):
            errors.append("prompt_inventory prompt_count does not match prompts length")
        for item in data.get("prompts", []):
            if not (ROOT / item["file"]).exists():
                errors.append(f"Missing prompt file: {item['file']}")
        summary_path = ROOT / "kb" / "generation_summary.json"
        if summary_path.exists():
            summary = json.loads(summary_path.read_text(encoding="utf-8"))
            quality_counts: dict[str, int] = {}
            for item in prompts:
                quality = item.get("quality", "")
                quality_counts[quality] = quality_counts.get(quality, 0) + 1
            if summary.get("prompt_count") != len(prompts):
                errors.append("generation_summary prompt_count does not match inventory")
            if summary.get("skills_count") != len(skills):
                errors.append("generation_summary skills_count does not match actual skills")
            if summary.get("quality_counts") != quality_counts:
                errors.append("generation_summary quality_counts do not match inventory")
            if summary.get("patterns_count") != len([p for p in patterns if p.name != "README.md"]):
                errors.append("generation_summary patterns_count does not match kb/patterns")

    try:
        out = subprocess.check_output([
            sys.executable,
            str(ROOT / "scripts" / "kb_router.py"),
            "--brief",
            "AI SaaS dark video landing",
            "--top",
            "3",
        ], text=True)
        if "KB Route Results" not in out:
            errors.append("Router script did not produce expected markdown")
        if "stub_or_empty" in first_candidate_block(out):
            errors.append("Router selected stub_or_empty as the primary rich-query candidate")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"Router script failed: {exc}")
    if errors:
        print("Validation failed:")
        for e in errors:
            print("-", e)
        return 1
    print(f"OK: {len(skills)} skills, inventory and router validated.")
    return 0


def referenced_local_paths(text: str) -> list[str]:
    """Return local markdown paths explicitly named in References sections."""
    paths: list[str] = []
    for raw in text.replace("`", "").split():
        token = raw.strip(",;:()[]")
        if (
            token.endswith(".md")
            and not token.startswith("http")
            and "<" not in token
            and ">" not in token
            and "..." not in token
        ):
            paths.append(token)
    return paths


def resolve_reference(skill_dir: Path, rel: str) -> Path:
    local_candidate = (skill_dir / rel).resolve()
    if local_candidate.exists():
        return local_candidate
    if "/" not in rel:
        return local_candidate
    if rel.startswith(("kb/", "skills/", "templates/", "examples/", "vendor/")):
        return ROOT / rel
    return (skill_dir / rel).resolve()


def first_candidate_block(markdown: str) -> str:
    marker = "### 1."
    start = markdown.find(marker)
    if start < 0:
        return ""
    next_marker = markdown.find("\n### 2.", start + len(marker))
    if next_marker < 0:
        return markdown[start:]
    return markdown[start:next_marker]


if __name__ == "__main__":
    raise SystemExit(main())
