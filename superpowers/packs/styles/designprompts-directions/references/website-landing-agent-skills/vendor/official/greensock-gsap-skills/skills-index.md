# Official GSAP Skills Index

This is a compact local index of the official GreenSock GSAP AI skills.

Source: https://github.com/greensock/gsap-skills
Install: `npx skills add https://github.com/greensock/gsap-skills`
License: MIT.

| Official skill | Main trigger | Local usage note |
|---|---|---|
| `gsap-core` | `gsap.to`, `from`, `fromTo`, easing, stagger, `matchMedia` | Use for basic tweens and responsive/reduced-motion setup. |
| `gsap-timeline` | sequencing, labels, position parameter, playback | Use for choreographed multi-step hero/section motion. |
| `gsap-scrolltrigger` | scroll animation, pin, scrub, parallax, refresh | Use for pinned landing sections and scroll stories. |
| `gsap-plugins` | SplitText, ScrambleText, Flip, Draggable, MotionPath, MorphSVG | Use only for plugin-specific effects; register plugins once. |
| `gsap-utils` | `clamp`, `mapRange`, `normalize`, `snap`, `toArray` | Use for mapping scroll/progress values and safe math helpers. |
| `gsap-react` | `useGSAP`, refs, scoped selectors, cleanup, SSR | Use for React/Vite pages; prefer `scope` and cleanup. |
| `gsap-performance` | transform/opacity, batching, jank prevention | Use before shipping complex motion. |
| `gsap-frameworks` | Vue/Svelte/Nuxt/SvelteKit lifecycle | Usually not needed in this React-first package. |

Local adapter: `skills/08-gsap-landing-motion/SKILL.md`.
