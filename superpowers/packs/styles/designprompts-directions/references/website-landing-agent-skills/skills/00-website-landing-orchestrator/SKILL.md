---
name: website-landing-orchestrator
description: Orchestrate an AI agent workflow for taking a website or landing-page brief from knowledge-base routing through spec, implementation, QA, and handoff. Use first for any request to create, rebuild, or ship a high-visual-impact website/landing page.
---

# Website Landing Orchestrator

用于把「我要做一个网站/落地页」的模糊需求，推进到可实现、可验收、可交付的前端项目。

## 触发场景

当用户要求生成、复刻、改造、落地以下类型页面时使用：

- Landing Page / Hero Section / Marketing Site
- 高级动效网站、视频背景网站、滚动视差网站
- React + Vite + Tailwind 的单页前端
- 需要从本地 prompt 知识库中挑参考方案

## 总流程

1. **先路由知识库**：调用 `website-kb-router`，从 `kb/prompt_inventory.json` 和 `kb/route_index.yaml` 选出 1 个主参考 + 1–3 个辅助参考。
2. **生成规格**：调用 `site-brief-to-spec`，把用户 brief 和参考 prompt 合并成清晰的 `SITE_SPEC`。
3. **内容与 SEO**：调用 `landing-copy-seo`，补齐信息架构、标题层级、CTA、meta、可访问性文案。
4. **实现页面**：调用 `react-tailwind-landing-builder`，按规格创建组件、样式、响应式和状态逻辑。
5. **动效专项**：遇到视频、滚动、3D、cursor、loader 时调用 `motion-video-interactions`。
6. **GSAP 专项**：明确要求 GSAP / ScrollTrigger / pin / scrub / timeline / SplitText 时，调用 `gsap-landing-motion`。
7. **Three.js 专项**：明确要求 Three.js / WebGL / GLB / glTF / shader / particle / 真实 3D 模型时，调用 `threejs-landing-visuals`。
8. **组合编排**：同时出现 GSAP 和 Three.js 时，调用 `gsap-threejs-composer` 管理 render loop、timeline、cleanup 和降级。
9. **素材和品牌稳固**：调用 `asset-brand-hardening`，检查外链素材、字体、fallback、许可证风险。
10. **验收与交付**：调用 `site-qa-shipping`，完成 build、响应式、a11y、性能和交付说明。

## 默认落地策略

- 默认技术栈：React + TypeScript + Vite + Tailwind CSS；简单动效用 CSS / motion/react，复杂 timeline/scroll 用 GSAP，真实 WebGL/模型才引入 Three.js。
- 默认页面形态：单页 landing，包含 Navbar、Hero、Feature/Proof、CTA、Footer；如果用户只要首屏，则只做 Hero。
- 默认视觉：按路由结果继承风格，不要把多个 prompt 的视觉元素硬拼。
- 默认质量门槛：代码可运行、可构建、移动端可读、视频/字体有 fallback、CTA 可点击、无明显 console error。

## 输出规范

每轮交付至少包含：

```md
## Route
- Primary prompt: <id/title/file>
- Supporting prompts: <id/title/file>...

## Implementation Plan
- Stack
- Sections
- Components
- Assets
- Motion
- QA

## Deliverables
- Changed files / generated files
- Run commands
- Known assumptions
```

## 禁止事项

- 不要直接复制多个 prompt 的所有外链和所有组件，必须抽象成可维护的方案。
- 不要把 `stub_or_empty` prompt 当主参考。
- 不要为了“3D 高级感”默认引入 Three.js；只有真实 WebGL、GLB/glTF、shader、粒子或相机控制才使用 `threejs-landing-visuals`。
- 不要把 GSAP、Framer Motion、CSS 同时用于同一元素的同一属性；先明确动画所有权。
- 不要忽略 `prefers-reduced-motion`、移动端、视频 fallback 和字体 fallback。
