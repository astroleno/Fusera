---
name: site-brief-to-spec
description: Convert a landing-page brief and selected prompt references into a concise implementation specification for an agent. Use after website-kb-router and before coding.
---

# Site Brief to Spec

这个 skill 把路由结果转成可执行规格，避免 agent 直接边想边写代码。

## 目标

输出一份 `SITE_SPEC`，让实现 agent 明确知道：做什么页面、用什么技术、有哪些 section、哪些素材、哪些动效、怎么验收。

## 输入

- 用户原始 brief
- `website-kb-router` 生成的 Route Card
- 选中的 prompt 文件内容或摘要
- 用户明确指定的品牌、文案、颜色、素材、技术栈

## References to Open

- Open `templates/route_card.md` when the upstream router did not provide a complete Route Card.
- Open `templates/site_brief.yaml` when the brief is ambiguous or when handing off to another agent.
- Open `../01-website-kb-router/docs/router_protocol.md` when selected references conflict and need normalization.
- Open only the selected prompt references; do not use the full prompt corpus as the SITE_SPEC source.

## 缺省策略

当用户没有提供足够信息时，不要停在追问；可以做合理假设并写入 `Assumptions`：

- 品牌名缺失：创建临时品牌名。
- 文案缺失：生成简洁英文/中文 marketing copy。
- 素材缺失：使用 CSS gradient / placeholder / fallback block，保留 `TODO_ASSET`。
- 页面范围缺失：默认 Landing Page，包含 Navbar、Hero、Feature、Proof、CTA、Footer。
- 技术栈缺失：默认 React + TypeScript + Vite + Tailwind CSS。

## SITE_SPEC 模板

```md
# SITE_SPEC

## 1. Goal
- Business goal:
- Conversion goal:
- Audience:
- Page scope:

## 2. Knowledge references
- Primary prompt:
- Supporting prompts:
- Patterns to reuse:
- Patterns to avoid:

## 3. Information architecture
- Navbar items:
- Sections:
  1. Hero
  2. ...
- CTA hierarchy:
- Footer content:

## 4. Visual system
- Mood:
- Color tokens:
- Typography:
- Spacing/radius:
- Imagery/video direction:

## 5. Motion system
- Intro animation:
- Scroll animation:
- Hover states:
- Reduced-motion fallback:

## 6. Component architecture
- App shell:
- Components:
- Hooks:
- Data/constants:
- Styles:

## 7. Assets
| Asset | Source | Usage | Fallback | Risk |
|---|---|---|---|---|

## 8. Responsive behavior
- Mobile:
- Tablet:
- Desktop:

## 9. Accessibility & SEO
- Heading structure:
- Alt text:
- Keyboard states:
- Meta title/description:

## 10. Acceptance criteria
- Build passes:
- No console errors:
- Mobile readable:
- Video fallback works:
- CTA works:
```

## 规格质量门槛

- 每个 section 都要有目标、内容和布局。
- 每个动效都要说明 trigger、属性、duration/easing、fallback。
- 每个外部素材都要列入 asset manifest。
- 每个依赖都要有必要性；不要无理由引入大型库。
- 规格必须能被另一个 agent 直接执行。
