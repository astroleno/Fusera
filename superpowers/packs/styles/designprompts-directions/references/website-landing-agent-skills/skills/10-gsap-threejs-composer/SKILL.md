---
name: gsap-threejs-composer
description: Compose GSAP with Three.js for landing pages: scroll-driven camera moves, mesh/material/uniform animation, pinned WebGL storytelling, DOM overlay choreography, and cleanup/performance boundaries. Use only when both GSAP/ScrollTrigger and real Three.js/WebGL are present.
---

# GSAP + Three.js Composer

这个 skill 负责把 GSAP 的 timeline/ScrollTrigger 和 Three.js 的 render loop 安全组合起来，尤其适合“滚动驱动 3D hero / 产品模型 / 粒子场”的落地页。

## 使用前提

必须已经确认：

- `gsap-landing-motion` 适用。
- `threejs-landing-visuals` 适用。
- 页面真的需要 WebGL + scroll/timeline 组合，而不是 CSS 3D 或视频能解决。

## 核心原则

1. **Three.js 拥有 render loop**：`renderer.setAnimationLoop()` 或单一 rAF 负责 render。
2. **GSAP 驱动目标值**：GSAP tween camera/object/material/uniform 的数值，不直接创建第二套渲染循环。
3. **DOM 和 WebGL 分层**：标题、CTA、表单、导航放 DOM；canvas 做背景、产品或场景。
4. **ScrollTrigger 只建一次**：在 React `useGSAP` 中创建，scope 限制，卸载自动清理。
5. **移动端和 reduced motion 降级**：禁用 pin/scrub，保留静态 3D 或 fallback 图。

## 推荐结构

```text
src/components/sections/WebGLStorySection.tsx
src/components/visuals/ThreeProductScene.tsx
src/lib/three/productScene.ts
src/lib/motion/createProductScrollTimeline.ts
```

`productScene.ts` 暴露可动画 refs：

```ts
export type ProductSceneHandle = {
  camera: THREE.PerspectiveCamera;
  productGroup: THREE.Group;
  materialUniforms?: Record<string, THREE.IUniform>;
  refreshSize: () => void;
  dispose: () => void;
};
```

`createProductScrollTimeline.ts` 只负责 GSAP 编排：

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ProductSceneHandle } from "../three/productScene";

export function createProductScrollTimeline(params: {
  trigger: Element;
  scene: ProductSceneHandle;
}) {
  const { trigger, scene } = params;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "+=220%",
      scrub: true,
      pin: true,
      invalidateOnRefresh: true,
      onRefresh: () => scene.refreshSize(),
    },
  });

  tl.to(scene.camera.position, { z: 3.1, y: 0.7 }, 0)
    .to(scene.productGroup.rotation, { y: Math.PI * 0.8, x: -0.18 }, 0)
    .to(scene.productGroup.position, { x: -0.85 }, 0.25);

  return tl;
}
```

## Material uniform 动画

可以用 GSAP 改 uniform 的 `.value`：

```ts
gsap.to(uniforms.uReveal, {
  value: 1,
  ease: "none",
  scrollTrigger: {
    trigger: section,
    start: "top center",
    end: "bottom center",
    scrub: true,
  },
});
```

规则：

- uniform 名称集中定义，避免散落在组件里。
- shader 参数要有默认静态值，fallback 状态可用。
- 不要每次 scroll update 里重新分配 `Vector3`、`Color`、数组或 material。

## DOM overlay 编排

DOM overlay 可以和 WebGL timeline 同步，但边界要清晰：

```ts
tl.from("[data-copy-step='1']", { y: 24, autoAlpha: 0 }, 0.05)
  .to("[data-copy-step='1']", { y: -18, autoAlpha: 0 }, 0.35)
  .from("[data-copy-step='2']", { y: 24, autoAlpha: 0 }, 0.42);
```

不要把 WebGL 对象和 DOM 节点混在一个不可读的大 timeline 里。推荐分段 label：

```ts
tl.addLabel("intro", 0)
  .addLabel("rotate", 0.3)
  .addLabel("proof", 0.65);
```

## 常见失败模式

- ScrollTrigger pin 住了 canvas，同时动画 pinned 元素自身，导致 layout 抖动。
- React 重渲染重复创建 renderer 或 ScrollTrigger。
- 字体/视频/模型加载后布局改变，但没有 `ScrollTrigger.refresh()`。
- 移动端继续执行桌面端 220% pin，页面变长且卡顿。
- WebGL canvas 抢 pointer events，CTA 点不到。
- GSAP timeline 没清理，路由切换后仍在写旧对象。

## 验收清单

- 一个页面只有一个 Three render loop。
- GSAP timeline / ScrollTrigger 可被清理。
- Camera/mesh/uniform 动画值可读、集中、可调。
- DOM overlay 与 canvas z-index/pointer-events 明确。
- Reduced motion 下可快速跳到静态完成态。
- 移动端有非 pinned 降级。
