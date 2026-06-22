---
name: asset-brand-hardening
description: Audit and harden media URLs, fonts, brand assets, licensing assumptions, fallbacks, and production-readiness for visually rich landing pages. Use before final delivery when prompts contain external videos, images, fonts, or brand-specific resources.
---

# Asset & Brand Hardening

这个 skill 处理外链素材、字体和品牌一致性，避免页面在演示时好看、上线后失效。

## References to Open

- Open `templates/ASSET_MANIFEST.md` before creating or reviewing `ASSET_MANIFEST.md`.
- Open `../05-motion-video-interactions/docs/motion_recipes.md` when the page uses video/HLS/canvas frame effects.
- Open `../09-threejs-landing-visuals/SKILL.md` when the asset list includes GLB/glTF textures, HDRI, environment maps, shaders, or WebGL-dependent fallbacks.

## 资产清单

所有外链必须进入 `ASSET_MANIFEST.md`：

```md
| Asset | URL/path | Type | Used in | Fallback | License/owner | Risk | Action |
|---|---|---|---|---|---|---|---|
```

## 外链视频

检查点：

- URL 类型：mp4 / m3u8 / cloudfront / mux / cloudinary。
- 是否需要 `hls.js`。
- 是否有 poster / gradient fallback。
- 是否可能跨域失败。
- 移动端是否要降级。
- 是否会影响 LCP / 首屏可读性。

## 字体

- Google Fonts / onlinewebfonts / Webflow CDN / local woff2 都要列入清单。
- 必须有 system fallback。
- 不确定授权时，标记为 `license_unknown`，建议替换为可商用字体。
- 不要让字体加载失败导致布局不可读。

## 图片与图标

- 装饰图必须不会遮挡文字。
- 内容图需要 alt。
- SVG 图标优先使用组件库或 inline SVG；避免大量未经清理的远程 SVG。

## 品牌稳固

- 统一品牌名、大小写、CTA 文案。
- 不保留 prompt 原始品牌名，除非用户要复刻。
- 不编造真实认证、客户 logo、融资数据。
- 所有 placeholder 都要显式标注。

## 交付门槛

最终至少包含：

- `ASSET_MANIFEST.md`
- 视频 fallback
- 字体 fallback
- CTA 链接目标说明
- 用户后续替换素材的位置说明
