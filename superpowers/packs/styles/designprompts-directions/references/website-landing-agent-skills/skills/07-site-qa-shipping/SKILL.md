---
name: site-qa-shipping
description: Verify, package, and hand off a generated landing-page project with build checks, responsive QA, accessibility checks, asset notes, and run instructions. Use at the end of every website landing implementation.
---

# Site QA & Shipping

这个 skill 是最后交付门槛。视觉网站也必须能运行、能构建、能维护。

## References to Open

- Open `checklists/site_acceptance.md` before final handoff and mark each applicable item pass/fail/not checked.
- Open `../06-asset-brand-hardening/templates/ASSET_MANIFEST.md` when the page uses external media, fonts, CDN scripts, GLB/glTF, or video streams.
- Open `../08-gsap-landing-motion/SKILL.md` for GSAP cleanup checks when GSAP is installed.
- Open `../09-threejs-landing-visuals/SKILL.md` for WebGL fallback/dispose checks when Three.js is installed.

## QA Evidence Contract

Record evidence in the handoff, not just a generic "checked" statement:

- Build command and result.
- Lint/typecheck/test command results when scripts exist.
- Viewports checked, including at least desktop and mobile.
- Reduced-motion behavior checked or explicitly not checked.
- Asset fallback behavior for video/image/font/model failures.
- GSAP cleanup/reduced-motion status when GSAP is used.
- Three.js pixel ratio, resize, context-loss fallback, and dispose status when Three.js is used.

## 必跑检查

```bash
npm install
npm run build
```

如果存在对应脚本：

```bash
npm run lint
npm run typecheck
npm run test
```

## 人工/视觉检查

- Desktop：1440px 宽，首屏是否完整、CTA 是否可见。
- Tablet：768px 宽，section 间距是否合理。
- Mobile：375px 宽，无横向滚动，导航可用。
- 超高/超矮屏：Hero 不截断核心文案。
- 视频失败：仍有背景和可读文案。
- 字体失败：布局不崩。
- Reduced motion：动画降低后仍可用。

## Accessibility

- 只有一个 H1。
- 按钮和链接有可理解文本。
- 可键盘访问 mobile menu / CTA / form。
- 背景视频 `aria-hidden="true"` 或有合适说明。
- 文字对比度足够。
- 表单 label、error、success state 完整。

## Performance

- 避免首屏加载多个大视频。
- 非首屏图片/video lazy load。
- 动效优先 transform/opacity。
- 避免大面积 backdrop blur 叠加过多层。
- 不引入未使用的大型依赖。
- 如果使用 GSAP：检查 ScrollTrigger 清理、markers 删除、reduced-motion 降级。
- 如果使用 Three.js：检查 WebGL fallback、pixel ratio、resize、context loss、dispose、移动端 GPU 预算。

## Handoff README

最终项目 README 至少写：

```md
# Project

## Run
npm install
npm run dev

## Build
npm run build

## Structure
- src/components
- src/data/site.ts
- src/index.css

## Assets
See ASSET_MANIFEST.md.

## Customize
- Change copy in src/data/site.ts
- Change colors/fonts in src/index.css
- Replace media URLs in src/data/site.ts
```

## 交付说明模板

```md
## 已完成
- ...

## 验收结果
- Build: pass/fail
- Responsive: checked/not checked
- Asset fallback: yes/no

## 运行方式
...

## 注意事项
- External assets:
- GSAP/Three.js usage:
- Placeholder:
- Follow-up:
```
