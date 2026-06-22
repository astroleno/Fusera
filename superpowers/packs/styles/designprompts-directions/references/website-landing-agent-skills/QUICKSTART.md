# Quickstart

## 1. 路由用户需求

```bash
python scripts/kb_router.py --brief "做一个 AI workflow SaaS，暗色、高级、视频背景、滚动动效、带 waitlist" --top 6
python scripts/kb_router.py --brief "做一个带 Three.js 产品模型和 GSAP ScrollTrigger 的暗色发布页" --top 6
```

得到候选 prompt 后，打开 `kb/prompts/<file>.md` 读取主参考和辅助参考。

## 2. 生成 Route Card

使用 `skills/01-website-kb-router/SKILL.md` 的 Route Card 模板。

## 3. 生成 SITE_SPEC

使用 `skills/02-site-brief-to-spec/SKILL.md`，把业务目标、section、视觉、动效、素材和验收标准写清楚。

## 4. 实现页面

使用 `skills/04-react-tailwind-landing-builder/SKILL.md` 创建项目，并在视频/滚动/3D 场景调用 `skills/05-motion-video-interactions/SKILL.md`。

如果明确需要 GSAP：加载 `skills/08-gsap-landing-motion/SKILL.md`。

如果明确需要 Three.js/WebGL/GLB：加载 `skills/09-threejs-landing-visuals/SKILL.md`。

如果 GSAP ScrollTrigger 要驱动 Three.js 相机/模型/uniform：加载 `skills/10-gsap-threejs-composer/SKILL.md`。

## 5. 交付

使用 `skills/06-asset-brand-hardening` 和 `skills/07-site-qa-shipping`，生成 `ASSET_MANIFEST.md`、运行 build，并写 README。
