---
name: website-kb-router
description: Route a website/landing-page brief to the local prompt knowledge base and produce a compact route card with primary and supporting references. Use before implementation whenever the user wants a visually polished landing page or hero section.
---

# Website KB Router

这个 skill 负责把用户需求路由到 `kb/` 里的 prompt 知识库，帮助 agent 选择合适参考，而不是盲目从零生成。

## 输入

接受以下任意输入：

- 用户自然语言 brief
- 行业/产品类型
- 视觉风格关键词
- 动效关键词
- 技术栈约束
- 参考网站/参考 prompt ID

## 路由维度

按以下顺序判断：

1. **行业/业务**：AI SaaS、Agency、Finance、Security、Real Estate、Ecommerce、Web3、Energy、Logistics、Art/Museum 等。
2. **视觉风格**：Dark Cinematic、Liquid Glass、Luxury Minimal、Gradient Glow、Organic Nature、Cosmic Space、Clean White、Cyber Futuristic。
3. **交互/动效**：Video Background、Scroll Parallax、CSS 3D、Canvas Frame、Marquee、Cursor Follow、Loader、Form/Waitlist。
4. **页面范围**：Hero only、Single page、Multi-section、Contact/Waitlist。
5. **实现约束**：Tailwind v4、motion/react、hls.js、custom CSS、React 19、GSAP、Three.js、WebGL、React Three Fiber 等。

## 知识库文件

- `kb/prompt_inventory.json`：机器可读清单。
- `kb/route_index.yaml`：路由规则和候选 ID。
- `kb/topic_map.md`：标签聚合。
- `kb/prompt_reuse_matrix.md`：每个 prompt 的复用建议。
- `kb/prompts/*.md`：原始 prompt 文件。
- `kb/tech_stack_routes.yaml`：GSAP / Three.js / GSAP+Three.js 技术专项路由。

## References to Open

- Open `docs/router_protocol.md` before producing a Route Card for a new brief.
- Open `kb/prompt_reuse_matrix.md` before selecting a primary prompt; it identifies `stub_or_empty` and thin references.
- Open `kb/route_index.md` or `kb/route_index.yaml` when manual routing is needed.
- Open `kb/tech_stack_routes.md` when the brief mentions GSAP, ScrollTrigger, Three.js, WebGL, GLB/glTF, shaders, or particles.
- Open only the selected `kb/prompts/<id-title>.md` files after routing. Do not load the full prompt corpus by default.

## CLI 辅助

可用脚本快速初筛：

```bash
python scripts/kb_router.py --brief "AI automation SaaS dark glass video hero with waitlist" --top 6 --format markdown
python scripts/kb_router.py --brief "金融科技 高级 暗色 视频背景 滚动视差" --top 5 --format json
```

## 选择规则

- 只选 **1 个 primary prompt**：行业/页面结构最接近。
- 最多选 **3 个 supporting prompts**：分别补视觉、动效、组件或素材策略。
- `quality=stub_or_empty` 的 prompt 只能当主题占位，不做主参考。
- 长 prompt 可以做实现依据，但只抽取相关 pattern，避免整段混入导致需求冲突。
- 如果用户指定技术栈优先级，则技术栈冲突的 prompt 降权。
- 明确出现 GSAP / ScrollTrigger 时，附加推荐 `gsap-landing-motion`。
- 明确出现 Three.js / WebGL / GLB / shader 时，附加推荐 `threejs-landing-visuals`。
- GSAP 与 Three.js 同时出现时，附加推荐 `gsap-threejs-composer`。

## Route Card 输出模板

```md
# Route Card

## User intent
- Industry:
- Product:
- Audience:
- Page scope:
- Visual style:
- Motion style:
- Stack constraints:

## Selected knowledge
- Primary: `<id> <title>` — `kb/prompts/...md`
- Supporting visual: `<id> <title>` — reason
- Supporting motion: `<id> <title>` — reason
- Supporting structure: `<id> <title>` — reason

## Extracted patterns
- Layout:
- Visual tokens:
- Motion recipes:
- Asset handling:
- Components:

## Assumptions
- ...

## Next skill
Use `site-brief-to-spec`.
```

## 失败处理

如果没有直接匹配：

1. 选同视觉风格 prompt 作为主参考。
2. 选同动效 prompt 作为辅助。
3. 用 `site-brief-to-spec` 补齐行业内容。
4. 明确说明“知识库中没有完全相同场景，以下是近似路由”。
