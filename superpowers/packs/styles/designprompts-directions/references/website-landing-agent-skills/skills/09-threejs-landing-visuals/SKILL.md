---
name: threejs-landing-visuals
description: Add real Three.js/WebGL visuals to a landing page: 3D hero canvas, GLB/glTF model showcase, particles, camera motion, shader/material effects, and WebGL-safe fallbacks. Use when the user explicitly asks for Three.js, WebGL, GLB/glTF, shaders, particles, or a real 3D model—not for CSS 3D illusions.
---

# Three.js Landing Visuals

这个 skill 是把真实 Three.js / WebGL 能力接入当前 React + Vite + Tailwind 落地页工作流的适配层。它解决的是“真 3D / 真 WebGL”，不是 CSS 3D 透视错觉。

## 官方来源

- Three.js 官方文档：`https://threejs.org/docs/`
- Three.js 官方仓库：`https://github.com/mrdoob/three.js/`
- OpenAI 官方 `three-webgl-game` skill 源路径：`vendor/official/openai-three-webgl-game/`
- OpenAI skill 上游安装命令：`npx skills add https://github.com/openai/plugins --skill three-webgl-game`

## 何时使用

使用 Three.js，当 brief 或 SITE_SPEC 出现：

- 明确要求 `Three.js`、`threejs`、`WebGL`、`shader`、`GLB`、`glTF`、`3D model`。
- Hero 需要真实 3D 产品、粒子场、星云、流体、几何体、相机轨道或材质光照。
- 需要在滚动中驱动相机、mesh、material uniform 或粒子参数。
- 需要模型加载、DRACO/KTX2、环境贴图、后期处理、WebGL 性能诊断。

不要使用 Three.js，当只是：

- 卡片立体翻转、透视倾斜、mockup 层叠、视频背景、CSS blur/glow。
- 只要一个“看起来 3D”的静态视觉；CSS/SVG/video 更轻。
- 移动端预算很紧，且 3D 不影响转化目标。

## React 落地页里的两种架构

### A. Imperative Three island，默认推荐

适合装饰型 hero、粒子背景、单模型展示、相机/材质精细控制。

建议结构：

```text
src/components/visuals/ThreeHeroCanvas.tsx
src/lib/three/createHeroScene.ts
src/lib/three/disposeThree.ts
public/models/hero.glb
public/textures/...
```

DOM 文案、CTA、导航继续用 React/Tailwind；WebGL 只负责背景或产品视觉。

### B. React Three Fiber，按需使用

当页面需要声明式 3D 组件、多模型状态、React 组件化材质、`drei` controls，才使用：

```bash
npm install three @react-three/fiber @react-three/drei
```

如果只是一个 hero canvas，不要为了“React 化”过早引入 R3F。

## 安装

```bash
npm install three
```

TypeScript 项目通常可直接使用 `three` 自带类型。

## Imperative ThreeHeroCanvas 模板

```tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeHeroCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.4, 5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    group.add(new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.2, 2),
      new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.35 })
    ));

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(3, 4, 5);
    scene.add(key);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    renderer.setAnimationLoop(() => {
      if (!reduceMotion) group.rotation.y += 0.004;
      renderer.render(scene, camera);
    });

    const onContextLost = (event: Event) => event.preventDefault();
    renderer.domElement.addEventListener("webglcontextlost", onContextLost, false);

    return () => {
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      ro.disconnect();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className="absolute inset-0 -z-10" />;
}
```

## GLB / glTF 加载规则

- 默认模型格式：GLB 或 glTF 2.0。
- 简单模型先用 `GLTFLoader`。
- 只有资产管线真的提供 DRACO / KTX2 时才加 `DRACOLoader` / `KTX2Loader`。
- 优化应在资产管线完成，不要用运行时代码弥补过大的模型。
- 模型必须有 fallback：静态 poster、CSS gradient、SVG mock 或普通图片。

## 性能与浏览器安全

必须做到：

- `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5~2))`，不要无脑 3x/4x。
- 用 `ResizeObserver` 或明确 resize handler 更新 renderer 和 camera。
- WebGL canvas 只做视觉层，高密度文字、表单、导航放 DOM。
- 首屏不要同时加载多个大型视频和大型 GLB。
- 后期处理可选且可测；bloom 不应掩盖文案可读性。
- 移动端默认减少粒子数、禁用重后期、降低 pixel ratio。
- 卸载时 dispose geometry/material/texture/renderer。
- WebGL 不可用时仍显示核心文案、CTA 和 fallback 背景。

## 与 GSAP/ScrollTrigger 协作

如果滚动驱动 Three.js，相机/mesh/uniform 的目标值可以由 GSAP timeline 更新，但渲染循环仍由 Three.js 管理。继续使用 `gsap-threejs-composer`。

不要：

- 让 GSAP 和 render loop 同时对同一值做互相覆盖的动画。
- 让 DOM scroll listener 每帧创建新 tween。
- 把 CTA 文案渲染进 WebGL 导致 SEO/a11y 丢失。

## 验收清单

- 没有 Three.js 时页面仍能展示核心价值和 CTA。
- Reduced motion 下相机和粒子运动暂停或显著降低。
- Canvas 不阻挡按钮点击：装饰层设置 `pointer-events: none`，交互层才开启。
- 移动端无横向滚动，GPU 负载合理。
- 所有 geometry/material/texture/renderer 清理明确。
- 资产记录进入 `ASSET_MANIFEST.md`。
