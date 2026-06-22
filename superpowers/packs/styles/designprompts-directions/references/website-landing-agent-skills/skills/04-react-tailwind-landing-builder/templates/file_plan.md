# File Plan

## Core
- `src/main.tsx`: React root.
- `src/App.tsx`: page composition only.
- `src/index.css`: Tailwind import, font imports, tokens, global utilities.
- `src/data/site.ts`: copy, navigation, CTA, asset URLs.

## Components
- `Navbar.tsx`: desktop nav + mobile menu.
- `Hero.tsx`: primary visual section.
- `VideoBackground.tsx`: video/HLS handling and fallback.
- `FeatureGrid.tsx`: value props.
- `Marquee.tsx`: optional social proof / logos.
- `CTA.tsx`: conversion block.
- `Footer.tsx`: footer links.

## Hooks
- `usePrefersReducedMotion.ts`: motion fallback.
- `useScrollProgress.ts`: bounded scroll progress.

## QA additions
- `README.md`: run/build instructions.
- `ASSET_MANIFEST.md`: URL, owner, fallback, risk.
