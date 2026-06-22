# GreenSock GSAP Official AI Skills — Provenance

This folder records the official upstream GSAP AI skills used to adapt `skills/08-gsap-landing-motion`.

- Upstream repository: https://github.com/greensock/gsap-skills
- Install command: `npx skills add https://github.com/greensock/gsap-skills`
- Upstream license: MIT, copyright GreenSock 2026.
- Upstream claim: official AI skills for GSAP covering core API, timelines, ScrollTrigger, plugins, React/Vue/Svelte, vanilla JS, utilities, and performance.

This bundle does not need to vendor every upstream file to work. The local skill in `skills/08-gsap-landing-motion` is an opinionated landing-page adapter. If an agent can install remote skills, prefer installing the upstream GSAP skills directly and use this package's adapter as the website-specific routing layer.

## Upstream skill map

| Upstream skill | When this package routes to it |
|---|---|
| `gsap-core` | Basic tweens, eases, stagger, `gsap.matchMedia`, responsive/reduced-motion animation |
| `gsap-timeline` | Multi-step sequencing, labels, nested timelines, playback control |
| `gsap-scrolltrigger` | Scroll animation, scrub, pin, parallax, refresh, cleanup |
| `gsap-plugins` | SplitText, ScrambleText, Flip, Draggable, MorphSVG, MotionPath, ScrollTo, ScrollSmoother |
| `gsap-utils` | `clamp`, `mapRange`, `normalize`, `interpolate`, `snap`, `toArray` |
| `gsap-react` | `useGSAP`, refs, scoped selectors, `gsap.context`, cleanup, SSR boundaries |
| `gsap-performance` | Transform/opacity preference, batching, jank prevention, ScrollTrigger performance |
| `gsap-frameworks` | Vue/Svelte/Nuxt/SvelteKit lifecycle and cleanup |

## Local adapter

Use `skills/08-gsap-landing-motion/SKILL.md` for React/Vite/Tailwind landing pages. It selects a subset of the official GSAP guidance and adds project-specific constraints from this package: knowledge-base routing, reduced motion, mobile downgrade, asset hardening, and final QA.
