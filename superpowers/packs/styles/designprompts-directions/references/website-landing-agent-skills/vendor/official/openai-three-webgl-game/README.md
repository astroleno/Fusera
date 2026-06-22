# OpenAI `three-webgl-game` Skill — Provenance

This folder records the official OpenAI skill source used to adapt `skills/09-threejs-landing-visuals`.

- Upstream repository: https://github.com/openai/plugins
- Upstream skill path: `plugins/game-studio/skills/three-webgl-game/SKILL.md`
- Install command: `npx skills add https://github.com/openai/plugins --skill three-webgl-game`
- Public catalog entry: `three-webgl-game` by OpenAI.

The upstream skill is game-studio oriented: plain TypeScript/Vite, direct Three.js scene/camera/renderer control, GLB/glTF assets, loaders such as `GLTFLoader` / `DRACOLoader` / `KTX2Loader`, optional Rapier physics, SpectorJS debugging, and DOM overlays for HUD/menu UI.

This package adapts that idea for marketing/landing pages rather than games:

- No game loop or gameplay state unless the project explicitly asks for it.
- DOM owns copy, CTA, forms, navigation, and SEO content.
- WebGL is usually a decorative or product-visual layer.
- CSS/video should remain preferred for fake 3D or lighter hero effects.
- Fallbacks, reduced motion, mobile GPU budget, and asset manifests are mandatory.

## Related upstream references

- `plugins/game-studio/references/threejs-stack.md`
- `plugins/game-studio/references/three-webgl-architecture.md`
- `plugins/game-studio/references/threejs-vanilla-starter.md`
- `plugins/game-studio/references/gltf-loading-starter.md`
- `plugins/game-studio/references/webgl-debugging-and-performance.md`
