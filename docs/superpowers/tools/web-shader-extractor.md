# Web Shader Extractor

`tools/web-shader-extractor` is a Fusera tool pack for extracting and replaying target-bound WebGL, WebGPU, Canvas, shader-like, animated background, interactive 3D, or similar webpage visual effects.

Use it only when the user points to a shader/canvas target. It is not a DOM/CSS page cloning workflow.

## Source

- Upstream: https://github.com/lixiaolin94/skills/tree/main/web-shader-extractor
- Vendored snapshot: `0ec3c22e9d7e140e7870771e0553210f3be512f7`
- Local pack: `superpowers/packs/tools/web-shader-extractor`

## Operating Boundaries

- Default to public pages or pages the user is authorized to reproduce.
- Do not persist cookies, Authorization headers, tokens, or secrets.
- Do not use Playwright unless the user explicitly asks for it or authorizes it for the current task.
- Store large evidence outside chat: screenshots, DOM snapshots, runtime probes, frame captures, source slices, replay baselines, QA reports, and editable projects should live in the user-selected output directory or run-owned runtime output.

## Current Integration

This is a project-local tool pack registered in `superpowers/packs/registry.yaml` under output mode `web-shader-extraction`.

It is intentionally not part of the default `landing-page` stage sequence. The current Fusera runner invokes adapter stages in read-only mode, so fully automated capture/replay execution should be planned separately before adding a dedicated runner workflow.

## Verification

```bash
node --experimental-strip-types superpowers/runner/compile-pack.ts tools/web-shader-extractor codex
npm run harness:topology
npm run harness:startup
npm run test:node
```
