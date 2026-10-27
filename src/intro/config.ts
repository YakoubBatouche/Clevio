export const INTRO_CONFIG = {
  duration: { stagger: 0.035, exit: 0.25, reducedFade: 0.5, preloadTimeout: 10_000 },
  color: { navy: '#020b24', lime: '#d5ff48' },
  ease: { outline: 'power2.inOut', exit: 'power2.out' },
  desktop: { outline: 2.1, glass: 1.95, shatter: 3.6, hero: 4, exit: 7.35, handoff: 1.55, end: 7.6 },
  mobile: { outline: 1.8, glass: 1.65, shatter: 3, hero: 3.25, exit: 6.05, handoff: 1.25, end: 6.3 },
} as const
