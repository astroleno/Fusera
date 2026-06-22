# Motion Recipes

## 1. Fullscreen video hero

Pattern:

```tsx
<section className="relative min-h-screen overflow-hidden bg-black text-white">
  <video
    className="absolute inset-0 h-full w-full object-cover"
    autoPlay
    muted
    loop
    playsInline
    poster="/assets/poster.jpg"
    aria-hidden="true"
  >
    <source src={videoUrl} type="video/mp4" />
  </video>
  <div className="absolute inset-0 bg-black/50" />
  <div className="relative z-10">...</div>
</section>
```

## 2. Scroll progress with Motion

Use `useScroll` for page-level progress and derive transforms with `useTransform`. Keep transforms bounded.

## 3. IntersectionObserver reveal

Use for non-critical sections. It is lighter than scroll scrubbing.

## 4. CSS 3D card

Use `perspective` on parent, `transform-style: preserve-3d` on card, and pointer-driven rotate only on devices with hover support.

## 5. Marquee

Duplicate content once, animate transform, pause on hover, disable in reduced motion.

## 6. Loader

Only use a loader when assets are actually gating the experience. Never hide content indefinitely if media fails.
