---
name: motion-video-interactions
description: Implement video backgrounds, scroll-driven animation, parallax, CSS 3D illusions, cursor effects, loaders, and reduced-motion fallbacks for landing pages. Use whenever the route includes video, scroll, 3D, canvas, cursor, or loader tags.
---

# Motion, Video & Interaction Systems

这批知识库 prompt 的核心是「视频 + 滚动 + 高级视觉」。这个 skill 用于把动效做稳，而不是做成卡顿或不可访问的页面。

## References to Open

- Open `docs/motion_recipes.md` before implementing video heroes, scroll progress, CSS 3D cards, marquees, or loaders.
- Open `../../kb/patterns/video_hero.md` when the primary reference uses full-screen video or HLS.
- Open `../../kb/patterns/scroll_story.md` when the page uses scroll-linked sections, parallax, pin/scrub, or progress-driven transforms.
- Open `../../kb/patterns/css_3d_card.md` when the route asks for 3D feel but not real WebGL.
- Open `../08-gsap-landing-motion/SKILL.md` only when CSS/motion-react is insufficient or GSAP/ScrollTrigger is explicitly requested.
- Open `../09-threejs-landing-visuals/SKILL.md` only for real Three.js/WebGL/GLB/shader/particles/model work.

## 视频背景规范

- `<video>` 必须使用 `muted playsInline autoPlay loop`。
- 加 overlay 确保文字对比度足够。
- 提供 poster / gradient fallback / 静态图 fallback。
- HLS / `.m3u8` 使用 `hls.js`，Safari 原生 HLS 走 `video.canPlayType('application/vnd.apple.mpegurl')`。
- 不要让核心信息只存在于视频里。
- 移动端可考虑禁用重视频或替换为静态 poster。

## Scroll / Parallax 规范

优先策略：

1. 简单入场：CSS transition 或 `motion/react`。
2. 滚动进度：`useScroll` / IntersectionObserver。
3. 高复杂度 scrub：集中管理 progress，所有 transform 从 progress 派生。
4. 非必要不使用 GSAP；需要复杂 timeline、pin/scrub、ScrollTrigger 或 SplitText 时才引入，并调用 `gsap-landing-motion`。

硬性规则：

- 只动画 `transform` 和 `opacity`，尽量避免频繁改 `top/left/width/height`。
- scroll listener 必须 passive，并且 requestAnimationFrame 节流。
- 所有 progress 都要 clamp 到安全范围。
- Sticky section 要检查移动端高度和内容溢出。

## CSS 3D / 视觉 3D

- 默认使用 CSS `perspective`、`transform-style: preserve-3d`、`rotateX/Y`、`translateZ`。
- 不要因为标题里有 3D 就引入 Three.js/WebGL；本知识库中的 3D 多数是 CSS 或视频素材模拟。
- 只有真实 WebGL、GLB/glTF 模型、shader、粒子或相机控制才调用 `threejs-landing-visuals`。
- 同时需要 ScrollTrigger 驱动相机/mesh/uniform 时调用 `gsap-threejs-composer`。
- 3D 容器要 isolate stacking context，避免 z-index 混乱。
- 移动端减少 translateZ 和大规模 blur。

## Reduced Motion

必须实现：

```ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

当用户偏好减少动效时：

- 禁用 scroll scrub。
- 停止自动 marquee / cursor trail。
- 视频可以保留但不依赖动态内容。
- 用淡入或静态布局替代复杂 motion。

## 动效验收清单

- 首屏 1 秒内可读；视频未加载时也可读。
- 滚动不卡顿、不跳变、不锁死页面。
- 移动端不出现横向滚动。
- reduced-motion 可用。
- 动效不遮挡 CTA。
- hover/cursor 效果不影响键盘用户。
