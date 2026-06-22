# Example Route — GSAP + Three.js Product Launch

## User brief

做一个暗色高级的 AI 硬件发布页，Hero 有真实 3D 产品模型，滚动时产品旋转并切换卖点，需要 GSAP ScrollTrigger，移动端降级。

## Router command

```bash
python scripts/kb_router.py --brief "AI hardware launch dark premium Three.js GLB product model GSAP ScrollTrigger scrub pinned story" --top 6
```

## Expected skill route

- `website-kb-router`：找暗色、高级、产品发布、滚动叙事 prompt。
- `site-brief-to-spec`：明确 Hero、Proof、Feature、CTA 和资产。
- `react-tailwind-landing-builder`：实现页面结构和 DOM 内容。
- `motion-video-interactions`：处理 reduced motion、滚动规范和 fallback。
- `gsap-landing-motion`：实现 ScrollTrigger pin/scrub 和 DOM 文案入场。
- `threejs-landing-visuals`：实现 Three.js canvas、GLB 加载、fallback 和 dispose。
- `gsap-threejs-composer`：把 ScrollTrigger timeline 与 camera/mesh/uniform 连接。
- `asset-brand-hardening`：记录 GLB、texture、poster、字体来源。
- `site-qa-shipping`：build、mobile、reduced motion、WebGL fallback、GSAP cleanup。

## Route card notes

- Three.js 必须是真实需求：GLB 产品模型和相机运动。
- GSAP 必须是真实需求：pin/scrub 滚动故事。
- 首屏 CTA 和 H1 不能渲染在 WebGL 内。
- 移动端不 pin，显示静态模型或 poster。
- reduced motion 下产品显示完成态，文案普通堆叠。
