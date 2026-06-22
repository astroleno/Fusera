# Scroll Story Pattern

## Use When

- The route includes `scroll_parallax`, `scroll-driven`, `scrub`, sticky sections, pinned story, or progress-bound video/camera/section motion.

## Reuse

- Start with static sections that read correctly without motion.
- Map scroll progress to a small set of bounded values.
- Animate `transform` and `opacity` first.
- Keep section heights explicit and mobile-safe.
- Use one primary scroll story per page; avoid competing scrub systems.

## Avoid

- Do not lock scrolling to hide incomplete layout.
- Do not use scroll listeners without passive mode and requestAnimationFrame throttling.
- Do not pin long content on mobile unless tested.
- Do not combine unrelated prompt scroll systems.

## Implementation Notes

- Simple reveals: IntersectionObserver or motion/react.
- Medium parallax: `useScroll` / `useTransform` with clamps.
- Complex pin/scrub/timeline: use `gsap_scrolltrigger.md`.
- Video scrubbing must guard `video.duration`, `video.seeking`, load state, and reduced motion.

## Evidence Required

- Desktop and mobile scroll checked.
- Reduced-motion mode checked.
- No horizontal overflow.

