# 提示词合集

来源：/Users/aitoshuu/Downloads/feishu-网站制作-export
数量：71


---

# 001 复制出来的提示词

# 复制出来的提示词

<callout emoji="🥇">
Build a single-page hero section with a full-screen looping background video, liquid glass UI elements, and a dark cinematic aesthetic. Use React, TypeScript, Tailwind CSS, and Lucide React icons. Here are the exact specifications:
Background Video:
Full-screen muted autoplaying video covering the entire viewport, positioned absolutely with object-cover
Video source URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4
The video is shifted down by 17% (translate-y-[17%]) so the top portion of the video is cropped -- the interesting content is in the lower portion of the frame
The video loops seamlessly with a custom JavaScript fade system (no CSS transitions): 500ms requestAnimationFrame-based fade-in on load/loop start, 500ms fade-out when 0.55 seconds remain before the video ends. A fadingOutRef boolean prevents re-triggering the fade-out from repeated timeUpdate events. On ended, opacity is set to 0, then after 100ms the video resets to currentTime = 0, plays, and fades back in. Each new fade cancels any running animation frame to prevent competing animations. Fades resume from the current opacity rather than snapping.
The outer container is min-h-screen bg-black with overflow-hidden
Font:
Import Google Font "Instrument Serif" (both regular and italic) via CSS @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap')
The heading uses fontFamily: "'Instrument Serif', serif" applied via inline style
Liquid Glass CSS (.liquid-glass class):
background: rgba(255, 255, 255, 0.01) with background-blend-mode: luminosity
backdrop-filter: blur(4px) and -webkit-backdrop-filter: blur(4px)
border: none
box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1)
position: relative; overflow: hidden
A ::before pseudo-element creates the glass border effect:
position: absolute; inset: 0; border-radius: inherit; padding: 1.4px
background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%)
Mask trick for border-only rendering: -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude
pointer-events: none
Layout (all inside one full-screen flex column):
Navigation bar (relative z-20, padding pl-6 pr-6 py-6):
Inner container: rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto
Left side: Logo area with a Globe icon (size 24) and text "Asme" in white, font-semibold text-lg, with gap-2
Next to the logo (with gap-8): three nav links ("Features", "Pricing", "About") -- hidden on mobile, shown on md: -- styled text-white/80 hover:text-white transition-colors text-sm font-medium
Right side (gap-4): "Sign Up" as plain white text button, "Login" as a liquid-glass rounded-full px-6 py-2 button
Hero content area (relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]):
Heading: "Built for the curious" -- text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight whitespace-nowrap with Instrument Serif font
Below the heading, a max-w-xl w-full space-y-4 container:
Email input bar: liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3. Inside: a transparent email input (placeholder: "Enter your email", text-white placeholder:text-white/40 text-base) and a white circular submit button (bg-white rounded-full p-3 text-black) containing an ArrowRight icon (size 20)
Subtitle text: text-white text-sm leading-relaxed px-4 -- "Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates."
Manifesto button: centered, liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors
Social icons footer (relative z-10 flex justify-center gap-4 pb-12):
Three circular icon buttons, each liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all
Icons: Instagram, Twitter, Globe (all size 20) from lucide-react
Each has an aria-label
Tech stack: Vite + React 18 + TypeScript, Tailwind CSS 3, lucide-react for all icons. Default Tailwind config with no extensions. No other UI libraries.
</callout>


---

# 002 3D Portfolio

# 3D Portfolio

<callout emoji="🎗️">
Build a 3D Creator portfolio landing page for "Jack" using React, TypeScript, Tailwind CSS, Framer Motion, and Lucide React. The page has a dark theme (#0C0C0C background) with the font Kanit (Google Fonts, weights 300-900). The page title is "Jack -- 3D Creator".
GLOBAL STYLES
Background: #0C0C0C on html, body, #root, and the main wrapper
Font family: 'Kanit', sans-serif
Global reset: box-sizing border-box, margin 0, padding 0
CSS class .hero-heading: gradient text using background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%) with -webkit-background-clip: text and -webkit-text-fill-color: transparent
Main wrapper has overflowX: 'clip'
SECTION ORDER
HeroSection
MarqueeSection
AboutSection
ServicesSection
ProjectsSection
1. HERO SECTION
Full viewport height (h-screen), flex column layout with overflowX: clip.
Navbar: Horizontal nav bar with 4 links -- "About", "Price", "Projects", "Contact" -- evenly spaced with justify-between. Text color #D7E2EA, font-medium, uppercase, tracking-wider. Sizes: text-sm md:text-lg lg:text-[1.4rem]. Padding: px-6 md:px-10 pt-6 md:pt-8. Hover: opacity 70% with 200ms transition.
Hero Heading: Massive h1 with text "Hi, i'm jack" (lowercase "i", curly apostrophe via '). Uses the .hero-heading gradient text class. Font-black, uppercase, tracking-tight, leading-none, whitespace-nowrap, w-full. Font sizes: text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]. Margin top: mt-6 sm:mt-4 md:-mt-5. Wrapped in overflow-hidden container.
Bottom bar: Flexbox justify-between items-end with pb-7 sm:pb-8 md:pb-10:
Left: paragraph text "a 3d creator driven by crafting striking and unforgettable projects", color #D7E2EA, font-light, uppercase, tracking-wide, leading-snug. Font size: clamp(0.75rem, 1.4vw, 1.5rem). Max-width: max-w-[160px] sm:max-w-[220px] md:max-w-[260px].
Right: ContactButton component (see below)
Hero Portrait: Centered absolutely. Uses a Magnet component (mouse-following magnetic effect) wrapping an image. Image URL: https://shrug-person-78902957.figma.site/\_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png. Magnet settings: padding 150, strength 3, activeTransition "transform 0.3s ease-out", inactiveTransition "transform 0.6s ease-in-out". Positioning: absolute left-1/2 -translate-x-1/2 z-10. Width: w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px]. On mobile: top-1/2 -translate-y-1/2. On sm+: sm:top-auto sm:translate-y-0 sm:bottom-0.
FadeIn animations: Navbar fades in with delay 0, y -20. Heading: delay 0.15, y 40. Left text: delay 0.35, y 20. Contact button: delay 0.5, y 20. Portrait: delay 0.6, y 30.
1. MARQUEE SECTION
Two rows of images that scroll horizontally based on page scroll position. Background #0C0C0C. Padding: pt-24 sm:pt-32 md:pt-40 pb-10.
21 GIF images from motionsites.ai (exact URLs):
https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif
https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif
https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif
https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif
https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif
https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif
https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif
https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif
https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif
https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif
https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif
https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif
https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif
https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif
https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif
https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif
https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif
https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif
https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif
https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif
https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif
Row 1: first 11 images, tripled for seamless scrolling. Moves RIGHT on scroll (translateX(offset - 200)).
Row 2: remaining 10 images, tripled. Moves LEFT on scroll (translateX(-(offset - 200))).
Scroll offset calculated as: (window.scrollY - sectionTop + window.innerHeight) \* 0.3
Each image tile: 420px x 270px, rounded-2xl, object-cover, lazy loaded.
Gap between tiles: gap-3. Gap between rows: gap-3.
Uses willChange: 'transform' for performance. Scroll listener is passive.
1. ABOUT SECTION
Full-height centered section with min-h-screen, padding px-5 sm:px-8 md:px-10 py-20.
Four decorative 3D images positioned absolutely in corners:
Top-left: Moon icon -- https://shrug-person-78902957.figma.site/\_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png -- w-[120px] sm:w-[160px] md:w-[210px], positioned top-[4%] left-[1%] sm:left-[2%] md:left-[4%]. FadeIn: delay 0.1, x -80, y 0, duration 0.9.
Bottom-left: 3D object -- https://shrug-person-78902957.figma.site/\_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png -- w-[100px] sm:w-[140px] md:w-[180px], positioned bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%]. FadeIn: delay 0.25, x -80, y 0, duration 0.9.
Top-right: Lego icon -- https://shrug-person-78902957.figma.site/\_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png -- w-[120px] sm:w-[160px] md:w-[210px], positioned top-[4%] right-[1%] sm:right-[2%] md:right-[4%]. FadeIn: delay 0.15, x 80, y 0, duration 0.9.
Bottom-right: 3D group -- https://shrug-person-78902957.figma.site/\_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png -- w-[130px] sm:w-[170px] md:w-[220px], positioned bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%]. FadeIn: delay 0.3, x 80, y 0, duration 0.9.
Heading: "About me" using .hero-heading gradient text, font-black, uppercase, leading-none, tracking-tight, centered. Font size: clamp(3rem, 12vw, 160px). FadeIn: delay 0, y 40.
Animated paragraph: Uses a character-by-character scroll-driven opacity animation. Text: "With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!" -- color #D7E2EA, font-medium, centered, leading-relaxed, max-w-[560px], font size clamp(1rem, 2vw, 1.35rem). Each character animates from opacity 0.2 to 1 based on scroll progress, with scroll offset ['start 0.8', 'end 0.2'].
Contact button below the text block. Gap between heading/text: gap-10 sm:gap-14 md:gap-16. Gap between text block and button: gap-16 sm:gap-20 md:gap-24.
1. SERVICES SECTION
White background (#FFFFFF), with rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] top corners. Padding: px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32.
Heading: "Services" in #0C0C0C, font-black, uppercase, centered, font size clamp(3rem, 12vw, 160px). Margin bottom: mb-16 sm:mb-20 md:mb-28.
5 service items in a vertical list, max-w-5xl, centered:
01 - 3D Modeling: "Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations."
02 - Rendering: "High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life."
03 - Motion Design: "Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences."
04 - Branding: "Crafting cohesive visual identities -- from logos to full brand systems -- that communicate a clear and memorable presence."
05 - Web Design: "Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience."
Each item: horizontal layout with number (font-black, font size clamp(3rem, 10vw, 140px), color #0C0C0C) on the left and name + description stacked vertically on the right. Name: font-medium, uppercase, font size clamp(1rem, 2.2vw, 2.1rem). Description: font-light, leading-relaxed, max-w-2xl, font size clamp(0.85rem, 1.6vw, 1.25rem), opacity 0.6. Items separated by 1px borders (rgba(12, 12, 12, 0.15)). Padding: py-8 sm:py-10 md:py-12. Staggered FadeIn: each item delays by i \* 0.1.
1. PROJECTS SECTION
Dark background (#0C0C0C), rounded top corners rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px], pulled up with -mt-10 sm:-mt-12 md:-mt-14, z-10.
Heading: "Project" (singular) using .hero-heading gradient, same styling as other headings.
3 sticky-stacking project cards that scale down as you scroll past them (card stacking effect using Framer Motion useScroll and useTransform). Each card is sticky top-24 md:top-32 inside an h-[85vh] container.
Scale calculation: targetScale = 1 - (totalCards - 1 - index) \* 0.03. Each card offset by top: \${index \* 28}px.
Each card has: rounded-[40px] sm:rounded-[50px] md:rounded-[60px], border-2 border-[#D7E2EA], background #0C0C0C, padding p-4 sm:p-6 md:p-8.
Card layout:
Top row: Number (huge, same style as services), category label, project name, and a "Live Project" ghost button (rounded-full, border-2 #D7E2EA, uppercase, tracking-widest).
Bottom row: Two-column image grid -- left column (40% width) has 2 stacked images, right column (60%) has 1 tall image. All images have heavy border radius rounded-[40px] sm:rounded-[50px] md:rounded-[60px]. Left top image height: clamp(130px, 16vw, 230px). Left bottom image height: clamp(160px, 22vw, 340px).
Project data with CloudFront image URLs:
Project 01 - "Nextlevel Studio" (Client):
Col1 image 1: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85
Col1 image 2: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85
Col2 image: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85
Project 02 - "Aura Brand Identity" (Personal):
Col1 image 1: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85
Col1 image 2: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85
Col2 image: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85
Project 03 - "Solaris Digital" (Client):
Col1 image 1: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85
Col1 image 2: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85
Col2 image: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85
</callout>


---

# 003 Prisma Creative Studio

# Prisma Creative Studio

Create a React + Vite + TypeScript + Tailwind CSS landing page for a creative studio called "Prisma". The page has 3 sections: Hero, About, and Features. Use framer-motion for animations and lucide-react for icons. The design is dark, moody, and cinematic with a warm cream color palette.



FONTS



Load two Google Fonts in index.html:



Almarai (weights: 300, 400, 700, 800) -- used as the global default font

Instrument Serif (italic only) -- used for italic accent text in the About section

In index.css, set the global font family:





- { font-family: 'Almarai', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; }

In tailwind.config.js, extend:



colors.primary: #DEDBC8 (warm cream, used for all primary text and accents)

fontFamily.serif: ['"Instrument Serif"', 'serif']

COLOR SYSTEM



Background: black (#000000) globally, #101010 for the About card, #212121 for Features cards

Primary text color: #E1E0CC (applied via inline style, slightly different from Tailwind primary)

Tailwind primary: #DEDBC8 (used for utility classes like text-primary, text-primary/70)

Gray text: text-gray-400, text-gray-500

Navbar link color: rgba(225, 224, 204, 0.8) with hover: #E1E0CC

CUSTOM CSS UTILITIES (index.css)



Two SVG noise texture utilities:



.noise-overlay: fractal noise (baseFrequency: 0.85, numOctaves: 3) used as overlay on hero video

.bg-noise: fractal noise (baseFrequency: 0.9, numOctaves: 4) used as subtle background in Features section

Both use inline SVG data URIs with feTurbulence filter.



SECTION 1: HERO



Full viewport height (h-screen). The entire section has p-4 md:p-6 padding creating an inset effect. Inside is a container with rounded-2xl md:rounded-[2rem] and overflow-hidden.



Background video:



URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4

autoPlay loop muted playsInline, object-cover, fills entire container

Noise overlay on top: .noise-overlay with opacity-[0.7] mix-blend-overlay pointer-events-none

Gradient overlay: bg-gradient-to-b from-black/30 via-transparent to-black/60

Navbar:



Absolutely positioned at top center

Black background pill that hangs from top edge: bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8

5 nav items: "Our story", "Collective", "Workshops", "Programs", "Inquiries"

Text size: text-[10px] sm:text-xs md:text-sm

Gap between items: gap-3 sm:gap-6 md:gap-12 lg:gap-14

Link color: rgba(225, 224, 204, 0.8), hover: #E1E0CC (inline styles)

Hero Content (bottom-aligned):



Absolutely positioned at bottom: absolute bottom-0 left-0 right-0

12-column grid: left 8 columns for heading, right 4 columns for text + button

Giant heading "Prisma" using WordsPullUp component:

Responsive sizes: text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw]

font-medium leading-[0.85] tracking-[-0.07em]

Color: #E1E0CC

Has a superscript asterisk (\*) on the final "a" of "Prisma": positioned with absolute top-[0.65em] -right-[0.3em] text-[0.31em]

Pull-up animation: each word slides up from y:20 with staggered delay of 0.08s, triggered by useInView

Description paragraph (right column):

"Prisma is a worldwide network of visual artists, filmmakers and storytellers bound not by place, status or labels but by passion and hunger to unlock potential through our unique perspectives."

text-primary/70 text-xs sm:text-sm md:text-base, line-height: 1.2

Framer motion: fade up from y:20, delay 0.5s, custom ease [0.16, 1, 0.3, 1]

CTA Button "Join the lab":

Pill shape: bg-primary rounded-full

Black text, font-medium, text-sm sm:text-base

Right side has a black circle (bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10) containing a white/cream ArrowRight icon

Hover: gap increases (hover:gap-3), circle scales up (group-hover:scale-110)

Framer motion: fade up from y:20, delay 0.7s, same custom ease

SECTION 2: ABOUT



bg-black, padded section with centered content

Inner card: bg-[#101010], centered text, max-w-6xl

Top: small label "Visual arts" in text-primary, text-[10px] sm:text-xs

Main heading uses WordsPullUpMultiStyle component with 3 segments:

"I am Marcus Chen," -- font-normal (Almarai)

"a self-taught director." -- italic font-serif (Instrument Serif italic)

"I have skills in color grading, visual effects, and narrative design." -- font-normal

Container: text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9]

Each word animates in with pull-up effect (y:20 to y:0), staggered at 0.08s delay

Body paragraph below with scroll-linked character opacity animation:

Text: "Over the last seven years, I have worked with Parallax, a Berlin-based production house that crafts cinema, series, and Noir Studio in Paris. Together, we have created work that has earned international acclaim at several major festivals."

text-[#DEDBC8], text-xs sm:text-sm md:text-base

Each character is individually wrapped in an AnimatedLetter component

Uses useScroll with target offset ['start 0.8', 'end 0.2']

Each character's opacity transitions from 0.2 to 1 based on scroll position, creating a progressive text reveal effect

Character staggering: charProgress = index / totalChars, range [charProgress - 0.1, charProgress + 0.05]

SECTION 3: FEATURES



min-h-screen bg-black, with subtle .bg-noise overlay at opacity-[0.15]

Header text uses WordsPullUpMultiStyle:

Line 1: "Studio-grade workflows for visionary creators." in cream

Line 2: "Built for pure vision. Powered by art." in text-gray-500

Both: text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal

4-column card grid (lg:h-[480px], gap-3 sm:gap-2 md:gap-1):



Each card has staggered entrance animation: scale from 0.95 + fade in, triggered by useInView (once, margin "-100px"), staggered at 0.15s intervals with ease [0.22, 1, 0.36, 1].



Card 1 - Video card: Full video background (URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4), autoPlay loop muted playsInline, object-cover. Bottom text: "Your creative canvas." in #E1E0CC.



Card 2 - "Project Storyboard." (01): bg-[#212121], small image icon at top (https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85, 10x10 sm:12x12 rounded), title with number, 4 checklist items with green Check icons, "Learn more" link with rotated arrow (-45deg).



Card 3 - "Smart Critiques." (02): Same layout as Card 2. Icon: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85. 3 checklist items about AI analysis, creative notes, tool integrations.



Card 4 - "Immersion Capsule." (03): Same layout. Icon: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85. 3 checklist items about notification silencing, ambient soundscapes, schedule syncing.



All feature card checklist items use Check icon from lucide-react in text-primary color, with text-gray-400 description text. "Learn more" buttons use ArrowRight rotated -45deg.



SHARED ANIMATION COMPONENTS



WordsPullUp: Splits text by spaces, each word is a motion.span that slides up (y:20 to 0) with staggered delay. Uses useInView (once: true). Supports showAsterisk prop that adds a superscript \* after the last character "a" of the final word.



WordsPullUpMultiStyle: Takes an array of {text, className} segments, splits all into individual words preserving per-word className. Same pull-up animation. Words are wrapped in inline-flex flex-wrap justify-center.



RESPONSIVE BREAKPOINTS



The page is fully responsive across mobile, tablet, and desktop. Cards in Features switch from 1-col (mobile) to 2-col (md) to 4-col (lg). Hero text scales from 26vw down to 19vw. Navbar items compress with smaller gaps on mobile. All padding, font sizes, and spacing use Tailwind responsive prefixes (sm/md/lg/xl/2xl).



TECH STACK



Vite + React 18 + TypeScript

Tailwind CSS 3

framer-motion (for all animations: pull-up text, fade-in, scroll-linked opacity, card entrances)

lucide-react (ArrowRight, Check icons)


---

# 004 单屏-Portal

# 单屏-Portal

Build a password manager landing page hero section using React, TypeScript, Tailwind CSS, Framer Motion, and Lucide React icons. Here is every specification:



---



### Fonts



- **Heading font:** "Helvetica Now Display Bold" -- load via this stylesheet in `index.html`:

  ```Plain Text
  <link href="https://db.onlinewebfonts.com/c/04e6981992c0e2e7642af2074ebe3901?family=Helvetica+Now+Display+Bold" rel="stylesheet">
  ```
- **Body font:** "Inter" (weights 300-900) -- load via Google Fonts in `index.css`:

  ```Plain Text
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  ```

### CSS Variables (defined in `:root` in `index.css`)



```Plain Text
--font-heading: 'Helvetica Now Display Bold', sans-serif;
--font-body: 'Inter', sans-serif;
--color-text: #192837;
--color-accent: #7342E2;
--color-login-bg: #F2F2EE;
```



Global reset: `* { box-sizing: border-box; }`, body uses `var(--font-body)`, `var(--color-text)`, margin/padding 0.



---



### Background



Full-viewport looping background video, absolutely positioned, covering the entire page with `object-cover`. URL:



```Plain Text
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_131516_eca35265-ea66-4fbd-8d52-22aae6e1a503.mp4
```



Attributes: `autoPlay`, `muted`, `loop`, `playsInline`. Classes: `absolute inset-0 z-0 w-full h-full object-cover`.



---



### Logo (inline SVG component)



A custom geometric SVG logo, 32x32, viewBox `0 0 256 256`, fill `#192837`:



```Plain Text
M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z
```



---



### Navbar



- Max-width `1280px`, centered with `margin: 0 auto`.
- Padding: `px-5 sm:px-8 py-4 sm:py-5`.
- `relative z-10`, flexbox with `justify-between`, `items-center`.
- **Left:** Logo component.
- **Center (desktop, hidden on mobile `md:flex`):** 5 nav links -- "Vault", "Plans", "Install", "News", "Help". Each is `text-sm font-medium`, color `var(--color-text)`, `transition-opacity hover:opacity-70`, gap-8.
- **Right (desktop, hidden on mobile `md:flex`):** Two pill buttons with `gap-3`:

  - "Start For Free": background `#7342E2`, white text, `text-sm font-semibold px-5 py-2.5 rounded-full`, hover shadow, active scale-95.
  - "Sign In": background `#F2F2EE`, text `var(--color-text)`, same sizing/rounding.
- **Mobile (`md:hidden`):** Hamburger button using Lucide `Menu` icon (24px). Toggles to `X` icon when open.

---



### Mobile Menu (slide-in sheet)



Uses Framer Motion `AnimatePresence`. Two layers:



1. **Backdrop:** Fixed overlay, `rgba(25,40,55,0.35)` background, `backdrop-blur(4px)`. Fades in/out over 0.3s. Clicking dismisses the menu.
2. **Sheet:** Fixed, right-aligned, `width: min(88vw, 360px)`, `height: 100dvh`, background `#CFC8C5`, box-shadow `-12px 0 48px rgba(25,40,55,0.18)`. Slides in from right with custom cubic bezier `[0.22, 1, 0.36, 1]` over 0.45s; exits with `[0.55, 0, 1, 0.45]` over 0.35s.Contents:

   - **Header:** Logo + circular close button (40x40, background `rgba(25,40,55,0.1)`, X icon 20px), with `whileTap={{ scale: 0.9 }}`.
   - **Divider:** 1px line, `rgba(25,40,55,0.12)`, margin `0 24px`.
   - **Nav links:** Each link staggers in from right (x: 24 to 0, delay `0.18 + i * 0.07`, duration 0.4s). Font size `1.1rem`, rounded-xl, hover `bg-black/10`.
   - **CTA buttons:** Same "Start For Free" (`#7342E2`) and "Sign In" (`#F2F2EE`) as desktop, full-width, `py-3.5 rounded-full`, font size `0.95rem`.

---



### Hero Content



- Centered container, max-width `1280px`, `relative z-10`.
- Padding top: `clamp(40px, 8vw, 72px)`, bottom `48px`.
- Inner content wrapper: max-width `660px`, centered.

**Heading (`<h1>`):**

- Font: `var(--font-heading)`.
- Size: `clamp(1.65rem, 5vw, 3rem)`.
- Line-height: `1.05`, letter-spacing: `-0.01em`.
- Color: `var(--color-text)`.
- Text-align: center.
- Two lines:

  - Line 1 (nowrap): `Lock` [Zap icon 24px] `Down Your` [LockKeyhole icon 24px] `Passwords`
  - Line 2: `with Ironclad Security` [Fingerprint icon 24px]
- All inline icons: color `#192837`, `display: inline`, `verticalAlign: middle`, `position: relative`, `top: -2px`, margin `0 4px` (Fingerprint has `marginLeft: 6px` only).
- Animates: fade-up from `y: 28`, `opacity: 0`, duration 0.6s, ease `[0.22, 1, 0.36, 1]`, delay `0 * 0.15`.

**Subtext (`<p>`):**

- Font: `var(--font-body)`.
- Size: `clamp(0.9rem, 2.5vw, 1.1rem)`.
- Color: `var(--color-text)` at `opacity: 0.8`.
- Max-width: `560px`, line-height `1.65`, text-align center.
- Copy: "Zero stress, total control. Unbreakable storage, one-tap access, and pro-grade tools for your non-stop world."
- Animates: same fade-up, delay `1 * 0.15`.

**CTA Button:**

- Pill button (`borderRadius: 50px`), background `#7342E2`, white text.
- Size: `clamp(0.9rem, 2vw, 1rem)`, padding `17px 24px`, min-width `210px`.
- Box-shadow: `0 4px 24px rgba(115,66,226,0.28)`.
- Flexbox with `justify-between`, gap `32px`.
- Label: "Get It Free" with `ArrowRightCircle` icon (20px) on right.
- Hover: `scale: 1.04, brightness(1.1)`. Tap: `scale: 0.96`.
- Animates: same fade-up, delay `2 * 0.15`.

---



### Animation System (Framer Motion variants)



All hero elements use a shared `fadeUp` variant:

```Plain Text
hidden: { opacity: 0, y: 28 }
visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
```



---



### Dependencies



- `react`, `react-dom` (v18)
- `framer-motion`
- `lucide-react` (icons: ArrowRightCircle, Zap, LockKeyhole, Fingerprint, Menu, X)
- Tailwind CSS 3 with default config, no custom theme extensions
- Vite + TypeScript


---

# 005 Art Landing

# Art Landing

Build a two-section scroll-based landing page using React 19, TypeScript, Vite, Tailwind CSS v4, and `motion/react` (Framer Motion). The page uses Manrope, Italiana, and Marck Script fonts, with a video hero and a red second section featuring a cloud transition.



## Setup



**package.json dependencies:**

- `react` ^19, `react-dom` ^19
- `motion` ^12 (for `motion/react`)
- `tailwindcss` ^4.1, `@tailwindcss/vite` ^4.1
- `vite` ^6, `@vitejs/plugin-react` ^5
- `lucide-react`, `typescript` \~5.8

**vite.config.ts:** include `@vitejs/plugin-react` and `@tailwindcss/vite` plugins.



## src/index.css



```CSS
@import url('https://fonts.googleapis.com/css2?family=Italiana&family=Manrope:wght@400;600&family=Marck+Script&display=swap');
@import "tailwindcss";

@theme {
  --font-manrope: "Manrope", sans-serif;
  --font-italiana: "Italiana", serif;
  --font-marck: "Marck Script", cursive;
}
```



## src/App.tsx — Structure



**Root:** `<main>` with ref `containerRef`, classes `h-screen overflow-y-auto overflow-x-hidden font-manrope bg-black relative`.



**Scroll setup:**

```TypeScript
const containerRef = useRef<HTMLDivElement>(null);
const { scrollY } = useScroll({ container: containerRef });
const cloudYDesktop = useTransform(scrollY, [0, 300], [0, -100]);
const cloudYMobile  = useTransform(scrollY, [0, 300], [0, -24]);
```



### Section 1 — Video Hero



`<section className="relative h-screen w-full flex-shrink-0 overflow-hidden">`



- **Background video** (absolute inset-0, z-10, `w-full h-full object-cover`, autoPlay loop muted playsInline):

  - src: `https://res.cloudinary.com/daklr2whx/video/upload/v1778592404/baby-track-video_e968wn.mp4`
- **Overlay** `absolute inset-0 z-30 pointer-events-none`.

**Top-left logo block** (`absolute top-[24px] left-[20px] md:top-[64px] md:left-[64px] pointer-events-auto max-w-[calc(100vw-140px)] md:max-w-none`):

- Flex row, gap-[16px] md:gap-[24px], items-center.
- SVG logo, white fill, 48x48 mobile / 64x64 desktop, viewBox `0 0 120 120`, path:

`M60 120C26.8629 120 0 93.1371 0 60V0C22.5654 0 42.2213 12.4569 52.4662 30.8691C38.4788 34.2089 28.0787 46.7902 28.0787 61.8006V63.1443C28.0787 79.9648 41.7146 93.6006 58.5353 93.6006H59.8789L59.8785 61.8006C59.8785 79.3633 74.1159 93.6006 91.6787 93.6006L91.6787 61.8006C91.6787 44.2783 77.5071 30.0661 60 30.0008L60 0H62.5352C94.2722 0 120 25.7279 120 57.4648V60C120 93.1371 93.1371 120 60 120Z`

- Tagline: white, `text-[11px] md:text-[16px] w-[112px] md:w-auto leading-[1.2] font-semibold tracking-[0.02em]`.

  - Desktop (`hidden md:block`): "Effortless Growth / Operations. We Handle All Tasks. / Stay Calm." with `<br />` after each.
  - Mobile (`block md:hidden`): "Complete Business / Automation. We Handle All / Tasks. You Relax."

**Left description** (desktop only, below logo): `hidden md:flex mt-[400px] flex-col gap-[24px] w-full max-w-[320px] text-white text-[14px] font-normal leading-relaxed`. Two paragraphs about SaaS automation.



**Top-right CTA button** (`absolute top-[24px] right-[20px] md:top-[64px] md:right-[64px]`):

`px-5 py-3 md:px-10 md:py-7 border border-white rounded-[100%] text-white text-[12px] md:text-[18px] font-italiana uppercase tracking-widest hover:bg-white/10 hover:backdrop-blur-[48px] transition-all duration-300 cursor-pointer bg-black/10 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none`

Label: "Get started".



**Bottom heading container** (`absolute bottom-[32px] left-[20px] right-[20px] md:left-auto md:bottom-[64px] md:right-[64px] md:max-w-[1200px] text-left md:text-right`):

- Mobile paragraphs (`md:hidden flex flex-col gap-[16px] max-w-[280px] text-white text-[12px] font-normal mb-[32px]`).
- `<h1 className="text-white text-[36px] leading-[1.1] md:text-[96px] font-italiana md:leading-[88px]">`:

  - Desktop: "Intelligent Daily / Routine Automation / For Your Business. / You Relax".
  - Mobile (`text-[32px]`): "Intelligent Daily Routine / Automation For Your / Business. You Relax".

### Section 2 — Red Background



`<section className="relative min-h-screen w-full bg-[#FF0000] flex flex-col z-10">`



**Cloud overlays** (two `motion.div`, one desktop, one mobile, both absolute top-0 left-0 w-full z-[100] pointer-events-none `-translate-y-1/2`):

- style `y: cloudYDesktop` / `y: cloudYMobile`.
- `<img src="``https://res.cloudinary.com/daklr2whx/image/upload/v1778597725/cloude_ws7l3z.png``" className="w-full h-auto block" referrerPolicy="no-referrer" />`

**Content wrapper:** `flex-1 flex flex-col items-center w-full pt-[100px] md:pt-[400px]`.



Inner content block (`flex flex-col items-center w-full px-8 text-center z-20 relative max-w-[900px] h-auto md:h-[620px] mx-auto`):

- Same SVG logo, 80x80, white.
- Paragraph: `text-white text-[16px] h-[100px] max-w-[400px] leading-[1.6] mb-[40px] uppercase tracking-wider mx-auto`. Text: "We built this platform with a single purpose to eliminate operational chaos and restore balance to your daily business routine".
- Signature: `font-marck text-white text-[120px] leading-none mb-[32px]` reading `S.P.D`.
- Two centered paragraphs: white, `text-[16px] w-[400px] max-w-full`, font-light, first with `mb-[24px]`, container `mb-[100px] md:mb-24`.

**Bottom video block** (`relative w-full shrink-0`):

- Top fade: `absolute top-0 left-0 w-full h-[100px] bg-gradient-to-b from-[#FF0000] to-transparent z-10 pointer-events-none`.
- Video (autoPlay loop muted playsInline, `w-full h-auto block object-contain`):

  - src: `https://res.cloudinary.com/daklr2whx/video/upload/v1778602552/track-video_2_s9lp53.mp4`

## Animations

- Cloud parallax: maps scroll 0→300px to translateY 0→-100px (desktop) and 0→-24px (mobile), via `useTransform` with the section's container scroll.
- Button hover: background fades to `white/10` with `backdrop-blur-[48px]` over 300ms.

## Notes

- Videos are Cloudinary, not CloudFront. There are no CloudFront URLs in this project.
- All assets above are the only external URLs used.


---

# 006 Pulse 3D

# Pulse 3D

## PROJECT OVERVIEW



Build a **single-screen, scroll-driven, custom-gesture landing page** called **"Inner Circle"**. There is **no native browser scrolling** — `document.body` and `html` both have `overflow: hidden`. A wheel/touch gesture controller drives a single `scrollProgress` numeric state from `0` to `3.5`. All animations (video scrubbing, text exits, rising panel, cylindrical drum) are derived from this single value.



### Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **GSAP 3.15** for char-level split-text and parallax wiggle
- **lucide-react** for menu icons (`Menu`, `X`)
- `motion`, `@google/genai`, `express`, `dotenv` installed (the page itself only needs GSAP + Tailwind + React)

### Fonts (loaded in `src/index.css`)

```CSS
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Michroma&display=swap');
@import "tailwindcss";

@theme {
  --font-manrope: "Manrope", sans-serif;
  --font-michroma: "Michroma", sans-serif;
}
```

- Use `font-manrope` for body, paragraph drum text, header subtitle, nav.
- Use `font-michroma` for the giant hero title and tile labels.

### Global CSS (also in `index.css`)

```CSS
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #11010a; }
::-webkit-scrollbar-thumb { background: #ea1f63; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #ff5c93; }

html, body {
  background-color: #11010a;
  color: #ffffff;
  overflow-x: hidden;
  font-family: var(--font-manrope);
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-container {
  display: flex; overflow: hidden; width: 100%; position: relative;
  mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
}
.marquee-track {
  display: flex; width: max-content; flex-wrap: nowrap;
  animation: marquee-scroll linear infinite;
  will-change: transform;
}
```



### Color palette

- Hero background magenta: `#FF005E`
- Second screen near-black/wine: `#11010a`
- Loader accents: `#ea1f63`, `pink-500` (`#ec4899`), `#ff5c93`
- Text: white (`#ffffff`) and `text-white/60` for low-emphasis drum copy
- **No purple/indigo anywhere.**

### Data files



`src/types.ts`:

```TypeScript
export interface NavigationItem { id: string; label: string; scrollRatio: number; }
export interface Project { title: string; category: string; description: string; tags: string[]; }
export interface ExpertiseItem { title: string; percentage: number; description: string; }
```



`src/data.ts`:

```TypeScript
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "projects",  label: "Projects",  scrollRatio: 0.25 },
  { id: "expertise", label: "Expertise", scrollRatio: 0.50 },
  { id: "about",     label: "About",     scrollRatio: 0.95 },
  { id: "contact",   label: "Manifesto", scrollRatio: 3.50 },
];
```

(Keep `PROJECTS_DATA` and `EXPERTISE_DATA` as defined — unused on this page but kept for parity.)



---



## ROOT LAYOUT (`src/App.tsx`)



### State

- `scrollProgress: number` (0 → 3.5)
- `lerpedScrollProgress: number` — smoothed copy of `scrollProgress`, updated each rAF tick with `currentLerp += (target - currentLerp) * 0.08`. Threshold `0.0001`.
- `activeSectionId: string` — derived via `updateActiveSection(progress)`:

  - `< 0.18` → "hero"
  - `0.18–0.45` → "projects"
  - `0.45–0.68` → "expertise"
  - `0.68–1.15` → "about"
  - else → "contact"

### Gesture controller (runs once on mount)

- Sets `document.body.style.overflow = "hidden"` and same on `documentElement`.
- `wheel` listener (passive: false, `preventDefault()`): `scaleFactor = 0.0006`, new value = `clamp(prev + deltaY * 0.0006, 0, 3.5)`.
- `touchstart` saves `lastTouchY`. `touchmove`: `deltaTouchY = lastTouchY - currentTouchY`, `scaleFactor = 0.0015`, clamp same range.
- If a programmatic nav animation is in flight, cancel it on any user input.

### Programmatic navigation (`handleNavigateToSection`)

- Duration: `1200ms`, easeInOutCubic:

  ```Plain Text
  ease = p < 0.5 ? 4p³ : 1 - (-2p + 2)³ / 2
  ```
- Lerps `scrollProgress` from current to `item.scrollRatio` while calling `updateActiveSection` each frame.

### Derived values

```TypeScript
const secondScreenProgress = clamp01((lerped - 1.15) / 0.50);
const easedRisingProgress  = 1 - Math.pow(1 - secondScreenProgress, 3);
const smoothBlurAmount     = Math.sin(secondScreenProgress * Math.PI / 2) * 64;
```



### Markup skeleton

```TypeScript
<main className="relative w-screen h-screen overflow-hidden bg-[#FF005E] text-white">
  <div className="relative w-full h-full overflow-hidden">

    {/* FIRST SCREEN — gets blurred as second screen rises */}
    <div
      className="absolute inset-0 w-full h-full z-10 transition-transform duration-[100ms] ease-out"
      style={{ filter: secondScreenProgress > 0 ? `blur(${smoothBlurAmount}px)` : "none" }}
    >
      <VideoScrubber scrollProgress={Math.min(1, lerpedScrollProgress)} />

      {/* Hero title strip pinned to bottom */}
      <div className="absolute bottom-[40px] left-[1%] right-[1%] w-[98%] pointer-events-none z-20 select-none flex justify-center items-center">
        <ScrollExitSplitText
          scrollProgress={Math.min(1, lerpedScrollProgress)}
          containerClassName="w-full text-[10.4vw] leading-none font-michroma font-normal uppercase text-white whitespace-nowrap text-center transition-all duration-300 will-change-transform"
          style={{ letterSpacing: "-0.07em" }}
        >
          INNER CIRCLE
        </ScrollExitSplitText>
      </div>

      <SoapTiles scrollProgress={lerpedScrollProgress} />
    </div>

    <Header activeSectionId={activeSectionId} onNavigate={handleNavigateToSection} />

    {/* SECOND SCREEN — rises from below, rounded top */}
    <div
      className="absolute bottom-0 left-0 w-full h-full bg-[#11010a] rounded-t-[48px] overflow-hidden z-40"
      style={{
        transform: `translateY(${(1 - easedRisingProgress) * 100}%)`,
        visibility: secondScreenProgress > 0 ? "visible" : "hidden",
        willChange: "transform",
      }}
    >
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-[5px] bg-white rounded-full z-50 pointer-events-none" />
      <SecondVideoScrubber scrollProgress={lerpedScrollProgress} />
      <CylindricalTextDrum scrollProgress={lerpedScrollProgress} />

      <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-0 w-full sm:w-[65%] md:w-[60%] pl-6 sm:pl-12 md:pl-20 pr-6 sm:pr-12 md:pr-16 z-50 pointer-events-auto">
        <div className="w-full border-t border-white/[0.08] pt-6">
          <Marquee gap="80px" speed={25} fade>
            <GoogleWordmark size={100} />
            <GithubWordmark size={100} />
            <img src="https://raw.githubusercontent.com/dsMagnatov/Acreage-landing-assets/refs/heads/main/voiceflow-logo-svg-150px.svg" alt="Voiceflow" className="h-6 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            <img src="https://raw.githubusercontent.com/dsMagnatov/Acreage-landing-assets/refs/heads/main/zendesk-logo-svg-150px.svg"   alt="Zendesk"   className="h-6 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            <img src="https://raw.githubusercontent.com/dsMagnatov/Acreage-landing-assets/refs/heads/main/pendo-logo-svg-150px.svg"     alt="Pendo"     className="h-6 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            <img src="https://raw.githubusercontent.com/dsMagnatov/Acreage-landing-assets/refs/heads/main/glide-logo-svg-150px.svg"     alt="Glide"     className="h-6 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
            <img src="https://raw.githubusercontent.com/dsMagnatov/Acreage-landing-assets/refs/heads/main/canva-logo-svg-150px.svg"     alt="Canva"     className="h-6 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
          </Marquee>
        </div>
      </div>
    </div>
  </div>
</main>
```



---



## SECTION 1 — HERO (First Screen)



### 1a. Background video — `VideoScrubber`

- **Video URL (exact):**

`https://res.cloudinary.com/daklr2whx/video/upload/v1780426426/202606021731-ezremove_einsc0.mp4`

- `<video>` is `playsInline muted preload="auto"`, `object-cover`, full size, `pointer-events-none`.
- Wrapped in a `style={{ scale: "1.05" }}` div with `will-change-transform`. Container background is `bg-[#FF005E]`.
- **Scrub algorithm:** On every rAF tick:

  - `targetTime = clamp(scrollProgress * duration, 0, duration)` (fallback duration `4.2`).
  - `current += (target - current) * 0.15` (lerp).
  - Seek only when `!video.seeking && Math.abs(video.currentTime - current) > 0.01` → `video.currentTime = current`.
- **GSAP mouse parallax** on the container: on `mousemove`, compute `mx = e.clientX/innerWidth - 0.5`, `my = ...`. Animate `x: -mx*40, y: -my*40, duration: 1.2, ease: "power2.out", overwrite: "auto"`.
- **Loader overlay** (while `!isLoaded`): full-bleed `bg-[#FF005Ef4]`, centered: a 64×64 wrapper with `animate-ping` pink-500/20 ring + a 40×40 spinner ring (`border-4 border-[#ea1f63]/20 border-t-[#ea1f63] animate-spin`), label "LOADING SCROLL STREAM..." in `font-manrope font-semibold text-[12px] uppercase tracking-[0.25em] text-pink-500 drop-shadow-[0_0_8px_rgba(234,31,99,0.4)]`.

### 1b. Hero title — `ScrollExitSplitText`

- Text: `INNER CIRCLE`
- Class on outer container (from App): `text-[10.4vw] leading-none font-michroma font-normal uppercase text-white whitespace-nowrap text-center`, `letterSpacing: -0.07em`.
- Positioned: `absolute bottom-[40px] left-[1%] right-[1%] w-[98%]`, `z-20`, `pointer-events-none`.
- **Split-text mechanic:** split into lines → words → characters. Each char is a `span.char inline-block will-change-transform`. Words separated by a literal `&nbsp;` span.
- **GSAP timeline** (paused, controlled by scroll):

  ```TypeScript
  tl.fromTo(chars,
    { opacity: 1, yPercent: 0, y: 0, scaleY: 1, scaleX: 1, transformOrigin: "50% 0%" },
    { opacity: 0, yPercent: 300, y: "25vh", scaleY: 1.2, scaleX: 0.9, stagger: 0.03, ease: "power2.inOut" }
  );
  ```
- On every `scrollProgress` change: `gsap.to(timeline, { progress: scrollProgress, duration: 0.6, ease: "power1.out", overwrite: "auto" })`. This produces a smooth lag/scrub.

### 1c. Reveal tiles — `SoapTiles`

- Three white pill-cards stacked vertically on the left:

  1. `Private Discord & Networking` — baseXOffset `120`, delay `0ms`
  2. `Weekly Market Alpha Drops` — baseXOffset `180`, delay `100ms`
  3. `Exclusive Web3 Tooling Access` — baseXOffset `240`, delay `200ms`
- Container: `absolute left-4 right-4 md:left-[64px] top-[38%] md:top-1/2 -translate-y-1/2 flex flex-col gap-2 md:gap-[10px] z-40 pointer-events-auto transition-all duration-[800ms] ease-out`. Hidden state: `opacity-0 -translate-x-6 md:-translate-x-12 pointer-events-none`. Visible when `scrollProgress > 0.75`.
- Each tile class: `group relative h-[52px] sm:h-[72px] md:h-[138px] text-black bg-white rounded-xl sm:rounded-2xl md:rounded-[34px] flex items-center justify-center px-4 sm:px-8 md:px-14 w-full md:w-auto md:self-start cursor-pointer origin-left transition-all duration-[400ms] cubic-bezier(0.16, 1, 0.3, 1) whitespace-nowrap`.
- **Entry animation:** `easeProgress = clamp01((scrollProgress - 0.75) / 0.22)`. Each tile:

  - `translateX = (easeProgress - 1) * responsiveOffset` (on mobile, offset is `× 0.25`)
  - `opacity = easeProgress`
  - `filter = blur(${(1 - easeProgress) * 12}px)`
- **Hover behavior (desktop only):** hovered tile scales `1.2`. Non-hovered tiles shift vertically by `±13.8px` (`baseHeight * 0.1`, with `baseHeight` 138/52) — up if above hovered, down if below. On mobile, hover scale stays `1.0`.
- Label inside each tile: `font-michroma font-medium text-[11px] sm:text-[14px] md:text-[23px] leading-[16px] sm:leading-[22px] md:leading-[34px] tracking-tight`, `letter-spacing: -0.03em`.

### 1d. Header — `Header`

- Container: `absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 md:top-[64px] md:left-[64px] md:right-[64px] flex items-center justify-between z-40`.
- **Logo group (left):** clicking navigates to scrollRatio `0`. Contains:

  - `Logo` — 48×48 SVG with this exact path: a stylized "M" mark (`viewBox="0 0 80 80"`, single `<path>`, see code snippet below).
  - Subtitle (hidden < sm): three lines `Full Workflow Automation.` / `We Manage Everything. You` / `Unwind.` in `font-manrope font-normal tracking-wide text-[12px] leading-[16px] text-white`.
- **Desktop nav (≥ md):** the 4 NAVIGATION_ITEMS as buttons: `font-manrope font-medium text-[12px] leading-[16px] tracking-wider text-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all duration-300`.
- **Mobile burger:** circular `w-10 h-10 rounded-full border border-white/10 bg-white/5`. Toggles a full-screen overlay `fixed inset-0 bg-[#11010a]/98 backdrop-blur-xl z-30` with each item in `font-michroma text-[16px] uppercase tracking-widest py-4 px-6 border-b border-white/5`; active item: `text-[#FF005E] font-semibold`.

Logo path (exact):

```Plain Text
M40 80C17.9086 80 0 62.0914 0 40V0C15.0436 0 28.1476 8.30466 34.9776 20.5796C25.6529 22.8063 18.7198 31.1937 18.7198 41.2004V42.0962C18.7198 53.3099 27.8104 62.4004 39.0242 62.4004H39.9199L39.9197 41.2004C39.9197 52.9088 49.4113 62.4004 61.1198 62.4004L61.1198 41.2004C61.1198 29.5187 51.6717 20.0437 40 20.0005L40 0H41.6902C62.8481 0 80 17.1519 80 38.3099V40C80 62.0914 62.0914 80 40 80Z
```



---



## SECTION 2 — SECOND SCREEN (Rising Panel)



### Reveal mechanics

- Triggered when `lerpedScrollProgress > 1.15`. Becomes fully on-screen at `1.65`.
- Panel: `absolute bottom-0 left-0 w-full h-full bg-[#11010a] rounded-t-[48px] overflow-hidden z-40`.
- `transform: translateY((1 - easedRisingProgress) * 100%)` where `easedRisingProgress = 1 - (1 - secondScreenProgress)^3`.
- `visibility: hidden` when `secondScreenProgress === 0`.
- While rising, the **first screen blurs** up to `64px` via `Math.sin(p * π/2) * 64`.
- **iOS grab-handle pill:** `absolute top-5 left-1/2 -translate-x-1/2 w-16 h-[5px] bg-white rounded-full z-50 pointer-events-none`.

### 2a. Background video — `SecondVideoScrubber`

- **Video URL (exact):**

`https://res.cloudinary.com/daklr2whx/video/upload/v1780430770/20260602182_x923bh.mp4`

- Same component skeleton as `VideoScrubber` but with these differences:

  - Background color of the loader bg: `bg-[#11010af4]`.
  - `DRUM_START = 1.45`, `DRUM_END = 3.50`.
  - `drumProgress = clamp01((scrollProgress - 1.45) / (3.50 - 1.45))`, `target = drumProgress * duration`.
  - Same lerp `0.15`, same `!video.seeking && diff > 0.01` guard.
  - Same GSAP mouse parallax `x/y: ±40px, duration 1.2, ease "power2.out"`.
  - Loader label: `LOADING DRUM STREAM...` with `border-pink-500/20 border-t-pink-500`.

### 2b. Cylindrical text drum — `CylindricalTextDrum`

- Container: `absolute inset-y-0 left-0 w-full sm:w-[65%] md:w-[60%] z-30 flex flex-col items-start justify-center pointer-events-none select-none text-left pl-6 sm:pl-12 md:pl-20 py-16`, with `perspective: 1000px; perspectiveOrigin: 25% 50%`.
- Inner: `relative w-full h-[85vh] flex flex-col justify-center items-start overflow-visible` with `transformStyle: "preserve-3d"`.
- **Geometry:** `R = 380`, `lineHeight = 32`.
- `targetIndex = clamp01((scrollProgress - 1.45) / 2.05) * (LINES.length - 1)`.
- For each line `idx`:

  - `indexDiff = idx - targetIndex`
  - `translateY = indexDiff * 32`
  - `angleRad = translateY / 380`, `angleDeg = angleRad * 180/π`
  - `translateZ = cos(angleRad) * 380 - 380`
  - `baseScale = 0.78 + cos(angleRad) * 0.22`
  - `opacity = max(0, (cos(angleRad) - 0.2) / 0.8)`
  - `depthBlur = min(8, max(0, (|indexDiff| - 1.5) * 0.75))`
  - Apply `transform: translateY(${ty}px) translateZ(${tz}px) rotateX(${-angleDeg * 0.8}deg) scale(${baseScale})`, `transformOrigin: "left center"`, plus blur when > 0.1.
- Each line `<p>`: `font-manrope text-[18px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-semibold leading-[0.90] tracking-tight whitespace-nowrap`, `letter-spacing: -0.035em`.
- Text segments: if `highlight === true` use `text-white font-bold opacity-100`; else `text-white/60`. Empty `""` line renders a sized spacer at `opacity * 0.3`.
- **Use the exact `LINES` array below — 32 entries (one empty string at index 15):**

```Plain Text
1.  Welcome to the [ultimate convergence]
2.  of [digital rebels], [underground creators],
3.  and [top-tier product builders] who
4.  refuse to follow [guidelines].
5.  This is where [high-end design principles]
6.  meet [pure technical execution],
7.  without the [corporate bureaucracy] and
8.  meaningless [standard aesthetics].
9.  We [gather in the shadows] to build
10. the [next generation] of [scalable interfaces],
11. [automated workflows], and [decentralized assets]
12. that move the [cultural needle forward].
13. Experience [zero-bullshit networking],
14. weekly [alpha allocations], and [unreleased]
15. [toolkits] to shape the [internet's landscape].
16. (empty line)
17. This is [not another social club]
18. for casual enthusiasts or [template consumers].
19. This is a [highly selective environment]
20. engineered for [hyper-productive creators],
21. [UI/UX visionaries], and [AI prompt architects]
22. who operate at the [absolute limits]
23. of [digital product creation].
24. Our [framework is simple]:
25. [eliminate intermediate noise],
26. [automate the execution layer],
27. and [deploy elite digital products]
28. while others are still [scheduling meetings].
29. We loop through [complex design systems],
30. [break conventional grids], and
31. [execute fluid interactions] that
32. [redefine digital environments].
```

(Words in `[brackets]` are `highlight: true`.)



### 2c. Logo marquee — `Marquee`

- Position: `absolute bottom-8 sm:bottom-12 md:bottom-16 left-0 w-full sm:w-[65%] md:w-[60%] pl-6 sm:pl-12 md:pl-20 pr-6 sm:pr-12 md:pr-16 z-50`.
- Inside a wrapper `border-t border-white/[0.08] pt-6`.
- `<Marquee gap="80px" speed={25} fade>` produces two duplicated tracks animated infinitely with the keyframe `marquee-scroll` (0% → -50%) over `25s` linear infinite, masked with a left/right transparent fade at 15%/85%.
- Children in order: `<GoogleWordmark size={100} />`, `<GithubWordmark size={100} />`, then `<img>` tags for these exact URLs, each styled `h-6 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity`, `referrerPolicy="no-referrer"`:

  - `https://raw.githubusercontent.com/dsMagnatov/Acreage-landing-assets/refs/heads/main/voiceflow-logo-svg-150px.svg`
  - `.../zendesk-logo-svg-150px.svg`
  - `.../pendo-logo-svg-150px.svg`
  - `.../glide-logo-svg-150px.svg`
  - `.../canva-logo-svg-150px.svg`
- `GoogleWordmark` and `GithubWordmark` are inline `<svg>` wordmarks at `viewBox="0 0 115 30"` / `0 0 110 30` — see file for exact text/paths.

---



## INTERACTIONS — Summary table



| Trigger | Effect |
|-|-|
| Mouse wheel | `scrollProgress += deltaY * 0.0006`, clamp `[0, 3.5]` |
| Touch drag | `scrollProgress += (lastY - currentY) * 0.0015` |
| Nav click | 1200ms easeInOutCubic lerp to target ratio |
| `scrollProgress` 0 → 1 | Hero video scrubs forward, "INNER CIRCLE" chars fall (300% y, 25vh) with 0.03 stagger |
| `scrollProgress` > 0.75 | Soap tiles fade/slide in (over a 0.22 range), with 12px → 0 blur |
| Hover tile (desktop) | Hovered tile scales 1.2, neighbors shift ±13.8px |
| `scrollProgress` > 1.15 | Second screen rises (ease-out cubic), first screen blurs to 64px |
| `scrollProgress` 1.45 → 3.50 | Second video scrubs; cylindrical drum rotates; line at center is at scale 1.0/opacity 1.0 |
| Mouse move (anywhere) | Both videos parallax-translate ±40px via GSAP `power2.out`, 1.2s |



---



## DATA PERSISTENCE



Supabase is available. This page is presentational and does not persist user state, so no database tables are required for the recreation. If extending with capture forms, waitlist sign-ups, or analytics events, create a Supabase table with RLS enabled and `auth.uid()`-based policies (one INSERT policy for `authenticated`, restrictive SELECT).



---



## FILE STRUCTURE



```Plain Text
src/
  App.tsx
  main.tsx
  index.css
  types.ts
  data.ts
  components/
    Header.tsx
    Logo.tsx
    Logos.tsx                 (GoogleWordmark, GithubWordmark exported)
    Marquee.tsx
    VideoScrubber.tsx
    SecondVideoScrubber.tsx
    ScrollExitSplitText.tsx
    SoapTiles.tsx
    CylindricalTextDrum.tsx
```


---

# 007 Velorah

# Velorah


---

# 008 Luxury Real Estate

# Luxury Real Estate

Build a single-page React + TypeScript + Tailwind CSS + Vite landing page for a luxury real estate brand named "Velar.". Use only `lucide-react` for icons. The app is in `src/App.tsx`. Use the exact specifications below.



Global Setup



- Page background: `#f5f0ea` (warm off-white).
- Body wrapper: `overflow-x: clip`.
- Fonts (loaded via `@import` inside an inline `<style>` block):

  - Primary: `Syne` weights 400, 700, 800, 900 from Google Fonts.
  - Secondary: `Inter` weights 300, 400, 500, 600 from Google Fonts.
- Constants:

  - `GRASS_GREEN = '#213138'` (deep teal — used for preloader background and default logo color).
  - `FULL_TEXT = 'Velar.'`
  - `HOUSE_IMG = '``https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780471903/building_bzziky.png'`
  - `BG_IMG = '``https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260603_073200_7082add5-f1f8-4873-8696-d6f78a44089b.png&w=1920&q=85`
- Gallery videos (5, in order):

  1. `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260528_154759_4cdc8175-8261-497c-b688-9477c76545d4.mp4`
  2. `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260528_154751_39b1b9bb-2708-4211-b6a2-d39f93309e52.mp4`
  3. `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260528_154737_eba7900c-0313-483c-a30a-632c747ccc42.mp4`
  4. `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_144009_4348fe33-f885-4345-8e92-3fe1c2625d32.mp4`
  5. `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_145337_e44eaa8c-6bb1-4a6e-a70f-ed0231cbaccb.mp4`

Section 1 — Preloader / Intro Overlay



- Fixed full-viewport overlay (`z-index: 100`) filled with `#213138`, centered flex.
- Renders an animated typewriter of the word `Velar.` in Syne, font-size `2.6rem`, color white, letter-spacing `-0.02em`. Letters use weight 700 except `.` which is weight 900.
- A blinking white cursor (3px × 1.1em rounded bar, animation `blink 0.7s step-end infinite` toggling opacity 0/1) follows the last typed letter.
- Timings (using `setTimeout`):

  - `CHAR_INTERVAL = 140ms`, `TYPE_START = 600ms`.
  - Reveal letters one at a time at `TYPE_START + i * CHAR_INTERVAL`.
  - `LIFT_AT = TYPE_START + 6 * CHAR_INTERVAL + 700ms`.
  - Hide cursor at `LIFT_AT − 150ms`.
  - Start "lifting" the overlay upward at `LIFT_AT`: `transform: translateY(-100%)` with transition `transform 1.5s cubic-bezier(0.45, 0, 0.15, 1)`.
  - At `LIFT_AT + 1300ms`, fade in the hero text (`opacity 0 → 1`, `translateY(-28px) → 0`, transition `0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s`).
  - At `LIFT_AT + 2100ms`, set `liftDone` true and disable the overlay's transition (so it stays parked off-screen).

Section 2 — Fixed Navigation



- Fixed top nav `z-50`, padding `px-6 md:px-10 lg:px-16`, `py-5 md:py-6`, flex justify-between.
- Left: word `Velar.` in Syne, `text-xl`, weight 700 for letters and 900 for `.`. Color = `navColor` (see scroll behavior).
- Right: hamburger toggle button. Two stacked 28px-wide × 1px lines, top one shrinks to `w-5` on hover. When open, swap to a Lucide `X` icon, size 24.
- Scroll behavior: track whether any "dark section" (refs to Section 4 and Section 5) currently overlaps the viewport top (`rect.top <= 0 && rect.bottom > 0`). If so, `navOnDark = true` and `navColor = '#ffffff'`. Otherwise `navColor = '#213138'`. Color transitions: `color 0.35s ease`.
- Mobile menu: when open, full-screen `#f5f0ea` overlay (`z-40`) centered with 4 vertically stacked links: `Residences`, `Story`, `Listings`, `Inquire`. Each link is Syne, `text-4xl`, `font-light`, `tracking-widest`, uppercase, black with hover `text-gray-500`. Click closes menu.

Section 3 — Hero



- `<section>` `position: relative`, `min-height: 100vh`, `overflow: visible`.
- Background: `BG_IMG` as `background-image`, `background-size: cover`, `background-position: center center`, `background-repeat: no-repeat`.
- Hero text block (`.hero-text-block`) inside, `z-index: 10`, hidden initially, fades+slides in (see preloader timings).
- Top row (`.hero-heading-top`, padded `px-6 md:px-10 lg:px-16`, flex `items-end justify-between`, `margin-bottom: -0.04em`):> Stately homes built with vision,> scope, and architectural finesse.

  - Left: `LIVE IN` — Syne 800, uppercase, black, `letter-spacing: -0.03em`, `line-height: 1`. Size via CSS class `.hero-own-the`.
  - Right (desktop only ≥1024px, `.hero-subtitle-desktop`): two-line right-aligned paragraph in Syne 700, `clamp(10px, 0.95vw, 14px)`, max-width 300px, opacity 0.7, line-height 1.6, margin-bottom `0.2em`, letter-spacing `0.02em`:
- Headline row (wrapped in `overflow: hidden`):

  - `IRREPLACEABLE` — Syne 800, uppercase, black, `letter-spacing: -0.03em`, padded `px-6 md:px-10 lg:px-16`. Size via `.hero-extraordinary`.
- Mobile/tablet subtitle (`.hero-subtitle-mobile`, padded `px-6`), Syne 600, `clamp(12px, 3vw, 15px)`, opacity 0.65, margin-top `0.9em`:

\> Premium real estate with vision,

\> depth, and architectural clarity.

Hero Responsive Type Sizes



```CSS
@media (max-width: 639px) {
  .hero-subtitle-desktop { display: none !important; }
  .hero-subtitle-mobile  { display: block !important; }
  .hero-text-block { padding-top: 90px !important; }
  .hero-heading-top { justify-content: flex-start !important; }
  .hero-own-the { font-size: 7.5vw !important; }
  .hero-extraordinary { font-size: 14.5vw !important; white-space: normal !important; word-break: break-word !important; line-height: 0.9 !important; }
}
@media (min-width: 640px) and (max-width: 1023px) {
  .hero-subtitle-desktop { display: none !important; }
  .hero-subtitle-mobile  { display: block !important; }
  .hero-text-block { padding-top: 110px !important; }
  .hero-heading-top { justify-content: flex-start !important; }
  .hero-own-the { font-size: 5.5vw !important; }
  .hero-extraordinary { font-size: 11vw !important; white-space: normal !important; word-break: break-word !important; line-height: 0.9 !important; }
}
@media (min-width: 1024px) {
  .hero-subtitle-desktop { display: block !important; }
  .hero-subtitle-mobile  { display: none !important; }
  .hero-text-block { padding-top: calc(28vh - 50px) !important; }
  .hero-own-the { font-size: 3vw !important; }
  .hero-extraordinary { font-size: clamp(52px, 6.5vw, 9vw) !important; white-space: nowrap !important; line-height: 0.88 !important; }
}
```



Section 4 — Scroll-Driven House Animation (the centerpiece)



- A `position: fixed` wrapper at `z-index: 22`, `pointer-events: none`, `will-change: transform`, default `bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; min-width: 1400px;`.
- Inside, an inner div performs the initial "rise from below" entrance: starts at `translateY(102vh)`, transitions to `translateY(0)` with `transform 1.5s cubic-bezier(0.45, 0, 0.15, 1) 0.4s`, triggered when `lifting` becomes true. Once `liftDone` true the transition is removed so the scroll handler can take over.
- Renders \`\` at width 100%, aria-hidden.
- After `liftDone`, a scroll/resize listener (`updateHousePosition`) computes:

  - `baseW = max(window.innerWidth, 1400)`.
  - `triggerPoint = -(heroH  0.30)` — animation starts when 30% of hero has scrolled off.
  - `endPoint = heroRect.top - (darkRect.bottom - vh)` — ends when the bottom of Section 5 reaches viewport bottom.
  - `progress = clamp((heroRect.top − triggerPoint) / (endPoint − triggerPoint), 0, 1)`.
  - `t = smoothstep(smoothstep(progress))` where `smoothstep(t) = tt(3−2t)` (applied twice).
  - `startX = (vw − baseW) / 2`, `startY = vh − imgH` (bottom-centered).
  - `finalScale = 1.45`, `finalX = (vw − baseW  finalScale) / 2` (bottom-centered), `mobileOffset = vw < 1024 ? −250 : 4`, `finalY = darkRect.bottom − imgH * finalScale + 500 + mobileOffset`.
  - Interpolates `currentX`, `currentY`, `currentScale` linearly via `t`.
- At `progress <= 0` resets to resting (bottom-centered, scale 1). Otherwise sets `top: 0; left: 0; transform: translate(currentX, currentY) scale(currentScale); transform-origin: top left;`.

## Section 5 — Dark Statement + Stats (sticky)



- Outer wrapper: `position: relative; height: 200vh; z-index: 20`.
- Inner \`

` (`s2-section`): `position: sticky; top: 0; height: 100vh; background: #1a1a1a; overflow: hidden`. Above it is a tiny `4vh` `#1a1a1a\` scroll spacer.

- Content wrapper `.s2-content`: flex column, padding `px-6 md:px-10 lg:px-16`, `padding-top: clamp(30px, 4vw, 60px)`, `padding-bottom: clamp(60px, 8vw, 120px)`.
- Statement text (`.s2-statement`), Inter 300, color `#e8e4df`, letter-spacing `-0.02em`, `line-height: 1.35`, `white-space: nowrap`, font-size `clamp(22px, 2.6vw, 42px)`. Wrapper has `max-width: 1200px`, centered, `padding-left: 25%`. Lines (with hard \`

\`s):

  \> Every estate we present is hand-chosen

  \> through a frame of permanence, refinement,

  \> and timeless detail. Standards are not

  \> a flourish. It is our discipline.

- Stats row (`.s2-stats-row`): same max-width/centered/padding-left 25%, `margin-top: clamp(48px, 6vw, 80px)`. Three columns in a flex row, each `flex:1`, with a left border (`1px solid rgba(255,255,255,0.2)`) between items and `padding-left: clamp(20px, 2.5vw, 40px)` on items 2–3:

  1. `120+` — `Portfolio Holdings`
  2. `12` — `Global Locations`
  3. `98%` — `Patron Loyalty Rate`

  - Numbers: Inter 300, white, font-size `clamp(36px, 4.5vw, 72px)`, line-height 1.1. Use a `CountUp` component that, when the element first crosses 30% into the viewport (IntersectionObserver), animates from 0 to `end` over 2000ms with easing `1 - (1 - t)^3`, rendering `Math.round(eased * end) + suffix`.
  - Labels: Inter 400, `rgba(255,255,255,0.6)`, font-size `clamp(12px, 1.1vw, 16px)`, `margin-top: clamp(4px, 0.5vw, 8px)`, letter-spacing `0.01em`.
- Tablet/mobile rules:

  - `≤767px`: remove the 25% left padding entirely (set to 0).
  - `768–1023px`: reduce padding-left to 15%, set `min-height: 70vh` and adjust paddings.

## Section 6 — Hover-Expand Gallery (slides over Section 5)



- \`

` (`s3-gallery-section`) `position: relative; z-index: 25; margin-top: -100vh; background: #1a1a1a; height: 100vh; overflow: hidden\`. This makes it slide up over Section 5 as the user scrolls.

- Background ticker (`.s3-ticker-wrap`): absolutely positioned `inset:0`, flex center, `overflow: hidden`, `z-index: 0`, `pointer-events: none`. Contains a `.ticker-track` with two copies of a giant repeating string:

\> `Velar.   Velar.   Velar.   Velar.   Velar.   Velar.   Velar.   Velar.  ` (with ` ` separators)

- Each span: Syne 800, `clamp(100px, 14vw, 220px)`, white, `white-space: nowrap`, letter-spacing `-0.02em`, `user-select: none`, `padding-right: 0.3em`. (The ticker can also be animated with a horizontal scroll keyframe — left as a static layered word-mark behind the gallery here.)

- Gallery content (`.s3-gallery-content`): z-index 1, flex center, full height, padding `clamp(24px, 4vw, 60px)`.
- Row (`.gallery-expand-row`): flex with `gap:6px`, height 70%, max-width 1200px. Each item (`.gallery-expand-item`): `flex:1 1 0%`, full height, `border-radius:12px`, `overflow:hidden`, `cursor:pointer`, transition `flex 0.5s cubic-bezier(0.4, 0, 0.2, 1)`. On hover, the hovered item grows to `flex: 4`, others shrink — classic accordion expand.
- Each item contains the corresponding video (autoplay, loop, muted, playsInline) covering the tile (`object-fit: cover`).

### Gallery Mobile/Tablet Rules (≤1023px)



```CSS
.s3-gallery-section { height: auto; min-height: 100vh; overflow: visible; }
.s3-ticker-wrap { position: sticky; top: 0; height: 100vh; width: 100%; margin-bottom: -100vh; }
.s3-gallery-content { height: auto; align-items: flex-start; padding: 80px 16px 60px; }
.gallery-expand-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; height: auto; width: 100%; max-width: 700px; }
.gallery-expand-item { flex: none; height: auto; aspect-ratio: 4/5; border-radius: 10px; transition: transform 0.3s ease; }
.gallery-expand-item:hover { flex: none; transform: scale(1.02); }
.gallery-expand-item:last-child:nth-child(odd) { grid-column: 1 / -1; max-width: calc(50% - 4px); justify-self: center; }
@media (max-width: 479px) {
  .s3-gallery-content { padding: 60px 12px 48px; }
  .gallery-expand-row { gap: 6px; }
}
```



## Behavior Recap



- Preloader types `Velar.` then slides up out of view, simultaneously revealing the hero text and rising the house image from below the viewport.
- The house image stays bottom-centered behind the hero text on initial load.
- As the user scrolls past 30% of the hero, the house begins drifting upward and scaling up to 1.45×, remaining horizontally centered, while pinning toward the bottom of the dark statement section.
- The nav logo color cross-fades to white whenever a dark section sits at the viewport top.
- Section 5 stays sticky as Section 6 (gallery) slides up over it thanks to negative `margin-top: -100vh` and higher `z-index`.
- Stat numbers count up once on scroll into view.
- Gallery tiles accordion-expand on hover (desktop) or 2-column grid (mobile/tablet).

## Tech Notes



- Use only `react`, `react-dom`, `lucide-react`, Tailwind, and Vite. No additional libraries.
- All animation logic lives inside a single `App.tsx` using `useState`, `useEffect`, `useRef`, `useCallback`, and `IntersectionObserver`.
- Use Supabase if any persistence is later needed; this page itself has no data layer.


---

# 009 Reveal Hero

# Reveal Hero


---

# 010 Mythic Naturecore

# Mythic Naturecore

Recreate a high-fidelity, premium interactive landing page named "Reverie" using React, TypeScript, and a combination of Tailwind CSS and inline styles. The project must have a smooth, hardware-accelerated scroll-linked animation system, 3D/parallax mouse-tracking effects, responsive layouts, and elegant micro-animations.



---



1. Typography & Global Styles

- Fonts:

  - Load the following Google Fonts:
  
    - Headers: `'Viaoda Libre', serif` (elegant serif font).
    - Body, nav links, and captions: `'Imprima', sans-serif` (clean, sleek sans-serif font).
- Global Reset & Base CSS:

  - `html, body { margin: 0; padding: 0; background: #0a0608; scroll-behavior: auto; }`
  - Body font should default to `'Imprima', sans-serif`.
  - Add `scrollbar-gutter: stable;` to the `html` tag to prevent layout shifts.
  - Include an animation utility:
  
    ```CSS
    @keyframes bobUp {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    ```

---



1. Assets Asset Mapping

Define these exact asset constants at the top of the file:

```TypeScript
const PORTAL_BG = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779974947/portal_bg_mu60k9.png';
const CURTAIN_LEFT = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975070/curtain_left_cdht6q.png';
const CURTAIN_RIGHT = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975071/curtain_right_a9bn3i.png';
const WORLD_BG = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975077/world_bg_jzzcn1.jpg';

// The cards MUST remain in this exact order (Card 3, Card 1, Card 2)
const CARD_IMAGES = [
  'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975070/card_3_nbwm25.jpg',
  'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975070/card_2_wr6al6.jpg', // Representing Card 1
  'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975070/card_1_jz8otj.jpg', // Representing Card 2
];
```



---



1. State Management & Mathematical Helpers

- Math Utilities:

  - Easing curve: `easeInOut(t) = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t`
  - Linear Interpolation: `lerp(a, b, t) = a + (b - a) * t`
  - Constraint: `clamp(val, min, max) = Math.max(min, Math.min(max, val))`
- Parallax Magnitudes:

  - `MAG.world = 6`, `MAG.portal = 7`, `MAG.curtainL = 14`, `MAG.curtainR = 14`
- Hook for Responsiveness:

  - Implement a `useIsMobile()` hook responding to media query max-width of `767px` to dynamically update layouts.
- Scroll Tracking:

  - The page height must be exactly `480vh`. Inside, a single sticky container spans `100vh`.
  - Calculate normalized `scrollProgress` from `0` to `1` by reading window scroll position relative to the scrollable height.
- Smooth Mouse Tracking (Parallax):

  - Normalize coordinates `rx`, `ry` between `-1` and `1` relative to the center of the viewport.
  - Implement a `requestAnimationFrame` render loop (`tick`) to smoothly interpolate current position towards target cursor position (lerp step speed: `0.07`) to eliminate frame-rate stutters.
- Entrance Animation Delays:

  - On mount, transition curtains open after `100ms`, fade UI in after `600ms`. Disable entry CSS transitions after `2200ms` so mouse movement doesn't experience lag or delay.

---



1. Animation Timelines (Scroll & Mouse Parallax)

Apply these precise styling updates in the render loop on every frame:

1. World Layer (`WORLD_BG`):

   - Scale: Lerps from `1` (at start) to `1.18` (at maximum scroll).
   - Parallax: `transform = scale(${scale}) translate3d(${rx * 6}px, ${ry * 6}px, 0)`
2. Portal Frame (`PORTAL_BG`):

   - Scale: Lerps from `1` to `7.5` (creating an immersive zoom-through effect).
   - Origin: `52% 38%`
   - Opacity: Starts at `1`, fades out after `65%` scroll: `clamp(1 - (scrollProgress - 0.65) / 0.2, 0, 1)`
   - Parallax: `transform = scale(${scale}) translate3d(${rx * 7}px, ${ry * 7}px, 0)`
3. Curtain Left (`CURTAIN_LEFT`):

   - Initial Opening Offset: `62%` shift left.
   - Scroll Offset: Moves further leftward up to `150%` as eased progress goes `0` to `1`.
   - Curtain Scroll Scale: Lerps from `1` to `1.3`.
   - Parallax & GPU Layer: `transform = translateX(calc(-${totalShift}% + ${rx * 14}px)) translateY(${ry * 14 * 0.3}px) scale(${curtainScrollScale}) translateZ(0)`
4. Curtain Right (`CURTAIN_RIGHT`):

   - Symmetrically mirrors Curtain Left.
   - Parallax & GPU Layer: `transform = translateX(calc(${totalShift}% + ${rx * 14}px)) translateY(${ry * 14 * 0.3}px) scale(${curtainScrollScale}) translateZ(0)`

---



1. Layout & Components

Navigation Bar

- Position: Absolute at the top, `zIndex: 50`. Responsive padding: `18px 20px` (mobile), `22px 48px` (desktop).
- Desktop (>=768px): Split navigation.

  - Left side: Links `Worlds`, `Atelier`, `Immersions`.
  - Center: SVG Star Logo (clean star shape in path `M14 2l2.09 6.42H23l-5.45 ...` inside a `28x28` viewport).
  - Right side: Links `Craft`, `Codex`, `Connect`.
- Mobile (<768px): Centered star logo with an `Explore` link on the left and a `Connect` link on the right.
- Link Styling: uppercase, `12px`, letter spacing `0.12em`, white color with `0.9` opacity, no text decoration.

Scene 1: Hero Section (Entrance)

- Opacity: Fades out smoothly on scroll: `clamp(1 - scrollProgress / 0.22, 0, 1)`.
- Entrance Transition: Slide upward by `20px` on mount with opacity transition `0.9s ease` delayed by `300ms`.
- Responsive Layout:

  - Mobile (<768px): Center-aligned vertical column. Text is dark brown (`#3b1a0a`). Heading: `FALL › INTO REVERIE` (Viaoda Libre). Subheading paragraph (max-width `280px`). Below it, displays a single card with image `CARD_IMAGES[0]`, showing a rounded white play button icon and "View Reel".
  - Tablet (768px - 1099px): Center-aligned column. Text is dark brown (`#3b1a0a`). Headline and paragraph (max-width `400px`). Shows all 3 cards in a horizontal row:
  
    - Card 3: Image `CARD_IMAGES[0]`, Play button + "View Reel"
    - Card 1: Image `CARD_IMAGES[1]`, "32 World Patrons" in large elegant text
    - Card 2: Image `CARD_IMAGES[2]`, Play button + "View Reel"
  - Desktop (>=1100px): Split-screen horizontal layout. Text is white.
  
    - Left Container: Aligned to the left (top `46%`, left `60px`). Title: `FALL › INTO REVERIE` (Viaoda Libre). Subheading paragraph. Max-width `440px`.
    - Right Container: Aligned to the right (top `50%`, right `40px`). Row of 3 card containers (`158px x 158px`) with rounded corners (`28px`), bottom linear gradient, glassmorphic bottom blur (`backdropFilter: 'blur(6px)'`), play icon buttons or patron metrics overlay.
- Card Interactive Styling:

  - Backdrop blur filter on bottom labels: `backdropFilter: 'blur(6px)'`, linear gradient to top `rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 60%, transparent 100%`.
- Slider Dots (Bottom Left):

  - Absolutely positioned at bottom left (`60px` desktop, centered mobile).
  - Renders 4 horizontal pill indicators: first indicator is wide (`28px`), other three are thin (`14px`), colored in white with opacities.
- Scroll Cue (Descend):

  - Absolutely positioned at `bottom: 36px`, centered horizontally. Hidden on mobile.
  - Text: uppercase "Descend" in `10px`, letter-spacing `0.22em`, color `rgba(255,255,255,0.6)`.
  - Icon: A chevron SVG surrounded by a `34px x 34px` round circular border animated with the `bobUp 1.8s ease-in-out infinite` bounce animation.

Scene 2: Call to Action (Forge Beyond)

- Opacity: Fades in on scroll: `clamp((scrollProgress - 0.68) / 0.16, 0, 1)`.
- Layout: Centered vertical flex container (`zIndex: 46`), active only when opacity is visible.
- Content:

  - Centered text wrapper.
  - Heading: `FORGE BEYOND THE REAL` (Viaoda Libre, size clamp `38px` to `78px`, color `#ffffff`, letter spacing `0.03em`, line-height `1.05`, elegant text shadow `0 2px 20px rgba(0,0,0,0.4)`).
  - Paragraph: `Singular voyages to astonishing destinations, shaped for those who seek beauty beyond the ordinary and the known.` (Imprima, size `20px` desktop / `14px` mobile, max-width `480px` desktop / `260px` mobile, line-height `1.6`, color `rgba(255,255,255,0.82)`).

```Plain Text

```


---

# 011 Web3 EOS Hero

# Web3 EOS Hero


---

# 012 3D Collectible Hero

# 3D Collectible Hero

Build a single full-viewport hero section in React + TypeScript + Vite + Tailwind CSS, using `lucide-react` for icons. The component is a character-figurine carousel called "TOONHUB".



**Fonts (load in `index.html` head):**

```HTML
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

Body font: `'Inter', sans-serif`. Display font (huge ghost text + bottom-right link): `'Anton', sans-serif`.



**Image data (4 items, exact URLs and colors):**

```TypeScript
const IMAGES = [
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png', bg: '#F4845F', panel: '#F79B7F' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png', bg: '#6BBF7A', panel: '#85CC92' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png', bg: '#E882B4', panel: '#ED9DC4' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png', bg: '#6EB5FF', panel: '#8DC4FF' },
];
```

Preload all 4 images on mount via `new Image()`.



**State & logic:**

- `activeIndex` (0–3), `isAnimating` boolean lock, `isMobile` (`window.innerWidth < 640`, updated on resize).
- `navigate('next' | 'prev')`: ignore if animating; set `isAnimating=true`; bump `activeIndex` `(prev+1)%4` or `(prev+3)%4`; release lock after `650ms`.
- Roles derived from activeIndex: `center=activeIndex`, `left=(activeIndex+3)%4`, `right=(activeIndex+1)%4`, `back=(activeIndex+2)%4`.

**Layout structure:**

Outer `<div>` has `backgroundColor: IMAGES[activeIndex].bg`, transition `background-color 650ms cubic-bezier(0.4,0,0.2,1)`, `fontFamily: 'Inter, sans-serif'`, `relative w-full overflow-hidden`. Inside, a `relative w-full` div with `height: 100vh; overflow: hidden`.



1. **Grain overlay** (`absolute inset-0 pointer-events-none`, zIndex 50): SVG fractalNoise data URI, `baseFrequency=0.9`, `numOctaves=4`, opacity 0.08 inside SVG, container `opacity: 0.4`, `backgroundSize: 200px 200px`, repeat.
2. **Giant ghost text "3D SHAPE"** (`absolute inset-x-0 flex items-center justify-center pointer-events-none select-none`, zIndex 2, `top: 18%`): font Anton, `fontSize: clamp(90px, 28vw, 380px)`, weight 900, color white, opacity 1, lineHeight 1, uppercase, letterSpacing `-0.02em`, whiteSpace nowrap.
3. **Top-left brand label "TOONHUB"** (`absolute top-6 left-4 sm:left-8`, zIndex 60): `text-xs font-semibold uppercase`, white, opacity 0.9, letterSpacing `0.18em`.
4. **Carousel** (`absolute inset-0`, zIndex 3): map all 4 IMAGES; each item is `position:absolute`, `aspectRatio: '0.6 / 1'`, with role-based styles below. Inside, an `<img>` `width:100%; height:100%; objectFit:contain; objectPosition:bottom center; draggable=false`.Per-role style:

   - **center**: `transform: translateX(-50%) scale(${isMobile?1.25:1.68})`, no blur, opacity 1, zIndex 20, `left:50%`, `height: isMobile?'60%':'92%'`, `bottom: isMobile?'22%':0`.
   - **left**: `translateX(-50%) scale(1)`, blur 2px, opacity 0.85, zIndex 10, `left: isMobile?'20%':'30%'`, `height: isMobile?'16%':'28%'`, `bottom: isMobile?'32%':'12%'`.
   - **right**: same as left but `left: isMobile?'80%':'70%'`.
   - **back**: `translateX(-50%) scale(1)`, blur 4px, opacity 1, zIndex 5, `left:50%`, `height: isMobile?'13%':'22%'`, `bottom: isMobile?'32%':'12%'`.Transition on each item: `transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms ..., opacity 650ms ..., left 650ms ...`. `willChange: transform, filter, opacity`.
5. **Bottom-left text + nav buttons** (`absolute bottom-6 left-4 sm:bottom-20 sm:left-24`, zIndex 60, `maxWidth:320px`):

   - `<p>` "TOONHUB FIGURINES" — bold uppercase, tracking-widest, `mb-2 sm:mb-3 text-base sm:text-[22px]`, white, opacity 0.95, letterSpacing `0.02em`.
   - `<p>` (hidden on mobile, `hidden sm:block`): "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now." — `text-xs sm:text-sm`, white, opacity 0.85, lineHeight 1.6, `mb-4 sm:mb-5`.
   - Two circular buttons (`w-12 h-12 sm:w-16 sm:h-16`, transparent bg, 2px white border, white icon): `ArrowLeft` and `ArrowRight` from lucide-react, size 26, strokeWidth 2.25. On hover: scale 1.08 + bg `rgba(255,255,255,0.12)`. Transition `transform 150ms, background-color 150ms`. Click triggers `navigate('prev')` / `navigate('next')`.
6. **Bottom-right link "DISCOVER IT"** (`absolute bottom-6 right-4 sm:bottom-20 sm:right-10`, zIndex 60): `<a>` flex items-center, font Anton, `fontSize: clamp(20px, 4vw, 56px)`, weight 400, white, opacity 0.95→1 on hover (200ms), letterSpacing `-0.02em`, lineHeight 1, uppercase, no underline. Followed by `ArrowRight` (`w-5 h-5 sm:w-8 sm:h-8`, strokeWidth 2.25).

**Behavior summary:** clicking arrows rotates roles; background color, image positions, scales, blurs, and opacities all crossfade simultaneously over 650ms with `cubic-bezier(0.4,0,0.2,1)`. The character images sit at the bottom of the screen overlapping the giant "3D SHAPE" text behind them.


---

# 013 Dreamcore Landing

# Dreamcore Landing

Build a single-page immersive parallax landing page in React + TypeScript + Tailwind CSS using Vite. The page has two scroll-driven scenes inside a sticky viewport. Everything lives in a single `src/App.tsx` file. Use Google Fonts: **Viaoda Libre** (serif headings) and **Imprima** (sans-serif body). No external UI libraries. Use `lucide-react` only as a dependency (it is not used in this page). Use Tailwind for responsive layout breakpoints only; all other styling is inline React `CSSProperties`.



---



### GLOBAL SETUP



**`tailwind.config.js`** -- Override the `xl` breakpoint to `1100px`:

```JavaScript
screens: { xl: '1100px' }
```



**`index.css`** -- Include Tailwind directives, global reset, dark background `#0a0608`, `font-family: 'Imprima', sans-serif`, `scrollbar-gutter: stable`, and a `@keyframes bobUp` animation that translates Y by `-6px` at 50%.



**`index.html`** -- Load Google Fonts via `<link>`:

```Plain Text
https://fonts.googleapis.com/css2?family=Viaoda+Libre&family=Imprima&display=swap
```

Title: "Step Into Wonder"



---



### IMAGE ASSETS (use these exact URLs)



```Plain Text
PORTAL_BG    = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779707217/image_1_vdzwae.png"
CURTAIN_LEFT = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706559/curtain_left_znkmva.png"
CURTAIN_RIGHT= "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706564/curtain_right_paeyym.png"
WORLD_BG     = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706392/image_2_gkcdlx.png"
BOTTOM_CLOUDS= "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706555/bottom_clouds_xskut6.png"

CARD_IMAGES[0] = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85"
CARD_IMAGES[1] = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85"
CARD_IMAGES[2] = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85"
```



---



### SCENE 2 CARD DATA (9 cards for the arc slider)



```Plain Text
{ title: 'Hidden Realms',   desc: 'Luminous sanctuaries unseen by wandering eyes',  color: '#f3cdd6' }
{ title: 'Wild Solitudes',  desc: 'Dissolve into untamed horizons and deep calm',   color: '#dcedc2' }
{ title: 'Silent Havens',   desc: 'Remote escapes far beyond ordinary reach',       color: '#c3e3f4' }
{ title: 'Bespoke Quests',  desc: 'Journeys shaped around your vision and soul',    color: '#f0e4c0' }
{ title: 'Vivid Drifts',    desc: 'Surreal passages through breathtaking terrain',  color: '#dcd2f2' }
{ title: 'Mystic Crests',   desc: 'Timeless ridgelines wrapped in cloud and myth',  color: '#f3cdd6' }
{ title: 'Deep Currents',   desc: 'Glowing depths alive with uncharted wonder',     color: '#c3e3f4' }
{ title: 'Gilded Dusk',     desc: 'Amber horizons that stretch past all reason',    color: '#f0e4c0' }
{ title: 'Glassy Tides',    desc: 'Calm waters holding skies of pure stillness',    color: '#dcedc2' }
```



---



### ARCHITECTURE



The outer container is `height: 480vh; position: relative`. Inside it is a `position: sticky; top: 0; height: 100vh; overflow: hidden; background: #0a0608` viewport. All layers stack via absolute positioning and z-index.



**Scroll progress** = `window.scrollY / (container.scrollHeight - window.innerHeight)`, clamped 0-1.



**Helper functions:**

- `easeInOut(t)`: quadratic ease `t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t`
- `lerp(a, b, t)`: linear interpolation
- `clamp(val, min, max)`

**`useIsMobile()`** hook: `matchMedia('(max-width: 767px)')` -- returns boolean.



---



### LAYER STACK (bottom to top by z-index)



#### Layer 1: World Background (z-index: auto/0)

- `ref={worldRef}`, absolute inset 0, `transformOrigin: '50% 50%'`
- `WORLD_BG` image, `object-fit: cover`
- Parallax: `scale(lerp(1, 1.18, ep))`, mouse offset `MAG.world = 6`

#### Layer 2: Bottom Clouds (z-index: 10)

- `ref={cloudsRef}`, absolute bottom:0, left:0, right:0, `transformOrigin: '50% 100%'`
- `BOTTOM_CLOUDS` image, `width: 100%, height: auto`
- Parallax: `scale(lerp(1, 1.4, ep))`, mouse offset `MAG.clouds = 9` (Y dampened to `0.4x`)
- Opacity: fades from 0.7 to 1 in the first 5% of scroll

#### Layer 2.5: Arc Card Slider (z-index: 9)

- Absolute, `bottom: 60px (mobile) / 80px (desktop)`, centered horizontally
- Opacity = `scene2Opacity`
- Contains `<ArcCardSlider>` component (details below)

#### Layer 3: Portal Frame (z-index: 15)

- `ref={portalRef}`, absolute inset 0, `transformOrigin: '52% 38%'`
- `PORTAL_BG` image, `object-fit: cover`
- Parallax: `scale(lerp(1, 7.5, ep))`, mouse offset `MAG.portal = 7`
- Opacity: 1 until scroll 0.65, then fades to 0 by scroll 0.85

#### Layer 3.5: Bottom Fade (z-index: 16)

- Absolute bottom, `height: 40%`, `linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)`, `pointer-events: none`

#### Layer 4L: Curtain Left (z-index: 16)

- `ref={curtainLRef}`, absolute inset 0, `transformOrigin: 'left center'`
- `CURTAIN_LEFT` image, `object-fit: cover`, `object-position: right center`
- On mount (after 100ms), shifts left by `translateX(-62%)` with `transition: transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)`
- On scroll: additional `translateX` via `lerp(0, 150, ep)%`, scale `lerp(1, 1.3, ep)`
- Mouse offset: `MAG.curtainL = 14` (Y dampened to `0.3x`)
- After entrance animation (2200ms), transition switches to `none` for responsive parallax

#### Layer 4R: Curtain Right (z-index: 16)

- Mirror of Layer 4L but `transformOrigin: 'right center'`, `object-position: left center`
- Shifts right instead of left, `MAG.curtainR = 14`

#### Top Fade Gradient (z-index: 45)

- Absolute top, `height: 42vh`, `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)`, `pointer-events: none`

---



### NAVIGATION (z-index: 50)



Absolute top, full width, `display: flex, justify-content: space-between, align-items: center`.



**Nav link style:** `font-family: 'Imprima', sans-serif`, `font-size: 12px`, `letter-spacing: 0.12em`, `text-transform: uppercase`, `color: #fff`, `opacity: 0.9`, no text decoration.



**Mobile** (`padding: 18px 20px`): Three items -- "Explore" (11px) | StarLogo SVG | "Connect" (11px)



**Desktop** (`padding: 22px 48px`): Left group ["Worlds", "Atelier", "Immersions"] with `gap: 36px` | StarLogo SVG center | Right group ["Craft", "Codex", "Connect"] with `gap: 36px`



**StarLogo** -- inline SVG, 28x28, white star path + 3 small circles:

```Plain Text
<path d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z" fill="white" opacity="0.9" />
<circle cx="14" cy="24" r="1.5" fill="white" opacity="0.6" />
<circle cx="6" cy="6" r="1" fill="white" opacity="0.4" />
<circle cx="22" cy="6" r="1" fill="white" opacity="0.4" />
```



---



### SCENE 1 UI (z-index: 20)



Opacity = `clamp(1 - scrollProgress / 0.22, 0, 1)`. Fades out in first \~22% of scroll.



Uses **three separate Tailwind-responsive layout blocks** (not JS branching for layout):



#### Mobile layout (`md:hidden`)

- Centered column, `padding: 80px 24px 100px`
- Fade-in: `opacity 0.9s ease, transform 0.9s ease`, delay `0.3s`, triggers on `uiVisible`
- **Heading** (Viaoda Libre): "FALL > INTO" line (`clamp(26px, 7vw, 42px)`, `tracking-widest`, color `#3b1a0a`) then "REVERIE" (`clamp(52px, 16vw, 80px)`, `tracking-tight`, `leading-none`, color `#3b1a0a`). The ">" is a `›` character in color `#6b2e0e` at `0.8em`. "INTO" is italic.
- **Subtext** (Imprima): "Crafting boundless digital worlds where the edge between AI, vision, and living myth dissolves." -- `15px`, `leading-relaxed`, color `#5c2d0e`, `max-width: 280px`
- **Single card**: 140x140px, `border-radius: 22px`, `CARD_IMAGES[0]` as background-cover, `box-shadow: 0 8px 32px rgba(0,0,0,0.5)`. Bottom gradient overlay (60% height). Bottom-left overlay: white circle (26px) with play triangle SVG + "View Reel" text (13px, white).

#### Tablet layout (`hidden md:flex xl:hidden`)

- Centered column, `gap: 28px`, `padding: 80px 32px 96px`
- Same fade-in animation as mobile
- **Heading**: same structure as mobile but dark brown text (`#3b1a0a`), sizes `clamp(28px, 5vw, 44px)` / `clamp(60px, 12vw, 86px)`
- **Subtext**: same text, `16px`, color `#5c2d0e`, `max-width: 400px`
- **Three cards in a row** (`flex gap-3.5`): each 140x140px, `border-radius: 22px`. Each has:

  - Background gradient overlay (60% height, multi-stop)
  - Backdrop blur layer (44% height, masked gradient)
  - Card 1: play button + "View Reel"
  - Card 2: number "32" (Viaoda Libre, 28px, white) + "World Patrons"
  - Card 3: play button + "View Reel"

#### Desktop layout (`hidden xl:block` / `hidden xl:flex`)

- **Heading block**: absolute, `top: 46%`, `left: 60px`, `maxWidth: 440px`, `translateY(-50%)` centered

  - White text with heavy `text-shadow: 0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)`
  - "FALL > INTO": `clamp(32px, 4.5vw, 54px)`, `line-height: 1.1`, `letter-spacing: 0.04em`. The `>` is `rgba(255,220,180,0.7)`.
  - "REVERIE": `clamp(50px, 7.5vw, 88px)`, `line-height: 0.9`, `letter-spacing: -0.02em`
  - Subtext: `18px`, `line-height: 1.7`, color `rgba(255,245,235,0.88)`, `max-width: 300px`, `text-shadow: 0 1px 12px rgba(0,0,0,0.8)`
  - Fade-in: opacity+transform, delay `0.3s`
- **Cards block**: absolute, `right: 40px`, `top: 50%`, `translateY(-50%)`, `flex gap: 12px`

  - Three cards, each 158x158px, `border-radius: 28px`, `box-shadow: 0 8px 32px rgba(0,0,0,0.45)`
  - Each has: gradient overlay, backdrop blur layer (same as tablet), bottom content area at 12px inset
  - Play cards: 30px white circle + 18px "View Reel"
  - Number card: "32" at 36px Viaoda Libre + 18px "World Patrons"
  - Fade-in delay: `0.55s`

#### Slider Dots (bottom of Scene 1)

- Absolute, bottom `28px (mobile, centered)` / `40px (desktop, left: 60px)`
- 4 dots: first is `28px wide`, rest `14px`, all `4px tall`, `border-radius: 2px`
- Active dot: `rgba(255,255,255,0.9)`, inactive: `rgba(255,255,255,0.35)`
- Fade-in delay: `0.8s`

#### Scroll Cue (desktop only)

- Absolute `bottom: 36px`, centered
- "DESCEND" text: `10px`, `letter-spacing: 0.22em`, uppercase, `rgba(255,255,255,0.6)`
- Below: `ScrollChevron` -- 34px circle with 1.5px border `rgba(255,255,255,0.5)`, chevron SVG inside, `animation: bobUp 1.8s ease-in-out infinite`
- Fade-in delay: `0.9s`

---



### SCENE 2 UI (z-index: 46)



Opacity = `clamp((scrollProgress - 0.68) / 0.16, 0, 1)`. Fades in between scroll 68%-84%.



- Centered column
- **Heading** (Viaoda Libre): "FORGE BEYOND THE REAL" -- `clamp(28px, 8vw, 44px) mobile / clamp(38px, 6.5vw, 78px) desktop`, white, `letter-spacing: 0.03em`, `line-height: 1.05`, `text-shadow: 0 2px 20px rgba(0,0,0,0.4)`
- **Subtext** (Imprima): "Singular voyages to astonishing destinations, shaped for those who seek beauty beyond the ordinary and the known." -- `14px mobile / 20px desktop`, `line-height: 1.6`, `letter-spacing: -0.01em`, `max-width: 260px mobile / 480px desktop`, color `rgba(255,255,255,0.82)`
- Margin-top: `8vh mobile / 12vh desktop`

---



### ARC CARD SLIDER COMPONENT



Props: `cards[]`, `rotationOffset: number`, `isMobile: boolean`



**Layout math:**

- `cardSpacingDeg`: 12 (mobile) / 9 (desktop) degrees between cards
- `centerIndex`: `Math.floor(totalCards / 2)`
- `arcRadius`: 700 (mobile) / 1100 (desktop) px
- `cardW`: 160 (mobile) / 220 (desktop) px
- `cardH`: 175 (mobile) / 230 (desktop) px
- `sliderH`: 260 (mobile) / 360 (desktop) px

**`rotationOffset`** is driven by scroll: `lerp(0, arcSweepDeg, clamp((scrollProgress - 0.70) / 0.30, 0, 1))` where `arcSweepDeg = (totalCards - 1) * 10`.



**Per card positioning:**

```Plain Text
baseDeg = (i - centerIndex) * cardSpacingDeg
deg     = baseDeg - rotationOffset + (centerIndex * cardSpacingDeg)
rad     = deg * PI / 180
x       = sin(rad) * arcRadius
y       = arcRadius - cos(rad) * arcRadius
```

Each card is absolutely positioned at `bottom: -y + (140 mobile / 200 desktop)px`, `left: calc(50% + x - halfW)`, `transform: rotate(deg)`, `transformOrigin: halfW arcRadius`.



**Card appearance:**

- Rounded rect (`18px mobile / 26px desktop`), background = `card.color` (pastel)
- `box-shadow: 0 8px 40px rgba(80,40,60,0.18)`
- Top-right: numbered circle (24px, `1.5px border rgba(80,50,60,0.3)`, text `rgba(80,50,60,0.6)`, 10px Imprima) showing zero-padded index
- Bottom: card title in Viaoda Libre (`22px mobile / 30px`, color `#3a2530`) + description in Imprima (`12px mobile / 15px`, color `rgba(58,37,48,0.65)`)

---



### ENTRANCE ANIMATION SEQUENCE



1. **t=100ms**: Curtains open -- `curtainsOpenRef` flips to true, causing 62% horizontal shift on each curtain with `1.8s cubic-bezier(0.16, 1, 0.3, 1)` transition
2. **t=600ms**: `uiVisible` = true -- all Scene 1 UI elements fade/slide in with staggered delays (0.3s heading, 0.55s cards, 0.8s dots, 0.9s scroll cue)
3. **t=2200ms**: `entranceDone` = true -- curtain CSS transition switches to `none` so parallax is instant

---



### MOUSE PARALLAX (desktop)



`requestAnimationFrame` loop smooths raw mouse position at `speed = 0.07` (lerp). Each layer is offset by its `MAG` value in the reverse direction of the mouse. The transforms combine mouse offset with scroll-driven scale/translate.



**MAG values:** world=6, clouds=9, portal=7, curtainL=14, curtainR=14


---

# 014 Growth Marketing SaaS

# Growth Marketing SaaS

Build a single landing page with only a fixed Navbar and a full-screen Hero section that contains a parallax dashboard mock and a foreground grass image. Use React + Vite + TypeScript + Tailwind + framer-motion + lucide-react. No backend.



1. Global setup

`index.html` — add fonts in `<head>`

```HTML
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0" rel="stylesheet" />
```



Body background must be `#08020e`.



`tailwind.config.ts` — extend

```TypeScript
fontFamily: { inter: ['Inter','ui-sans-serif','system-ui','sans-serif'] },
colors: {
  landing: {
    surface: "rgba(255,255,255,0.10)",
    "surface-hover": "rgba(255,255,255,0.16)",
    border: "rgba(255,255,255,0.10)",
    "border-strong": "rgba(255,255,255,0.20)",
    text: "rgba(255,255,255,0.80)",
    "text-muted": "rgba(255,255,255,0.60)",
  },
}
```



`src/index.css` — add

```CSS
body { background-color: #08020e; margin: 0; min-height: 100vh; color: white; }

.landing-root {
  --background: 0 0% 0%;
  --foreground: 0 0% 98%;
  --radius: 0.75rem;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

/* Liquid glass utility */
.liquid-glass {
  background: rgba(255,255,255,0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: ''; position: absolute; inset: 0;
  border-radius: inherit; padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none;
}

.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
```



Wrap the page in `<div className="landing-root font-inter min-h-screen relative overflow-x-hidden">`.



1. Asset URLs (all remote — no local files)

- Hero background video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260521_014404_fadafdb1-4df6-4699-be9c-77d25f39a3d0.mp4`
- Dashboard live-preview video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4`
- Foreground grass PNG: `https://miptxtnhvjrkpmnjgdhk.supabase.co/storage/v1/object/public/training-assets/landing%2Fhero-bottom-bg.png`

1. Components

`MIcon` (Google Material Symbols)

```TypeScript
export const MIcon = ({ name, size = 16, className = "", filled = false, weight = 400, style }: {
  name: string; size?: number; className?: string; filled?: boolean; weight?: number; style?: React.CSSProperties;
}) => (
  <span aria-hidden className={`material-symbols-outlined select-none leading-none inline-flex items-center justify-center ${className}`}
    style={{ fontSize: size, width: size, height: size,
      fontVariationSettings: `'FILL' ${filled?1:0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${Math.min(48,Math.max(20,size))}`,
      ...style }}>{name}</span>
);
```



`AnimatedText` — text slides up on hover, replacement slides in from below (40px, 0.2s easeInOut). Uses framer-motion `motion.div` parent (`overflow-hidden`) with two stacked `motion.span` children; rest variant `{y:0}` / `{y:40}`, hover variant `{y:-40}` / `{y:0}`.



`FadeUp` — framer-motion wrapper: `initial={{opacity:0, y:24}}`, `whileInView={{opacity:1, y:0}}`, `viewport={{once:true, amount:0.3}}`, `transition={{ duration:0.6, delay, ease:[0.22,1,0.36,1] }}`. Honors `useReducedMotion`. Accepts `delay`, `duration`, `y` props.



`PrimaryButton` — white pill CTA

- Classes: `inline-flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-black leading-none transition-colors h-12 px-9 text-sm font-medium`
- Wraps children in `<AnimatedText>`.

`SecondaryButton` — glass pill

- Classes: `inline-flex items-center justify-center rounded-full bg-landing-surface hover:bg-landing-surface-hover border border-landing-border text-foreground backdrop-blur-[2.5px] font-medium leading-none h-8 px-4 text-sm` (size=sm)
- Wraps children in `<AnimatedText>`.

`HeroBadge`

```TypeScript
<div className="inline-flex items-center justify-center rounded-full bg-landing-surface border border-landing-border px-4 h-7 text-sm text-landing-text">
  {children}
</div>
```



1. Navbar (fixed, transparent)

```TypeScript
const navItems = [
  { name: "About", href: "#about" },
  { name: "Features", href: "#features" },
  { name: "What you get", href: "#what-you-get" },
  { name: "Pricing", href: "#pricing" },
];
```



- `<nav className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent">`
- Inner: `mx-auto flex h-16 max-w-[1080px] items-center justify-between px-6 lg:px-0`
- Left logo: `<a href="/" className="flex items-center gap-2 text-foreground">` with `<MIcon name="rocket_launch" size={20} />` + `<span className="text-base font-semibold tracking-tight">UI Rocket</span>`
- Center (lg only): `flex items-center gap-8`, each link `text-sm text-landing-text hover:text-foreground transition-colors`, wrap label in `<AnimatedText>`. Smooth-scroll on click via `document.getElementById(id)?.scrollIntoView({behavior:"smooth"})`.
- Right actions (lg only): `flex items-center gap-5` → "Login" link (same style as nav links, wrapped in AnimatedText) + `<SecondaryButton href="/auth" size="sm">Get started</SecondaryButton>`
- Mobile: menu button (`MIcon name="menu" size={24}`) opens a right-side sheet (use shadcn Sheet) with the same items stacked.

1. Hero section

```TypeScript
const HERO_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260521_014404_fadafdb1-4df6-4699-be9c-77d25f39a3d0.mp4";
const GRASS_IMG  = "https://miptxtnhvjrkpmnjgdhk.supabase.co/storage/v1/object/public/training-assets/landing%2Fhero-bottom-bg.png";
```



Inside the Hero component, set up scroll-linked parallax:

```TypeScript
const sectionRef = useRef<HTMLElement>(null);
const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
const dashboardY    = useTransform(scrollYProgress, [0, 1],   ["0%", "-25%"]);
const grassY        = useTransform(scrollYProgress, [0, 1],   ["0%",  "20%"]);
const contentY      = useTransform(scrollYProgress, [0, 1],   ["0%", "-60%"]);
const contentOpacity= useTransform(scrollYProgress, [0, 0.6], [1, 0]);
```



Structure:

```TypeScript
<section ref={sectionRef} id="hero" className="relative w-full min-h-screen">
  {/* 1) Background video — full bleed, no overlay */}
  <video src={HERO_VIDEO} autoPlay muted loop playsInline
    className="absolute inset-0 w-full h-full object-cover z-0" />

  {/* 2) Centered copy + CTA, with scroll fade/translate */}
  <motion.div style={{ y: contentY, opacity: contentOpacity }}
    className="relative z-20 flex flex-col items-center text-center px-4 sm:px-6 pt-28 sm:pt-36 md:pt-44 max-w-[980px] mx-auto">
    <FadeUp delay={0}>
      <HeroBadge>Founder member sale special</HeroBadge>
    </FadeUp>
    <FadeUp delay={0.1}>
      <h1 className="mt-8 text-foreground text-[38px] sm:text-[52px] md:text-[64px] leading-[1.05] tracking-[-0.03em] max-w-[960px]">
        Are you a designer or builder who wants to stay ahead of AI?
      </h1>
    </FadeUp>
    <FadeUp delay={0.2}>
      <p className="mt-6 text-landing-text text-base sm:text-lg leading-[1.5] max-w-[520px]">
        Learn to turn your ideas into stunning websites with AI
      </p>
    </FadeUp>
    <FadeUp delay={0.3} className="mt-10">
      <PrimaryButton as="button">Get course</PrimaryButton>
    </FadeUp>
  </motion.div>

  {/* 3) Dashboard mock — slower parallax (-25%) */}
  <motion.div style={{ y: dashboardY }}
    className="relative z-10 mt-8 sm:mt-10 md:mt-12 px-4 sm:px-6">
    <DashboardMock />
  </motion.div>

  {/* 4) Foreground grass — in front of dashboard, drifts down 20% */}
  <motion.img src={GRASS_IMG} alt="" aria-hidden style={{ y: grassY }}
    className="pointer-events-none select-none absolute left-0 right-0 bottom-[-40px] sm:bottom-[-100px] lg:bottom-[-220px] w-full z-30 object-cover" />
</section>
```



1. DashboardMock — liquid-glass wrapper with two-column grid

```TypeScript
<div className="liquid-glass w-full max-w-[1100px] aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9] rounded-2xl mx-auto overflow-hidden p-2 sm:p-3">
  <div className="grid h-full grid-cols-1 sm:grid-cols-[minmax(220px,320px)_1fr] gap-2 sm:gap-3">
    <div className="min-h-0 hidden sm:block"><ChatPanel animateMessagesIn /></div>
    <div className="min-h-0"><LivePreviewHero /></div>
  </div>
</div>
```



`ChatPanel` (left column)

- Container: `flex h-full flex-col overflow-hidden rounded-2xl border border-white/10`, inline style `background: rgba(8,8,10,0.6); backdropFilter: blur(24px); WebkitBackdropFilter: blur(24px)`.
- Header: `flex items-center gap-2 px-4 py-3 border-b border-white/5`. Circle `w-7 h-7 rounded-full bg-white/5 flex items-center justify-center` with `<MIcon name="auto_awesome" size={14} className="text-white/80" />`. Text column: `Vibe Design course` (`text-sm font-medium text-white`) + subtitle `Learn how to build website with AI` (`text-[11px] text-white/40`).
- Messages list: `flex-1 overflow-y-auto scrollbar-hide px-4 py-5 space-y-4`. Each row wrapped in `<FadeUp delay={i*0.12} y={16}>`. Layout:

  - Row: `flex justify-end` (user) or `flex justify-start` (assistant).
  - Bubble: `max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed`; user = `bg-white/15 text-white/90`; assistant = `bg-white/5 text-white/70 border border-white/5`.
- Seed messages (exact text):

  1. assistant — "Welcome to the Vibe Design course! I'll guide you through building stunning websites with AI. What would you like to learn first?"
  2. user — "I want to learn how to build a hero section with a cinematic video background using AI."
  3. assistant — "Great choice! In this course, you'll learn how to create full-screen looping videos, liquid glass nav bars, email signups, and manifesto buttons — all with AI assistance. Let's dive in!"
- Input: outer `p-3 border-t border-white/5`. Inner `liquid-glass rounded-2xl flex items-end gap-2 p-2` with a `<textarea rows={1}>` (`flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none max-h-32`, placeholder "Ask about the course...") and a send button `bg-white text-black rounded-xl p-2 hover:bg-white/90` containing `<MIcon name="arrow_upward" size={16} className="text-black" />`. Enter (no shift) sends; appends a user message then a canned assistant reply. After updates, scroll list to bottom smoothly.

`LivePreviewHero` (right column)

Uses `lucide-react` icons `Globe, ArrowRight, Instagram, Twitter`.



- Outer: `relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl bg-black`.
- Background video (with JS fade-in/out loop):Behavior (in `useEffect`):

  ```TypeScript
  <video ref={videoRef} src={DASHBOARD_VIDEO} muted autoPlay playsInline preload="auto"
    className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
    style={{ opacity: 0 }} />
  ```

  - On `loadeddata`: set opacity 0, `play()`, fade opacity to 1 over 500ms via `requestAnimationFrame` linear tween.
  - On `timeupdate`: when `duration - currentTime < 0.55s` and not already fading out, fade opacity to 0 over 500ms.
  - On `ended`: snap opacity to 0, after 100ms reset `currentTime=0`, `play()`, reset fadingOut flag, fade back to 1.
  - Cleanup all listeners and cancel RAF on unmount.
- Inner content stack (`relative z-10 flex flex-col min-h-full h-full`):Mini-nav `relative z-20 px-3 sm:px-4 py-3`, inside a `rounded-full px-2 sm:px-4 py-1.5 flex items-center justify-between max-w-5xl mx-auto`:

  - Left group `flex items-center gap-3 sm:gap-5`: `Globe size={14} text-white` + `<span className="text-white font-semibold text-xs sm:text-sm">Asme</span>`. After it, `hidden md:flex items-center gap-5` of links `Features`, `Pricing`, `About` each `text-white/80 hover:text-white text-[11px] font-medium`.
  - Right group `flex items-center gap-2 sm:gap-3`: "Sign Up" link (`text-white text-[11px] font-medium hidden sm:inline`) + glass pill `<a className="liquid-glass rounded-full px-3 sm:px-4 py-1 text-white text-[11px] font-medium">Login</a>`.Hero block `relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 text-center -translate-y-[8%] sm:-translate-y-[15%]`:
  - `<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-4 sm:mb-5 tracking-tight whitespace-nowrap" style={{ fontFamily: "'Instrument Serif', serif" }}>Built for the curious</h1>`
  - Inner column `max-w-sm w-full space-y-3`:
  
    - Email pill `liquid-glass rounded-full pl-4 pr-1.5 py-1.5 flex items-center gap-2`: `<input type="email" placeholder="Enter your email" className="flex-1 bg-transparent text-white placeholder:text-white/40 text-xs focus:outline-none" />` + circular submit `bg-white rounded-full p-1.5 text-black` with `<ArrowRight size={14} />`.
    - Paragraph `text-white/80 text-[11px] leading-relaxed px-2`: "Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates."
    - Centered glass pill button: `liquid-glass rounded-full px-5 py-1.5 text-white text-[11px] font-medium hover:bg-white/5 transition-colors` → label "Manifesto".Socials row `relative z-10 flex justify-center gap-2 pb-4 sm:pb-6` — three glass round buttons (`liquid-glass rounded-full p-2 text-white/80 hover:text-white hover:bg-white/5 transition-all`) wrapping `Instagram`, `Twitter`, `Globe` icons at `size={14}`.

1. Page assembly

```TypeScript
export default function Page() {
  return (
    <div className="landing-root font-inter min-h-screen relative overflow-x-hidden">
      <Navbar />
      <Hero />
    </div>
  );
}
```



1. Behavioral notes (must match)

- Hero video is autoplay/muted/loop/playsInline with no dark overlay.
- Z-index stack: video `z-0`, dashboard `z-10`, copy/CTA `z-20`, grass `z-30`, navbar `z-50`.
- Hero copy fades + translates up to `-60%` during scroll through the section, fully fading by 60% scroll progress.
- Dashboard parallaxes up (`-25%`); grass drifts down (`+20%`) — creates depth.
- All button labels animate with the "text slides up, replacement slides in from below" effect via `AnimatedText`.
- Inter is the global UI font; the dashboard hero `<h1>` "Built for the curious" uses Instrument Serif.


---

# 015 CoderCrest

# CoderCrest

Create a React + TypeScript component named HeroSection in src/components/HeroSection.tsx using Tailwind CSS and the hls.js npm package (install it: npm install hls.js).



Layout & Background:



A <section> that is 100vh tall, position: relative, overflow: hidden, flex column centered, with background: #000.

A fullscreen HLS video background using this Mux stream URL: 

https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8



The video is <video autoPlay loop muted playsInline> with classes absolute inset-0 w-full h-full object-cover and zIndex: 0. Play it through hls.js: if Hls.isSupported(), create an Hls({ autoStartLoad: true }) instance, loadSource, attachMedia, and play on MANIFEST_PARSED. Else, fall back to native application/vnd.apple.mpegurl support. Clean up the Hls instance on unmount. No overlay over the video — full opacity.

Content container:



A div with classes relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto and inline style marginTop: 380 (pushes content down 380px).

Headline (<h1>):



Font: 'YDYoonche L', 'YDYoonche M', sans-serif

fontSize: clamp(2.2rem, 7vw, 6.5rem), color: #fff, fontWeight: 300, letterSpacing: -0.01em, lineHeight: 1.1, className="leading-tight".

Three lines:

"The vision" — gradient text using background: linear-gradient(90deg, #666666 0%, #d0d0d0 50%, #666666 100%) with WebkitBackgroundClip: text, WebkitTextFillColor: transparent, backgroundClip: text, display: block, lineHeight: 1.1, marginBottom: -0.22em.

"of engineering" — same gradient styling as line 1.

A flex line flex items-center justify-center gap-3 flex-wrap with white text containing in order:

<span style={{color:'#999'}}>is</span>

A circular video icon (see below) playing the human clip

<span>human</span>

<span style={{color:'#999', position:'relative', top:'0.15em', marginLeft:'0.25em'}}>+</span>

A circular video icon playing the AI clip

<span>AI</span>

VideoIcon component:



Outer <span> with classes inline-block align-middle rounded-full overflow-hidden, sized via inline style width/height: clamp(48px, 10vw, \${size}px) (default size=72, but the hero passes size={110} for both icons), flexShrink: 0.

Inner <video autoPlay loop muted playsInline> with width: 100%, height: 100%, objectFit: cover, display: block. Call videoRef.current.play().catch(() => {}) in a useEffect.

Two CloudFront MP4 sources:

VIDEO_HUMAN: 

https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_090051_64ea5059-da6b-492b-a171-aa7ecc767dc3.mp4



VIDEO_AI: 

https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_093237_ff0ddc63-c068-4e29-96da-fdd0e40af133.mp4



Subheading (<p>):



Classes mt-4 max-w-xl text-center px-2.

fontSize: clamp(0.95rem, 2.2vw, 1.2rem), color: #ccc, lineHeight: 1.4, fontWeight: 400.

Text: "We help you map the talent you need, track the talent you have, and close your gaps to thrive in a GenAI world."

CTA Button:



Classes: mt-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0px_6px_32px_8px_rgba(39,243,169,0.22)] active:scale-[0.98]

Inline style: padding: '12px 28px', background: '#000', boxShadow: '0px 6px 24px 6px rgba(39, 243, 169, 0.15)', borderRadius: 8, outline: '1px solid #30463C', outlineOffset: -1, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10.

Inner <span> with color: '#fff', fontSize: 14, fontWeight: 400, text: "Join The Movement!".

Animations / interactions:



All three videos auto-play, loop, muted, inline.

Button has a 300ms transition: scales to 1.03 and gains a brighter green glow on hover, scales to 0.98 on active.

Fonts:



The headline expects 'YDYoonche L' / 'YDYoonche M' to be loaded globally (e.g., via index.css or an external font provider). It falls back to sans-serif.


---

# 016 Aethera Studio

# Aethera Studio

Prompt: Cinematic Hero Section with Looping Video Background



Create a fullscreen single-page hero section using React + Vite + Tailwind CSS + TypeScript with the following specifications:



Fonts:

Display text (headings, logo): Instrument Serif

Body text (navigation, descriptions): Inter

Import both fonts in /src/styles/fonts.css



Video Background:

URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4

Position: top: '300px' with inset: 'auto 0 0 0'

Implement custom fade-in/fade-out loop logic using React useEffect and useRef:

Use requestAnimationFrame to continuously monitor currentTime and duration

Fade in over 0.5s at the start (opacity 0 to 1)

Fade out over 0.5s before the end (opacity 1 to 0)

On ended event: set opacity to 0, wait 100ms, reset currentTime = 0, then play() again

This creates a seamless manual loop with smooth fade transitions

Add gradient overlays: absolute inset-0 bg-gradient-to-b from-background via-transparent to-background positioned over the video



Navigation Bar:

Logo: "Aethera®" (with registered trademark symbol as superscript)

Logo styling: text-3xl, tracking-tight, Instrument Serif, color #000000

Menu items: Home (color #000000), Studio, About, Journal, Reach Us (all others #6F6F6F)

Menu items: text-sm with transition-colors

CTA button: "Begin Journey", rounded-full, px-6 py-2.5, text-sm, black background (#000000), white text, hover scale 1.03

Layout: flex justify-between, px-8 py-6, max-w-7xl mx-auto



Hero Section:

Positioning: paddingTop: 'calc(8rem - 75px)', pb-40

Layout: centered (flex flex-col items-center justify-center text-center), px-6

Headline:

Text: "Beyond silence, we build the eternal."

Styling: text-5xl sm:text-7xl md:text-8xl, max-w-7xl, font-normal

Font: Instrument Serif

Line height: 0.95

Letter spacing: -2.46px

Color: #000000 for main text, #6F6F6F for italic emphasized words ("silence," and "the eternal.")

Animation: animate-fade-rise



Description:

Text: "Building platforms for brilliant minds, fearless makers, and thoughtful souls. Through the noise, we craft digital havens for deep work and pure flows."

Styling: text-base sm:text-lg, max-w-2xl, mt-8, leading-relaxed

Color: #6F6F6F

Animation: animate-fade-rise-delay



Hero CTA Button:

Text: "Begin Journey"

Styling: rounded-full, px-14 py-5, text-base, mt-12

Colors: black background (#000000), white text (#FFFFFF)

Hover: scale 1.03

Animation: animate-fade-rise-delay-2



Colors:

Background: white (#FFFFFF)

Headlines/logos/buttons: black (#000000)

Descriptions/menu items: gray (#6F6F6F)

Button text: white (#FFFFFF)



Animations (in /src/styles/theme.css):

fade-rise: opacity 0 to 1, translateY 20px to 0, duration 0.8s, ease-out

fade-rise-delay: same as fade-rise but with 0.2s delay

fade-rise-delay-2: same as fade-rise but with 0.4s delay



Layout Structure:

Container: relative min-h-screen w-full overflow-hidden

Background video layer (z-0)

Gradient overlay on video

Navigation bar (z-10)

Hero section (z-10)

All elements should be responsive and maintain the glassmorphic aesthetic with the specified padding, positioning, and smooth animations.


---

# 017 VEX Ventures

# VEX Ventures

Recreate this hero section exactly. Here are the complete specifications:



Video Background:



Full-screen background video, absolutely positioned, covering the entire viewport (object-cover)

Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4

Autoplay, loop, muted, playsInline

NO dark overlay, NO gradient overlay, NO semi-transparent layer on top of the video. The video plays raw with no dimming whatsoever.

Typography (CRITICAL - must be applied globally):



Import the Google Font Inter via a <link> tag in index.html:



<link rel="preconnect" href="https://fonts.googleapis.com">

<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

Set the body font-family in CSS to: 'Inter', sans-serif

Apply -webkit-font-smoothing: antialiased and -moz-osx-font-smoothing: grayscale on the body

Also extend the Tailwind config to set fontFamily: { sans: ['Inter', 'sans-serif'] } so all Tailwind font-sans usage picks up Inter automatically

Navbar:



Wrapped in horizontal page padding: px-6 md:px-12 lg:px-16 with pt-6 top padding

The navbar bar itself uses the .liquid-glass class and has rounded-xl, px-4 py-2, flex layout with items-center justify-between

Left: Logo text "VEX" - text-2xl font-semibold tracking-tight

Center (hidden on mobile, visible md+): Links "Story", "Investing", "Building", "Advisory" - text-sm, gap-8, hover transitions to gray-300

Right: "Start a Chat" button - bg-white text-black px-6 py-2 rounded-lg text-sm font-medium, hover to gray-100

Hero Content (Bottom of viewport):



Container: same horizontal padding as navbar, flex column filling remaining height, content pushed to bottom with flex-1 flex flex-col justify-end, bottom padding pb-12 lg:pb-16

On large screens: 2-column grid (lg:grid lg:grid-cols-2 lg:items-end)

Left Column - Main content:



Heading: "Shaping tomorrow\nwith vision and action." (literal line break between "tomorrow" and "with")



Responsive sizes: text-4xl md:text-5xl lg:text-6xl xl:text-7xl

font-normal, mb-4

Inline style: letterSpacing: '-0.04em'

Character-by-character entrance animation: Each character starts at opacity: 0 and translateX(-18px), then transitions to opacity: 1 and translateX(0). Each character gets a staggered delay calculated as: (lineIndex \* lineLength \* charDelay) + (charIndex \* charDelay) where charDelay = 30ms. The whole animation starts after 200ms initial delay. Each character transition is 500ms.

Spaces render as \u00A0 (non-breaking space)

Subheading: "We back visionaries and craft ventures that define what comes next."



text-base md:text-lg text-gray-300 mb-5

Fade-in animation: starts at 800ms delay, 1000ms duration

Buttons row: flex-wrap with gap-4



"Start a Chat" - bg-white text-black px-8 py-3 rounded-lg font-medium

"Explore Now" - liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium, hover transitions to white bg + black text

Fade-in animation: starts at 1200ms delay, 1000ms duration

Right Column - Tag:



Aligned to bottom-right on large screens (flex items-end justify-start lg:justify-end)

Glass card: liquid-glass border border-white/20 px-6 py-3 rounded-xl

Text: "Investing. Building. Advisory." - text-lg md:text-xl lg:text-2xl font-light

Fade-in animation: starts at 1400ms delay, 1000ms duration

Liquid Glass CSS (place in global CSS):





.liquid-glass {

  background: rgba(0, 0, 0, 0.4);

  background-blend-mode: luminosity;

  backdrop-filter: blur(4px);

  -webkit-backdrop-filter: blur(4px);

  border: none;

  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);

  position: relative;

  overflow: hidden;

}

.liquid-glass::before {

  content: '';

  position: absolute;

  inset: 0;

  border-radius: inherit;

  padding: 1.4px;

  background: linear-gradient(180deg,

    rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 20%,

    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,

    rgba(255,255,255,0.1) 80%, rgba(255,255,255,0.3) 100%);

  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;

  mask-composite: exclude;

  pointer-events: none;

}

FadeIn component: A wrapper that starts with opacity: 0 and transitions to opacity: 1 after a configurable delay (ms) using a setTimeout + React state. Transition duration is also configurable. Uses inline transitionDuration style and Tailwind's transition-opacity class.



AnimatedHeading component: Splits text by \n into lines, then each line into individual characters. Each character is an inline-block <span> with CSS transitions on opacity and transform (translateX). Animation triggers via React state after the initial delay.



Color scheme: Black background, white text, gray-300 for secondary text, white/20 for borders. No purple, no indigo.



Stack: React + TypeScript, Tailwind CSS, Vite. No extra UI libraries needed. Icons from lucide-react if needed (none currently used in the hero).


---

# 018 Layered Depth

# Layered Depth

Create a React + Vite + TypeScript + Tailwind CSS landing page for an architecture studio called "Qelora". The page has exactly two sections: a Hero and a Section 2. The entire site uses inline styles (no Tailwind utility classes in JSX -- Tailwind is only used for base reset). Use only `react`, `react-dom`, and `lucide-react` as dependencies (icons are all inline SVGs here, lucide is not actually used in this page).



---



FONTS



Load these three custom fonts in `index.html` `<head>`:



```HTML
<link href="https://db.onlinewebfonts.com/c/076f8c5b3b67616658dd1e4e9bac62ec?family=Zimula+Trial+Med" rel="stylesheet">
<link href="https://db.onlinewebfonts.com/c/08d8ca53f66ab5b48659912fa0136b78?family=Zimula+Trial+Bd" rel="stylesheet">
```



Also import in `index.css`:

```CSS
@import url('https://db.onlinewebfonts.com/c/46024824a3dd3309c3a7f46f4f1283ba?family=Zimula+Trial+Reg');
```



Font usage:

- Body / default: `'Zimula Trial Med', sans-serif`
- Bold / logo / hero text: `'Zimula Trial Bd', sans-serif`
- The `Reg` import is available but Med is the primary weight used everywhere

---



GLOBAL CSS (`index.css`)



```CSS
@import url('https://db.onlinewebfonts.com/c/46024824a3dd3309c3a7f46f4f1283ba?family=Zimula+Trial+Reg');

@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Zimula Trial Med', sans-serif;
  background: #0e0c0a;
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0e0c0a; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
```



---



COLOR PALETTE



- Dark background: `#0e0c0a`
- Primary text: `#241f21`, `#282425`, `#2a2420`
- White: `#fff`
- Dark accent: `#100e0c`
- Warm transparent overlays: `rgba(235, 230, 218, 0.12)`, `rgba(242, 238, 230, 0.38)`
- Frosted glass backgrounds: `rgba(248,245,240,0.72)`, `rgba(248,245,240,0.88)`, `rgba(248,245,240,0.92)`, `rgba(248,245,240,0.96)`

---



ASSET URLs (Cloudinary, not CloudFront)



Videos:

- Background video (Hero): `https://res.cloudinary.com/dy5er7kv5/video/upload/q_auto/f_auto/v1779808200/bg-video_xsmysw.mp4`
- Bird enter animation: `https://res.cloudinary.com/dy5er7kv5/video/upload/q_auto/v1779808206/bird-entrada_e72qt7.webm`
- Bird idle 1: `https://res.cloudinary.com/dy5er7kv5/video/upload/q_auto/v1779808282/bird-idle_fzjami.webm`
- Bird idle 2: `https://res.cloudinary.com/dy5er7kv5/video/upload/q_auto/v1779808284/bird-idle2_rajmgo.webm`
- Bird leave animation: `https://res.cloudinary.com/dy5er7kv5/video/upload/q_auto/v1779808286/bird-saida_ifroz1.webm`
- Background video (Section 2): `https://res.cloudinary.com/dy5er7kv5/video/upload/q_auto/f_auto/v1779835701/bg-2-video_sgbpqt.mp4`

Images:

- Q logo (unused but declared): `https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779808187/q-logo_isvugc.png`
- Center sculpture/slab: `https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779854565/slab_v1_kb4vqk.png`
- CTA card photo (Pexels): `https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400`

---



APP STRUCTURE



```Plain Text
src/
  main.tsx      -> StrictMode, renders 
  App.tsx       ->  then , no routing
  Hero.tsx      -> Hero section component
  Section2.tsx  -> Second section component
  index.css     -> Global styles
```



---



SECTION 1: HERO (`Hero.tsx`)



Container: `position: relative`, `width: 100%`, `minHeight: 100vh`, `overflow: visible`, `fontFamily: 'Zimula Trial Med', sans-serif`.



Responsive breakpoint: `isMobile = window.innerWidth < 768`, checked on mount and resize.



Layer 1 -- Background Video (z-index: 0)

- \`\` with `autoPlay muted loop playsInline`
- `position: absolute`, `inset: 0`, `width: 100%`, `height: 100vh`, `objectFit: cover`
- Source: `BG_VIDEO` URL

#### Layer 2 -- Warm Overlay (z-index: 1)

- A div covering the hero with `background: rgba(235, 230, 218, 0.12)`, `height: 100vh`, `pointerEvents: none`

#### Layer 3 -- Bird Animation System (z-index: 8)

- Container: `position: absolute`, `top: 0`, `left: 0`, `width: 100%`, `height: 100vh`, `pointerEvents: none`, `aria-hidden`
- Contains 4 \`\` elements (enter, idle1, idle2, leave), each toggled visible/hidden via `display` property
- **Desktop:** Each video is `position: absolute`, `inset: 0`, `width: 100%`, `height: 100%`, `objectFit: cover`
- **Mobile:** Each video is `position: absolute`, `top: 50%`, `left: 0`, `transform: translateY(-50%)`, `width: 100%`, `height: auto` (full width, auto height, vertically centered)
- **State machine:** Type `'enter' | 'idle1' | 'idle2' | 'leave' | 'hidden'`

  - On page load: play `enter` video
  - When `enter` ends: transition to `idle1`
  - When `idle1` ends: transition to `idle2`
  - When `idle2` ends: transition back to `idle1` (infinite loop)
  - **On scroll down** (past 10px threshold): pause all idle/enter videos, reset their `currentTime` to 0, play `leave` video
  - **On scroll back to top** (below 10px): pause leave video, reset, play `enter` video again
- Uses both React state and refs (`birdStateRef`) to avoid stale closures in scroll handlers
- All videos are preloaded with `.load()` on mount
- The `playVideo` helper sets `currentTime = 0`, checks `readyState >= 2`, then plays (or waits for `canplay` event)

#### Layer 4 -- Center Brand Text "Qelora" (z-index: 5)

- Absolutely positioned container filling `100vh`, `display: flex`, `alignItems: center`, `justifyContent: center`, `pointerEvents: none`
- Text: `"Qelora"` in `'Zimula Trial Bd', sans-serif`
- Font size: mobile `26vw`, desktop `22vw`
- `letterSpacing: -0.05em`, `color: #241f21`, `lineHeight: 1`
- `marginBottom`: mobile `8vh`, desktop `12vh`

#### Layer 5 -- Sculpture Image (z-index: 5)

- \`\` with `position: absolute`, `top: 50%`, `left: 50%`
- `transform: translateX(-50%) translateY(${-heroScroll  0.3}px)` -- parallax that moves UP as user scrolls down
- Width: mobile `220vw`, desktop `160vw`; `height: auto`
- `pointerEvents: none`, `willChange: transform`

#### Layer 6 -- Fixed Navbar (z-index: 100)

- `position: fixed`, `top: 0`, full width
- Padding: mobile `16px 20px`, desktop `20px 36px`
- **Left:** Brand name "Qelora" with registered trademark superscript. Font: `'Zimula Trial Bd'`, size: mobile `20px`, desktop `24px`, `letterSpacing: -0.03em`, `color: #241f21`. The `(R)` sup has `fontSize: 0.4em`, `verticalAlign: super`
- **Right (desktop):** `NavPills` component -- a row of pill buttons for `['Projects', 'Studio', 'Responsibility', 'Archive']` plus an `EN` language selector

  - Each pill: `background: rgba(248,245,240,0.92)`, `borderRadius: 12px`, `padding: 13px 22px 8px`, `height: 40px`, `fontSize: 13px`, `textTransform: uppercase`, `letterSpacing: 0.07em`, `color: #241f21`
  - Active pill has `fontWeight: 700` and a 3px round dot at `bottom: 3px`, centered
  - Non-active: `fontWeight: 500`
  - Language pill: separate rounded capsule (`borderRadius: 100px`), `padding: 8px 14px`, `background: rgba(248,245,240,0.88)`, `backdropFilter: blur(12px)`, `boxShadow: 0 2px 20px rgba(0,0,0,0.1)`, contains "EN" text and a chevron-down SVG
- **Right (mobile):** Hamburger button, `42x42px`, `borderRadius: 100px`, same frosted glass style. Shows X icon when open, 3-line hamburger when closed

#### Layer 7 -- Mobile Dropdown Menu (z-index: 99)

- `position: fixed`, `top: 70px`, `left: 16px`, `right: 16px`
- `background: rgba(248,245,240,0.96)`, `backdropFilter: blur(16px)`, `borderRadius: 18px`, `padding: 8px`, `boxShadow: 0 8px 40px rgba(0,0,0,0.14)`
- Each menu item: full-width button, `padding: 14px 20px`, `fontSize: 13px`, uppercase, `letterSpacing: 0.07em`, `borderBottom: 1px solid rgba(40,36,37,0.08)`
- Bottom: EN language selector row

#### Layer 8 -- Bottom Panels (z-index: 20)

- `bottom` is calculated as: `bottomOffset + heroScroll  0.5` where `bottomOffset` is 24px on mobile, 36px on desktop. This creates a parallax push-down effect as user scrolls.

**Desktop layout (side-by-side):**



- **Bottom-left panel:** `position: absolute`, `left: 36px`, `borderRadius: 18px`, `padding: 22px 28px`, `maxWidth: 270px`

  - Headline: `"Designing places\nbeyond\nwhat's expected"` -- `fontSize: clamp(17px, 2vw, 24px)`, `lineHeight: 1.28`, `color: #282425`, `letterSpacing: -0.01em`
  - Below: 1px border-top divider (`rgba(40,36,37,0.2)`), then "EXPLORE OUR APPROACH" link with down-arrow SVG. `fontSize: 11px`, uppercase, `letterSpacing: 0.1em`
- **Bottom-right panel:** `position: absolute`, `right: 36px`, `borderRadius: 18px`, `width: clamp(210px, 21vw, 290px)`, `height: 180px`, `overflow: hidden`

  - Background: Pexels photo covering the entire card
  - Dark gradient overlay: `linear-gradient(to bottom, rgba(16,14,12,0.55) 0%, transparent 60%)`
  - Top text: `"Every lasting space begins\nwith a quiet dialogue."` -- `color: #fff`, `fontSize: 13px`, `lineHeight: 1.35`
  - Bottom: inline flex with a white circle (envelope SVG icon, 36x36px, `borderRadius: 12px`) and a white "START A PROJECT" button (`fontSize: 11px`, uppercase, `letterSpacing: 0.07em`, `fontWeight: 700`, `borderRadius: 12px`, `height: 36px`)

**Mobile layout (stacked):**

- Single flex column container, `left: 20px`, `right: 20px`, `gap: 12px`
- **Top card:** Tagline panel with `background: rgba(248,245,240,0.72)`, `backdropFilter: blur(8px)`, `borderRadius: 16px`, `padding: 18px 20px`. Same text as desktop but single line: "Designing places beyond what's expected", `fontSize: 17px`. Same divider + "Explore our approach" link below.
- **Bottom card:** CTA card, `borderRadius: 16px`, `height: 120px`. Same structure as desktop right panel but adapted for mobile (text `fontSize: 12px`, same button row).

---



### SECTION 2 (`Section2.tsx`)



**Container:** `position: relative`, `width: 100%`, `minHeight: 100vh`, `display: flex`, `flexDirection: column`, `alignItems: center`, `justifyContent: center`, `overflow: hidden`, `fontFamily: 'Zimula Trial Med', sans-serif`



#### Layer 1 -- Background Video (z-index: 0)

- \`\` with `autoPlay muted loop playsInline`, `position: absolute`, `inset: 0`, `width: 100%`, `height: 100%`, `objectFit: cover`
- Source: `BG_VIDEO_2` URL

#### Layer 2 -- Warm Overlay (z-index: 1)

- `background: rgba(242, 238, 230, 0.38)`, `position: absolute`, `inset: 0`, `pointerEvents: none`

#### Layer 3 -- Center Headline (z-index: 2)

- Absolutely positioned, `inset: 0`, flex centered, `pointerEvents: none`, `textAlign: center`, `padding: 0 24px`
- Text: `"What stands the\ntest of time is all\nthat guides the\nwork."` using \`

\` tags

- `fontSize: clamp(32px, 5.5vw, 80px)`, `lineHeight: 1.18`, `color: #2a2420`, `maxWidth: 780px`, `letterSpacing: -0.025em`, `fontWeight: 400`

#### Layer 4 -- Bottom Element (z-index: 2)

- `position: absolute`, `bottom: clamp(24px, 4vh, 48px)`, full width, flex column centered, `padding: 0 24px`
- **Vertical line:** `width: 1px`, `height: 56px`, `background: rgba(42,36,32,0.25)`
- **Below (margin-top: 22px):** flex column centered, `gap: 14px`

  - **Map pin SVG:** 24x28px outline pin icon, `stroke: #2a2420`, `strokeWidth: 1.4`
  - **Subtext:** `"Civic bodies and private clients trust us to shape resilient communities and purposeful places."` -- `fontSize: clamp(11px, 1.4vw, 13px)`, `color: #2a2420`, `letterSpacing: 0.04em`, `lineHeight: 1.6`, `maxWidth: 340px`, `opacity: 0.75`

---



### KEY BEHAVIORS SUMMARY



1. **Bird animation state machine:** enter -> idle1 <-> idle2 loop; scroll triggers leave; scroll back triggers re-enter
2. **Parallax effects:** Sculpture image moves up with `translateY(-scrollY  0.3)`. Bottom panels push down with `bottom = offset + scrollY  0.5`
3. Responsive at 768px breakpoint: Nav collapses to hamburger, panels stack vertically, bird videos switch from cover-fill to width-100%/height-auto/vertically-centered, sculpture grows from 160vw to 220vw, brand text grows from 22vw to 26vw
4. All styling is inline -- no CSS classes in JSX, no Tailwind utility classes on elements
5. No third-party animation libraries -- all animations are native video playback + scroll-driven inline style changes via React state


---

# 019 Luxury Botanical

# Luxury Botanical

<!doctype html>

<html lang="en">

<head>

<meta charset="utf-8" />

<meta name="viewport" content="width=device-width, initial-scale=1" />

<title>Bentley — Beyond The Collection</title>



<link rel="preconnect" href="https://fonts.googleapis.com" />

<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<link

  href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600&family=Great+Vibes&display=swap"

  rel="stylesheet"

/>



<script src="https://cdn.tailwindcss.com"></script>

<script>

  tailwind.config = {

    theme: {

      extend: {

        fontFamily: {

          serif: ['"Instrument Serif"', "serif"],

          sans: ["Manrope", "sans-serif"],

          script: ['"Great Vibes"', "cursive"],

        },

      },

    },

  };

</script>



<style>

  \*, \*::before, \*::after { box-sizing: border-box; }

  html, body { margin: 0; padding: 0; background: #000; }

  body {

    font-family: "Manrope", ui-sans-serif, system-ui, sans-serif;

    -webkit-font-smoothing: antialiased;

  }



  .orbit-container {

    position: relative;

    margin-left: auto;

    margin-right: auto;

  }

  .orbit-scaling-container {

    width: 100%;

    height: 100%;

    position: relative;

  }

  .orbit-scaling-container--responsive {

    position: absolute;

    left: 50%;

    top: 50%;

    transform-origin: center center;

  }

  .orbit-rotation-wrapper {

    width: 100%;

    height: 100%;

    transform-origin: center center;

    position: relative;

  }

  .orbit-path-svg {

    position: absolute;

    inset: 0;

    pointer-events: none;

  }

  .orbit-item {

    position: absolute;

    will-change: transform;

    user-select: none;

  }

  .orbit-center-content {

    position: absolute;

    inset: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    z-index: 10;

  }

  .orbit-image {

    width: 100%;

    height: 100%;

    object-fit: contain;

    border-radius: 50%;

  }



  @keyframes scrollArrow {

    0%   { transform: translateY(-6px); opacity: 0; }

    40%  { opacity: 1; }

    100% { transform: translateY(10px); opacity: 0; }

  }

  .scroll-arrow {

    animation: scrollArrow 1.6s ease-in-out infinite;

  }

</style>



<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

<script type="module">

  import React from "https://esm.sh/react@18.3.1";

  import \* as ReactDOMClient from "https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1";

  import \* as FM from "https://esm.sh/framer-motion@11.18.2?deps=react@18.3.1,react-dom@18.3.1";

  window.React = React;

  window.ReactDOM = ReactDOMClient;

  window.FM = FM;

  window.\_\_depsReady = true;

  window.dispatchEvent(new Event("deps-ready"));

</script>

</head>

<body>

  <div id="root"></div>



  <script type="text/babel" data-presets="react">

(function () {

  const start = () => {

    const { useRef, useState, useEffect, useMemo } = React;

    const { createRoot } = ReactDOM;

    const {

      motion,

      useScroll,

      useTransform,

      useMotionTemplate,

      useMotionValue,

      useAnimationFrame,

      animate

    } = window.FM;



    /\* ============================================================

       OrbitImages

       ============================================================ \*/



    function generateEllipsePath(cx, cy, rx, ry) {

      return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;

    }



    function OrbitItem({

      item,

      title,

      desc,

      index,

      totalItems,

      pathValue,

      itemSizeValue,

      rotationValue,

      progress,

      fill,

      scaleStrength,

      focalPoint = 50

    }) {

      const itemOffset = fill ? index / totalItems \* 100 : 0;



      const offsetPercentage = useTransform(progress, (p) => {

        return ((p + itemOffset) % 100 + 100) % 100;

      });



      const offsetDistance = useTransform(offsetPercentage, (p) => `${p}%`);



      const itemScale = useTransform(() => {

        const rawPos = offsetPercentage.get();

        const strength = scaleStrength ? scaleStrength.get() : 0;

        let dist = Math.abs(rawPos - focalPoint);

        if (dist > 50) dist = 100 - dist;

        let targetScale = 1;

        if (dist < 20) {

          const ratio = dist / 20;

          const cosCurve = (Math.cos(ratio \* Math.PI) + 1) / 2;

          targetScale = 0.4 + cosCurve \* 0.6;

        } else {

          targetScale = 0.4;

        }

        return 1 - strength \* (1 - targetScale);

      });



      const offsetPath = useMotionTemplate`path("${pathValue}")`;

      const zIndexMV = useTransform(itemScale, (s) => Math.round(s \* 100));

      const counterRotate = useTransform(rotationValue, (r) => `rotate(${-r}deg)`);

      const labelOpacity = useTransform(scaleStrength || useMotionValue(0), (s) => s);



      return (

        <motion.div

          className="orbit-item"

          style={{

            width: itemSizeValue,

            height: itemSizeValue,

            offsetPath,

            offsetRotate: "0deg",

            offsetAnchor: "center center",

            offsetDistance,

            scale: itemScale,

            zIndex: zIndexMV,

            pointerEvents: "auto"

          }}>

          <motion.div style={{ transform: counterRotate, width: "100%", height: "100%", position: "relative" }}>

            {item}

            {(title || desc) &&

              <motion.div

                style={{

                  position: "absolute",

                  left: "115%",

                  top: "50%",

                  transform: "translateY(-50%)",

                  width: "min(360px, 95%)",

                  color: "#000",

                  opacity: labelOpacity,

                  pointerEvents: "none",

                  fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"

                }}>

                {title &&

                  <div style={{

                    fontFamily: "'Instrument Serif', serif",

                    fontSize: "clamp(26px, 3vw, 40px)",

                    lineHeight: 1.05,

                    letterSpacing: "-0.01em",

                    marginBottom: "14px",

                    whiteSpace: "normal"

                  }}>

                    {title}

                  </div>

                }

                {desc &&

                  <div style={{

                    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",

                    fontWeight: 400,

                    fontSize: "clamp(13px, 1vw, 15px)",

                    lineHeight: 1.5,

                    color: "rgba(0,0,0,0.72)"

                  }}>

                    {desc}

                  </div>

                }

              </motion.div>

            }

          </motion.div>

        </motion.div>

      );

    }



    function OrbitImages({

      images = [],

      altPrefix = "Orbiting image",

      baseWidth = 1400,

      radiusX = 700,

      radiusY = 170,

      duration = 40,

      itemSize = 64,

      direction = "normal",

      fill = true,

      width = 100,

      height = 100,

      className = "",

      showPath = false,

      pathColor = "rgba(0,0,0,0.1)",

      pathWidth = 2,

      easing = "linear",

      paused = false,

      centerContent,

      responsive = false,

      progressOverride,

      radiusXOverride,

      radiusYOverride,

      itemSizeOverride,

      rotationOverride,

      translateXOverride,

      focusStrength

    }) {

      const containerRef = useRef(null);

      const [scale, setScale] = useState(1);



      const designCenterX = baseWidth / 2;

      const designCenterY = baseWidth / 2;



      const currentRadiusX = radiusXOverride || useMotionValue(radiusX);

      const currentRadiusY = radiusYOverride || useMotionValue(radiusY);

      const currentItemSize = itemSizeOverride || useMotionValue(itemSize);

      const currentRotation = rotationOverride || useMotionValue(-8);

      const currentTranslateX = translateXOverride || useMotionValue(0);



      const pathValue = useTransform([currentRadiusX, currentRadiusY], ([rx, ry]) => {

        return generateEllipsePath(designCenterX, designCenterY, rx, ry);

      });



      useEffect(() => {

        if (!responsive || !containerRef.current) return;

        const updateScale = () => {

          if (!containerRef.current) return;

          setScale(containerRef.current.clientWidth / baseWidth);

        };

        updateScale();

        const observer = new ResizeObserver(updateScale);

        observer.observe(containerRef.current);

        return () => observer.disconnect();

      }, [responsive, baseWidth]);



      const internalProgress = useMotionValue(0);



      useEffect(() => {

        if (paused || progressOverride) return;

        const controls = animate(internalProgress, direction === "reverse" ? -100 : 100, {

          duration,

          ease: easing,

          repeat: Infinity,

          repeatType: "loop"

        });

        return () => controls.stop();

      }, [internalProgress, duration, easing, direction, paused, progressOverride]);



      const activeProgress = progressOverride || internalProgress;

      const containerWidth = responsive ? "100%" : typeof width === "number" ? width : "100%";

      const containerHeight = responsive ? "auto" : typeof height === "number" ? height : typeof width === "number" ? width : "auto";



      const items = images.map((entry, index) => {

        const src = typeof entry === "string" ? entry : entry.src;

        return (

          <motion.img

            key={src}

            src={src}

            alt={`${altPrefix} ${index + 1}`}

            draggable={false}

            className="orbit-image"

            whileHover={{ scale: 1.2 }}

            transition={{ duration: 0.3 }}

            style={{ cursor: "pointer", pointerEvents: "auto" }}

          />

        );

      });



      return (

        <div

          ref={containerRef}

          className={`orbit-container ${className}`}

          style={{

            width: containerWidth,

            height: containerHeight,

            aspectRatio: responsive ? "1 / 1" : undefined

          }}

          aria-hidden="true">

          <div

            className={responsive ? "orbit-scaling-container orbit-scaling-container--responsive" : "orbit-scaling-container"}

            style={{

              width: responsive ? baseWidth : "100%",

              height: responsive ? baseWidth : "100%",

              transform: responsive ? `translate(-50%, -50%) scale(${scale})` : undefined

            }}>

            <motion.div className="orbit-rotation-wrapper" style={{ rotate: currentRotation, x: currentTranslateX }}>

              {showPath &&

                <svg width="100%" height="100%" viewBox={`0 0 ${baseWidth} ${baseWidth}`} className="orbit-path-svg">

                  <path d={pathValue.get()} fill="none" stroke={pathColor} strokeWidth={pathWidth / scale} />

                </svg>

              }

              {items.map((item, index) => {

                const entry = images[index];

                const title = typeof entry === "object" ? entry.title : null;

                const desc = typeof entry === "object" ? entry.desc : null;

                return (

                  <OrbitItem

                    key={index}

                    item={item}

                    title={title}

                    desc={desc}

                    index={index}

                    totalItems={items.length}

                    pathValue={pathValue}

                    itemSizeValue={currentItemSize}

                    rotationValue={currentRotation}

                    progress={activeProgress}

                    fill={fill}

                    scaleStrength={focusStrength}

                    focalPoint={50}

                  />

                );

              })}

            </motion.div>

          </div>

          {centerContent && <div className="orbit-center-content">{centerContent}</div>}

        </div>

      );

    }



    /\* ============================================================

       StaySection

       ============================================================ \*/



    function StaySection() {

      const blurUp = {

        initial: { opacity: 0, y: 40, filter: "blur(20px)" },

        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },

        viewport: { once: true, amount: 0.3 },

        transition: { duration: 1, ease: "easeOut" }

      };



      return (

        <section

          className="relative w-full overflow-hidden"

          style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>

          <img

            src="https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780401858/pasted-1779282335552-1_gmztyi.png"

            alt=""

            aria-hidden="true"

            className="absolute inset-x-0 bottom-0 w-full pointer-events-none select-none"

            style={{ objectFit: "cover", objectPosition: "center bottom" }}

          />



          <div className="relative max-w-[1480px] mx-auto px-8 md:px-16 pt-20 md:pt-24 pb-20 md:pb-24 min-h-screen flex flex-col" style={{ gap: "32px" }}>

            <motion.div {...blurUp}>

              <div style={{

                fontFamily: "'Instrument Serif', serif",

                fontSize: "clamp(60px, 11vw, 160px)",

                lineHeight: 0.95,

                letterSpacing: "-0.01em",

                color: "#000"

              }}>

                Stay <span style={{ fontStyle: "italic" }}>in</span>

              </div>

              <div style={{

                fontFamily: "Manrope, ui-sans-serif, sans-serif",

                fontWeight: 400,

                lineHeight: 0.95,

                letterSpacing: "-0.02em",

                color: "#000",

                fontSize: "64px"

              }}>

                the collection

              </div>

            </motion.div>



            <motion.div

              {...blurUp}

              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}

              className="max-w-md">

              <p className="mb-6" style={{

                fontFamily: "Manrope, ui-sans-serif, sans-serif",

                fontSize: "15px",

                lineHeight: 1.55,

                color: "rgba(0,0,0,0.78)"

              }}>

                Editions and invitations from the Bentley fragrance studio, sent twice a season.

              </p>

              <form

                className="flex items-center border-b border-black/40 pb-2 gap-3"

                onSubmit={(e) => e.preventDefault()}>

                <input

                  type="email"

                  placeholder="your@email.com"

                  className="bg-transparent flex-1 outline-none"

                  style={{ fontFamily: "Manrope, ui-sans-serif, sans-serif", fontSize: "15px", color: "#000" }}

                />

                <button type="submit" style={{

                  fontFamily: "Manrope, ui-sans-serif, sans-serif",

                  fontSize: "11px",

                  fontWeight: 500,

                  letterSpacing: "0.25em",

                  textTransform: "uppercase",

                  color: "#000"

                }}>

                  Subscribe →

                </button>

              </form>

            </motion.div>

          </div>

        </section>

      );

    }



    /\* ============================================================

       Footer

       ============================================================ \*/



    function Footer() {

      const blurUp = {

        initial: { opacity: 0, y: 40, filter: "blur(20px)" },

        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },

        viewport: { once: true, amount: 0.3 },

        transition: { duration: 1, ease: "easeOut" }

      };



      const Column = ({ heading, items }) => (

        <div>

          <div className="mb-5 text-black/55" style={{

            fontFamily: "Manrope, ui-sans-serif, sans-serif",

            fontSize: "11px",

            fontWeight: 500,

            letterSpacing: "0.3em",

            textTransform: "uppercase"

          }}>

            {heading}

          </div>

          <ul className="space-y-3">

            {items.map((label) => (

              <li key={label}>

                <a href="#" className="hover:underline" style={{

                  fontFamily: "Manrope, ui-sans-serif, sans-serif",

                  fontSize: "15px",

                  fontWeight: 400,

                  color: "rgba(0,0,0,0.85)"

                }}>

                  {label}

                </a>

              </li>

            ))}

          </ul>

        </div>

      );



      return (

        <footer className="relative w-full text-black overflow-hidden" style={{ backgroundColor: "#f4ecdc" }}>

          <div className="relative max-w-[1480px] mx-auto px-8 md:px-16 pt-12 md:pt-14 pb-12">

            <motion.div

              {...blurUp}

              transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}

              className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-10 mb-20 md:mb-24">

              <Column heading="Discover" items={["All fragrances", "The bottle", "Sustainability", "Editions"]} />

              <Column heading="Studio" items={["Our story", "Perfumers", "Atelier visits", "Press"]} />

              <Column heading="Contact" items={["Boutiques", "Concierge", "Returns", "Care guide"]} />



              <div>

                <div className="mb-5 text-black/55" style={{

                  fontFamily: "Manrope, ui-sans-serif, sans-serif",

                  fontSize: "11px",

                  fontWeight: 500,

                  letterSpacing: "0.3em",

                  textTransform: "uppercase"

                }}>

                  Newsletter

                </div>

                <p className="mb-5 text-black/65" style={{

                  fontFamily: "Manrope, ui-sans-serif, sans-serif",

                  fontSize: "14px",

                  lineHeight: 1.5

                }}>

                  Editions and invitations, sent twice a season.

                </p>

                <form

                  className="flex items-center border-b border-black/30 pb-2 gap-3"

                  onSubmit={(e) => e.preventDefault()}>

                  <input

                    type="email"

                    placeholder="your@email.com"

                    className="bg-transparent flex-1 outline-none"

                    style={{ fontFamily: "Manrope, ui-sans-serif, sans-serif", fontSize: "14px", color: "#000" }}

                  />

                  <button type="submit" style={{

                    fontFamily: "Manrope, ui-sans-serif, sans-serif",

                    fontSize: "11px",

                    fontWeight: 500,

                    letterSpacing: "0.25em",

                    textTransform: "uppercase"

                  }}>

                    Subscribe →

                  </button>

                </form>

              </div>

            </motion.div>



            <motion.div

              {...blurUp}

              transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}

              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 border-t border-black/15">

              <div className="text-black/55" style={{

                fontFamily: "Manrope, ui-sans-serif, sans-serif",

                fontSize: "11px",

                fontWeight: 500,

                letterSpacing: "0.3em",

                textTransform: "uppercase"

              }}>

                © 2026 Beyond The Collection

              </div>

              <div className="flex items-center gap-5" style={{

                fontFamily: "Manrope, ui-sans-serif, sans-serif",

                fontSize: "11px",

                fontWeight: 500,

                letterSpacing: "0.28em",

                textTransform: "uppercase"

              }}>

                <a href="#" className="hover:underline">Instagram</a>

                <span className="text-black/30">·</span>

                <a href="#" className="hover:underline">TikTok</a>

                <span className="text-black/30">·</span>

                <a href="#" className="hover:underline">Spotify</a>

              </div>

              <div className="text-black/55" style={{

                fontFamily: "Manrope, ui-sans-serif, sans-serif",

                fontSize: "11px",

                fontWeight: 500,

                letterSpacing: "0.3em",

                textTransform: "uppercase"

              }}>

                EN · USD

              </div>

            </motion.div>

          </div>

        </footer>

      );

    }



    /\* ============================================================

       App

       ============================================================ \*/



    const orbitImagesData = [

      {

        src: "https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780390315/BL1996-Beyond_wild_vetiver_Flakon_100ml_300dpi_a55ie5.webp",

        title: "Wild Vetiver",

        desc: "Smoky vetiver wrapped in saffron and leather — a grounded, untamed signature."

      },

      {

        src: "https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780390315/BL2156_BEYOND_RADIANT_OSMANTHUS_hoc3up.webp",

        title: "Radiant Osmanthus",

        desc: "Apricot-tinged osmanthus over soft musks. Quietly luminous, never loud."

      },

      {

        src: "https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780390315/BL2157_BEYOND_VIBRANT_HIBISCUS_pgiehq.webp",

        title: "Vibrant Hibiscus",

        desc: "Bright hibiscus and pink pepper resting on creamy sandalwood."

      },

      {

        src: "https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780390315/BL2158_BEYOND_MELLOW_HELIOTROPE_agqych.webp",

        title: "Mellow Heliotrope",

        desc: "Almond, vanilla and heliotrope petals — a powdery, hushed warmth."

      },

      {

        src: "https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780390317/BL2371-BL2372-BL2373-Magnetic-Amber_web_2_dbmtpy.webp",

        title: "Magnetic Amber",

        desc: "Resinous amber, oud and rich woods. The collection's deepest note."

      },

      {

        src: "https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780390315/BL2156_BEYOND_RADIANT_OSMANTHUS_1_hlc4v1.webp",

        title: "Crystal Edition",

        desc: "A limited cut of the bottle — etched facets, lavender pour, leather collar."

      }

    ];



    const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_3BA1nJibL92zfZpAJB3BLBU6tQI/hf_20260520_114550_b72cc2b7-2267-4d9e-b19f-f3bb4b0c7084.mp4";

    const TARGET_RADIUS = 650;



    function App() {

      const containerRef = useRef(null);



      const { scrollYProgress } = useScroll({

        target: containerRef,

        offset: ["start start", "end end"]

      });



      const rx = useTransform(scrollYProgress, [0, 0.08, 1], ["0%", "55%", "55%"]);

      const ry = useTransform(scrollYProgress, [0, 0.08, 1], ["0%", "55%", "55%"]);

      const clipPath = useMotionTemplate`ellipse(${rx} ${ry} at 50% 50%)`;



      const textOpacity = useTransform(

        scrollYProgress,

        [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1],

        [0, 1, 1, 0, 0, 1, 1]

      );

      const textBlurVal = useTransform(

        scrollYProgress,

        [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1],

        [15, 0, 0, 15, 15, 0, 0]

      );

      const filterText = useMotionTemplate`blur(${textBlurVal}px)`;

      const yElement = useTransform(

        scrollYProgress,

        [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1],

        [20, 0, 0, 20, 20, 0, 0]

      );



      const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.03, 0.08], [1, 1, 0]);



      const orbitItemSize = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [80, 360, 360, 80, 80]);

      const orbitRx = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [330, TARGET_RADIUS, TARGET_RADIUS, 330, 330]);

      const orbitRy = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [140, TARGET_RADIUS, TARGET_RADIUS, 140, 140]);

      const orbitRotation = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [-15, 0, 0, -15, -15]);

      const orbitTx = useTransform(

        scrollYProgress,

        [0.15, 0.25, 0.85, 0.95, 1],

        [0, -(TARGET_RADIUS + 200), -(TARGET_RADIUS + 200), 0, 0]

      );

      const focusStrength = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [0, 1, 1, 0, 0]);



      const orbitProgress = useMotionValue(0);

      const prevScroll = useRef(0);



      useAnimationFrame((time, delta) => {

        const pos = scrollYProgress.get();

        const scrollDelta = pos - prevScroll.current;

        prevScroll.current = pos;



        let frameSpeed = 0;

        if (pos > 0.15 && pos < 0.85) {

          frameSpeed = scrollDelta \* 200;

        } else {

          frameSpeed = delta / 1000 \* 2.5;

        }



        orbitProgress.set(orbitProgress.get() + frameSpeed);

      });



      return (

        <>

          <div ref={containerRef} className="relative w-full h-[600vh] bg-black">

            <div className="sticky top-0 w-full h-screen overflow-hidden text-white">



              {/\* Video background \*/}

              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">

                <source src={VIDEO_SRC} type="video/mp4" />

              </video>



              {/\* Top-left logo text \*/}

              <div

                className="absolute z-10 flex flex-col items-start text-left text-black select-none leading-[0.95]"

                style={{ top: "120px", left: "96px" }}>

                <div className="flex items-baseline">

                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px, 5vw, 64px)" }}>

                    Beyond

                  </span>

                  <span style={{

                    fontFamily: "'Instrument Serif', serif",

                    fontStyle: "italic",

                    fontSize: "clamp(32px, 5vw, 64px)",

                    marginLeft: "0.05em"

                  }}>

                    The

                  </span>

                </div>

                <span style={{

                  fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",

                  fontWeight: 400,

                  fontSize: "clamp(28px, 4.4vw, 56px)",

                  letterSpacing: "-0.01em",

                  marginTop: "0.05em"

                }}>

                  Collection

                </span>

              </div>



              {/\* Scroll hint arrow \*/}

              <motion.div

                className="absolute z-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white select-none pointer-events-none"

                style={{ bottom: "40px", opacity: scrollHintOpacity }}>

                <div className="relative w-[20px] h-[34px] overflow-hidden">

                  <svg

                    className="scroll-arrow absolute inset-0"

                    width="20" height="34" viewBox="0 0 20 34" fill="none"

                    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">

                    <path d="M10 4 V28 M3 21 L10 28 L17 21" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

                  </svg>

                </div>

              </motion.div>



              {/\* Clip-path reveal with orbit \*/}

              <motion.div

                className="absolute z-20 flex items-center justify-center overflow-hidden"

                style={{

                  clipPath,

                  rotate: -15,

                  width: "150vw",

                  height: "150vh",

                  left: "-25vw",

                  top: "-25vh"

                }}>

                <div className="absolute inset-0 bg-white" />

                <div

                  className="relative flex flex-col items-center justify-center"

                  style={{ width: "100vw", height: "100vh", transform: "rotate(15deg)" }}>

                  <motion.div className="w-[90vw] max-w-[1200px] aspect-square relative z-0">

                    <OrbitImages

                      images={orbitImagesData}

                      shape="ellipse"

                      direction="normal"

                      duration={40}

                      fill={true}

                      showPath={false}

                      responsive={true}

                      baseWidth={800}

                      progressOverride={orbitProgress}

                      radiusXOverride={orbitRx}

                      radiusYOverride={orbitRy}

                      itemSizeOverride={orbitItemSize}

                      rotationOverride={orbitRotation}

                      translateXOverride={orbitTx}

                      focusStrength={focusStrength}

                    />

                  </motion.div>

                </div>

              </motion.div>



              {/\* Text overlays \*/}

              <div className="absolute inset-0 z-[60] pointer-events-none">



                {/\* Center brand text \*/}

                <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">

                  <motion.div

                    className="flex flex-col items-center whitespace-nowrap pointer-events-auto"

                    style={{

                      filter: filterText,

                      opacity: textOpacity,

                      WebkitFontSmoothing: "antialiased",

                      WebkitBackfaceVisibility: "hidden",

                      transform: "translateZ(0)"

                    }}>

                    <div className="flex items-baseline text-black leading-none mb-1">

                      <span className="font-serif text-[45px] md:text-[55px] tracking-tight text-black">Beyond </span>

                      <span className="font-serif text-[45px] md:text-[55px] italic tracking-tight text-black">The</span>

                    </div>

                    <span className="font-sans text-[28px] md:text-[36px] tracking-tight text-black mt-[-5px]">Collection</span>

                  </motion.div>

                </div>



                {/\* Top-right info \*/}

                <motion.div

                  className="absolute top-32 right-[calc(6vw+150px)] md:right-[214px] flex flex-col items-start text-left pointer-events-auto cursor-text"

                  style={{ y: yElement, filter: filterText, opacity: textOpacity }}>

                  <span className="font-serif text-[40px] leading-none mb-3 text-black">2K26</span>

                  <span className="font-serif text-[16px] uppercase tracking-widest text-black leading-[20px] text-left">

                    JOIN AN EXCLUSIVE<br />COMMUNITY

                  </span>

                </motion.div>



                {/\* Bottom-left number \*/}

                <motion.div

                  className="absolute bottom-8 left-8 md:bottom-16 md:left-16 flex flex-col items-start text-black pointer-events-auto cursor-text"

                  style={{ y: yElement, filter: filterText, opacity: textOpacity }}>

                  <span className="font-serif text-[40px] leading-none mb-1 text-black">0651</span>

                  <span className="font-serif text-[16px] uppercase tracking-widest text-black">COLLECTION</span>

                </motion.div>



                {/\* Bottom-right CTA \*/}

                <div className="absolute bottom-16 right-[6vw] md:right-[10vw] flex flex-col items-start z-10 pointer-events-auto">

                  <motion.p

                    className="font-serif text-[16px] uppercase tracking-widest text-black leading-[20px] mb-6 text-left w-[240px] cursor-text"

                    style={{ y: yElement, filter: filterText, opacity: textOpacity }}>

                    JOIN AN EXCLUSIVE COMMUNITY OF SAILORS. WHETHER YOU CRAVE THE THRILL OF THE OPEN

                  </motion.p>

                  <motion.div

                    className="flex gap-0 pointer-events-auto items-center"

                    style={{ y: yElement, filter: filterText, opacity: textOpacity }}>

                    <button className="bg-black hover:bg-black/90 transition-colors text-white rounded-[40px] px-8 py-3.5 font-serif tracking-[0.1em] uppercase text-[12px] md:text-[14px] z-10">

                      BUY COLLECTION

                    </button>

                    <button className="bg-black hover:bg-black/90 transition-colors w-[46px] h-[46px] flex items-center justify-center rounded-[50%] text-white -ml-2 z-0">

                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1">

                        <path d="M5 12h14M12 5l7 7-7 7" />

                      </svg>

                    </button>

                  </motion.div>

                </div>

              </div>



              {/\* Header \*/}

              <motion.header

                className="absolute top-0 left-0 w-full px-6 md:px-12 py-5 md:py-6 flex justify-between items-center z-[100] pointer-events-none"

                style={{ opacity: scrollHintOpacity }}>

                <a href="#" className="flex items-center gap-3 text-black select-none pointer-events-auto" aria-label="Bentley">

                  <svg width="54" height="40" viewBox="0 0 84 60" fill="none" aria-hidden="true">

                    <g fill="currentColor">

                      <path d="M42 22 C30 22 19 16 4 12 C9 26 18 33 30 33 L42 33 Z" />

                      <path d="M42 22 C54 22 65 16 80 12 C75 26 66 33 54 33 L42 33 Z" />

                      <path d="M34 25 C36 28 39 30 42 30 C45 30 48 28 50 25 L42 22 Z" opacity="0.7" />

                    </g>

                    <text x="42" y="52" textAnchor="middle" fontFamily="'Instrument Serif', serif" fontSize="22" fontStyle="italic" fill="currentColor">B</text>

                  </svg>

                  <span style={{

                    fontFamily: "Manrope, ui-sans-serif, sans-serif",

                    fontWeight: 600,

                    fontSize: "14px",

                    letterSpacing: "0.42em",

                    textTransform: "uppercase"

                  }}>

                    Bentley

                  </span>

                </a>



                <a

                  href="#"

                  className="pointer-events-auto inline-flex items-center gap-2 bg-black text-white rounded-full pl-5 pr-2 py-2 hover:bg-black/85 transition-colors"

                  style={{

                    fontFamily: "Manrope, ui-sans-serif, sans-serif",

                    fontSize: "11px",

                    fontWeight: 500,

                    letterSpacing: "0.22em",

                    textTransform: "uppercase"

                  }}>

                  <span className="hidden sm:inline">Shop the collection</span>

                  <span className="sm:hidden">Shop</span>

                  <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-white/15">

                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">

                      <path d="M5 12h14M12 5l7 7-7 7" />

                    </svg>

                  </span>

                </a>

              </motion.header>



            </div>

          </div>



          <StaySection />

          <Footer />

        </>

      );

    }



    createRoot(document.getElementById("root")).render(<App />);

  };



  if (window.\_\_depsReady) start();

  else window.addEventListener("deps-ready", start, { once: true });

})();

  </script>

</body>

</html>


---

# 020 Cursor Follow

# Cursor Follow


---

# 021 Build With Us

# Build With Us

Build a single-page React + TypeScript + Vite + Tailwind site that is a full-screen video-background landing page with a contact form. Use `lucide-react` for icons.



**Layout & Sizing**

- Root: `min-h-screen` white background with padding `p-3 sm:p-4 md:p-6`.
- Inside the root, one large rounded card with `rounded-2xl sm:rounded-3xl`, `overflow-hidden`. Heights: `min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-[calc(100vh-48px)]`. On desktop it locks to viewport; on tablet/mobile it expands to content.
- Background video fills the card (`absolute inset-0 w-full h-full object-cover`). The video element has `autoPlay muted loop playsInline`. Use this exact URL:

  ```Plain Text
  https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4
  ```
- Content layer: `relative z-10 flex flex-col` with the same min-height ladder as the card and `lg:h-full`, padding `p-4 sm:p-6 md:p-8`, `gap-6`.

**Fonts**

- Import from Google Fonts in `index.css`: `Inter` (weights 300–700) and `Instrument Serif` (italic + regular).
- Set `* { font-family: 'Inter', sans-serif; }` globally.
- Use `Instrument Serif` italic for one accent word inline (see headline below).

**Navbar (top)**

- Pill bar with `bg-white/60 backdrop-blur-md rounded-2xl shadow-sm`, padding `pl-3 sm:pl-4 pr-2 py-2`, `w-full sm:w-auto`, `flex items-center gap-3 sm:gap-6`.
- Logo: 32x32 inline SVG (`viewBox="0 0 256 256"`) with two black filled paths forming a stylized "M":

`M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z`.

- Links (hidden on mobile, shown `sm:flex`): `Our story`, `Expertise`, `Our work`, `Journal` — class `text-gray-800 text-sm font-medium hover:opacity-60 transition-opacity whitespace-nowrap`.
- CTA button on the right: black pill `bg-black text-white text-sm font-medium px-4 sm:px-5 py-2 rounded-xl hover:bg-gray-800` with label `Start a project`. On mobile it floats right with `ml-auto`.

**Spacer**

- A `<div className="flex-1 min-h-[2rem]" />` between nav and the bottom row.

**Bottom row (headline + form)**

- Container: `flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6`.

**Headline (left)**

- `<p>` with white text, `text-3xl sm:text-4xl xl:text-5xl font-medium leading-tight drop-shadow-lg lg:max-w-lg xl:max-w-2xl shrink-0`.
- Content (with `<br />`):

`We craft bold ideas` / `and ship them as *products*`

- The word `products` is wrapped in a `<span>` with inline style: `fontFamily: "'Instrument Serif', serif"`, `fontStyle: 'italic'`, `fontWeight: 400`.

**Contact form card (right)**

- Outer: `w-full lg:w-[min(480px,45%)] shrink-0`.
- Card: `bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden`, inner padding `p-4 sm:p-6`, `flex flex-col gap-4`.

1. **Heading:** `Say hello! 👋` — `text-xl sm:text-2xl font-semibold text-black tracking-tight`.
2. **Email + socials row** (always horizontal): `flex flex-row items-center justify-between gap-3 bg-gray-50 rounded-2xl px-4 py-2.5`.

   - Left: small grey label `Drop us a line`, then mailto link `hello@forma.co` in `text-blue-600 font-semibold hover:underline truncate`.
   - Right: four 32x32 rounded-xl buttons (`w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity`) using lucide icons size 13:
   
     - Twitter — `bg-gray-100 text-gray-800`
     - Circle — `bg-pink-100 text-pink-500`
     - Instagram — `bg-orange-100 text-orange-400`
     - Linkedin — `bg-blue-100 text-blue-600`
   - Extract this into a small `SocialBtn` helper component.
3. **OR divider:** horizontal lines on either side of the word `OR` (`text-gray-400 font-medium text-sm`, lines `flex-1 h-px bg-gray-200`).
4. **Form** (`flex flex-col gap-4`):

   - Label `Tell us about your vision` (`text-sm font-medium text-black`).
   - Name + Email inputs side by side on `sm:` (`flex flex-col sm:flex-row gap-2`), placeholders `Full name` and `Email`. Input style: `flex-1 min-w-0 text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition`.
   - Textarea, 4 rows, placeholder `What are you looking to build or improve...`, same input style plus `resize-none`.
   - Service tags section: label `I need help with...`. Tags wrap (`flex flex-wrap gap-1.5`). Each tag is a button `text-xs font-medium px-3 py-2 rounded-lg border transition-all`. Inactive: `bg-white text-gray-700 border-gray-200 hover:border-gray-400`. Active (selected): `bg-gray-100 text-black border-black`. Multi-select toggle via state.
   
     - Services list (exact order): `Website`, `Mobile App`, `Web App`, `E-Commerce`, `Visual Identity`, `3D & Motion`, `Digital Marketing`, `Growth & Consulting`, `Other`.
   - Submit button: `w-full bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-60`. Label: `Send my message` (or `Sending...` while submitting).
5. **Submit behavior:** On submit, set `sending=true`, await a 1-second fake delay (`new Promise(r => setTimeout(r, 1000))`), then show a success state in place of the form: centered column with `py-6 gap-3`, a 48x48 green check pill (`w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-xl` containing `✓`), heading `You're all set!` (`text-base font-semibold text-gray-900`), and subtext `Expect a reply within 24 hours.` (`text-sm text-gray-500`).

**State (useState)**

- `selected: string[]` (toggled service chips)
- `name`, `email`, `message`: strings
- `sending`, `sent`: booleans

**Transitions/animations**

- All interactive elements use Tailwind `transition-*` utilities (opacity, colors, all).
- No external animation library; rely on Tailwind hover/focus transitions and `backdrop-blur-md` on the navbar.

**Constants at the top of the file**

- `VIDEO_URL` (the CloudFront URL above) and `SERVICES` array.

**Files**

- `src/App.tsx` — entire component plus `SocialBtn` helper.
- `src/index.css` — Google Fonts import + Tailwind directives + global `* { font-family: 'Inter', sans-serif; }`.
- Standard Vite + Tailwind config (`tailwind.config.js` scanning `./index.html` and `./src/**/*.{ts,tsx}`).


---

# 022 Liquid Glass Agency

# Liquid Glass Agency

Build a dark, premium, single-page landing page for an AI-powered web design agency using React + Vite + Tailwind CSS + shadcn/ui + Framer Motion (motion/react). The page has a luxury editorial aesthetic -- black backgrounds, white text, liquid glass (glassmorphism) effects, and cinematic video backgrounds.



FONTS

Import from Google Fonts:



https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap

- Headings: Instrument Serif (italic) -- used via Tailwind class font-heading
- Body: Barlow (weights 300, 400, 500, 600) -- used via Tailwind class font-body

Tailwind config extends fontFamily:



heading: ["'Instrument Serif'", "serif"]

body: ["'Barlow'", "sans-serif"]



COLOR THEME (CSS custom properties, HSL format)



:root {

  --background: 213 45% 67%;

  --foreground: 0 0% 100%;

  --card: 213 45% 62%;

  --card-foreground: 0 0% 100%;

  --primary: 0 0% 100%;

  --primary-foreground: 213 45% 67%;

  --secondary: 213 45% 72%;

  --secondary-foreground: 0 0% 100%;

  --muted: 213 35% 60%;

  --muted-foreground: 0 0% 100% / 0.7;

  --accent: 213 45% 72%;

  --accent-foreground: 0 0% 100%;

  --destructive: 0 84.2% 60.2%;

  --border: 0 0% 100% / 0.2;

  --input: 0 0% 100% / 0.2;

  --ring: 0 0% 100% / 0.3;

  --radius: 9999px;

  --glass-bg: rgba(255, 255, 255, 0.12);

  --glass-border: rgba(255, 255, 255, 0.25);

  --glass-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);

  --glass-blur: 16px;

}



LIQUID GLASS CSS (the core visual effect)

Two utility classes defined in index.css under @layer components:

.liquid-glass (subtle):



.liquid-glass {

  background: rgba(255, 255, 255, 0.01);

  background-blend-mode: luminosity;

  backdrop-filter: blur(4px);

  -webkit-backdrop-filter: blur(4px);

  border: none;

  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);

  position: relative;

  overflow: hidden;

}

.liquid-glass::before {

  content: '';

  position: absolute;

  inset: 0;

  border-radius: inherit;

  padding: 1.4px;

  background: linear-gradient(

    180deg,

    rgba(255, 255, 255, 0.45) 0%,

    rgba(255, 255, 255, 0.15) 20%,

    rgba(255, 255, 255, 0) 40%,

    rgba(255, 255, 255, 0) 60%,

    rgba(255, 255, 255, 0.15) 80%,

    rgba(255, 255, 255, 0.45) 100%

  );

  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;

  mask-composite: exclude;

  pointer-events: none;

}

.liquid-glass-strong (more prominent, used on CTA buttons):



.liquid-glass-strong {

  background: rgba(255, 255, 255, 0.01);

  background-blend-mode: luminosity;

  backdrop-filter: blur(50px);

  -webkit-backdrop-filter: blur(50px);

  border: none;

  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.05),

    inset 0 1px 1px rgba(255, 255, 255, 0.15);

  position: relative;

  overflow: hidden;

}

.liquid-glass-strong::before {

  content: '';

  position: absolute;

  inset: 0;

  border-radius: inherit;

  padding: 1.4px;

  background: linear-gradient(

    180deg,

    rgba(255, 255, 255, 0.5) 0%,

    rgba(255, 255, 255, 0.2) 20%,

    rgba(255, 255, 255, 0) 40%,

    rgba(255, 255, 255, 0) 60%,

    rgba(255, 255, 255, 0.2) 80%,

    rgba(255, 255, 255, 0.5) 100%

  );

  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;

  mask-composite: exclude;

  pointer-events: none;

}

The ::before pseudo-element creates a gradient border effect using the mask-composite trick (thin glowing border that fades in the middle).



ASSETS & MEDIA URLS

Hero background video (MP4, CloudFront):



https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4

Poster image: /images/hero_bg.jpeg (local file in public/images/)

StartSection video (HLS via Mux):



https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8

Stats section video (HLS via Mux, displayed desaturated):



https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8

CTA/Footer section video (HLS via Mux):



https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8

Feature GIFs (imported from src/assets/):

- feature-1.gif -- used in FeaturesChess row 1 (right side)
- feature-2.gif -- used in FeaturesChess row 2 (left side)

Logo icon: src/assets/logo-icon.png (12x12 Tailwind = h-12 w-12)



SECTION-BY-SECTION BREAKDOWN

1. NAVBAR (fixed, floating)

- Fixed position: fixed top-4 left-0 right-0 z-50, horizontal padding px-8 lg:px-16, vertical py-3
- Left: Logo image (h-12 w-12)
- Center (desktop only, hidden md:flex): Navigation links inside a liquid-glass rounded-full px-1.5 py-1 pill container

  - Links: "Home", "Services", "Work", "Process", "Pricing"
  - Each link: px-3 py-2 text-sm font-medium text-foreground/90 font-body
  - Last item: white solid button "Get Started" with ArrowUpRight icon, bg-white text-black rounded-full px-3.5 py-1.5 text-sm

1. HERO SECTION

- Container: relative overflow-visible, fixed height 1000px
- Background video: <video> tag with autoPlay, loop, muted, playsInline. Positioned absolute left-0 w-full h-auto object-contain z-0 with top: 20%. Source is the CloudFront MP4 URL. Poster is /images/hero_bg.jpeg.
- Dark overlay: absolute inset-0 bg-black/5 z-0
- Bottom gradient fade: absolute bottom-0, height 300px, linear-gradient(to bottom, transparent, black)
- Content (z-10, centered, paddingTop: 150px):

  - Badge pill: liquid-glass rounded-full px-1 py-1 with inner white "New" badge (bg-white text-black rounded-full px-3 py-1 text-xs font-semibold) and text "Introducing AI-powered web design."
  - Heading (BlurText component): "The Website Your Brand Deserves" -- text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-foreground leading-[0.8] max-w-2xl tracking-[-4px], animated word-by-word from bottom with blur, delay 100ms
  - Subtext (motion.p): "Stunning design. Blazing performance. Built by AI, refined by experts. This is web design, wildly reimagined." -- blur-in animation, delay 0.8s, text-sm md:text-base text-white font-body font-light leading-tight
  - CTA buttons (motion.div, delay 1.1s):
  
    - "Get Started" -- liquid-glass-strong rounded-full px-5 py-2.5 with ArrowUpRight icon
    - "Watch the Film" -- text-only with Play icon (filled)
  - Partners bar at bottom (mt-auto pb-8 pt-16): "Trusted by the teams behind" liquid-glass pill, then 5 partner names rendered in text-2xl md:text-3xl font-heading italic text-white with gap-12 md:gap-16: Stripe, Vercel, Linear, Notion, Figma

1. BlurText COMPONENT (custom animated text)

- Splits text by words or letters
- Uses IntersectionObserver to trigger on scroll
- Each word/letter is a <motion.span> that animates from {filter: 'blur(10px)', opacity: 0, y: 50} (when direction=bottom) through {filter: 'blur(5px)', opacity: 0.5, y: -5} to {filter: 'blur(0px)', opacity: 1, y: 0}
- Staggered by index with configurable delay (default 200ms per element)
- Step duration 0.35s per keyframe step

1. START SECTION ("How It Works")

- Full-width section with HLS video background using hls.js library
- Video: autoPlay, loop, muted, playsInline, absolute inset-0 w-full h-full object-cover
- Top and bottom gradient fades (200px each, black to transparent)
- Content centered (z-10, minHeight 500px):

  - Badge: "How It Works" in liquid-glass rounded-full px-3.5 py-1
  - Heading: "You dream it. We ship it." -- text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9]
  - Subtext: "Share your vision. Our AI handles the rest--wireframes, design, code, launch. All in days, not quarters." -- text-white/60 font-body font-light text-sm md:text-base
  - CTA: "Get Started" liquid-glass-strong rounded-full px-6 py-3

1. FEATURES CHESS (alternating rows)

- Section header: "Capabilities" badge + "Pro features. Zero complexity." heading
- Row 1 (flex, content left / image right):

  - Title: "Designed to convert. Built to perform."
  - Body: "Every pixel is intentional. Our AI studies what works across thousands of top sites--then builds yours to outperform them all."
  - Button: "Learn more" liquid-glass-strong
  - Gif: https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif download and place inside liquid-glass rounded-2xl overflow-hidden
- Row 2 (flex-row-reverse, content right / image left):

  - Title: "It gets smarter. Automatically."
  - Body: "Your site evolves on its own. AI monitors every click, scroll, and conversion--then optimizes in real time. No manual updates. Ever."
  - Button: "See how it works" liquid-glass-strong
  - gif: https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif download and place inside liquid-glass rounded-2xl overflow-hidden

1. FEATURES GRID ("Why Us")

- Section header: "Why Us" badge + "The difference is everything." heading
- 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6), each card is liquid-glass rounded-2xl p-6:

  1. Icon: Zap -- "Days, Not Months" -- "Concept to launch at a pace that redefines fast. Because waiting isn't a strategy."
  2. Icon: Palette -- "Obsessively Crafted" -- "Every detail considered. Every element refined. Design so precise, it feels inevitable."
  3. Icon: BarChart3 -- "Built to Convert" -- "Layouts informed by data. Decisions backed by performance. Results you can measure."
  4. Icon: Shield -- "Secure by Default" -- "Enterprise-grade protection comes standard. SSL, DDoS mitigation, compliance. All included."

  - Each icon sits in a liquid-glass-strong rounded-full w-10 h-10 circle

1. STATS SECTION

- HLS video background (Mux URL), displayed with filter: saturate(0) (desaturated/B&W)
- Top and bottom gradient fades (200px each)
- Content: liquid-glass rounded-3xl p-12 md:p-16 card with 4-column grid:

  - "200+" / "Sites launched"
  - "98%" / "Client satisfaction"
  - "3.2x" / "More conversions"
  - "5 days" / "Average delivery"
  - Values: text-4xl md:text-5xl lg:text-6xl font-heading italic
  - Labels: text-white/60 font-body font-light text-sm

1. TESTIMONIALS

- Section header: "What They Say" badge + "Don't take our word for it." heading
- 3-column grid (md:grid-cols-3 gap-6), each card is liquid-glass rounded-2xl p-8:

  1. "A complete rebuild in five days. The result outperformed everything we'd spent months building before." -- Sarah Chen, CEO, Luminary
  2. "Conversions up 4x. That's not a typo. The design just works differently when it's built on real data." -- Marcus Webb, Head of Growth, Arcline
  3. "They didn't just design our site. They defined our brand. World-class doesn't begin to cover it." -- Elena Voss, Brand Director, Helix

  - Quote: text-white/80 font-body font-light text-sm italic
  - Name: text-white font-body font-medium text-sm
  - Role: text-white/50 font-body font-light text-xs

1. CTA + FOOTER

- HLS video background (Mux URL)
- Top and bottom gradient fades (200px each)
- Content (z-10, centered):

  - Heading: "Your next website starts here." -- text-5xl md:text-6xl lg:text-7xl font-heading italic leading-[0.85]
  - Subtext: "Book a free strategy call. See what AI-powered design can do. No commitment, no pressure. Just possibilities."
  - Two buttons:
  
    - "Book a Call" -- liquid-glass-strong rounded-full px-6 py-3
    - "View Pricing" -- bg-white text-black rounded-full px-6 py-3
  - Footer bar (mt-32 pt-8 border-t border-white/10):
  
    - Left: "(c) 2026 Studio. All rights reserved." text-white/40 text-xs
    - Right: "Privacy", "Terms", "Contact" links text-white/40 text-xs

KEY DEPENDENCIES



{

  "motion": "^12.35.0",

  "hls.js": "^1.6.15",

  "lucide-react": "^0.462.0",

  "react-router-dom": "^6.30.1"

}

Icons used from lucide-react: ArrowUpRight, Play, Zap, Palette, BarChart3, Shield



OVERALL PAGE STRUCTURE



<div bg-black>

  <div z-10>

    <Navbar />           -- fixed floating nav

    <Hero />             -- 1000px tall, CloudFront MP4 video bg

    <div bg-black>

      <StartSection />   -- HLS video bg, "How It Works"

      <FeaturesChess />  -- alternating text/gif rows

      <FeaturesGrid />   -- 4-card grid

      <Stats />          -- HLS video bg (desaturated), stats card

      <Testimonials />   -- 3-card grid

      <CtaFooter />      -- HLS video bg, CTA + footer

    </div>

  </div>

</div>



ANIMATION PATTERNS

1. BlurText (heading): Word-by-word stagger from bottom with gaussian blur dissolve, IntersectionObserver triggered
2. Hero subtext: motion.p with filter: blur(10px) -> blur(0px), opacity: 0 -> 1, y: 20 -> 0, delay 0.8s, duration 0.6s
3. Hero CTA buttons: Same blur-in pattern, delay 1.1s
4. All video backgrounds: autoPlay, loop, muted, playsInline with top/bottom black gradient fades (200px typically, 300px on hero bottom)

DESIGN PATTERNS USED THROUGHOUT

- Every section badge: liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body
- Every section heading: text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]
- Every body text: text-white/60 or text-white/70, font-body font-light text-sm md:text-base
- Primary CTA: liquid-glass-strong rounded-full with ArrowUpRight icon
- Secondary CTA: bg-white text-black rounded-full
- Card containers: liquid-glass rounded-2xl
- Video overlay fades: always linear-gradient(to bottom/top, black, transparent) with pointer-events-none


---

# 023 Grow AI Talent Platform

# Grow AI Talent Platform

Build a dark-themed landing page hero section with a navbar, headline, CTA button, background video with fade-in/out loop, and a logo marquee. Use React + Vite + Tailwind CSS + TypeScript with shadcn/ui. Install @fontsource/geist-sans.



1. Theme & Design Tokens (index.css)

Set up a single dark theme (no light mode toggle). All colors in HSL:

:root {

  --background: 260 87% 3%;

  --foreground: 40 6% 95%;

  --card: 240 6% 9%;

  --card-foreground: 40 6% 95%;

  --popover: 240 6% 9%;

  --popover-foreground: 40 6% 95%;

  --primary: 262 83% 58%;

  --primary-foreground: 0 0% 100%;

  --secondary: 240 4% 16%;

  --secondary-foreground: 40 6% 95%;

  --muted: 240 4% 16%;

  --muted-foreground: 240 5% 65%;

  --accent: 262 83% 58%;

  --accent-foreground: 0 0% 100%;

  --destructive: 0 84.2% 60.2%;

  --destructive-foreground: 0 0% 100%;

  --border: 240 4% 20%;

  --input: 240 4% 20%;

  --ring: 262 83% 58%;

  --radius: 0.75rem;

  --hero-heading: 40 10% 96%;

  --hero-sub: 40 6% 82%;

}



Body font: 'Geist Sans', 'Inter', system-ui, sans-serif

Import these font weights:

@import "@fontsource/geist-sans/400.css";

@import "@fontsource/geist-sans/500.css";

@import "@fontsource/geist-sans/600.css";

@import "@fontsource/geist-sans/700.css";



1. Liquid Glass Utility (index.css)

Add a .liquid-glass utility class in @layer utilities:

.liquid-glass {

  background: rgba(255, 255, 255, 0.01);

  background-blend-mode: luminosity;

  backdrop-filter: blur(4px);

  -webkit-backdrop-filter: blur(4px);

  border: none;

  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);

  position: relative;

  overflow: hidden;

}



.liquid-glass::before {

  content: '';

  position: absolute;

  inset: 0;

  border-radius: inherit;

  padding: 1.4px;

  background: linear-gradient(180deg,

    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,

    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,

    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);

  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;

  mask-composite: exclude;

  pointer-events: none;

}



1. Tailwind Config

Add these to tailwind.config.ts:

All the semantic color tokens mapped to hsl(var(--token))

A hero color group: hero.heading and hero.sub

A marquee keyframe: 0% { transform: translateX(0%) } → 100% { transform: translateX(-50%) }

Animation: marquee: "marquee 20s linear infinite"



1. Button Variants

In the shadcn button.tsx, add two custom variants:

hero: "bg-primary text-primary-foreground rounded-full px-6 py-3 text-base font-medium hover:bg-primary/90"

heroSecondary: "liquid-glass text-foreground rounded-full px-6 py-3 text-base font-normal hover:bg-white/5"



1. Navbar Component

Full-width, py-5 px-8, flex row, justify-between

Left: A logo image (32px height). Use a logo.png from src/assets/logo.png

Center: Nav items as plain buttons: "Features" (with ChevronDown icon), "Solutions", "Plans", "Learning" (with ChevronDown icon). Text is text-foreground/90 text-base, gap-1 between items

Right: "Sign Up" button using heroSecondary variant, size="sm", rounded-full px-4 py-2

Below the navbar, add a full-width 1px gradient divider: mt-[3px] w-full h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent



1. Hero Section

Section with bg-background relative overflow-hidden

Contains the Navbar at the top

Below navbar + divider, centered content with pt-20 px-4

Headline "Grow": text-[230px] font-normal leading-[1.02] tracking-[-0.024em], font-family 'General Sans', sans-serif, bg-clip-text text-transparent with background-image: linear-gradient(223deg, #E8E8E9 0%, #3A7BBF 104.15%)

Subtext: text-hero-sub text-center text-lg leading-8 max-w-md mt-4 opacity-80, two lines: "The most powerful AI ever deployed" / "in talent acquisition" (split with <br/>)

CTA Button: heroSecondary variant, text "Schedule a Consult", px-[29px] py-[24px], wrapped in a div with mt-8 mb-[66px]



1. Social Proof / Video Section

Immediately below the hero, a separate <section> with relative w-full overflow-hidden.

Background Video: <video> element: autoPlay muted playsInline, absolute inset-0 w-full h-full object-cover, initial style={{ opacity: 0 }}

Source URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4

Fade logic (JavaScript): Use requestAnimationFrame to continuously read currentTime and duration. Fade in over 0.5s at the start, fade out over 0.5s at the end. On ended, set opacity to 0, wait 100ms, reset currentTime = 0, and play() again. This creates a seamless manual loop with fade transitions.

Gradient overlays: absolute inset-0 bg-gradient-to-b from-background via-transparent to-background

Content (z-10): flex flex-col items-center pt-16 pb-24 px-4 gap-20

A h-40 spacer div for video visibility



Logo Marquee at max-w-5xl:

Left side: text "Relied on by brands / across the globe" in text-foreground/50 text-sm, with <br/>, whitespace-nowrap shrink-0

Right side: horizontally scrolling marquee using animate-marquee (the 20s infinite animation)

Logos are placeholder brands: Vortex, Nimbus, Prysma, Cirrus, Kynder, Halcyn — duplicated for seamless loop

Each logo: a small liquid-glass w-6 h-6 rounded-lg square with the first letter, plus the brand name in text-base font-semibold text-foreground

Gap between logos: gap-16



1. Page Composition

The Index page simply renders <HeroSection /> then <SocialProofSection /> sequentially with no wrapper styling.


---

# 024 Luxury Ecommerce Design

# Luxury Ecommerce Design

Create a React + Tailwind CSS beauty/skincare brand landing page called "STRETCH" with 3 sections. Use Vite, React 18, TypeScript, Tailwind CSS, and lucide-react for icons. The system font stack is used (no custom fonts loaded). The page has smooth scroll-triggered fade-in animations using IntersectionObserver, button hover lift animations, and full responsive design with a mobile hamburger menu.



---



## SECTION 1: HERO (Full viewport height, split 50/50 on desktop, stacked on mobile)



**Announcement Bar** (absolute positioned, top of page, z-30):

- Background: `#F9F4F0`, text black
- Centered text: "free shipping for orders over 50€"
- ChevronLeft and ChevronRight icons (size 16) on each side
- Padding: `py-2.5` mobile, `py-3` desktop

**Navigation** (absolute positioned below announcement bar at `top-[38px]` mobile / `top-[42px]` desktop, z-30):

- Left: Logo text "STRETCH" — `text-lg sm:text-xl font-bold tracking-[0.2em] uppercase`
- Center (hidden on mobile, visible md+): 4 links — "shop", "learn", "journal", "theme" — `text-sm`, with an underline animation on hover (a `<span>` inside that goes from `w-0` to `w-full` on group-hover, `h-[1px] bg-white transition-all duration-300`)
- Right: 

  - French flag (3 colored divs: `bg-blue-700`, white, `bg-red-600` in a `w-6 h-4` container) + "eur €" text + ChevronDown — hidden on mobile
  - Vertical divider `w-px h-5 bg-white/30 mx-2` — hidden on mobile
  - User icon (hidden below sm), Search icon, ShoppingBag icon (all size 20)
  - Menu/X hamburger toggle (visible below md)

**Mobile Menu** (fixed fullscreen overlay, z-40):

- `bg-black/95 backdrop-blur-sm`
- Centered vertically: same 4 nav links at `text-3xl font-light`
- Transition: `opacity` + `pointer-events` toggle over `duration-500`

**Hero Left Half** (`w-full lg:w-1/2`, `min-h-[60vh] lg:min-h-0`):

- Background: Full-bleed absolute image:

  ```Plain Text
  https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_101925_8e509c31-4e75-4ae1-b164-2605265b2d47.png&w=1280&q=85
  ```
- Content (relative z-10, fade-in animation: `translate-y-8` to `translate-y-0`, `opacity-0` to `opacity-100`, `duration-1000`):

  - Heading: "ethical beauty," (line break) "sustainable impact." — `text-4xl sm:text-5xl md:text-6xl lg:text-[clamp(3.5rem,5vw,6rem)] font-light leading-[1.05] mb-6`
  - Under "impact." word: decorative SVG with 3 wavy gold lines (`stroke="#C8A45C"`, strokeWidths 2, 1.5, 1) — absolutely positioned `-bottom-1 left-0 w-full h-4`
  - Paragraph: "Committed to sustainable beauty and minimize our impact on the planet." — `text-sm md:text-base text-white/80 mb-10 max-w-md`
  - Button: "about us" — `px-10 py-4 bg-white text-black rounded-full text-sm` with `.btn-primary` class

**Hero Right Half** (`w-full lg:w-1/2`, `min-h-[40vh] lg:min-h-0`):

- Video slideshow (3 slides, auto-advances every 5000ms):

  - Video 1: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_112022_cddf2487-4ffe-45b6-ba4c-99ab79003cc5.mp4`
  - Video 2: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_175400_b46d1cd2-2050-45e2-9d13-b9c0bacb16b3.mp4`
  - Video 3: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_182440_671605c8-2ed8-4507-a4cb-a62a8f61316f.mp4`
  - All videos: `autoPlay loop muted playsInline`, `object-cover`, absolute `inset-0`
  - Transition between slides: `transition-opacity duration-700`
- Controls (absolute `bottom-6 right-6` z-20):

  - 3 dot indicators: `w-2 h-2 rounded-full`, active = `bg-white scale-125`, inactive = `bg-white/50`
  - Pause/Play toggle button: `w-8 h-8 rounded-full border border-white/50`, Pause/Play icon size 14

---



## SECTION 2: BEST SELLERS (Background `#F9F4F0`, text black)



- Padding: `py-12 sm:py-16 px-4 sm:px-6 lg:px-10`
- Fade-in animation on scroll (translate-y-6 to 0, opacity 0 to 1)

**Tabs:**

- Two buttons: "best sellers" and "sets"
- Text: `text-2xl sm:text-4xl md:text-5xl font-medium`
- Active tab: `text-[#1a1a1a]` with a filled dot `w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1a1a1a]` that has a scale-in CSS animation
- Inactive tab: `text-gray-400`, hover → `text-gray-600`

**Product Carousel** (horizontal scroll, `overflow-x-auto scrollbar-hide`):

- Vertical scroll (mouse wheel) is hijacked to scroll horizontally
- Each product card: `w-[260px] sm:w-[280px] md:w-[300px] lg:w-[calc(25%-1px)]`
- Cards have `border border-gray-200` on all 4 sides, with `-ml-[1px] first:ml-0` to collapse shared borders
- Cards fade in staggered: each card has `transitionDelay: ${200 + index * 80}ms`
- On hover: product image scales to 105% (`transition-transform duration-500`)

**7 Products (in order):**

1. Category: "ILLUMINATE" | Name: "Illuminating cleansing gel" | Price: "€36,00" | Image: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_193822_8c95f5ed-b142-454f-ab87-59ad1f09e758.png&w=1280&q=85`
2. Category: "UNIFY" | Subcategory: "TIGHTEN PORES" | Name: "Unifying serum spray" | Price: "€34,00" | Image: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194048_278bf3cc-7d1f-43c1-9dc7-73d8fcd9949c.png&w=1280&q=85`
3. Category: "NATURAL GLOW" | Name: "Super glow set" | Price: "€92,00" | Old price: "€99,00" | Image: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194058_d89610de-05f8-45e4-8196-0680296c565a.png&w=1280&q=85`
4. Category: "PROTECT" | Subcategory: "ILLUMINATE" | Name: "Radiance day oil" | Price: "€59,00" | Image: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194112_1763cbb2-3171-4ad3-9f38-1b738b8f1bb6.png&w=1280&q=85`
5. Category: "HYDRATE" | Subcategory: "NOURISH" | Name: "Deep moisture cream" | Price: "€48,00" | Image: same as product 1
6. Category: "RENEW" | Name: "Night repair elixir" | Price: "€72,00" | Old price: "€79,00" | Image: same as product 2
7. Category: "SMOOTH" | Subcategory: "REFINE" | Name: "Gentle exfoliating toner" | Price: "€42,00" | Image: same as product 3

**Card layout:**

- Top: category label (`text-xs font-medium tracking-wider uppercase`) + optional subcategory (`text-xs text-gray-500 uppercase mt-0.5`) in a `px-4 h-12` container
- Middle: image in `mx-4 aspect-[3/4] rounded-lg overflow-hidden bg-[#F9F4F0]`, `object-cover`
- Bottom: product name (`text-sm`, centered) + price row (with optional strikethrough old price in `text-gray-400 line-through`)

**Scroll Progress Bar:**

- `mt-8 sm:mt-10 mx-auto max-w-[280px]`
- Track: `h-[2px] bg-gray-300 rounded-full`
- Thumb: `width: 30%`, `bg-[#1a1a1a]`, position calculated as `translateX(${scrollProgress * (100 / 0.3)}%)`

---



## SECTION 3: CATEGORIES (Background black, text white)



- 3-column grid on desktop (`grid-cols-1 md:grid-cols-3`), no gaps, no dividers between columns
- Fade-in animation on scroll (translate-y-12 to 0, opacity 0 to 1, duration-1000)

**3 Category Cards (each):**

- Min height: `min-h-[400px] sm:min-h-[500px] md:min-h-[750px]`
- Padding: `p-6 sm:p-8 md:p-12`
- Full-bleed background video (absolute, `object-cover`)
- On hover: video scales to 105% (`transition-transform duration-700`)
- Dark overlay: `bg-black/10` → hover `bg-black/20` (`transition-colors duration-500`)
- Vertical text (rotated): `writingMode: 'vertical-lr', transform: 'rotate(180deg)'` — `text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium` — moves up 2px on hover
- Button at bottom: "shop [name]" — `px-8 py-3 bg-white text-black rounded-full text-sm` with `.btn-primary`

**Category data:**

1. Name: "face" | Video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_203023_87a26602-2898-4acc-a396-c7a2b5ad84fd.mp4`
2. Name: "beauty tools" | Video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_203415_b86e3f19-2aec-46cd-9a86-b64c40118e38.mp4`
3. Name: "body" | Video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_203051_85fee398-ea01-4aa0-972b-137a74213be5.mp4`

---



## CSS (index.css):



```CSS
@tailwind base;
@tailwind components;
@tailwind utilities;

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.btn-primary {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 0%, rgba(0, 0, 0, 0.05) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover::before {
  transform: translateX(100%);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```



---



## ANIMATIONS SUMMARY:

1. **useInView hook** — custom IntersectionObserver hook (threshold configurable, default 0.15). Once element enters viewport, sets `isVisible = true` permanently (unobserves after).
2. **Hero text** — fades in + slides up 8px over 1000ms
3. **Best sellers tabs** — fades in + slides up 6px over 800ms
4. **Product cards** — staggered fade-in (each 80ms apart, starting at 200ms delay), slides up 8px over 500ms
5. **Categories section** — fades in + slides up 12px over 1000ms
6. **Tab dot** — scale-in keyframe with bounce easing `cubic-bezier(0.34, 1.56, 0.64, 1)` over 300ms
7. **Buttons (.btn-primary)** — lift 2px + shadow on hover, light sweep effect via `::before` pseudo-element
8. **Product images** — scale to 105% on card hover over 500ms
9. **Category videos** — scale to 105% on card hover over 700ms
10. **Nav links** — underline grows from left (`w-0` to `w-full`) over 300ms on hover

---



## TECH STACK:

- Vite + React 18 + TypeScript
- Tailwind CSS 3.4
- lucide-react for icons (ChevronLeft, ChevronRight, User, Search, ShoppingBag, ChevronDown, Pause, Play, Menu, X)
- No other UI libraries


---

# 025 Contact Cybernetic

# Contact Cybernetic

Build a modern, interactive hero section using React, Tailwind CSS, and Framer Motion (motion/react). Ensure you follow these precise architecture and styling instructions:

1. Fonts & Global Animations

Import the Inter font from Google Fonts.

In your CSS setup, configure Tailwind to use it by default (--font-sans: 'Inter', ...).

Create a keyframe animation in CSS named blink for the typewriter cursor:

code

CSS

@keyframes blink {

  0%, 100% { opacity: 1; }

  50% { opacity: 0; }

}

.animate-blink { animation: blink 1s step-end infinite; }

1. General Page Structure

Wrap the entire application in a container div with the following classes: relative bg-white text-neutral-900 font-sans selection:bg-[#EAECE9] selection:text-[#1C2E1E] antialiased overflow-x-hidden flex flex-col lg:block lg:min-h-screen.

1. Background Video Component (with Native Scrubbing)

Container element: Add a div containing the background video with classes: order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent.

Video element: Use <video> with muted, playsInline, preload="auto".

Video Source URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4

Classes: w-full h-full object-cover object-right lg:object-right-bottom.

Scrubbing/Playback Logic via useEffect hooks:

Desktop Mouse Scrubbing Hook: Listen to the window mousemove event. If window.innerWidth < 1024, ignore (disable scrubbing). Store the mouse 'previous X' coordinate to calculate the delta against 'current X'. Update the target scrub time based on (delta / window.innerWidth) \* 0.8 \* video.duration. Clamp the time between 0 and duration. Set video.currentTime = targetTime. Bind a seeked event listener to ensure smooth tracking frame to frame.

Mobile Autoplay Hook: Because scrubbing is disabled on mobile frames, trigger normal playback for screens < 1024 width: video.autoplay = true and video.play().

1. Interactive Navbar

Header wrapper: Wrap the Navbar in <header className="fixed top-0 inset-x-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center bg-transparent">

Logo (Left side): Flex row with gap-3.

Text: Mainframe® (using the ® symbol). Classes: text-[21px] sm:text-[26px] tracking-tight text-black font-medium select-none.

Icon block right beside it: An asterisk ✱. Classes: text-[25px] sm:text-[30px] text-black select-none tracking-[-0.02em] font-medium leading-none mb-1.

Desktop Nav Links (Center): Flex row, hidden md:flex, text-[23px] text-black. Links are "Labs", "Studio", "Openings", "Shop" separated by <span className="opacity-40">, </span> dividers. Hover states should use hover:opacity-60 transition-opacity.

Desktop CTA (Right): Hidden on mobile. A link reading "Get in touch" mapped with text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity.

Mobile Menu Logic:

Hamburger <button> visible below md. Has three w-6 h-[2px] bg-black spans.

Hook it to a local state isMobileMenuOpen. When open, animate the burger into an 'X' (top bar rotate-45 translate-y-[7px], middle bar opacity-0, bottom bar -rotate-45 -translate-y-[7px]). All spans need transition-all duration-300.

Create a full screen Mobile Navigation Overlay div hidden on Desktop. Fixed inset-0 z-[9] with bg-white/95 backdrop-blur-sm. Apply opacity-100 pointer-events-auto when isMobileMenuOpen is true; otherwise, opacity-0 pointer-events-none.

1. Content Layout Container

Below the background video and relative to it, add a content grouping layer: <div className="relative z-10 flex flex-col order-first lg:order-none w-full bg-white lg:bg-transparent pb-8 lg:pb-0 lg:min-h-screen">

Inside that, the overarching layout engine: <main id="spade-hero" className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">

1. Typewriter Hook and Headline

Implement a custom useTypewriter(text, speed = 38, startDelay = 600) React hook. It uses setTimeout and setInterval to iteratively build a string slice by slice. It must return an object: { displayed: string, done: boolean }.

Run the hook with the string "we'd love to\nhear from you!".

Wrap the headline securely in a motion.div configured to drop-in (initial: opacity: 0, y: 20, animate: opacity: 1, y: 0, transition duration 0.6).

Render your hook text inside <h1 className="text-5xl md:text-6xl lg:text-[76px] font-normal tracking-tight text-black leading-[1.08] mb-8 select-none w-full whitespace-pre-wrap">.

While typing (!done), output a <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" /> cursor at the end of the displayed text string.

1. Secondary Description Text

Another motion.div (delay 0.1s from the headline).

Content: <p> tag that reads: Whether you have questions, feedback, <br /> drop us a message and we'll get back to you as soon as possible.

Classes: text-lg md:text-xl text-[#5A635A] leading-relaxed font-normal mb-14 max-w-2xl.

1. Interactive Multi-Select Service Pills

Using setServices track an array ["Brand", "Digital", "Campaign", "Other"].

The prompt Title: "What sort of service?" (text-2xl font-medium tracking-tight mb-2). Subtitle: "Select all that apply" (opacity-85 text-[#738273] mb-8).

Iterate over the options natively outputting motion.button wrapper tags allowing multiple selections inside a flex wrap container.

Pill active traits classes: bg-[#1C2E1E] text-white shadow-md shadow-emerald-950/5 transform. Show a check icon (lucide-react) dropping in using type: "spring", stiffness: 300, damping: 20.

Pill inactive traits classes: bg-white text-[#1C2E1E] border border-[#F1F3F1] hover:bg-[#F1F3F1]/55.

Contingent Feedback Status Banner: Underneath your service pills, write an <AnimatePresence mode="wait"> that tracks user state array length:

Empty: Show a generic placeholder indicating "Please click to select services above." at fifty percent opacity (opacity: 0.5, italic, text-xs).

Active Selection: Swap cleanly into a container <motion.div> that springs height gracefully (height: "auto"). Inside, display an acknowledgment banner reading "Ready to inquire about: [array.join(", ")]" combined with an arrow call-to-action button "Let's Go" (text-[#4D6D47] uppercase text-xs). Style the banner with bg-[#FAFBF9] border rounded-2xl.


---

# 026 Glassmorphism Agency Hero

# Glassmorphism Agency Hero

Build a production-ready, responsive landing page using React, Tailwind CSS v4, and Vite. The design should feature a high-end, dark-mode "glassmorphism" aesthetic with specific purple/pink gradients.



1. Tech Stack & Libraries:

Use hls.js for video streaming.

Use motion/react (formerly Framer Motion) for animations.

Use react-use-measure for sizing logic.

Use clsx and tailwind-merge for class management.

Use lucide-react for standard icons (if needed), but I will provide custom SVG paths for specific UI elements.



1. Global Styling:

Background: Dark/Black (#010101).

Primary Gradient: A diagonal gradient used for accents: from-[#FA93FA] via-[#C967E8] to-[#983AD6].

Typography: Modern sans-serif, center-aligned hero text.



1. Hero Section Components:

Announcement Pill:

A pill-shaped top badge.

Background: Semi-transparent dark (bg-[rgba(28,27,36,0.15)]) with a subtle border.

Icon: A "Zap" icon inside a gradient-filled box with a glow effect.

Text: "Used by founders. Loved by devs." in light grey.



Main Headline (H1):

Large text (responsive sizing: 48px mobile to 80px desktop).

Text: "Your Vision" on line 1, "Our Digital Reality." on line 2.

Style: Text should have a gradient fill (White to Purple/Pink).



Subheadline:

Text: "We turn bold ideas into modern designs that don't just look amazing, they grow your business fast."

Color: text-white/80.



CTA Button:

"Book a 15-min call" text.

Rounded full button with a white background and black text.

Includes a circle icon with an arrow inside, styled with the primary purple gradient.

Outer border wrapper with a glass effect.



1. Hero Video Integration (Critical Details):

Source: HLS Stream URL: https://customer-cbeadsgr09pnsezs.cloudflarestream.com/697945ca6b876878dba3b23fbd2f1561/manifest/video.m3u8

Fallback: If HLS fails, fallback to this MP4: /\_videos/v1/f0c78f536d5f21a047fb7792723a36f9d647daa1

Implementation: Do NOT use react-player. Use a native <video> tag with a custom useEffect hook implementation of hls.js.

Styling:

Blend Mode: Use mix-blend-screen so the video black background blends into the page.

Positioning: The video should be at the bottom of the hero. Apply a negative top margin (-mt-[150px]) so it overlaps behind the text.

Z-Index: Ensure the text content is z-20 (above) and video is z-10 (below).

Layout: The video must be 100% width (w-full), auto height, and stretch edge-to-edge without being cropped (do not use object-contain or fixed heights).

Overlay: Add a gradient fade (from-[#010101] via-transparent to-[#010101]) over the video container.



1. Logo Cloud Section (Animated):

Place this section immediately below the video.

Background: Semi-transparent glass (bg-black/20 backdrop-blur-sm) with a top border (border-white/5).

Layout:

Desktop: "Powering the best teams" text on the left, separated by a vertical divider. Animated logo slider on the right.

Mobile: Stacked vertically.

Animation: Create an InfiniteSlider component using motion/react that scrolls logos horizontally forever.

Logos: Use these SVG URLs (OpenAI, Nvidia, GitHub, etc.) and apply brightness-0 invert to make them white.

https://html.tailus.io/blocks/customers/openai.svg

https://html.tailus.io/blocks/customers/nvidia.svg

(Include others similarly)



Please assemble these into a cohesive Hero.tsx, App.tsx, and components/ui/infinite-slider.tsx structure.


---

# 027 AeroCore

# AeroCore

<!doctype html>

<html lang="en">

  <head>

    <meta charset="UTF-8" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <meta

      name="description"

      content="EngineTech designs and manufactures custom propulsion systems for aerospace programs."

    />

    <title>EngineTech | Custom Aerospace Engines</title>

    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    <link rel="stylesheet" type="text/css" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />

    <style>

:root {

  color-scheme: light;

  --font-sans: "Geist", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --geist-background: #ffffff;

  --geist-foreground: #0a0a0a;

  --geist-muted: #666666;

  --hero-blue: #7191d0;

  --hero-blue-soft: #aab8d5;

  --hero-cloud: #ece9e6;

  --hero-bg-bottom: linear-gradient(180deg, var(--hero-blue) 0%, var(--hero-blue-soft) 55%, var(--hero-cloud) 100%);

  --hero-bg-top: linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.12));

  --hero-max-width: 1820px;

}



- {

box-sizing: border-box;

}



html,

body {

  min-height: 100%;

}



body {

  margin: 0;

  background: var(--geist-background);

  color: var(--geist-foreground);

  font-family: var(--font-sans);

  -webkit-font-smoothing: antialiased;

  text-rendering: geometricPrecision;

}



a {

  color: inherit;

  text-decoration: none;

}



.mission {

  position: relative;

  z-index: 40;

  min-height: 100vh;

  margin-top: -12vh;

  background: #ffffff;

  color: #161616;

}



.mission\_\_inner {

  display: grid;

  grid-template-columns: minmax(240px, 0.95fr) minmax(0, 2fr);

  grid-template-rows: auto minmax(360px, 1fr);

  column-gap: clamp(56px, 8vw, 170px);

  row-gap: clamp(76px, 5vw, 104px);

  width: min(100% - 96px, var(--hero-max-width));

  min-height: 100vh;

  margin: 0 auto;

  padding: clamp(34px, 3vw, 54px) 0 clamp(32px, 4vw, 62px);

}



.mission\_\_eyebrow {

  grid-column: 1;

  grid-row: 1;

  align-self: start;

  margin: 0;

  color: #202020;

  font-size: clamp(13px, 0.9vw, 16.8px);

  font-weight: 700;

  line-height: 1.22;

  letter-spacing: 0;

}



.mission\_\_statement {

  grid-column: 2;

  grid-row: 1;

  align-self: start;

  max-width: 1180px;

}



.mission\_\_statement h2 {

  margin: 0;

  color: #141414;

  font-size: clamp(29px, 1.95vw, 41.3px);

  font-weight: 260;

  line-height: 1.18;

  letter-spacing: 0;

}



.mission\_\_button {

  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-top: clamp(46px, 3.3vw, 72px);

  color: #171717;

  font-size: clamp(13.8px, 1vw, 18.3px);

  font-weight: 700;

  line-height: 1;

}



.mission\_\_button span:last-child {

  display: inline-flex;

  align-items: center;

  min-height: clamp(58px, 3.65vw, 72px);

  padding: 0 clamp(18px, 1.35vw, 26px);

  border: 1px solid #c6c6c6;

  border-radius: 5px;

  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.04);

}



.mission\_\_button-icon {

  position: relative;

  display: inline-grid;

  place-items: center;

  width: clamp(58px, 3.65vw, 72px);

  aspect-ratio: 1;

  border-radius: 5px;

  background: #d8e8ff;

  transition:

    background 180ms ease,

    transform 180ms ease;

}



.mission\_\_button-icon .ph {

  font-size: clamp(22px, 1.5vw, 28px);

  color: currentColor;

  display: block;

}



.mission\_\_button:hover .mission\_\_button-icon {

  background: #c7dcfb;

  transform: translate(2px, 2px);

}



.mission\_\_support {

  grid-column: 1;

  grid-row: 2;

  align-self: start;

  max-width: 520px;

  margin: 0;

  color: #5f5f5f;

  font-size: clamp(23.7px, 1.56vw, 30.6px);

  font-weight: 370;

  line-height: 1.18;

  letter-spacing: 0;

}



.mission\_\_media {

  grid-column: 2;

  grid-row: 2;

  align-self: start;

  width: 100%;

  aspect-ratio: 16 / 9;

  overflow: hidden;

  background: transparent;

}



.hero {

  position: relative;

  height: 180vh;

  min-height: 1238px;

  overflow: clip;

  background: var(--hero-blue);

}



.hero\_\_background {

  position: sticky;

  top: 0;

  z-index: 0;

  height: 100vh;

  overflow: hidden;

  background:

    linear-gradient(

      180deg,

      var(--hero-top, #7191d0) 0%,

      var(--hero-mid, #aab8d5) 55%,

      var(--hero-bottom, #ece9e6) 100%

    );

}



.hero\_\_bg-layer {

  position: absolute;

  inset: 0;

  background-position: center;

  background-repeat: no-repeat;

  background-size: cover;

  pointer-events: none;

}



.hero\_\_bg-layer--bottom {

  background:

    radial-gradient(circle at 52% 26%, rgb(255 255 255 / 0.22), transparent 35%),

    linear-gradient(180deg, rgb(70 100 170 / 0.14), rgb(255 255 255 / 0));

}



.hero\_\_bg-layer--top {

  z-index: 1;

  background: var(--hero-bg-top);

  mix-blend-mode: screen;

}



.hero\_\_stars {

  position: absolute;

  inset: 0 0 auto;

  z-index: 2;

  height: 210px;

  pointer-events: none;

  background-image:

    radial-gradient(circle, rgb(255 255 255 / 0.78) 0 1px, transparent 1.8px),

    radial-gradient(circle, rgb(255 255 255 / 0.58) 0 1px, transparent 1.6px),

    radial-gradient(circle, rgb(255 255 255 / 0.68) 0 1px, transparent 1.7px);

  background-position:

    10% 24%,

    38% 16%,

    76% 32%;

  background-size:

    180px 94px,

    260px 120px,

    340px 150px;

  opacity: 0.45;

  animation: hero-stars-twinkle 4.8s ease-in-out infinite alternate;

}



@keyframes hero-stars-twinkle {

  0% { opacity: 0.18; filter: brightness(0.92); }

  50% { opacity: 0.58; filter: brightness(1.12); }

  100% { opacity: 0.34; filter: brightness(1); }

}



.hero\_\_nav {

  position: fixed;

  top: 0;

  left: 50%;

  z-index: 100;

  display: grid;

  grid-template-columns: minmax(220px, 1fr) auto minmax(180px, 1fr);

  align-items: center;

  gap: 32px;

  width: min(100% - 96px, var(--hero-max-width));

  margin: 0;

  padding: 27px 16px 16px;

  color: #ffffff;

  transform: translate3d(-50%, 0, 0);

  transition:

    background-color 300ms ease,

    color 300ms ease,

    transform 300ms ease,

    box-shadow 300ms ease,

    border-color 300ms ease,

    padding 300ms ease,

    top 300ms ease;

  border: 1px solid transparent;

  border-radius: 0;

}



.hero\_\_nav.nav--scroll-down {

  transform: translate3d(-50%, 16px, 0);

  background-color: rgba(255, 255, 255, 0.88);

  backdrop-filter: blur(12px);

  -webkit-backdrop-filter: blur(12px);

  color: #111111;

  padding: 14px 24px;

  border-radius: 40px;

  border-color: rgba(0, 0, 0, 0.08);

  box-shadow:

    0 12px 30px -10px rgba(0, 0, 0, 0.08),

    0 4px 12px -5px rgba(0, 0, 0, 0.03);

}



.hero\_\_nav.nav--scroll-down .brand\_\_name { color: #111111; }

.hero\_\_nav.nav--scroll-down .brand\_\_mark { background: #111111; }

.hero\_\_nav.nav--scroll-down .hero\_\_links { color: rgba(17, 17, 17, 0.8); }

.hero\_\_nav.nav--scroll-down .hero\_\_links a { color: inherit; }

.hero\_\_nav.nav--scroll-down .hero\_\_links a:hover { color: #111111; }

.hero\_\_nav.nav--scroll-down .hero\_\_cta { background: #111111; color: #ffffff; box-shadow: none; }



.hero\_\_nav.nav--scroll-up {

  transform: translate3d(-50%, -100px, 0);

  pointer-events: none;

}



.brand {

  display: inline-flex;

  align-items: center;

  justify-self: start;

  gap: 7px;

  min-width: 0;

}



.brand\_\_mark {

  position: relative;

  display: grid;

  place-items: center;

  width: 29px;

  aspect-ratio: 1;

  overflow: hidden;

  border-radius: 50%;

  background: #ffffff;

  transition: background-color 300ms ease;

}



.brand\_\_mark::before {

  content: "";

  position: absolute;

  inset: -8px;

  background: var(--hero-blue);

  clip-path: polygon(0 20%, 100% 8%, 100% 19%, 0 31%, 0 43%, 100% 31%, 100% 42%, 0 54%, 0 66%, 100% 54%, 100% 65%, 0 77%);

}



.brand\_\_mark span { display: none; }



.brand\_\_name {

  color: #ffffff;

  font-size: 24px;

  font-weight: 560;

  line-height: 1;

  letter-spacing: 0;

  transition: color 300ms ease;

}



.hero\_\_links {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: clamp(22px, 2.55vw, 44px);

  color: rgb(255 255 255 / 0.9);

  font-size: 14px;

  font-weight: 600;

  line-height: 20px;

  white-space: nowrap;

  transition: color 300ms ease;

}



.hero\_\_links a { transition: color 160ms ease; }

.hero\_\_links a:hover { color: #ffffff; }



.hero\_\_cta {

  justify-self: end;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 122px;

  min-height: 46px;

  padding: 0 17px;

  border-radius: 6px;

  background: rgb(233 240 255 / 0.9);

  color: #111111;

  font-size: 14px;

  font-weight: 600;

  line-height: 20px;

  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.42);

  transition:

    background 160ms ease,

    transform 160ms ease,

    color 160ms ease;

}



.hero\_\_cta:hover { background: #ffffff; transform: translateY(-1px); }



.hero\_\_content {

  position: absolute;

  inset: 0;

  z-index: 1;

  display: grid;

  place-items: center;

  height: 100vh;

  width: min(100%, var(--hero-max-width));

  margin: 0 auto;

  pointer-events: none;

}



.hero\_\_title {

  position: fixed;

  top: calc(50% - 56px - clamp(82px, 8vw, 126px));

  left: 4%;

  z-index: 10;

  display: flex;

  flex-direction: column;

  align-items: flex-start;

  margin: 0;

  width: 96vw;

  color: #ffffff;

  font-weight: 200;

  letter-spacing: 0;

  line-height: 0.88;

  pointer-events: none;

  transform: translate3d(0, var(--scroll-y, 0px), 0);

  will-change: transform, opacity;

}



.hero\_\_title-line {

  display: block;

  font-size: clamp(144px, 18vw, 285px);

  white-space: nowrap;

}



.hero\_\_title-line--one { position: relative; z-index: 10; }



.hero\_\_title-row {

  position: fixed;

  top: calc(50% - 56px + clamp(50px, 4.5vw, 90px));

  left: 4%;

  z-index: 2;

  display: flex;

  align-items: baseline;

  gap: clamp(112px, 12vw, 224px);

  color: #ffffff;

  font-weight: 200;

  pointer-events: none;

  transform: translate3d(15vw, var(--scroll-y, 0px), 0);

  will-change: transform, opacity;

}



.hero\_\_title-line--two,

.hero\_\_title-line--three { position: relative; }

.hero\_\_title-line--three { transform: translateX(112px); }



.engine-visual {

  position: fixed;

  z-index: 3;

  left: 50%;

  top: -15px;

  width: auto;

  height: calc((100% + 15px) \* 1.4);

  max-width: calc(100vw - 96px);

  max-height: 1023px;

  aspect-ratio: 2 / 3;

  transform: translate3d(-50%, var(--scroll-y, 0px), 0);

  will-change: transform, opacity;

  filter: drop-shadow(0 28px 34px rgb(26 31 42 / 0.22));

}



.engine-visual\_\_asset {

  display: block;

  width: auto;

  height: 100%;

  max-width: 100%;

  object-fit: contain;

  object-position: center bottom;

}



.hero\_\_caption {

  position: fixed;

  z-index: 4;

  left: clamp(24px, 3.85vw, 78px);

  bottom: 28px;

  display: inline-flex;

  align-items: center;

  gap: 24px;

  max-width: min(170px, calc(50vw - 112px));

  margin: 0;

  color: rgb(42 42 42 / 0.58);

  font-size: 16px;

  font-weight: 400;

  line-height: 22px;

  letter-spacing: 0;

  transform: translate3d(0, var(--scroll-y, 0px), 0);

  will-change: transform, opacity;

}



.hero\_\_caption::before {

  content: "";

  display: block;

  width: 1px;

  height: 44px;

  background: rgb(42 42 42 / 0.32);

}



.hero.is-past .hero\_\_title,

.hero.is-past .hero\_\_title-row,

.hero.is-past .hero\_\_caption,

.hero.is-past .engine-visual {

  opacity: 0;

  pointer-events: none;

}



@media (max-width: 1180px) {

  .mission\_\_inner {

    grid-template-columns: minmax(190px, 0.7fr) minmax(0, 1.7fr);

    column-gap: clamp(36px, 5vw, 72px);

    width: min(100% - 48px, var(--hero-max-width));

  }

  .mission\_\_statement h2 { font-size: clamp(26px, 3.37vw, 38.2px); }

  .mission\_\_support { font-size: clamp(20.6px, 2.3vw, 26px); }

  .hero\_\_nav {

    grid-template-columns: auto 1fr auto;

    width: min(100% - 48px, var(--hero-max-width));

  }

  .hero\_\_links { gap: 20px; font-size: 14px; }

  .brand\_\_name { font-size: 22px; }

  .hero\_\_cta { min-width: 122px; min-height: 46px; font-size: 14px; }

}



@media (max-width: 860px) {

  .mission { margin-top: -8vh; }

  .mission\_\_inner {

    display: flex;

    flex-direction: column;

    gap: 44px;

    width: min(100% - 48px, var(--hero-max-width));

    min-height: auto;

    padding: 34px 0 40px;

  }

  .mission\_\_statement { max-width: none; }

  .mission\_\_statement h2 { font-size: clamp(26px, 7.65vw, 39.8px); line-height: 1.1; }

  .mission\_\_button { margin-top: 34px; font-size: 13.8px; }

  .mission\_\_button-icon { width: 56px; }

  .mission\_\_support { max-width: 640px; margin: 52px 0 0; font-size: clamp(19.9px, 5.35vw, 26px); }

  .mission\_\_media { margin-top: 8px; }

  .hero { height: 180vh; min-height: 1238px; }

  .hero\_\_nav { grid-template-columns: 1fr auto; padding-top: 22px; }

  .hero\_\_links { display: none; }

  .hero\_\_content { height: 100vh; }

  .hero\_\_title-line { font-size: clamp(102px, 31.5vw, 192px); }

  .hero\_\_title { top: calc(50% - 56px - clamp(58px, 14vw, 90px)); left: 5%; }

  .hero\_\_title-row { top: calc(50% - 56px + clamp(32px, 9vw, 63px)); left: 5%; transform: translate3d(10vw, var(--scroll-y, 0px), 0); }

  .engine-visual { top: -19px; height: calc((100% + 19px) \* 1.4); max-height: 868px; }

  .hero\_\_caption { right: 24px; bottom: 24px; max-width: min(170px, calc(100vw - 48px)); font-size: 16px; line-height: 22px; }

}



@media (max-width: 560px) {

  .mission\_\_inner { width: min(100% - 32px, var(--hero-max-width)); }

  .mission\_\_eyebrow { max-width: 240px; font-size: 12.2px; }

  .mission\_\_statement h2 { font-size: clamp(23.7px, 7.19vw, 32.1px); }

  .mission\_\_support { font-size: clamp(18.3px, 5.97vw, 23.7px); }

  .mission\_\_media { aspect-ratio: 4 / 3; }

  .hero\_\_nav { width: min(100% - 32px, var(--hero-max-width)); gap: 16px; }

  .brand\_\_mark { width: 24px; }

  .brand\_\_name { font-size: 17px; }

  .hero\_\_cta { min-width: auto; min-height: 38px; padding: 0 12px; font-size: 13px; }

  .hero\_\_title-line { font-size: clamp(111px, 38.4vw, 185px); }

  .hero\_\_title-row { gap: clamp(72px, 20vw, 128px); transform: translate3d(10vw, var(--scroll-y, 0px), 0); }

  .hero\_\_caption { display: none; }

}



.showcase-film {

  position: fixed;

  top: 0;

  left: 0;

  width: 1px;

  height: 1px;

  z-index: 45;

  overflow: hidden;

  background: #d7dde4;

  opacity: 0;

  pointer-events: none;

  will-change: top, left, width, height, border-radius, opacity;

}



.showcase-film\_\_video {

  display: block;

  width: 100%;

  height: 100%;

  object-fit: cover;

  object-position: center;

}



.showcase-film\_\_overlay {

  position: absolute;

  inset: 0;

  background: #000;

  pointer-events: none;

}



.showcase {

  position: relative;

  z-index: 50;

  height: 600vh;

}



.showcase\_\_sticky {

  position: sticky;

  top: 0;

  height: 100vh;

  background: transparent;

  overflow: visible;

}



.showcase\_\_ui {

  position: absolute;

  inset: 0;

  display: grid;

  grid-template-columns: 1fr auto;

  align-items: end;

  padding: clamp(32px, 4vw, 72px) clamp(32px, 4.5vw, 80px);

  pointer-events: none;

  will-change: opacity;

}



.showcase\_\_panels {

  grid-column: 1;

  position: relative;

  min-height: clamp(200px, 30vh, 400px);

  max-width: 640px;

}



.showcase\_\_panel {

  position: absolute;

  bottom: 0;

  left: 0;

  right: 0;

  opacity: 0;

  transform: translateY(16px);

  transition:

    opacity 460ms cubic-bezier(0.4, 0, 0.2, 1),

    transform 460ms cubic-bezier(0.4, 0, 0.2, 1);

  pointer-events: none;

}



.showcase\_\_panel.is-active { opacity: 1; transform: none; pointer-events: auto; }



.showcase\_\_panel-num {

  display: block;

  margin: 0 0 clamp(12px, 1.1vw, 22px);

  color: rgb(255 255 255 / 0.42);

  font-size: clamp(11px, 0.78vw, 14px);

  font-weight: 600;

  letter-spacing: 0.12em;

  line-height: 1;

  text-transform: uppercase;

}



.showcase\_\_panel-title {

  margin: 0 0 clamp(14px, 1.3vw, 26px);

  color: #ffffff;

  font-size: clamp(38px, 4.4vw, 80px);

  font-weight: 200;

  line-height: 1.07;

  letter-spacing: -0.022em;

}



.showcase\_\_panel-desc {

  max-width: 490px;

  margin: 0;

  color: rgb(255 255 255 / 0.58);

  font-size: clamp(14px, 1.05vw, 18px);

  font-weight: 400;

  line-height: 1.6;

}



.showcase\_\_tabs-nav {

  grid-column: 2;

  display: flex;

  flex-direction: column;

  align-items: flex-end;

  gap: clamp(10px, 0.9vw, 20px);

  padding-left: clamp(36px, 5vw, 120px);

  pointer-events: auto;

}



.showcase\_\_tab {

  display: flex;

  align-items: center;

  gap: clamp(8px, 0.7vw, 14px);

  color: rgb(255 255 255 / 0.28);

  font-size: clamp(12px, 0.82vw, 15px);

  font-weight: 500;

  line-height: 1;

  white-space: nowrap;

  cursor: default;

  user-select: none;

  transition: color 320ms ease;

}



.showcase\_\_tab.is-active { color: #ffffff; }



.showcase\_\_tab-bar {

  display: block;

  flex-shrink: 0;

  width: 1px;

  height: 14px;

  background: currentColor;

  opacity: 0;

  transition: opacity 320ms ease;

}



.showcase\_\_tab.is-active .showcase\_\_tab-bar { opacity: 1; }

.showcase\_\_tab-name { transition: color 320ms ease; }



.showcase\_\_tab-num {

  font-weight: 600;

  font-size: clamp(11px, 0.72vw, 13px);

  color: rgb(255 255 255 / 0.38);

  transition: color 320ms ease;

}



.showcase\_\_tab.is-active .showcase\_\_tab-num { color: rgb(255 255 255 / 0.65); }



@media (max-width: 860px) {

  .showcase\_\_ui { grid-template-columns: 1fr; }

  .showcase\_\_tabs-nav { display: none; }

  .showcase\_\_panel-title { font-size: clamp(30px, 8vw, 54px); }

}



@media (max-width: 560px) {

  .showcase\_\_ui { padding: 28px 24px; }

  .showcase\_\_panel-title { font-size: clamp(26px, 9vw, 42px); }

  .showcase\_\_panel-desc { font-size: 14px; }

}



.capabilities {

  position: relative;

  z-index: 70;

  min-height: 100vh;

  padding: clamp(34px, 4vw, 72px) clamp(16px, 3.8vw, 72px);

  background: #f7f8f8;

  color: #111111;

}



.capabilities\_\_header {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 32px;

  max-width: var(--hero-max-width);

  margin: 0 auto clamp(24px, 3vw, 42px);

}



.capabilities\_\_intro { max-width: 860px; }



.capabilities\_\_intro h2 {

  max-width: 920px;

  margin: 0;

  color: #111111;

  font-size: clamp(29px, 3.2vw, 54px);

  font-weight: 300;

  letter-spacing: 0;

  line-height: 1.08;

}



.capabilities\_\_intro p {

  max-width: 760px;

  margin: 18px 0 0;

  color: #677070;

  font-size: clamp(14px, 1vw, 17px);

  font-weight: 400;

  line-height: 1.62;

}



.capabilities\_\_button {

  flex: 0 0 auto;

  align-self: flex-start;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 10px;

  min-height: 48px;

  padding: 0 20px;

  border: 1px solid rgb(17 17 17 / 0.1);

  border-radius: 999px;

  background: rgb(255 255 255 / 0.78);

  color: #111111;

  font-size: 14px;

  font-weight: 700;

  box-shadow:

    inset 0 1px 0 rgb(255 255 255 / 0.95),

    0 18px 44px rgb(31 44 44 / 0.08);

}



.capabilities\_\_button .ph { font-size: 18px; }



.capabilities\_\_grid {

  display: grid;

  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);

  gap: clamp(14px, 1.25vw, 22px);

  max-width: var(--hero-max-width);

  min-height: clamp(620px, 72vh, 780px);

  margin: 0 auto;

}



.capabilities\_\_stack {

  display: grid;

  grid-template-rows: minmax(210px, 0.74fr) minmax(270px, 1fr);

  gap: clamp(14px, 1.25vw, 22px);

  min-width: 0;

}



.capabilities\_\_stack--systems { grid-template-rows: minmax(420px, 1.45fr) auto; }



.cap-card {

  position: relative;

  overflow: hidden;

  border: 1px solid rgb(18 35 35 / 0.09);

  border-radius: 18px;

  background: #ffffff;

  box-shadow: 0 22px 60px rgb(21 34 34 / 0.08);

}



.cap-card--tall, .cap-card--metric, .cap-card--tools { min-height: 0; }

.cap-card--media, .cap-card--metric { color: #ffffff; background: #dce3e3; }



.cap-card\_\_video {

  position: absolute;

  inset: 0;

  display: block;

  width: 100%;

  height: 100%;

  object-fit: cover;

  object-position: center;

  transform: scale(1.02);

}



.cap-card\_\_shade {

  position: absolute;

  inset: 0;

  background:

    linear-gradient(180deg, rgb(5 12 14 / 0.3), transparent 34%),

    linear-gradient(0deg, rgb(5 12 14 / 0.78), transparent 48%);

}



.cap-card\_\_light {

  position: absolute;

  inset: 0;

  background:

    linear-gradient(135deg, rgb(255 255 255 / 0.45), rgb(255 255 255 / 0.34)),

    linear-gradient(0deg, rgb(247 248 248 / 0.36), transparent 62%);

}



.cap-card\_\_label {

  position: relative;

  z-index: 1;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 24px;

  color: rgb(255 255 255 / 0.78);

  font-size: 11px;

  font-weight: 760;

  letter-spacing: 0.18em;

  line-height: 1;

  text-transform: uppercase;

}



.cap-card\_\_label--left { justify-content: flex-start; padding: 0; color: #758080; }



.cap-card\_\_timeline {

  position: absolute;

  z-index: 1;

  right: 20px;

  bottom: 20px;

  left: 20px;

  display: grid;

  gap: 12px;

}



.cap-card\_\_timeline div {

  display: grid;

  grid-template-columns: 58px 16px minmax(0, 1fr) auto;

  align-items: center;

  gap: 10px;

  color: rgb(255 255 255 / 0.76);

  font-size: 12px;

  line-height: 1.2;

}



.cap-card\_\_timeline b { display: block; width: 5px; height: 5px; border-radius: 50%; background: rgb(255 255 255 / 0.62); }

.cap-card\_\_timeline strong { min-width: 0; color: #ffffff; font-size: clamp(13px, 0.95vw, 15px); font-weight: 650; }

.cap-card\_\_timeline em { color: rgb(255 255 255 / 0.58); font-style: normal; white-space: nowrap; }



.cap-card--quote,

.cap-card--contact {

  display: flex;

  flex-direction: column;

  justify-content: space-between;

  padding: 24px;

  background:

    linear-gradient(135deg, rgb(255 255 255 / 0.72), rgb(238 244 244 / 0.86)),

    #edf2f2;

}



.cap-card--video-panel > :not(.cap-card\_\_video, .cap-card\_\_light, .cap-card\_\_shade) { position: relative; z-index: 1; }



.cap-card--quote blockquote { margin: clamp(22px, 2.4vw, 34px) 0 20px; color: #263030; font-size: clamp(15px, 1vw, 18px); line-height: 1.62; }

.cap-card--quote p, .cap-card--contact p { margin: 0; color: #6b7676; font-size: 14px; line-height: 1.5; }

.cap-card--quote strong { display: block; color: #111111; font-size: 15px; }



.cap-card--metric { display: block; min-height: 320px; }



.cap-card\_\_metric {

  position: absolute;

  inset: 0;

  z-index: 1;

  width: 100%;

  height: 100%;

  text-align: center;

  text-shadow: 0 12px 32px rgb(0 0 0 / 0.3);

}



.cap-card\_\_metric strong {

  position: absolute;

  top: 50%;

  left: 50%;

  font-size: clamp(82px, 7.4vw, 134px);

  font-weight: 220;

  letter-spacing: 0;

  line-height: 0.9;

  transform: translate(-50%, -50%);

}



.cap-card\_\_metric span {

  position: absolute;

  right: 24px;

  bottom: 24px;

  left: 24px;

  color: rgb(255 255 255 / 0.82);

  font-size: clamp(14px, 1.05vw, 18px);

  line-height: 1.4;

}



.cap-card--tools {

  display: flex;

  flex-direction: column;

  justify-content: space-between;

  padding: 0 0 clamp(20px, 2vw, 28px);

  background:

    linear-gradient(135deg, rgb(255 255 255 / 0.72), rgb(231 238 238 / 0.9)),

    #eef3f3;

}



.cap-card--tools .cap-card\_\_label { color: #758080; }

.cap-card--tools-media { min-height: 420px; padding-bottom: 0; background: transparent; }

.cap-card--tools-media .cap-card\_\_label { color: rgb(255 255 255 / 0.82); }

.cap-card--tools-media .cap-card\_\_shade {

  background:

    linear-gradient(180deg, rgb(5 12 14 / 0.18), transparent 34%),

    linear-gradient(0deg, rgb(5 12 14 / 0.32), transparent 56%);

}



.tool-marquee {

  display: grid;

  gap: 14px;

  overflow: hidden;

  padding: 26px 0 8px;

  mask-image: linear-gradient(to right, transparent, #000 9%, #000 91%, transparent);

}



.tool-marquee\_\_row { display: flex; width: max-content; gap: 12px; }



.tool-marquee\_\_row span {

  display: inline-flex;

  align-items: center;

  gap: 8px;

  min-height: 54px;

  padding: 0 16px;

  border: 1px solid rgb(34 52 52 / 0.1);

  border-radius: 14px;

  background: rgb(255 255 255 / 0.78);

  color: #2c3838;

  font-size: 13px;

  font-weight: 700;

  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.9);

}



.cap-card--tools-media .tool-marquee\_\_row span {

  border-color: rgb(255 255 255 / 0.2);

  background: rgb(255 255 255 / 0.18);

  color: #ffffff;

  backdrop-filter: blur(10px);

  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.24);

}



.tool-marquee\_\_row .ph { font-size: 20px; }

.tool-marquee\_\_row--left { animation: marquee-left 24s linear infinite; }

.tool-marquee\_\_row--right { animation: marquee-right 28s linear infinite; }



@keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }

@keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }



.cap-card--contact {

  min-height: 118px;

  flex-direction: row;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  padding: 20px 76px 20px 24px;

}



.cap-card--contact a:not(.cap-card\_\_icon-button) {

  display: inline-block;

  margin: 14px 0 6px;

  color: #111111;

  font-size: clamp(18px, 1.45vw, 24px);

  font-weight: 360;

  letter-spacing: 0;

  line-height: 1.05;

}



.cap-card\_\_icon-button {

  position: absolute;

  top: 50%;

  right: 16px;

  z-index: 2;

  display: inline-grid;

  place-items: center;

  width: 42px;

  height: 42px;

  border: 1px solid rgb(17 17 17 / 0.1);

  border-radius: 50%;

  background: #111111;

  color: #ffffff;

  transform: translateY(-50%);

}



.cap-card\_\_icon-button .ph { font-size: 19px; }



@media (max-width: 1080px) {

  .capabilities\_\_grid { grid-template-columns: repeat(2, minmax(0, 1fr)); min-height: auto; }

  .cap-card--tall { min-height: 620px; }

  .capabilities\_\_stack:last-child { grid-column: 1 / -1; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: minmax(260px, 1fr); }

}



@media (max-width: 760px) {

  .capabilities\_\_header { flex-direction: column; }

  .capabilities\_\_button { width: 100%; }

  .capabilities\_\_grid, .capabilities\_\_stack, .capabilities\_\_stack:last-child { grid-template-columns: 1fr; grid-template-rows: auto; }

  .cap-card--tall { min-height: 560px; }

  .cap-card\_\_timeline div { grid-template-columns: 52px 14px minmax(0, 1fr); }

  .cap-card\_\_timeline em { grid-column: 3; white-space: normal; }

}



.stats {

  position: relative;

  z-index: 80;

  min-height: 100vh;

  padding: clamp(44px, 5vw, 86px) clamp(16px, 3.8vw, 72px) clamp(54px, 5vw, 90px);

  background:

    radial-gradient(circle at 78% 18%, rgb(113 145 208 / 0.18), transparent 34%),

    radial-gradient(circle at 18% 88%, rgb(170 184 213 / 0.11), transparent 28%),

    linear-gradient(180deg, #111414 0%, #171a1a 100%);

  color: #f7f8f8;

}



.stats\_\_header {

  display: grid;

  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.72fr);

  gap: clamp(32px, 6vw, 120px);

  max-width: var(--hero-max-width);

  margin: 0 auto clamp(34px, 4.5vw, 72px);

}



.stats\_\_title-wrap h2 {

  max-width: 920px;

  margin: 0;

  color: #f7f8f8;

  font-size: clamp(29px, 3.2vw, 54px);

  font-weight: 300;

  letter-spacing: 0;

  line-height: 1.08;

}



.stats\_\_summary {

  align-self: start;

  margin: 0;

  color: rgb(247 248 248 / 0.8);

  font-size: clamp(18px, 1.65vw, 28px);

  font-weight: 360;

  line-height: 1.34;

  opacity: 0;

  transform: translateY(14px);

  transition: opacity 420ms ease, transform 420ms ease;

}



.stats\_\_summary.is-visible { opacity: 1; transform: none; }



.stats\_\_tabs {

  display: grid;

  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: 0;

  max-width: var(--hero-max-width);

  margin: 0 auto;

  border-bottom: 1px solid rgb(255 255 255 / 0.14);

}



.stats\_\_tab {

  position: relative;

  min-height: 58px;

  padding: 0 20px 18px 0;

  border: 0;

  background: transparent;

  color: rgb(247 248 248 / 0.5);

  font: inherit;

  font-size: clamp(14px, 1.22vw, 22px);

  font-weight: 430;

  letter-spacing: 0;

  text-align: left;

  cursor: pointer;

  transition: color 220ms ease;

}



.stats\_\_tab::after {

  content: "";

  position: absolute;

  right: 16px;

  bottom: -1px;

  left: 0;

  height: 4px;

  background: linear-gradient(90deg, var(--hero-blue), #aab8d5);

  transform: scaleX(0);

  transform-origin: left;

  transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);

}



.stats\_\_tab.is-active { color: #ffffff; }

.stats\_\_tab.is-active::after { transform: scaleX(1); }



.stats\_\_chart {

  position: relative;

  max-width: var(--hero-max-width);

  min-height: clamp(520px, 58vh, 680px);

  margin: clamp(28px, 3vw, 48px) auto 0;

  padding: 0 0 22px;

  overflow: hidden;

  border: 1px solid rgb(255 255 255 / 0.08);

  border-radius: 20px;

  background-color: rgb(255 255 255 / 0.025);

  background-image:

    repeating-linear-gradient(

      to right,

      transparent 0,

      transparent calc(10% - 1px),

      rgb(255 255 255 / 0.07) calc(10% - 1px),

      rgb(255 255 255 / 0.07) 10%

    );

  box-shadow:

    inset 0 1px 0 rgb(255 255 255 / 0.08),

    0 24px 70px rgb(0 0 0 / 0.18);

}



.stats\_\_chart-head {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 24px;

  padding: clamp(18px, 2vw, 28px);

  border-bottom: 1px solid rgb(255 255 255 / 0.08);

  background: rgb(255 255 255 / 0.025);

}



.stats\_\_chart-head span, .stats\_\_chart-head strong { font-size: clamp(12px, 0.86vw, 14px); line-height: 1; text-transform: uppercase; }

.stats\_\_chart-head span { color: #ffffff; font-weight: 760; letter-spacing: 0.16em; }

.stats\_\_chart-head strong { color: rgb(247 248 248 / 0.48); font-weight: 620; letter-spacing: 0.12em; }



.stats\_\_axis {

  display: grid;

  grid-template-columns: minmax(180px, 0.27fr) minmax(0, 1fr);

  gap: clamp(18px, 2vw, 34px);

  padding: 14px clamp(24px, 2.4vw, 42px) 0;

  color: rgb(247 248 248 / 0.42);

  font-size: clamp(11px, 0.84vw, 14px);

}



.stats\_\_axis div { display: grid; grid-template-columns: repeat(11, minmax(0, 1fr)); }

.stats\_\_axis div span { text-align: left; }

.stats\_\_axis div span:last-child { text-align: right; }



.stats\_\_bars { display: grid; gap: clamp(16px, 2vh, 26px); padding: clamp(26px, 3vw, 48px) clamp(24px, 2.4vw, 42px) 0; }



.stats\_\_bar-row {

  display: grid;

  grid-template-columns: minmax(180px, 0.27fr) minmax(0, 1fr);

  align-items: center;

  gap: clamp(18px, 2vw, 34px);

  opacity: 0;

  transform: translateY(18px);

}



.stats\_\_chart.is-ready .stats\_\_bar-row { animation: stats-row-in 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: var(--bar-delay); }



.stats\_\_bar-label strong, .stats\_\_bar-label span { display: block; }

.stats\_\_bar-label strong { color: #ffffff; font-size: clamp(15px, 1.1vw, 19px); font-weight: 680; line-height: 1.2; }

.stats\_\_bar-label span { margin-top: 5px; color: rgb(247 248 248 / 0.48); font-size: clamp(12px, 0.86vw, 14px); line-height: 1.35; }



.stats\_\_track {

  position: relative;

  height: clamp(48px, 5.4vh, 64px);

  overflow: hidden;

  border-radius: 0;

  background: rgb(255 255 255 / 0.055);

  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.075), 0 12px 32px rgb(0 0 0 / 0.16);

}



.stats\_\_range {

  position: absolute;

  top: 9px;

  bottom: 9px;

  left: var(--range-start);

  width: var(--range-width);

  border: 1px solid rgb(170 184 213 / 0.22);

  background: linear-gradient(90deg, rgb(113 145 208 / 0.05), rgb(170 184 213 / 0.14), rgb(113 145 208 / 0.05));

  opacity: 0;

  transform: scaleX(0.6);

  transform-origin: left;

}



.stats\_\_chart.is-ready .stats\_\_range { animation: stats-range-in 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: calc(var(--bar-delay) + 60ms); }



.stats\_\_bar {

  position: relative;

  z-index: 1;

  width: var(--bar-value);

  height: 100%;

  background: linear-gradient(90deg, rgb(113 145 208 / 0.62) 0%, #8fb0ef 62%, #d6e3ff 100%);

  box-shadow: 0 0 34px rgb(113 145 208 / 0.24);

  transform: scaleX(0);

  transform-origin: left;

}



.stats\_\_chart.is-ready .stats\_\_bar { animation: stats-fill 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: calc(var(--bar-delay) + 110ms); }



.stats\_\_value { position: absolute; z-index: 3; top: 50%; right: 18px; color: #ffffff; font-size: clamp(14px, 1vw, 18px); font-weight: 740; transform: translateY(-50%); }



.stats\_\_trace { position: absolute; inset: 0; z-index: 2; pointer-events: none; }



.stats\_\_trace i {

  position: absolute;

  top: var(--point-y);

  left: var(--point-x);

  width: 18px;

  height: 18px;

  border-radius: 50%;

  background: radial-gradient(circle, rgb(255 255 255 / 0.95) 0 8%, rgb(214 227 255 / 0.42) 9% 22%, transparent 58%);

  filter: blur(0.1px);

  opacity: 0;

  transform: translate(-50%, -50%) scale(0.2);

}



.stats\_\_trace i::before, .stats\_\_trace i::after {

  content: "";

  position: absolute;

  top: 50%;

  left: 50%;

  border-radius: 999px;

  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.72), transparent);

  transform: translate(-50%, -50%) rotate(var(--spark-rotate, 0deg));

}



.stats\_\_trace i::before { width: 24px; height: 1px; }

.stats\_\_trace i::after { width: 1px; height: 18px; background: linear-gradient(180deg, transparent, rgb(170 184 213 / 0.62), transparent); }



.stats\_\_spark--1 { --spark-rotate: 22deg; width: 14px; height: 14px; }

.stats\_\_spark--2 { --spark-rotate: -18deg; width: 11px; height: 11px; }



.stats\_\_chart.is-ready .stats\_\_trace i { animation: stats-point-in 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: calc(var(--bar-delay) + 260ms + var(--point-delay)); }



@keyframes stats-row-in { to { opacity: 1; transform: none; } }

@keyframes stats-fill { to { transform: scaleX(1); } }

@keyframes stats-range-in { to { opacity: 1; transform: scaleX(1); } }

@keyframes stats-point-in { to { opacity: 0.86; transform: translate(-50%, -50%) scale(1); } }



@media (max-width: 980px) {

  .stats\_\_header { grid-template-columns: 1fr; }

  .stats\_\_tabs { display: flex; overflow-x: auto; }

  .stats\_\_tab { flex: 0 0 min(260px, 76vw); }

  .stats\_\_bar-row { grid-template-columns: 1fr; gap: 10px; }

  .stats\_\_axis { grid-template-columns: 1fr; }

  .stats\_\_axis > span { display: none; }

}



@media (max-width: 620px) {

  .stats\_\_title-wrap h2 { font-size: clamp(26px, 8vw, 42px); }

  .stats\_\_chart { min-height: auto; padding-bottom: 46px; }

  .stats\_\_axis div { grid-template-columns: repeat(6, 1fr); }

  .stats\_\_axis div span:nth-child(even) { display: none; }

}



.video-stories {

  position: relative;

  z-index: 90;

  min-height: 100vh;

  padding: clamp(46px, 5vw, 88px) 0 clamp(44px, 4vw, 74px);

  overflow: hidden;

  background: #f7f8f8;

  color: #111111;

}



.video-stories\_\_header { width: min(100% - 96px, 900px); margin: 0 auto clamp(38px, 4vw, 74px); }

.video-stories\_\_header h2 { margin: 0; color: #111111; font-size: clamp(38px, 4.4vw, 76px); font-weight: 300; letter-spacing: 0; line-height: 1.08; }

.video-stories\_\_header p { max-width: 720px; margin: 22px 0 0; color: #697272; font-size: clamp(16px, 1.25vw, 21px); font-weight: 420; line-height: 1.55; }



.video-stories\_\_rail {

  display: grid;

  grid-auto-flow: column;

  grid-auto-columns: minmax(520px, 34vw);

  gap: clamp(28px, 3vw, 54px);

  overflow-x: auto;

  overscroll-behavior-x: contain;

  scroll-snap-type: x mandatory;

  padding: 0 max(48px, calc((100vw - var(--hero-max-width)) / 2 + 48px)) 36px;

  scrollbar-width: none;

}



.video-stories\_\_rail::-webkit-scrollbar { display: none; }



.story-card {

  scroll-snap-align: center;

  min-width: 0;

  opacity: 0.54;

  transform: translateY(10px);

  transition: opacity 260ms ease, transform 260ms ease;

}



.story-card:hover, .story-card:focus-within { opacity: 1; transform: none; }



.story-card\_\_media {

  display: block;

  width: 100%;

  height: auto;

  aspect-ratio: 16 / 9;

  border-radius: 12px;

  background: #dfe5e6;

  object-fit: cover;

  object-position: center;

  box-shadow: 0 18px 48px rgb(21 34 34 / 0.1);

}



.story-card\_\_content { padding: 24px 28px 0; }

.story-card\_\_content p { margin: 0 0 12px; color: #111111; font-size: 15px; font-weight: 760; line-height: 1; }

.story-card\_\_content h3 { max-width: 680px; margin: 0; color: #252b2b; font-size: clamp(18px, 1.22vw, 24px); font-weight: 520; letter-spacing: 0; line-height: 1.38; }

.story-card\_\_content span { display: block; margin-top: 14px; color: #858d8d; font-size: 14px; line-height: 1.4; }



.video-stories\_\_footer { display: flex; align-items: center; gap: 8px; width: min(100% - 96px, 900px); margin: 28px auto 0; }

.video-stories\_\_footer span { display: block; width: 56px; height: 4px; border-radius: 999px; background: #cfd4d4; }

.video-stories\_\_footer span:nth-child(3) { width: 320px; background: #111111; }

.video-stories\_\_footer strong { margin-left: 18px; color: #7a8282; font-size: 14px; font-weight: 650; letter-spacing: 0.02em; }



@media (max-width: 860px) {

  .video-stories\_\_header, .video-stories\_\_footer { width: min(100% - 48px, 900px); }

  .video-stories\_\_rail { grid-auto-columns: minmax(320px, 82vw); padding: 0 24px 30px; }

  .story-card { opacity: 1; transform: none; }

}



@media (max-width: 560px) {

  .video-stories\_\_header, .video-stories\_\_footer { width: min(100% - 32px, 900px); }

  .story-card\_\_content { padding: 18px 4px 0; }

  .video-stories\_\_footer span:nth-child(3) { width: 150px; }

}



.site-footer { position: relative; z-index: 100; overflow: hidden; background: #000000; color: #ffffff; }



.footer-dots { position: relative; height: 120px; overflow: hidden; background: #000000; }



.footer-dots\_\_line {

  position: absolute;

  left: 0;

  top: 50%;

  width: 200%;

  height: 70px;

  opacity: 0.75;

  background-image:

    radial-gradient(circle, rgb(255 255 255 / 0.55) 1.5px, transparent 2px),

    radial-gradient(circle, rgb(255 255 255 / 0.35) 1px, transparent 1.5px),

    radial-gradient(circle, rgb(255 255 255 / 0.45) 1.2px, transparent 1.8px);

  background-position: 0 8px, 24px 22px, 48px 14px;

  background-size: 72px 38px, 110px 44px, 160px 52px;

  animation: footerDotsMove 18s linear infinite;

  transform: translateY(-50%);

}



@keyframes footerDotsMove { from { transform: translate3d(0, -50%, 0); } to { transform: translate3d(-50%, -50%, 0); } }



.site-footer\_\_inner { width: min(100% - 96px, var(--hero-max-width)); margin: 0 auto; padding: clamp(34px, 4vw, 66px) 0 clamp(18px, 2vw, 34px); }



.site-footer\_\_top {

  display: grid;

  grid-template-columns: minmax(320px, 1.25fr) repeat(3, minmax(150px, 0.42fr));

  gap: clamp(28px, 4vw, 76px);

  min-height: clamp(220px, 24vw, 330px);

}



.site-footer\_\_top h2 { max-width: 680px; margin: 0; color: #ffffff; font-size: clamp(34px, 3.5vw, 62px); font-weight: 220; letter-spacing: 0; line-height: 1.06; }



.site-footer\_\_nav { display: flex; flex-direction: column; align-items: flex-start; gap: clamp(14px, 1.35vw, 22px); }

.site-footer\_\_nav a { color: rgb(255 255 255 / 0.88); font-size: 16px; font-weight: 650; line-height: 1.1; transition: color 180ms ease, transform 180ms ease; }

.site-footer\_\_nav a:hover { color: #ffffff; transform: translateX(3px); }



.site-footer\_\_brand-row { width: 100%; margin-top: clamp(18px, 3vw, 46px); }

.site-footer\_\_brand { display: flex; align-items: center; width: 100%; min-width: 0; color: #ffffff; }



.site-footer\_\_mark {

  position: relative;

  flex: 0 0 clamp(58px, 6.1vw, 118px);

  aspect-ratio: 1;

  margin-right: clamp(14px, 1.6vw, 28px);

  overflow: hidden;

  border-radius: 50%;

  background: #ffffff;

}



.site-footer\_\_mark::before {

  content: "";

  position: absolute;

  inset: -18%;

  background: #000000;

  clip-path: polygon(0 20%, 100% 8%, 100% 19%, 0 31%, 0 43%, 100% 31%, 100% 42%, 0 54%, 0 66%, 100% 54%, 100% 65%, 0 77%);

}



.site-footer\_\_brand span:last-child { display: block; flex: 1 1 auto; min-width: 0; font-size: clamp(58px, 11.1vw, 214px); font-weight: 760; letter-spacing: -0.055em; line-height: 0.78; white-space: nowrap; }



.site-footer\_\_legal { display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 8px 18px; margin-top: clamp(14px, 1.4vw, 24px); color: rgb(255 255 255 / 0.52); font-size: 9px; line-height: 1.35; }

.site-footer\_\_legal p { margin: 0; }

.site-footer\_\_legal a { color: inherit; }

.site-footer\_\_legal a:hover { color: #ffffff; }



@media (max-width: 980px) {

  .site-footer\_\_inner { width: min(100% - 48px, var(--hero-max-width)); }

  .site-footer\_\_top { grid-template-columns: 1fr 1fr; }

  .site-footer\_\_top h2 { grid-column: 1 / -1; }

}



@media (max-width: 560px) {

  .site-footer\_\_inner { width: min(100% - 32px, var(--hero-max-width)); }

  .site-footer\_\_top { grid-template-columns: 1fr; min-height: auto; }

  .site-footer\_\_nav a { font-size: 15px; }

  .site-footer\_\_mark { flex-basis: clamp(38px, 12vw, 58px); }

  .site-footer\_\_brand span:last-child { font-size: clamp(45px, 18vw, 84px); }

}

    </style>

  </head>

  <body>

    <main>

      <engine-hero></engine-hero>



      <section class="mission" id="company" aria-labelledby="mission-title" data-section="mission">

        <div class="mission\_\_inner">

          <p class="mission\_\_eyebrow">The Name Reflects Our Mission</p>



          <div class="mission\_\_statement">

            <h2 id="mission-title">

              Demand for resilient propulsion is rising as aerospace programs move faster, fly farther,

              and require engines built with absolute precision.

            </h2>



            <a class="mission\_\_button" href="#technology">

              <span class="mission\_\_button-icon" aria-hidden="true">

                <i class="ph ph-arrow-elbow-down-right"></i>

              </span>

              <span>Discover Our Story</span>

            </a>

          </div>



          <p class="mission\_\_support">

            Our name, EngineTech, reflects our commitment to moving advanced aircraft and spacecraft from

            ambitious concepts to dependable flight-ready power.

          </p>



          <div class="mission\_\_media" aria-label="EngineTech propulsion systems in motion"></div>

        </div>

      </section>



      <section class="showcase" id="technology" aria-label="Technology highlights"></section>



      <section class="capabilities" id="solutions" aria-labelledby="capabilities-title">

        <div class="capabilities\_\_header">

          <div class="capabilities\_\_intro">

            <h2 id="capabilities-title">Propulsion programs need a partner that can move from concept to certified hardware.</h2>

            <p>

              EngineTech combines precision manufacturing, hot-fire validation, materials engineering, and mission support

              for aircraft and spacecraft programs that cannot afford uncertainty.

            </p>

          </div>



          <a class="capabilities\_\_button" href="#contact">

            <span>Start a Program</span>

            <i class="ph ph-arrow-up-right" aria-hidden="true"></i>

          </a>

        </div>



        <div class="capabilities\_\_grid" aria-label="EngineTech capabilities and proof points">

          <article class="cap-card cap-card--tall cap-card--media">

            <video class="cap-card\_\_video" autoplay muted loop playsinline>

              <source src="https://assets.mixkit.co/videos/45229/45229-720.mp4" type="video/mp4" />

            </video>

            <div class="cap-card\_\_shade" aria-hidden="true"></div>



            <div class="cap-card\_\_label">

              <span>Program Background</span>

            </div>



            <div class="cap-card\_\_timeline">

              <div><span>2026</span><b aria-hidden="true"></b><strong>Reusable upper-stage demonstrator</strong><em>Thermal qualification</em></div>

              <div><span>2025</span><b aria-hidden="true"></b><strong>Hybrid-electric aircraft platform</strong><em>Combustor redesign</em></div>

              <div><span>2024</span><b aria-hidden="true"></b><strong>Orbital transfer vehicle</strong><em>Flight article delivery</em></div>

            </div>

          </article>



          <div class="capabilities\_\_stack">

            <article class="cap-card cap-card--quote">

              <div class="cap-card\_\_label cap-card\_\_label--left">

                <span>Mission Voice</span>

              </div>

              <blockquote>

                "EngineTech brought the discipline we needed: clear design reviews, repeatable test data, and hardware

                that arrived ready for integration."

              </blockquote>

              <p><strong>Dr. Lena Morris</strong> Propulsion Lead, Orbital Systems Group</p>

            </article>



            <article class="cap-card cap-card--metric cap-card--video-panel">

              <video class="cap-card\_\_video" autoplay muted loop playsinline>

                <source src="https://assets.mixkit.co/videos/23211/23211-720.mp4" type="video/mp4" />

              </video>

              <div class="cap-card\_\_shade" aria-hidden="true"></div>

              <div class="cap-card\_\_metric">

                <strong>2K</strong>

                <span>Highly Qualified Engineers</span>

              </div>

            </article>

          </div>



          <div class="capabilities\_\_stack capabilities\_\_stack--systems">

            <article class="cap-card cap-card--tools cap-card--tools-media cap-card--video-panel">

              <video class="cap-card\_\_video" autoplay muted loop playsinline>

                <source src="https://assets.mixkit.co/videos/23843/23843-720.mp4" type="video/mp4" />

              </video>

              <div class="cap-card\_\_shade" aria-hidden="true"></div>



              <div class="cap-card\_\_label">

                <span>Core Systems</span>

              </div>



              <div class="tool-marquee" aria-hidden="true">

                <div class="tool-marquee\_\_row tool-marquee\_\_row--left">

                  <span><i class="ph ph-gear-six"></i> Turbopumps</span>

                  <span><i class="ph ph-fire"></i> Hot-fire</span>

                  <span><i class="ph ph-gauge"></i> Telemetry</span>

                  <span><i class="ph ph-atom"></i> Alloys</span>

                  <span><i class="ph ph-wrench"></i> Assembly</span>

                  <span><i class="ph ph-gear-six"></i> Turbopumps</span>

                  <span><i class="ph ph-fire"></i> Hot-fire</span>

                  <span><i class="ph ph-gauge"></i> Telemetry</span>

                  <span><i class="ph ph-atom"></i> Alloys</span>

                  <span><i class="ph ph-wrench"></i> Assembly</span>

                </div>

                <div class="tool-marquee\_\_row tool-marquee\_\_row--right">

                  <span><i class="ph ph-cpu"></i> Controls</span>

                  <span><i class="ph ph-wave-sine"></i> Vibration</span>

                  <span><i class="ph ph-shield-check"></i> Certification</span>

                  <span><i class="ph ph-rocket-launch"></i> Launch</span>

                  <span><i class="ph ph-chart-line-up"></i> Analysis</span>

                  <span><i class="ph ph-cpu"></i> Controls</span>

                  <span><i class="ph ph-wave-sine"></i> Vibration</span>

                  <span><i class="ph ph-shield-check"></i> Certification</span>

                  <span><i class="ph ph-rocket-launch"></i> Launch</span>

                  <span><i class="ph ph-chart-line-up"></i> Analysis</span>

                </div>

              </div>

            </article>



            <article class="cap-card cap-card--contact" id="contact">

              <div>

                <div class="cap-card\_\_label cap-card\_\_label--left">

                  <span>Reach Engineering</span>

                </div>

                <a href="mailto:programs@enginetech.com">programs@enginetech.com</a>

                <p>+1 415 018 4270</p>

              </div>

              <a class="cap-card\_\_icon-button" href="mailto:programs@enginetech.com" aria-label="Email EngineTech">

                <i class="ph ph-arrow-up-right" aria-hidden="true"></i>

              </a>

            </article>

          </div>

        </div>

      </section>



      <section class="stats" id="our-edge" aria-labelledby="stats-title">

        <div class="stats\_\_header">

          <div class="stats\_\_title-wrap">

            <h2 id="stats-title">Unmatched propulsion data across every flight-critical layer.</h2>

          </div>

          <p class="stats\_\_summary" data-stats-summary>

            EngineTech maps thermal limits, production capacity, upstream readiness, and hydrogen pathways into

            clear decisions for ambitious aerospace programs.

          </p>

        </div>



        <div class="stats\_\_tabs" role="tablist" aria-label="Statistics categories">

          <button class="stats\_\_tab is-active" type="button" role="tab" aria-selected="true" data-stats-tab="cities">

            Cities & Infrastructure

          </button>

          <button class="stats\_\_tab" type="button" role="tab" aria-selected="false" data-stats-tab="materials">

            Materials & Manufacturing

          </button>

          <button class="stats\_\_tab" type="button" role="tab" aria-selected="false" data-stats-tab="fuels">

            Fuels & Upstream

          </button>

          <button class="stats\_\_tab" type="button" role="tab" aria-selected="false" data-stats-tab="hydrogen">

            H2 Hydrogen

          </button>

        </div>



        <div class="stats\_\_chart" data-stats-chart aria-live="polite"></div>

      </section>



      <section class="video-stories" id="our-team" aria-labelledby="video-stories-title">

        <div class="video-stories\_\_header">

          <h2 id="video-stories-title">Program stories from the people building flight-ready power.</h2>

          <p>

            Short field notes from integration leads, test engineers, and manufacturing teams moving advanced

            propulsion systems from requirement reviews to repeatable flight hardware.

          </p>

        </div>



        <div class="video-stories\_\_rail" aria-label="EngineTech video previews">

          <article class="story-card">

            <video class="story-card\_\_media" autoplay muted loop playsinline>

              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_032431_5e054107-51c0-4162-9f0f-3a40054761ef.mp4" type="video/mp4" />

            </video>

            <div class="story-card\_\_content">

              <p>Integration Review</p>

              <h3>How a reusable upper-stage program moved from thermal risk to stable qualification.</h3>

              <span>Reusable systems · 04:20</span>

            </div>

          </article>



          <article class="story-card">

            <video class="story-card\_\_media" autoplay muted loop playsinline>

              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_032535_4ccc152e-0cc8-4ee5-a698-e1a98cea8a1e.mp4" type="video/mp4" />

            </video>

            <div class="story-card\_\_content">

              <p>Hot-Fire Campaign</p>

              <h3>Inside the test cell where telemetry, vibration, and injector response converge.</h3>

              <span>Validation · 03:45</span>

            </div>

          </article>



          <article class="story-card">

            <video class="story-card\_\_media" autoplay muted loop playsinline>

              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_033707_b842a2ea-f223-4804-96d0-737ab67510fc.mp4" type="video/mp4" />

            </video>

            <div class="story-card\_\_content">

              <p>Manufacturing Floor</p>

              <h3>Why sub-micron inspection changes the way aerospace teams plan reliability.</h3>

              <span>Precision build · 05:10</span>

            </div>

          </article>



          <article class="story-card">

            <video class="story-card\_\_media" autoplay muted loop playsinline>

              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_032431_5e054107-51c0-4162-9f0f-3a40054761ef.mp4" type="video/mp4" />

            </video>

            <div class="story-card\_\_content">

              <p>Hydrogen Pathway</p>

              <h3>Designing feed systems and ignition envelopes for hydrogen-ready propulsion.</h3>

              <span>H2 systems · 04:55</span>

            </div>

          </article>



          <article class="story-card">

            <video class="story-card\_\_media" autoplay muted loop playsinline>

              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_032535_4ccc152e-0cc8-4ee5-a698-e1a98cea8a1e.mp4" type="video/mp4" />

            </video>

            <div class="story-card\_\_content">

              <p>Mission Support</p>

              <h3>The operational cadence behind launch-window support and post-test analysis.</h3>

              <span>Field readiness · 03:30</span>

            </div>

          </article>

        </div>



        <div class="video-stories\_\_footer" aria-hidden="true">

          <span></span>

          <span></span>

          <span></span>

          <strong>05 / 05</strong>

        </div>

      </section>

    </main>



    <footer class="site-footer">

      <div class="footer-dots" aria-hidden="true">

        <div class="footer-dots\_\_line"></div>

      </div>



      <div class="site-footer\_\_inner">

        <div class="site-footer\_\_top">

          <h2>Proven Advanced Propulsion Technology</h2>



          <nav class="site-footer\_\_nav" aria-label="Footer navigation">

            <a href="#company">Company</a>

            <a href="#technology">Technology</a>

            <a href="#solutions">Solutions</a>

            <a href="#our-edge">Our Edge</a>

            <a href="#investors">Investors</a>

          </nav>



          <nav class="site-footer\_\_nav" aria-label="Company links">

            <a href="#our-team">Our Team</a>

            <a href="#news">News</a>

            <a href="#careers">Careers</a>

            <a href="#contact">Contact Us</a>

          </nav>



          <nav class="site-footer\_\_nav" aria-label="Social links">

            <a href="https://www.linkedin.com" target="\_blank" rel="noreferrer">LinkedIn</a>

            <a href="https://x.com" target="\_blank" rel="noreferrer">Follow Us on X</a>

          </nav>

        </div>



        <div class="site-footer\_\_brand-row">

          <a class="site-footer\_\_brand" href="/" aria-label="EngineTech home">

            <span class="site-footer\_\_mark" aria-hidden="true"></span>

            <span>EngineTech</span>

          </a>

        </div>



        <div class="site-footer\_\_legal">

          <p>© 2026 EngineTech. All rights reserved.</p>

          <a href="#privacy">Privacy Policy</a>

          <a href="#terms">Terms of Use</a>

        </div>

      </div>

    </footer>



    <script>

// === Hero Section ===

const navItems = ["Company", "Technology", "Solutions", "Our Edge", "Our Team", "Investors", "News"];



class EngineHero extends HTMLElement {

  scrollFrame = 0;

  lastScrollY = 0;



  connectedCallback() {

    this.innerHTML = \`

      <section class="hero" id="heroScroll" aria-labelledby="hero-title">

        <div class="hero\_\_background" aria-hidden="true">

          <div class="hero\_\_bg-layer hero\_\_bg-layer--bottom"></div>

          <div class="hero\_\_stars"></div>

          <div class="hero\_\_bg-layer hero\_\_bg-layer--top"></div>

        </div>



        <header class="hero\_\_nav">

          <a class="brand" href="/" aria-label="EngineTech home">

            <span class="brand\_\_mark" aria-hidden="true">

              <span></span><span></span><span></span><span></span>

            </span>

            <span class="brand\_\_name">EngineTech</span>

          </a>



          <nav class="hero\_\_links" aria-label="Primary navigation">

            ${navItems.map((item) => `<a href="#${item.toLowerCase().replaceAll(" ", "-")}">\${item}</a>\`).join("")}

          </nav>



          <a class="hero\_\_cta" href="#contact">Get In Touch</a>

        </header>



        <div class="hero\_\_content">

          <h1 id="hero-title" class="hero\_\_title" aria-label="Powering the Ship">

            <span class="hero\_\_title-line hero\_\_title-line--one">Powering</span>

          </h1>



          <div class="hero\_\_title-row" aria-hidden="true">

            <span class="hero\_\_title-line hero\_\_title-line--two">the</span>

            <span class="hero\_\_title-line hero\_\_title-line--three">Ship</span>

          </div>



          <div class="engine-visual" aria-hidden="true">

            <img class="engine-visual\_\_asset" src="https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780405513/hero-engine_isebcf.png" alt="" />

          </div>

        </div>



        <p class="hero\_\_caption">

          Precision engines for orbital-class vehicles.

        </p>

      </section>

    \`;



    this.initScrollHero();

  }



  initScrollHero() {

    const hero = this.querySelector(".hero");

    const bg = this.querySelector(".hero\_\_background");

    const title = this.querySelector(".hero\_\_title");

    const titleRow = this.querySelector(".hero\_\_title-row");

    const caption = this.querySelector(".hero\_\_caption");

    const object = this.querySelector(".engine-visual");

    if (!hero || !bg || !title || !titleRow || !caption || !object) return;



    const lerp = (a, b, progress) => a + (b - a) \* progress;

    const colors = {

      start: { top: [113, 145, 208], mid: [170, 184, 213], bottom: [236, 233, 230] },

      end: { top: [240, 232, 220], mid: [238, 229, 216], bottom: [236, 226, 210] },

    };



    const mixColor = (from, to, progress) => {

      const r = Math.round(lerp(from[0], to[0], progress));

      const g = Math.round(lerp(from[1], to[1], progress));

      const b = Math.round(lerp(from[2], to[2], progress));

      return `rgb(${r}, ${g}, ${b})`;

    };



    const animate = () => {

      const rect = hero.getBoundingClientRect();

      const scrollLength = Math.max(hero.offsetHeight - window.innerHeight, 1);

      const progress = Math.min(Math.max(Math.abs(rect.top) / scrollLength, 0), 1);

      const scrollProgress = Math.max(Math.abs(rect.top) / scrollLength, 0);



      const scrollY = Math.abs(rect.top);

      const fadeStart = 0.9 \* window.innerHeight;

      const fadeEnd = 1.35 \* window.innerHeight;

      let fade = 1;

      if (scrollY > fadeStart) {

        fade = 1 - Math.min((scrollY - fadeStart) / (fadeEnd - fadeStart), 1);

      }



      const nav = this.querySelector(".hero\_\_nav");

      if (nav) {

        if (scrollY === 0) {

          nav.classList.add("nav--at-top");

          nav.classList.remove("nav--scroll-down", "nav--scroll-up");

        } else if (scrollY > this.lastScrollY) {

          nav.classList.add("nav--scroll-down");

          nav.classList.remove("nav--at-top", "nav--scroll-up");

        } else if (scrollY < this.lastScrollY) {

          nav.classList.add("nav--scroll-up");

          nav.classList.remove("nav--at-top", "nav--scroll-down");

        }

      }

      this.lastScrollY = scrollY;



      bg.style.setProperty("--hero-top", mixColor(colors.start.top, colors.end.top, progress));

      bg.style.setProperty("--hero-mid", mixColor(colors.start.mid, colors.end.mid, progress));

      bg.style.setProperty("--hero-bottom", mixColor(colors.start.bottom, colors.end.bottom, progress));



      title.style.setProperty("--scroll-y", `${(scrollProgress * -120).toFixed(2)}px`);

      titleRow.style.setProperty("--scroll-y", `${(scrollProgress * -120).toFixed(2)}px`);

      caption.style.setProperty("--scroll-y", `${(scrollProgress * -60).toFixed(2)}px`);

      object.style.setProperty("--scroll-y", `${(scrollProgress * -250).toFixed(2)}px`);



      title.style.opacity = fade;

      titleRow.style.opacity = fade;

      caption.style.opacity = fade;

      object.style.opacity = fade;



      hero.classList.toggle("is-past", rect.bottom <= 0);



      this.scrollFrame = requestAnimationFrame(animate);

    };



    animate();

  }



  disconnectedCallback() {

    cancelAnimationFrame(this.scrollFrame);

  }

}



customElements.define("engine-hero", EngineHero);



// === Showcase Section ===

const TABS = [

  { num: "01", label: "Precision Manufacturing", title: "Built to Sub-Micron<br>Tolerances", desc: "Every component is machined and inspected in our ISO-certified facility, achieving tolerances that exceed aerospace standards by a factor of four." },

  { num: "02", label: "Advanced Materials", title: "Engineered for<br>Extreme Environments", desc: "Proprietary titanium and nickel superalloys withstand operating temperatures exceeding 1,600\u00B0C while maintaining structural integrity across millions of thermal cycles." },

  { num: "03", label: "Thermal Testing", title: "10,000 Cycles<br>Before First Flight", desc: "Each engine variant undergoes a rigorous qualification program simulating the full range of flight conditions, from sea-level ignition to orbital thermal cycling." },

  { num: "04", label: "Mission Certified", title: "Flight-Proven<br>Propulsion", desc: "Our engines have powered missions across low-Earth orbit, polar orbit, and deep-space trajectories \u2014 delivering zero in-flight anomalies across 47 consecutive launches." },

];



const lerp = (a, b, t) => a + (b - a) \* t;

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const easeInOutCubic = (t) => t < 0.5 ? 4 \* t \* t \* t : 1 - Math.pow(-2 \* t + 2, 3) / 2;



class ShowcaseSection {

  frame = 0;

  startRect = null;

  isStartLocked = false;

  expandStartScrollY = 0;



  constructor() {

    this.el = document.querySelector(".showcase");

    this.missionMedia = document.querySelector(".mission\_\_media");

    if (!this.el) return;

    this.createFilm();

    this.renderUI();

    this.loop();

  }



  createFilm() {

    this.film = document.createElement("div");

    this.film.className = "showcase-film";

    this.film.innerHTML = `      <video class="showcase-film__video" autoplay muted loop playsinline poster="https://res.cloudinary.com/dsdhxhhqh/image/upload/v1780405513/hero-engine_isebcf.png">         <source src="https://assets.mixkit.co/videos/6853/6853-720.mp4" type="video/mp4" />       </video>       <div class="showcase-film__overlay"></div>    `;

    document.body.appendChild(this.film);

    this.filmOverlay = this.film.querySelector(".showcase-film\_\_overlay");

  }



  renderUI() {

    this.el.innerHTML = `      <div class="showcase__sticky">         <div class="showcase__ui" aria-live="polite">           <div class="showcase__panels">             ${TABS.map((t, i) =>`

              <div class="showcase\_\_panel${i === 0 ? " is-active" : ""}" data-index="${i}" aria-hidden="${i !== 0}">                <span class="showcase__panel-num">${t.num}</span>

                <h2 class="showcase\_\_panel-title">${t.title}</h2>                <p class="showcase__panel-desc">${t.desc}</p>

              </div>`).join("")}           </div>           <nav class="showcase__tabs-nav" aria-label="Technology sections">             ${TABS.map((t, i) => `

              <div class="showcase\_\_tab${i === 0 ? " is-active" : ""}" data-index="${i}" role="tab" aria-selected="${i === 0}">                <span class="showcase__tab-bar" aria-hidden="true"></span>                <span class="showcase__tab-name">${t.label}</span>

                <span class="showcase\_\_tab-num">\${t.num}</span>

              </div>`).join("")}           </nav>         </div>       </div>     `;

    this.ui = this.el.querySelector(".showcase\_\_ui");

    this.panels = this.el.querySelectorAll(".showcase\_\_panel");

    this.tabs = this.el.querySelectorAll(".showcase\_\_tab");

  }



  cardToRect(mr) { return { top: mr.top, left: mr.left, width: mr.width, height: mr.height, radius: 0 }; }



  applyRect(r) {

    this.film.style.top = `${r.top.toFixed(2)}px`;

    this.film.style.left = `${r.left.toFixed(2)}px`;

    this.film.style.width = `${r.width.toFixed(2)}px`;

    this.film.style.height = `${r.height.toFixed(2)}px`;

    this.film.style.borderRadius = `${r.radius.toFixed(2)}px`;

  }



  loop = () => {

    const { el, missionMedia, film, filmOverlay, ui, panels, tabs } = this;

    const vh = window.innerHeight;

    const rect = el.getBoundingClientRect();

    const scrolled = -rect.top;

    const totalScroll = Math.max(el.offsetHeight - vh, 1);

    let missionMediaVisible = false;

    let missionMediaPending = false;



    if (rect.bottom <= 0) {

      film.style.opacity = "0";

      filmOverlay.style.opacity = "0";

      ui.style.opacity = "0";

      this.frame = requestAnimationFrame(this.loop);

      return;

    }



    if (missionMedia) {

      const mr = missionMedia.getBoundingClientRect();

      missionMediaVisible = mr.width > 0 && mr.height > 0 && mr.bottom > 0 && mr.top < vh;

      missionMediaPending = mr.width > 0 && mr.height > 0 && mr.top >= vh;



      if (missionMediaVisible && scrolled <= 0) {

        const mediaCenterY = mr.top + mr.height / 2;

        if (mediaCenterY > vh / 2) { this.isStartLocked = false; this.expandStartScrollY = 0; }

        if (mediaCenterY <= vh / 2 || this.isStartLocked) {

          if (!this.isStartLocked) { this.expandStartScrollY = window.scrollY; }

          this.isStartLocked = true;

          this.startRect = this.cardToRect(mr);

        } else {

          this.startRect = this.cardToRect(mr);

        }

      }

    }



    if (!this.isStartLocked) {

      if (missionMediaPending) { this.startRect = null; this.expandStartScrollY = 0; }

      if (this.startRect) { this.applyRect(this.startRect); }

      film.style.opacity = this.startRect ? "1" : "0";

      filmOverlay.style.opacity = "0";

      ui.style.opacity = "0";

      this.frame = requestAnimationFrame(this.loop);

      return;

    }



    const expandP = clamp((window.scrollY - this.expandStartScrollY) / vh, 0, 1);

    const eased = easeOutCubic(expandP);

    film.style.opacity = "1";



    const sr = this.startRect || { top: vh \* 0.21, left: window.innerWidth \* 0.38, width: window.innerWidth \* 0.58, height: vh \* 0.58, radius: 0 };

    this.applyRect({

      top: lerp(sr.top, 0, eased),

      left: lerp(sr.left, 0, eased),

      width: lerp(sr.width, window.innerWidth, eased),

      height: lerp(sr.height, vh, eased),

      radius: lerp(sr.radius, 0, eased),

    });



    filmOverlay.style.opacity = String((eased \* 0.22).toFixed(3));



    if (expandP < 1) { ui.style.opacity = "0"; this.frame = requestAnimationFrame(this.loop); return; }



    const progress = clamp(scrolled / totalScroll, 0, 1);

    const uiP = clamp(progress / 0.08, 0, 1);

    ui.style.opacity = String(easeInOutCubic(uiP).toFixed(3));



    const TAB_START = 0.08;

    const tabP = clamp((progress - TAB_START) / (1 - TAB_START), 0, 1);

    const activeTab = clamp(Math.floor(tabP \* TABS.length), 0, TABS.length - 1);



    panels.forEach((p, i) => { const active = i === activeTab; p.classList.toggle("is-active", active); p.setAttribute("aria-hidden", String(!active)); });

    tabs.forEach((t, i) => { const active = i === activeTab; t.classList.toggle("is-active", active); t.setAttribute("aria-selected", String(active)); });



    this.frame = requestAnimationFrame(this.loop);

  };



  destroy() { cancelAnimationFrame(this.frame); this.film?.remove(); }

}



new ShowcaseSection();



// === Stats Section ===

const DATASETS = {

  cities: {

    title: "Cities & Infrastructure",

    summary: "Distributed aerospace infrastructure needs engines that can test, relight, and recover across dense launch corridors and remote operating bases.",

    bars: [

      { label: "Mobile integration bays", value: 82, target: 88, rangeStart: 58, rangeEnd: 91, unit: "%", note: "deployment coverage", trace: [28, 42, 57, 63, 74, 82] },

      { label: "Airport-adjacent service cells", value: 68, target: 74, rangeStart: 44, rangeEnd: 79, unit: "%", note: "qualified workflows", trace: [18, 36, 41, 55, 61, 68] },

      { label: "Remote launch support", value: 54, target: 63, rangeStart: 30, rangeEnd: 70, unit: "%", note: "field readiness", trace: [14, 24, 39, 43, 48, 54] },

      { label: "Thermal recovery loops", value: 76, target: 81, rangeStart: 50, rangeEnd: 84, unit: "%", note: "heat reuse potential", trace: [26, 38, 49, 66, 72, 76] },

    ],

  },

  materials: {

    title: "Materials & Manufacturing",

    summary: "EngineTech combines high-temperature alloys, additive tooling, and inspection data to compress the path from design lock to certified hardware.",

    bars: [

      { label: "Nickel superalloy margin", value: 91, target: 94, rangeStart: 68, rangeEnd: 96, unit: "%", note: "thermal headroom", trace: [44, 61, 70, 79, 86, 91] },

      { label: "Additive chamber tooling", value: 72, target: 80, rangeStart: 48, rangeEnd: 86, unit: "%", note: "lead-time reduction", trace: [19, 34, 48, 53, 67, 72] },

      { label: "Sub-micron inspection yield", value: 96, target: 97, rangeStart: 82, rangeEnd: 99, unit: "%", note: "accepted components", trace: [71, 77, 84, 89, 94, 96] },

      { label: "Reusable test article cycles", value: 84, target: 88, rangeStart: 62, rangeEnd: 91, unit: "%", note: "qualification depth", trace: [36, 52, 64, 71, 79, 84] },

    ],

  },

  fuels: {

    title: "Fuels & Upstream",

    summary: "Fuel-path analysis links propellant availability, storage constraints, and injector behavior before a program commits to flight architecture.",

    bars: [

      { label: "Methane supply compatibility", value: 78, target: 83, rangeStart: 52, rangeEnd: 88, unit: "%", note: "regional availability", trace: [22, 31, 46, 58, 69, 78] },

      { label: "Kerosene retrofit readiness", value: 64, target: 70, rangeStart: 40, rangeEnd: 74, unit: "%", note: "legacy platforms", trace: [28, 35, 39, 52, 57, 64] },

      { label: "Cryogenic storage stability", value: 88, target: 92, rangeStart: 66, rangeEnd: 95, unit: "%", note: "validated envelopes", trace: [45, 56, 68, 74, 83, 88] },

      { label: "Injector response confidence", value: 92, target: 94, rangeStart: 70, rangeEnd: 97, unit: "%", note: "hot-fire data", trace: [48, 62, 73, 85, 89, 92] },

    ],

  },

  hydrogen: {

    title: "H2 Hydrogen",

    summary: "Hydrogen programs require tight coordination between tankage, feed systems, ignition stability, and ultra-low-temperature operations.",

    bars: [

      { label: "Hydrogen-ready turbopumps", value: 86, target: 90, rangeStart: 62, rangeEnd: 93, unit: "%", note: "design maturity", trace: [30, 46, 60, 71, 79, 86] },

      { label: "LH2 feedline conditioning", value: 74, target: 82, rangeStart: 47, rangeEnd: 86, unit: "%", note: "ground systems", trace: [18, 29, 44, 58, 66, 74] },

      { label: "Ignition stability range", value: 93, target: 95, rangeStart: 72, rangeEnd: 98, unit: "%", note: "transient control", trace: [54, 68, 75, 84, 90, 93] },

      { label: "Zero-carbon flight pathway", value: 81, target: 87, rangeStart: 56, rangeEnd: 90, unit: "%", note: "program fit", trace: [24, 39, 55, 68, 76, 81] },

    ],

  },

};



class StatsSection {

  activeKey = "cities";



  constructor() {

    this.el = document.querySelector(".stats");

    if (!this.el) return;

    this.tabs = this.el.querySelectorAll("[data-stats-tab]");

    this.summary = this.el.querySelector("[data-stats-summary]");

    this.chart = this.el.querySelector("[data-stats-chart]");

    this.tabs.forEach((tab) => { tab.addEventListener("click", () => this.setActive(tab.dataset.statsTab)); });

    this.render();

  }



  setActive(key) {

    if (!DATASETS[key] || key === this.activeKey) return;

    this.activeKey = key;

    this.tabs.forEach((tab) => { const active = tab.dataset.statsTab === key; tab.classList.toggle("is-active", active); tab.setAttribute("aria-selected", String(active)); });

    this.render();

  }



  render() {

    const data = DATASETS[this.activeKey];

    this.summary.classList.remove("is-visible");

    this.chart.classList.remove("is-ready");



    window.setTimeout(() => {

      this.summary.textContent = data.summary;

      this.chart.innerHTML = `        <div class="stats__chart-head">           <span>${data.title}</span>           <strong>Operating envelope</strong>         </div>         <div class="stats__bars">           ${data.bars.map((bar, index) =>`

            <article class="stats\_\_bar-row" style="--bar-value: ${bar.value}%; --range-start: ${bar.rangeStart}%; --range-width: ${bar.rangeEnd - bar.rangeStart}%; --bar-delay: ${index \* 90}ms;">

              <div class="stats\_\_bar-label">

                <strong>${bar.label}</strong>                <span>${bar.note}</span>

              </div>

              <div class="stats\_\_track" aria-hidden="true">

                <div class="stats\_\_range"></div>

                <div class="stats\_\_bar"></div>

                <span class="stats\_\_value">${bar.value}${bar.unit}</span>

                <div class="stats\_\_trace">

                  ${bar.trace.map((point, pointIndex) => `<i class="stats__spark stats__spark--${pointIndex % 3}" style="--point-x: ${Math.min(point, bar.value - 3)}%; --point-y: ${pointIndex % 2 === 0 ? 34 : 62}%; --point-delay: ${pointIndex * 70}ms"></i>`).join("")}                </div>              </div>            </article>          `).join("")}        </div>        <div class="stats__axis" aria-hidden="true">          <span></span>          <div>${Array.from({ length: 11 }, (\_, i) => `<span>${i * 10}</span>`).join("")}

          </div>

        </div>

      \`;



      requestAnimationFrame(() => {

        this.summary.classList.add("is-visible");

        this.chart.classList.add("is-ready");

      });

    }, 140);

  }

}



new StatsSection();

    </script>

  </body>

</html>


---

# 028 Asme-Hero Section

# Asme-Hero Section

Build a single-page hero section with a full-screen looping background video, liquid glass UI elements, and a dark cinematic aesthetic. Use React, TypeScript, Tailwind CSS, and Lucide React icons. Here are the exact specifications:



Background Video:



Full-screen muted autoplaying video covering the entire viewport, positioned absolutely with object-cover

Video source URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4

The video is shifted down by 17% (translate-y-[17%]) so the top portion of the video is cropped -- the interesting content is in the lower portion of the frame

The video loops seamlessly with a custom JavaScript fade system (no CSS transitions): 500ms requestAnimationFrame-based fade-in on load/loop start, 500ms fade-out when 0.55 seconds remain before the video ends. A fadingOutRef boolean prevents re-triggering the fade-out from repeated timeUpdate events. On ended, opacity is set to 0, then after 100ms the video resets to currentTime = 0, plays, and fades back in. Each new fade cancels any running animation frame to prevent competing animations. Fades resume from the current opacity rather than snapping.

The outer container is min-h-screen bg-black with overflow-hidden



Font:



Import Google Font "Instrument Serif" (both regular and italic) via CSS @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap')

The heading uses fontFamily: "'Instrument Serif', serif" applied via inline style



Liquid Glass CSS (.liquid-glass class):



background: rgba(255, 255, 255, 0.01) with background-blend-mode: luminosity

backdrop-filter: blur(4px) and -webkit-backdrop-filter: blur(4px)

border: none

box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1)

position: relative; overflow: hidden

A ::before pseudo-element creates the glass border effect:

position: absolute; inset: 0; border-radius: inherit; padding: 1.4px

background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%)

Mask trick for border-only rendering: -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude

pointer-events: none



Layout (all inside one full-screen flex column):



Navigation bar (relative z-20, padding pl-6 pr-6 py-6):

Inner container: rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto

Left side: Logo area with a Globe icon (size 24) and text "Asme" in white, font-semibold text-lg, with gap-2

Next to the logo (with gap-8): three nav links ("Features", "Pricing", "About") -- hidden on mobile, shown on md: -- styled text-white/80 hover:text-white transition-colors text-sm font-medium

Right side (gap-4): "Sign Up" as plain white text button, "Login" as a liquid-glass rounded-full px-6 py-2 button



Hero content area (relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]):

Heading: "Built for the curious" -- text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight whitespace-nowrap with Instrument Serif font

Below the heading, a max-w-xl w-full space-y-4 container:

Email input bar: liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3. Inside: a transparent email input (placeholder: "Enter your email", text-white placeholder:text-white/40 text-base) and a white circular submit button (bg-white rounded-full p-3 text-black) containing an ArrowRight icon (size 20)

Subtitle text: text-white text-sm leading-relaxed px-4 -- "Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates."

Manifesto button: centered, liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors



Social icons footer (relative z-10 flex justify-center gap-4 pb-12):

Three circular icon buttons, each liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all

Icons: Instagram, Twitter, Globe (all size 20) from lucide-react

Each has an aria-label



Tech stack: Vite + React 18 + TypeScript, Tailwind CSS 3, lucide-react for all icons. Default Tailwind config with no extensions. No other UI libraries.


---

# 029 Scroll Landing Page

# Scroll Landing Page

**Create a React + Vite + Tailwind CSS v4 landing page for "WISA" -- a premium football/soccer organization website. The page has a scroll-driven video background, 3 content sections, and a glassmorphism footer. Use ONLY these dependencies: react 19, motion (framer-motion v12+), gsap, lucide-react, tailwindcss v4 with @tailwindcss/vite plugin. The design is dark, cinematic, minimal, with Manrope (sans) and JetBrains Mono (mono) fonts.**



---



### GLOBAL SETUP



**package.json dependencies (exact):**

```Plain Text
react, react-dom ^19.0.0
motion ^12.23.24
gsap ^3.14.2
lucide-react ^0.546.0
tailwindcss ^4.1.14
@tailwindcss/vite ^4.1.14
@vitejs/plugin-react ^5.0.4
vite ^6.2.0
```



**vite.config.ts:** Use `@tailwindcss/vite` plugin + `@vitejs/plugin-react`. Alias `@` to project root.



**index.html:** Standard HTML5. Include `<script type="module" src="``https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js``"></script>` in head.



**src/index.css -- EXACT:**

```CSS
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@keyframes flyOutRight {
  0% { transform: translateX(0); }
  100% { transform: translateX(250%); }
}

@keyframes flyInLeft {
  0% { transform: translateX(-250%); }
  100% { transform: translateX(0); }
}

.animate-fly-out {
  animation: flyOutRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-fly-in {
  animation: flyInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes flyOutUp {
  0% { transform: translateY(0); }
  100% { transform: translateY(-150%); }
}

@keyframes flyInUp {
  0% { transform: translateY(150%); }
  100% { transform: translateY(0); }
}

.animate-fly-out-up {
  animation: flyOutUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-fly-in-up {
  animation: flyInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```



These define 4 keyframe animations:

- `flyOutRight / flyInLeft` (250% translateX, 0.5s) -- for the arrow button hover
- `flyOutUp / flyInUp` (150% translateY, 0.4s) -- for nav text hover
- All use `cubic-bezier(0.4, 0, 0.2, 1)` easing with `forwards` fill mode

---



### COMPONENT: ScrollReveal (`src/components/ScrollReveal.tsx` + `ScrollReveal.css`)



**ScrollReveal.css:**

```CSS
.scroll-reveal { margin: 0; }
.scroll-reveal-text { display: flex; flex-wrap: wrap; margin: 0; }
.word { display: inline-block; white-space: pre; }
```



**ScrollReveal.tsx:** A GSAP-powered word-by-word scroll reveal component.

- Props: `children` (string), `scrollContainerRef?`, `enableBlur` (default true), `baseOpacity` (default 0.1), `baseRotation` (default 3), `blurStrength` (default 4), `containerClassName`, `textClassName`, `rotationEnd` (default "bottom bottom"), `wordAnimationEnd` (default "bottom bottom")
- Splits children text by whitespace into `<span className="word">` elements using `useMemo`
- Three GSAP ScrollTrigger animations:

  1. **Rotation**: Container rotates from `baseRotation` degrees to 0, origin "0% 50%", scrub true, trigger start "top bottom", end = `rotationEnd`
  2. **Opacity**: Each `.word` fades from `baseOpacity` to 1, stagger 0.05, scrub true, trigger start "top bottom-=20%", end = `wordAnimationEnd`
  3. **Blur** (if `enableBlur`): Each `.word` goes from `blur(blurStrength px)` to `blur(0px)`, same stagger/trigger as opacity
- Renders: `<h2 ref={containerRef} className="scroll-reveal {containerClassName}"><p className="scroll-reveal-text {textClassName}">{splitText}</p></h2>`
- Cleanup: kills all ScrollTrigger instances on unmount

---



### COMPONENT: Reveal (inline in App.tsx)



A motion.div wrapper for viewport-triggered fade-in:

```TypeScript
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

Easing is `[0.16, 1, 0.3, 1]` (ease-out-expo style).



---



### COMPONENT: NavItem (inline in App.tsx)



A hover-animated navigation link with vertical text fly animation:

- Uses a `cycle` counter state (useState(0))
- On `mouseEnter` and `mouseLeave`: increment cycle
- When `cycle === 0` (initial, no hover yet): render single `<span>` with `text-white/64` and `group-hover:text-white transition-colors duration-300`
- When `cycle > 0`: render TWO spans keyed by cycle -- one with `.animate-fly-out-up` (exits upward), one absolute-positioned with `.animate-fly-in-up` (enters from below)
- Container: `<a>` with `relative overflow-hidden group flex items-center justify-center py-1`

---



### MAIN APP (src/App.tsx) - ARCHITECTURE



**Video URL constant:**

```Plain Text
const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260521_064421_279656fd-e76f-40a0-8fed-7456d4f7715a.mp4';
```



**State & Refs:**

- `arrowCycle` (useState(0)) -- for arrow button hover animation, same pattern as NavItem
- `videoRef` (useRef HTMLVideoElement)
- `videoContainerRef` (useRef HTMLDivElement)
- `isLoaded` (useState false) -- tracks when video is ready
- `screen3Ref` (useRef HTMLDivElement) -- reference to footer section for scroll calculation
- `scrollY` from motion's `useScroll()`
- `headerY` = `useTransform(scrollY, [0, 500, 800], [0, 0, -150])` -- header slides up and out after scrolling past 500px

---



### SCROLL-DRIVEN VIDEO - CRITICAL IMPLEMENTATION



**Effect 1: Video Loading**

```TypeScript
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;
  const handleCanPlay = () => setIsLoaded(true);
  video.addEventListener('canplaythrough', handleCanPlay);
  video.load();
  return () => video.removeEventListener('canplaythrough', handleCanPlay);
}, []);
```



**Effect 2: Scroll-to-Video-Scrub (with the `video.seeking` guard)**

```TypeScript
useEffect(() => {
  if (!isLoaded) return;
  const video = videoRef.current;
  if (!video || !video.duration) return;

  const handleScroll = () => {
    if (!screen3Ref.current || video.seeking) return;
    // ^^ CRITICAL: "video.seeking" check tells the browser: "Only update the video
    // frame when you've completely finished rendering the previous one."
    // Without this guard, rapid scroll events queue up competing .currentTime assignments,
    // causing visible frame tearing, flickering, and dropped frames. The browser's
    // internal seek operation is asynchronous -- setting .currentTime while a previous
    // seek is still in progress gets silently ignored or causes visual glitches.
    // By checking video.seeking, we skip scroll events that arrive before the prior
    // frame has been decoded and painted, resulting in smooth, tear-free scrubbing.

    const rect = screen3Ref.current.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const stopScroll = Math.max(1, absoluteTop - (window.innerHeight * 0.2));
    const scrollFraction = Math.max(0, Math.min(1, window.scrollY / stopScroll));
    video.currentTime = scrollFraction * video.duration;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  return () => window.removeEventListener('scroll', handleScroll);
}, [isLoaded]);
```



The scroll fraction maps from 0 (top of page) to 1 (when the footer section is 20% of viewport height from top). This means the video plays through its full duration as the user scrolls from top to the footer.



---



### SECTION 0: LOADING SCREEN



Shown when `!isLoaded`. Fixed fullscreen, z-50, black bg, centered:

- "LOADING" text: `text-[10px] font-mono tracking-widest mb-4 text-white/50`
- Progress bar below: `w-64 h-[1px] bg-white/10 mt-8 overflow-hidden` with inner `h-full bg-white w-1/3 animate-pulse`

---



### LAYER STRUCTURE



The entire page is layered:

1. **Fixed video background** (`fixed inset-0 z-0 bg-black`) -- video is absolutely centered with cover behavior using `transform: translate(-50%, -50%)`, `minWidth/minHeight: 100%`, `objectFit: cover`
2. **Fixed header** (z-20) -- animated with motion, slides out via `headerY` transform
3. **Scrollable content** (`relative z-10 pointer-events-none`) -- all sections flow here, with `pointer-events-auto` on interactive areas

---



### SECTION 1: HERO (Screen 1)



Container: `w-[90%] mx-auto h-screen flex flex-col py-8 md:py-12 lg:py-16 pb-12`



Inner main: `flex-1 w-full pointer-events-auto flex flex-col md:grid md:grid-cols-12 md:grid-rows-[1fr_auto] gap-y-8 md:gap-y-0 md:gap-x-8`



**Grid layout (desktop 12-col, 2-row):**



1. **Heading** (bottom-left): `md:row-start-2 md:col-start-1 md:col-span-8 flex items-end`

   - H1: `text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] font-medium tracking-tight text-white whitespace-nowrap`
   - Text: "Championing" `<br/>` "The Pitch Of Legends"
   - Wrapped in `<Reveal delay={0.2}>`
2. **Description paragraph** (center-right): `md:row-start-1 md:col-start-8 md:col-span-5 flex flex-col justify-center items-start md:items-end text-left md:text-right`

   - Paragraph: `text-[clamp(1rem,1.6vw,1.375rem)] text-white/64 leading-[1.3] font-normal max-w-[460px] relative -top-[90px]`
   - Text: "Advanced preparation and training of world-class football teams for leagues, tournaments, and trophies. **We bring the trophy closer to your cabinet.**" (bold part is `font-semibold text-white`)
   - Wrapped in `<Reveal delay={0.3}>`
3. **CTA Button** (bottom-right): `md:row-start-2 md:col-start-8 md:col-span-5 flex items-end justify-start md:justify-end`

   - Two-part button with 1px gap (`flex items-stretch gap-1 group cursor-pointer`)
   - **Text part**: `px-8 py-5 bg-white/8 backdrop-blur-[80px]` -> on group-hover: `bg-white`. Text: "EXPLORE OUR STADIUMS" in `font-mono text-[12px] tracking-[-0.01em] text-white/90` -> hover: `text-black`
   - **Arrow part**: `px-6 bg-white/8 backdrop-blur-[80px]` -> hover: `bg-white`. Contains `<ArrowRight>` (lucide, w-5 h-5) with the same fly-out/fly-in animation pattern as NavItem but horizontal (`.animate-fly-out` / `.animate-fly-in`)
   - `arrowCycle` state drives the animation, same increment pattern on mouseEnter/mouseLeave
   - Wrapped in `<Reveal delay={0.4}>`

---



### SECTION 1.5: SPACER



`<div className="h-[200px] w-full"></div>` -- 200px empty gap



---



### SECTION 2: SCROLL-REVEAL TEXT + 3-COLUMN GRID



Container: `w-[90%] mx-auto min-h-screen flex flex-col justify-center py-8 md:py-12 lg:py-16 pointer-events-auto`



Inner: `max-w-[1200px] w-full`



**ScrollReveal component usage:**

```TypeScript
<ScrollReveal
  baseOpacity={0.1}
  enableBlur={true}
  baseRotation={3}
  blurStrength={4}
  textClassName="text-[clamp(2rem,4.5vw,4rem)] leading-[1.1] font-medium tracking-tight text-white w-full"
>
  Complete Football Programs For Professional Player Development. We Build The Foundations For Next-Generation Strikers, Midfielders, And Star Defenders.
</ScrollReveal>
```



**3-Column Grid below** (`mt-24 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8`):



1. **Col 1 (md:col-span-4)**: Globe SVG (71x43 wireframe globe) + WISA logo SVG (157x25, scaled to h-[18px] w-auto) side by side with `gap-4`. Below: tagline "Winning the future on pitch" in `text-[11px] font-mono tracking-widest text-white/60 uppercase leading-relaxed`. Wrapped in `<Reveal delay={0.1}>`
2. **Col 2 (md:col-span-4)**: H3 "Performance Analytics / Facilities" (`text-xl font-medium text-white`), paragraph below (`text-[15px] text-white/80 leading-relaxed`). Wrapped in `<Reveal delay={0.2}>`
3. **Col 3 (md:col-span-4)**: H3 "Matchday Premium / Fan Experiences!" same styling, paragraph same styling. Wrapped in `<Reveal delay={0.3}>`

---



### SECTION 2.5: SPACER



Another `h-[200px]` spacer



---



### SECTION 3: FOOTER (ref={screen3Ref})



This is the scroll endpoint for the video scrub calculation. Wrapped in `pointer-events-auto`.



**Footer container**: `width: 90%, margin: 0 auto, paddingBottom: 64px` (inline styles)



**Inner card** (glassmorphism): `backgroundColor: rgba(26, 26, 26, 0.6)`, `backdropFilter: blur(80px)`, `WebkitBackdropFilter: blur(80px)`, `border: 1px solid rgba(255, 255, 255, 0.1)`, `padding: clamp(32px, 4vw, 64px)` -- all inline styles



**CTA Section** (top of footer card):

- Flexbox wrap, `alignItems: flex-end`, `justifyContent: space-between`, `gap: 40px`
- Bottom border: `1px solid rgba(255, 255, 255, 0.1)`, `paddingBottom: clamp(48px, 4vw, 80px)`
- H2: "Ready To Score / Your Winning Season?" -- `fontSize: clamp(2rem, 4.5vw, 3.5rem)`, `fontWeight: 500`, `letterSpacing: -0.02em`, `lineHeight: 1.05`
- Button: Same two-part pattern (text + arrow) but with white bg / black text, `padding: 20px 32px` and `20px 24px`. Text: "START YOUR SEASONS" in `font-mono, 12px, -0.01em tracking, bold 700`

**Footer Links Grid** (`paddingTop: clamp(48px, 4vw, 64px)`):

- CSS Grid: `repeat(auto-fit, minmax(160px, 1fr))`, `gap: clamp(32px, 3vw, 48px)`
- 4 columns:

  1. **Brand**: WISA logo SVG (h:14px) + tagline paragraph (13px, rgba white 0.4, maxWidth 220)
  2. **Company**: Header "COMPANY" (10px mono, 0.1em tracking, rgba white 0.3) + links: About, Rosters, Press, Contact (14px, rgba white 0.6)
  3. **Services**: Header "SERVICES" same style + links: Coaching, Training Camp, Fitness, Tryout
  4. **Connect**: Header "CONNECT" same style + links: LinkedIn, X / Twitter, YouTube, Newsletter

**Copyright Bar** (`marginTop: 56, paddingTop: 32, borderTop: 1px solid rgba white 0.1`):

- Flex wrap space-between
- Left: "2026 WISA. ALL RIGHTS RESERVED." (11px mono, rgba white 0.25, 0.1em tracking)
- Right: PRIVACY | TERMS links (same styling, gap-24px)

---



### FIXED HEADER



`<motion.header>` with:

- `style={{ y: headerY }}` -- slides out after scroll 500-800px
- `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1 }}`, easing `[0.16, 1, 0.3, 1]`, duration 0.8
- Classes: `fixed top-0 left-1/2 -translate-x-1/2 z-20 w-[90%] flex items-center justify-between pointer-events-auto py-4 md:py-6 lg:py-8`

**Left: WISA Logo SVG** (157x25, white, 4 paths spelling "WISA")



**Right: Navigation bar** (`hidden lg:flex items-stretch bg-[#1A1A1A]/40 backdrop-blur-[80px]`):

- Nav links container: `flex items-center justify-between px-6 font-mono text-xs tracking-[-0.01em] w-[480px]`
- 5 NavItem components: LEAGUES, STADIUMS, TRAINING, COMPETITIONS, TICKETS
- CTA button: `bg-white text-black px-6 py-5 font-mono text-xs leading-4 font-bold tracking-[-0.01em] hover:bg-gray-200 transition-colors w-[148px]` -- text "BUY MATCH PASS"

---



### SVG ASSETS



**WISA Logo** (used 3 times -- header, section 2, footer): 157x25 viewBox, 4 white paths. The paths spell "W I S A" in a custom typeface.



**Globe icon** (used in section 2 col 1): 71x43 viewBox, wireframe globe with horizontal/vertical/meridian lines, stroke white, no fill.



Both SVGs are inlined directly. They are too detailed to describe -- copy the exact path data from the source code above.



---



### KEY DESIGN TOKENS SUMMARY



| Token | Value |
|-|-|
| Font sans | Manrope 300-700 |
| Font mono | JetBrains Mono 400-700 |
| Background | Pure black (#000) |
| Text primary | white |
| Text secondary | white/64 (rgba 255,255,255,0.64) |
| Text muted | white/60, white/50, white/40, white/25 |
| Glass bg | #1A1A1A at 40% opacity |
| Glass blur | 80px |
| Glass border | rgba(255,255,255,0.1) |
| Button bg | white/8 -> white on hover |
| Spacing rhythm | 90% viewport width container, clamp-based responsive values |
| Easing (motion) | [0.16, 1, 0.3, 1] |
| Easing (CSS) | cubic-bezier(0.4, 0, 0.2, 1) |


---

# 030 Logoisum Video Agency Hero

# Logoisum Video Agency Hero

Build a premium, high-end hero section for a video editing agency named 'Logoisum' with the following specifications:



Background: Implement a full-screen, looping video background using this URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4. The video must be muted, autoplaying, and set to object-cover to fill the section without any color overlays.



Navigation Bar: A floating white navigation bar with rounded-[16px] and a subtle shadow.



Left: The agency logo.



Center: A menu with links for 'About', 'Works', 'Services', and 'Testimonial' using 14px Barlow Medium font.



Right: A dark (#222) primary CTA button labeled 'Book A Free Meeting' featuring a unique 45-degree arrow icon in a circular housing.



Typography & Hero Content:



Primary Headline: Centered layout. The first line 'Agency that makes your' should use a bold/medium Barlow font with tight tracking (tracking-[-4px]). The second line 'videos & reels viral' must use a large, elegant 'Instrument Serif' italic font (text-[84px]).



Subtext: Below the headline, add the text 'Short-form video editing for Influencers, Creators and Brands' in Barlow Medium, 18px, centered.



Secondary CTA: A large white pill-shaped button below the subtext labeled 'See Our Workreel' with a small play icon on the left.



Overall Aesthetic: The design should be minimal, ultra-modern, and responsive. Ensure all text and buttons are layered on top of the video background with clear visibility and proper spacing (min-h-[90vh]).


---

# 031 Orbis NFT

# Orbis NFT

Create an NFT landing page called "Orbis.Nft" with 4 sections, using a dark space theme. The page uses video backgrounds served from CloudFront, a liquid glass UI effect, and a specific color/font system. Recreate it exactly as described below.



FONTS (Google Fonts)



Anton - Used for all headings and navigation text (aliased as font-grotesk in Tailwind)



Condiment - A cursive script used for accent/overlay text (aliased as font-condiment in Tailwind)



System monospace font (font-mono) - Used for body/description paragraphs



Load via Google Fonts in index.html:



https://fonts.googleapis.com/css2?family=Anton&family=Condiment&display=swap





COLOR SYSTEM (Tailwind config)



Background: #010828 (deep dark navy blue)



cream: #EFF4FF (off-white, used for all text)



neon: #6FFF00 (bright green, used for accent cursive text and underline bars)



LIQUID GLASS CSS EFFECT



Applied via a .liquid-glass class. This is used on the navbar, social icon buttons, NFT cards, and card overlays:



.liquid-glass {

  background: rgba(255, 255, 255, 0.01);

  background-blend-mode: luminosity;

  backdrop-filter: blur(4px);

  -webkit-backdrop-filter: blur(4px);

  border: none;

  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);

  position: relative;

  overflow: hidden;

}

.liquid-glass::before {

  content: '';

  position: absolute;

  inset: 0;

  border-radius: inherit;

  padding: 1.4px;

  background: linear-gradient(180deg,

    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,

    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,

    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);

  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;

  mask-composite: exclude;

  pointer-events: none;

}





TEXTURE OVERLAY



A full-screen fixed texture overlay sits on top of everything (z-50, pointer-events-none). It uses a /texture.png image with mix-blend-mode: lighten at opacity: 0.6, covering the entire viewport with background-size: cover.



SECTION 1: HERO (Full viewport)



Background: Full-bleed looping muted autoplaying video covering the entire section with object-cover



Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4



Container: max-w-[1831px] centered with responsive horizontal padding



Section has rounded-b-[32px] bottom corners, clipping the video



Header:



Left: "Orbis.Nft" logo text in Anton, 16px, uppercase



Center: Navigation bar with liquid-glass effect, rounded-[28px], px-[52px] py-[24px]. Contains 5 links: Homepage, Gallery, Buy NFT, FAQ, Contact. Each link is Anton 13px uppercase. Links have hover:text-neon transition. Nav is hidden on mobile (hidden lg:block).



Hero Content:



Large heading in Anton font, responsive sizing: 40px mobile / 60px sm / 75px md / 90px lg. Uppercase. leading-[1.05] mobile, leading-[1] tablet+. Max width 780px on desktop, offset with lg:ml-32.



Text reads:



Beyond earth

and ( its ) familiar boundaries





Overlaid cursive accent text "Nft collection" in Condiment font (24px-48px responsive), positioned absolute to the right side of the heading, slightly rotated (-rotate-1), in neon green (text-neon), with mix-blend-exclusion and opacity-90.



Social Icons (Desktop):



3 square buttons (56x56px) stacked vertically in top-right corner, each with liquid-glass and rounded-[1rem]. Icons: Mail, Twitter, Github from lucide-react (20x20px). hover:bg-white/10 transition.



Social Icons (Mobile):



Same 3 buttons but centered horizontally below the heading, shown only below lg breakpoint.



SECTION 2: ABOUT / INTRO (Full viewport)



Background: Full-bleed looping muted autoplaying video with object-cover



Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4



Container: Same max-w-[1831px] centered, with generous vertical padding (64px-96px responsive)



Top Row (flex row on desktop, column on mobile):



Left: Heading in Anton, responsive 32px-60px, uppercase:



Hello!

I'm orbis





With an overlaid "Orbis" in Condiment cursive, neon green, mix-blend-exclusion, 36px-68px responsive, positioned absolute at bottom-right of heading, slightly rotated.



Right: Short paragraph in monospace 14px-16px, uppercase, cream color, max-width 266px: "A digital object fixed beyond time and place. An exploration of distance, form, and silence in space"



Bottom Row (flex row, space-between):



Two columns (left and right), each containing 2 identical paragraphs. Same monospace text as above but at opacity-10 (nearly invisible, decorative). Right column hidden below lg. On mobile, text uses text-[#010828] (dark) so it's effectively invisible against the video.



SECTION 3: NFT COLLECTION GRID



Background: Solid #010828 (no video)



Container: Same max-w-[1831px] centered



Header Row:



Left: Heading in Anton, 32px-60px responsive, uppercase:



Collection of

  [indented] Space objects





Where "Space" is in Condiment cursive neon green, and "objects" is in Anton. The second line is indented with ml-12 / ml-24 / ml-32 responsive.



Right: A "SEE ALL CREATORS" button. "SEE" is large (32px-60px), "ALL" and "CREATORS" are stacked smaller (20px-36px) next to it. Below the text is a neon green bar (bg-neon, height 6px-10px responsive, full width of button).



NFT Card Grid:



3-column grid on desktop (lg:grid-cols-3), 2 on tablet, 1 on mobile. Gap 24px.



Each card: liquid-glass container with rounded-[32px], padding 18px, hover:bg-white/10 transition.



Inside each card: a square video container (pb-[100%] aspect ratio trick) with rounded-[24px] overflow hidden.



Video URLs:



https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_053923_22c0a6a5-313c-474c-85ff-3b50d25e944a.mp4 (Score: 8.7/10)



https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_054411_511c1b7a-fb2f-42ef-bf6c-32c0b1a06e79.mp4 (Score: 9/10)



https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055427_ac7035b5-9f3b-4289-86fc-941b2432317d.mp4 (Score: 8.2/10)



Each card has an overlay bar at the bottom: a liquid-glass bar with rounded-[20px], px-5 py-4, showing "RARITY SCORE:" label (11px, cream/70% opacity) and score value (16px). On the right side of the bar is a circular purple gradient button (48x48px, bg-gradient-to-br from-[#b724ff] to-[#7c3aed]) with a right-arrow chevron SVG inside, with shadow-lg shadow-purple-500/50 and hover:scale-110 transition.



SECTION 4: CTA / FINAL SECTION



Background: Full-width video (NOT object-cover, instead w-full h-auto block so it displays at native aspect ratio)



Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055729_72d66327-b59e-4ae9-bb70-de6ccb5ecdb0.mp4



Text Content (positioned absolute over the video):



Right-aligned block, offset with lg:pr-[20%] lg:pl-[15%]



Small "Go beyond" text in Condiment cursive, neon green, mix-blend-exclusion, positioned absolute at top-left of the heading block. Sizes: 17px-68px responsive.



Heading in Anton, responsive 16px-60px, uppercase:



JOIN US.

REVEAL WHAT'S HIDDEN.

DEFINE WHAT'S NEXT.

FOLLOW THE SIGNAL.





"JOIN US." has extra bottom margin (mb-4 to mb-12 responsive) before the remaining lines.



Social Icons (Bottom-left, absolute positioned):



Positioned at left-[8%], bottom-[12%] to bottom-[20%] with responsive breakpoints.



A vertical liquid-glass container with rounded-[0.5rem] to rounded-[1.25rem] responsive, containing 3 stacked icon buttons (Mail, Twitter, Github).



Buttons have responsive widths using viewport units and rem values (e.g., w-[14vw] sm:w-[14.375rem] md:w-[10.78125rem] lg:w-[16.77rem]) and similar responsive heights.



Buttons are separated by border-b border-white/10 dividers (except the last one).



KEY TECHNICAL DETAILS



Framework: React + TypeScript + Vite + Tailwind CSS



Icons: lucide-react (Mail, Twitter, Github)



No additional packages needed beyond what Vite + React + Tailwind provides



All videos: autoPlay loop muted playsInline attributes



Responsive: Mobile-first with sm:, md:, lg: breakpoints throughout



Max content width: 1831px across all sections



All text is uppercase except the Condiment cursive accents which are normal-case


---

# 032 Innovation

# Innovation

RECREATION PROMPT



Build a single-page landing site using React + TypeScript + Vite + Tailwind CSS + framer-motion + lucide-react. The entire page has a bg-black background. The font loaded via Google Fonts is Instrument Serif (italic and regular). Import it in index.css:





@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

LIQUID GLASS CSS (in index.css, inside @layer components)

Create a reusable .liquid-glass class used on every glass element:





.liquid-glass {

  background: rgba(255, 255, 255, 0.01);

  background-blend-mode: luminosity;

  backdrop-filter: blur(4px);

  -webkit-backdrop-filter: blur(4px);

  border: none;

  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);

  position: relative;

  overflow: hidden;

}



.liquid-glass::before {

  content: '';

  position: absolute;

  inset: 0;

  border-radius: inherit;

  padding: 1.4px;

  background: linear-gradient(

    180deg,

    rgba(255, 255, 255, 0.45) 0%,

    rgba(255, 255, 255, 0.15) 20%,

    rgba(255, 255, 255, 0) 40%,

    rgba(255, 255, 255, 0) 60%,

    rgba(255, 255, 255, 0.15) 80%,

    rgba(255, 255, 255, 0.45) 100%

  );

  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;

  mask-composite: exclude;

  pointer-events: none;

}

SECTION 1 -- HERO (full-viewport, in Index.tsx)

Full-screen (min-h-screen) container with overflow-hidden relative flex flex-col.



Background video: absolute, covers the entire viewport (absolute inset-0 w-full h-full object-cover object-bottom). URL:





https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4

Attributes: muted, autoPlay, playsInline, preload="auto". Starts at opacity: 0.



Video fade logic (vanilla JS via refs, no CSS transitions):



On canplay: play the video, then animate opacity from 0 to 1 over 500ms using requestAnimationFrame.

On timeupdate: when remaining time <= 0.55s, animate opacity from current to 0 over 500ms.

On ended: set opacity to 0, wait 100ms, reset currentTime to 0, play again, fade back to 1 over 500ms.

This creates a seamless loop with smooth crossfade to black between plays.

Navbar (relative z-20, px-6 py-6):



A liquid-glass rounded-full pill, max-w-5xl mx-auto, px-6 py-3, flex between left/right.

Left: Globe icon (24px, white) + "Asme" text (white, font-semibold, text-lg). Hidden on mobile: nav links "Features", "Pricing", "About" (text-white/80 hover:text-white text-sm font-medium, gap-8 ml-8).

Right: "Sign Up" text button (white, text-sm, font-medium) + "Login" button (liquid-glass rounded-full px-6 py-2, white text-sm font-medium).

Hero content (relative z-10, flex-1 flex flex-col items-center justify-center, px-6 py-12 text-center, -translate-y-[20%]):



Heading: text-7xl md:text-8xl lg:text-9xl, white, tracking-tight whitespace-nowrap, font-family 'Instrument Serif', serif. Text: Know it then <em className="italic">all</em>.

Email input: max-w-xl w-full. A liquid-glass rounded-full pill with pl-6 pr-2 py-2 flex items-center gap-3. Inside: transparent <input> with placeholder "Enter your email" (text-white placeholder:text-white/40). A white circular submit button (bg-white rounded-full p-3 text-black) containing ArrowRight icon (20px).

Subtitle: text-white text-sm leading-relaxed px-4. Text: "Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates."

Manifesto button: liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors.

Social icons footer (relative z-10, flex justify-center gap-4 pb-12):



Three liquid-glass rounded-full p-4 buttons for Instagram, Twitter, Globe icons (20px). text-white/80 hover:text-white hover:bg-white/5 transition-all.

SECTION 2 -- ABOUT SECTION (separate component AboutSection.tsx)

Uses framer-motion useInView (ref, { once: true, margin: "-100px" }).

bg-black pt-32 md:pt-44 pb-10 md:pb-14 px-6 overflow-hidden.

Subtle radial gradient overlay: bg-[radial-gradient(ellipse_at_top,\_rgba(255,255,255,0.03)\_0%,\_transparent_70%)].

Label: "About Us" -- text-white/40 text-sm tracking-widest uppercase. Animates: opacity: 0, y: 20 -> opacity: 1, y: 0, duration 0.6.

Heading: text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight. Animates: opacity: 0, y: 40 -> opacity: 1, y: 0, duration 0.8, delay 0.1. Text structure:

Pioneering then ideas (Instrument Serif italic, text-white/60) for

Line break (hidden on mobile)

minds that then create, build, and inspire. (all Instrument Serif italic, text-white/60)

SECTION 3 -- FEATURED VIDEO (separate component FeaturedVideoSection.tsx)

bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden. Max-w-6xl.

A rounded-3xl overflow-hidden aspect-video container that animates opacity: 0, y: 60 -> opacity: 1, y: 0, duration 0.9.

Video: w-full h-full object-cover, muted, autoPlay, loop, playsInline, preload="auto". URL:



https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4

Gradient overlay on video: bg-gradient-to-t from-black/60 via-transparent to-transparent.

Bottom overlay content (absolute bottom-0 left-0 right-0 p-6 md:p-10):

Flex row on desktop, column on mobile.

Left: a liquid-glass rounded-2xl p-6 md:p-8 max-w-md card. Label "Our Approach" (text-white/50 text-xs tracking-widest uppercase mb-3). Body text (text-white text-sm md:text-base leading-relaxed): "We believe in the power of curiosity-driven exploration. Every project starts with a question, and every answer opens a new door to innovation."

Right: "Explore more" button (liquid-glass rounded-full px-8 py-3, white text-sm font-medium) with whileHover={{ scale: 1.05 }} and whileTap={{ scale: 0.95 }}.

SECTION 4 -- PHILOSOPHY / INNOVATION x VISION (separate component PhilosophySection.tsx)

bg-black py-28 md:py-40 px-6 overflow-hidden. Max-w-6xl.

Heading: text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-16 md:mb-24. Animates opacity: 0, y: 40 -> opacity: 1, y: 0, duration 0.8. Text: Innovation then x in Instrument Serif italic text-white/40, then Vision.

Two-column grid (grid-cols-1 md:grid-cols-2 gap-8 md:gap-12):

Left: Video in rounded-3xl overflow-hidden aspect-[4/3]. Animates from opacity: 0, x: -40. URL:



https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4

muted, autoPlay, loop, playsInline, preload="auto".

Right: Animates from opacity: 0, x: 40. Two text blocks separated by a w-full h-px bg-white/10 divider.

Block 1: Label "Choose your space" (text-white/40 text-xs tracking-widest uppercase mb-4). Body (text-white/70 text-base md:text-lg leading-relaxed): "Every meaningful breakthrough begins at the intersection of disciplined strategy and remarkable creative vision. We operate at that crossroads, turning bold thinking into tangible outcomes that move people and reshape industries."

Block 2: Label "Shape the future". Body: "We believe that the best work emerges when curiosity meets conviction. Our process is designed to uncover hidden opportunities and translate them into experiences that resonate long after the first impression."

SECTION 5 -- SERVICES / WHAT WE DO (separate component ServicesSection.tsx)

bg-black py-28 md:py-40 px-6 overflow-hidden. Max-w-6xl.

Subtle radial gradient: bg-[radial-gradient(ellipse_at_center,\_rgba(255,255,255,0.02)\_0%,\_transparent_60%)].

Header row: flex between "What we do" (text-3xl md:text-5xl text-white tracking-tight) and "Our services" label (text-white/40 text-sm, hidden on mobile). Animates opacity: 0, y: 30 -> visible, duration 0.7.

Two-card grid (grid-cols-1 md:grid-cols-2 gap-6 md:gap-8):

Each card: liquid-glass rounded-3xl overflow-hidden with group class. Animates opacity: 0, y: 50 -> visible, duration 0.8, staggered by 0.15s.

Card video area: aspect-video, object-cover, transition-transform duration-700 group-hover:scale-105. Gradient overlay: bg-gradient-to-t from-black/40 to-transparent.

Card body (p-6 md:p-8): tag label (uppercase, tracking-widest, text-white/40 text-xs), ArrowUpRight icon in a liquid-glass rounded-full p-2 circle, title (text-white text-xl md:text-2xl mb-3 tracking-tight), description (text-white/50 text-sm leading-relaxed).

Card 1: Video URL:



https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4

Tag: "Strategy". Title: "Research & Insight". Description: "We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change."

Card 2: Video URL:



https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4

Tag: "Craft". Title: "Design & Execution". Description: "From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary."


---

# 033 FinFlow

# FinFlow


---

# 034 AI Automation Hero

# AI Automation Hero

Create a full-screen hero section with the following exact specifications:



Layout & Structure:

- Full viewport height (h-screen), full width, relative positioning with overflow-hidden
- Background color: #070612 (dark purple-black)
- Content aligned to the left side, vertically centered
- Max-width container (max-w-7xl) with horizontal padding (px-6 lg:px-12)

Background Video:

Video Source: HLS stream from https://stream.mux.com/s8pMcOvMQXc4GD6AX4e1o01xFogFxipmuKltNfSYza0200.m3u8

- Autoplaying, looping, muted video positioned absolutely behind content
- Video shifted 200px to the right (margin-left: 200px)
- Video scaled to 1.2x with origin-left, object-cover, full height
- Bottom fade gradient (h-40) from background color to transparent (z-10)

Badge (top element):

- Pill-shaped badge with rounded-full, border border-white/20, backdrop-blur-sm
- Contains a Sparkles icon (lucide-react, w-3 h-3, text-white/80)
- Text: "New AI Automation Ally" in text-sm font-medium text-white/80
- Animated with blur-in effect (0.6s duration, no delay)

Main Heading:

- Three lines of text:

  - Line 1: "Unlock the Power of AI" (block display)
  - Line 2: "for Your" (inline)
  - Line 3: "Business." in serif italic font (inline)
- Font sizes: text-4xl md:text-5xl lg:text-6xl
- Font weight: font-medium
- Line height: leading-tight lg:leading-[1.2]
- Color: white (text-foreground)
- Each word animates in with staggered split-text animation (0.08s delay between words, 0.6s duration, y: 40px -> 0, opacity: 0 -> 1)

Subtitle:

- Text: "Our cutting-edge AI platform automates, analyzes, and accelerates your workflows so you can focus on what really matters."
- Styling: text-white/80, text-lg, font-normal, leading-relaxed, max-w-xl
- Animated with blur-in effect (0.4s delay, 0.6s duration)

CTA Buttons (bottom):

- Two buttons side by side with gap-4, flex-wrap
- Primary button "Book A Free Call":

  - Solid white background (bg-foreground), dark text (text-background)
  - Rounded-full, px-5 py-3
  - Includes right arrow icon (ArrowRight from lucide-react)
  - Links to /book-call
- Secondary button "Learn now":

  - Semi-transparent background (bg-white/20), backdrop-blur-sm
  - Rounded-full, px-8 py-3
  - White text
- Both buttons animated with blur-in effect (0.6s delay, 0.6s duration)

Animations (using framer-motion):

- BlurIn component: opacity 0->1, blur 10px->0, y 20->0
- SplitText component: splits text by words, staggers each word's animation

Z-index layering:

- Video: z-0
- Bottom gradient: z-10
- Content: z-20

Spacing:

- 12-unit gap (gap-12) between badge/heading group and CTA buttons
- 6-unit gap (gap-6) between badge and heading, and between heading and subtitle


---

# 035 Bio-Digital-HERO（单首屏）

# Bio-Digital-HERO（单首屏）

Build a full-screen hero landing page for a fictional brand called "NeuralKinetics" using React, Vite, Tailwind CSS v4, and Framer Motion (the `motion` package). The page is a single-screen immersive experience with a fixed navbar, a fullscreen looping background video, a centered two-line headline, and a bottom information footer. White background, black text, no purple/violet colors anywhere. The aesthetic is ultra-minimal, luxury tech -- inspired by high-end agency sites.



---



## Tech Stack & Dependencies



- React 19, Vite 6, TypeScript
- Tailwind CSS v4 (using `@tailwindcss/vite` plugin, `@import "tailwindcss"` syntax, and `@theme` block -- NOT the old tailwind.config.js approach)
- `motion` package (Framer Motion v12+, imported as `motion/react`)
- `lucide-react` for the Plus icon
- Google Fonts: **Inter** (weights 400, 500, 600) for body text, **Outfit** (weights 300, 400, 500, 600, 700) as the display/heading font

---



## Fonts & CSS Setup (index.css)



```CSS
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", ui-sans-serif, system-ui, sans-serif;
  
  --color-brand-black: #000000;
  --color-brand-gray: #F5F5F7;
  --color-brand-text-muted: #6E6E73;
}

@layer base {
  body {
    @apply bg-white text-brand-black font-sans antialiased selection:bg-black selection:text-white;
  }
}
```



This gives us `font-sans` (Inter) and `font-display` (Outfit) as Tailwind utility classes.



---



## Page Structure (App.tsx)



The page is a single `div` with `relative min-h-screen w-full flex flex-col justify-between bg-white text-black font-sans antialiased selection:bg-black selection:text-white overflow-hidden`. It contains these layers in z-order:



### Layer 1: Fullscreen Background Video (z-0)



An absolutely positioned fullscreen container (`absolute inset-0 z-0 pointer-events-none select-none`) containing a `motion.div` that fades in and slightly scales down on load:

- `initial={{ opacity: 0, scale: 1.05 }}`
- `animate={{ opacity: 1, scale: 1 }}`
- `transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}`

Inside is a `<video>` element:

- **src**: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_061107_6567e617-ee84-4c3e-ac81-f2d9dda9121a.mp4`
- Attributes: `autoPlay`, `loop`, `muted`, `playsInline`
- Classes: `absolute inset-0 w-full h-full object-cover pointer-events-none`

### Layer 2: Hero Headline (z-10)



A `<main>` element (`flex-1 flex flex-col items-center justify-center px-6 md:px-12 relative z-10`) containing a centered text block:



- Outer wrapper: `text-center w-full max-w-7xl px-4 mt-24 md:mt-0 translate-y-10 md:translate-y-14`
- Inner `motion.div` with entrance animation:

  - `initial={{ opacity: 0, y: 15 }}`
  - `animate={{ opacity: 1, y: 0 }}`
  - `transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}`
  - Classes: `flex flex-col items-center justify-center select-none`

**Line 1 (h1):** "NeuralKinetics"

- Classes: `font-display text-[7.5vw] md:text-[5.8vw] lg:text-[4.6vw] font-medium tracking-tight text-black leading-[0.9]`

**Line 2 (h2):** "cybernetics made organic"

- Same responsive font sizes as h1, same `leading-[0.9]`, with `mt-1 md:mt-1.5`
- "cybernetics" is a `<span>` with `text-black/25 font-light tracking-tight mr-1.5 md:mr-2` (very faded, light weight)
- "made organic" is a `<span>` with `text-black font-medium tracking-tight` (full black, medium weight)

### Layer 3: Fixed Navbar (z-50)



A `motion.nav` fixed at top, full width, with entrance animation:

- `initial={{ y: -16, opacity: 0 }}`
- `animate={{ y: 0, opacity: 1 }}`
- `transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}`
- Classes: `fixed top-0 left-0 w-full p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-50 pointer-events-none`

**Left side** (`flex flex-wrap items-center gap-3 pointer-events-auto`):



1. **Logo + Brand Name**: A div with `flex items-center gap-1`, containing:

   - A custom SVG logo icon (40x40 viewBox, two black rounded rectangles rotated -35 degrees to form a slanted dual-capsule shape):Classes: `w-10 h-10 text-black translate-y-[1px]`
   
     ```Plain Text
     <rect x="7" y="19" width="15" height="5.5" rx="2.75" transform="rotate(-35 7 19)" />
     <rect x="17.5" y="24" width="15" height="5.5" rx="2.75" transform="rotate(-35 17.5 24)" />
     ```
   - Text "NeuralKinetics" with `font-display font-medium tracking-tight text-[18px] text-black`
2. **Menu Pill Button**: A black pill button with a white circle containing a Plus icon:

   - Outer button: `flex items-center bg-black hover:bg-zinc-800 text-white p-1 pr-5 gap-2.5 rounded-full transition-all duration-200 cursor-pointer text-[12px] font-medium border border-black/[0.03]`
   - Inner white circle: `w-9 h-9 rounded-full bg-white text-black flex items-center justify-center` containing `<Plus size={13} strokeWidth={3} />` from lucide-react
   - Text "Menu" with `text-[11.5px] pr-1`
3. **Metadata Info Pill** (hidden on mobile, `hidden md:flex`):

   - `items-center bg-[#F4F4F6] border border-black/[0.03] rounded-full px-6 h-11 select-none text-[11.5px] font-normal text-black/60 gap-5`
   - Contains two spans: "Advanced Bionics" and "Cognitive AI"

**Right side** (`pointer-events-auto flex items-center`):



1. **Adaptive Systems Pill**: A light gray compound pill:

   - Outer: `flex items-center bg-[#F4F4F6] hover:bg-[#EAEAEF] transition-colors rounded-full p-1 pr-6 gap-3.5 border border-black/[0.03]`
   - Contains a black circle button (`w-9 h-9 rounded-full bg-black text-white`) with a custom 4-node clover SVG icon (24x24 viewBox, 4 filled circles at cardinal points connected by crosshair lines at 0.6 opacity, center unfilled circle)
   - Text "Adaptive Systems" with `text-[11px] font-medium text-black/70 select-none`

### Layer 4: Footer (z-30)



A footer with `w-full relative z-30 px-8 py-10 md:px-16 md:py-14 bg-gradient-to-t from-white via-white/80 to-transparent` creating a fade-up from white at the bottom.



Inner `motion.div`:

- `initial={{ y: 20, opacity: 0 }}`
- `animate={{ y: 0, opacity: 1 }}`
- `transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}`
- Classes: `max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8`

Contains three elements in a row (on desktop):



1. **Left text block** (`max-w-[300px] md:max-w-[340px]`):

   - Label: "Autonomous Dynamics" at `text-[11.5px] font-medium text-black/50`
   - Body: "Unifying biological grace with machine intelligence to design the next era of fusion" at `text-[19px] md:text-[21px] font-normal text-black leading-[1.15] tracking-tight`
2. **Vertical divider** (desktop only): `hidden lg:block w-px h-16 bg-black/[0.08]`
3. **Tag buttons** (`flex flex-wrap gap-2.5`):

   - Three buttons: "Neuromorphic", "AGI", "Cybernetics"
   - Each: `px-6 py-3.5 border border-black/15 hover:border-black text-black text-[11.5px] font-normal rounded-full bg-white hover:bg-black hover:text-white transition-all duration-300 cursor-pointer active:scale-95`

---



## Key Design Details



- **Easing curve used everywhere**: `[0.16, 1, 0.3, 1]` -- a smooth, slightly springy deceleration
- **Color palette**: Pure black (#000), white (#FFF), light gray (#F4F4F6, #EAEAEF), muted text at various black opacities (25%, 50%, 60%, 70%)
- **No purple/indigo/violet anywhere**
- **Typography scale**: Responsive vw-based sizes for the hero (7.5vw mobile, 5.8vw tablet, 4.6vw desktop), pixel-based for UI elements (11px-21px range)
- **All pill-shaped UI elements** use `rounded-full`
- **Selection highlight**: black background, white text (`selection:bg-black selection:text-white`)
- **The background video** plays behind everything, fills the viewport with `object-cover`, and has a subtle scale-down entrance animation
- **Footer gradient** fades from transparent at top to solid white at bottom, ensuring text readability over the video


---

# 036 Shamoni

# Shamoni

Build an immersive, highly interactive, scroll-driven landing page using React, Vite, Tailwind CSS (v4), and `motion/react` (Framer Motion). 



Please set up the application with the exact files, dependencies, URLs, CSS variables, and mathematical Framer Motion values provided below.



### Setup & Dependencies

Install the following libraries:

`npm install motion react react-dom lucide-react`

`npm install -D tailwindcss @tailwindcss/vite`



Ensure Tailwind V4 is correctly initialized via `@tailwindcss/vite` in `vite.config.ts`.



---



### 1. Global Styles (`src/index.css`)

Import the necessary Google Fonts and set up the Tailwind V4 `@theme` overrides:



```CSS
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600&family=Great+Vibes&display=swap');
@import "tailwindcss";

@theme {
  --font-serif: "Instrument Serif", serif;
  --font-sans: "Manrope", sans-serif;
  --font-script: "Great Vibes", cursive;
}
2. Orbit Images Component Styles (src/components/OrbitImages.css)
This CSS provides the absolute positioning offsets for our custom rotation gallery.

code
CSS
.orbit-container {
  position: relative;
  margin-left: auto;
  margin-right: auto;
}

.orbit-scaling-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.orbit-scaling-container--responsive {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center center;
}

.orbit-rotation-wrapper {
  width: 100%;
  height: 100%;
  transform-origin: center center;
  position: relative;
}

.orbit-path-svg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orbit-item {
  position: absolute;
  will-change: transform;
  user-select: none;
}

.orbit-center-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.orbit-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%; 
}
3. Orbit Images React Component (src/components/OrbitImages.tsx)
Create this mathematically precise component that maps motion paths over SVG strings using offsetPath and offsetDistance. It accepts Framer Motion MotionValues as overrides to allow the parent App.tsx to infinitely control its radius, spread, item size, and rotation during scroll.

code
Tsx
// @ts-nocheck
import { useMemo, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useMotionTemplate } from 'motion/react';
import './OrbitImages.css';

function generateEllipsePath(cx, cy, rx, ry) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function generateCirclePath(cx, cy, r) {
  return generateEllipsePath(cx, cy, r, r);
}

function generateSquarePath(cx, cy, size) {
  const h = size / 2;
  return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
}

function generateRectanglePath(cx, cy, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
}

function generateTrianglePath(cx, cy, size) {
  const height = (size * Math.sqrt(3)) / 2;
  const hs = size / 2;
  return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
}

function generateStarPath(cx, cy, outerR, innerR, points) {
  const step = Math.PI / points;
  let path = '';
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path + ' Z';
}

function generateHeartPath(cx, cy, size) {
  const s = size / 30;
  return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
}

function generateInfinityPath(cx, cy, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
}

function generateWavePath(cx, cy, w, amplitude, waves) {
  const pts = [];
  const segs = waves * 20;
  const hw = w / 2;
  for (let i = 0; i <= segs; i++) {
    const x = cx - hw + (w * i) / segs;
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  for (let i = segs; i >= 0; i--) {
    const x = cx - hw + (w * i) / segs;
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(`L ${x} ${y}`);
  }
  return pts.join(' ') + ' Z';
}

function OrbitItem({ item, index, totalItems, pathValue, itemSizeValue, rotationValue, progress, fill, scaleStrength, focalPoint = 50 }) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;

  const offsetPercentage = useTransform(progress, (p) => {
    return (((p + itemOffset) % 100) + 100) % 100;
  });

  const offsetDistance = useTransform(offsetPercentage, (p) => `${p}%`);

  const itemScale = useTransform(() => {
    const rawPos = offsetPercentage.get();
    const strength = scaleStrength ? scaleStrength.get() : 0;
    
    let dist = Math.abs(rawPos - focalPoint);
    if (dist > 50) dist = 100 - dist;

    let targetScale = 1;
    if (dist < 20) {
      const ratio = dist / 20;
      const cosCurve = (Math.cos(ratio * Math.PI) + 1) / 2;
      targetScale = 0.4 + (cosCurve * 0.6);
    } else {
      targetScale = 0.4;
    }

    return 1 - strength * (1 - targetScale);
  });

  const offsetPath = useMotionTemplate`path("${pathValue}")`;

  return (
    <motion.div
      className="orbit-item"
      style={{
        width: itemSizeValue,
        height: itemSizeValue,
        offsetPath,
        offsetRotate: '0deg',
        offsetAnchor: 'center center',
        offsetDistance,
        scale: itemScale,
        zIndex: useTransform(itemScale, s => Math.round(s * 100)),
        pointerEvents: 'auto'
      }}
    >
      <motion.div style={{ transform: useTransform(rotationValue, r => `rotate(${-r}deg)`), width: '100%', height: '100%' }}>{item}</motion.div>
    </motion.div>
  );
}

export default function OrbitImages({
  images = [],
  altPrefix = 'Orbiting image',
  shape = 'ellipse',
  customPath,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = 'normal',
  fill = true,
  width = 100,
  height = 100,
  className = '',
  showPath = false,
  pathColor = 'rgba(0,0,0,0.1)',
  pathWidth = 2,
  easing = 'linear',
  paused = false,
  centerContent,
  responsive = false,
  progressOverride,
  radiusXOverride,
  radiusYOverride,
  itemSizeOverride,
  rotationOverride,
  translateXOverride,
  focusStrength,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const designCenterX = baseWidth / 2;
  const designCenterY = baseWidth / 2;

  const currentRadiusX = radiusXOverride || useMotionValue(radiusX);
  const currentRadiusY = radiusYOverride || useMotionValue(radiusY);
  const currentItemSize = itemSizeOverride || useMotionValue(itemSize);
  const currentRotation = rotationOverride || useMotionValue(rotation);
  const currentTranslateX = translateXOverride || useMotionValue(0);

  const pathValue = useTransform([currentRadiusX, currentRadiusY], ([rx, ry]) => {
    switch (shape) {
      case 'circle': return generateCirclePath(designCenterX, designCenterY, rx);
      case 'ellipse': return generateEllipsePath(designCenterX, designCenterY, rx, ry);
      case 'square': return generateSquarePath(designCenterX, designCenterY, rx * 2);
      case 'rectangle': return generateRectanglePath(designCenterX, designCenterY, rx * 2, ry * 2);
      case 'triangle': return generateTrianglePath(designCenterX, designCenterY, rx * 2);
      case 'star': return generateStarPath(designCenterX, designCenterY, rx, rx * starInnerRatio, starPoints);
      case 'heart': return generateHeartPath(designCenterX, designCenterY, rx * 2);
      case 'infinity': return generateInfinityPath(designCenterX, designCenterY, rx * 2, ry * 2);
      case 'wave': return generateWavePath(designCenterX, designCenterY, rx * 2, ry, 3);
      case 'custom': return customPath || generateCirclePath(designCenterX, designCenterY, rx);
      default: return generateEllipsePath(designCenterX, designCenterY, rx, ry);
    }
  });

  useEffect(() => {
    if (!responsive || !containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [responsive, baseWidth]);

  const internalProgress = useMotionValue(0);

  useEffect(() => {
    if (paused || progressOverride) return;
    const controls = animate(internalProgress, direction === 'reverse' ? -100 : 100, {
      duration,
      ease: easing,
      repeat: Infinity,
      repeatType: 'loop',
    });
    return () => controls.stop();
  }, [internalProgress, duration, easing, direction, paused, progressOverride]);

  const activeProgress = progressOverride || internalProgress;
  const containerWidth = responsive ? '100%' : (typeof width === 'number' ? width : '100%');
  const containerHeight = responsive ? 'auto' : (typeof height === 'number' ? height : (typeof width === 'number' ? width : 'auto'));

  const items = images.map((src, index) => (
    <motion.img
      key={src}
      src={src}
      alt={`${altPrefix} ${index + 1}`}
      draggable={false}
      className="orbit-image"
      whileHover={{ scale: 1.2 }}
      transition={{ duration: 0.3 }}
      style={{ cursor: "pointer", pointerEvents: "auto" }}
    />
  ));

  return (
    <div ref={containerRef} className={`orbit-container ${className}`} style={{ width: containerWidth, height: containerHeight, aspectRatio: responsive ? '1 / 1' : undefined }} aria-hidden="true">
      <div className={responsive ? 'orbit-scaling-container orbit-scaling-container--responsive' : 'orbit-scaling-container'} style={{ width: responsive ? baseWidth : '100%', height: responsive ? baseWidth : '100%', transform: responsive ? `translate(-50%, -50%) scale(${scale})` : undefined }}>
        <motion.div className="orbit-rotation-wrapper" style={{ rotate: currentRotation, x: currentTranslateX }}>
          {showPath && (
             <svg width="100%" height="100%" viewBox={`0 0 ${baseWidth} ${baseWidth}`} className="orbit-path-svg">
              <path d={pathValue.get()} fill="none" stroke={pathColor} strokeWidth={pathWidth / scale} />
            </svg>
          )}
          {items.map((item, index) => (
            <OrbitItem key={index} item={item} index={index} totalItems={items.length} pathValue={pathValue} itemSizeValue={currentItemSize} rotationValue={currentRotation} progress={activeProgress} fill={fill} scaleStrength={focusStrength} focalPoint={50} />
          ))}
        </motion.div>
      </div>
      {centerContent && <div className="orbit-center-content">{centerContent}</div>}
    </div>
  );
}
4. Main Page App Component (src/App.tsx)
Implement the exact layout, UI timelines (scrollYProgress transforms), background <video>, typography mask, and the heavily orchestrated Framer Motion timeline values. Do not change any numbers in the arrays.

code
Tsx
import { motion, useMotionTemplate, useScroll, useTransform, useAnimationFrame, useMotionValue } from 'motion/react';
import { useRef } from 'react';
import OrbitImages from './components/OrbitImages';

const orbitImagesData = [
  "https://res.cloudinary.com/daklr2whx/image/upload/v1776966860/202604232047_gxyqne.jpg",
  "https://res.cloudinary.com/daklr2whx/image/upload/v1776966856/202604232052_ihyslg.jpg",
  "https://res.cloudinary.com/daklr2whx/image/upload/v1776966299/15112343_tuzrbg.jpg",
  "https://res.cloudinary.com/daklr2whx/image/upload/v1776966299/202604232043_vhb6u9.jpg",
  "https://res.cloudinary.com/daklr2whx/image/upload/v1776967124/02604232058_nh1qd1.jpg",
  "https://res.cloudinary.com/daklr2whx/image/upload/v1776967611/202604232105_lv3fhp.jpg",
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const rx = useTransform(scrollYProgress, [0, 0.08, 1], ["0%", "55%", "55%"]);
  const ry = useTransform(scrollYProgress, [0, 0.08, 1], ["0%", "55%", "55%"]);
  const clipPath = useMotionTemplate`ellipse(${rx} ${ry} at 50% 50%)`;

  const textOpacity = useTransform(scrollYProgress, [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1], [0, 1, 1, 0, 0, 1, 1]);
  const textBlurVal = useTransform(scrollYProgress, [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1], [15, 0, 0, 15, 15, 0, 0]);
  const filterText = useMotionTemplate`blur(${textBlurVal}px)`;
  const yElement = useTransform(scrollYProgress, [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1], [20, 0, 0, 20, 20, 0, 0]);

  const targetRadius = 650;
  
  const orbitItemSize = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [80, 520, 520, 80, 80]);
  const orbitRx = useTransform(scrollYProgress,       [0.15, 0.25, 0.85, 0.95, 1], [330, targetRadius, targetRadius, 330, 330]);
  const orbitRy = useTransform(scrollYProgress,       [0.15, 0.25, 0.85, 0.95, 1], [140, targetRadius, targetRadius, 140, 140]);
  const orbitRotation = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [-15, 0, 0, -15, -15]);
  const orbitTx = useTransform(scrollYProgress,       [0.15, 0.25, 0.85, 0.95, 1], [0, -targetRadius, -targetRadius, 0, 0]);
  const focusStrength = useTransform(scrollYProgress, [0.15, 0.25, 0.85, 0.95, 1], [0, 1, 1, 0, 0]);

  const orbitProgress = useMotionValue(0);
  const prevScroll = useRef(0);

  useAnimationFrame((time, delta) => {
     const pos = scrollYProgress.get();
     const scrollDelta = pos - prevScroll.current;
     prevScroll.current = pos;

     let frameSpeed = 0;
     if (pos > 0.15 && pos < 0.85) {
        frameSpeed = (scrollDelta * 200); 
     } else {
        frameSpeed = (delta / 1000) * 2.5; 
     }

     orbitProgress.set(orbitProgress.get() + frameSpeed);
  });

  return (
    <div ref={containerRef} className="relative w-full h-[600vh] bg-black">
      <div className="sticky top-0 w-full h-screen overflow-hidden text-white">
        
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="https://res.cloudinary.com/daklr2whx/video/upload/v1776960333/a_kitten_drinks_202604231827_apoc3w.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/10 z-0"></div>

        <div className="absolute z-10 w-[80vw]" style={{ left: '3vw', bottom: '3vw' }}>
          <svg viewBox="0 10 350 72" className="w-full h-auto drop-shadow-2xl overflow-visible" preserveAspectRatio="xMinYMax meet">
            <text x="-3" y="80" fontFamily="'Instrument Serif', serif" fill="#FDFFB7" className="select-none">
              <tspan fontSize="90">Shamoni</tspan>
              <tspan fontSize="28.8" dx="4" dy="-40">©</tspan>
            </text>
          </svg>
        </div>

        <motion.div 
          className="absolute z-20 flex items-center justify-center overflow-hidden"
          style={{ clipPath, rotate: -15, width: '150vw', height: '150vh', left: '-25vw', top: '-25vh' }}
        >
          <div className="absolute inset-0 bg-white" />
          <div className="relative flex flex-col items-center justify-center" style={{ width: '100vw', height: '100vh', transform: 'rotate(15deg)' }}>
            <motion.div className="w-[90vw] max-w-[1200px] aspect-square relative z-0">
              <OrbitImages
                images={orbitImagesData}
                shape="ellipse"
                direction="normal"
                duration={40}
                fill={true}
                showPath={false}
                responsive={true}
                baseWidth={800}
                progressOverride={orbitProgress}
                radiusXOverride={orbitRx}
                radiusYOverride={orbitRy}
                itemSizeOverride={orbitItemSize}
                rotationOverride={orbitRotation}
                translateXOverride={orbitTx}
                focusStrength={focusStrength}
              />
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute inset-0 z-[60] pointer-events-none">
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
              <motion.div 
                className="flex flex-col items-center whitespace-nowrap pointer-events-auto"
                style={{ filter: filterText, opacity: textOpacity, WebkitFontSmoothing: 'antialiased', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
              >
                <div className="flex items-baseline text-black leading-none mb-1">
                  <span className="font-serif text-[45px] md:text-[55px] italic tracking-tight text-black">M</span>
                  <span className="font-serif text-[45px] md:text-[55px] tracking-tight text-black">aster the Elements</span>
                </div>
                <span className="font-sans text-[28px] md:text-[36px] tracking-tight text-black mt-[-5px]">embrace</span>
              </motion.div>
            </div>

            <motion.div 
              className="absolute top-32 right-[calc(6vw+150px)] md:right-[214px] flex flex-col items-start text-left pointer-events-auto cursor-text"
              style={{ y: yElement, filter: filterText, opacity: textOpacity }}
            >
              <span className="font-serif text-[40px] leading-none mb-3 text-black">2K26</span>
              <span className="font-serif text-[16px] uppercase tracking-widest text-black leading-[20px] text-left">
                JOIN AN EXCLUSIVE<br />COMMUNITY
              </span>
            </motion.div>

            <motion.div 
              className="absolute bottom-8 left-8 md:bottom-16 md:left-16 flex flex-col items-start text-black pointer-events-auto cursor-text"
              style={{ y: yElement, filter: filterText, opacity: textOpacity }}
            >
              <span className="font-serif text-[40px] leading-none mb-1 text-black">0651</span>
              <span className="font-serif text-[16px] uppercase tracking-widest text-black">COLLECTION</span>
            </motion.div>

            <div className="absolute bottom-16 right-[6vw] md:right-[10vw] flex flex-col items-start z-10 pointer-events-auto">
              <motion.p 
                className="font-serif text-[16px] uppercase tracking-widest text-black leading-[20px] mb-6 text-left w-[240px] cursor-text"
                style={{ y: yElement, filter: filterText, opacity: textOpacity }}
              >
                JOIN AN EXCLUSIVE COMMUNITY OF SAILORS. WHETHER YOU CRAVE THE THRILL OF THE OPEN
              </motion.p>
              <motion.div className="flex gap-0 pointer-events-auto items-center" style={{ y: yElement, filter: filterText, opacity: textOpacity }}>
                <button className="bg-black hover:bg-black/90 transition-colors text-white rounded-[40px] px-8 py-3.5 font-serif tracking-[0.1em] uppercase text-[12px] md:text-[14px] z-10">
                  BUY COLLECTION
                </button>
                <button className="bg-black hover:bg-black/90 transition-colors w-[46px] h-[46px] flex items-center justify-center rounded-[50%] text-white -ml-2 z-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </motion.div>
            </div>
        </div>

        <motion.header 
          className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-[100] pointer-events-none"
          style={{ opacity: textOpacity, filter: filterText }}
        >
          <div className="flex items-start text-black select-none leading-none pointer-events-auto" style={{ fontFamily: "'Instrument Serif', serif", WebkitFontSmoothing: "antialiased" }}>
            <span style={{ fontSize: '40px' }}>Shamoni</span>
            <span style={{ fontSize: '14px', marginLeft: '4px', marginTop: '4px' }}>©</span>
          </div>

          <button className="group relative flex items-center justify-center w-[72px] h-[44px] hover:scale-105 transition-transform duration-300 cursor-pointer pointer-events-auto" aria-label="Menu">
            <div className="absolute inset-0 bg-black rounded-[50%] -rotate-15"></div>
            <svg className="relative z-10" width="24" height="10" viewBox="0 0 24 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H23M1 9H23" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </motion.header>

      </div>
    </div>
  );
}
```


---

# 037 Velorix IIC

# Velorix IIC

## File: `src/App.tsx`



```TypeScript
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const BG_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4";

const NAV_ITEMS = ['Platform', 'How it works', 'AI Defense', 'Connections', 'Insights'];

function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300"
      style={{ backgroundColor: open ? '#1a1a1a' : 'transparent' }}
      aria-label="Toggle menu"
    >
      <span
        className="absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ opacity: open ? 0 : 1, transform: open ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)' }}
      >
        <Menu size={20} color="white" strokeWidth={1.5} />
      </span>
      <span
        className="absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ opacity: open ? 1 : 0, transform: open ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)' }}
      >
        <X size={20} color="white" strokeWidth={1.5} />
      </span>
    </button>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 z-30 lg:hidden transition-all duration-500"
        style={{
          backdropFilter: open ? 'blur(12px)' : 'blur(0px)',
          backgroundColor: open ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      <div
        className="fixed top-0 left-0 right-0 z-40 lg:hidden overflow-hidden"
        style={{
          maxHeight: open ? '420px' : '0px',
          transition: 'max-height 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <div
          className="pt-20 pb-6 px-5"
          style={{ backgroundColor: 'rgba(8,8,8,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item}
                href="#"
                onClick={onClose}
                className="text-white/70 hover:text-white text-base py-3 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 flex items-center justify-between group"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  transitionDelay: open ? `${i * 50 + 80}ms` : '0ms',
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(-8px)',
                  transition: `opacity 0.4s cubic-bezier(0.23,1,0.32,1) ${i * 50 + 80}ms, transform 0.4s cubic-bezier(0.23,1,0.32,1) ${i * 50 + 80}ms, color 0.2s, background 0.2s`,
                }}
              >
                {item}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-40 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
              </a>
            ))}
          </div>

          <div
            className="mt-5 pt-5"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              transitionDelay: open ? '360ms' : '0ms',
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0)' : 'translateY(-8px)',
              transition: `opacity 0.4s cubic-bezier(0.23,1,0.32,1) 360ms, transform 0.4s cubic-bezier(0.23,1,0.32,1) 360ms`,
            }}
          >
            <button
              className="w-full py-3 rounded-full text-black text-sm font-medium transition-all duration-300 hover:opacity-80"
              style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff' }}
            >
              Join the wait
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 lg:px-10 lg:py-6">
        <span className="text-white text-xl font-semibold tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
          velorix
        </span>
        <div className="hidden lg:flex items-center gap-1 rounded-full px-2 py-1.5" style={{ backgroundColor: '#0C0C0C' }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#"
              className="text-white/80 hover:text-white text-sm px-4 py-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
          <button
            className="hidden lg:block text-sm font-medium px-5 py-2 rounded-full text-black transition-all duration-300 hover:opacity-80"
            style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff' }}
          >
            Join the wait
          </button>
        </div>
      </nav>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black" style={{ fontFamily: 'Inter, sans-serif' }}>
      <video
        className="absolute inset-0 z-0 w-full h-full object-cover"
        src={BG_VIDEO}
        autoPlay
        loop
        muted
        playsInline
      />

      <Navbar />

      <div className="relative z-20 flex flex-col items-center text-center pt-[90px] md:pt-[120px] px-5 sm:px-8">
        <h1
          className="text-white font-normal leading-[1.12] tracking-tight max-w-3xl"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(1.75rem, 5vw, 2.6rem)',
          }}
        >
          Where precision finds its edge
          <br className="hidden sm:block" />
          {' '}and vision rewrites what comes next
        </h1>

        <p
          className="mt-5 md:mt-6 text-white/60 text-sm md:text-base leading-relaxed max-w-xs sm:max-w-sm md:max-w-md"
          style={{ fontFamily: "'Courier New', Courier, monospace", letterSpacing: '0.01em' }}
        >
          a seamless bridge - where raw ambition
          <br className="hidden sm:block" />
          {' '}and machine clarity converge as one
        </p>

        <button
          className="mt-7 md:mt-8 flex items-center gap-2.5 px-5 py-2.5 rounded-full text-black text-sm font-medium transition-all duration-300 hover:opacity-80 group"
          style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff' }}
        >
          Watch it unfold
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
```



## Assets



**Background video URL (verbatim):**

```Plain Text
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4
```



## Icons (from `lucide-react`)



Used via the `<Menu>`, `<X>`, and `<ArrowRight>` components. These are imported from the `lucide-react` npm package — the SVG path data is not inlined in this codebase; it ships inside the package. The three icons are rendered with:



- `<Menu size={20} color="white" strokeWidth={1.5} />`
- `<X size={20} color="white" strokeWidth={1.5} />`
- `<ArrowRight size={15} />` (hero button) and `<ArrowRight size={14} />` (mobile menu links)

## Dependencies (`package.json`)



```JSON
{
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```



## Animation values (all CSS, no Framer Motion)



**Hamburger icon crossfade** — `duration: 0.3s`, `ease: cubic-bezier(0.23,1,0.32,1)`; Menu icon `opacity 1→0`, `transform rotate(0deg) scale(1) → rotate(-90deg) scale(0.5)`; X icon inverse.



**Mobile menu backdrop** — `duration: 0.5s`; `backdropFilter blur(0px) → blur(12px)`; `background rgba(0,0,0,0) → rgba(0,0,0,0.6)`.



**Mobile menu panel** — `max-height: 0px → 420px`, `duration: 0.5s`, `ease: cubic-bezier(0.23, 1, 0.32, 1)`.



**Mobile menu link stagger** — each item `duration: 0.4s`, `ease: cubic-bezier(0.23,1,0.32,1)`, `delay: i * 50 + 80ms` (80, 130, 180, 230, 280); `opacity 0 → 1`, `transform translateY(-8px) → translateY(0)`.



**Mobile menu CTA** — `duration: 0.4s`, `ease: cubic-bezier(0.23,1,0.32,1)`, `delay: 360ms`.



**Hero button arrow** — hover `translate-x-0.5`, `duration: 0.2s`.



No Supabase persistence is used on this marketing section — it's presentational only, and nothing on this hero is user-specific or stateful across sessions.


---

# 038 Synapse Dark Hero

# Synapse Dark Hero

Build a high-fidelity, dark-themed Hero Section using React, Tailwind CSS, and Framer Motion. The background should be solid black (#000000).



1. Structure & Layout:

Navbar: Fixed at the top with a blurred glass effect.



Logo: Text "Synapse" (font-medium, tracking-tight, white).



Links: Features (active state with gradient border), Insights, About, Case Studies (strikethrough style), Contact.



CTA: "Get Started for Free" (White/Gray gradient button).



Hero Content: Centered text container (z-10, relative).



Badges: Row of 3 glass-effect badges "Integrated with" + Icon.



Headline: "Where Innovation Meets Execution" (Large \~80px font, tight tracking, fade-in animation).



Subtext: 2-line description about testing and deployment.



Buttons:



"Get Started for Free" (Solid Black background, White border).



"Let's Get Connected" (Transparent glass style).



Logo Marquee: A static row of grayscale, 40% opacity logos (use placeholder SVGs) at the bottom.



1. Background Video (Crucial):

Source: https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8



Implementation: Create a memoized VideoPlayer component using hls.js to handle the .m3u8 stream. Ensure proper cleanup on unmount.



Styling: 100% Opacity (no dark overlays), playing in loop/muted/autoplay.



Positioning: The video container should have a height of 80vh and be positioned absolute bottom-[35vh], sitting effectively "floating" behind the text content but pushed up from the bottom edge.



1. Animations:

Use motion/react to apply staggered fade-in-up animations to the badges, headline, subtitle, and buttons on load.


---

# 039 No-Code Waitlist

# No-Code Waitlist

Build a full-screen dark hero section landing page in React + Vite + Tailwind CSS v4 + Motion (framer-motion) + Lucide React icons + hls.js. The page should be a single screen (100vh, no scroll) with a black background, a fullscreen background video, a glassmorphism navbar, and a centered hero with an email capture CTA.

> **Dependencies:** `react`, `react-dom`, `motion`, `hls.js`, `lucide-react`, `tailwindcss` v4 with `@tailwindcss/vite`, `@vitejs/plugin-react`
> 
> **Fonts:** Import Google Fonts:
> 
> - `Inter` (weights 300, 400, 500, 600) -- used as the base sans-serif font
> - `Instrument Serif` (regular and italic) -- used for the hero heading
> - **CSS (`index.css`):**
> - Import both Google Font URLs, then `@import "tailwindcss";`
> - Set `@theme { --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif; }`
> - `:root` variables: `--background: #000000; --foreground: #ffffff;`
> - `body`: background-color var(--background), color var(--foreground), font-family var(--font-sans), `-webkit-font-smoothing: antialiased`, `letter-spacing: -0.01em`
> - `.liquid-glass` class: `background: rgba(255,255,255,0.01)`, `background-blend-mode: luminosity`, `backdrop-filter: blur(4px)`, `-webkit-backdrop-filter: blur(4px)`, `border: none`, `box-shadow: inset 0 1px 1px rgba(255,255,255,0.1)`, `position: relative`, `overflow: hidden`. It has a `::before` pseudo-element for a gradient border effect: `padding: 1.4px`, `background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%)`, masked with `-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)` and `-webkit-mask-composite: xor; mask-composite: exclude;`
> - `.glass-pill` class: `background: rgba(255,255,255,0.04)`, `backdrop-filter: blur(16px) saturate(180%)`, `border-radius: 9999px`, `box-shadow: none !important`
> - **Background Video component:**
> - Renders an absolutely positioned `<div>` covering the full parent (`absolute inset-0 overflow-hidden pointer-events-none`)
> - Contains a `<video>` element: `autoPlay`, `muted`, `loop`, `playsInline`, classes `w-full h-full object-cover opacity-100`
> - Video source URL: `https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8` (this is an HLS stream from Mux, NOT CloudFront)
> - Uses `hls.js`: if the browser natively supports HLS (`video.canPlayType("application/vnd.apple.mpegurl")`), set `video.src` directly; otherwise instantiate `new Hls()`, `loadSource`, `attachMedia`
> - **Navbar component:**
> - Animates in with `motion.nav`: `initial={{ y: -20, opacity: 0 }}`, `animate={{ y: 0, opacity: 1 }}`
> - Classes: `relative z-20 px-6 py-6 w-full`
> - Inner container: `liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto`
> - Left side (`flex items-center gap-8`):
> 
>   - Logo: `Globe` icon from lucide-react (w-6 h-6 text-white) + "Asme" text (`text-white font-semibold text-lg`), in a `flex items-center gap-2` wrapper
>   - Nav links: "Features", "Pricing", "About" -- hidden on mobile (`hidden md:flex`), `items-center gap-8 text-white/80 text-sm font-medium`, each link has `hover:text-white transition-colors duration-300`
> - Right side (`flex items-center gap-4`):
> 
>   - "Sign Up" plain text button: `text-white hover:text-white/80 transition-colors text-sm font-medium cursor-pointer`
>   - "Login" glassmorphism button: `liquid-glass rounded-full px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer`
> - **Hero component:**
> - `<section>` with `relative flex-1 flex flex-col items-center justify-center px-6`
> - Content wrapper: `relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center justify-center w-full gap-12`
> - **Tagline** (motion.p): text "BUILD A NO-CODE AI APP IN MINUTES", `text-white/80 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase mb-4`, animates `initial={{ opacity: 0, y: 10 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ delay: 0.1 }}`
> - **Heading** (motion.h1): text "A new way to think and create with computers" (with `<br className="hidden md:block" />` after "create"), `fontFamily: "'Instrument Serif', serif"` set via inline style, classes `text-4xl md:text-[64px] font-medium tracking-[-0.01em] leading-[1.1] mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl`, animates `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}`
> - **CTA area** (motion.div): `min-h-[50px] mt-2`, animates with `delay: 0.4`. Uses `AnimatePresence mode="wait"` to toggle between:
> 
>   - **Button state**: "Get early access" -- `px-10 py-3 text-[14px] font-medium border border-white/10 rounded-full hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300 text-white/90 backdrop-blur-sm cursor-pointer`. On click, switches to email form.
>   - **Email form state**: a `<form>` with `flex items-center gap-2 pl-5 pr-1.5 py-1.5 text-[14px] font-medium border border-white/20 rounded-full bg-white/[0.02] backdrop-blur-sm w-full max-w-[320px] focus-within:border-white/40 transition-colors duration-300`. Contains an email `<input>` (transparent background, white text, `placeholder-white/45`, `autoFocus`) and a submit button with either `ArrowRight` icon (default) or `Check` icon (after submit). Both states animate scale 0.95 to 1 with 0.2s duration.
>   - **Typewriter placeholder**: when the email form opens, the placeholder text "Enter Your Email Here For Early Access" types in character by character at 60ms intervals. After submission, it types "You Will Receive Notifications By Email" instead. After 4 seconds, it resets back to the button state.
> - **"Play Video Demo"** link below (motion.div with `delay: 0.8` fade-in): `text-white/80 hover:text-white/40 transition-colors duration-300 text-[13px] font-medium tracking-wide`
> - **App root layout:**
> - `<main>` with `relative bg-black h-screen w-screen flex flex-col overflow-hidden selection:bg-white selection:text-black shrink-0`
> - Render order: `BackgroundVideo`, `Navbar`, `Hero`
> - Text selection is styled white bg with black text



---



Key clarification: The video URL is **not** from CloudFront. It is an HLS stream hosted on **Mux**: `https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8`. The `.m3u8` format requires hls.js for non-Safari browsers.


---

# 040 Portfolio Cosmic

# Portfolio Cosmic

Prompt to recreate this landing page:



Build a single-page dark portfolio landing page using React + Vite + Tailwind CSS + TypeScript + GSAP + Framer Motion + hls.js.



---



## Global Design System



### Fonts

Google Fonts import: Inter (300–700) and Instrument Serif (italic, 400).

- --font-body: 'Inter', sans-serif → Tailwind font-body
- --font-display: 'Instrument Serif', serif → Tailwind font-display

### CSS Custom Properties (HSL, no hsl() wrapper — Tailwind adds it)

--bg: 0 0% 4%;

--surface: 0 0% 8%;

--text: 0 0% 96%;

--muted: 0 0% 53%;

--stroke: 0 0% 12%;

--accent: 0 0% 96%;



### Tailwind Custom Colors

bg: "hsl(var(--bg))",

surface: "hsl(var(--surface))",

"text-primary": "hsl(var(--text))",

muted: "hsl(var(--muted))",

stroke: "hsl(var(--stroke))",



### Accent Gradient

linear-gradient(90deg, #89AACC 0%, #4E85BF 100%) — used on logo ring, hover borders, progress bars. CSS utility class .accent-gradient.



### Custom Animations (in index.css)

- @keyframes scroll-down — translateY(-100%) → translateY(200%), 1.5s ease-in-out infinite
- @keyframes role-fade-in — opacity 0 + translateY(8px) → opacity 1 + translateY(0), 0.4s ease-out
- @keyframes gradient-shift — background-position 0% 50% → 100% 50% → 0% 50%, 6s ease infinite (for animated gradient borders)

### Forced dark theme — no light mode toggle. body gets bg-bg text-text-primary.



---



## Page Structure (Index.tsx)



{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}



---



## Section 1: Loading Screen



Full-screen overlay (fixed inset-0 z-[9999] bg-bg). Uses requestAnimationFrame counter from 000→100 over 2700ms.



- Top-left: "Portfolio" label — text-xs text-muted uppercase tracking-[0.3em]. Animates y:-20→0, opacity 0→1.
- Center: Rotating words ["Design", "Create", "Inspire"] cycling every 900ms. AnimatePresence mode="wait" with y:20→0→-20 transitions. text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80.
- Bottom-right: Counter display — text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums. Shows String(count).padStart(3, "0").
- Bottom progress bar: h-[3px] bg-stroke/50, inner div with .accent-gradient, scaleX(count/100) transform, box-shadow: 0 0 8px rgba(137, 170, 204, 0.35).
- On complete (count reaches 100): 400ms delay then calls onComplete.

---



## Section 2: Hero



Full-viewport section with background HLS video and centered content.



### Background Video

- HLS source: https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8
- Uses hls.js — if Hls.isSupported(), create HLS instance; else if native HLS support, set video.src directly.
- Video: autoPlay muted loop playsInline, absolutely positioned and centered with min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2.
- Dark overlay: bg-black/20
- Bottom fade: h-48 bg-gradient-to-t from-bg to-transparent

### Navbar (fixed, floats at top center)

fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4.



Inner pill: inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2. Gets shadow-md shadow-black/10 when scrollY > 100.



Contents (left to right):

1. Logo: 9×9 circle with accent gradient border (reverses direction on hover). Inner bg-bg circle with "JA" in font-display italic text-[13px]. Scales 110% on hover.
2. Divider: w-px h-5 bg-stroke mx-1 (hidden on mobile)
3. Nav links: ["Home", "Work", "Resume"] — text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2. Active: text-text-primary bg-stroke/50. Inactive: text-muted hover:text-text-primary hover:bg-stroke/50.
4. Divider
5. "Say hi" button: Same size as nav links. On hover, shows accent gradient border behind (using absolute span with inset: -2px). Inner content wrapped in bg-surface rounded-full backdrop-blur-md. Includes "↗" arrow.

### Hero Content (centered, z-10)

- Eyebrow: text-xs text-muted uppercase tracking-[0.3em] mb-8 — "COLLECTION '26". Class blur-in.
- Name: text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6 — "Michael Smith". Class name-reveal.
- Role line: "A {role} lives in Chicago." — roles cycle every 2s through ["Creative", "Fullstack", "Founder", "Scholar"]. Role word uses font-display italic text-text-primary animate-role-fade-in inline-block with key={roleIndex} for re-triggering animation.
- Description: text-sm md:text-base text-muted max-w-md mb-12 — "Designing seamless digital interactions by focusing on the unique nuances which bring systems to life."
- CTA Buttons (inline-flex gap-4):

  - "See Works": Solid button. Default: bg-text-primary text-bg. Hover: bg-bg text-text-primary with accent gradient border ring.
  - "Reach out...": Outlined button. Default: border-2 border-stroke bg-bg text-text-primary. Hover: border-transparent with accent gradient border ring.
  - Both: rounded-full text-sm px-7 py-3.5 hover:scale-105.

### GSAP Entrance

Timeline with ease: "power3.out":

- .name-reveal: opacity 0→1, y 50→0, duration 1.2s, delay 0.1s
- .blur-in: opacity 0→1, filter blur(10px)→blur(0px), y 20→0, duration 1s, stagger 0.1, delay 0.3s

### Scroll Indicator

Bottom-center, text-xs text-muted uppercase tracking-[0.2em] "SCROLL" label above a w-px h-10 bg-stroke line with animated highlight using .animate-scroll-down.



---



## Section 3: Selected Works



bg-bg py-12 md:py-16. Inner: max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16.



### Header

Framer Motion whileInView — opacity 0→1, y 30→0, duration 1s, ease [0.25,0.1,0.25,1], viewport once margin "-100px".

- Eyebrow: w-8 h-px bg-stroke + "Selected Work" text-xs text-muted uppercase tracking-[0.3em]
- Heading: "Featured \*projects\*" — italic word in font-display italic
- Subtext: "A selection of projects I've worked on, from concept to launch."
- "View all work" button (desktop only, hidden md:inline-flex) — rounded-full with gradient hover border ring + right arrow

### Bento Grid

grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6. Column spans alternate: 7/5/5/7.



4 project cards with titles: Automotive Motion, Urban Architecture, Human Perspective, Brand Identity.



Each card: bg-surface border border-stroke rounded-3xl with aspect ratios. Contains:

- Background image with object-cover group-hover:scale-105
- Halftone overlay: radial-gradient(circle, #000 1px, transparent 1px) at 4×4px, opacity-20 mix-blend-multiply
- Hover: bg-bg/70 opacity-0→1 + backdrop-blur-lg
- Hover label: pill with animated gradient border, white bg, "View — \*Title\*" (title in font-display italic)

---



## Section 4: Journal



bg-bg py-16 md:py-24. Same header pattern (eyebrow + "Recent \*thoughts\*" + subtext + "View all" button).



4 journal entries displayed as horizontal pills (rounded-[40px] sm:rounded-full) with titles, images, read times, and dates.



Each entry: flex items-center gap-6 p-4 bg-surface/30 hover:bg-surface border border-stroke.



---



## Section 5: Explorations (Parallax Gallery)



min-h-[300vh] section for scroll-driven parallax.



### Layer 1: Pinned Center (z-10)

h-screen div pinned with GSAP ScrollTrigger.create({ pin: contentRef, pinSpacing: false }).

- Eyebrow: "Explorations"
- Heading: "Visual \*playground\*"
- Subtext + Dribbble button

### Layer 2: Parallax Columns (z-20, absolute)

grid grid-cols-2 gap-12 md:gap-40 inside max-w-[1400px].



6 items split into 2 columns with GSAP scroll-driven parallax movement.

Cards: aspect-square max-w-[320px], with rotation and lightbox on click.



---



## Section 6: Stats



bg-bg py-16 md:py-24. 3-column grid with stats: 20+ Years Experience, 95+ Projects Done, 200% Satisfied Clients.



---



## Section 7: Contact / Footer



bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden.



### Background Video

Same HLS source as hero, but flipped vertically (scale-y-[-1]). Heavier overlay: bg-black/60.



### GSAP Marquee

"BUILDING THE FUTURE • " repeated 10×. GSAP xPercent: -50, duration 40, ease "none", repeat -1.



### CTA

Email button: mailto:hello@michaelsmith.com with gradient hover border ring.



### Footer Bar

Social links [Twitter, LinkedIn, Dribbble, GitHub] + Green pulsing dot + "Available for projects"



---



## Dependencies

gsap, framer-motion, hls.js, react-router-dom, tailwindcss-animate



Add smooth scroll nav and page transitions.


---

# 041 HR SaaS Hero

# HR SaaS Hero

Create a minimalist, high-end React hero section using Tailwind CSS v4 and the Motion library.



Layout & Spacing:



The section should have a min-h-screen height and be centered.



Apply a heavy top padding of exactly 290px to the main content container to create an editorial, spacious feel.



The content container should have a max-w-[1200px] and a vertical gap of 32px between elements.



Background:



Use this background video: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4.



Critical: The video must be vertically flipped using scaleY(-1) and set to object-cover.



Apply a white gradient overlay on top of the video: from-[26.416%] from-[rgba(255,255,255,0)] to-[66.943%] to-white to seamlessly blend the video into the background.



Typography (Geist & Instrument Serif):



Main Heading: Use the 'Geist' font, medium weight, tracking -0.04em.



Text Content: 'Simple [management] for your remote team'.



Sizes: The main heading should be 80px (desktop), while the word 'management' should be in 'Instrument Serif' italic at 100px.



Description: Geist font, 18px, 80% opacity, slate color (#373a46), max-width 554px.



Interactive Components:



Email Navbar: Create a rounded (40px) input container with bg-[#fcfcfc], a thin border, and a soft shadow (0px 10px 40px 5px rgba(194,194,194,0.25)).



CTA Button: A dark, multi-layered gradient button ('Create Free Account') with a complex inner shadow for a high-gloss tactile effect: shadow-[inset\_-4px\_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)].



Social Proof: Below the input, add a '1,020+ Reviews' badge with a row of star/brand icons.



Animations:



Use Motion to staggered 'fade and slide up' the heading, description, and the email input block for a smooth entrance.



Key Technical Specs for Implementation:



Video Class: className="w-full h-full object-cover [transform:scaleY(-1)]"



Gradient Class: className="absolute inset-0 bg-gradient-to-b from-[26.416%] from-[rgba(255,255,255,0)] to-[66.943%] to-white"



Button Shadow: shadow-[inset\_-4px\_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)]


---

# 042 Securify Data Security

# Securify Data Security

Build a full-screen hero section for a data-security SaaS landing page called "securify" using React + TypeScript + Tailwind CSS, with a looping fullscreen background video, a floating pill-shaped navbar, and large staggered typography.



Fonts & Global Styles



Load Google font "Readex Pro" weights 300, 400, 500, 600, 700.

Set body font-family: 'Readex Pro', system-ui, -apple-system, sans-serif;, background #000, color #fff, antialiased.

Make html, body, #root height 100%.

Add a .hero-title class with letter-spacing: -0.04em; line-height: 0.95;.

Section container



A <section> with classes: relative h-screen w-full overflow-hidden bg-black.

Background video



<video> with className="absolute inset-0 w-full h-full object-cover", autoPlay loop muted playsInline, and src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4".

Navbar (absolute, z-20, px-6 md:px-10 pt-6, top-0 left-0 right-0)



A <nav> with flex items-center justify-between gap-4.

Left pill: flex items-center gap-2 bg-neutral-900/90 backdrop-blur rounded-full pl-4 pr-6 py-3 containing:

A custom white SVG logo (viewBox 0 0 256 256, class h-5 w-5) with path: M 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 128 L 64 128 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z M 128 64 L 128 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 Z M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 128 0 L 192 0 Z filled #ffffff.

Brand text "securify" (text-white text-sm font-normal tracking-tight).

Center pill (hidden on mobile): hidden md:flex items-center gap-1 bg-neutral-900/90 backdrop-blur rounded-full px-3 py-2 with four anchor links: "platform", "solutions", "company", "support" — each text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full.

Right button: "get started" — bg-white text-black text-sm font-normal rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors.

Foreground content wrapper: relative h-full w-full (rendered after Navbar, above the video).



Three giant staggered headline words (each an <h1> with class hero-title absolute text-white font-medium text-[14vw] md:text-[13vw]):



"protect" — left-4 md:left-10 top-[18%]

"your" — right-4 md:right-10 top-[38%]

"data" — left-[18%] md:left-[28%] top-[58%]

All lowercase.



Description paragraph (absolute, left-6 md:left-10 top-[46%], max-w-[240px] text-[15px] leading-snug text-white/90):



"we can guarding your data with utmost care, empowering you with privacy everywhere"



Stat block — top-right (absolute right-6 md:right-24 top-[14%]):



Row: flex items-center gap-3 justify-end — a diagonal divider (hidden md:block h-px w-24 bg-white/40 rotate-[20deg]) then number "+65k" (text-4xl md:text-5xl font-medium tracking-tight).

Sublabel: "startups use" (text-xs md:text-sm text-white/70 mt-1 text-right).

Bottom gradient overlay: pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black.



Stat block — bottom-left (absolute left-6 md:left-20 bottom-20 md:bottom-24):



Row: number "+1.5b" then divider hidden md:block h-px w-24 bg-white/40 rotate-[-20deg].

Sublabel: "gb data was protected" (text-xs md:text-sm text-white/70 mt-1).

Stat block — bottom-right (absolute right-6 md:right-20 bottom-16 md:bottom-20):



Row: diagonal divider rotate-[-20deg] then "+300k".

Sublabel: "downloads" (right-aligned, text-white/70).

Notes



All text is lowercase.

Navbar pills use bg-neutral-900/90 backdrop-blur.

Only transitions: hover:text-white on nav links, hover:bg-neutral-200 on the button.

No purple/indigo anywhere; palette is pure black, white, neutral-900, and white opacity variants (white/40, white/70, white/90).

Responsive: mobile hides nav links and diagonal dividers; typography scales via vw units.


---

# 043 New Era Bold Hero

# New Era Bold Hero

Create a responsive, full-screen Hero section using React and Tailwind CSS with the following specifications:



1. Layout & Positioning:

Set the container to at least screen height (min-h-screen) with a dark blue fallback background (#21346e).

Align the main content to the top of the page (not centered), adding significant top padding (approx pt-32 on mobile, pt-48 on desktop).

Use a standard container with horizontal padding.



1. Background Video:

Implement a full-screen, absolute-positioned background video.

The video must be set to autoPlay, loop, muted, and playsInline.

Use object-cover to ensure it fills the screen without distortion.

Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260206_044704_dd33cb15-c23f-4cfc-aa09-a0465d4dcb54.mp4



1. Typography (Main Headline):

Font Family: Rubik (sans-serif).

Style: Bold, Uppercase, White text.

Layout: Display the text on three separate lines:

Line 1: "NEW ERA"

Line 2: "OF DESIGN"

Line 3: "STARTS NOW"

Sizing: Large and responsive (text-6xl mobile, text-8xl tablet, text-[100px] desktop).

Spacing: Very tight line height (0.98) and negative letter spacing (-2px to -4px).



1. Custom CTA Button:

Place a button below the headline with a fixed size of 184px wide by 65px high.

Interaction: Add a hover effect that slightly scales up (scale-105) and an active press effect (scale-95).

Background: Instead of a standard CSS background, use an SVG element that fills the button container (absolute inset-0). Use a custom path for the shape filled with white.

Text: Centered label "GET STARTED".

Text Style: Rubik, Bold, Uppercase, 20px size, dark text color (#161a20).


---

# 044 VaultShield Hero

# VaultShield Hero

Create a fullscreen hero section for a password manager app called "VaultShield" using React, TypeScript, Tailwind CSS, Framer Motion, and Lucide React icons.



---



## Fonts



- **Heading font:** `Helvetica Now Display Bold` loaded from `https://db.onlinewebfonts.com/c/04e6981992c0e2e7642af2074ebe3901?family=Helvetica+Now+Display+Bold` (add as a `<link>` in `index.html`)
- **Body font:** `Inter` (weights 300-900) loaded from Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap` (imported in CSS)

## CSS Variables



```CSS
:root {
  --font-heading: 'Helvetica Now Display Bold', sans-serif;
  --font-body: 'Inter', sans-serif;
  --color-text: #192837;
  --color-accent: #7342E2;
  --color-login-bg: #F2F2EE;
}
```



## Background Video



Full-screen background video covering the entire viewport (`absolute inset-0, object-cover`):



```Plain Text
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_003132_8b7edcb6-c64d-4a52-a9ca-879942e122ad.mp4
```



Attributes: `autoPlay`, `muted`, `loop`, `playsInline`



## Layout Structure



1. **Container:** `relative w-full min-h-screen`, font-family from `--font-body`, color from `--color-text`
2. **Navbar:** max-width 1280px, centered, z-10, `px-5 sm:px-8 py-4 sm:py-5`, flex with items centered and space-between
3. **Hero content:** max-width 1280px centered container with `paddingTop: clamp(40px, 8vw, 72px)`, content block capped at `max-width: 560px`

## Logo (SVG)



Custom SVG logo, 32x32, fill `#192837`, geometric angular shape:



```XML
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" overflow="visible" viewBox="0 0 256 256">
  <path d="M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z" fill="#192837"/>
</svg>
```



## Navbar Elements



- **Left:** Logo
- **Center (desktop only, `hidden md:flex`):** 5 links — `['Vault', 'Plans', 'Install', 'News', 'Help']`, text-sm font-medium, opacity hover effect
- **Right (desktop only):**

  - "Start For Free" button — `background: #7342E2`, white text, rounded-full, `px-5 py-2.5`
  - "Sign In" button — `background: #F2F2EE`, dark text, rounded-full, `px-5 py-2.5`
- **Mobile:** Hamburger icon (Menu/X from lucide-react), opens a right-side slide-in sheet

## Mobile Menu Sheet (AnimatePresence + Framer Motion)



- **Backdrop:** fixed inset-0, `rgba(25,40,55,0.35)` background with `blur(4px)` backdrop-filter
- **Sheet:** fixed right-0 top-0, width `min(88vw, 360px)`, height `100dvh`, background `#CFC8C5`, box-shadow `-12px 0 48px rgba(25,40,55,0.18)`
- **Sheet animation:** slides from `x: '100%'` to `x: 0`, ease `[0.22, 1, 0.36, 1]`, duration 0.45s
- **Sheet content:** Logo + close button header, 1px divider, staggered nav links (delay `0.18 + i * 0.07`), bottom CTA buttons matching desktop style

## Hero Heading



- Font: `var(--font-heading)`
- Size: `clamp(1.65rem, 5vw, 3rem)`
- Line-height: `1.05`
- Letter-spacing: `-0.01em`
- Color: `#192837`
- Margin-bottom: `24px`
- Contains inline Lucide icons (Zap, LockKeyhole, Fingerprint) at 24px, color `#192837`, vertically aligned middle, positioned `top: -2px`
- Text: "Lock Down Your Passwords with Ironclad Security"

  - Zap icon before "Lock"
  - LockKeyhole icon between "Passwords" and "with"
  - Fingerprint icon after "Security"

## Hero Subtext



- Font: `var(--font-body)`
- Size: `clamp(0.9rem, 2.5vw, 1.1rem)`
- Line-height: `1.65`
- Opacity: `0.8`
- Max-width: `560px`
- Text: "Zero stress, total control. VaultShield keeps you covered with unbreakable storage, one-tap access, and pro-grade tools for your non-stop world."

## CTA Button



- Background: `#7342E2`
- Color: white
- Border-radius: `50px`
- Padding: `17px 24px`
- Font: `var(--font-body)`, font-weight semibold
- Size: `clamp(0.9rem, 2vw, 1rem)`
- Box-shadow: `0 4px 24px rgba(115,66,226,0.28)`
- Min-width: `210px`
- Flex with space-between, gap `32px`
- Text: "Get It Free" with ArrowRightCircle icon (20px) on the right
- Hover: `scale(1.04)` + `brightness(1.1)`
- Tap: `scale(0.96)`

## Animations (Framer Motion)



**fadeUp variant** applied to heading (delay 0), subtext (delay 0.15s), and CTA button (delay 0.30s):



```JavaScript
hidden: { opacity: 0, y: 28 }
visible: { opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
```



## Dependencies



- `react`, `react-dom`
- `framer-motion`
- `lucide-react` (icons: ArrowRightCircle, Zap, LockKeyhole, Fingerprint, Menu, X)
- Tailwind CSS

---



That is every detail needed to reproduce the hero section exactly as built.


---

# 045 Portal

# Portal

PROMPT:



Build a full-viewport cinematic movie/streaming hero section using React, Tailwind CSS, and Lucide React icons. Use the Inter font from Google Fonts. The entire page is a single full-height hero -- no scrolling, no additional sections.



BACKGROUND VIDEO:



A full-screen background video plays on loop, muted, autoplaying, covering the entire viewport with object-cover. The video is fixed-positioned behind everything at z-index 0.



Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4



BOTTOM BLUR OVERLAY (no gradient darkening):



Over the video, there is a single fixed, full-screen overlay div that applies a strong backdrop-blur-xl. This div uses a CSS mask so the blur only appears at the bottom and fades to transparent toward the middle of the screen. There is NO dark gradient overlay -- only blur.



The mask: mask-image: linear-gradient(to top, black 0%, transparent 45%) (with the -webkit- prefix too).



This overlay is pointer-events-none and sits at z-index 1.



FONT:



Import Inter from Google Fonts (weights 300-700). Set font-family: 'Inter', sans-serif on the body.



LIQUID GLASS EFFECT (used on multiple buttons):



Create a reusable .liquid-glass CSS class with these exact properties:



background: rgba(255, 255, 255, 0.01) with background-blend-mode: luminosity

backdrop-filter: blur(4px) (with -webkit- prefix)

border: none

box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1)

position: relative; overflow: hidden

A ::before pseudo-element that creates a thin glowing border effect:

position: absolute; inset: 0; border-radius: inherit; padding: 1.4px

background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%)

Uses -webkit-mask with linear-gradient(#fff 0 0) content-box and linear-gradient(#fff 0 0) combined with -webkit-mask-composite: xor and mask-composite: exclude to create a border-only gradient stroke

pointer-events: none

BLUR-FADE-UP ANIMATION (used on every element with staggered delays):



Create a @keyframes blurFadeUp animation:



From: opacity: 0; filter: blur(20px); transform: translateY(40px)

To: opacity: 1; filter: blur(0); transform: translateY(0)

The .animate-blur-fade-up class applies this as animation: blurFadeUp 1s ease-out forwards with initial opacity: 0. Each element on the page gets a staggered animationDelay via inline style.



NAVBAR (z-index 50, relative positioned):



A horizontal navbar with justify-between, padding px-4 sm:px-6 md:px-12 py-4 md:py-6.



Left: A text logo (e.g. your brand name like "CINEMATIC" or similar) styled as h-8 md:h-10, with blur-fade-up animation at delay 0ms.



Center (desktop only, hidden below lg): Navigation links -- "Movies", "TV Series", "Editor's Pick", "Interviews", "User Reviews" -- each as an anchor with text-sm, hover:text-gray-300 transition-colors, and staggered blur-fade-up delays from 100ms to 300ms (50ms increments).



Right: Two buttons visible on sm and up:



A "Search" button -- rounded-full liquid-glass pill with the text "Search" and a Lucide Search icon (size 18), padding px-4 md:px-6 py-2, blur-fade-up at 350ms.

A user/profile circle button -- w-10 h-10 rounded-full liquid-glass with a Lucide User icon (size 18), blur-fade-up at 400ms.

A hamburger menu button visible only below lg -- w-10 h-10 rounded-full liquid-glass with animated icon transition between Lucide Menu and X icons. The transition uses rotate-180, opacity, and scale-50 with duration-500 ease-out. Blur-fade-up at 350ms.

MOBILE MENU (below lg breakpoint):



An absolutely positioned dropdown below the navbar (top-[72px]), z-index 40. It slides in with translate-y-0 opacity-100 when open, -translate-y-4 opacity-0 pointer-events-none when closed, duration-500 ease-out.



Background: bg-gray-900/95 backdrop-blur-lg with border-t border-b border-gray-800 shadow-2xl.

Contains the same 5 nav links, each in a column with py-3 px-3 rounded-lg, hover:bg-gray-800/50, and staggered slide-in animations (translate-x based, 50ms delay increments).

Below sm, also shows Search and Profile buttons in a bordered section at the bottom.

HERO CONTENT (bottom of viewport):



A flex container that grows to fill remaining space and aligns content to the bottom (flex-1 flex flex-col justify-end), with padding px-4 sm:px-6 md:px-12 pb-8 md:pb-16, z-index 10.



Inside, a flex-col md:flex-row items-end gap-8 layout:



Left side (flex-1):



Metadata row -- a horizontal flex-wrap row with gap-3 sm:gap-6 mb-6 md:mb-8 text-xs sm:text-sm, blur-fade-up at 300ms:



Star icon (size 16, fill-white, responsive to sm:w-5 sm:h-5) + "8.7/10 IMDB" (font-medium)

Clock icon (size 16) + "132 min"

Calendar icon (size 16) + "April, 2025"

Title -- text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal, letter-spacing -0.04em, mb-4 md:mb-6, blur-fade-up at 400ms. Text: "Step Through. Work Smarter."



Description -- text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-12 max-w-2xl, blur-fade-up at 500ms. Text: "A voyage through forgotten realms, where past and future intertwine."



CTA buttons -- flex-wrap row with gap-3 sm:gap-4:



"Watch Now" -- bg-white text-black rounded-full font-medium, px-6 sm:px-8 py-2.5 sm:py-3, with a Lucide Play icon (size 18, fill-black), hover:bg-gray-200, blur-fade-up at 600ms.

"Learn More" -- rounded-full font-medium liquid-glass, same padding, blur-fade-up at 700ms.

Right side (navigation arrows):



A row of two pill buttons (md:w-auto, aligned right on desktop, left on mobile):



"Previous" button -- rounded-full liquid-glass, px-4 sm:px-6 py-2.5 sm:py-3, with Lucide ChevronLeft icon, blur-fade-up at 800ms.

"Next" button -- same styling with Lucide ChevronRight icon, blur-fade-up at 900ms.

COLOR PALETTE:



Background: pure black (bg-black)

Text: white, with text-gray-400 for the subtitle

All interactive glass elements use the .liquid-glass class (nearly transparent white with blur)

The only solid-colored element is the "Watch Now" button (white background, black text)

STAGGER TIMING SUMMARY:



Logo: 0ms

Nav links: 100ms, 150ms, 200ms, 250ms, 300ms

Search button: 350ms

User button: 400ms

Metadata row: 300ms

Title: 400ms

Description: 500ms

Watch Now: 600ms

Learn More: 700ms

Previous: 800ms

Next: 900ms

RESPONSIVE BREAKPOINTS:



Below sm (< 640px): Smaller text, tighter padding, Search/User buttons hidden (available in mobile menu)

Below lg (< 1024px): Nav links hidden, hamburger menu shown

md and up: Side-by-side layout for hero content and navigation arrows

lg and up: Full desktop navbar with all links visible


---

# 046 Solar Energy Hero

# Solar Energy Hero

Build a single-page React + TypeScript + Vite hero section for a solar energy brand called "reposit." The page features a fullscreen background image that transitions between a daytime (Morning) photo and a nighttime (Night) photo using a custom pull-down animation. The entire page uses vanilla CSS (no CSS modules) with Tailwind installed but only used minimally (the design is almost entirely custom CSS). Google Font "Outfit" is loaded. The icon library is lucide-react (only the Zap icon is used).



---



TECH STACK AND CONFIG:



- Vite 5.4.2 with @vitejs/plugin-react, React 18.3.1, TypeScript 5.5.3
- Tailwind CSS 3.4.1 via PostCSS + Autoprefixer
- lucide-react 0.344.0
- @supabase/supabase-js 2.57.4 (installed but unused in this page)
- vite.config.ts: optimizeDeps.exclude includes 'lucide-react'
- tailwind.config.js: content array is ['./index.html', './src/\*\*/\*.{js,ts,jsx,tsx}'], no theme extensions, no plugins
- postcss.config.js: plugins are tailwindcss and autoprefixer

---



INDEX.HTML (verbatim):



```Plain Text
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reposit Zero Electricity Bills Page</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```



---



IMAGES:



Two images stored locally in /public/images/:

- `/images/hero-light.webp` — the daytime/morning photo. Source URL: https://res.cloudinary.com/dsdhxhhqh/image/upload/v1778837456/hf_20260515_092045_b654224c-4741-458f-8596-fa5bfeffabbc_1_oyfhme.jpg
- `/images/hero-dark.webp` — the nighttime photo. Source URL: https://res.cloudinary.com/dsdhxhhqh/image/upload/v1778837447/hf_20260515_092102_24e30358-d694-4b70-8a56-a4f0887cf8ae_1_ry5dvs.jpg

Download both at build time so they serve locally (no external fetching at runtime).



---



MAIN.TSX (verbatim):



```TypeScript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```



---



APP.TSX (verbatim):



Single component, no router, no external state. Uses useState, useEffect, useRef from React. Imports only `{ Zap }` from lucide-react.



Constants:

- `LIGHT_IMG = '/images/hero-light.webp'`
- `DARK_IMG = '/images/hero-dark.webp'`

State:

- `isDark` (boolean, default `true`) — controls theme
- `menuOpen` (boolean, default `false`) — mobile drawer

Refs:

- `bgFrontRef` (HTMLDivElement) — the foreground background layer
- `bgBackRef` (HTMLDivElement) — the blurred background layer behind it
- `animatingRef` (boolean) — prevents double-clicks during transition

Effects:

1. When `isDark` changes: add/remove class `light-theme` on `document.body`
2. On mount: set both bgFrontRef and bgBackRef backgroundImage to `url(${DARK_IMG})`

Toggle logic (`toggleTheme(toDark: boolean)`):

1. If already in target state or animating, return early
2. Set animatingRef true
3. Set bgBack's backgroundImage to the target image
4. Add class `pull-down` to bgFront (triggers the pull-down CSS animation)
5. After 300ms timeout: set isDark state, set bgFront's backgroundImage to target image
6. After another 30ms timeout: remove `pull-down` class, set animatingRef false

JSX structure (exact nesting):

```Plain Text
div.hero
  div.blur-overlay.blur-overlay-top
  div.blur-overlay.blur-overlay-bottom
  div.hero-bg-wrapper
    div[ref=bgBackRef].hero-bg.bg-back
    div[ref=bgFrontRef].hero-bg.bg-front
  nav.navbar
    div.logo-container
      <Zap className="logo" size={32} strokeWidth={2} />
      span.brand-name "reposit"
    div.nav-links (add class "active" when menuOpen)
      a[href="#"] "How It Works"
      a[href="#"] "Our Cases"
      a[href="#"] "About Us"
      a[href="#"] "Careers"
      a[href="#"] "Resources"
      a[href="#"] "Customers"
      button.cta-button.drawer-cta "Get an Instant Quote"
    button.cta-button.nav-cta "Get an Instant Quote"
    div.hamburger (add class "active" when menuOpen, onClick toggles menuOpen)
      span
      span
      span
  div.hero-content
    h1.hero-title
      "$0 Electricity Bills"
      <br/>
      span.title-accent "for the next"
      " 7 years"
    div.theme-toggle
      div.toggle-indicator [inline style: transform is 'translateX(calc(100% + 4px))' when isDark, 'translateX(0)' when light]
      button.toggle-btn (add class "active" when !isDark), onClick => toggleTheme(false)
        span.label "Morning"
        span.subtext "$0 for Electricity"
      button.toggle-btn (add class "active" when isDark), onClick => toggleTheme(true)
        span.label "Night"
        span.subtext "$0 for Electricity"
    p.hero-footer
      "Forget the energy market, weather conditions and seasons; our Smart Controller guarantees you get no electricity bill for seven years."
```



---



INDEX.CSS (verbatim, every rule):



CSS Custom Properties on :root:

- `--bg-light: #ffffff`
- `--bg-dark: #000000`
- `--text-light: #3E3424`
- `--text-dark: #E5DEC9`
- `--active-toggle: #f5f8ea`
- `--transition-speed: 0.9s`
- `--pull-easing: cubic-bezier(0.32, 0, 0.67, 0)`
- `--return-easing: cubic-bezier(0.175, 0.885, 0.32, 1.4)`

Universal reset: `* { margin:0; padding:0; box-sizing:border-box; font-family:'Outfit',sans-serif; }`



body:

- background-color: var(--bg-dark), color: var(--text-dark), overflow:hidden, transition: background-color 0.5s ease

body.light-theme:

- background-color: var(--bg-light), color: var(--text-light)

.blur-overlay:

- position:absolute, left:0, width:100%, height:10vh, z-index:2, pointer-events:none
- backdrop-filter: blur(25px) saturate(1.5), -webkit-backdrop-filter: blur(25px) saturate(1.5)

.blur-overlay-top:

- top:0
- mask-image: linear-gradient(to bottom, black 70%, transparent 100%)
- -webkit-mask-image: same

.blur-overlay-bottom:

- bottom:0
- mask-image: linear-gradient(to top, black 70%, transparent 100%)
- -webkit-mask-image: same

.hero:

- position:relative, width:100%, height:100vh, display:flex, flex-direction:column, align-items:center, justify-content:space-between, overflow:hidden
- background-image: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 100%)

body.light-theme .hero:

- background-image: radial-gradient(circle at center, rgba(0,0,0,0.02) 0%, transparent 100%)

.hero-bg-wrapper:

- position:absolute, top:0, left:0, width:100%, height:100%, z-index:1, overflow:hidden

.hero-bg:

- position:absolute, top:0, left:0, width:100%, height:100%
- background-size:cover, background-position: center 40%, background-repeat:no-repeat
- transform: scale(1.1)

.bg-front:

- z-index:2
- transition: transform 0.5s var(--return-easing), opacity 0.5s ease

.bg-back:

- z-index:1, filter: blur(40px), transform: scale(1.2)

.hero-bg::after (pseudo-element overlay):

- content:'', position:absolute, top:0, left:0, width:100%, height:100%, pointer-events:none
- background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%), linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)

body.light-theme .hero-bg::after:

- background: radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.2) 100%), linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.8) 100%)

.navbar:

- width:100%, max-width:100%, padding:24px 30px, display:flex, justify-content:space-between, align-items:center, z-index:110

.hamburger:

- display:none, flex-direction:column, gap:6px, cursor:pointer, z-index:120

.hamburger span:

- display:block, width:28px, height:2px, background:currentColor, border-radius:2px, transition:0.3s

.hamburger.active span:nth-child(1): transform: translateY(8px) rotate(45deg)

.hamburger.active span:nth-child(2): opacity:0

.hamburger.active span:nth-child(3): transform: translateY(-8px) rotate(-45deg)



.logo-container: display:flex, align-items:center, gap:12px



.logo: height:32px, color:#ffffff, transition: color 0.5s ease

body.light-theme .logo: color:#000000



.brand-name: font-size:24px, font-weight:400, letter-spacing:-0.5px, color:#ffffff, transition: color 0.5s ease

body.light-theme .brand-name: color:#000000



.nav-links: display:flex, gap:32px

.nav-links a: color:inherit, text-decoration:none, font-size:14px, font-weight:500, opacity:0.7, transition: opacity 0.3s

.nav-links a:hover: opacity:1



.cta-button: background:#ffffff, color:#000000, border:none, padding:12px 24px, border-radius:8px, font-weight:600, font-size:14px, cursor:pointer, transition: transform 0.3s, background 0.3s

.drawer-cta: display:none

body.light-theme .cta-button: background:#000000, color:#ffffff

.cta-button:hover: transform: translateY(-2px), box-shadow: 0 10px 20px rgba(0,0,0,0.1)



.hero-content: flex-grow:1, display:flex, flex-direction:column, align-items:center, justify-content:flex-start, text-align:center, padding:30px 20px 0, z-index:5



.hero-title: font-size:56px, font-weight:500, line-height:1.0, max-width:1000px, margin-bottom:40px, letter-spacing:-1px, color:var(--text-dark), opacity:0.95



.title-accent: transition: color 0.5s ease

body:not(.light-theme) .title-accent: color:#10100F

body.light-theme .title-accent: color:white

body.light-theme .hero-title: color:var(--text-light), opacity:0.95



.theme-toggle: background: rgba(210,198,171,0.15), backdrop-filter: blur(20px), border:none, padding:2px 1px, border-radius:8px, display:flex, gap:4px, margin-top:auto, margin-bottom:8px, position:relative

body.light-theme .theme-toggle: background: rgba(210,198,171,0.25), border:none



.toggle-btn: padding:6px 40px, border-radius:4px, border:none, background:transparent, color:#ffffff, cursor:pointer, z-index:1, transition: color 0.3s, display:flex, flex-direction:column, align-items:center, gap:4px

.toggle-btn .label: font-weight:500, font-size:18px

.toggle-btn .subtext: font-size:11px, opacity:0.6



.toggle-indicator: position:absolute, top:2px, left:1px, width:calc(50% - 3px), height:calc(100% - 4px), background:var(--active-toggle), border-radius:4px, transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), z-index:0, box-shadow: 0 4px 12px rgba(0,0,0,0.1)

body:not(.light-theme) .toggle-indicator: transform: translateX(calc(100% + 4px))



.toggle-btn.active: color:#3E3424 !important

.toggle-btn.active .subtext: opacity:0.8



.hero-footer: max-width:600px, margin-bottom:60px, margin-top:0, color:var(--text-dark), opacity:1, font-size:16px, font-weight:300, line-height:1.6, z-index:5

body.light-theme .hero-footer: color:var(--text-light)



.pull-down: transform: translateY(20vh) scale(1.1) !important, opacity:0.8 !important, transition: transform 0.3s var(--pull-easing), opacity 0.3s ease !important



@keyframes fadeIn: from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) }

.hero-content > \*: animation: fadeIn 1s ease forwards

.hero-title: animation-delay:0.2s

.theme-toggle: animation-delay:0.4s

.hero-footer: animation-delay:0.6s



MOBILE BREAKPOINT (@media max-width:768px):

- .hero-title: font-size:42px, margin-bottom:30px
- .navbar: padding:16px 20px
- .hero-bg: background-position: center 40%, transform: scale(1.2)
- .pull-down: transform: translateY(20vh) scale(1.2) !important
- .nav-links: display:none, position:fixed, top:0, right:0, width:100%, height:100vh, background:var(--bg-dark), flex-direction:column, justify-content:center, align-items:center, z-index:100, gap:40px, transition: transform 0.4s cubic-bezier(0.77,0,0.175,1), transform:translateX(100%)
- body.light-theme .nav-links: background:var(--bg-light)
- .nav-links.active: display:flex, transform:translateX(0)
- .nav-links a: font-size:24px, font-weight:600
- .cta-button.nav-cta: display:none
- .drawer-cta: display:block, width:200px, margin-top:20px, padding:16px
- .hamburger: display:flex !important
- .theme-toggle: flex-direction:row, width:calc(100% - 40px), max-width:400px
- .toggle-btn: padding:12px 20px, flex:1

---



ANIMATION AND TRANSITION SUMMARY:



1. Page load fadeIn: each hero-content child fades in with `animation: fadeIn 1s ease forwards`. Staggered delays: title 0.2s, toggle 0.4s, footer 0.6s. Keyframes go from opacity:0 + translateY(20px) to opacity:1 + translateY(0).
2. Theme toggle pull-down: When switching themes, the front background div gets class `pull-down` which applies `transform: translateY(20vh) scale(1.1)` with `transition: transform 0.3s cubic-bezier(0.32, 0, 0.67, 0)` and `opacity: 0.8`. After 300ms, the image source swaps and pull-down is removed. The return uses the bg-front's own transition: `transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.4)` (overshoot/bounce easing).
3. Toggle indicator slide: `transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)` — slides left/right between the two buttons with a slight overshoot.
4. Body background color: `transition: background-color 0.5s ease`
5. Logo and brand name color: `transition: color 0.5s ease`
6. CTA button hover: `transform: translateY(-2px)` with `transition: transform 0.3s`
7. Nav links opacity hover: `transition: opacity 0.3s`
8. Mobile nav drawer: `transition: transform 0.4s cubic-bezier(0.77, 0, 0.175, 1)` from translateX(100%) to translateX(0)
9. Hamburger spans: `transition: 0.3s` for the X animation


---

# 047 Celestia

# Celestia


---

# 048 Buzzentic Agency

# Buzzentic Agency


---

# 049 Cinematic Landing Page

# Cinematic Landing Page


---

# 050 Mindloop Landing

# Mindloop Landing

Build a dark monochrome landing page called Mindloop — a newsletter/content platform. Use React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion. Fonts: Inter (sans) and Instrument Serif (serif, used for italic accent words). The entire theme is pure black (#000) background with white foreground — no colors or gradients beyond monochrome. Install hls.js and framer-motion.



Design System (index.css)

All CSS variables in HSL (no hsl() wrapper in the variable, just the values):



--background: 0 0% 0%

--foreground: 0 0% 100%

--card: 0 0% 5%

--card-foreground: 0 0% 100%

--primary: 0 0% 100%

--primary-foreground: 0 0% 0%

--secondary: 0 0% 12%

--secondary-foreground: 0 0% 85%

--muted: 0 0% 15%

--muted-foreground: 0 0% 65%

--accent: 170 15% 45%

--accent-foreground: 0 0% 100%

--border: 0 0% 20%

--input: 0 0% 18%

--ring: 0 0% 40%

--hero-subtitle: 210 17% 95%

Liquid Glass Effect (global CSS class .liquid-glass)



.liquid-glass {

  background: rgba(255, 255, 255, 0.01);

  background-blend-mode: luminosity;

  backdrop-filter: blur(4px);

  -webkit-backdrop-filter: blur(4px);

  border: none;

  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);

  position: relative;

  overflow: hidden;

}

.liquid-glass::before {

  content: '';

  position: absolute;

  inset: 0;

  border-radius: inherit;

  padding: 1.4px;

  background: linear-gradient(180deg,

    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,

    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,

    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);

  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;

  mask-composite: exclude;

  pointer-events: none;

}

Animation Pattern

All sections use a reusable fadeUp helper with staggered delays:



const fadeUp = (delay: number) => ({

  initial: { opacity: 0, y: 20 },

  whileInView: { opacity: 1, y: 0 },

  viewport: { once: true, margin: "-100px" },

  transition: { duration: 0.6, delay, ease: "easeOut" },

});



Page Structure (top to bottom)

1. Navbar (fixed, transparent)

Left: Logo (concentric circles icon — outer w-7 h-7 with border-2 border-foreground/60, inner w-3 h-3 with border border-foreground/60) + "Mindloop" bold text.

Center-left: Nav links ["Home", "How It Works", "Philosophy", "Use Cases"] separated by • dots. Links are text-muted-foreground hover:text-foreground.

Right: 3 social icons (Instagram, Linkedin, Twitter from lucide-react) in liquid-glass circular buttons (w-10 h-10 rounded-full).

No background — fully transparent, fixed top-0 z-50, padding px-8 md:px-28 py-4.



1. Hero Section (full viewport height)

Background: autoplaying looping muted MP4 video covering the entire section.

Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4

Bottom gradient: h-64 bg-gradient-to-t from-background to-transparent for smooth fade to black.

Content (centered, z-10, pt-28 md:pt-32):

Avatar row: 3 overlapping circular avatars (-space-x-2, w-8 h-8 rounded-full border-2 border-background) + "7,000+ people already subscribed" in text-muted-foreground text-sm.

Heading: text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] — "Get Inspired with Us" where "Inspired" is font-serif italic font-normal.

Subtitle: text-lg in hsl(var(--hero-subtitle)) color — "Join our feed for meaningful updates, news around technology and a shared journey toward depth and direction."

Email form: liquid-glass rounded-full p-2 max-w-lg container with email input and a white bg-foreground text-background rounded-full px-8 py-3 "SUBSCRIBE" button with whileHover scale 1.03 and whileTap scale 0.98.



1. "Search has changed" Section

Top padding pt-52 md:pt-64, bottom padding pb-6 md:pb-9.

Heading: text-5xl md:text-7xl lg:text-8xl — "Search has changed. Have you?" with "changed." in serif italic.

Subtitle: text-muted-foreground text-lg max-w-2xl mx-auto mb-24.

3 platform cards (grid md:grid-cols-3 gap-12 md:gap-8 mb-20): Each card has a 200x200 icon image centered, platform name (font-semibold text-base), and description (text-muted-foreground text-sm).

ChatGPT icon: local asset icon-chatgpt.png

Perplexity icon: local asset icon-perplexity.png

Google AI icon: local asset icon-google.png

Bottom tagline: "If you don't answer the questions, someone else will." in text-muted-foreground text-sm text-center.



1. Mission Section

Padding pt-0 pb-32 md:pb-44.

Video: Large 800x800 looping autoplaying muted video centered.

Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4

Scroll-driven word-by-word reveal using useScroll and useTransform from framer-motion:

Paragraph 1 (text-2xl md:text-4xl lg:text-5xl font-medium tracking-[-1px]): "We're building a space where curiosity meets clarity — where readers find depth, writers find reach, and every newsletter becomes a conversation worth having." Words "curiosity", "meets", "clarity" are highlighted in --foreground, rest in --hero-subtitle.

Paragraph 2 (text-xl md:text-2xl lg:text-3xl font-medium mt-10): "A platform where content, community, and insight flow together — with less noise, less friction, and more meaning for everyone involved."

Each word transitions opacity from 0.15 to 1 based on scroll progress.



1. Solution Section

Padding py-32 md:py-44, border-t border-border/30.

Label: "SOLUTION" in text-xs tracking-[3px] uppercase text-muted-foreground.

Heading: text-4xl md:text-6xl — "The platform for meaningful content" (serif italic on "meaningful").

Video: Rounded rounded-2xl, aspect-[3/1] object-cover.

Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4

4-column feature grid (md:grid-cols-4 gap-8): Curated Feed, Writer Tools, Community, Distribution — each with title (font-semibold text-base) and description (text-muted-foreground text-sm).



1. CTA Section

Padding py-32 md:py-44, border-t border-border/30, overflow-hidden.

Background video (HLS via hls.js): absolute inset-0 object-cover z-0.

HLS URL: https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8

Uses Hls.isSupported() check with fallback to native HLS for Safari.

Overlay: absolute inset-0 bg-background/45 z-[1].

Content (z-10, centered):

Concentric circles logo icon (w-10 h-10 outer, w-5 h-5 inner).

Heading: "Start Your Journey" (serif italic).

Subtitle in text-muted-foreground.

Two buttons: "Subscribe Now" (bg-foreground text-background rounded-lg px-8 py-3.5) and "Start Writing" (liquid-glass rounded-lg).



1. Footer

Simple py-12 px-8 md:px-28 footer.

Left: "© 2026 Mindloop. All rights reserved." in text-muted-foreground text-sm.

Right: Privacy, Terms, Contact links in text-muted-foreground text-sm hover:text-foreground.



Key Dependencies

framer-motion for all animations

hls.js for the CTA background video streaming

@fontsource/inter (400, 500, 600, 700)

@fontsource/instrument-serif (400, 400-italic)

lucide-react for icons

tailwindcss-animate plugin



Assets Needed

3 avatar images (avatar-1.png, avatar-2.png, avatar-3.png)

3 platform icons (icon-chatgpt.png, icon-perplexity.png, icon-google.png)


---

# 051 AI Workflow Hero

# AI Workflow Hero

### Stack



- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS 3.4**
- **lucide-react** for icons (`LogIn`, `UserPlus`, `Play`, `Sparkles`, `Menu`, `X`)
- No Framer Motion -- all animations are CSS `transition-*` classes

---



### Fonts (loaded in `index.html`)



```HTML
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<link href="https://db.onlinewebfonts.com/c/6e47ef470dd19698c911332a9b4d1cf4?family=Neue+Haas+Grotesk+Text+Pro" rel="stylesheet" />
<link href="https://db.onlinewebfonts.com/c/dec0d9b4e22ca588dc20e1e2e09a59b5?family=Neue+Haas+Grotesk+Display+Pro+55+Roman" rel="stylesheet" />
```



Body/root font stack (in `index.css`):



```CSS
html, body, #root {
  height: 100%;
  margin: 0;
  font-family: 'Neue Haas Grotesk Display Pro 55 Roman', 'Neue Haas Grotesk Text Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```



---



### Video URL (CloudFront)



```Plain Text
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4
```



---



### Color Palette



| Token | Hex |
|-|-|
| Dark green (text, buttons) | `#1f2a1d` |
| Medium dark green | `#2d3a2a` |
| Button hover | `#2a3827` |
| Body text green | `#4b5b47` |
| Heading primary | `#336443` |
| Heading accent | `#85AB8B` |
| Bottom-left text | `#3d5638` |
| Bottom-left button bg | `#3d5638`, hover `#2d4228` |



---



### Architecture



Two files:



1. **`BoomerangVideoBg.tsx`** -- captures video frames into canvas, then plays them forward/backward in a seamless boomerang loop at 30fps (960px max capture width).
2. **`App.tsx`** -- the full hero section.

---



### `BoomerangVideoBg.tsx` (exact)



```TypeScript
import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  className?: string;
};

export default function BoomerangVideoBg({ src, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [framesReady, setFramesReady] = useState(false);
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const frames: HTMLCanvasElement[] = [];
    let capturing = true;
    let lastTime = -1;
    const MAX_WIDTH = 960;

    const captureFrame = () => {
      if (!capturing || video.readyState < 2) return;
      if (video.currentTime === lastTime) return;
      lastTime = video.currentTime;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      const scale = Math.min(1, MAX_WIDTH / vw);
      const w = Math.round(vw * scale);
      const h = Math.round(vh * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      frames.push(canvas);
    };

    type VFCVideo = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    const vfcVideo = video as VFCVideo;
    const hasVFC = typeof vfcVideo.requestVideoFrameCallback === 'function';

    let rafId = 0;
    const rafLoop = () => {
      captureFrame();
      if (capturing) rafId = requestAnimationFrame(rafLoop);
    };

    const vfcLoop = () => {
      captureFrame();
      if (capturing && vfcVideo.requestVideoFrameCallback) {
        vfcVideo.requestVideoFrameCallback(vfcLoop);
      }
    };

    const onEnded = () => {
      capturing = false;
      if (frames.length > 0) {
        framesRef.current = frames;
        setFramesReady(true);
      }
    };

    const onLoaded = () => {
      video.play().catch(() => {});
      if (hasVFC) {
        vfcVideo.requestVideoFrameCallback!(vfcLoop);
      } else {
        rafId = requestAnimationFrame(rafLoop);
      }
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('ended', onEnded);
    if (video.readyState >= 1) onLoaded();

    return () => {
      capturing = false;
      cancelAnimationFrame(rafId);
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('ended', onEnded);
    };
  }, [src]);

  useEffect(() => {
    if (!framesReady) return;
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const frames = framesRef.current;
    if (frames.length === 0) return;

    const first = frames[0];
    canvas.width = first.width;
    canvas.height = first.height;

    let index = 0;
    let direction = 1;
    let last = performance.now();
    const interval = 1000 / 30;
    let rafId = 0;

    const render = (now: number) => {
      if (now - last >= interval) {
        last = now;
        ctx.drawImage(frames[index], 0, 0);
        index += direction;
        if (index >= frames.length - 1) {
          index = frames.length - 1;
          direction = -1;
        } else if (index <= 0) {
          index = 0;
          direction = 1;
        }
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [framesReady]);

  return (
    <div className={className ?? 'absolute inset-0 w-full h-full'}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        style={{ display: framesReady ? 'none' : 'block' }}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
      />
      <canvas
        ref={displayCanvasRef}
        className="w-full h-full object-cover"
        style={{ display: framesReady ? 'block' : 'none' }}
      />
    </div>
  );
}
```



---



### `App.tsx` (exact)



```TypeScript
import { useState, useEffect } from 'react';
import { LogIn, UserPlus, Play, Sparkles, Menu, X } from 'lucide-react';
import BoomerangVideoBg from './BoomerangVideoBg';

const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navLinks = [
    { href: '#mission', label: 'Purpose' },
    { href: '#how', label: 'The Process' },
    { href: '#pricing', label: 'Tariffs' },
  ];

  return (
    <section className="relative w-full min-h-screen sm:h-screen overflow-hidden">
      <BoomerangVideoBg src={BG_VIDEO} className="absolute inset-0 w-full h-full" />
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-6">
        <div className="flex items-center gap-2 text-[#2d3a2a]">
          <span className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
            LinkFlow<sup className="text-[10px] sm:text-xs font-medium">TM</sup>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-md rounded-full pl-6 pr-1 py-1 shadow-sm border border-white/60">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm px-3 py-2 transition-colors ${
                i === 0 ? 'font-semibold text-[#1f2a1d]' : 'font-medium text-[#4b5b47] hover:text-[#1f2a1d]'
              }`}
            >
              {link.label}
            </a>
          ))}
          <button className="ml-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
            Try it Live
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 text-[#2d3a2a]">
          <a href="#signup" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity">
            <UserPlus className="w-4 h-4" />
            Sign Me Up!
          </a>
          <a href="#login" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity">
            <LogIn className="w-4 h-4" />
            Enter
          </a>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-[#1f2a1d] transition-all duration-300 hover:bg-white/90"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <Menu
              className={`w-5 h-5 absolute transition-all duration-300 ${
                menuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
              }`}
            />
            <X
              className={`w-5 h-5 absolute transition-all duration-300 ${
                menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-20 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-[#1f2a1d]/40 backdrop-blur-sm" />
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-20 w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-8">
          <div className="flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-2xl font-semibold text-[#1f2a1d] py-4 border-b border-[#1f2a1d]/10 transition-all duration-500 ${
                  menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                }`}
                style={{ transitionDelay: menuOpen ? `${150 + i * 70}ms` : '0ms' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div
            className={`mt-8 flex flex-col gap-4 transition-all duration-500 ${
              menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
            style={{ transitionDelay: menuOpen ? '400ms' : '0ms' }}
          >
            <a href="#signup" className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a] sm:hidden">
              <UserPlus className="w-4 h-4" />
              Sign Me Up!
            </a>
            <a href="#login" className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a] sm:hidden">
              <LogIn className="w-4 h-4" />
              Enter
            </a>
            <button className="mt-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-5 py-3 rounded-full transition-colors">
              Try it Live
            </button>
          </div>
        </div>
      </div>

      {/* Hero copy */}
      <div className="relative z-10 flex flex-col items-center text-center pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6">
        <h1
          className="font-normal leading-[0.95] text-[#336443] text-[2rem] sm:text-4xl md:text-5xl lg:text-[4.75rem] xl:text-[5.25rem] max-w-5xl"
          style={{ fontFamily: '"Neue Haas Grotesk Display Pro 55 Roman", "Neue Haas Grotesk Text Pro", "Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: '-0.035em' }}
        >
          Close the rift{' '}
          <span className="text-[#85AB8B]">
            linking
            <br className="hidden sm:block" /> signals and action
          </span>
        </h1>
        <p className="mt-6 sm:mt-8 text-[#4b5b47] text-sm sm:text-base md:text-lg leading-relaxed max-w-md px-2">
          Shape scattered signals into meaningful outcomes via AI-driven workflows.
        </p>
      </div>

      {/* Bottom-left CTA block */}
      <div className="absolute left-4 right-4 sm:right-auto sm:left-6 md:left-10 bottom-6 sm:bottom-8 md:bottom-10 z-10 max-w-sm">
        <div className="flex items-center gap-2 text-[#3d5638] sm:text-white/95 mb-3">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold sm:font-medium">
            FluxEngine<sup className="text-[10px]">TM</sup>
          </span>
        </div>
        <p className="text-[#3d5638]/90 sm:text-white/85 text-xs leading-relaxed mb-6 max-w-xs font-medium sm:font-normal">
          LinkFlow smoothly unites your company systems, streamlining data paths between services without having to write custom scripts.
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <button className="bg-[#3d5638] sm:bg-white hover:bg-[#2d4228] sm:hover:bg-white/90 text-white sm:text-[#1f2a1d] text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors shadow-sm">
            Try it Live
          </button>
          <button className="text-[#3d5638] sm:text-white text-sm font-semibold sm:font-medium hover:opacity-80 transition-opacity">
            Know More.
          </button>
        </div>
      </div>

      {/* Bottom-right video link */}
      <div className="hidden sm:flex absolute right-6 md:right-10 bottom-8 md:bottom-10 z-10 items-center gap-2 text-white/90 text-sm">
        <button className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
          <Play className="w-3 h-3 fill-white text-white ml-0.5" />
        </button>
        <span className="font-medium">How we build?</span>
        <span className="text-white/60">1:35</span>
      </div>
    </section>
  );
}

export default App;
```



---



### Animation Details (all CSS, no Framer Motion)



| Element | Property | Values |
|-|-|-|
| Hamburger Menu/X icon swap | `transition-all duration-300` | Open: Menu gets `opacity-0 rotate-90 scale-50`, X gets `opacity-100 rotate-0 scale-100`. Closed: reverse. |
| Mobile overlay backdrop | `transition-opacity duration-300` | Open: `opacity-100 pointer-events-auto`. Closed: `opacity-0 pointer-events-none`. |
| Mobile drawer slide | `transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]` | Open: `translate-x-0`. Closed: `translate-x-full`. |
| Mobile nav links stagger | `transition-all duration-500` | Open: `translate-x-0 opacity-100`, delay per item: `150ms + i * 70ms`. Closed: `translate-x-8 opacity-0`, delay `0ms`. |
| Mobile CTA group | `transition-all duration-500` | Open: `translate-x-0 opacity-100`, delay `400ms`. Closed: `translate-x-8 opacity-0`, delay `0ms`. |
| Nav buttons | `transition-colors` | Default Tailwind duration (150ms). |
| Opacity links | `transition-opacity` | `hover:opacity-80`. |



---



### Key Layout/Spacing Notes



- Root section: `relative w-full min-h-screen sm:h-screen overflow-hidden`
- Navbar padding: `px-4 sm:px-6 md:px-10 py-4 sm:py-6`
- Desktop pill nav: `bg-white/70 backdrop-blur-md rounded-full pl-6 pr-1 py-1 shadow-sm border border-white/60`
- Hero heading: `pt-24 sm:pt-28 md:pt-32`, font sizes `text-[2rem] sm:text-4xl md:text-5xl lg:text-[4.75rem] xl:text-[5.25rem]`, `leading-[0.95]`, `letterSpacing: '-0.035em'`
- Bottom-left block: `absolute left-4 right-4 sm:right-auto sm:left-6 md:left-10 bottom-6 sm:bottom-8 md:bottom-10`
- Bottom-right video: `absolute right-6 md:right-10 bottom-8 md:bottom-10`

---



### Dependencies (package.json)



```JSON
{
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2"
  }
}
```


---

# 052 Loader Animation

# Loader Animation

Build a fullscreen loading screen component in React (Next.js 14, TypeScript). Uses Framer Motion for animations. Here is the exact specification:



Theme



css



--bg: #0a0a0a;

--text: #f5f5f5;

--muted: #888888;

--stroke: #1f1f1f;



Fonts: font-display → Instrument Serif (Google Fonts, italic, weight 400).



Component: LoadingScreen



Receives one prop: onComplete: () => void.



Container: <motion.div> — fixed inset-0 z-[9999] bg-bg. Exit animation: exit={{ opacity: 0 }}, duration 0.6s, ease [0.4, 0, 0.2, 1]. Wrap in <AnimatePresence mode="wait"> from the parent.



Element 1: "Portfolio" Label (Top-Left)



<motion.div> — absolute top-8 left-8 md:top-12 md:left-12.

Text: "Portfolio"

Class: text-xs md:text-sm text-muted uppercase tracking-[0.3em]

Entrance animation: initial={{ opacity: 0, y: -20 }}, animate={{ opacity: 1, y: 0 }}, duration 0.6s, delay 0.1s



Element 2: Rotating Words (Center)



absolute inset-0 flex items-center justify-center.

Three words cycle in sequence: "Design" → "Create" → "Inspire". A new word appears every 900ms. The word index increments via setInterval and stops at the last word (doesn't loop).



Each word is a <motion.span> inside <AnimatePresence mode="wait">, keyed by wordIndex:

Class: text-4xl md:text-6xl lg:text-7xl font-display italic text-text/80

initial={{ opacity: 0, y: 20 }}

animate={{ opacity: 1, y: 0 }}

exit={{ opacity: 0, y: -20 }}

transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}



Element 3: Counter (Bottom-Right)



<motion.div> — absolute bottom-8 right-8 md:bottom-12 md:right-12.

A number that counts from 000 → 100 over exactly 2.7 seconds using requestAnimationFrame. Each frame calculates elapsed / 2700 \* 100. The number is displayed zero-padded to 3 digits (e.g. 007, 042, 100):



{Math.round(progress).toString().padStart(3, '0')}



Class: text-6xl md:text-8xl lg:text-9xl font-display text-text tabular-nums

Entrance animation: initial={{ opacity: 0, y: 20 }}, animate={{ opacity: 1, y: 0 }}, duration 0.6s, delay 0.1s



When progress reaches 100: Wait 400ms, then call onComplete(). Use a ref for onComplete to avoid stale closures.



Element 4: Progress Bar (Bottom Edge)



absolute bottom-0 left-0 right-0. A 3px tall track:

Track: h-[3px] bg-stroke/50 (full width)

Fill: <motion.div> inside the track:

h-full origin-left

Background: linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)

Glow: boxShadow: "0 0 8px rgba(137, 170, 204, 0.35)"

initial={{ scaleX: 0 }}

animate={{ scaleX: progress / 100 }}

transition={{ duration: 0.1, ease: "linear" }}



Parent Wrapper Behavior



The parent component (AppWrapper) controls visibility:

State: isLoading starts true

Renders <LoadingScreen onComplete={() => setIsLoading(false)} /> inside <AnimatePresence mode="wait"> only when isLoading is true

Main page content sits below with: style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.5s ease-out" }}

When the loader calls onComplete, it triggers: loader fades out (0.6s) → page fades in (0.5s)



Timing Summary



0.0s — Loader appears, "Portfolio" slides in, counter starts at 000

0.0s — "Design" appears

0.9s — "Create" replaces "Design"

1.8s — "Inspire" replaces "Create"

2.7s — Counter hits 100, progress bar full

3.1s — onComplete fires (400ms delay)

3.1s — Loader fades out (0.6s exit animation)

3.7s — Page content fades in (0.5s opacity transition)


---

# 053 AI Automation

# AI Automation

Build a React + Vite + Tailwind CSS landing page for an AI agency called "COGNITRA". Use `framer-motion` for animations and `lucide-react` for icons. The design uses "Helvetica Now Var" font throughout. Here is the exact specification:



---



## FONT



Import via CSS:

```Plain Text
@import url('https://db.onlinewebfonts.com/c/e66905e07608167a84e6ad52f638c3c6?family=Helvetica+Now+Var');
```

Apply globally: `font-family: 'Helvetica Now Var', 'Helvetica Neue', Helvetica, Arial, sans-serif;`



---



## FadeUp ANIMATION COMPONENT



Create a reusable `FadeUp` component wrapping Framer Motion with these exact values:

- Props: `children`, `delay` (default 0), `duration` (default 0.7), `y` (default 24), `className`, `style`, `as` (polymorphic: div/section/span/h1/h2/h3/p/nav), `once` (default true)
- `initial={{ opacity: 0, y }}`
- `whileInView={{ opacity: 1, y: 0 }}`
- `viewport={{ once, amount: 0.2 }}`
- `transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}`

---



## LAYOUT STRUCTURE



The page is a single `<div style={{ position: 'relative' }}>` containing:



1. A **fixed full-viewport background video** (z-index 0)
2. A **fixed transparent navbar** (z-index 10)
3. **Section 1** -- Hero (100vh, z-index 1)
4. **Section 2** -- Statement (100vh, z-index 1, transparent bg over video)
5. **Section 3** -- Services (auto height, z-index 2, #C5C5C5 bg)
6. **Fixed scroll indicator** (bottom center, z-index 5)
7. **Fixed share/repost button** (bottom right, z-index 5)

---



## FIXED BACKGROUND VIDEO



```Plain Text
position: fixed, top: 0, left: 0, width: 100%, height: 100vh, objectFit: cover, zIndex: 0
src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_135830_bb6491d1-9b66-4aec-9722-13b4dfe3fb46.mp4"
autoPlay, muted, loop, playsInline
```



---



## NAVBAR (fixed, transparent)



- `position: fixed; top:0; left:0; right:0; z-index:10; background: transparent; border-bottom: 1px solid rgba(0,0,0,0.18); display:flex; align-items:center; justify-content:space-between; padding: 20px 32px;`
- **Left:** Brand "COGNITRA" -- FadeUp delay=0, fontSize 13px, fontWeight 700, letterSpacing 0.12em, uppercase, color #1a1a1a
- **Center:** Links ['MAIN', 'OFFERING', 'CASE', 'RATES'] in a flex row gap 48px. Each link wrapped in FadeUp with delay = 0.05 + i\*0.05. Links: fontSize 11px, letterSpacing 0.06em, color #1a1a1a, fontWeight 400
- **Right:** Links ['CREW', 'CONNECT'] same style, FadeUp delay = 0.3 + i\*0.05
- Hover on all links: opacity 0.6

---



## SECTION 1 -- HERO (100vh)



- `position: relative; zIndex: 1; height: 100vh;`
- **Top overlay div** (absolute, top:0, left:0, right:0, height: 48%, background: #C5C5C5, flex column, paddingTop: 70px)

  - Inner content area: `flex:1; display:flex; alignItems:flex-end; padding: 0 32px 24px 32px;`
  - **Hero row** (flex, stretch, width 100%, gap 48px):
  
    - **Left column** (width 32%, flex-column, justify space-between, gap 80px):
    
      - `<h1>` FadeUp as="h1" delay=0.1 -- "SCALING\nFASTER USING AI" -- fontSize clamp(26px, 3vw, 42px), fontWeight 700, lineHeight 1.05, letterSpacing -0.01em, uppercase, color #1a1a1a
      - Slide counter FadeUp delay=0.5 -- "001 / 005" -- fontSize 11px, letterSpacing 0.08em, color #666
    - **Right column** (flex:1, flex-column, justify space-between, gap 80px):
    
      - `<p>` FadeUp as="p" delay=0.25 -- "We engineer custom automation flows and personalized AI products for ambitious modern businesses." -- fontSize 18px, lineHeight 1.6, color #5a5a5a, maxWidth 340px
      - Buttons row (flex, gap 10px) FadeUp delay=0.4:
      
        - "BOOK A CALL!" -- btn-primary: bg #1a1a1a, color #fff, border 1px solid #1a1a1a, border-radius 9999px, padding 12px 36px, fontSize 11px, fontWeight 500, letterSpacing 0.08em, uppercase
        - "OUR PRODUCTS" -- btn-secondary: bg transparent, color #1a1a1a, border 1px solid #1a1a1a, same radius/padding/fontSize/weight/spacing. Hover: bg #1a1a1a, color #fff
- **Bottom-left text** (absolute, top 74%, transform translateY(-50%), left 32px, maxWidth 260px) FadeUp delay=0.6:

  - "Guiding future-minded companies forward with bespoke AI products and streamlined workflows." -- fontSize 14px, lineHeight 1.65, color rgba(255,255,255,0.9)

---



## SECTION 2 -- STATEMENT (100vh, transparent over video)



- `position:relative; zIndex:1; height:100vh; display:flex; flexDirection:column; justify-content:center; padding: 70px 32px 32px 32px;`
- Inner div: flex-column, align flex-start, maxWidth 720px, padding 80px 0
- `<h2>` -- fontSize clamp(26px, 3vw, 42px), fontWeight 700, lineHeight 1.08, letterSpacing -0.01em, uppercase, color #fff, display flex, flexWrap wrap, gap 0.25em

  - Text "WE BUILD END-TO-END AI AUTOMATION SYSTEMS." split by space, each word wrapped in FadeUp as="span" delay = 0.15 + i\*0.08, y=32
- `<p>` FadeUp as="p" delay=0.9 -- "We provide all-in-one AI automation services in one place." -- marginTop 24px, fontSize 14px, lineHeight 1.65, color rgba(255,255,255,0.85), maxWidth 260px

---



## SECTION 3 -- SERVICES (gray bg)



- `position:relative; zIndex:2; background:#C5C5C5; display:flex; flexDirection:column; padding: 70px 32px 80px 32px; min-height:auto;`
- **Counter**: FadeUp delay=0 -- "003 / 005" -- fontSize 11px, letterSpacing 0.08em, color #666, marginBottom 20px
- **Head row** (flex, gap 48px, align flex-start, marginBottom 32px):

  - Left col (width 32%): `<h2>` "EXPLORE WHAT WE OFFER" -- fontSize clamp(26px, 3vw, 42px), fontWeight 700, lineHeight 1.05, letterSpacing -0.01em, uppercase, color #1a1a1a, maxWidth 320px, display flex, flexWrap wrap, gap 0.25em. Each word FadeUp as="span" delay = 0.1 + i\*0.1, y=28
  - Right col (flex:1, paddingTop 8px): FadeUp as="p" delay=0.25 -- "We provide all-in-one AI automation services in one place." -- fontSize 14px, lineHeight 1.65, color #3a3a3a, maxWidth 320px
- **Cards grid** (CSS grid, 3 columns 1fr, gap 20px, grid-auto-rows 1fr):

  - 3 cards, each FadeUp delay = 0.4 + idx\*0.15:
  
    - Card container: bg transparent, border 1px solid rgba(0,0,0,0.18), borderRadius 20px, overflow hidden, flex column, paddingTop 16px
    - Video area: width 100%, aspectRatio 4/3, position relative, overflow hidden. Video inside: absolute inset 0, objectFit cover
    - Text area: padding 24px 28px 28px 28px
    
      - `<h3>` fontSize 18px, fontWeight 600, color #1a1a1a, marginBottom 14px
      - `<p>` fontSize 13px, lineHeight 1.6, color #3a3a3a
  - Card data:
  
    1. video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260513_220333_48163edc-995f-4513-9f44-48dbb07a7329.mp4`, title: "Process Streamlining", text: "We automate your processes by linking together the daily tools you rely upon. Lifting throughput and improving overall output."
    2. video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260513_221040_e6ba7c5a-864e-46e9-871e-341a176a7e3e.mp4`, title: "Strategic advisory", text: "We craft intelligent assistants that are adaptive, grasp context, and are skilled enough to handle highly intricate customer requests."
    3. video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260513_221104_fb538584-5b87-495f-952e-09ddd5a1792a.mp4`, title: "Assistant engineering", text: "Through our knowledge, we explore deep into your business and advise you on how AI powered automations may transform your operations."

---



## FIXED SCROLL INDICATOR (bottom center)



- `position:fixed; bottom:32px; left:50%; transform:translateX(-50%); zIndex:5;`
- CSS animation `scrollBounce`: `0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); }` -- 2s ease-in-out infinite
- Pill shape: width 22px, height 36px, border 1.5px solid rgba(0,0,0,0.75), borderRadius 11px, flex, justify center, paddingTop 6px
- Inner dot: width 3px, height 8px, background rgba(0,0,0,0.85), borderRadius 2px

---



## FIXED REPOST BUTTON (bottom right)



- `position:fixed; bottom:32px; right:32px; zIndex:5; display:flex; alignItems:center; gap:6px; color:rgba(0,0,0,0.8); fontSize:11px; letterSpacing:0.08em; uppercase; cursor:pointer;`
- Inline SVG (share icon), width 14, height 14, viewBox "0 0 24 24", fill none, stroke currentColor, strokeWidth 2, strokeLinecap round, strokeLinejoin round:

  ```Plain Text
  <circle cx="18" cy="5" r="3"/>
  <circle cx="6" cy="12" r="3"/>
  <circle cx="18" cy="19" r="3"/>
  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  ```
- Text: "REPOST"

---



## RESPONSIVE BREAKPOINTS



**@media (max-width: 900px):**

- nav padding: 16px 18px; nav-links gap: 18px; hide .nav-links-secondary
- hero-row: flex-direction column, gap 24px; hero-col-left/right: width 100%, gap 24px
- section-pad: 90px 18px 32px 18px; section-pad-lg: 90px 18px 60px 18px
- services-head-row: flex-direction column, gap 16px, marginBottom 24px; services-head-col: width 100%
- cards-grid: 1 column, gap 16px
- section-3: height auto, min-height 100vh
- hero-bottom-text: top auto, bottom 80px, transform none, left 18px, right 18px, maxWidth none
- btn-primary/secondary: padding 11px 22px, fontSize 10px

**@media (max-width: 600px):**

- nav-links gap: 14px; nav-brand fontSize: 12px
- hero-overlay height: 56%, paddingTop: 64px
- hero-buttons: flex-wrap wrap

---



## PACKAGES



- react, react-dom
- framer-motion
- lucide-react
- tailwindcss, postcss, autoprefixer
- vite, @vitejs/plugin-react


---

# 054 EMBER.dsgn

# EMBER.dsgn

Recreation Prompt

Build a fullscreen split-panel hero section for "EMBER.dsgn" — a digital design studio. Single-page React app, no routing.



Stack & dependencies

React 19 + TypeScript + Vite 6

Tailwind CSS 4 via @tailwindcss/vite

motion (framer-motion v12 successor — import from motion/react)

lucide-react for icons (ArrowUpRight, Menu, X)

hls.js for HLS video playback

Vite dev script: vite --port=3000 --host=0.0.0.0

Global styles (src/index.css)

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

@import "tailwindcss";



@theme {

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

}



body {

  @apply antialiased overflow-hidden;

}

Root container





 with: relative h-screen w-full font-sans text-white selection:bg-white/20 overflow-hidden bg-black. Three stacked layers inside (z-index order: video bg → split panels → nav → mobile menu overlay).



1. Background video (z-0)

Absolute, inset-0, full-cover

HLS stream URL: https://stream.mux.com/Q3hYHAcLU82ceOUgwDeO4HiwOc3WZn9JD02PugwzxHOI.m3u8

 attrs: muted loop playsInline autoPlay, classes absolute inset-0 w-full h-full object-cover scale-x-[-1] (horizontally mirrored)

In useEffect: if Hls.isSupported(), create new Hls(), loadSource, attachMedia, on MANIFEST_PARSED set playbackRate = 0.7 and call .play(). Cleanup with hls.destroy(). Safari fallback: set video.src directly and use loadedmetadata listener with same playback rate.

1. Split panels (z-10)

Outer wrapper: absolute inset-0 flex flex-col lg:flex-row z-10 pointer-events-none overflow-y-auto lg:overflow-hidden scrollbar-hide



Left panel — "EMBER" cutout effect

relative w-full lg:w-1/2 min-h-screen lg:h-full flex flex-col pointer-events-auto overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5

Blur layer: absolute inset-0, backgroundColor: rgba(131, 131, 131, 0.3), backdropFilter: blur(20px) (+ webkit prefix), with maskImage: url(#emberMask) so the EMBER letters cut a clear hole through the blur revealing the video.

SVG mask def:  with . White rect 100%×100%, then black-fill EMBER text in two responsive variants:

Mobile: 

Desktop: 

Text element: x=0 y=115 textLength="100%" lengthAdjust="spacingAndGlyphs", classes font-[900] tracking-tighter, inline fontSize: 130px, fill="black"

Content stack (z-20, pt-[12vh] lg:pt-[8vh] px-6 md:px-12):

Spacer matching the EMBER SVG: h-[20vh] lg:h-[25vh]

Vertical line: flex-grow flex flex-col pt-4 min-h-[100px] containing w-[1px] h-full bg-white/20

Footer block (pb-12 flex flex-col gap-6 pt-4):

"ABOUT" eyebrow: text-[10px] font-bold tracking-[0.3em] uppercase text-white/40

Heading: text-xl md:text-2xl font-normal leading-[1.3] text-white/90 — copy: "We shape striking digital identities through bold contrasts and meaningful motion."

 "Our design process transforms the primal into the powerful."

Bottom row: flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-white/10 pt-8 w-full gap-8 — three cells:

"Double Click and" caption + Explore Our Work link with 

Social links (Instagram, Telegram) — each with a w-1 h-1 bg-white rounded-full opacity-50 bullet

Address (hidden on mobile): 23 Industrial Lane, Unit 5 / London, UK, E2 8AA

All small-text uses text-[10px] font-bold uppercase tracking-widest; eyebrows use text-[9px]

Right panel — "STUDIO" word

relative w-full lg:w-1/2 min-h-[50vh] lg:h-full flex flex-col justify-end pb-8 lg:pb-2 pointer-events-auto overflow-hidden

Two concentric circles (decorative, centered, z-0): wrapper absolute inset-0 z-0 pointer-events-none flex justify-center → inner relative h-full aspect-square flex flex-col items-center containing two divs:

Circle 1: absolute top-[-10vh] lg:top-[-25vh] w-[40vh] lg:w-[60vh] h-[40vh] lg:h-[60vh] border border-white/20 lg:border-white/35 rounded-full

Circle 2: same size, top-[30vh] lg:top-[18vh]

STUDIO wordmark (z-10, relative w-full mb-1 px-6 md:px-[5%]):  with STUDIO

1. Navigation (z-50, fixed)

fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 py-6 lg:py-8 pointer-events-none — two pointer-events-auto groups.



Left group:



Logo: 2×2 grid of w-2 md:w-2.5 h-2 md:h-2.5 bg-[#FF5C35] squares (gap-0.5) + EMBER.dsgn text (text-lg md:text-xl font-black tracking-tighter)

Desktop nav links (hidden lg:flex items-center gap-6 text-[10.5px] uppercase font-medium tracking-[0.2em] text-white/70): WORKS, SERVICES, ABOUT, TEAM — each with a w-1 h-1 bg-white rounded-full opacity-50 bullet, hover:text-white transition-colors

Right group:



Language pill (hidden sm:flex border border-white/20 rounded-full px-4 py-1.5 text-[10.5px] font-medium tracking-widest uppercase items-center gap-3 bg-white/5 backdrop-blur-sm): EN | RU with separator at text-white/20

Mobile burger button (lg:hidden p-2) with , opens menu

Contacts pill (hidden sm:block border border-white/20 rounded-full px-6 py-2 text-[10.5px] font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-all bg-white/5 backdrop-blur-sm) with bullet + CONTACTS

1. Mobile menu overlay

State: isMenuOpen (useState boolean). Wrap in ; render  with:



initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}

transition={{ type: "spring", damping: 25, stiffness: 200 }}

Classes: fixed inset-0 z-[100] bg-black pointer-events-auto lg:hidden flex flex-col

Layout:



Header row: same logo + close button ()

Center links (flex-grow flex flex-col justify-center px-12 gap-8): map ['WORKS', 'SERVICES', 'ABOUT', 'TEAM', 'CONTACTS'] to  with initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i \* 0.05 }}, classes text-4xl font-bold tracking-tighter hover:text-[#FF5C35] transition-colors

Footer (p-12 border-t border-white/10 flex justify-between items-center): EN | RU toggle + UKRAINE / LONDON label

Color tokens

Brand orange: #FF5C35

All whites use opacity variants: white/5 white/10 white/20 white/35 white/40 white/70 white/90

Page background: pure black

Behavior summary

Video plays muted, looped, mirrored, at 0.7× speed

EMBER letters appear as a clear-glass cutout in a 20px backdrop-blur layer

STUDIO is solid white wordmark

Both wordmarks scale to fill their column via SVG textLength="100%" lengthAdjust="spacingAndGlyphs" with Inter weight 900

Mobile (


---

# 055 Cybersecurity Hero v2

# Cybersecurity Hero v2

**PROMPT:**



Build a dark, premium SaaS landing page hero section for a product called "Xero" — a data encryption service. Use React + TypeScript + Vite + Tailwind CSS + the `shaders` package (`shaders/react`) + `lucide-react`. Font: Inter (weights 300, 400, 500, 600, 700, 800) from Google Fonts.



---



**PAGE STRUCTURE:**



The page has a dark background (`#0a0a0f`) with 14px body padding. Everything is centered in a flex column. The structure is: Navbar > Hero Card > Brand Logos row.



---



**NAVBAR:**



- Full-width, max-width 1600px, using CSS Grid with 3 columns: `1fr auto 1fr`
- Left: Logo text "Xero" — font-size 1.05rem, weight 700, letter-spacing -0.01em, white
- Center: 3 navigation links ("Method", "Pricing", "Docs") — font-size 0.85rem, weight 400, color `#8888a8`, hover to white, 32px gap between links
- Right: Two buttons — "Login" (ghost pill: `rgba(255,255,255,0.06)` background, 1px border `rgba(255,255,255,0.08)`, white text, font-size 0.82rem, weight 500, border-radius 999px, padding 7px 18px) and "Sign Up" (solid white pill: white background, dark text `#0a0a0f`, font-size 0.82rem, weight 600, border-radius 999px, padding 7px 18px)
- Mobile (768px): Hamburger menu toggle (2 spans that animate into an X via translateY/rotate). Full-screen overlay menu slides in from right with `transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1)`. Links become 1.2rem centered vertically. Buttons become full-width stacked.

---



**HERO CARD:**



- Container: max-width 1600px, border-radius 20px, 1px border `rgba(255,255,255,0.07)`, `overflow: hidden`, position relative, background `#0d0b12`, padding `80px 40px 70px`, flex column centered, min-height 640px, text-align center.

**Layer 1 — Shader Background (z-index 0):**

Position absolute, inset 0, overflow hidden, border-radius 20px, pointer-events none, 100% width/height. Inner div and canvas forced to 100% width/height, position absolute inset 0.



Shader composition (from `shaders/react`):

```JavaScript
<Shader>
  <SolidColor color="#08071a" />
  <SineWave amplitude={0.36} blendMode="normal-oklch" color="#0582e8" frequency={0.2} position={{ x: 0.65, y: 0.67 }} softness={0.55} speed={0.3} thickness={0.72} />
  <SineWave amplitude={0.17} blendMode="normal-oklch" color="#f00e94" frequency={0.2} position={{ x: 0.6, y: 0.51 }} softness={0.54} speed={0.5} thickness={0.35} />
  <WaveDistortion angle={299} frequency={0.3} speed={0.2} strength={1} />
  <FilmGrain strength={0.07} />
</Shader>
```



**Layer 2 — Radial Gradient Arc (::before pseudo-element, z-index 0):**

A radial-gradient positioned at `circle at 50% -70%`:

- Transparent from 0-60%
- Gradually builds pink/magenta (`rgba(176, 48, 136, ...)`) from 63% to 79% with increasing opacity (0.03 to 0.82)
- Transitions to lighter pink at 85-87% (`rgba(210,70,175,0.92)`, `rgba(240,110,210,0.88)`)
- Near-white at 91-93% (`rgba(255,205,250,0.92)`, `rgba(255,240,255,0.98)`)
- Pure white at 95%
- Second radial gradient: `circle at 50% 35%`, `rgba(120, 40, 180, 0.08)` center, transparent at 50%

**Layer 3 — Grid Overlay (z-index 0):**

Position absolute inset 0. Background: two linear-gradients creating a 40px grid with `rgba(255,255,255,0.07)` 1px lines. Masked with `radial-gradient(circle at 50% -70%, transparent 60%, black 78%)` so the grid only shows where the arc glows.



---



**ICON PIPELINE (z-index 1, margin-bottom 52px):**



A horizontal row of 3 icon nodes connected by lines, with an animated beam traveling between them.



- **Left node** (46px circle, background `#1a1a24`): SVG layers/stack icon (polygon + 2 polylines). Neumorphic box-shadow. Dotted border ring (7px outset). Class `node-light-right` — has a `::before` pseudo with a radial-gradient highlight on the right side that fades in/out (opacity transition 0.3s) when `.active` class is toggled.
- **Center node** (64px circle, background `#1e1e2c`): Custom Xero "X" SVG logo (a circular pinwheel shape, white fill). Larger neumorphic shadows. Wrapped in a container with a `.splash` element — a 100px radial gradient circle (`rgba(255, 77, 200, 0.6)`) that animates scale 0.4 to 1.4 while fading out over 0.8s.
- **Right node** (46px circle): Shield icon with checkmark. Class `node-light-left` — same as left but highlight on the left side with a purple tint (`rgba(200, 100, 255, 0.5)`).
- **Connecting lines**: 160px wide, 1px height, gradient from `rgba(255,255,255,0.15)` to `rgba(255,255,255,0.07)` (reversed for right line).
- **Beam Animation** (requestAnimationFrame loop):

  - SVG overlay with a linearGradient (`#beam-gradient`): 5-stop gradient from transparent pink to white center to transparent purple.
  - Two `<path>` elements use refs — one for glow (strokeWidth 2, filter blur, opacity 0.6) and one crisp (strokeWidth 0.8).
  - Path coordinates computed dynamically from node positions via `getBoundingClientRect()`.
  - Animation states: `p1` (800ms, beam travels 0-50%, left node pulses active at 0-40%), `splash` (800ms pause, beam hidden, center splash animates), `p2` (800ms, beam travels 50-100%, right node activates at 60-100%), `idle` (1000ms pause). Loop repeats.
  - Beam position is controlled by shifting linearGradient x1/x2 attributes.

---



**HERO CONTENT (z-index 1, max-width 620px):**



- **Heading**: `<h1>` with text "The simple way" (weight 300, white) and `<strong>` block "encryption your data" (weight 400, gradient text: `linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0.6))` with background-clip text). Font-size: `clamp(2.4rem, 5.5vw, 4rem)`, line-height 1.1, letter-spacing -0.02em, margin-bottom 24px.
- **Subtitle**: "Fully managed data encrypting service and annotation platform for teams of all industries." — font-size 0.9rem, weight 400, line-height 1.6, color `rgba(255,255,255,0.4)`, max-width 440px, centered, margin-bottom 36px. Has a `<br>` after "annotation".
- **CTA Button**: "Get Started" — white background, dark text, font-size 0.88rem, weight 600, padding 12px 32px, border-radius 999px. Hover: opacity 0.9, translateY(-1px).

---



**BRAND LOGOS ROW (below hero card):**



- Flex row, centered, gap 64px, padding 32px 24px 10px, flex-wrap.
- 5 brand items: Expedia, asana, zenefits, HubSpot (with a superscript dot replacing the "o"), loom.
- Each: flex row, gap 10px, color `rgba(255,255,255,0.35)`, font-size 1.1rem, weight 500.
- Each has a simple 22px SVG icon in matching muted color (geometric/abstract representations, not actual brand logos).

---



**CSS VARIABLES:**

```Plain Text
--bg: #0a0a0f
--surface: #111118
--text: #f0f0f5
--text-muted: #8888a8
--accent: #c8a0e0
--accent-pink: #b04090
--border: rgba(255, 255, 255, 0.08)
```



---



**RESPONSIVE BREAKPOINTS:**

- 860px: Pipeline lines shrink to 80px
- 768px: Body padding 10px, hamburger menu activates, hero card padding 60px 20px, pipeline margin-bottom 32px, nodes shrink (38px/52px), `<br>` tags hidden, brands gap 32px
- 480px: Hero card border-radius 16px, brands gap 24px

---



**DEPENDENCIES:**

```JSON
"shaders": "^2.5.124",
"lucide-react": "^0.344.0",
"react": "^18.3.1",
"react-dom": "^18.3.1",
"@supabase/supabase-js": "^2.57.4"
```



Tailwind CSS 3.4, Vite 5.4, TypeScript 5.5.


---

# 056 ClearInvoice SaaS Hero

# ClearInvoice SaaS Hero

Create a high-fidelity, dark-mode Hero section for a SaaS product called "ClearInvoice" using React and Tailwind CSS.



Tech Stack:

Framework: React (Vite)

Styling: Tailwind CSS

Animation: motion/react (Framer Motion)

Icons: lucide-react

Video: Native HTML5 <video> with hls.js for streaming (Do NOT use react-player).



1. Background Video (Crucial):

Source: https://stream.mux.com/hUT6X11m1Vkw1QMxPOLgI761x2cfpi9bHFbi5cNg4014.m3u8

Behavior: Autoplay, Loop, Muted, PlaysInline.

Opacity: 100% (No dark overlay).

Implementation: Create a memoized BackgroundVideo component using hls.js to handle the .m3u8 stream natively. Ensure it cleans up properly on unmount to prevent "AbortError".

Z-Index: It must sit behind all content (-z-10).



1. Layout & Styling:

Font Family:

Headings: "Switzer" (Medium weight, tight tracking).

Body: "Geist" (Clean, legible).



Top Bar: A 5px high gradient bar at the very top: from-[#ccf] via-[#e7d04c] to-[#31fb78].

Navbar:

Logo on left.

Links (Features, Pricing, Reviews) centered.

Auth buttons (Sign In, Sign Up) on right.

Mobile: Hamburger menu that opens a full-width dropdown.



1. Hero Content:

Headline: "Manage your online store while save 3x operating cost" (Large text: text-6xl, tight leading).

Subhead: "ClearInvoice takes the hassle out of billing with easy-to-use tools." (White/90).

Animations: Use motion/react to stagger the entrance of the Text, Buttons, and Social Proof (Fade Up + Slide).



1. Button Styles (Exact Recreation):

Primary Button:

Background: Gradient from-[#FF3300] to-[#EE7926].

Glow: An absolute positioned div behind the button with bg-orange-600 blur-lg opacity-20.

Inner Stroke: A 1.5px border overlay (border-white/20) inside the button for a "glassy" edge.

Hover: scale: 1.05, glow increases to opacity-60, and an Arrow icon slides in from the left.



Secondary Button:

Background: bg-white/90 backdrop blur.

Inner Stroke: 1.5px border (border-black/5).

Hover: scale: 1.05, background becomes solid white.



1. Social Proof:

Row of 3 user avatars (overlapping borders).

Text: "Trusted by 210k+ stores worldwide".


---

# 057 RIVR

# RIVR

Build a Hero section for a DeFi dashboard named RIVR showcasing a sleek, glassmorphism aesthetic. Please mimic these exact specifications to ensure a premium UI.



Dependencies: 

- Use `lucide-react` for icons.
- Use `motion` (imported from `'motion/react'`) for animations.

1. Global Styles (`src/index.css`)

Import the custom 'Helvetica Regular' font, set the Tailwind theme properly, and reset the body. Exact CSS to include:

@import "tailwindcss";



@font-face {

    font-family: "Helvetica Regular";

    src: url("https://db.onlinewebfonts.com/t/a64ff11d2c24584c767f6257e880dc65.eot");

    src: url("https://db.onlinewebfonts.com/t/a64ff11d2c24584c767f6257e880dc65.eot?#iefix")format("embedded-opentype"),

    url("https://db.onlinewebfonts.com/t/a64ff11d2c24584c767f6257e880dc65.woff2")format("woff2"),

    url("https://db.onlinewebfonts.com/t/a64ff11d2c24584c767f6257e880dc65.woff")format("woff"),

    url("https://db.onlinewebfonts.com/t/a64ff11d2c24584c767f6257e880dc65.ttf")format("truetype"),

    url("https://db.onlinewebfonts.com/t/a64ff11d2c24584c767f6257e880dc65.svg#Helvetica Regular")format("svg");

}



@theme {

  --font-helvetica: "Helvetica Regular", ui-sans-serif, system-ui, sans-serif;

}



:root {

  font-family: var(--font-helvetica);

}



body {

  margin: 0;

  overflow-x: hidden;

  background-color: #f0f0f0;

}



1. App Structure (`src/App.tsx`)

Create a single `<main className="min-h-screen bg-[#f0f0f0]">` instance that returns the `<Hero />` component.



1. Hero Component (`src/components/Hero.tsx`)

Outer wrapper: `<div className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#f0f0f0]">`.

Inner container: `<section className="relative w-full max-w-[1536px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col items-center bg-white/10 group">`

Inside the `<section>`:

- The Video Background:

A `<video>` element with `autoPlay muted loop playsInline`.

Classes: `absolute inset-0 w-full h-full object-cover object-[65%] lg:object-center z-0`.

Source URL: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4` (Must use exactly this URL).

- The Content Layer:

A `<div className="relative z-10 w-full h-full flex flex-col items-center">`.

Inside it, place: `<Navbar />`, the text container, `<BottomLeftCard />`, and `<BottomRightCorner />`.

- Text Container:

`<div className="w-full flex flex-col items-center pt-8 px-6 text-center max-w-4xl">`. Inside it:

- `<HeroBadge />`
- A `<motion.h1>` with class: `text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal text-[#5E6470] mb-2 tracking-tight leading-[1.05]`. Text: "Fluid Asset Streams". Animation: initial={{ opacity: 0, scale: 0.98 }}, animate={{ opacity: 1, scale: 1 }}, transition={{ duration: 0.8, delay: 0.2 }}.
- A `<motion.p>` with class: `text-sm sm:text-base md:text-lg text-[#5E6470] opacity-80 leading-relaxed max-w-xl font-normal`. Text: "Access Smart Vaults, stake RIVR, NFTs, transform rigid holdings into liquid cash instantly.". Animation: initial={{ opacity: 0 }}, animate={{ opacity: 1 }}, transition={{ duration: 0.8, delay: 0.4 }}.

1. Navbar Component (`src/components/Navbar.tsx`)

Wrapper: `<nav className="flex items-center justify-between py-6 px-6 md:px-10 w-full relative z-10">`.

- Left Side (hidden spacer for centering): `<div className="flex-1 hidden md:block" />`
- Center Menu: `<ul className="hidden md:flex items-center gap-8 text-[rgb(45,45,45)] font-normal text-sm">`. Include items: Ecosystem, Economics (hasDropdown), Developers, Governance (hasDropdown). List items need: `cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 group`. Append a `ChevronRight` icon (classes: `w-4 h-4 transition-transform group-hover:translate-x-0.5`) if hasDropdown is true.
- Mobile Logo: `<div className="md:hidden"><span className="font-regular tracking-tighter text-xl text-[rgba(30,50,90,0.9)]">RIVR</span></div>`
- Right Button: `<div className="flex-1 flex justify-end">` wrapping a `<motion.button>` (whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}).

Button classes: `flex items-center bg-[rgba(30,50,90,0.8)] text-white rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 hover:bg-[rgba(30,50,90,1)] transition-colors group`. Inside button: Add an icon wrapper `<div className="bg-white/20 p-1 md:p-1.5 rounded-full flex items-center justify-center">` containing `ArrowUpRight` (w-4 h-4 md:w-5 md:h-5 text-white), and a text node "Book Demo" (`text-xs md:text-sm font-normal`).

1. HeroBadge Component (`src/components/HeroBadge.tsx`)

Returns a `<motion.div>` (initial opacity 0, y 20; animate opacity 1, y 0; transition duration 0.6, ease "easeOut").

Classes: `flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/20 mx-auto mb-3 w-fit`.

Contents: `<Sparkles className="w-4 h-4 text-[rgba(30,50,90,0.8)]" />` and text `<span className="text-[14px] font-normal text-[rgba(30,50,90,0.9)]">Fluid Staking</span>`.



1. BottomLeftCard Component (`src/components/BottomLeftCard.tsx`)

Returns a `<motion.div>` (initial x: -20, opacity: 0; animate x: 0, opacity: 1; transition: duration 0.8, delay 0.2).

Position/Styling: `absolute bottom-28 right-4 left-auto md:left-6 md:right-auto md:bottom-6 lg:bottom-10 lg:left-10 p-3 md:p-4 lg:p-5 rounded-[1.2rem] md:rounded-[1.5rem] lg:rounded-[2.2rem] bg-white/30 backdrop-blur-xl flex flex-col gap-2 lg:gap-3 min-w-[140px] md:min-w-[150px] lg:min-w-[180px] w-fit`.

- Top text block: column with "5.2K" (classes: `text-2xl md:text-3xl font-normal text-[rgba(30,50,90,0.9)] tracking-tight`) and "Active Yielders" (classes: `text-[10px] md:text-[12px] font-normal text-[rgba(30,50,90,0.6)] uppercase tracking-wider`).
- Join Discord `<motion.button>` (hover/tap scale 1.02/0.98). Classes: `flex items-center bg-white rounded-full pl-1.5 pr-5 py-1.5 gap-2 hover:bg-white/90 transition-colors self-start group`. Inside: wrap `ArrowUpRight` in `<div className="bg-[rgba(30,50,90,0.1)] p-1 rounded-full ...">` (using `text-[rgba(30,50,90,0.9)]` for icon) and append "Join Discord" text (`text-[14px] font-normal text-[rgba(30,50,90,0.9)]`).

1. BottomRightCorner Component (`src/components/BottomRightCorner.tsx`)

This requires a complex faux-cutout layout. Use a `<motion.div>` (initial y: 20, opacity: 0; animate y: 0, opacity: 1; duration: 0.8, delay: 0.4).

Classes: `absolute bottom-0 right-0 p-3 pt-5 pl-8 sm:p-4 sm:pt-6 sm:pl-10 md:p-6 md:pt-8 md:pl-14 bg-[#f0f0f0] rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3.5rem] flex items-center gap-3 sm:gap-4 md:gap-6`.

CRITICAL corner masks to include inside this container:

- Top intersection mask: `<div className="absolute -top-[1.5rem] sm:-top-[2rem] md:-top-[3.5rem] right-0 w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none"><svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#f0f0f0"/></svg></div>`
- Left intersection mask: `<div className="absolute bottom-0 -left-[1.5rem] sm:-left-[2rem] md:-left-[3.5rem] w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none"><svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#f0f0f0"/></svg></div>`

Content: 

- Circle Icon: A div with `bg-[rgba(30,50,90,0.05)] w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-[rgba(30,50,90,0.1)]` using `ArrowUpRight` (`text-[rgba(30,50,90,0.8)]`).
- Info column containing title "Documentation" (`text-[16px] md:text-[20px] font-normal text-[rgba(30,50,90,0.95)]`). Below it, a line containing text "Library" and a `ChevronRight` icon wrapped in `<div className="flex items-center gap-1 text-[rgba(30,50,90,0.6)] cursor-pointer hover:text-[rgba(30,50,90,0.8)] transition-colors"><span className="text-[12px] md:text-[15px] font-normal">...`


---

# 058 Nimbus Grid

# Nimbus Grid

Build a single-page marketing site called **Nimbus Grid** — a fictional secure cloud storage capacity platform. Use plain HTML, CSS, and vanilla JS (Vite project). Match every detail below exactly.



---



## Global Setup



**Fonts (Google Fonts, preconnect both gstatic + googleapis):**

- `IBM Plex Sans` weights 400, 500 — body/headings
- `IBM Plex Mono` weights 400, 500 — labels, code, nav, CTAs

**CSS variables (`:root`):**

```Plain Text
--bg: #17130d
--ink: #fff4d5
--muted: #dacaa1
--line: rgba(255,240,199,0.28)
--glass: rgba(255,239,199,0.16)
--glass-strong: rgba(255,239,199,0.24)
--accent: #ead09a
--accent-2: #ffd879
--deep: #4d3f24
--radius: 8px
color-scheme: dark
```



**Body:** dark warm background `radial-gradient(circle at top left, rgba(255,216,121,0.18), transparent 28rem) + var(--bg)`, ink color `#fff4d5`, IBM Plex Sans, font-size 1rem, line-height 1.375, letter-spacing 0.0175rem, antialiased. `<meta name="theme-color" content="#17130d">`.



**Smooth scroll** on `html`. Universal `box-sizing: border-box`. Anchor links inherit color, no underline.



---



## Section 1 — Hero



Full-viewport (`min-height: 100svh`) section with:



- **Animated shader background** as an `<iframe class="shader-bg" src="``https://fragcoord.xyz/embed/c6zisyc6?viewport=1422x800``" allow="autoplay; fullscreen" referrerpolicy="no-referrer">` absolutely positioned, centered with `transform: translate(-50%,-50%) scale(var(--shader-scale,5))`, `z-index:-3`, pointer-events none.
- **Fallback layer** `.shader-fallback` behind it (`z-index:-4`) — radial+linear warm-gold gradient (`#846f43 → #f0d27c → #fff2be`) so the page still looks intentional if the shader fails.
- JS: on load + debounced resize (180ms), recompute viewport so shader iframe matches window aspect, capped at 1422×800, scale = max(window.innerWidth/width, (window.innerHeight+110)/height).

**Site header (`.site-header`)** — flex row, `min-height: 42px`:

- Brand `NIMBUS GRID` in a glass pill (`padding: 9px 12px`, 1px ink-translucent border, `backdrop-filter: blur(18px) saturate(1.35)`, IBM Plex Mono 12px uppercase, inset highlight + soft shadow).
- Right side: nav (`Technology`, `Security`, `Capacity`, `Operations`) — Plex Mono 12px uppercase, 0.04rem letter-spacing, ink-translucent color, hover brightens.
- `.header-cta` button "Get Started" — same glass pill style, hover lifts 1px and brightens.

**Hero layout (grid, two rows):**

- **Top-left console card (`.console-card`)** width `min(396px, 42vw)`, dark `rgba(13,16,19,0.88)` panel, 5px radius, blurred backdrop:

  - Tabs row (`grid-template-columns: repeat(3,minmax(0,77px)) 1fr auto`): `CLI`, `API`, `Console`, plus two fake window controls (small square + a wide bar). Active tab gets accent color and a 2px accent underline.
  - Three panes (only one shown):
  
    - **CLI:** `<pre>` showing `$ nimbus storage create \ --workspace prod-web \ --tier encrypted-fast \ --region eu-central` with `$` in accent color, then a typing-output line `storage pool web-db-test queued` in accent.
    - **API:** `POST /v1/storage/pools` JSON body `{name:"web-db-test", tier:"encrypted-fast", quota:"8 TiB"}`, output `202 accepted: provisioning policy attached`.
    - **Console:** mock form fields — `Instance name = web-db-test` (typed), `Image = ubuntu-24.04-noble`, two-column row `Memory = 8 GiB` / `CPUs = 2`. Each `console-input` is a 33px high outlined dark slot, the two select-style ones get a `▾` glyph appended.
  - Pane size `min-height:153px`, Plex Mono 11px text.
  - JS typewriter: per active pane, find `[data-typed]`, type one char every 42ms, blinking `::after` cursor (1px wide bar, `cursor-blink` 1s steps animation).
- **Hero copy** at bottom-left:

  - H1: "Cloud space that scales with your business systems." — Plex Sans 400, `clamp(29px,3.5vw,56px)`, line-height 1, max-width 18ch.
  - Paragraph: "Nimbus Grid sells secure cloud storage capacity for companies that need fast onboarding, predictable throughput, encrypted collaboration, and modern data residency controls." — `clamp(12px,1.125vw,16.5px)`, ink color, max-width 720px.
  - Add a soft dark radial blur behind the text (`::before` with blurred ellipse, filter blur 26px) so copy stays readable over the shader.

---



## Section 2 — Platform accordion (scroll-driven)



`#platform`, `min-height: 420svh`, near-black `#050604` background with subtle gold radial top-right.



- `position: sticky` inner panel (`.accordion-inner`) at `top:0`, full viewport height, two-column grid `0.22fr | 0.78fr`.
- **Left nav** (`.accordion-nav`): four pill labels in Plex Mono 11px uppercase, each prefixed by a 7px square dot:Active tab uses accent color and shifts right 2px.

  1. `Programmable infra`
  2. `Data residency`
  3. `Elastic scaling`
  4. `Unified visibility`
- **Right stack** (`.accordion-stack`, height `min(80svh, 820px)`): four `.accordion-card` panels stacked with `position:absolute; inset:0`. Each card is a two-column grid (copy + visual) on a black background with a 1px ink top border.`01 storage_pool = { 02 name = "client-vault" 03 region = "eu-central" 04 quota = "24 TiB" 05 policy = encrypted_fast 06 }`

  - **Card 1 — Programmable infra:** copy + a code window:

  - **Card 2 — Data residency:** code window with `Region policy / EU Central locked / US East allowed / AP Southeast review / Retention 7 years`.
  - **Card 3 — Elastic scaling:** `Capacity forecast / Used 18.4 TiB / Reserved 24 TiB / Burst ready / Next tier approved`.
  - **Card 4 — Unified visibility:** `Operations view / Sync health stable / Cold data 14% / Policy drift 0 / Audit export live`.
  - Each visual: warm gold gradient backdrop (`linear-gradient(135deg, rgba(234,208,154,0.92), rgba(106,91,52,0.68))` + radial highlight), centered dark code window with 3 dot-spans, 8px radius, deep shadow.

**Scroll behavior (JS):**

- Track section's `getBoundingClientRect()` → progress 0..1 over `(height - viewport)`.
- Map to active card index (rounded). Card N's translateY animates from `stackHeight + collapsedHeight` (off-bottom) up to `index * collapsedHeight` (collapsed=84px desktop / 96px mobile), clamped per segment.
- Each card sets `--card-y` (transform) and `--card-clip-bottom` (clip-path inset) so the active card fully reveals while previous cards stay as visible header strips.
- Clicking a tab smooth-scrolls window to that card's segment.

---



## Section 3 — Pricing



`#pricing`, dark olive `#11120f` with light top wash and a soft cyan radial blur (`rgba(151,211,235,0.14)`) bleeding from the top-left.



**Top grid** (max-width 1320px, two columns \~`0.38 | 0.62`):

- **Left copy:**

  - Eyebrow `Pricing` (accent, Plex Mono 16px uppercase).
  - H2: "Only pay for cloud storage your teams actually use." `clamp(34px,4vw,68px)`, line-height 1.
  - Paragraph: "Scale capacity up for active projects and cool it down when workspaces go quiet. Nimbus Grid keeps storage, transfer, and policy costs visible before they become invoices."
- **Right pricing table** (`.pricing-table`): header row "Storage costs" + a billing toggle pill (`Per month` muted, `Per GiB` active = accent pill with `#241d0f` text). Then 5 rows separated by 1px ink lines, each `1fr | auto`:Right values use Plex Mono.

  - Encrypted active storage — `$0.021 / GiB / month`
  - Warm collaboration tier — `$0.012 / GiB / month`
  - Cold retained archive — `$0.004 / GiB / month`
  - Regional accelerated transfer — `$0.018 / GiB moved`
  - Customer-managed key vault — `included`

**Pricing bars** — full-bleed (`width: 100vw; margin-left: calc(50% - 50vw)`), 12-column grid, `height: 480px`, bars aligned to bottom. Each bar height = `var(--bar-height) + var(--bar-morph,0px)`, min-height 120px, gold gradient (alternating "muted" variant). Heights start at 12 fixed values (66/58/50/62/45/54/48/64/72/70/78/82%). Top edge fades into the section via gradient overlay.



**JS** ties bar height to scroll position: `progress = (viewport - rect.top) / (viewport + rect.height)`, then per-bar `morph = sin(progress*2π + i*0.72)*34 + cos(progress*π + i*0.34)*14` px, written to `--bar-morph`. Transitions `height 80ms linear`.



**Plan row** below — 3 columns (Starter / Team / Enterprise), each card max 300px:

- Starter: "For small teams consolidating shared project files." CTA `Start small`.
- Team: "For departments scaling collaboration and regional transfer." CTA `Build team plan`.
- Enterprise: "For organizations prioritizing governance, residency, and support." CTA `Talk to sales`.

CTAs: 42px tall pill, Plex Mono 12px uppercase, 1px ink translucent border, glass background, hover brightens.



---



## Section 4 — Security



`#security`, `#120f0a` background with two soft radial highlights (gold top-right, warm orange bottom-left), 1320px max-width.



**Heading row** (two columns `0.58 | 0.42`):

- Left: eyebrow `Security` + H2 "Modern encryption and compliance controls without slowing the team down."
- Right paragraph: "Role-based access, customer-managed keys, immutable retention, and regional storage policies give business clients a cloud layer that can satisfy procurement, IT, and legal from the first deployment."

**Three security cards** (`grid-template-columns: repeat(3, 1fr)`, gap `clamp(16px,2vw,22px)`, each `min-height: 464px`, square corners, 1px ink border, `#0f0c08` with subtle top wash):



1. **API card — "Full policy control"** + copy "First-class API access for storage pools, keys, regions, and retention rules. No vendor lock-in to proprietary workflows."

   - Visual: a black `.api-window` (bottom-left, \~58% width, 184px tall) with three dots and pre-text:
   
     ```Plain Text
     -> nimbus auth login
     Enter code
     VAULT-9AMP
     
     -> policy attach
     workspace/client-vault
     ```
   - An overlapping `.api-spec` (top-right, gold-tinted dark `rgba(64,52,30,0.86)`, accent border) showing:
   
     ```Plain Text
     openapi: 3.0.0
     info:
       title: Nimbus API
     paths:
       /storage/pools:
       /keys:
       /regions:
       /retention:
     ```
2. **Compliance card — "Full compliance"** + copy "SOC 2, ISO 27001, and GDPR-ready controls help teams satisfy audits, procurement reviews, and data residency requirements." Below: three rows, each a 24px circular accent badge with a checkmark drawn via `::before` (rotated bottom+left borders), small label, accent strong line:Rows are `rgba(48,39,23,0.84)` with accent-translucent borders.

   - SOC 2 — Type II controls
   - ISO 27001 — Security management
   - GDPR — Regional data policy
3. **Economics card — "Ownership and predictable economics"** + copy "Reserved capacity, clear transfer lanes, and audit-ready billing make storage spend easy to forecast across business units."

   - Visual: `<pre class="binary-map">` of 1s and 0s drawing a small graphic (10 rows, 28 columns, see the exact pattern in the original — a small icon shape carved out of 1s).
   - Below: 3-row asset table — `Reserved tier | 24 TiB`, `Transfer lane | EU Central`, `Revision | Q603`. Mono 11px uppercase labels, mixed-case values.

---



## Section 5 — Console showcase



`#plans`, dark teal-leaning `#070a0b` with cyan radial accent. Includes a faint repeating-stripe block (decorative `::after`, top-right).



**Heading row:** H2 "The biggest forward leap in business cloud storage operations." (`clamp(25px,4vw,52px)`, color `#dff5ff`) + right paragraph "A single control plane for provisioning storage pools, reviewing policy, watching growth, and shipping audit-ready reports without asking teams to change how they work."



**Figure label:** small Plex Mono pill `Fig. 2  Nimbus Grid web console`.



**Dashboard shell** (`.dashboard-shell`):

- Full-width, 8px radius, cyan-translucent border, `rgba(5,8,10,0.9)` background, deep shadow, perspective transform.
- Topbar: 3 dots + a placeholder title bar.
- Body grid `240px | 1fr`:| Name | Region | Used | Policy | State || finance-vault | EU Central | 18.4 TiB | 7 years | Healthy || design-assets | US East | 9.8 TiB | Versioned | Syncing || legal-archive | EU Central | 42.1 TiB | Immutable | Healthy || migration-lane | AP South | 6.2 TiB | Temporary | Queued |Headers in Plex Mono uppercase, States in cyan Plex Mono uppercase.

  - **Sidebar** "Client Vault" + nav items: Workspaces, **Storage Pools** (active, cyan tint), Retention, Access, Transfers, Reports.
  - **Main:** title row "Storage Pools" (cyan `#97d3eb`) + `New pool` cyan-outlined button. Then a 5-column table:
- **Toast** absolutely positioned bottom-right: "Pool created / finance-vault ready" (cyan, dark background).
- Hover effect: shell tilts subtly (`rotateX(1deg) rotateY(-1.2deg) translateY(-8px)`), border brightens, a sheen pseudo-element sweeps left→right (`transform: translateX(-34%) → 34%`, opacity 0→1).

---



## Section 6 — Operations cube



`#operations`, `#0c0d0a` with cyan + gold radial accents; left-to-right dark gradient overlay so the copy reads cleanly.



**Two columns** `0.44 | 0.56`:



- **Left copy:** eyebrow `Operations`, H2 "A control layer for every storage move your business makes." (`clamp(34px,4.4vw,72px)`, line-height 0.98), paragraph "Route migrations, active workspaces, archives, and compliance exports through one operational grid. Nimbus Grid keeps capacity, policy, and transfer status visible before teams hit a limit." CTA button `Plan operations` — solid accent gold pill, dark `#1b160d` text, hover swaps to `--accent-2` and lifts 2px.
- **Right visual:** a 3D cube with explode-on-click animation.

  - `.modal-cube-shell` button, perspective 1000px, `transform-style: preserve-3d`.
  - `.operations-core-cube` size `clamp(142px,18vw,250px)` with 6 `.cube-face` divs (front/back/right/left/top/bottom). Each face: 18px radius, gold-blue radial gradient (`radial-gradient(circle at 48% 44%, rgba(255,216,121,0.98)…) + linear 135deg cyan→gold→dark`), inset highlights and shadows.
  - Idle: floats with `core-cube-float` 6s ease-in-out infinite (small Y bob and rotation drift).
  - On click (toggle `is-exploded`): core cube scales to 0.72; \~14 `.cube-particle` shards (10 cube fragments + 4 small `.dot` spheres) translate to randomized `--tx/--ty/--tz` offsets with `--s`, `--r`, staggered `--d` delays. Particles use `cubic-bezier(0.17,0.78,0.18,1)` 760ms transform + 420ms opacity; start blurred + dim, end sharp. Use the exact 14 particle definitions from the original (see hero-section markup pattern, ranges roughly tx: -310..330, ty: -250..225, tz: 30..210, s: 0.09..0.58).
  - JS: on `click` (also Enter/Space when focused), toggle the `is-exploded` class. Focus outline 1px ink-translucent, offset 10px.

---



## Responsive Behavior



**`@media (max-width: 820px)`:**

- Header collapses to single column, nav wraps full-width, CTA full-width.
- Hero layout stacks; console card becomes full width; the diagonal `.console-line` decoration hides.
- Console tabs become 3 equal columns (48px tall). Window controls hide. Pane min-height 200px.
- Pricing top + plan row + security grid stack to single column.
- Accordion: nav 2-column grid above the stack, stack height 78svh, cards become 1-column.
- Console showcase: heading stacks; dashboard body single column; sidebar nav 2-cols; table drops Policy + State columns; toast becomes inline at bottom.
- Operations: stacks; cube `--spread: 0.72`.

**`@media (max-width: 520px)`:**

- Hero padding 22px 18px 0; H1 `clamp(28px,10vw,48px)`; copy 15px.
- Accordion nav 1-column.
- Operations cube `--spread: 0.48`; visual min-height 360px.
- Dashboard title row stacks vertically.

---



## Animations Summary



- `cursor-blink` — 1s infinite blinking caret in console (steps(2,start)).
- `core-cube-float` — 6s infinite gentle Y bob + tiny rotation drift on idle cube.
- Bar heights — JS-driven `--bar-morph` updates on scroll, eased to height with `transition: height 80ms linear`.
- Accordion cards — JS-driven `--card-y` translate + `--card-clip-bottom` clip-path follow scroll progress.
- Dashboard shell hover — 220ms ease 3D tilt + sheen sweep (520ms ease).
- Operations CTA hover — 160ms color/transform.
- Operations cube — click toggles `.is-exploded`: core 620ms cubic-bezier transform; shards 760ms cubic-bezier transform + 420ms opacity, staggered delays.
- Header CTA / accordion-tab / nav links — 160–200ms hover transitions.
- Smooth scroll on tab → section navigation.

---



## Project structure



```Plain Text
index.html         (full markup)
styles.css         (all styles + media queries)
script.js          (shader resize, console tabs typing, accordion scroll, bars, cube)
package.json       (vite ^5.4.2, type:module, scripts: dev/build/preview)
vite.config.js     (default)
```



Build with `npm run build`. The site uses no frameworks, no images — every visual is CSS/SVG/text.


---

# 059 WISA Space-Hero Section

# WISA Space-Hero Section

Google AI Studio app – no prompt text


---

# 060 Book Hero

# Book Hero


---

# 061 AI Designer Portfolio

# AI Designer Portfolio

Create a single-page landing page for a creative design studio called "Viktor Oddy" using React, TypeScript, Vite, and Tailwind CSS. Use lucide-react for icons. The page has a white background throughout and uses two custom fonts: "PP Neue Montreal" (body text, loaded from Webflow CDN) and "PP Mondwest" (serif accent font, loaded from a local /PPMondwest-Regular.woff2 file). The body default font is PP Neue Montreal with system fallbacks.



The page consists of these sections in order:



1. HERO SECTION (centered, narrow column max-w-[440px], px-6, pt-12 md:pt-16)

Logo text: "Viktor Oddy" in PP Mondwest serif font, text-[32px] md:text-[40px] lg:text-[44px], font-semibold, color #051A24, tracking-tight, mb-4. Fades in with staggered animation (delay 0.1s).

Tagline: "The creative studio of Viktor Oddy" in monospace font (font-mono), text-xs md:text-sm, color #051A24, mb-2. Animation delay 0.2s.

Main Heading: Two lines: "Build the next wave," and "the bold way." where "next wave" and "bold way." are in PP Mondwest serif. Text is text-[32px] md:text-[40px] lg:text-[44px], leading-[1.1], color #0D212C, tracking-tight, whitespace-nowrap. Animation delay 0.3s.

Description: Three paragraphs in a flex-col gap-6 container, text-sm md:text-base, color #051A24, leading-relaxed, mt-5 md:mt-6. Animation delay 0.4s.

Paragraph 1: "I spent seven years at Apple crafting products used by over a billion people. I founded Vortex Studio to bring that same level of thinking to innovators shaping what comes next."

Paragraph 2: "The studio is deliberately small. I guide the creative vision on every project, backed by a veteran design crew that moves fast without cutting corners."

Paragraph 3: "Projects start at \$5,000 per month."

Two buttons in flex-col sm:flex-row, gap-3 md:gap-4, mt-5 md:mt-6. Animation delay 0.5s:

"Start a chat" (primary: bg-[#051A24], text white, rounded-full, px-7 py-3, with a complex multi-layered box-shadow including an inset highlight)

"View projects" (secondary: bg-white, text #051A24, no border, with subtle shadow)

1. INFINITE MARQUEE (full width, mt-16 md:mt-20, mb-16)

Horizontally scrolling image strip. Uses 8 GIF images duplicated (total 16) in a flex row with animate-marquee CSS animation (translateX(0) to translateX(-50%), 30s linear infinite on desktop, 10s on mobile). Images are h-[280px] md:h-[500px], object-cover, mx-3, rounded-2xl, shadow-lg.



Image URLs (all from motionsites.ai):



https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif

https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif

https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif

https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif

https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif

https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif

https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif

https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif

1. TESTIMONIAL QUOTE SECTION (py-12, px-6, max-w-2xl, centered)

A quote icon (lucide-react Quote, w-6 h-6, text-slate-900). Animation delay 0.1s.

Large quote text: 'I left Apple to build the studio I always wanted to work with' where "Apple" is in PP Mondwest serif. Text sizing: text-[32px] md:text-[40px] lg:text-[44px], leading-[1.1], color #0D212C, tracking-tight. Animation delay 0.2s.

Author: "Viktor Oddy" in italic, text-sm, color #273C46. Animation delay 0.3s.

Three company logo names displayed as text: "Apple" (80px wide, 24px font), "IDEO" (83px wide, 24px font), "Polygon" (110px wide, 24px font). Font-medium, text-slate-900. Animation delay 0.4s.

Below logos: A parallax image (scrolls with a parallax effect based on viewport position, max offset 200px). The image URL is: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260330_103804_7aa5494f-4d5b-432e-9dc7-20715275f143.png&w=1280&q=85. Alt text "Chris Halaska". w-full max-w-xs rounded-2xl shadow-lg. Animation delay 0.5s. The parallax uses IntersectionObserver + scroll listener with requestAnimationFrame.

1. PRICING SECTION (full width, py-12, px-6)

Two cards in a grid (grid-cols-1 md:grid-cols-2, gap-8), aligned right on desktop (md:justify-end, md:max-w-4xl). Each card has rounded-[40px], pl-10 pr-10 md:pr-24 pt-3 pb-10.



Card 1 (Dark): bg-[#051A24], inset shadow. Text color #F6FCFF / #E0EBF0. Animation delay 0.1s.



Title: "Monthly Partnership" (text-[22px], font-medium)

Description: "A dedicated creative design team. / You work directly with Viktor."

Price: "\$5,000" (text-2xl, color #F6FCFF), "Monthly" below

Two buttons: "Start a chat" (primary) + "How it works" (secondary), both linking to https://halaskastudio.com/./book

Card 2 (Light): bg-white, shadow-[0_4px_16px_rgba(0,0,0,0.08)]. Animation delay 0.2s.



Title: "Custom Project" (text-[22px], font-medium)

Description: "Fixed scope, fixed timeline. / Same team, same standards."

Price: "\$5,000" (text-2xl, color #0D212C), "Minimum" below

One button: "Start a chat" (tertiary variant: white bg with combined shadow)

1. TESTIMONIAL CAROUSEL (full width, py-20)

Header row (md:max-w-4xl, md:ml-auto): Title "What builders say" (where "builders" is in PP Mondwest serif, same large heading size) on left. On the right: 5 filled black star icons (lucide-react Star, w-5 h-5, fill-black) + "Clutch 5/5" text.

Auto-scrolling carousel (3s interval, pauses on hover) with prev/next circular buttons (w-12 h-12 rounded-full, border border-[#0D212C]/20, lucide ChevronLeft/ChevronRight).

Cards are 427.5px wide on desktop (full width minus 48px on mobile), gap-6, with exit animation (opacity fade + scale down). Each card: bg-white, rounded-[32px] md:rounded-[40px], shadow-[0_4px_16px_rgba(0,0,0,0.08)], px-6 md:pl-10 md:pr-24 py-8.

Card content: SVG quote mark icon (custom path), quote text (text-base, color #0D212C, leading-relaxed), author row with circular avatar (w-12 h-12), name (font-semibold, text-sm), role/company with arrow prefix.

Testimonials array uses Pexels avatar images. The testimonials are tripled for infinite scroll effect. Transform uses cubic-bezier(0.4, 0, 0.2, 1) with 0.8s transition.

5 testimonials:



Marcus Anderson, CEO, Data.storage - "With very little guidance team delivered designs that were consistently spot on..."

alexwu, Founder, Nexgate - "Viktor led the creation of our best fundraising deck to date!..."

James Mitchell, VP Product, LaunchPad - "Working with Viktor transformed our product vision..."

Rachel Foster, Co-founder, Nexus Labs - "The design quality exceeded our expectations..."

David Zhang, Head of Design, Paradigm Labs - "Incredible work from start to finish..."

1. PROJECTS SECTION (max-w-[1200px], px-6, py-12)

Vertical stack of 3 project items (gap-16 md:gap-20). Each has:



Text block offset left (ml-20 md:ml-28): Project name in PP Mondwest serif (text-2xl md:text-3xl, font-semibold, color #051A24) + description (text-sm md:text-base, color #051A24/70)

Full-width image below (rounded-2xl, shadow-lg, object-cover)

Each item independently triggers fade-in animation via IntersectionObserver.

Projects:



"evr" - "From idea to millions raised for a web3 AI product" - https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif

"Automation Machines" - "Streamlining industrial automation processes" - https://motionsites.ai/assets/hero-automation-machines-preview-DlTveRIN.gif

"xPortfolio" - "Modern portfolio management platform" - https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif

1. PARTNER SECTION (full width, py-12, px-6)

Large white container (max-w-7xl, py-48, rounded-[40px], subtle shadow). On mouse hover, GIF thumbnails (from the marquee images array) spawn at cursor position with random rotation (-10 to +10 deg), fade out over 1000ms with scale-down, spawning every 80ms minimum. Uses requestAnimationFrame-style cleanup.



Centered heading: "Partner with us" in PP Mondwest serif, text-[48px] md:text-[64px] lg:text-[80px], color #0D212C, mb-12.

CTA button: Dark pill with circular avatar image (Pexels photo 415829, w-10 h-10 rounded-full) + "Start chat with Viktor". Same primary button shadow style.

1. FOOTER (full width, py-12, px-6, max-w-[1200px])

Flex row (md:flex-row). Left side: "Start a chat" primary button. Right side: ArrowUpRight icon (lucide-react), then two columns of links:



Column 1: Services, Work, About (anchor links)

Column 2: x.com, LinkedIn (external links, target \_blank)

All links: text-base, color #051A24, hover:opacity-70 transition.



1. COPYRIGHT BAR (max-w-[1200px], px-6, py-4)

Flex row justify-between: "Vortex Studio Limited" on left, "Austin, USA" on right. Text-sm, color #051A24.



1. FIXED BOTTOM NAV (z-50, centered)

Floating pill fixed to bottom (bottom-6, centered via left-1/2 -translate-x-1/2). White bg, rounded-full, px-8 py-2, complex layered shadow. Contains: "V" letter in PP Mondwest serif (text-2xl, font-semibold, color #051A24) + "Start a chat" primary button.



ANIMATIONS:



All sections use a custom useInViewAnimation hook (IntersectionObserver with threshold 0.1, triggers once). Elements get class animate-fade-in-up when in view (otherwise opacity-0). The animation is defined in CSS:





@keyframes fadeInUp {

  0% { opacity: 0; transform: translateY(30px); }

  100% { opacity: 1; transform: translateY(0); }

}

.animate-fade-in-up {

  animation: fadeInUp 0.8s ease-out forwards;

  opacity: 0;

}

Each element within a section has staggered animationDelay values (0.1s, 0.2s, 0.3s, etc.).



COLOR PALETTE:



Primary dark: #051A24

Secondary dark: #0D212C

Light text on dark: #F6FCFF, #E0EBF0

Body text: #051A24

Muted text: #273C46

Background: white throughout

BUTTON SHADOWS (critical for the design feel):



Primary: 0_1px_2px_0_rgba(5,26,36,0.1), 0_4px_4px_0_rgba(5,26,36,0.09), 0_9px_6px_0_rgba(5,26,36,0.05), 0_17px_7px_0_rgba(5,26,36,0.01), 0_26px_7px_0_rgba(5,26,36,0), inset_0_2px_8px_0_rgba(255,255,255,0.5)

Secondary: 0_0_0_0.5px_rgba(0,0,0,0.05), 0_4px_30px_rgba(0,0,0,0.08)

FONTS (CSS):





@font-face {

  font-family: 'PP Neue Montreal';

  src: url('https://assets.website-files.com/6009ec8cda7f305645c9d91b/60176f9bb43e36419997ecfe_PPNeueMontreal-Book.otf') format('opentype');

  font-weight: 400;

  font-display: swap;

}

@font-face {

  font-family: 'PP Neue Montreal';

  src: url('https://assets.website-files.com/6009ec8cda7f305645c9d91b/60176f9b39c5673e51a86f5a_PPNeueMontreal-Medium.otf') format('opentype');

  font-weight: 500;

  font-display: swap;

}

@font-face {

  font-family: 'PP Mondwest';

  src: url('/PPMondwest-Regular.woff2') format('woff2');

  font-weight: 400;

  font-display: swap;

}

FILE STRUCTURE:



src/App.tsx - Main layout with hero, marquee, and section composition

src/components/Button.tsx - Reusable button (primary/secondary/tertiary variants)

src/components/TestimonialSection.tsx - Quote with parallax image

src/components/PricingSection.tsx - Two pricing cards

src/components/TestimonialCarousel.tsx - Auto-scrolling testimonial cards

src/components/ProjectsSection.tsx - Project showcase items

src/components/PartnerSection.tsx - Interactive mouse-trail CTA section

src/components/Footer.tsx - Footer with links

src/components/CopyrightBar.tsx - Copyright line

src/components/BottomNav.tsx - Fixed floating bottom nav

src/hooks/useInViewAnimation.ts - IntersectionObserver scroll-trigger hook

src/index.css - Font faces, marquee animation, fade-in-up animation


---

# 062 Neo Museum

# Neo Museum

Project Setup



Stack: React 19 + Vite 6 + Tailwind CSS 4 + Motion (Framer Motion) + Lucide React icons + TypeScript



package.json dependencies:

- `react`, `react-dom` ^19.0.1
- `vite` ^6.2.3
- `@tailwindcss/vite` ^4.1.14, `tailwindcss` ^4.1.14
- `motion` ^12.23.24
- `lucide-react` ^0.546.0
- `@vitejs/plugin-react` ^5.0.4
- `typescript` \~5.8.2

Fonts (loaded via Google Fonts in `index.css`):

- Sans: Inter (weights: 300, 400, 500, 600)
- Mono: JetBrains Mono (weights: 400, 500)

```CSS
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@layer utilities {
  .text-mega {
    font-size: 21vw;
    line-height: 0.75;
    letter-spacing: -0.04em;
  }
}
```



Global styling: Background `#fcfcfc`, text `#111`, selection color `bg-black text-white`, `overflow-x-hidden`, `font-sans` (Inter).



---



DATA



```TypeScript
const chaptersData = [
  { name: "Age of Dinosaurs", image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624247/01_udnber.png" },
  { name: "Fossils of Ancient Life", image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624374/02_pmvxxl.png" },
  { name: "Reptiles of the Mesozoic", image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624236/03_hcp3jc.png" },
  { name: "Marine Fossil Gallery", image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624256/04_get63z.png" },
  { name: "Prehistoric Giants", image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624251/05_kz1tyu.png" }
];
```



---



STATE



```TypeScript
const [showVideo, setShowVideo] = useState(false);
const [activeChapter, setActiveChapter] = useState(2); // starts at "Reptiles of the Mesozoic"
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
```



- `showVideo` flips to `true` after a 2800ms delay (setTimeout)
- `activeChapter` auto-cycles every 3500ms via setInterval, wrapping `(prev + 1) % 5`

---



ANIMATION VARIANTS



```TypeScript
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const letterBlock = {
  initial: { y: 120, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
  }
};
```



---



SECTION 1: HERO (full viewport height)



Container: `relative w-full min-h-screen flex flex-col overflow-hidden`



1A. HEADER (NHM Logo)



- `motion.header` with `staggerChildren: 0.1, delayChildren: 0.1`
- Padding: `pt-6 px-6 md:px-16`, `z-20`
- The "NHM" logo is a custom inline SVG with `viewBox="0 0 840 100"`, `fill-[#111]`, full width
- The SVG is wrapped in `motion.h1` with `variants` that animate from `scale: 1.03` to `scale: 1` with `staggerChildren: 0.06, delayChildren: 0.1`
- Each polygon of each letter uses the `letterBlock` variant (slides up from `y: 120`)
- Letter N (translate 0,0): Three polygons -- left vertical `0,0 14,0 14,100 0,100`, right vertical `200,0 214,0 214,100 200,100`, diagonal `0,0 33,0 214,100 181,100`
- Letter H (translate 280,0): Three polygons -- left vertical `0,0 14,0 14,100 0,100`, right vertical `200,0 214,0 214,100 200,100`, crossbar `14,43 200,43 200,57 14,57`
- Letter M (translate 560,0): Four polygons -- left vertical `0,0 14,0 14,100 0,100`, right vertical `266,0 280,0 280,100 266,100`, left diagonal `0,0 26,0 153,100 127,100`, right diagonal `254,0 280,0 153,100 127,100`

1B. SUB-NAV BAR



- Below the SVG logo, `flex justify-between items-start mt-8`
- Font: `text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase`
- Uses `fadeUp` variant with `duration: 0.8, ease: "easeOut"`

Left column (15% width): Three lines -- "Natura" / "History" / "Museum"



Arrow separator (5% width, hidden on mobile): `ArrowRight` from lucide, size 14, strokeWidth 1, `text-gray-400`



Center column (flex-1 on mobile, 30% on desktop): "Exploring the story of life on earth through science, discovery and wonder." -- Split differently on desktop (3 lines) vs mobile (4 lines). `text-gray-800 leading-relaxed font-mono`



Arrow separator (5% width, hidden on mobile): Same as above



Right column (15% width, hidden on mobile): Nav links list -- Visit, Exhibitions, Discover, Learn, About. `text-gray-800`, `hover:text-black hover:underline`



Hamburger button (far right, z-60): Two horizontal lines (`w-8 h-[1.5px] bg-black`), `gap-[6px]`. Hover: first line shrinks to `w-6`, second expands to `w-10`. When open: first rotates 45deg + translateY, second rotates -45deg + translateY (forming an X). Transition: `duration-300`.



1C. MOBILE MENU OVERLAY



- `AnimatePresence` wrapping a `motion.div`
- Appears below the header, slides in from `y: -20`, `opacity: 0` to `y: 0, opacity: 1`
- `bg-[#fcfcfc] border-b border-gray-200 shadow-xl`, only visible on `md:hidden`
- Contains the same nav links as the desktop version, `text-sm font-mono tracking-[0.2em] uppercase`, `space-y-6`

1D. BACKGROUND VIDEO



- Appears after 2800ms delay (controlled by `showVideo` state)
- `absolute top-0 left-0 w-full h-full pointer-events-none z-0`
- Video: `autoPlay loop muted playsInline`, `w-full h-full object-cover`
- Video URL: `https://res.cloudinary.com/dsdxaxkiz/video/upload/v1779624998/magnific_use-img-2-as-the-exact-ba_Piu3X0W42C_wnrc8f.mp4`

1E. LEFT SIDEBAR CONTENT



- `motion.div` with `staggerChildren: 0.15, delayChildren: 0.6`
- Position: `px-10 md:px-16`, `mt-20 sm:mt-28 md:mt-32`, `w-[320px]`, `z-10`

Section indicator: `01` + horizontal line (`w-16 h-[1.5px] bg-black/20`), `text-xs font-mono`



Headline: "TIMELESS WONDERS" -- `text-[3.5rem] md:text-[5rem] font-normal tracking-tight leading-[1]`. Line break between "TIMELESS" and "WONDERS".



Description: "Step into the natural world and / discover the stories written / millions of years ago." -- `text-[13px] md:text-[14px] text-gray-700 w-[240px] leading-[1.6]`



CTA Button ("Explore Now"):

- Container: `bg-[#1a1a1a] px-6 py-3.5 border border-[#1a1a1a] rounded-md shadow-sm`
- Hover: slides up 0.5px, adds `shadow-[3px_3px_0px_rgba(17,17,17,0.5)]`
- Active: resets translate and shadow
- Has a sliding background panel: `bg-[#fcfcfc]` that slides from `-translate-x-[101%]` to `translate-x-0` on hover, `duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`
- Icon: Custom SVG leaf/plant shape (4 paths forming a stylized leaf), white by default, turns `#111` on hover with `scale-110 -rotate-12 -translate-y-1` transform
- Text: "Explore Now", `text-[15px] font-medium`, white turning to `#111` on hover

1F. RIGHT SIDEBAR (hidden on mobile)



- `motion.div` with `staggerChildren: 0.15, delayChildren: 0.9`
- Position: `w-[200px] mt-12 md:mt-20`, `hidden md:flex`

Specimen info: "Tyrannosaurus Rex" heading (`text-[10px] font-bold font-mono tracking-widest uppercase`), subtext "Late Cretaceous period / 68-66 million years ago" (`text-[12px] text-gray-600 leading-[1.6]`)



Stats: "Length" label + "12.3 m" value, "Height" label + "4.0 m" value. Labels: `text-[10px] font-mono tracking-widest uppercase text-gray-500`. Values: `text-[13px] font-medium`.



View Details button: Circle (`w-10 h-10 rounded-full border border-gray-400`) with `Plus` icon (size 16, strokeWidth 1.5), text "View Details" (`text-[10px] font-mono uppercase tracking-widest font-bold`). Hover: circle gets `border-black bg-[#111]`, icon turns white.



1G. BOTTOM-LEFT "SCROLL TO EXPLORE"



- `absolute bottom-10 left-[2.5rem] md:left-[4rem]`, `hidden md:flex`
- Fade up animation: `delay: 1.2`
- Circle (`w-12 h-12 rounded-full border border-gray-300`) containing two thin vertical lines (`w-[1px] h-[12px] bg-gray-600`, `gap-[4px]`) representing a pause icon
- Text: "Scroll to explore" -- `text-[10px] font-mono tracking-widest uppercase text-gray-500 font-semibold`

---



SECTION 2: "EXPLORE OUR WORLD"



Container: `relative w-full min-h-[75vh] md:min-h-screen bg-[#fcfcfc]`, flex column centered, `pt-24 md:pt-32 pb-0 z-20`



2A. SECTION LABEL



`[ 02 ] Explore Our World` -- `text-[10px] md:text-[11px] font-mono tracking-[0.2em]`, `mb-12`. "02" in `text-gray-500`, "Explore Our World" in `text-gray-900 font-bold uppercase`.



2B. MAIN HEADING



"Unearth the stories of our planet's past through fossils, minerals, and ancient wonders." -- `text-[2.2rem] md:text-[3.5rem] lg:text-[4.2rem] leading-[1.1] font-medium tracking-tight text-[#111]`, max-width 1000px, text-center. Line break on desktop after "past". Animates with `whileInView` from `y: 40, opacity: 0` to `y: 0, opacity: 1`, `once: true`, margin `-100px`.



2C. ACTION PILLS



Five pill buttons in a flex-wrap row, `gap-3 md:gap-4`, `mb-10 md:mb-24`. Staggered reveal animation (`staggerChildren: 0.1, delayChildren: 0.3`). Each pill: `rounded-full border border-gray-300 text-[11px] font-medium uppercase tracking-wider bg-white/50 backdrop-blur-sm text-gray-800`. Hover: `border-black bg-black text-white`. Icons from lucide (size 14, strokeWidth 2):



1. `Bone` + "Dinosaurs"
2. `Dna` + "Ancient Life"
3. `Gem` + "Minerals"
4. `Leaf` + "Fossils"
5. `BookOpen` + "Learn More"

2D. SPACER



`min-h-[220px] md:min-h-[450px]` -- provides room for the pterodactyl image from Section 3 to overlap upward.



2E. BOTTOM TEXT



Absolute positioned at bottom, `px-8 md:px-16 pb-8 md:pb-12`, `pointer-events-none`. Two text elements at `justify-between`:

- Left: "WE DON'T JUST TELL STORIES."
- Right: "PALEONTOLOGY (C) 2026"
- Both: `text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium`, hidden on mobile.

---



SECTION 3: "ANCIENT COLLECTION" (Dark Section)



Container: `relative w-full bg-[#0a0a0a] text-white flex flex-col z-30`



3A. PTERODACTYL IMAGE (Overlapping)



- Absolute positioned at top, centered horizontally (`left-1/2 -translate-x-1/2`)
- Width: `w-[160vw] md:w-[1100px]`
- Image URL: `https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779625001/ChatGPT_Image_May_23_2026_12_24_44_PM_1_lv1dne.png`
- Animates with `whileInView` from `y: "-65%", opacity: 0` to `y: "-78%", opacity: 1`, `duration: 1.4, ease: "easeOut"`, viewport margin `100px`
- `pointer-events-none z-0`, `mix-blend` not applied here

3B. HEADING AREA



- Padding: `px-8 md:px-16 pt-32 md:pt-48 mb-16`, `z-10`
- Two-column layout on xl (`flex-col xl:flex-row justify-between`)

Left -- Main heading: "Curated from millions of years of wonder [3 circle icons] & discovery." -- `text-[1.8rem] md:text-[3rem] lg:text-[3.8rem] xl:text-[4rem] leading-[1.15] font-medium tracking-tight text-white`. The three circle icons are inline (`inline-flex gap-2 md:gap-3 align-middle mx-2 md:mx-4 translate-y-[-4px]`), each `w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-600 bg-black text-gray-400`. Hover: `bg-white text-black border-white`. Icons: `Bone`, `Dna`, `Leaf` (size 22).



Right -- Tagline + pills:

- Tagline: "WE DON'T JUST DISPLAY FOSSILS / WE SHARE EARTH'S STORY" -- `text-[9px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-6 leading-relaxed`
- Three pills: "Educational", "Authentic", "Inspiring" -- `px-5 py-2 rounded-full border border-gray-600 text-[9px] font-mono tracking-widest uppercase text-gray-300`. Hover: `bg-white text-black border-white`.

3C. TWO-COLUMN PANEL



Separated by `h-[1px] bg-gray-800` line. Flex row on desktop, column on mobile.



Left panel (35% width):

- `border-r border-gray-800` on desktop, `border-b` on mobile
- `min-h-[400px] md:min-h-[500px]`
- Top: `***` text (`text-gray-500 text-xl tracking-[0.3em]`)
- Center: Chapter image using `SandTransitionImage` component (SVG filter-based sand/dissolve transition). Image: `absolute inset-0 w-[80%] h-[80%] m-auto object-contain mix-blend-lighten`. Uses `AnimatePresence mode="wait"`.
- Bottom: Chapter counter `01 / 05` style, with animated number (`motion.div` slides vertically). `text-[10px] font-mono tracking-widest text-[#888] uppercase`. Counter numeral color `#888`, divider `text-[#333]`.

Right panel (65% width):

- Top bar: "Explore the past. Understand the present." + animated "Chapter 0X" label. `border-b border-gray-800 p-8 text-[10px] font-mono text-gray-400 tracking-widest`.
- Chapter list: 5 items, each `border-b border-gray-800/80 py-8`. Active: `text-white`, inactive: `text-[#444] hover:text-[#999]`. Chapter name: `text-2xl md:text-[2rem] font-medium tracking-tight`. Active item shows `ArrowUpRight` icon (size 22, strokeWidth 1, `text-gray-400`) that animates in/out.
- Clicking a chapter sets `activeChapter`.

3D. BOTTOM FOOTER



- `h-[1px] bg-gray-800` divider
- Text: "DIGGING INTO OUR PLANET'S PAST" -- `px-8 py-8 text-[10px] font-mono tracking-widest text-gray-500 uppercase bg-[#0a0a0a]`

---



SandTransitionImage COMPONENT



A custom component that creates a sand/particle dissolve effect using SVG filters:



```TypeScript
function SandTransitionImage({ src, alt, className }) {
  // Uses usePresence() from motion/react for AnimatePresence awareness
  // Unique filterId per instance via useRef
  // requestAnimationFrame loop over 900ms
  // Easing: entering = quartic ease-out (1 - Math.pow(1-t, 4)), exiting = cubic (Math.pow(t, 3))
  // SVG filter chain:
  //   1. feTurbulence: fractalNoise, baseFrequency 1.8, numOctaves 4
  //   2. feDisplacementMap: scale up to 150 based on progress
  //   3. feOffset: dy up to -80 (enter) or 120 (exit), dx up to -30/+30
  //   4. feGaussianBlur: up to 6px
  //   5. feColorMatrix: opacity fades (1 - progress * 1.2)
  // Image has crossOrigin="anonymous" and referrerPolicy="no-referrer"
}
```



---



ALL EXTERNAL ASSET URLs



Video:

- `https://res.cloudinary.com/dsdxaxkiz/video/upload/v1779624998/magnific_use-img-2-as-the-exact-ba_Piu3X0W42C_wnrc8f.mp4`

Images:

- Chapter 1: `https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624247/01_udnber.png`
- Chapter 2: `https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624374/02_pmvxxl.png`
- Chapter 3: `https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624236/03_hcp3jc.png`
- Chapter 4: `https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624256/04_get63z.png`
- Chapter 5: `https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624251/05_kz1tyu.png`
- Pterodactyl: `https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779625001/ChatGPT_Image_May_23_2026_12_24_44_PM_1_lv1dne.png`

(Note: these are Cloudinary URLs, not CloudFront. The project uses Cloudinary for all hosted media assets.)



---



KEY DESIGN DETAILS



- Color palette: `#fcfcfc` (off-white bg), `#111` / `#1a1a1a` (near-black), `#0a0a0a` (dark section bg). Gray scale via Tailwind: `gray-300` through `gray-800`.
- No purple/indigo anywhere. Strictly monochrome black/white/gray.
- Typography hierarchy: Large display headings (3.5-5rem), mono labels (10-11px), body text (13-14px).
- Spacing: 8px base system throughout.
- Transitions: Most hover transitions 300-700ms. Button slide effect uses `cubic-bezier(0.16, 1, 0.3, 1)`. Letter animations use same cubic bezier.
- The page is entirely a single `App.tsx` component plus the `SandTransitionImage` helper function in the same file.


---

# 063 Targo Logistics Hero

# Targo Logistics Hero

Design Prompt: Targo Hero Section



Brand Identity: Create a high-end, dark-themed hero section for a logistics brand called "targo". Use a color palette of deep black (#000000), a vibrant brand red (#EE3F2C), and crisp white for primary text. The typography should use the Rubik font family, with headlines in bold, uppercase, and slightly tight letter-spacing (approx. -4%).



Layout & Positioning:



Header: A clean top navigation bar with a white SVG logo (abstract symbol + "targo" wordmark) on the left. Include "Home", "About", and "Contact Us" links, plus a small red "Contact Us" button with clipped corners on the right.



Main Hero: The headline "Swift and Simple Transport" and a "Get Started" button should be left-aligned and positioned in the upper-third of the section (aligned toward the top rather than centered).



Bottom Widget: A "Book a Free Consultation" card positioned at the bottom-left.



Key Design Elements:



Video Background: An auto-looping, muted background video using URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260227_042027_c4b2f2ea-1c7c-4d6e-9e3d-81a78063703f.mp4. Ensure it has 100% opacity with no dark overlay.



Clipped-Corner Buttons: All primary buttons must feature a custom geometric shape using CSS clip-path (a 10-12px diagonal cut on the top-right and bottom-left corners). Use the brand red for "Get Started" and solid white for "Book a Call".



Liquid Glass Effect: The consultation card must use advanced glassmorphism: backdrop-filter: blur(40px) saturate(180%), a 1px white border with 12% opacity, a subtle diagonal white-to-transparent shine gradient across the surface, and an inner box-shadow for depth.



Scaled Proportions: The layout should feel refined and compact. Headlines should be roughly 64px on desktop, and the overall spacing should avoid excessive padding to maintain a "scaled-down" professional look.



Technical Details:



Frameworks: React & Tailwind CSS.



Icons: Use the Phone icon from lucide-react inside the consultation button.



Responsiveness: Ensure the headline scales down to \~42px on mobile and the padding adjusts from 64px (desktop) to 32px (mobile).


---

# 064 Minimal Workflow SaaS

# Minimal Workflow SaaS

React 19 + TypeScript + Vite 6

Tailwind CSS v4 (via @tailwindcss/vite plugin, NOT PostCSS)

motion v12+ (import from "motion/react", NOT "framer-motion")

lucide-react (for ChevronRight icon)

Font: Google Inter (weights 400, 500, 600, 700)

```Plain Text

## CloudFront Video URL
```

https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260525_064035_ff2947db-c2f5-47e4-818d-0e985c6ea0fc.mp4

````Plain Text

---

## FILE: index.css

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

:root {
  font-family: var(--font-sans);
}

body {
  background-color: #f8fafc;
  color: #1e293b;
}
````



---



## FILE: App.tsx -- Root layout with full-bleed background video



The root div is `relative min-h-screen bg-[#f8fafc] selection:bg-slate-200 overflow-x-hidden flex flex-col justify-between`.



Inside it, TWO sibling layers:



**Layer 1 -- Background video (absolute, z-0):**

- Container: `absolute inset-x-0 top-0 bottom-0 z-0 overflow-hidden pointer-events-none`
- \`\` element with attributes: `autoPlay`, `muted`, `loop`, `playsInline`

  - src = the CloudFront URL above
  - className: `w-full h-full object-cover object-bottom opacity-[0.98]`
- Overlay div on top of video: `absolute inset-0 bg-white/[0.05] backdrop-blur-[2px]` (extremely subtle white wash + micro blur)

**Layer 2 -- Content (relative, z-10):**

- Container: `relative z-10 flex-grow flex flex-col`
- Contains \`\` directly
- Contains `wrapping`

---



## FILE: Navbar.tsx -- Minimal top navigation



Container: \`\` with `relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full select-none`



**Left -- Brand logo:**

- Text "Script" in `font-bold text-[21px] tracking-tight text-[#0f172a]`
- Custom 3-bar icon next to it, rotated -15deg:

  - Wrapper: `flex flex-col gap-[2.5px] rotate-[-15deg] ml-1.5 translate-y-[1px]`
  - Bar 1: `w-3.5 h-[1.5px] bg-[#0f172a] rounded-full`
  - Bar 2: `w-2.5 h-[1.5px] bg-[#0f172a] rounded-full translate-x-[2px]`
  - Bar 3: `w-3 h-[1.5px] bg-[#64748b] rounded-full translate-x-[4px]` (lighter gray, staggered right)

**Center -- Nav links (absolute centered, hidden on mobile):**

- Container: `hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[13px] font-medium text-slate-600`
- 5 links: "Resources", "Service", "Support", "Developers", "Updates"
- Each: `hover:text-slate-900 transition-colors`

**Right -- CTA button:**

- Text "Join us"
- Classes: `px-4.5 py-1.5 text-xs font-medium border border-slate-200 rounded-full hover:bg-white/85 bg-white/30 backdrop-blur-sm transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-slate-800`

---



## FILE: Hero.tsx -- Main hero content



Imports: `motion` from `motion/react`, `AnimatedTaskList` component, `ChevronRight` from `lucide-react` (also imports `ArrowRight` but it is unused).



Section container: `relative pt-10 pb-6 flex flex-col justify-center items-center w-full select-none`

Inner container: `relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col items-center`



**Element 1 -- Headline (motion.h1):**

- Classes: `text-4xl md:text-[45px] tracking-tight text-slate-900 mb-5 max-w-4xl mx-auto leading-[1.12]`
- Animation: `initial={{ opacity: 0, y: 20 }}` -> `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.8, ease: "easeOut" }}`
- Content (3 lines separated by \`

\`):

- Line 1: `Guide everyone on teams`
- Line 2: `tech manuals`
- Line 3: `— with a total ease of mind` (note: em dash character)

**Element 2 -- Subtext (motion.p):**

- Classes: `text-xs md:text-[13px] text-slate-500 max-w-xl mx-auto mb-6 leading-relaxed font-normal`
- Animation: same fade-up, `delay: 0.2`
- Content: "Script offers the best path to register your workflow steps" + \`

\` + "and optimize training on your setup systems"



**Element 3 -- CTA Button (motion.div wrapper):**

- Wrapper: `mb-14`, animation same fade-up, `delay: 0.4`
- Button classes: `bg-gradient-to-b from-[#252a38] to-[#1a1e29] hover:from-[#1d212c] hover:to-[#12151e] text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.15)] border border-slate-900/80 active:scale-95 duration-150`
- Content: "Register Now!" followed by \`\`

**Element 4 -- Animated Task List area:**

- Outer div: `relative w-full flex flex-col items-center max-w-sm`
- AnimatedTaskList wrapper: \`\` with `initial={{ opacity: 0, scale: 0.95 }}`, `animate={{ opacity: 1, scale: 1 }}`, `transition={{ duration: 1, delay: 0.6 }}`, className `relative z-20 w-full`
- Below it, tagline: \`\` with `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `transition={{ delay: 1, duration: 1 }}`, className `mt-14 text-[10px] font-medium tracking-wide text-white/50`, text: "All people aligned."

---



## FILE: AnimatedTaskList.tsx -- Infinite auto-scrolling task queue with glass card



Imports: `React`, `useState`, `useEffect` from react; `motion` from `motion/react`.



**Task data (9 items):**

```Plain Text
"How to code an app in Python"
"How to build charts with data in Excel"
"How to edit profile of users on GitHub"
"How to set up a custom task rule in Asana"
"How to design a form in Sheets"
"How to build a custom webhook in Slack"
"How to sync a dashboard in Excel"
"How to create a team member in Canva"
"How to link a custom project page in Jira"
```



`N = tasks.length` (9). `duplicatedTasks = [...tasks, ...tasks, ...tasks]` (27 items, tripled for infinite loop).



**State:**

- `index` starts at `N` (9)
- `animate` starts at `true`

**Scroll logic (3 useEffects):**



1. `setInterval` every 4500ms: increments `index` by 1 if `< N  2` (18)
2. When `index === N  2`: after 1000ms timeout, sets `animate = false` and `index = N` (silent teleport back)
3. When `index === N && !animate`: after 50ms timeout, sets `animate = true` (re-enables animation)

**Outer container:** `relative w-full max-w-[340px] md:max-w-[420px] h-[220px] select-none mx-auto text-left font-sans overflow-hidden`



**Glass highlight card (static, z-0):**

- Position: `absolute top-0 left-0 w-full h-[54px]`
- Style: `rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`
- Layout: `flex items-center px-4 pointer-events-none`
- Contains a white icon square: `w-[30px] h-[30px] bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/40`

  - Inside: 3-bar mini logo rotated -15deg:
  
    - Wrapper: `flex flex-col gap-[1.5px] rotate-[-15deg]`
    - Bar 1: `w-2.5 h-[1.5px] bg-[#0c101d] rounded-full`
    - Bar 2: `w-1.8 h-[1.5px] bg-[#0c101d] rounded-full translate-x-[0.8px]`
    - Bar 3: `w-2.2 h-[1.5px] bg-[#475569] rounded-full translate-x-[1.6px]`

**Task items layer (absolute, z-10):**

- Container: `absolute inset-0 w-full h-full z-10 pointer-events-none`
- Maps over `duplicatedTasks` (27 items). For each item at index `i`, computes `distance = i - index`:

**Position/opacity rules based on distance:**



| distance | y | height | opacity | blur |
|-|-|-|-|-|
| 0 (active) | 0 | 54px | 1.0 | 0px |
| < 0 (past) | -35 | 30px | 0.0 | 0px |
| 1 | 68px | 22px | 0.55 | 0.2px |
| 2 | 90px | 22px | 0.36 | 0.4px |
| 3 | 112px | 22px | 0.22 | 0.6px |
| 4 | 134px | 22px | 0.11 | 0.8px |
| 5 | 156px | 22px | 0.04 | 1.1px |
| 6+ | formula | 22px | 0.0 | 0px |



Formula for inactive y: `68 + (distance - 1) * 22`



**Each motion.div item:**

- Classes: `absolute left-0 w-full flex items-center select-none justify-start`
- `animate={{ y, opacity }}`, `style={{ height, filter: filterBlur }}`
- Transition: when `animate=true`: `{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }` (custom spring-like bezier). When `animate=false`: `{ duration: 0 }` (instant, no animation for teleport)

**Active item rendering (distance === 0):**

- Container: `pl-[58px] flex flex-col justify-center text-left`
- Label: `text-[7.5px] text-white/50 font-bold uppercase tracking-wider leading-none mb-1`, text: "Learn the step"
- Task text: `text-[12.5px] md:text-[13px] font-medium tracking-tight text-white leading-none`

**Inactive item rendering (distance !== 0):**

- Container: `pl-[58px] flex items-center text-left`
- Task text: `text-[11.5px] md:text-[12px] font-normal tracking-tight text-white/70 leading-none`

---



## FILE: LogoCloud.tsx -- Brand logo strip (NOT displayed in current App.tsx but exists as component)



Container: `w-full bg-white border-t border-slate-100 py-7 select-none relative z-20`

Grid: `grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 items-center justify-center gap-y-8 gap-x-6`



8 brand logos, all built with inline SVGs and styled text:

1. **Mercedes-Benz** -- circle + 3-spoke SVG, `text-[10px] font-medium tracking-wider uppercase text-slate-700`
2. **Certainty** -- circle + checkmark SVG (emerald-600), `text-[13px] font-bold tracking-tight text-slate-800`
3. **STAR MOUNTAIN CAPITAL** -- 3 overlapping mountain peaks SVG, `text-[7px] font-black tracking-[0.16em]` + `text-[5px] font-semibold tracking-[0.25em] scale-90`
4. **Paige** -- dark circle with pie chart SVG, `text-[14px] font-bold tracking-tight text-slate-900`
5. **ALARIS** -- text only, `text-[13px] font-light tracking-[0.3em] uppercase`
6. **raft** -- text only, `text-[15px] font-bold tracking-tighter lowercase`
7. **Foobar** -- split weight: "Foo" `font-black text-slate-900` + "bar" `font-semibold text-slate-400`, `text-[14px]`
8. **Alph4** -- triangle SVG with internal lines, `text-[8px] font-bold tracking-widest text-slate-600 scale-95`

---



## Key Design Specifications



- **Color palette**: Entirely slate, white, charcoal-navy (#0f172a, #252a38, #1a1e29). NO purple/indigo anywhere.
- **Video background**: Covers entire viewport, `object-cover object-bottom`, 98% opacity, with a `bg-white/[0.05] backdrop-blur-[2px]` overlay
- **Glass card effect**: `bg-white/[0.08] backdrop-blur-md border border-white/20` with inset highlight shadow
- **CTA button**: Dark gradient with inset white highlight: `shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.15)]`
- **Animation sequence**: Staggered fade-up (0s, 0.2s, 0.4s for headline/subtext/button), then scale-in at 0.6s for task list, then fade-in at 1s for tagline
- **Task list animation curve**: Custom cubic-bezier `[0.16, 1, 0.3, 1]` (fast start, very smooth deceleration)
- **Task list cycle**: 4.5s interval, 1.0s slide duration, silent instant teleport back when exhausted
- **Text on dark video**: White with varying opacity (1.0, /70, /50) for hierarchy
- **select-none**: Applied to navbar, hero section, and task list to prevent text selection on decorative elements
- **Responsive**: Nav links hidden on mobile (`hidden md:flex`), task list width `max-w-[340px] md:max-w-[420px]`, headline `text-4xl md:text-[45px]`


---

# 065 Futuristic Tech

# Futuristic Tech

Build a full-viewport hero section with a dark, cinematic aesthetic. Here are the exact specifications:



**Video Background:**

- Full-screen looping background video, muted, autoplaying, with `playsInline`
- Video URL: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260525_052706_d2e390fd-1846-4fe7-a4d8-8d2f1c875358.mp4`
- Positioned `absolute inset-0`, `object-cover`, `z-0`

**Font:**

- Google Fonts: `Inter` (weights 400, 500, 600, 700) imported via `@import url('``https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')`
- Applied globally with `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`

**Container:**

- `relative w-full h-screen overflow-hidden bg-black` with `font-family: 'Inter, sans-serif'`

**Navbar (absolute, z-50, top):**

- Positioned `absolute top-0 left-0 right-0 z-50`, flex row, `items-center justify-between`, padding `px-5 py-4 lg:px-10 lg:py-6`
- **Logo:** Text "axentra" in white, `text-xl font-semibold tracking-tight`, font Inter
- **Desktop nav links** (hidden on mobile, `hidden lg:flex`): Items are "Platform", "How it works", "AI Defense", "Connections", "Insights" inside a pill-shaped container with a custom `liquid-glass` effect (glassmorphism). Each link: `text-white/80 hover:text-white text-sm px-4 py-1.5 rounded-full hover:bg-white/10`
- **CTA button** (desktop only, `hidden lg:block`): "Join the wait", white background (`#ffffff`), black text, `text-sm font-medium px-5 py-2 rounded-full`, hover opacity 0.8
- **Hamburger** (mobile only, `lg:hidden`): Animated toggle between `Menu` and `X` icons from lucide-react (size 20, strokeWidth 1.5, white). Uses cubic-bezier(0.23,1,0.32,1) easing with rotation and scale animations for the icon swap. Background changes to `#1a1a1a` when open.

**Liquid Glass CSS effect** (for the desktop nav pill):

```CSS
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```



**Mobile Menu (slide-down panel):**

- Backdrop: fixed `inset-0 z-30`, blur(12px), `rgba(0,0,0,0.6)` when open, click-to-close
- Panel: fixed `top-0 left-0 right-0 z-40`, max-height animates from 0 to 420px with `cubic-bezier(0.23, 1, 0.32, 1)` over 0.5s
- Panel background: `rgba(8,8,8,0.97)`, bottom border `1px solid rgba(255,255,255,0.08)`, padding `pt-20 pb-6 px-5`
- Each nav item: `text-white/70 hover:text-white text-base py-3 px-3 rounded-xl hover:bg-white/5`, staggered fade-in animation (each item delayed by `i * 50 + 80`ms), translateY(-8px) to 0 on open
- Each item has an `ArrowRight` icon (size 14) that appears on hover (opacity 0 to 0.4, translateX animation)
- Bottom section: separated by `1px solid rgba(255,255,255,0.07)` border, contains full-width "Join the wait" button (white bg, black text, rounded-full)
- Escape key closes the menu

**Hero Content (bottom-left aligned, z-20):**

- Container: `relative z-20 flex flex-col items-start justify-end text-left h-full px-5 sm:px-8 lg:px-10 pb-16 md:pb-20`
- **Heading:** "When strategy meets its spark / and thought reshapes what lies ahead"

  - White, `font-normal`, `leading-[1.12]`, `tracking-tight`, `max-w-3xl`
  - Font size: `clamp(1.75rem, 5vw, 2.6rem)`
  - Line break (`<br className="hidden sm:block" />`) between "spark" and "and thought..."
- **Subtext:** "a fluid channel - where deep resolve / and neural insight dissolve as one"

  - Font: `'Courier New', Courier, monospace` (monospace font)
  - Color: `rgba(255, 255, 255, 0.6)`
  - `text-sm md:text-base leading-relaxed`, `letter-spacing: 0.01em`
  - `max-w-xs sm:max-w-sm md:max-w-md`
  - Margin: `mt-5 md:mt-6`
  - Line break between "resolve" and "and neural..."
- **CTA Button:** "See it in motion" with ArrowRight icon

  - White bg (`#ffffff`), black text, `text-sm font-medium`
  - `px-5 py-2.5 rounded-full`
  - `mt-7 md:mt-8`
  - ArrowRight icon (size 15) translates right 0.5 on hover (`group-hover:translate-x-0.5`)
  - `hover:opacity-80` with 300ms transition

**Dependencies:**

- React 18, TypeScript, Tailwind CSS 3, Vite
- `lucide-react` for icons (ArrowRight, Menu, X)
- Google Fonts Inter


---

# 066 CodeNest Coding Platform

# CodeNest Coding Platform

Create a high-end, dark-themed hero section for a coding education platform called 'CodeNest' using React and Tailwind CSS. The design must be responsive and follow these precise specifications:



1. Background & Layout:

Background: Implement a full-screen background video using the HLS stream: https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8. Use hls.js and set enableWorker: false to ensure stability in sandboxed environments.



Overlays: Set the video to 60% opacity. Add a dark linear gradient from the left (#070b0a to transparent) and a bottom-up gradient for readability.



Grid System: Add three thin vertical grid lines (white/10 opacity) at the 25%, 50%, and 75% marks across the screen (visible on desktop).



Central Glow: Place a large horizontal SVG ellipse glow in the center-top area with a cyan/dark green hue, using a 25px Gaussian blur filter.



1. The Liquid Glass Card:

Component: Create a 200x200px floating card positioned above the main headline, shifted exactly 50px upwards using translate-y-[-50px].



CSS Styling (Liquid Glass):



background: rgba(255, 255, 255, 0.01) with background-blend-mode: luminosity.



backdrop-filter: blur(4px).



box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1).



Border Effect: A ::before pseudo-element with inset: 0, padding: 1.4px, and a 180-degree white linear gradient. Use -webkit-mask-composite: xor and mask-composite: exclude to create a sharp, high-end border frame.



Content: '[ 2025 ]' tag (14px), 'Taught by Industry Professionals' headline (18px, using Instrument Serif italic for 'Industry'), and a small description (11px).



1. Hero Content & Typography:

Eyebrow: 'Career-Ready Curriculum' in Plus Jakarta Sans, bold, 11px, color #5ed29c.



Main Headline: 'LAUNCH YOUR CODING CAREER.' in Inter Extra Bold, uppercase, tracking-tight. Scale from 40px (mobile) to 72px (desktop). The final period must be green (#5ed29c).



Description: 'Master in-demand coding skills...' in Inter, 14px, 70% white opacity, max-width 512px.



Primary CTA: 'Get Started' button with an ArrowRight icon. Rounded-full, background #5ed29c, text #070b0a, uppercase, bold.



1. Global Navigation:

Header: Sticky/Absolute header with a white minimalist logo.



Desktop Menu: Links for 'PROJECTS', 'BLOG', 'ABOUT', 'RESUME' in Inter, 16px. Hover state: #5ed29c.



Mobile Menu: A functional hamburger menu that toggles a full-screen dark overlay.



1. Required Imports:

Fonts: Inter, Plus Jakarta Sans, and Instrument Serif (italic).



Icons: lucide-react (ArrowRight, Menu, X).



Library: hls.js for video streaming.


---

# 067 Stellar Launch

# Stellar Launch

Build a Launchex Awards landing page using React + Vite + Tailwind CSS + TypeScript + lucide-react. The page has 3 sections plus persistent overlay navigation elements. Use the fonts "Inter" (body) and "TT Firs Neue" (display headings). The entire page lives inside a white container with 20px padding (p-3 on mobile, p-5 on desktop) creating an inset card effect with large rounded corners (28px mobile, 36px desktop). The scrollable content lives in an absolutely-positioned div inside this container with hidden scrollbars.



---



## FONTS



Load via `<link>` in index.html:

- Google Fonts Inter: weights 300, 400, 500, 600, 700
- TT Firs Neue from: `https://db.onlinewebfonts.com/c/69f2576e7ca287875bf8d089130e292c?family=TT+Firs+Neue`

In CSS define:

```CSS
html, body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #ffffff;
}
.font-firs {
  font-family: 'TT Firs Neue', 'Inter', system-ui, sans-serif;
}
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
```



---



## COLOR PALETTE



- Primary dark: `#154359`
- Teal accent: `#066377`
- Light background: `#F0F0F0` (nominations section)
- Lighter background: `#F0F5F7` (about section)
- Gradient text: `linear-gradient(294deg, #185B7B 20%, #4BBDF0)`
- Nomination stroke: `rgba(6, 99, 119, 0.25)`

---



## OUTER SHELL STRUCTURE



```Plain Text
div.h-screen.bg-white.p-3.sm:p-5
  div.relative.w-full.h-full.overflow-hidden.rounded-[28px].sm:rounded-[36px].bg-white
    div.absolute.inset-0.overflow-y-auto.overflow-x-hidden.no-scrollbar
      [SECTIONS GO HERE]
    [NAV BAR - absolute positioned]
    [BOTTOM OVERLAYS - absolute positioned]
```



---



## SECTION 1: HERO



- Full viewport height: `min-height: calc(100vh - 40px)`
- Background: autoplaying, looping, muted video filling the section with `object-cover`

  - Video URL: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_151648_2bdfbd1c-6bde-4f5d-a967-f57cbced97f6.mp4`
- Overlay gradient on the video: `bg-gradient-to-b from-black/10 via-transparent to-black/20`

**Top bar (z-20):** flex row, justify-between, px-4 sm:px-10, pt-5 sm:pt-8

- Left: Logo using lucide-react `Sparkles` icon (w-5 h-5 sm:w-6 sm:h-6, strokeWidth 1.5) + text "launchex" (14px sm:15px, font-semibold, tracking-tight) and "awards" below (10px sm:11px, font-light, opacity-90, -mt-0.5). All white.
- Right: CTA button "Send in your entry form" (hidden on mobile, shows "Enter" on mobile). Teal background `#066377`, white text, 10px sm:11px, uppercase, tracking-[0.14em], font-medium. Has a chamfered/clipped shape using `clipPath: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)`. Includes `ArrowUpRight` icon (w-3.5 h-3.5) that moves on hover (translate-x-0.5, -translate-y-0.5). Button has `hover:brightness-125` transition.

**Center content (z-10):** flex-col, items-center, text-center, color `#154359`, pt-32 sm:pt-40, pb-24

- Eyebrow: "Prize for ventures" - 11px sm:12px, uppercase, tracking-[0.3em], font-medium, mb-6, opacity-90
- Heading: "launchex prizes" (two lines with `<br/>`), using `.font-firs`, font-normal, tracking-[-0.04em], leading-[0.9], sizes: 48px / 76px / 100px / 120px (responsive breakpoints)
- Subtext: "Bridging visions with reality, helping ventures soar up to the stars" - 12px sm:14px, uppercase, tracking-[0.22em], font-medium, max-w-md, leading-[1.8], opacity-90, mt-8

---



## SECTION 2: SUBMISSIONS (NOMINATIONS)



- Background: `#F0F0F0`
- Padding: py-20 sm:py-28, px-6 sm:px-10
- Overflow hidden, relative positioning

**Layout:** 3-column on large (left nominations | center video | right nominations), stacked on mobile (center first, then left, then right). max-w-5xl, mx-auto, gap-10 lg:gap-12.



**Center column:**

- Header text: "[submissions]" (12px, tracking-[0.24em], uppercase) and "submissions" below (font-firs, 44px sm:54px, font-semibold, tracking-tight, uppercase). Color `#154359`.
- Video below (mt-6 sm:mt-8): 220px/380px/460px square (responsive), object-cover

  - URL: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_154120_b89bfedd-530d-4ebb-9eb7-42eeafe08667.mp4`
  - autoPlay, loop, muted, playsInline

**Left nominations (3 cards), pushed down with lg:mt-36:**

1. "Lead" / "AI venture for commerce"
2. "Emerging innovations" / "in food commerce"
3. "The finest innovations" / "for learners and young students"

**Right nominations (3 cards), pushed down with lg:mt-36:**

1. "Innovations for advanced" / "career training"
2. "The finest innovations" / "in finance"
3. "Categories" / "coming soon"

**NominationCard component:**

- `<a>` tag, max-w-[20em], h-[5em], hover:-translate-y-0.5 transition
- Contains an SVG with a chamfered rectangle (polygon points="14,0 100,0 100,86 86,100 0,100 0,14") as border - stroke `rgba(6, 99, 119, 0.25)`, strokeWidth 1, vectorEffect non-scaling-stroke, fill none, preserveAspectRatio="none", viewBox="0 0 100 100"
- Text centered inside: title in 13px font-semibold, subtitle in 12px font-normal opacity-80. Color `#154359`.

**Bottom fade gradient (pointer-events-none, absolute, bottom-0, full width, h-40 sm:h-56, z-10):**

- `linear-gradient(to bottom, rgba(240, 245, 247, 0) 0%, rgba(240, 245, 247, 0.7) 60%, #F0F5F7 100%)`

---



## SECTION 3: ABOUT THE FOUNDERS



- Background: `#F0F5F7`
- Padding: py-20 sm:py-28, px-6 sm:px-10
- max-w-7xl mx-auto

**Top row:** flex-col on mobile, flex-row on lg. Color `#154359`.

- Left: Heading "About the founders" (two lines) - font-firs, 36px/48px/54px, font-semibold, uppercase, tracking-tight, leading-[0.95]
- Right: max-w-xl column

  - Two paragraphs (17px sm:18px, leading-[1.5]):
  
    - "Launchex.Hub is a platform that is part of a portfolio of companies Launchex, for sourcing and showcasing groundbreaking innovations."
    - "Launchex.Hub's mission is to offer every local-language innovator the chance to reshape our world with their pioneering creation."
  - Link "Launchex.Hub website" with arrow icon (mt-6, 14px, font-medium). Arrow in a chamfered 32x32 box with border in `#154359`, clipPath `polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)`. Hover: -translate-y-0.5. Links to `https://base.launchex.vc/`

**Stats grid (mt-14):** 1 col / 2 col md / 3 col lg, gap-5. Three cards:



Card 1: "7+ years" / "Launchex has served the market, guiding ventures and their journeys"

- Image: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260514_154203_6c6f94dc-a07e-4ba5-8688-106f01ccd2c8.png&w=1280&q=85`
- No vertical offset
- clipPath: `polygon(64px 0, calc(100% - 14px) 0, calc(100% - 4px) 4px, 100% 14px, 100% calc(100% - 14px), calc(100% - 4px) calc(100% - 4px), calc(100% - 14px) 100%, 14px 100%, 4px calc(100% - 4px), 0 calc(100% - 14px), 0 64px)`
- Text position: left-6 right-6 bottom-6

Card 2: "15000+" / "innovation ventures moved through the Launchex pipeline"

- Image: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260514_154151_45c62c60-3bcc-4f21-8f9d-03722ebb5df8.png&w=1280&q=85`
- Offset: lg:mt-24 (pushed down on desktop)
- clipPath: `polygon(0 14px, 4px 4px, 14px 0, calc(100% - 64px) 0, 100% 64px, 100% calc(100% - 14px), calc(100% - 4px) calc(100% - 4px), calc(100% - 14px) 100%, 64px 100%, 0 calc(100% - 64px))`
- Text position: left-6 bottom-20

Card 3: "120+" / "accelerator sessions delivered by Launchex across Eastern Europe"

- Image: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260514_152238_24ec8db4-d728-4739-bb30-e985533e9637.png&w=1280&q=85`
- No vertical offset
- clipPath: `polygon(0 14px, 4px 4px, 14px 0, calc(100% - 64px) 0, 100% 64px, 100% calc(100% - 64px), calc(100% - 64px) 100%, 14px 100%, 4px calc(100% - 4px), 0 calc(100% - 14px))`
- Text position: left-6 right-28 bottom-6

**Each stat card structure:**

- Outer div: w-full, h-[280px] sm:h-[340px], backgroundColor `rgba(255, 255, 255, 0.8)`, padding `1.5px` (acts as border), clipPath applied
- Inner div: w-full h-full, overflow-hidden, background-image set to the image URL, bg-cover bg-center, same clipPath applied, `mixBlendMode: 'plus-darker'`
- Text overlay (absolute positioned): value in font-firs, font-semibold, uppercase, 36px sm:52px, gradient text (`linear-gradient(294deg, #185B7B 20%, #4BBDF0)` with background-clip text, color transparent). Description in 14px, leading-[1.4], color `#154359`, mt-3. Max-width 66%.

**Bottom fade gradient (same as section 2):**

- `linear-gradient(to bottom, rgba(240, 245, 247, 0) 0%, rgba(240, 245, 247, 0.7) 60%, #F0F5F7 100%)`

---



## PERSISTENT OVERLAY ELEMENTS (inside the outer rounded container, outside the scrollable area)



**Top navigation bar:**

- Hidden on mobile (`hidden md:flex`), absolute, top-0, centered horizontally (left-1/2 -translate-x-1/2), z-40
- White background, border-bottom-left-radius and border-bottom-right-radius: 28px
- Padding: px-6 lg:px-10, py-4, gap-6 lg:gap-10
- Links: "About", "Submissions", "Venue", "Judges", "Connect" - 11px, uppercase, tracking-[0.14em], font-medium, text-neutral-800, hover:text-neutral-500
- Two decorative `<span>` elements on left (-left-6) and right (-right-6) that create inverted rounded corners using radial-gradient masks:

  - Left: `radial-gradient(circle at 0 100%, transparent 24px, black 25px)`
  - Right: `radial-gradient(circle at 100% 100%, transparent 24px, black 25px)`

**Bottom-right page indicator:**

- pointer-events-none, absolute, bottom-4 sm:bottom-6, right-4 sm:right-8, z-40
- "01" [line] "05" - flex, gap-3, text-white/80, 10px, font-medium, uppercase, tracking-[0.18em], mix-blend-difference
- Line is a span: w-8 h-px bg-white/40

**Bottom-left scroll indicator:**

- pointer-events-none, absolute, bottom-4 sm:bottom-6, left-4 sm:left-8, z-40
- "Scroll to discover" - text-white/80, 10px, font-medium, uppercase, tracking-[0.18em], mix-blend-difference

---



## KEY IMPLEMENTATION DETAILS



- All clip-paths use the `polygon()` function with pixel-based chamfers creating angular/geometric cut corners
- The page is fully responsive with sm/md/lg breakpoints
- Videos use autoPlay, loop, muted, playsInline attributes
- Use lucide-react for Sparkles and ArrowUpRight icons only
- The stat card images use `mix-blend-mode: plus-darker` for a deeper tonal effect
- No scrollbar is visible (custom CSS utility)
- All transitions are subtle: translate, color changes, brightness
- The outer container clips all content with its rounded corners - the scroll happens inside


---

# 068 Acreage Farming

# Acreage Farming

Precision farming landing page with dark/light sections, hero video background, stats grid, logo marquee, and service cards.


---

# 069 Evergreen Finance

# Evergreen Finance

Build a "Kova" fintech landing page in React + Vite + Tailwind CSS + Framer Motion + Lucide React. The page has 3 sections: a full-screen Hero with a boomerang video background, a Testimonial section, and a Features section. Use the exact specifications below. Do NOT use purple/indigo colors anywhere.



---



## FONTS



Load these two web fonts in `index.html` via `<link>` tags:

- `https://db.onlinewebfonts.com/c/53077f9a3eee9c479d37d6af20394ded?family=Cooper+BT+W01+Light`
- `https://db.onlinewebfonts.com/c/5ade3423145f3b9f7031574333ca0b73?family=Cooper+BT+W01+Medium`

Define two utility classes in your CSS:

- `.font-cooper` — `font-family: 'Cooper BT W01 Light', 'Georgia', serif;`
- `.font-cooper-medium` — `font-family: 'Cooper BT W01 Medium', 'Cooper BT W01 Light', 'Georgia', serif; font-weight: 500;`

---



## COLOR PALETTE



- Primary dark green: `#08150C`
- Hover dark green: `#1a2e1f`
- Warm cream background: `#FDF5EB`
- Light beige card: `#EBE4DC`
- Inner card beige: `#F4F1EC`
- Donut chart colors: `#C46B2D`, `#7A8C3E`, `#A8B87A`, `#B8AFA4`
- Body/text: stone-600, stone-700, stone-800 (Tailwind)
- Accent greens: emerald-400, emerald-500 (Tailwind)

---



## ANIMATIONS (FadeUp Component)



Create a reusable `<FadeUp>` component using Framer Motion with two modes:

- **`immediate` (prop)**: Animates on mount using `animate="visible"` — used for Hero elements.
- **Default (scroll-triggered)**: Uses `whileInView="visible"` with `viewport={{ once: true, margin: '-60px' }}` — used for Testimonial and Features sections.

Variants:

- `hidden`: `{ opacity: 0, y: 24, filter: 'blur(8px)' }`
- `visible`: `{ opacity: 1, y: 0, filter: 'blur(0px)' }`
- Transition: `{ duration: 0.7, delay: [configurable], ease: [0.25, 0.1, 0.25, 1] }`

Props: `children`, `delay` (default 0), `className`, `immediate` (default false).



---



## SECTION 1: HERO (full viewport height)



### Background — Boomerang Video



Create a `<BoomerangVideoBg>` component that:

1. Loads this video (muted, playsInline, crossOrigin="anonymous"): `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_070729_32a7eb4e-d6e2-4571-badc-91b4dab1ecbe.mp4`
2. Captures every frame into offscreen canvas elements (max width 960px) as the video plays through once using `requestVideoFrameCallback` (with a `requestAnimationFrame` fallback).
3. After the video ends, plays back captured frames in a forward/reverse boomerang loop on a visible `<canvas>` at 30fps.
4. Wraps everything in `absolute inset-0 w-full h-full scale-[1.08] origin-center`.
5. Shows the `<video>` while capturing, then swaps to the `<canvas>` once frames are ready.

### Navbar (FadeUp delay=0, immediate)

- Flex row, `justify-between`, padding `px-5 sm:px-10 lg:px-16 py-5`
- Left: Brand name "Kova" in `font-cooper text-xl sm:text-2xl text-[#08150C] tracking-tight`
- Center (hidden on mobile, `hidden md:flex`): Links "Explore", "Pricing" (active with underline bar), "Perks", "Reach" — `text-sm text-stone-700`, hover to `text-[#08150C]`. Active link has `font-medium text-[#08150C]` with `absolute -bottom-1 left-0 right-0 h-0.5 bg-[#08150C] rounded-full` underline span.
- Right desktop: "Get Started" button — `bg-[#08150C] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#1a2e1f]`
- Right mobile: Hamburger (Menu/X icons from Lucide, size 22), toggles a dropdown menu with same links + button, styled `bg-white/95 backdrop-blur-md shadow-lg`

### Hero Content (centered, flex-col items-center text-center)

- `px-5 sm:px-10 pt-8 sm:pt-14 pb-8 sm:pb-14`
- **Heading** (FadeUp delay=0.1, immediate): `font-cooper text-[2.2rem] sm:text-5xl md:text-6xl lg:text-7xl text-[#08150C] leading-tight max-w-5xl tracking-tight` — Text: "Own your money and build the wealth you deserve"
- **Subtext** (FadeUp delay=0.25, immediate): `mt-4 sm:mt-5 text-sm sm:text-base text-stone-600 max-w-sm sm:max-w-md leading-relaxed` — Text: "Step into a smarter way to bank, right from your pocket. Kova gives you instant control over your money, wherever you are."
- **CTA Buttons** (FadeUp delay=0.4, immediate): Two buttons in `flex-col sm:flex-row gap-3`:

  1. "Watch 30s Demo" — white/80 backdrop-blur, border stone-200, Play icon (size 14, fill-stone-800), rounded-xl
  2. "Get the App" — bg-[#08150C] text-white, Download icon (size 14), rounded-xl

### Dashboard Cards (bottom of hero, FadeUp immediate)

Three cards in a flex row (`items-end justify-center gap-2 sm:gap-4`), outer two hidden on mobile (`hidden sm:block`):



1. **SavingsCard** (delay=0.55, w-44 sm:w-64): White/95 backdrop-blur rounded-2xl, shows "Savings" label, "+25%" badge, "+12%" badge, an SVG line chart (green polyline with gradient fill), month labels Jan-Apr.
2. **OthersCard** (delay=0.65, w-44 sm:w-72): "Others" header with "Monthly" dropdown pill, three percentage stats (78% Groceries, 43% Entertain., 23% Transport), bar chart (12 bars, 5th bar orange `#f97316`, rest gray `#d1d5db`).
3. **BillPayCard** (delay=0.75, w-44 sm:w-64): "Bill Pay" header with "Monthly" dropdown pill, "-8%" red badge, bar chart (12 bars, 7th bar dark `#08150C`, rest light gray `#e5e7eb`), month labels.

---



## SECTION 2: TESTIMONIAL



Background: `bg-[#FDF5EB] py-14 sm:py-20 px-5 sm:px-10 lg:px-20`

Layout: `max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 md:gap-16 items-center`



### Left Column (scroll-animated FadeUp, staggered delays 0 through 0.4):

- **Heading** (delay=0): `font-cooper-medium text-2xl sm:text-3xl text-[#08150C] leading-snug mb-6 sm:mb-8` — "Trusted by ambitious, fast-moving teams"
- **Company badge** (delay=0.1): Dark square icon "A" (`w-7 h-7 rounded-md bg-[#08150C]`) + "Arcvex" text
- **Quote** (delay=0.2): `font-cooper text-stone-700 text-lg sm:text-xl md:text-2xl leading-relaxed mb-5 sm:mb-6` — "With Kova, I have full visibility into our team's spending in real time. It feels like having a sharp financial advisor available at every hour, helping us stay on budget and make wiser calls."
- **Attribution** (delay=0.3): "Maya Reeves" (text-sm font-semibold) + "Director, Arcvex" (text-xs text-stone-500)
- **Button** (delay=0.4): "All Stories" with arrow SVG icon, same dark button style

### Right Column (FadeUp delay=0.15, scroll-triggered):

- A looping muted autoplay video: `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_074029_c7a854bd-2d6e-4b62-96b3-ae8c16311e44.mp4`
- Styling: `w-full rounded-2xl object-cover aspect-square`, wrapped in `max-w-xs sm:max-w-sm`

---



## SECTION 3: FEATURES



Background: `bg-[#FDF5EB] py-14 sm:py-20 px-5 sm:px-10 lg:px-20`

Layout: `max-w-7xl mx-auto`



### Header Row (scroll-animated):

- **Heading** (FadeUp delay=0): `font-cooper-medium text-2xl sm:text-3xl md:text-4xl text-[#08150C] leading-snug` — "Designed to sharpen every decision"
- **Button** (FadeUp delay=0.1): "Watch Demo" with Play icon (size 13, fill-white), same dark button style

### Cards Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`



Each card is `aspect-[3/4] rounded-2xl overflow-hidden`, scroll-animated with staggered delays (0.05, 0.15, 0.25, 0.35):



**Card 1 — Smart Budgeting** (delay=0.05):

- Background image (absolute, object-cover): `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260517_061249_f20dfeda-1033-45ce-a3ee-070965599cbf.png&w=1280&q=85`
- Gradient overlay: `bg-gradient-to-t from-[#08150C]/80 via-[#08150C]/20 to-transparent`
- Top label: Sparkles icon (Lucide, size 16, white) + "Smart Budgeting" in white text-sm font-medium
- Bottom text: "Let AI reshape how you plan your spending. Kova adapts to your..." in `text-white/80 text-sm sm:text-base`

**Card 2 — Bank-Grade Security** (delay=0.15):

- Background image: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260517_061305_db631f5f-185f-4fda-a7a8-1dd7359ef2ea.png&w=1280&q=85`
- Same gradient overlay
- Top label: ShieldCheck icon (Lucide, size 16, white) + "Bank-Grade Security"
- Bottom text: "Keep your money safe with end-to-end encryption, live fraud alerts, and two-factor auth..."

**Card 3 — Spend Insights** (delay=0.25):

- NO background image. Solid background `#EBE4DC`, with `p-5`
- Top label: PieChart icon (Lucide, size 16, text-stone-700) + "Spend Insights" in `text-stone-700 text-sm font-medium`
- Inner container: `rounded-2xl p-4` with background `#F4F1EC`, centered content:

  - "Monthly Spend" title (text-sm sm:text-base font-semibold text-stone-800)
  - "1 Apr – 30 May 2026" subtitle (text-xs sm:text-sm text-stone-500)
  - Donut chart (SVG, viewBox="0 0 36 36", `-rotate-90`): 4 colored arcs using strokeDasharray/strokeDashoffset on circles (r=14, strokeWidth=5). Colors: `#C46B2D` (26.4/61.56), `#7A8C3E` (22/65.96, offset -26.4), `#A8B87A` (17.6/70.36, offset -48.4), `#B8AFA4` (22/65.96, offset -66)
  - Center overlay: "50%" bold + "of budget" small text

**Card 4 — Wealth Building** (delay=0.35):

- Background image: `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260517_061316_50e651f8-02d0-4add-9ddb-7d81d15ac02e.png&w=1280&q=85`
- Same gradient overlay
- Top label: TrendingUp icon (Lucide, size 16, white) + "Wealth Building"
- Bottom text: "Grow your net worth with tools that help you set targets, monitor gains, and act..."

---



## DEPENDENCIES



```JSON
{
  "framer-motion": "^12.38.0",
  "lucide-react": "^0.344.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```



Dev: Vite, Tailwind CSS 3, TypeScript, PostCSS, Autoprefixer.



---



## GLOBAL CSS (`index.css`)



```CSS
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; overflow-x: hidden; }
}

.font-cooper {
  font-family: 'Cooper BT W01 Light', 'Georgia', serif;
}

.font-cooper-medium {
  font-family: 'Cooper BT W01 Medium', 'Cooper BT W01 Light', 'Georgia', serif;
  font-weight: 500;
}
```



---



## RESPONSIVE BEHAVIOR



- Mobile-first. Cards stack on small screens (1 col), 2 cols at `sm`, 4 cols at `lg`.
- Hero dashboard cards: outer two hidden below `sm`.
- Nav links/CTA hidden below `md`, replaced by hamburger menu.
- All text sizes step up at `sm` and `md` breakpoints.
- Testimonial grid is single column on mobile, `3fr 2fr` at `md`.

---



## KEY IMPLEMENTATION NOTES



- The entire page background is white for the hero (video fills it) and `#FDF5EB` for the lower two sections.
- All buttons use `rounded-xl` (not full pill).
- The BoomerangVideoBg uses `scale-[1.08]` to prevent edge gaps during playback.
- No page scroll on the hero (`min-h-screen overflow-hidden`).
- The hero content uses `flex-1 flex flex-col justify-between` to push cards to the bottom.


---

# 070 Bloom AI Hero Section

# Bloom AI Hero Section

Create a full-screen hero landing page for "Bloom" — an AI-powered plant/floral design platform. The design uses a liquid glass morphism aesthetic over a looping video background.



Background

Full-screen autoplaying, looping, muted video background: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4

Video covers entire viewport with object-cover, sits at z-0. All content floats above at z-10.



Fonts

Display/Body: Poppins (Google Fonts) — used for headings and body text

Serif accent: Source Serif 4 (Google Fonts) — used only for italic/emphasis text inside headings (e.g., <em>, <i>, .italic inside h1-h3)

Headings use font-weight: 500



Color Palette

Strict grayscale only — all CSS variables are 0 0% X% HSL values

Text is text-white, text-white/80, text-white/60, text-white/50 for hierarchy

No colored accents whatsoever



Liquid Glass CSS (two tiers)

Define under @layer components:



.liquid-glass (light)

background: rgba(255,255,255,0.01);

background-blend-mode: luminosity;

backdrop-filter: blur(4px);

border: none;

box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);

position: relative; overflow: hidden;

::before pseudo-element: gradient border using linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, transparent 40%, transparent 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%) with padding: 1.4px, masked via -webkit-mask-composite: xor; mask-composite: exclude;



.liquid-glass-strong (heavy, for CTA/panels)

Same structure but backdrop-filter: blur(50px), box-shadow: 4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15), and ::before uses 0.5/0.2 alpha instead of 0.45/0.15.



Layout — Two-Panel Split

Flex row, min-h-screen. Left panel w-[52%], right panel w-[48%] (hidden on mobile lg:flex).



Left Panel

Has a liquid-glass-strong overlay (absolute inset-4 lg:inset-6 rounded-3xl)

Nav: Logo image (/logo.png, 32×32) + "bloom" text (semibold, 2xl, tracking-tighter, white) on left. "Menu" button with Menu icon on right, liquid-glass pill.

Hero center (flex-1, centered):

Logo image again (80×80)

h1: "Innovating the / spirit of bloom AI" — text-6xl lg:text-7xl, tracking-[-0.05em], white. The italic part uses font-serif text-white/80

CTA button: "Explore Now" with Download icon in a w-7 h-7 rounded-full bg-white/15 circle. Button is liquid-glass-strong, rounded-full, hover:scale-105 active:scale-95

Three pills: "Artistic Gallery", "AI Generation", "3D Structures" — liquid-glass, rounded-full, text-xs text-white/80

Bottom quote:

"VISIONARY DESIGN" label (text-xs tracking-widest uppercase text-white/50)

Quote: "We imagined a realm with no ending." — mixed font-display/font-serif italic spans

Author: "MARCUS AURELIO" with horizontal lines on each side



Right Panel (desktop only)

Top bar: Social icons (Twitter, LinkedIn, Instagram) in a liquid-glass pill with ArrowRight. Account button with Sparkles icon button, both liquid-glass.

Community card: Small liquid-glass card (w-56), "Enter our ecosystem" title + description

Bottom feature section (mt-auto): Outer liquid-glass container with rounded-[2.5rem]

Two side-by-side cards: "Processing" (Wand2 icon) and "Growth Archive" (BookOpen icon), each liquid-glass rounded-3xl

Bottom card: flower image thumbnail (from @/assets/hero-flowers.png, 96×64), "Advanced Plant Sculpting" title + description, and a "+" button. All liquid-glass.



Icons

All from lucide-react: Sparkles, Download, Wand2, BookOpen, ArrowRight, Twitter, Linkedin, Instagram, Menu



Key Details

All interactive elements: hover:scale-105 transition-transform

Social icon links: text-white hover:text-white/80 transition-colors

Icon containers: w-8 h-8 rounded-full bg-white/10 flex items-center justify-center

No border classes anywhere — glass effect handles all borders via ::before

border-radius token: --radius: 1rem


---

# 071 FinancialFocus

# FinancialFocus

<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>3D Cylinder Carousel</title>



  <link rel="preconnect" href="https://fonts.googleapis.com">

  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@300;400;500;600;700;800&family=Mr+Dafoe&display=swap" rel="stylesheet">



  <!-- Tailwind CSS V4 -->

  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>



  <!-- React & ReactDOM -->

  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>

  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>



  <!-- Babel for JSX and TS parsing -->

  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>



  <style type="text/tailwindcss">

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@300;400;500;600;700;800&family=Mr+Dafoe&display=swap');

@import "tailwindcss";



@theme {

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  --font-manrope: "Manrope", sans-serif;

  --font-signature: "Mr Dafoe", cursive;

}



/\* Custom horizontal scanlines or grids for high-tech background \*/

.bg-grid-subtle {

  background-size: 40px 40px;

  background-image:

    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),

    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);

}



.perspective-1200 {

  perspective: 1200px;

}



/\* Scrollbar customizations \*/

::-webkit-scrollbar {

  width: 6px;

  height: 6px;

}

::-webkit-scrollbar-track {

  background: rgba(0, 0, 0, 0.3);

}

::-webkit-scrollbar-thumb {

  background: rgba(255, 255, 255, 0.1);

  border-radius: 3px;

}

::-webkit-scrollbar-thumb:hover {

  background: rgba(255, 255, 255, 0.25);

}





    body {

      margin: 0;

      padding: 0;

      width: 100vw;

      height: 100vh;

      overflow: hidden;

      background-color: #000;

    }



    #root {

      width: 100%;

      height: 100%;

    }

  </style>

</head>

<body>

  <div id="root"></div>



  <script type="text/babel" data-presets="react,typescript">

const { useState, useEffect, useRef } = React;



const Menu = ({ className, strokeWidth = 2 }) => (

  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>

    <line x1="4" x2="20" y1="12" y2="12" />

    <line x1="4" x2="20" y1="6" y2="6" />

    <line x1="4" x2="20" y1="18" y2="18" />

  </svg>

);





const CARD_VIDEOS = [

  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4',

  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_171347_f640c30d-ec21-426a-98bc-77e07c2c60cb.mp4',

  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4',

  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4',

  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4',

  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4',

  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4'

];



// Nine beautiful premium solid colors to clearly track the cards

const CARD_COLORS = [

  '#FF3B30', // Apple Red

  '#FF9500', // Apple Orange

  '#FFCC00', // Apple Yellow

  '#34C759', // Apple Green

  '#007AFF', // Apple Blue

  '#5856D6', // Apple Purple

  '#FF2D55', // Apple Pink

  '#AF52DE', // Apple Violet

  '#00C7BE', // Apple Teal

];



// Different card details for each of the cards

const CARD_DETAILS = [

  { number: '4232 8908 1121 4892', name: 'ZACHARY MERCER', cvv: '382' },

  { number: '4154 7831 9904 5124', name: 'SOPHIA MARTINEZ', cvv: '109' },

  { number: '5457 4120 7733 9035', name: 'BENJAMIN CARTER', cvv: '764' },

  { number: '4441 5567 1223 2468', name: 'EMILY MORRISON', cvv: '491' },

  { number: '5375 8891 2234 7713', name: 'JACKSON REID', cvv: '255' },

];





function App() {

  const cardCount = 5;

  const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);

  const frameId = useRef<number>(0);



  // Continuous scroll progress

  const progress = useRef<number>(0);



  // Track mouse coordinates for interactive 3D parallax tilt with inertia damping

  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });



  // Responsive state containing card dimensions

  const [metrics, setMetrics] = useState({

    cardW: 336,

    cardH: 211, // 1.59 standard credit card ratio

  });



  // Typography metrics to prevent collisions beautifully across all viewports

  const [fontMetrics, setFontMetrics] = useState({

    titleFontSize: '1.5rem',

    sigFontSize: '2.5rem',

    descFontSize: '14px',

    titleGap: '40px',

    pl: '0px'

  });



  useEffect(() => {

    const handleMouseMove = (e: MouseEvent) => {

      // Screen-space cursor offset relative to window center, clamped to [-1.0, 1.0] range

      const rx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);

      const ry = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      mouse.current.targetX = Math.max(-1, Math.min(1, rx));

      mouse.current.targetY = Math.max(-1, Math.min(1, ry));

    };



    const handleMouseLeave = () => {

      // Return gently to center orientation when mouse focus is lost or moves away

      mouse.current.targetX = 0;

      mouse.current.targetY = 0;

    };



    window.addEventListener('mousemove', handleMouseMove);

    document.addEventListener('mouseleave', handleMouseLeave);



    return () => {

      window.removeEventListener('mousemove', handleMouseMove);

      document.removeEventListener('mouseleave', handleMouseLeave);

    };

  }, []);



  useEffect(() => {

    const handleResize = () => {

      const w = window.innerWidth;

      const h = window.innerHeight;



      // 1. Calculate Card Metrics (shrink cards if height is small to save vertical space)

      let cardW = Math.round(w \* 0.16 + 130);



      const heightFactor = Math.min(1.0, Math.max(0.65, h / 850));

      cardW = Math.round(cardW \* heightFactor);



      cardW = Math.min(336, Math.max(150, cardW));

      const cardH = Math.round(cardW / 1.5925); // Standard credit card ratio



      setMetrics({ cardW, cardH });



      // 2. Calculate Typography Metrics (shrink font sizes aggressively if height or width is small)

      const isMobile = w < 640;



      let titleSize = '';

      let sigSize = '';

      let descSize = '';

      let titleGap = '40px';

      let plVal = '0px';



      if (isMobile) {

        // Mobile style: centered, text size increased by 30% for high legibility

        titleSize = 'clamp(1.8rem, 5.2vw + 0.4rem, 2.2rem)';

        sigSize = 'clamp(2.86rem, 7.8vw + 0.6rem, 3.5rem)';

        descSize = 'clamp(0.72rem, 1.4vw + 0.35rem, 0.95rem)';

        titleGap = '24px';

        plVal = '0px';

      } else {

        // Desktop / Tablet style: aligned bottom-left

        // Scale factor depends on width and height to shrink before hitting cards

        const scale = Math.min(1.0, Math.max(0.48, (w \* 0.45 + h \* 0.55) / 1300));



        titleSize = `${Math.max(1.15, 3.5 * scale).toFixed(3)}rem`;

        sigSize = `${Math.max(1.5, 4.5 * scale).toFixed(3)}rem`;

        descSize = `${Math.max(11, 16 * scale).toFixed(1)}px`;

        titleGap = `${Math.max(16, Math.round(40 * scale))}px`;

        plVal = `${Math.min(6, Math.max(2.8, 3.5 * scale + 2.2)).toFixed(2)}rem`;

      }



      setFontMetrics({

        titleFontSize: titleSize,

        sigFontSize: sigSize,

        descFontSize: descSize,

        titleGap,

        pl: plVal

      });

    };



    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);

  }, []);



  // Compute positions, rotations, and visual rules at 60fps

  const renderLoop = () => {

    // Upward flow speed of continuous transition - decreased speed by more than half for slower, premium, and calmer transitions

    progress.current += 0.0016; 



    // Smoothly interpolate current mouse variables towards their target positions (damping/inertia logic)

    mouse.current.x += (mouse.current.targetX - mouse.current.x) \* 0.08;

    mouse.current.y += (mouse.current.targetY - mouse.current.y) \* 0.08;



    const cards = cardsRefs.current;

    const h = window.innerHeight;

    const { cardH } = metrics;



    const continuousProgress = progress.current;

    const roundedIndex = Math.round(continuousProgress);

    const diffFromRound = continuousProgress - roundedIndex; // ranges between [-0.5, 0.5]



    // Custom non-linear magnetic step logic

    // It creates a gorgeous brief "dwell/pause" at front center before accelerating to the next card

    const easedDiff = Math.sign(diffFromRound) \* Math.pow(Math.abs(diffFromRound) \* 2, 4.2) / 2;

    const virtualActiveIndex = roundedIndex + easedDiff;



    for (let i = 0; i < cardCount; i++) {

      const card = cards[i];

      if (!card) continue;



      // Solve circular wrapping to get closest representation in [-cardCount/2, cardCount/2]

      let offset = i - virtualActiveIndex;

      const halfCount = cardCount / 2;

      while (offset > halfCount) offset -= cardCount;

      while (offset < -halfCount) offset += cardCount;



      const absOffset = Math.abs(offset);

      const sign = Math.sign(offset);



      // Allow cards to render completely off-screen smoothly up to offset 3.0. This prevents any clipping or sudden pop-outs.

      if (absOffset > 3.0) {

        card.style.visibility = 'hidden';

        continue;

      } else {

        card.style.visibility = 'visible';

      }



      // Spacing gap between center card and adjacent cards

      const gap = 36;

      const peekAmount = -55; // Push the card's edge 55px past the screen boundary to hide a premium portion of it!

      const D = 1350; // Perspective distance



      let y = 0;

      let z = 0;

      let rot = 0;



      if (absOffset <= 1) {

        // Smoothstep interpolation from 0 to 1 (Center card to first adjacent card)

        const t = absOffset;

        const easedT = t \* t \* (3 - 2 \* t);



        // Y moves from 0 to (cardH + gap)

        const targetY = cardH + gap;

        y = -sign \* (easedT \* targetY);



        // Z moves from 400 (center) to 220 (adjacent)

        z = 400 + easedT \* (220 - 400);



        // Rotation moves from 0 to 132 degrees (beautiful tilted back face)

        rot = easedT \* 132;

      } else if (absOffset <= 2) {

        // Smoothstep interpolation from 1 to 2 (Adjacent card to peeking screen-edge card)

        const t = absOffset - 1;

        const easedT = t \* t \* (3 - 2 \* t);



        const yStart = cardH + gap;

        const zStart = 220;

        const rotStart = 132;



        const zEnd = -60;

        const rotEnd = 175;



        // Perspective-aware formula for exact edge alignment at the screen boundary (peekAmount = 26px inside)

        const sEnd = D / (D - zEnd);

        const yEnd = (h / 2 - peekAmount) / sEnd - (cardH / 2);



        const currentY = yStart + easedT \* (yEnd - yStart);

        y = -sign \* currentY;



        z = zStart + easedT \* (zEnd - zStart);

        rot = rotStart + easedT \* (rotEnd - rotStart);

      } else {

        // Smoothstep interpolation from 2 to 3 (Peeking card to completely off-screen card)

        const t = Math.min(absOffset - 2, 1);

        const easedT = t \* t \* (3 - 2 \* t);



        const zStart = -60;

        const rotStart = 175;



        const zEnd3 = -250;

        const rotEnd3 = 195;



        const sEnd2 = D / (D - zStart);

        const yEnd2 = (h / 2 - peekAmount) / sEnd2 - (cardH / 2);



        // Calculate yEnd3 dynamically so that the card's edge is completely 100px past the screen boundary

        const sEnd3 = D / (D - zEnd3);

        const yEnd3 = (h / 2 + 100) / sEnd3 + (cardH / 2);



        const currentY = yEnd2 + easedT \* (yEnd3 - yEnd2);

        y = -sign \* currentY;



        z = zStart + easedT \* (zEnd3 - zStart);

        rot = rotStart + easedT \* (rotEnd3 - rotStart);

      }



      const localCardRotation = -sign \* rot;



      // Determine how close this card is to the exact center (1.0 = center, 0.0 = adjacent/offscreen)

      const centerFactor = Math.max(0, 1 - absOffset);



      // Vertical tilt (around X-axis) and horizontal tilt (around Y-axis) driven by mouse coordinates

      const maxTiltY = 15; // Max angle tilt left-to-right (degrees)

      const maxTiltX = 12; // Max angle tilt up-and-down (degrees)



      const activeTiltX = -mouse.current.y \* maxTiltX \* centerFactor;

      const activeTiltY = mouse.current.x \* maxTiltY \* centerFactor;



      const totalRotX = localCardRotation + activeTiltX;

      const totalRotY = activeTiltY;



      // Depth z-index layer

      card.style.zIndex = Math.round(z).toString();

      card.style.opacity = '1';



      // Inject translation matrix with the premium -3deg tilt combined with dynamic mouse-interactive 3D tilt

      card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${totalRotY.toFixed(2)}deg) rotateZ(-3deg)`;

    }

  };



  useEffect(() => {

    const tick = () => {

      renderLoop();

      frameId.current = requestAnimationFrame(tick);

    };



    frameId.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId.current);

  }, [metrics]);



  // Slices for 3D volumetric depth with 30% reduced thickness

  // Span from -1.47px to 1.47px creates an extremely premium real 3D volume feel

  const thicknessLayers = [-1.47, -0.73, 0, 0.73, 1.47];



  return (

    <div className="absolute inset-0 bg-[#000000] text-white flex items-center justify-center overflow-hidden select-none">



      {/\* Background full-screen image under the cards component \*/}

      <div id="full-screen-wave-background" className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">

        <img

          src="https://ais-pre-n2veyqxlgp2lg3yian6tqu-115844097173.asia-southeast1.run.app/wave-icon.svg"

          alt="Wave Background"

          className="w-full h-auto max-h-screen select-none pointer-events-none"

          referrerPolicy="no-referrer"

        />

      </div>



      {/\* Wavebank Brand Logo at bottom right corner of the screen \*/}

      <div

        id="screen-bottom-right-brand"

        className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 lg:bottom-16 lg:right-16 z-50 hidden sm:flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer"

      \>

        <img

          src="https://ais-pre-n2veyqxlgp2lg3yian6tqu-115844097173.asia-southeast1.run.app/w.svg"

          alt="Brand Logo"

          className="h-[40px] w-auto select-none pointer-events-none"

          referrerPolicy="no-referrer"

        />

      </div>



      {/\* Screen bottom-left Heading & Descriptor Content (Restored to bottom-left with high selectability layering, fluid relative scaling & flawless mobile centering) */}*

      *<div*

        *id="screen-bottom-left-brand-content"*

        *className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:bottom-8 sm:left-8 lg:bottom-16 lg:left-16 z-50 flex flex-col items-center text-center sm:items-start sm:text-left w-[92vw] sm:w-auto max-w-[95vw] sm:max-w-xl lg:max-w-[850px] pointer-events-auto select-none"*

      *>*

        *<h1*

          *className="font-manrope text-white font-semibold leading-[1.1] tracking-tight"*

          *style={{ fontSize: fontMetrics.titleFontSize }}*

        *>*

          *{/* Indentation for "Get More With" starts on screens sm and up to prevent off-centering on mobile \*/}

          <span

            className="inline-flex items-baseline md:translate-y-[1px]"

            style={{ paddingLeft: fontMetrics.pl }}

          \>

            <span

              className="font-signature text-[#00FF88] mr-2.5 leading-[0.8] select-none"

              style={{ fontStyle: 'normal', fontSize: fontMetrics.sigFontSize }}

            \>

              Get More

            </span>

            <span className="text-white leading-none">With</span>

          </span>

          <br />

          <span className="inline-block leading-none">Our Bank Cards – Easy,</span>

          <br />

          <span className="inline-block leading-none">Secure, Rewarding</span>

        </h1>



        <div

          className="w-full flex justify-center sm:justify-end"

          style={{ marginTop: fontMetrics.titleGap }}

        \>

          <p

            className="font-manrope text-center sm:text-right text-white/50 leading-relaxed max-w-[85vw] sm:max-w-[280px] md:max-w-[340px] lg:max-w-[420px] tracking-wide font-normal select-none"

            style={{ fontSize: fontMetrics.descFontSize }}

          \>

            <span className="block">Experience Effortless Banking With Our Cards That</span>

            <span className="block">Offer Security, Simplicity, And Exciting Rewards</span>

            <span className="block">Tailored For You.</span>

          </p>

        </div>

      </div>



      {/\* Wavebank Header brand overlay */}*

      *<header className="absolute top-0 left-0 right-0 p-5 sm:p-6 lg:p-16 z-50 flex items-center justify-between pointer-events-none">*

        *{/* Left side: Custom wavebank SVG Logo \*/}

        <div className="flex items-center pointer-events-auto cursor-pointer group">

          <svg

            width="182"

            height="25"

            viewBox="0 0 341 49"

            fill="none"

            xmlns="http://www.w3.org/2000/svg"

            className="w-auto h-[25px] sm:h-[28px] transform group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"

          \>

            <path d="M8.75294 47.68C6.10761 47.68 4.10227 47.04 2.73694 45.76C1.41427 44.48 0.582275 42.7733 0.240941 40.64C-0.100392 38.464 -0.0790588 36.0747 0.304941 33.472C0.731608 30.8267 1.37161 28.1813 2.22494 25.536C3.07827 22.848 3.99561 20.3307 4.97694 17.984C6.00094 15.5947 6.93961 13.5893 7.79294 11.968C8.26227 11.072 8.88094 10.56 9.64894 10.432C10.4169 10.2613 11.1423 10.368 11.8249 10.752C12.5503 11.136 13.0623 11.6907 13.3609 12.416C13.7023 13.1413 13.6383 13.9307 13.1689 14.784C11.2916 18.368 9.79828 21.7813 8.68894 25.024C7.57961 28.2667 6.85427 31.1467 6.51294 33.664C6.21427 36.1387 6.23561 38.1013 6.57694 39.552C6.96094 40.96 7.68628 41.664 8.75294 41.664C9.73428 41.664 10.8009 41.3013 11.9529 40.576C13.1049 39.8507 14.3423 38.5493 15.6649 36.672C17.0303 34.6667 18.3529 32.064 19.6329 28.864C20.9556 25.6213 22.1289 21.8667 23.1529 17.6C23.4089 16.6187 23.8783 15.9573 24.5609 15.616C25.2863 15.2747 26.0329 15.2107 26.8009 15.424C27.5689 15.6373 28.1876 16.064 28.6569 16.704C29.1263 17.3013 29.2543 18.0693 29.0409 19.008C27.9316 23.616 27.3769 27.5627 27.3769 30.848C27.4196 34.1333 27.7609 36.5227 28.4009 38.016C28.8703 39.0827 29.4249 39.8507 30.0649 40.32C30.7476 40.7893 31.4943 41.024 32.3049 41.024C33.1156 41.024 33.9689 40.7253 34.8649 40.128C35.8036 39.488 36.7209 38.4 37.6169 36.864C38.5556 35.328 39.3876 33.216 40.1129 30.528C37.6809 28.48 35.6756 25.7707 34.0969 22.4C32.5183 19.0293 31.7289 15.168 31.7289 10.816C31.7289 8.93867 31.9423 7.21067 32.3689 5.632C32.7956 4.05333 33.5209 2.79467 34.5449 1.856C35.5689 0.874666 36.9769 0.383999 38.7689 0.383999C40.9449 0.383999 42.7156 1.17333 44.0809 2.752C45.4463 4.288 46.4489 6.37867 47.0889 9.024C47.7289 11.6267 48.0063 14.5493 47.9209 17.792C47.8783 21.0347 47.5369 24.3413 46.8969 27.712C47.5369 28.0107 48.2196 28.2453 48.9449 28.416C49.7129 28.5867 50.4809 28.672 51.2489 28.672C52.9983 28.672 54.7903 28.416 56.6249 27.904C58.5023 27.3493 60.1023 26.6453 61.4249 25.792C62.2783 25.2373 63.0676 25.088 63.7929 25.344C64.5183 25.5573 65.0943 26.0053 65.521 26.688C65.9476 27.328 66.1183 28.0533 66.0329 28.864C65.9903 29.632 65.5636 30.272 64.7529 30.784C62.8756 32.0213 60.7423 33.0027 58.3529 33.728C56.0063 34.4533 53.6383 34.816 51.2489 34.816C49.2863 34.816 47.3449 34.4533 45.4249 33.728C44.1876 37.7387 42.5023 40.96 40.3689 43.392C38.2356 45.824 35.5476 47.04 32.3049 47.04C30.2569 47.04 28.3583 46.4427 26.6089 45.248C24.9023 44.0107 23.6223 42.4107 22.7689 40.448C22.5983 40.064 22.4276 39.6587 22.2569 39.232C22.1289 38.8053 22.0223 38.4 21.9369 38.016C21.7236 38.4 21.4889 38.7627 21.2329 39.104C21.0196 39.4453 20.7849 39.7867 20.5289 40.128C18.9503 42.3467 17.1796 44.16 15.2169 45.568C13.2969 46.976 11.1423 47.68 8.75294 47.68ZM41.5849 23.104C42.0116 19.9893 42.1183 17.3653 41.9049 15.232C41.6916 13.0987 41.3503 11.392 40.8809 10.112C40.4116 8.78933 39.9423 7.85067 39.4729 7.296C39.0463 6.69867 38.8116 6.4 38.7689 6.4C38.7689 6.4 38.6836 6.42133 38.5129 6.464C38.3849 6.464 38.2356 6.76267 38.0649 7.36C37.9369 7.91467 37.8729 9.06667 37.8729 10.816C37.8729 12.992 38.1929 15.168 38.8329 17.344C39.4729 19.4773 40.3903 21.3973 41.5849 23.104ZM91.5429 48.768C89.5376 48.768 87.9163 48.3627 86.6789 47.552C85.4843 46.784 84.6096 45.76 84.0549 44.48C83.5003 43.1573 83.2016 41.7493 83.1589 40.256C81.3243 42.4747 79.2763 44.224 77.0149 45.504C74.7963 46.7413 72.4709 47.36 70.0389 47.36C68.1189 47.36 66.3056 46.912 64.5989 46.016C62.8923 45.0773 61.5056 43.6907 60.4389 41.856C59.4149 39.9787 58.9029 37.6107 58.9029 34.752C58.9029 31.7653 59.5216 28.8427 60.7589 25.984C62.0389 23.0827 63.7669 20.48 65.9429 18.176C68.1616 15.8293 70.6789 13.9733 73.4949 12.608C76.3536 11.2 79.3403 10.496 82.4549 10.496C84.5029 10.496 86.5296 10.752 88.5349 11.264C90.5403 11.776 92.2896 12.5227 93.7829 13.504C94.6363 14.0587 95.1056 14.72 95.1909 15.488C95.2763 16.256 95.0843 16.9813 94.6149 17.664C94.1883 18.304 93.6123 18.752 92.8869 19.008C92.1616 19.264 91.3936 19.136 90.5829 18.624C89.7723 18.112 88.5563 17.6427 86.9349 17.216C85.3563 16.7467 83.8629 16.512 82.4549 16.512C80.0229 16.512 77.7616 17.0667 75.6709 18.176C73.5803 19.2853 71.7243 20.736 70.1029 22.528C68.5243 24.32 67.2869 26.2827 66.3909 28.416C65.4949 30.5493 65.0469 32.6613 65.0469 34.752C65.0469 35.8187 65.1749 36.864 65.4309 37.888C65.7296 38.8693 66.2416 39.7013 66.9669 40.384C67.6923 41.024 68.7163 41.344 70.0389 41.344C71.3189 41.344 72.7483 40.9173 74.3269 40.064C75.9483 39.168 77.4843 37.76 78.9349 35.84C79.8309 34.6453 80.7696 33.216 81.7509 31.552C82.7323 29.8453 83.6283 28.16 84.4389 26.496C85.2923 24.7893 85.9749 23.3387 86.4869 22.144C86.8283 21.2907 87.3403 20.736 88.0229 20.48C88.7483 20.224 89.4736 20.224 90.1989 20.48C90.9243 20.6933 91.5003 21.0987 91.9269 21.696C92.3536 22.2933 92.4816 23.04 92.3109 23.936L89.4949 37.632C89.1963 39.1253 89.1963 40.2347 89.4949 40.96C89.7936 41.6853 90.1776 42.176 90.6469 42.432C91.1163 42.6453 91.4149 42.752 91.5429 42.752C92.2256 42.752 93.1003 42.432 94.1669 41.792C95.2336 41.1093 96.5563 39.8507 98.1349 38.016C99.4576 36.5227 100.823 34.7733 102.231 32.768C103.682 30.72 105.068 28.6293 106.391 26.496C107.756 24.32 108.972 22.272 110.039 20.352C111.148 18.3893 112.023 16.768 112.663 15.488C113.09 14.592 113.687 14.0587 114.455 13.888C115.223 13.7173 115.948 13.824 116.631 14.208C117.356 14.5493 117.868 15.0827 118.167 15.808C118.508 16.4907 118.466 17.28 118.039 18.176C117.356 19.584 116.439 21.2907 115.287 23.296C114.178 25.3013 112.919 27.4347 111.511 29.696C110.146 31.9147 108.695 34.0907 107.159 36.224C105.666 38.3573 104.194 40.2773 102.743 41.984C101.036 43.9467 99.2869 45.568 97.4949 46.848C95.7456 48.128 93.7616 48.768 91.5429 48.768ZM118.45 48.448C115.549 48.448 113.351 47.6373 111.858 46.016C110.407 44.352 109.533 42.0267 109.234 39.04C108.978 36.0533 109.17 32.5547 109.81 28.544C110.493 24.5333 111.517 20.16 112.882 15.424C113.181 14.4427 113.693 13.8027 114.418 13.504C115.143 13.1627 115.89 13.12 116.658 13.376C117.426 13.632 118.023 14.08 118.45 14.72C118.919 15.36 119.026 16.1493 118.77 17.088C117.191 22.464 116.146 26.8373 115.634 30.208C115.165 33.536 115.037 36.096 115.25 37.888C115.463 39.6373 115.869 40.832 116.466 41.472C117.106 42.112 117.767 42.432 118.45 42.432C119.303 42.432 120.413 41.9413 121.778 40.96C123.143 39.936 124.594 38.5067 126.13 36.672C127.666 34.8373 129.138 32.7253 130.546 30.336C129.778 27.904 129.394 25.152 129.394 22.08C129.394 20.2027 129.501 18.176 129.714 16C129.97 13.7813 130.397 11.6907 130.994 9.728C131.634 7.76533 132.509 6.18667 133.618 4.992C134.77 3.79733 136.242 3.264 138.034 3.392C139.485 3.52 140.573 4.032 141.298 4.928C142.066 5.824 142.535 6.95467 142.706 8.32C142.919 9.68533 142.941 11.1573 142.77 12.736C142.599 14.272 142.343 15.808 142.002 17.344C141.661 18.8373 141.319 20.16 140.978 21.312C139.954 24.8107 138.781 28.032 137.458 30.976C138.61 33.024 140.061 34.432 141.81 35.2C143.559 35.968 145.33 36.2453 147.122 36.032C148.914 35.776 150.45 35.2427 151.73 34.432C152.583 33.8773 153.373 33.728 154.098 33.984C154.823 34.1973 155.399 34.6453 155.826 35.328C156.295 35.968 156.487 36.6933 156.402 37.504C156.317 38.272 155.869 38.912 155.058 39.424C152.967 40.7893 150.642 41.6427 148.082 41.984C145.565 42.3253 143.09 42.0907 140.658 41.28C138.226 40.4693 136.093 39.04 134.258 36.992C132.039 40.576 129.586 43.392 126.898 45.44C124.253 47.4453 121.437 48.448 118.45 48.448ZM135.666 18.112C136.391 15.5947 136.882 13.7173 137.138 12.48C137.394 11.2427 137.522 10.432 137.522 10.048C137.522 9.62133 137.522 9.408 137.522 9.408C137.522 9.408 137.394 9.68533 137.138 10.24C136.882 10.752 136.605 11.648 136.306 12.928C136.007 14.1653 135.794 15.8933 135.666 18.112ZM164.834 48.512C161.762 48.512 159.117 47.808 156.898 46.4C154.68 44.9493 152.973 43.008 151.778 40.576C150.584 38.1013 149.986 35.328 149.986 32.256C149.986 29.2267 150.562 26.3893 151.714 23.744C152.866 21.056 154.36 18.7093 156.194 16.704C158.072 14.656 160.056 13.0773 162.146 11.968C164.28 10.816 166.306 10.24 168.226 10.24C169.762 10.24 171.17 10.5387 172.45 11.136C173.73 11.7333 174.754 12.5867 175.522 13.696C176.333 14.8053 176.738 16.1493 176.738 17.728C176.738 20.0747 176.034 22.1227 174.626 23.872C173.261 25.5787 171.384 27.4773 168.994 29.568C167.202 31.1467 165.325 32.64 163.362 34.048C161.4 35.456 159.352 36.8427 157.218 38.208C158.584 41.0667 161.122 42.496 164.834 42.496C165.858 42.496 166.946 42.3467 168.098 42.048C169.25 41.7067 170.552 41.024 172.002 40C173.453 38.976 175.16 37.376 177.122 35.2C177.762 34.4747 178.466 34.1333 179.234 34.176C180.045 34.2187 180.749 34.5173 181.346 35.072C181.944 35.584 182.285 36.2453 182.37 37.056C182.498 37.824 182.242 38.5707 181.602 39.296C178.445 42.7947 175.458 45.2053 172.642 46.528C169.869 47.8507 167.266 48.512 164.834 48.512ZM156.13 31.744C157.752 30.6773 159.309 29.6107 160.802 28.544C162.296 27.4347 163.704 26.2827 165.026 25.088C167.245 23.1253 168.738 21.504 169.506 20.224C170.317 18.9013 170.722 18.0693 170.722 17.728C170.722 17.5573 170.594 17.28 170.338 16.896C170.082 16.4693 169.378 16.256 168.226 16.256C167.16 16.256 165.944 16.6613 164.578 17.472C163.256 18.24 161.954 19.328 160.674 20.736C159.437 22.144 158.392 23.7867 157.538 25.664C156.685 27.5413 156.216 29.568 156.13 31.744ZM201.487 13.248C204.773 13.248 207.717 13.9733 210.319 15.424C212.922 16.8747 214.949 18.9013 216.399 21.504C217.893 24.1067 218.639 27.1147 218.639 30.528C218.639 33.9413 217.893 36.9707 216.399 39.616C214.949 42.2187 212.922 44.2453 210.319 45.696C207.717 47.1467 204.773 47.872 201.487 47.872C198.97 47.872 196.666 47.3813 194.575 46.4C192.485 45.4187 190.757 43.9893 189.391 42.112V47.488H183.503V0H189.647V18.688C191.013 16.896 192.719 15.552 194.767 14.656C196.815 13.7173 199.055 13.248 201.487 13.248ZM200.975 42.496C203.151 42.496 205.093 42.0053 206.799 41.024C208.549 40 209.914 38.592 210.895 36.8C211.919 34.9653 212.431 32.8747 212.431 30.528C212.431 28.1813 211.919 26.112 210.895 24.32C209.914 22.4853 208.549 21.0773 206.799 20.096C205.093 19.1147 203.151 18.624 200.975 18.624C198.842 18.624 196.901 19.1147 195.151 20.096C193.402 21.0773 192.037 22.4853 191.055 24.32C190.074 26.112 189.583 28.1813 189.583 30.528C189.583 32.8747 190.074 34.9653 191.055 36.8C192.037 38.592 193.402 40 195.151 41.024C196.901 42.0053 198.842 42.496 200.975 42.496ZM256.568 13.568V47.488H250.68V42.112C249.315 43.9893 247.587 45.4187 245.496 46.4C243.406 47.3813 241.102 47.872 238.584 47.872C235.299 47.872 232.355 47.1467 229.752 45.696C227.15 44.2453 225.102 42.2187 223.608 39.616C221.432 33.9413 221.432 30.528 221.432 30.528C221.432 27.1147 222.158 24.1067 223.608 21.504C225.102 18.9013 227.15 16.8747 229.752 15.424C232.355 13.9733 235.299 13.248 238.584 13.248C241.016 13.248 243.256 13.7173 245.304 14.656C247.352 15.552 249.059 16.896 250.424 18.688V13.568H256.568ZM239.096 42.496C241.23 42.496 243.171 42.0053 244.92 41.024C246.67 40 248.035 38.592 249.016 36.8C249.998 34.9653 250.488 32.8747 250.488 30.528C250.488 28.1813 249.998 26.112 249.016 24.32C248.035 22.4853 246.67 21.0773 244.92 20.096C243.171 19.1147 241.23 18.624 239.096 18.624C236.92 18.624 234.958 19.1147 233.208 20.096C231.502 21.0773 230.136 22.4853 229.112 24.32C228.131 26.112 227.64 28.1813 227.64 30.528C227.64 32.8747 228.131 34.9653 229.112 36.8C230.136 38.592 231.502 40 233.208 41.024C234.958 42.0053 236.92 42.496 239.096 42.496Z" fill="white"/>

            <path d="M283.745 13.248C288.055 13.248 291.468 14.5067 293.985 17.024C296.545 19.4987 297.825 23.1467 297.825 27.968V47.488H291.681V28.672C291.681 25.3867 290.892 22.912 289.313 21.248C287.735 19.584 285.473 18.752 282.529 18.752C279.201 18.752 276.577 19.7333 274.657 21.696C272.737 23.616 271.777 26.3893 271.777 30.016V47.488H265.633V13.568H271.521V18.688C272.759 16.9387 274.423 15.5947 276.513 14.656C278.647 13.7173 281.057 13.248 283.745 13.248ZM319.82 31.68L312.78 38.208V47.488H306.636V0H312.78V30.464L331.276 13.568H338.7L324.428 27.584L340.108 47.488H332.556L319.82 31.68Z" fill="white"/>

          </svg>

        </div>



        {/\* Right side: Completely separated action buttons with 0px gap \*/}

        <div className="flex items-center gap-0 pointer-events-auto">

          <button

            type="button"

            className="bg-white text-black font-manrope font-semibold px-5 py-2.5 text-xs sm:text-[13px] tracking-wide rounded-full hover:bg-neutral-100 active:scale-[0.97] transition-all duration-200 flex items-center h-9 sm:h-10 cursor-pointer shadow-sm border border-white/5"

          \>

            Order Card

          </button>

          <button

            type="button"

            className="bg-white text-black p-2.5 rounded-full hover:bg-neutral-100 active:scale-[0.97] transition-all duration-200 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 cursor-pointer shadow-sm border border-white/5"

            aria-label="Menu"

          \>

            <Menu className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-black" strokeWidth={2.5} />

          </button>

        </div>

      </header>







      {/\* 3D perspective camera space */}*

      *<div*

        *className="relative w-full h-full flex items-center justify-center pointer-events-none"*

        *style={{*

          *perspective: '1350px',*

        *}}*

      *>*

        *{/* Dynamic 3D coordinate viewport */}*

        *<div*

          *className="absolute"*

          *style={{*

            *width:* `${metrics.cardW}px`*,*

            *height:* `${metrics.cardH}px`*,*

            *transformStyle: 'preserve-3d',*

          *}}*

        *>*

          *{Array.from({ length: cardCount }).map((\_, i) => (*

            *<div*

              *key={i}*

              *ref={(el) => { cardsRefs.current[i] = el; }}*

              *className="absolute inset-0"*

              *style={{*

                *width:* `${metrics.cardW}px`*,*

                *height:* `${metrics.cardH}px`*,*

                *transformStyle: 'preserve-3d',*

                *backfaceVisibility: 'visible',*

              *}}*

            *>*

              *{/* Build physical 3D volumetric thickness by dense parallel layering \*/}

              {thicknessLayers.map((zOffset, layerIdx) => {

                const isFrontFace = layerIdx === thicknessLayers.length - 1;

                const isBackFace = layerIdx === 0;



                const videoSrc = CARD_VIDEOS[i % CARD_VIDEOS.length];

                const baseBgColor = '#0f0f0f';



                // Middle structural slice

                if (!isFrontFace && !isBackFace) {

                  return (

                    <div

                      key={layerIdx}

                      className="absolute inset-0 rounded-[16px] border border-[#808080] pointer-events-none overflow-hidden"

                      style={{

                        backgroundColor: '#808080',

                        transform: `translateZ(${zOffset}px)`,

                      }}

                    />

                  );

                }



                // Front face slice

                if (isFrontFace) {

                  const frontBorderStyle = "border border-white/15";

                  return (

                    <div

                      key={layerIdx}

                      className={`absolute inset-0 rounded-[16px] ${frontBorderStyle} pointer-events-none overflow-hidden`}

                      style={{

                        backgroundColor: baseBgColor,

                        transform: `translateZ(${zOffset}px)`,

                        backfaceVisibility: 'hidden',

                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',

                      }}

                    \>

                      <video

                        src={videoSrc}

                        autoPlay

                        loop

                        muted

                        playsInline

                        className="absolute inset-0 w-full h-full object-cover rounded-[16px]"

                      />



                      <div className="absolute inset-0 p-5 sm:p-6 text-white h-full w-full font-sans z-10 bg-black/15">

                        {/\* Golden/Silver Metallic Contact Chip - positioned mid-left (vertically centered on the card) with custom user vectors \*/}

                        <div className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2">

                          <svg

                            className="w-6 h-6 sm:w-[29px] sm:h-[29px]"

                            viewBox="0 0 60 60"

                            fill="none"

                            xmlns="http://www.w3.org/2000/svg"

                          \>

                            <path

                              fillRule="evenodd"

                              clipRule="evenodd"

                              d="M20 8H40V14C40.0016 14.5299 40.2128 15.0377 40.5875 15.4125C40.9623 15.7872 41.4701 15.9984 42 16H59V24H42C41.4701 24.0016 40.9623 24.2128 40.5875 24.5875C40.2128 24.9623 40.0016 25.4701 40 26V52H20V8ZM18 8H8.00039C4.47435 8 1.56576 10.6083 1.08 14H18V8ZM1 16V24V26V34V36V44H18V36H1V34H18V26H1V24H18V16H1ZM1.08 46C1.56576 49.3917 4.47435 52 8.00039 52H18V46H1.08ZM42 14V8H52.0004C55.5264 8 58.4342 10.6084 58.92 14H42ZM59 26H42V34H59V26ZM59 36H42V44H59V36ZM52.0004 52H42V46H58.92C58.4342 49.3916 55.5264 52 52.0004 52Z"

                              fill={`url(#paint0_linear_1032_4_${i})`}

                            />

                            <path

                              fillRule="evenodd"

                              clipRule="evenodd"

                              d="M1.02453 14.4146C1.00608 14.609 0.998061 14.8045 1.00039 15C1.00039 14.8028 1.00854 14.6076 1.02453 14.4146ZM1.00039 45C0.998061 45.1955 1.00608 45.391 1.02453 45.5854C1.00854 45.3924 1.00039 45.1972 1.00039 45ZM59.0004 15C59.0026 14.8176 58.9955 14.6353 58.9794 14.4538C58.9933 14.634 59.0004 14.8162 59.0004 15ZM59.0004 45C59.0004 45.1838 58.9933 45.366 58.9794 45.5462C58.9955 45.3647 59.0026 45.1824 59.0004 45Z"

                              fill="#B7B7B7"

                            />

                            <defs>

                              <linearGradient

                                id={`paint0_linear_1032_4_${i}`}

                                x1="30"

                                y1="8"

                                x2="30"

                                y2="52"

                                gradientUnits="userSpaceOnUse"

                              \>

                                <stop stopColor="white" />

                                <stop offset="1" stopColor="#999999" />

                              </linearGradient>

                            </defs>

                          </svg>

                        </div>



                        {/\* JWT Brand Logo - positioned at top-right \*/}

                        <div className="absolute right-5 sm:right-6 top-5 sm:top-6 opacity-95">

                          <svg

                            className="w-[84px] xs:w-[101px] sm:w-[120px] h-auto"

                            viewBox="0 0 341 49"

                            fill="none"

                            xmlns="http://www.w3.org/2000/svg"

                          \>

                            <path

                              d="M8.75294 47.68C6.10761 47.68 4.10227 47.04 2.73694 45.76C1.41427 44.48 0.582275 42.7733 0.240941 40.64C-0.100392 38.464 -0.0790588 36.0747 0.304941 33.472C0.731608 30.8267 1.37161 28.1813 2.22494 25.536C3.07827 22.848 3.99561 20.3307 4.97694 17.984C6.00094 15.5947 6.93961 13.5893 7.79294 11.968C8.26227 11.072 8.88094 10.56 9.64894 10.432C10.4169 10.2613 11.1423 10.368 11.8249 10.752C12.5503 11.136 13.0623 11.6907 13.3609 12.416C13.7023 13.1413 13.6383 13.9307 13.1689 14.784C11.2916 18.368 9.79828 21.7813 8.68894 25.024C7.57961 28.2667 6.85427 31.1467 6.51294 33.664C6.21427 36.1387 6.23561 38.1013 6.57694 39.552C6.96094 40.96 7.68628 41.664 8.75294 41.664C9.73428 41.664 10.8009 41.3013 11.9529 40.576C13.1049 39.8507 14.3423 38.5493 15.6649 36.672C17.0303 34.6667 18.3529 32.064 19.6329 28.864C20.9556 25.6213 22.1289 21.8667 23.1529 17.6C23.4089 16.6187 23.8783 15.9573 24.5609 15.616C25.2863 15.2747 26.0329 15.2107 26.8009 15.424C27.5689 15.6373 28.1876 16.064 28.6569 16.704C29.1263 17.3013 29.2543 18.0693 29.0409 19.008C27.9316 23.616 27.3769 27.5627 27.3769 30.848C27.4196 34.1333 27.7609 36.5227 28.4009 38.016C28.8703 39.0827 29.4249 39.8507 30.0649 40.32C30.7476 40.7893 31.4943 41.024 32.3049 41.024C33.1156 41.024 33.9689 40.7253 34.8649 40.128C35.8036 39.488 36.7209 38.4 37.6169 36.864C38.5556 35.328 39.3876 33.216 40.1129 30.528C37.6809 28.48 35.6756 25.7707 34.0969 22.4C32.5183 19.0293 31.7289 15.168 31.7289 10.816C31.7289 8.93867 31.9423 7.21067 32.3689 5.632C32.7956 4.05333 33.5209 2.79467 34.5449 1.856C35.5689 0.874666 36.9769 0.383999 38.7689 0.383999C40.9449 0.383999 42.7156 1.17333 44.0809 2.752C45.4463 4.288 46.4489 6.37867 47.0889 9.024C47.7289 11.6267 48.0063 14.5493 47.9209 17.792C47.8783 21.0347 47.5369 24.3413 46.8969 27.712C47.5369 28.0107 48.2196 28.2453 48.9449 28.416C49.7129 28.5867 50.4809 28.672 51.2489 28.672C52.9983 28.672 54.7903 28.416 56.6249 27.904C58.5023 27.3493 60.1023 26.6453 61.4249 25.792C62.2783 25.2373 63.0676 25.088 63.7929 25.344C64.5183 25.5573 65.0943 26.0053 65.521 26.688C65.9476 27.328 66.1183 28.0533 66.0329 28.864C65.9903 29.632 65.5636 30.272 64.7529 30.784C62.8756 32.0213 60.7423 33.0027 58.3529 33.728C56.0063 34.4533 53.6383 34.816 51.2489 34.816C49.2863 34.816 47.3449 34.4533 45.4249 33.728C44.1876 37.7387 42.5023 40.96 40.3689 43.392C38.2356 45.824 35.5476 47.04 32.3049 47.04C30.2569 47.04 28.3583 46.4427 26.6089 45.248C24.9023 44.0107 23.6223 42.4107 22.7689 40.448C22.5983 40.064 22.4276 39.6587 22.2569 39.232C22.1289 38.8053 22.0223 38.4 21.9369 38.016C21.7236 38.4 21.4889 38.7627 21.2329 39.104C21.0196 39.4453 20.7849 39.7867 20.5289 40.128C18.9503 42.3467 17.1796 44.16 15.2169 45.568C13.2969 46.976 11.1423 47.68 8.75294 47.68ZM41.5849 23.104C42.0116 19.9893 42.1183 17.3653 41.9049 15.232C41.6916 13.0987 41.3503 11.392 40.8809 10.112C40.4116 8.78933 39.9423 7.85067 39.4729 7.296C39.0463 6.69867 38.8116 6.4 38.7689 6.4C38.7689 6.4 38.6836 6.42133 38.5129 6.464C38.3849 6.464 38.2356 6.76267 38.0649 7.36C37.9369 7.91467 37.8729 9.06667 37.8729 10.816C37.8729 12.992 38.1929 15.168 38.8329 17.344C39.4729 19.4773 40.3903 21.3973 41.5849 23.104Z"

                              fill="white"

                            />

                            <path

                              d="M91.5429 48.768C89.5376 48.768 87.9163 48.3627 86.6789 47.552C85.4843 46.784 84.6096 45.76 84.0549 44.48C83.5003 43.1573 83.2016 41.7493 83.1589 40.256C81.3243 42.4747 79.2763 44.224 77.0149 45.504C74.7963 46.7413 72.4709 47.36 70.0389 47.36C68.1189 47.36 66.3056 46.912 64.5989 46.016C62.8923 45.0773 61.5056 43.6907 60.4389 41.856C59.4149 39.9787 58.9029 37.6107 58.9029 34.752C58.9029 31.7653 59.5216 28.8427 60.7589 25.984C62.0389 23.0827 63.7669 20.48 65.9429 18.176C68.1616 15.8293 70.6789 13.9733 73.4949 12.608C76.3536 11.2 79.3403 10.496 82.4549 10.496C84.5029 10.496 86.5296 10.752 88.5349 11.264C90.5403 11.776 92.2896 12.5227 93.7829 13.504C94.6363 14.0587 95.1056 14.72 95.1909 15.488C95.2763 16.256 95.0843 16.9813 94.6149 17.664C94.1883 18.304 93.6123 18.752 92.8869 19.008C92.1616 19.264 91.3936 19.136 90.5829 18.624C89.7723 18.112 88.5563 17.6427 86.9349 17.216C85.3563 16.7467 83.8629 16.512 82.4549 16.512C80.0229 16.512 77.7616 17.0667 75.6709 18.176C73.5803 19.2853 71.7243 20.736 70.1029 22.528C68.5243 24.32 67.2869 26.2827 66.3909 28.416C65.4949 30.5493 65.0469 32.6613 65.0469 34.752C65.0469 35.8187 65.1749 36.864 65.4309 37.888C65.7296 38.8693 66.2416 39.7013 66.9669 40.384C67.6923 41.024 68.7163 41.344 70.0389 41.344C71.3189 41.344 72.7483 40.9173 74.3269 40.064C75.9483 39.168 77.4843 37.76 78.9349 35.84C79.8309 34.6453 80.7696 33.216 81.7509 31.552C82.7323 29.8453 83.6283 28.16 84.4389 26.496C85.2923 24.7893 85.9749 23.3387 86.4869 22.144C86.8283 21.2907 87.3403 20.736 88.0229 20.48C88.7483 20.224 89.4736 20.224 90.1989 20.48C90.9243 20.6933 91.5003 21.0987 91.9269 21.696C92.3536 22.2933 92.4816 23.04 92.3109 23.936L89.4949 37.632C89.1963 39.1253 89.1963 40.2347 89.4949 40.96C89.7936 41.6853 90.1776 42.176 90.6469 42.432C91.1163 42.6453 91.4149 42.752 91.5429 42.752C92.2256 42.752 93.1003 42.432 94.1669 41.792C95.2336 41.1093 96.5563 39.8507 98.1349 38.016C99.4576 36.5227 100.823 34.7733 102.231 32.768C103.682 30.72 105.068 28.6293 106.391 26.496C107.756 24.32 108.972 22.272 110.039 20.352C111.148 18.3893 112.023 16.768 112.663 15.488C113.09 14.592 113.687 14.0587 114.455 13.888C115.223 13.7173 115.948 13.824 116.631 14.208C117.356 14.5493 117.868 15.0827 118.167 15.808C118.508 16.4907 118.466 17.28 118.039 18.176C117.356 19.584 116.439 21.2907 115.287 23.296C114.178 25.3013 112.919 27.4347 111.511 29.696C110.146 31.9147 108.695 34.0907 107.159 36.224C105.666 38.3573 104.194 40.2773 102.743 41.984C101.036 43.9467 99.2869 45.568 97.4949 46.848C95.7456 48.128 93.7616 48.768 91.5429 48.768Z"

                              fill="white"

                            />

                            <path

                              d="M118.45 48.448C115.549 48.448 113.351 47.6373 111.858 46.016C110.407 44.352 109.533 42.0267 109.234 39.04C108.978 36.0533 109.17 32.5547 109.81 28.544C110.493 24.5333 111.517 20.16 112.882 15.424C113.181 14.4427 113.693 13.8027 114.418 13.504C115.143 13.1627 115.89 13.12 116.658 13.376C117.426 13.632 118.023 14.08 118.45 14.72C118.919 15.36 119.026 16.1493 118.77 17.088C117.191 22.464 116.146 26.8373 115.634 30.208C115.165 33.536 115.037 36.096 115.25 37.888C115.463 39.6373 115.869 40.832 116.466 41.472C117.106 42.112 117.767 42.432 118.45 42.432C119.303 42.432 120.413 41.9413 121.778 40.96C123.143 39.936 124.594 38.5067 126.13 36.672C127.666 34.8373 129.138 32.7253 130.546 30.336C129.778 27.904 129.394 25.152 129.394 22.08C129.394 20.2027 129.501 18.176 129.714 16C129.97 13.7813 130.397 11.6907 130.994 9.728C131.634 7.76533 132.509 6.18667 133.618 4.992C134.77 3.79733 136.242 3.264 138.034 3.392C139.485 3.52 140.573 4.032 141.298 4.928C142.066 5.824 142.535 6.95467 142.706 8.32C142.919 9.68533 142.941 11.1573 142.77 12.736C142.599 14.272 142.343 15.808 142.002 17.344C141.661 18.8373 141.319 20.16 140.978 21.312C139.954 24.8107 138.781 28.032 137.458 30.976C138.61 33.024 140.061 34.432 141.81 35.2C143.559 35.968 145.33 36.2453 147.122 36.032C148.914 35.776 150.45 35.2427 151.73 34.432C152.583 33.8773 153.373 33.728 154.098 33.984C154.823 34.1973 155.399 34.6453 155.826 35.328C156.295 35.968 156.487 36.6933 156.402 37.504C156.317 38.272 155.869 38.912 155.058 39.424C152.967 40.7893 150.642 41.6427 148.082 41.984C145.565 42.3253 143.09 42.0907 140.658 41.28C138.226 40.4693 136.093 39.04 134.258 36.992C132.039 40.576 129.586 43.392 126.898 45.44C124.253 47.4453 121.437 48.448 118.45 48.448ZM135.666 18.112C136.391 15.5947 136.882 13.7173 137.138 12.48C137.394 11.2427 137.522 10.432 137.522 10.048C137.522 9.62133 137.522 9.408 137.522 9.408C137.522 9.408 137.394 9.68533 137.138 10.24C136.882 10.752 136.605 11.648 136.306 12.928C136.007 14.1653 135.794 15.8933 135.666 18.112Z"

                              fill="white"

                            />

                            <path

                              d="M164.834 48.512C161.762 48.512 159.117 47.808 156.898 46.4C154.68 44.9493 152.973 43.008 151.778 40.576C150.584 38.1013 149.986 35.328 149.986 32.256C149.986 29.2267 150.562 26.3893 151.714 23.744C152.866 21.056 154.36 18.7093 156.194 16.704C158.072 14.656 160.056 13.0773 162.146 11.968C164.28 10.816 166.306 10.24 168.226 10.24C169.762 10.24 171.17 10.5387 172.45 11.136C173.73 11.7333 174.754 12.5867 175.522 13.696C176.333 14.8053 176.738 16.1493 176.738 17.728C176.738 20.0747 176.034 22.1227 174.626 23.872C173.261 25.5787 171.384 27.4773 168.994 29.568C167.202 31.1467 165.325 32.64 163.362 34.048C161.4 35.456 159.352 36.8427 157.218 38.208C158.584 41.0667 161.122 42.496 164.834 42.496C165.858 42.496 166.946 42.3467 168.098 42.048C169.25 41.7067 170.552 41.024 172.002 40C173.453 38.976 175.16 37.376 177.122 35.2C177.762 34.4747 178.466 34.1333 179.234 34.176C180.045 34.2187 180.749 34.5173 181.346 35.072C181.944 35.584 182.285 36.2453 182.37 37.056C182.498 37.824 182.242 38.5707 181.602 39.296C178.445 42.7947 175.458 45.2053 172.642 46.528C169.869 47.8507 167.266 48.512 164.834 48.512ZM156.13 31.744C157.752 30.6773 159.309 29.6107 160.802 28.544C162.296 27.4347 163.704 26.2827 165.026 25.088C167.245 23.1253 168.738 21.504 169.506 20.224C170.317 18.9013 170.722 18.0693 170.722 17.728C170.722 17.5573 170.594 17.28 170.338 16.896C170.082 16.4693 169.378 16.256 168.226 16.256C167.16 16.256 165.944 16.6613 164.578 17.472C163.256 18.24 161.954 19.328 160.674 20.736C159.437 22.144 158.392 23.7867 157.538 25.664C156.685 27.5413 156.216 29.568 156.13 31.744Z"

                              fill="white"

                            />

                            <path

                              d="M201.487 13.248C204.773 13.248 207.717 13.9733 210.319 15.424C212.922 16.8747 214.949 18.9013 216.399 21.504C217.893 24.1067 218.639 27.1147 218.639 30.528C218.639 33.9413 217.893 36.9707 216.399 39.616C214.949 42.2187 212.922 44.2453 210.319 45.696C207.717 47.1467 204.773 47.872 201.487 47.872C198.97 47.872 196.666 47.3813 194.575 46.4C192.485 45.4187 190.757 43.9893 189.391 42.112V47.488H183.503V0H189.647V18.688C191.013 16.896 192.719 15.552 194.767 14.656C196.815 13.7173 199.055 13.248 201.487 13.248ZM200.975 42.496C203.151 42.496 205.093 42.0053 206.799 41.024C208.549 40 209.914 38.592 210.895 36.8C211.919 34.9653 212.431 32.8747 212.431 30.528C212.431 28.1813 211.919 26.112 210.895 24.32C209.914 22.4853 208.549 21.0773 206.799 20.096C205.093 19.1147 203.151 18.624 200.975 18.624C198.842 18.624 196.901 19.1147 195.151 20.096C193.402 21.0773 192.037 22.4853 191.055 24.32C190.074 26.112 189.583 28.1813 189.583 30.528C189.583 32.8747 190.074 34.9653 191.055 36.8C192.037 38.592 193.402 40 195.151 41.024C196.901 42.0053 198.842 42.496 200.975 42.496Z"

                              fill="white"

                            />

                            <path

                              d="M256.568 13.568V47.488H250.68V42.112C249.315 43.9893 247.587 45.4187 245.496 46.4C243.406 47.3813 241.102 47.872 238.584 47.872C235.299 47.872 232.355 47.1467 229.752 45.696C227.15 44.2453 225.102 42.2187 223.608 39.616C222.158 36.9707 221.432 33.9413 221.432 30.528C221.432 27.1147 222.158 24.1067 223.608 21.504C225.102 18.9013 227.15 16.8747 229.752 15.424C232.355 13.9733 235.299 13.248 238.584 13.248C241.016 13.248 243.256 13.7173 245.304 14.656C247.352 15.552 249.059 16.896 250.424 18.688V13.568H256.568ZM239.096 42.496C241.23 42.496 243.171 42.0053 244.92 41.024C246.67 40 248.035 38.592 249.016 36.8C249.998 34.9653 250.488 32.8747 250.488 30.528C250.488 28.1813 249.998 26.112 249.016 24.32C248.035 22.4853 246.67 21.0773 244.92 20.096C243.171 19.1147 241.23 18.624 239.096 18.624C236.92 18.624 234.958 19.1147 233.208 20.096C231.502 21.0773 230.136 22.4853 229.112 24.32C228.131 26.112 227.64 28.1813 227.64 30.528C227.64 32.8747 228.131 34.9653 229.112 36.8C230.136 38.592 231.502 40 233.208 41.024C234.958 42.0053 236.92 42.496 239.096 42.496Z"

                              fill="white"

                            />

                            <path

                              d="M283.745 13.248C288.055 13.248 291.468 14.5067 293.985 17.024C296.545 19.4987 297.825 23.1467 297.825 27.968V47.488H291.681V28.672C291.681 25.3867 290.892 22.912 289.313 21.248C287.735 19.584 285.473 18.752 282.529 18.752C279.201 18.752 276.577 19.7333 274.657 21.696C272.737 23.616 271.777 26.3893 271.777 30.016V47.488H265.633V13.568H271.521V18.688C272.759 16.9387 274.423 15.5947 276.513 14.656C278.647 13.7173 281.057 13.248 283.745 13.248Z"

                              fill="white"

                            />

                            <path

                              d="M319.82 31.68L312.78 38.208V47.488H306.636V0H312.78V30.464L331.276 13.568H338.7L324.428 27.584L340.108 47.488H332.556L319.82 31.68Z"

                              fill="white"

                            />

                          </svg>

                        </div>



                        {/\* Double intersecting circle Brand Logo - bottom right corner \*/}

                        <div className="absolute right-5 sm:right-6 bottom-5 sm:bottom-6 flex -space-x-3 items-center opacity-90">

                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 backdrop-blur-[1px] border border-white/10" />

                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/35 backdrop-blur-[1px] border border-white/10" />

                        </div>

                      </div>

                    </div>

                  );

                }



                // Back face slice

                if (isBackFace) {

                  const backBorderStyle = "border border-white/15";

                  const details = CARD_DETAILS[i % CARD_DETAILS.length];

                  return (

                    <div

                      key={layerIdx}

                      className={`absolute inset-0 rounded-[16px] ${backBorderStyle} pointer-events-none overflow-hidden`}

                      style={{

                        backgroundColor: baseBgColor,

                        transform: `translateZ(${zOffset}px) rotateX(180deg)`,

                        backfaceVisibility: 'hidden',

                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',

                      }}

                    \>

                      {/\* Render Video with premium 16px blur on the back face of the card \*/}

                      <div className="absolute inset-0 pointer-events-none" style={{ filter: 'blur(16px)', transform: 'scale(1.15)' }}>

                        <video

                          src={videoSrc}

                          autoPlay

                          loop

                          muted

                          playsInline

                          className="absolute inset-0 w-full h-full object-cover"

                        />

                      </div>



                      {/\* Premium Real Magnetic stripe \*/}

                      <div className="absolute left-0 right-0 top-4 sm:top-5 h-7 sm:h-9 bg-black/85 backdrop-blur-md z-10" />



                      {/\* Card holder info and details on the bottom-left */}*

                      *<div*

                        *className="absolute left-4 sm:left-6 bottom-4 sm:bottom-5 z-20 flex flex-col gap-0.5 sm:gap-1 text-left"*

                        *style={{ fontFamily: '"JetBrains Mono", monospace' }}*

                      *>*

                        *{/* Card Number */}*

                        *<div className="font-mono text-[10px] sm:text-[12px] font-medium tracking-[0.14em] text-white select-none">*

                          *{details.number}*

                        *</div>*

                        *{/* Owner & CVV \*/}

                        <div className="font-mono text-[7px] sm:text-[9px] font-medium text-white/70 tracking-wide flex items-center gap-2 select-none">

                          <span className="uppercase">{details.name}</span>

                          <span className="text-white/40 font-light">•</span>

                          <span>CVV: {details.cvv}</span>

                        </div>

                      </div>

                    </div>

                  );

                }



                return null;

              })}

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}





    const root = ReactDOM.createRoot(document.getElementById('root'));

    root.render(<App />);

  </script>

</body>

</html>
