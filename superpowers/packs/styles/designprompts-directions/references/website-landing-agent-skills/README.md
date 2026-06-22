# Website Landing Agent Skills

这是一套用于辅助 agent 完成高视觉网站/落地页落地的 skills 包，已内置你上传的 md prompt 知识库路由。

## 包含内容

- `skills/`：11 个可独立使用的 `SKILL.md`。
- `kb/`：清理后的 prompt 知识库、索引、标签、路由规则和 pattern recipes。
- `scripts/kb_router.py`：本地知识库路由 CLI。
- `templates/` 和 `examples/`：Route Card、SITE_SPEC、Agent 使用示例。
- `vendor/official/`：GSAP 官方 AI skills、OpenAI Three.js skill、Three.js 官方文档的来源索引与合并说明。

## 推荐使用顺序

1. `website-landing-orchestrator`
2. `website-kb-router`
3. `site-brief-to-spec`
4. `landing-copy-seo`
5. `react-tailwind-landing-builder`
6. `motion-video-interactions`
7. `gsap-landing-motion`（按需）
8. `threejs-landing-visuals`（按需）
9. `gsap-threejs-composer`（同时使用 GSAP + Three.js 时）
10. `asset-brand-hardening`
11. `site-qa-shipping`

## 快速路由

```bash
python scripts/kb_router.py --brief "AI automation SaaS dark glass video hero with waitlist" --top 6 --format markdown
python scripts/kb_router.py --brief "金融科技 高级 暗色 视频背景 滚动视差" --top 5 --format json
```

## 新增 GSAP / Three.js 路由

- GSAP：使用 `skills/08-gsap-landing-motion`，官方上游记录在 `vendor/official/greensock-gsap-skills/`。
- Three.js：使用 `skills/09-threejs-landing-visuals`，Three.js 官方文档索引在 `vendor/official/threejs-docs/`，OpenAI 官方 `three-webgl-game` skill 来源记录在 `vendor/official/openai-three-webgl-game/`。
- GSAP + Three.js：使用 `skills/10-gsap-threejs-composer` 管理 ScrollTrigger、相机/mesh/uniform、render loop 和 cleanup。
- 技术专项路由见 `kb/tech_stack_routes.yaml`。

## 知识库说明

本包从 `prompts-md.zip` 中提取并修正了文件名，移除了 macOS 元数据。共纳入 71 个编号 md prompt。每个 prompt 都有自动标签：行业、视觉风格、动效、技术栈、页面结构和素材依赖。

`kb/patterns/` 是优先阅读层：先读 recipe，再打开路由选中的 prompt 原文。这样可以复用视觉/动效/素材模式，避免把 prompt 原文里的无关依赖、品牌名、外链或整页代码照搬进项目。

## 集成方式

把 `skills/*` 复制到你的 agent skills 目录；保留 `kb/` 和 `scripts/` 在同一包内，确保 `website-kb-router` 能读取知识库。也可以让 agent 直接读取本包根目录的 `skill_bundle.yaml`。

## 重要约束

- `stub_or_empty` prompt 不能作为主实现参考。
- 默认不引入 Three.js；这批 prompt 的 3D 多数是 CSS 3D、视频或透视错觉。只有明确 WebGL/GLB/shader/真实 3D 模型才上 Three.js。
- 默认不引入 GSAP；只有明确需要 ScrollTrigger、pin/scrub、复杂 timeline 或高级文本/SVG 动画时才上 GSAP。
- 所有外链视频/图片/字体都要进入 `ASSET_MANIFEST.md` 并提供 fallback。
- 交付前必须 build，并检查移动端、reduced motion、视频失败状态。
