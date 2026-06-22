# Three.js Product Canvas Pattern

## Use When

- The user explicitly requests Three.js, WebGL, GLB/glTF, shaders, particles, real 3D model showcase, camera motion, or material/light/post-processing effects.

## Reuse

- Make the WebGL canvas an enhancement around real product content.
- Keep DOM copy, CTA, navigation, and fallback usable without WebGL.
- Use a single bounded render loop.
- Dispose geometries, materials, textures, controls, and renderer on unmount.
- Limit pixel ratio for mobile/GPU budget.

## Avoid

- Do not use Three.js for CSS 3D cards, static 3D images, or video backgrounds.
- Do not hide critical content inside canvas text.
- Do not run multiple canvases above the fold without a clear reason.
- Do not ship large model/texture assets without manifest and fallback.

## Implementation Notes

- Use imperative Three.js or React Three Fiber according to the existing project stack.
- Handle resize and `webglcontextlost`.
- Clamp DPR, particle count, post-processing passes, and shadow quality.
- If scroll controls the scene, read `gsap_scrolltrigger.md` and `../skills/10-gsap-threejs-composer/SKILL.md`.

## Evidence Required

- Non-WebGL fallback checked.
- Resize/context loss behavior reviewed.
- Dispose path reviewed.
- Asset sizes and licenses listed.

