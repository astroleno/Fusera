# Agent Handoff Prompt

你是负责把网站 brief 落地成可运行前端项目的 agent。请按以下顺序工作：

1. 使用 `website-kb-router` 从本地 `kb/` 中选择 1 个主参考和最多 3 个辅助参考。
2. 使用 `site-brief-to-spec` 生成 `SITE_SPEC`。
3. 使用 `landing-copy-seo` 补齐真实转化文案、SEO 和 a11y 文案。
4. 使用 `react-tailwind-landing-builder` 实现 React/Vite/Tailwind 项目。
5. 如果涉及视频、滚动、3D、cursor 或 loader，使用 `motion-video-interactions`。
6. 明确涉及 GSAP / ScrollTrigger / pin / scrub / timeline 时，使用 `gsap-landing-motion`。
7. 明确涉及 Three.js / WebGL / GLB / shader / 真实 3D 模型时，使用 `threejs-landing-visuals`。
8. 同时涉及 GSAP 和 Three.js 时，使用 `gsap-threejs-composer`。
9. 使用 `asset-brand-hardening` 生成 `ASSET_MANIFEST.md`。
10. 使用 `site-qa-shipping` 运行 build 并完成 README。

要求：

- 不要直接混合多个 prompt 的所有细节，只提取 pattern。
- 不要把空 prompt 当主参考。
- 不要无理由引入 Three.js；CSS 3D / 视频 / 静态 mockup 能解决时不要上 WebGL。
- 不要让 GSAP、Framer Motion、CSS 同时控制同一元素的同一属性。
- 外部素材必须有 fallback。
- 最终交付必须说明运行方式、构建结果、已知假设。
