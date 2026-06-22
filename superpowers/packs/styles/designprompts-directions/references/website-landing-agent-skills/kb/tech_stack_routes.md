# Technology Stack Routes

这个文件补充原有 prompt 知识库路由：原 `kb/prompts/` 主要解决视觉/行业/页面结构，新增 tech routes 解决 GSAP 和 Three.js 这类实现技术的选择。

## 路由顺序

1. 先用 `website-kb-router` 从 71 个 md prompt 中找视觉/结构参考。
2. 如果 brief 明确提到 GSAP / ScrollTrigger / Three.js / WebGL / GLB / shader，再加载对应技术 skill。
3. 如果只出现“3D 高级感”，先判断是不是 CSS 3D / 视频 / mockup；不是明确 WebGL，不默认引入 Three.js。
4. 如果同时需要 GSAP 和 Three.js，最后加载 `gsap-threejs-composer` 统一 timeline、render loop 和 cleanup 边界。

## GSAP

- Local skill: `skills/08-gsap-landing-motion/SKILL.md`
- Official upstream reference: `vendor/official/greensock-gsap-skills/README.md`
- Best fit: pinned/scrubbed sections, ScrollTrigger, complex timeline, text reveal, SplitText/ScrambleText, ScrollSmoother, Flip, MorphSVG.
- Avoid: simple CSS transition, basic hover, one-off fade.

## Three.js

- Local skill: `skills/09-threejs-landing-visuals/SKILL.md`
- Official docs reference: `vendor/official/threejs-docs/README.md`
- OpenAI official skill reference: `vendor/official/openai-three-webgl-game/README.md`
- Best fit: real 3D model, GLB/glTF, WebGL particles, shader, camera motion, material/light/post-processing.
- Avoid: CSS perspective card, 2.5D mockup, background video, static 3D-looking image.

## GSAP + Three.js

- Local skill: `skills/10-gsap-threejs-composer/SKILL.md`
- Best fit: ScrollTrigger drives camera/mesh/uniform values; DOM copy and WebGL product scene choreographed together.
- Main rule: Three.js owns render loop; GSAP owns target values/timeline.
