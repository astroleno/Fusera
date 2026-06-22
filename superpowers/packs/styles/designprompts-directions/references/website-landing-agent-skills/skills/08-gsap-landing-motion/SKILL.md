---
name: gsap-landing-motion
description: Add GSAP to React/Vite/Tailwind landing pages for complex timelines, ScrollTrigger pin/scrub/parallax, SplitText/ScrambleText, and high-control motion. Use when the user explicitly asks for GSAP/GreenSock/ScrollTrigger or when motion exceeds simple CSS/motion-react transitions.
---

# GSAP Landing Motion

这个 skill 是本包对 GreenSock 官方 GSAP AI skills 的落地页适配层。它不替代 `motion-video-interactions`，而是在需求明确需要 GSAP 时，把复杂动效做成可维护、可清理、可降级的系统。

## 官方来源

- 官方 GSAP AI skills：`vendor/official/greensock-gsap-skills/`
- 上游安装命令：`npx skills add https://github.com/greensock/gsap-skills`
- 官方重点：core tween、timeline、ScrollTrigger、plugins、utils、React、performance、framework cleanup。

## 何时使用

使用 GSAP，当 brief 或 SITE_SPEC 出现以下任意情况：

- 明确要求 `GSAP`、`GreenSock`、`ScrollTrigger`、`SplitText`、`ScrambleText`、`MorphSVG`、`Flip`。
- 需要 pinned section、scroll scrub、横向滚动、滚动驱动视频/相机/卡片编排。
- 多个元素需要严格按时间线入场、交错、反向、暂停、seek 或重播。
- 需要把 DOM 动画与 Three.js 相机、mesh、material uniform 同步。

不使用 GSAP，当只是：

- 简单 hover、fade、translate 入场，CSS transition 就够。
- 项目已经明确使用 Framer Motion / motion/react，且没有复杂 timeline 或 ScrollTrigger。
- 同一个 DOM 属性已经被另一个动画库控制。不要让 GSAP 和 Framer 同时写 `transform` / `opacity`。

## 安装

React/Vite/Tailwind 落地页默认：

```bash
npm install gsap @gsap/react
```

只在需要 Three.js 时另装：

```bash
npm install three
```

## React 基础模式

```tsx
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function HeroIntro() {
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "power3.out" } });
    tl.from("[data-hero-kicker]", { y: 18, autoAlpha: 0 })
      .from("[data-hero-title]", { y: 36, autoAlpha: 0 }, "-=0.35")
      .from("[data-hero-cta]", { y: 18, autoAlpha: 0, stagger: 0.08 }, "-=0.25");
  }, { scope });

  return <section ref={scope}>{/* content */}</section>;
}
```

硬性规则：

- 在 React 中优先 `useGSAP()` + `scope`，避免无作用域选择器污染全页面。
- 需要控制播放才存 `tl` / `tween`；否则让 hook 自动清理。
- 只动画 `transform` 系列和 `autoAlpha`；不要优先动画 `top/left/width/height`。
- 用 timeline 的 position 参数，而不是堆很多 `delay`。

## ScrollTrigger 模式

```tsx
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function PinnedProductStory() {
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 900px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      const { isDesktop, reduceMotion } = context.conditions ?? {};
      if (!isDesktop || reduceMotion) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-story]",
          start: "top top",
          end: "+=180%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to("[data-product-card]", { xPercent: -35, rotateY: -8 })
        .to("[data-proof-grid]", { yPercent: -18, autoAlpha: 1 }, "<");
    });

    return () => mm.revert();
  }, { scope });

  return <section ref={scope} data-story>{/* pinned scene */}</section>;
}
```

ScrollTrigger 规则：

- 把 `scrollTrigger` 挂在顶层 tween/timeline 上，不要挂在嵌套 timeline 的子 tween 上。
- `pin: true` 时，不要动画 pinned 元素本身；动画它的子元素。
- 图片、视频、字体、GLB 加载后如果改变布局，调用 `ScrollTrigger.refresh()`。
- 开发可用 `markers: true`；交付前必须删除。
- 移动端默认降级：取消 pin/scrub，使用普通 stacked sections。

## Text reveal / SplitText

只有当标题确实需要逐字/逐词/逐行高级动效时才用 SplitText。必须考虑可访问性：

- 只 split 需要动画的单位，优先 `words` 或 `lines`，避免无意义 chars 爆量。
- 自定义字体加载后再 split，或使用官方支持的自动 re-split 模式。
- 动画结束或组件卸载时 revert；使用 `useGSAP` / `gsap.context` 管理清理。
- 标题语义仍保留在原始 H1/H2 上，不为了动画破坏 SEO 结构。

## 和本包其他 skills 的协作

- 先用 `website-kb-router` 找视觉/内容参考。
- 用 `site-brief-to-spec` 明确哪些 section 需要 GSAP，哪些只用 CSS。
- 用 `motion-video-interactions` 处理视频、reduced motion、基础滚动规范。
- 如果引入 Three.js，同步调用 `threejs-landing-visuals` 和 `gsap-threejs-composer`。
- 交付前用 `site-qa-shipping` 检查移动端、reduced motion、console、build。

## 验收清单

- GSAP 代码只在客户端生命周期运行。
- 所有 selectors 都被组件 scope 限制。
- 所有 ScrollTrigger / timeline 在组件卸载或条件变化时清理。
- `prefers-reduced-motion` 下没有 pin/scrub/长时间自动动画。
- 没有和 Framer Motion 同时控制同一 DOM 属性。
- `ScrollTrigger.refresh()` 在布局型资源加载后可触发。
