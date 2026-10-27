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

Work and contact navigation moves to the real homepage sections. Services and agency information remain available in dialogs. Interactions use simple hover feedback, a restrained hero entrance, and slow independent drifting on the three floating hero PNGs. A small, eased pointer response runs only over the artwork with a mouse. Decorative motion pauses offscreen or in a hidden tab and respects reduced-motion preferences. Section navigation uses a native smooth glide, with restrained one-time content reveals and a faint gradient at section boundaries. Scrolling remains native, and keyboard focus, direct links and reduced-motion preferences are preserved. No scroll hijacking or 3D animation is enabled.

## Inquiry delivery and content

The form prepares a draft for the visitor's email application. It does not submit to an inquiry backend or claim that a message was sent. Configure `VITE_CONTACT_EMAIL` to change the destination; the address from the supplied sketch is the default.

Set `VITE_WHATSAPP_NUMBER` to an approved international number to enable WhatsApp. Otherwise the secondary action uses email. No invented phone or social accounts are shown.

The current project imagery and partner marks are explicitly labeled as illustrative concepts. Replace them with approved client content before a public launch.

## Images and typography

Large Arabic headings use the supplied NaN SuperX Sans Text Arabic Black font at weight 900. Body text uses RH ZAK Regular (400), and controls and supporting headings use RH ZAK Bold (700). The supplied Thin face (100) is registered for suitable large decorative text; small functional text keeps regular or bold weight for readability.

The hero's 7680×4320 exports are enhanced/upscaled artwork, not native 8K renders. Responsive 2K, 4K and 8K sources are selected for scene size and display density. Floating elements remain independent transparent PNGs. The original artwork is preserved.

Navigation uses the supplied standalone SVG logo. The footer retains the original approved bitmap mark. Work thumbnails and the contact sculpture are optimized WebP assets.

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

## Separated hero scene

The main glass C and pedestal use independent PNG layers. The lime orbit uses smooth front/back SVG paths with the original perspective and overlap. A precise C silhouette clips the surface and its shine; a separate static lighting layer fades on after landing. All are registered to the original 7680×4320 master. Visible opaque surface pixels are retained; only the newly exposed background is inpainted. Soft lighting mattes reproduce the source within one RGB level (mean difference below 0.05/255).

The site uses tightly cropped 2K/4K/8K PNG exports and a lossless background, positioned inside a shared cover frame. This preserves both desktop and mobile object placement while avoiding full-canvas PNG decode overhead. The intro animates these registered layers into place, then restores their original positions and styles. Existing floating cube/bubble motion resumes after the intro. Full-canvas masters and the reconstruction report are saved with the chat outputs.

## Crystal Forms intro

The complete four-part intro runs on every normal open/reload: a larger lime outline logo, blue glass fill and light sweep, a center-out tile transition with a measured logo-to-C handoff, then a staggered reveal of the hero. The desktop sequence lasts about 7.6s; mobile uses about 6.3s. Arabic is animated in complete lines. The existing final design is preserved. After landing, the C stays static while a restrained shine passes only across its clipped surface; the separate cube and bubbles retain their gentle floating motion.

Images and fonts are decoded before playback. The page is locked during the sequence, with safety fallbacks that always restore access. Reduced motion skips the loader; development supports `?skipintro`. Timing lives in `src/intro/config.ts`, and `window.introTl` exposes the master timeline. No new dependencies or 3D rendering were added. See `docs/intro-plan.md` for the four parts, timing and fallbacks.
