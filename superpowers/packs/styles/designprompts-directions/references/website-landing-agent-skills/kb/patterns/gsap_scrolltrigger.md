# GSAP ScrollTrigger Pattern

## Use When

- The user explicitly requests GSAP/GreenSock/ScrollTrigger.
- The page needs pin/scrub, complex timelines, SplitText/ScrambleText, SVG path animation, or choreography too complex for CSS/motion-react.

## Reuse

- Keep GSAP setup inside dedicated hooks/components.
- Register plugins once.
- Use `gsap.context()` or equivalent cleanup in React.
- Keep ScrollTrigger scopes local and refresh after media/layout changes.
- Provide reduced-motion bypass.

## Avoid

- Do not use GSAP for simple fades, hovers, or one-off transitions.
- Do not leave markers enabled.
- Do not create ScrollTriggers in render paths.
- Do not let GSAP own React state that should remain declarative.

## Implementation Notes

- Use `useLayoutEffect` or `useGSAP` patterns for DOM-bound timelines.
- Kill timelines/triggers on unmount.
- Keep scroll values bounded and deterministic.
- When driving Three.js, GSAP should animate target values; Three.js owns the render loop.

## Evidence Required

- Cleanup path reviewed.
- Reduced-motion fallback reviewed.
- ScrollTrigger markers disabled.

