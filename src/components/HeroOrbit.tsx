import { CRYSTAL_SURFACE_PATH, ORBIT_BACK_PATH, ORBIT_FRONT_PATH } from '../content/crystal-geometry'

/** Shared geometric clip: keeping this SVG rendered supports WebKit's fragment lookup. */
export function HeroCrystalDefinitions() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false"
      style={{ position: 'absolute', pointerEvents: 'none', overflow: 'hidden' }}>
      <defs>
        <clipPath id="hero-crystal-clip" clipPathUnits="objectBoundingBox">
          <path d={CRYSTAL_SURFACE_PATH} />
        </clipPath>
      </defs>
    </svg>
  )
}

/** Smooth registered vectors replace the two raster light strips at every display density. */
export function HeroOrbit({ part }: { part: 'back' | 'front' }) {
  const path = part === 'front' ? ORBIT_FRONT_PATH : ORBIT_BACK_PATH
  const gradient = 'hero-orbit-' + part
  return (
    <svg className="hero__orbit" data-hero-piece={'orbit-' + part}
      viewBox="0 0 7680 4320" preserveAspectRatio="none" aria-hidden="true" focusable="false"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
        <linearGradient id={gradient} x1="700" y1="2800" x2="4350" y2="2300" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d5ff48" />
          <stop offset="0.48" stopColor="#dbff78" />
          <stop offset="0.82" stopColor="#a4d84c" />
          <stop offset="1" stopColor="#d5ff48" />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} stroke="#c7fb4c" strokeWidth="48" opacity="0.055" />
        <path d={path} stroke="#bdf45a" strokeWidth="18" opacity="0.12" />
        <path d={path} stroke={'url(#' + gradient + ')'} strokeWidth="6.5" opacity="0.9" />
        <path d={path} stroke="#efffc1" strokeWidth="1.5" opacity="0.65" />
      </g>
    </svg>
  )
}
