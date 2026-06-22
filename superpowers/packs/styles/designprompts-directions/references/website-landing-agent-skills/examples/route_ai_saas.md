# Example: AI SaaS dark video landing

Brief:

> 做一个 AI workflow SaaS 落地页，暗色、高级、视频背景、滚动动效，首屏要有 waitlist CTA。

CLI:

```bash
python scripts/kb_router.py --brief "AI workflow SaaS dark premium video background scroll waitlist" --top 6
```

Expected route logic:

- Industry: `ai_saas`
- Visual: `dark_cinematic`, `liquid_glass` or `gradient_glow`
- Interaction: `video_background`, `scroll_parallax`, `contact_form`
- Scope: single-page or hero + sections

Use the top result as primary only if it is not `stub_or_empty`; otherwise pick the next detailed prompt.
