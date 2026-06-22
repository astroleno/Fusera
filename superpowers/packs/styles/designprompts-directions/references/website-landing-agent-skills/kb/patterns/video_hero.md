# Video Hero Pattern

## Use When

- The route includes `video_background`, `.mp4`, `.m3u8`, HLS, CloudFront, Mux, Cloudinary, or full-screen cinematic hero.

## Reuse

- Put the video behind content, not beside it.
- Keep the content layer readable without video.
- Use a poster or static gradient fallback before the video loads or when it fails.
- Keep the primary CTA visible in the first viewport.
- For HLS, use native Safari playback first and `hls.js` fallback elsewhere.

## Avoid

- Do not make the video the only source of product meaning.
- Do not stack multiple full-resolution videos above the fold.
- Do not copy prompt-specific video URLs unless the user provided or approved them.
- Do not keep autoplay audio.

## Implementation Notes

- Video element: `muted`, `playsInline`, `autoPlay`, `loop`, `preload="metadata"` unless immediate playback is essential.
- Add `aria-hidden="true"` for decorative video.
- Use `object-cover` and a stable min-height/aspect strategy.
- Add overlay based on text contrast, not aesthetics alone.
- Respect `prefers-reduced-motion`; use poster/static mode for heavy effects.

## Evidence Required

- Video failure fallback checked.
- Mobile behavior checked.
- External URL listed in `ASSET_MANIFEST.md`.

