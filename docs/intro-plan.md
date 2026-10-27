# Crystal Forms — four-part intro

1. **Outline:** the exact supplied SVG logo draws in lime at a slightly larger size (190px desktop, 116px mobile), with a longer, calmer opening.
2. **Glass:** a blue gradient fills the mark, a clipped light sweep crosses it, and a restrained scale breath adds anticipation.
3. **Crystal transition:** navy glass tiles open from the center, a thin lime shockwave expands, and a measured copy of only the C surface travels from the logo into its exact final position, using transform and opacity. The separate background glow fades on after the C lands; the lime orbit uses smooth SVG paths.
4. **Hero reveal:** the pedestal, floating pieces, orbit, RTL navigation, masked headline lines, paragraph and actions arrive in overlapping steps. The existing cube/bubble floating motion resumes afterward. The C stays fixed at its exact landing position; only a faint shine band moves, clipped to its vector silhouette and the same precise surface mask as the C so the background and inner cutout stay untouched.

All four parts use the existing 2D assets; no WebGL or 3D rendering is enabled. The final artwork, text, buttons and positions remain the approved design. Arabic is animated as complete lines, preserving joined letters.

## Timing and debugging

Edit `src/intro/config.ts` to adjust the timing. The complete desktop timeline lasts about **7.6 seconds** after assets are ready; mobile lasts about **6.3 seconds**. The slower pacing follows the latest request. The single master GSAP timeline is exposed as `window.introTl`, with `outline`, `glass`, `shatter`, `hero` and `exit` labels.

The loader waits for the current responsive hero images to decode and for `document.fonts.ready`. Safety timeouts reveal the page if loading or the animation fails. During the intro the page is locked, then original scrolling, focus access and styles are restored. Temporary tiles and the handoff copy are removed after completion. Reduced motion skips the loader and uses a short hero fade. `?skipintro` skips immediately in development only. No storage-based skip is used: the animation plays again on each normal open/reload.

GSAP 3.15, @gsap/react and DrawSVGPlugin were already installed. No new dependencies were needed. The existing three headline lines provide masks directly, so Arabic character splitting is unnecessary.

The C flight uses only transform and opacity; there are 48 desktop / 35 mobile transition tiles. The background illumination is a stationary CSS light field, fading on after landing. Orbit strokes and the shared surface mask are resolution-independent SVG. The C has no idle transform; only the masked highlight and existing floating objects move.

For local frame timing, open the development site with `?profileintro` and inspect the CLEVIO_INTRO_PROFILE console entry. This diagnostic is disabled in production. Frame pacing depends on device, refresh rate and browser; the implementation targets smooth composited motion without a universal FPS guarantee.
