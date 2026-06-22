# Asset Fallback Pattern

## Use When

- Any prompt or implementation uses external video, image, font, CDN script, GLB/glTF, texture, HDRI, or brand asset.

## Reuse

- Create `ASSET_MANIFEST.md` with source, usage, owner/license status, fallback, and risk.
- Prefer user-provided or locally stored assets for production.
- Provide poster/static fallback for every video.
- Provide system fallback for every font.
- Mark unknown licensing explicitly.

## Avoid

- Do not silently ship prompt-origin URLs as production assets.
- Do not embed personal/private URLs in generated public sites.
- Do not rely on external video to make text legible.
- Do not block the page indefinitely while assets load.

## Implementation Notes

- Use constants for external URLs, not inline JSX strings.
- Keep fallbacks visually aligned with the selected direction.
- Lazy-load below-the-fold media.
- Add `crossOrigin` only when needed and safe.

## Evidence Required

- `ASSET_MANIFEST.md` exists.
- Fallback path checked.
- Licensing unknowns flagged.

