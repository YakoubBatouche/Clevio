# Clevio

An Arabic, right-to-left creative agency homepage based on the approved midnight-blue, glass and lime visual direction.

## Run locally

Use Node.js 24.

```sh
npm ci
npm run dev
```

The development command prepares the shared logo assets and starts Vite. The production build is written to `dist/`.

## Page and behavior

- Hero with editable Arabic text, independent actions, and separate background, cube and bubble images.
- Asymmetric selected-work gallery with three illustrated concepts and accessible project-detail dialogs.
- Partner strip with clearly labeled sample marks.
- Project inquiry form with required-field and email/phone validation.
- Responsive footer with working section links and contact actions.

Work and contact navigation moves to the real homepage sections. Services and agency information remain available in dialogs. Interactions use simple hover feedback, a restrained hero entrance, and slow independent drifting on the three floating hero PNGs. A small, eased pointer response runs only over the artwork with a mouse. Decorative motion pauses offscreen or in a hidden tab and respects reduced-motion preferences. No advanced scroll or 3D animation is enabled.

## Inquiry delivery and content

The form prepares a draft for the visitor's email application. It does not submit to an inquiry backend or claim that a message was sent. Configure `VITE_CONTACT_EMAIL` to change the destination; the address from the supplied sketch is the default.

Set `VITE_WHATSAPP_NUMBER` to an approved international number to enable WhatsApp. Otherwise the secondary action uses email. No invented phone or social accounts are shown.

The current project imagery and partner marks are explicitly labeled as illustrative concepts. Replace them with approved client content before a public launch.

## Images and typography

Large Arabic headings use the supplied NaN SuperX Serif Text Arabic Black font at weight 900. Body text and buttons use Cairo.

The hero's 7680×4320 exports are enhanced/upscaled artwork, not native 8K renders. Responsive 2K, 4K and 8K sources are selected for scene size and display density. Floating elements remain independent transparent PNGs. The original artwork is preserved.

The exact bitmap logo from the approved design is displayed through an SVG viewport until a standalone vector logo is supplied. Work thumbnails and the contact sculpture are optimized WebP assets.

## Foundation

React, TypeScript and Vite; GSAP with its React integration; Motion; Lenis; Three.js, React Three Fiber and Drei; Lucide icons. Exact versions are recorded in the package manifest and lockfile. The installed 3D and smooth-scroll tools are available for later work and are not enabled in the current page.

## Checks

```sh
npm run build
npm run lint
npx playwright install
npm run test:e2e
```

Browser checks cover Chromium, Firefox and WebKit, responsive widths, keyboard behavior, section navigation, project dialogs, inquiry validation, reduced motion and automated accessibility. Successful GitHub runs save desktop/tablet/mobile review screenshots on the `visual-review` branch and attach build/review files to the run.
