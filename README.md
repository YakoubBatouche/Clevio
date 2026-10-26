# Clevio

The first implementation of Clevio's approved Arabic hero. All text, navigation, calls to action and icons are independent accessible React elements. Only the scene is a background image.

## Run

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

`npm run build` type-checks and creates the production build in `dist/`.
`npm run lint` checks the source.
`npm run test:e2e` runs Chromium, Firefox and WebKit checks after installing their browsers with `npx playwright install`.

Assets are optimized automatically before development and production builds. Arabic fonts are installed and hosted with the site; Google Fonts and runtime font CDNs are not required.

## Installed foundation

- React 19, TypeScript and Vite.
- GSAP and its React integration for timelines; ScrollTrigger is available on demand.
- Motion for UI interaction and layout animations.
- Lenis for future scroll choreography, with an optional cleaned-up integration in `src/lib/animation.ts`.
- Three.js, React Three Fiber and Drei for future 3D scenes. These are installed but not imported into this image-based hero.
- Lucide SVG icons.
- ESLint, Playwright and axe for code, browser and accessibility checks.

Exact installed versions are recorded in package.json and package-lock.json. Use `npm ci` to reproduce them.

## Structure

- `src/components/Hero.tsx`: editable three-line Arabic headline, description, independent actions and scene image.
- `src/components/Header.tsx`: desktop navigation and keyboard-accessible mobile menu.
- `src/components/Brand.tsx`: exact approved bitmap logo displayed through an SVG viewport. Replace this with the original standalone vector logo when available.
- `src/components/ContentDialog.tsx`: useful service, work-category and agency panels reached from the hero; no invented client projects.
- `src/components/ContactForm.tsx`: prepares a draft for the visitor's email app. It does not send to a backend or claim delivery.
- `src/styles/`: shared colors, typography, responsive layout and dialog styling.
- `design/`: approved source image and the separate text-free scene.
- `scripts/prepare-assets.mjs`: lossless reference conversion and compressed scene formats.
- `tests/hero.spec.ts`: real browser interactions, overflow, keyboard behavior, reduced motion and accessibility checks.

The contact address comes from the supplied sketch. Set `VITE_CONTACT_EMAIL` in an environment file to change it. No secrets are needed.

## Scope and visual review

This pass implements the hero only. The other homepage sections will be added next using the agreed design direction. Its navigation actions currently open useful panels rather than empty destination pages. All panels are separate from the hero composition.

The approved image supplies layout, colors and artwork. The original font files were not supplied, so the editable heading uses the closest installed Arabic display family and will be compared visually. A raster reference cannot establish a literal pixel-identical font match.

GitHub Actions installs the locked dependencies, builds the project, and checks Chromium, Firefox and WebKit. Successful runs place desktop, tablet and mobile screenshots on the `visual-review` branch and save a build/review ZIP as a workflow artifact. This does not publish a public live website.
