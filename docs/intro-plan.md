# Crystal Forms — staged implementation

1. **Part 1 (implemented):** exact SVG logo outline, decoded hero images and fonts, a minimum 2.2-second outline/hold timeline plus 0.25-second simple fade exit, page lock, replay on every load/reload, reduced-motion and fail-open handling.
2. **Part 2:** blue glass logo fill, highlight sweep and restrained breathing.
3. **Part 3:** glass-tile exit, shockwave and measured logo-to-C handoff.
4. **Part 4:** RTL hero choreography, line masks and final idle polish.

Only Part 1 is active. The C, stage and orbit keep their final positions. No shatter, C travel, glass fill or new idle motion has been added.

## Timing and debugging

Edit `src/intro/config.ts`. Outline ends at 1.6s, the exit starts at 2.2s and ends at 2.45s after assets are ready. The animation is driven by one GSAP timeline with `outline`, `hold` and `exit` labels, exposed as `window.introTl`.

The loader waits for the current responsive hero images to decode and for `document.fonts.ready`. A 10s preload timeout and 15s bootstrap watchdog fail open instead of leaving the page locked. Reduced motion skips the loader and fades the hero for 0.5s. `?skipintro` skips immediately in development only. No storage-based skip is used.

GSAP 3.15, @gsap/react and DrawSVGPlugin were already installed; no package changes were necessary.
