# Router Protocol

## 1. Normalize the brief

Convert the user's request into this normalized shape:

```yaml
business:
  industry:
  product:
  primary_audience:
  conversion_goal:
visual:
  mood:
  color_mode:
  typography:
  reference_keywords:
motion:
  video_background: true|false
  scroll_parallax: true|false
  css_3d: true|false
  cursor_or_loader: true|false
scope:
  page_type: hero_only|single_page|multi_section
  required_sections: []
implementation:
  stack:
  forbidden_dependencies:
  asset_policy:
```

## 2. Candidate retrieval

Use `kb/route_index.yaml` for high-level candidate pools. Then open `kb/prompt_inventory.json` and sort by:

1. matching industry tags,
2. matching visual style tags,
3. matching interaction tags,
4. non-stub quality,
5. implementation compatibility.

## 3. Reference composition

A route should usually combine references like this:

```yaml
primary_prompt: same industry or same page structure
visual_prompt: same mood / typography / color system
motion_prompt: same interaction pattern
fallback_prompt: simpler high-quality prompt to stabilize implementation
```

Never combine more than four prompt references unless the user explicitly asks for an exploration matrix.

## 4. Extraction discipline

For each selected prompt, extract only:

- section/layout pattern,
- visual tokens,
- motion recipe,
- media/font handling,
- reusable component idea.

Do not copy brand names, URLs, claims, or exact copy unless the user asked for recreation.
