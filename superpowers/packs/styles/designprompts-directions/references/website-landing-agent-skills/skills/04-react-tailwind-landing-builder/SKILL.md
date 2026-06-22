---
name: react-tailwind-landing-builder
description: Implement a routed landing-page specification as a React/Vite/Tailwind front-end with maintainable components, responsive layout, and clear run/build instructions. Use when coding the actual website.
---

# React Tailwind Landing Builder

这个 skill 用于把 `SITE_SPEC` 落成可运行的前端项目。

## References to Open

- Open `templates/file_plan.md` before creating a new project file layout.
- Open `snippets/vite_tailwind_v4.md` only for greenfield Vite + Tailwind v4 setup. Do not use it when an existing project already has a build system.
- Open `../05-motion-video-interactions/docs/motion_recipes.md` when the SITE_SPEC includes video, scroll, CSS 3D, marquee, cursor, loader, or canvas behavior.
- Open `../06-asset-brand-hardening/templates/ASSET_MANIFEST.md` before finalizing external images, videos, fonts, or model assets.

## Prompt Reuse Boundary

- Treat routed prompt files as pattern references, not implementation contracts.
- Do not copy unrelated dependencies, backend services, analytics, AI SDKs, or CDN scripts from a prompt unless the user or SITE_SPEC explicitly requires them.
- Extract layout, motion, media handling, and visual rhythm; rewrite product copy and data from the current brief.

## 默认项目结构

```txt
src/
  App.tsx
  main.tsx
  index.css
  data/site.ts
  components/
    Navbar.tsx
    Hero.tsx
    Section.tsx
    CTA.tsx
    Footer.tsx
    VideoBackground.tsx
  hooks/
    usePrefersReducedMotion.ts
    useScrollProgress.ts
  lib/
    cn.ts
public/
  assets/
```

根据项目复杂度增减文件，不要为了简单 Hero 过度拆分。

## 实现顺序

1. 确认技术栈与依赖，只安装规格需要的库。
2. 建立 design tokens：颜色、字体、间距、圆角、阴影、z-index。
3. 搭 App shell 和 section 顺序。
4. 实现 Hero：可读标题、CTA、视觉核心、视频/图片 fallback。
5. 实现其他 sections：feature/proof/CTA/footer。
6. 接入 motion：先让静态版完整，再加动画。
7. 做响应式：mobile first，桌面增强。
8. 自测：build、console、移动端、键盘、reduced motion。

## Tailwind 约定

- 优先使用 Tailwind utilities；复杂 3D、mask、video overlay、keyframes 可放进 `index.css`。
- Tailwind v4 项目优先使用 `@tailwindcss/vite`，不要混用旧版 PostCSS 配置，除非已有项目需要。
- 大段重复 class 提取为组件或 `cn()` helper。
- 不把颜色散落在几十处；核心色放 tokens 或 constants。

## React 约定

- 组件职责清晰，避免把所有逻辑塞进 `App.tsx`。
- 静态内容放 `src/data/site.ts`，便于用户修改。
- 动效参数集中管理，便于调试。
- 外部 URL 做常量命名，不在 JSX 深处硬编码。
- 不引入后端/数据库，除非用户明确要求。

## 代码验收

至少满足：

```bash
npm install
npm run build
```

如果项目有这些脚本，也应运行：

```bash
npm run lint
npm run typecheck
```

## 输出给用户

交付时说明：

- 创建/修改了哪些文件。
- 如何安装依赖、启动开发环境、构建。
- 哪些素材是 placeholder 或外链。
- 哪些假设需要用户后续确认。
