export const INTRO_CONFIG = {
  duration: {
    outline: 1.6,
    stagger: 0.035,
    minimum: 2.2,
    exit: 0.25,
    reducedFade: 0.5,
    preloadTimeout: 10_000,
  },
  color: { navy: '#020b24', lime: '#d5ff48' },
  ease: { outline: 'power2.inOut', exit: 'power2.out' },
} as const
