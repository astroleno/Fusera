# CSS 3D Pattern

## Use When

- The brief asks for 3D feel, depth, cards, floating UI, cylinder/carousel, or perspective effects without explicit WebGL/Three.js.

## Reuse

- Use CSS `perspective`, `transform-style: preserve-3d`, `rotateX/Y`, and `translateZ`.
- Keep 3D as an enhancement over readable 2D layout.
- Limit cursor-driven tilt to hover-capable devices.
- Provide a flat fallback for mobile and reduced motion.

## Avoid

- Do not introduce Three.js for static 2.5D cards or 3D-looking images.
- Do not apply large blur + 3D transforms to many elements at once.
- Do not let transformed layers break text readability or focus outlines.

## Implementation Notes

- Isolate stacking context on the 3D container.
- Clamp pointer deltas and use easing/damping.
- Use `will-change` sparingly; remove it when not animating.
- Keep DOM order semantic even if visual order changes.

## Evidence Required

- Keyboard focus remains visible.
- Mobile fallback checked.
- No layout shift from hover/tilt.

