import { gsap } from '../lib/animation'

/** A decoded, clipped C moves on its own compositor layer; the halo never travels. */
export function setupCrystalTransition(root: HTMLElement, mobile: boolean) {
  const logo = root.querySelector<SVGSVGElement>('.intro-logo')
  const tileLayer = root.querySelector<HTMLElement>('.intro-preloader__tiles')
  const ring = root.querySelector<HTMLElement>('.intro-preloader__shockwave')
  const flash = root.querySelector<HTMLElement>('.intro-preloader__flash')
  const crystal = document.querySelector<HTMLImageElement>('[data-hero-piece="main-c"]')
  const glows = [...document.querySelectorAll<HTMLElement>('[data-hero-glow]')]
  if (!logo || !tileLayer || !ring || !flash || !crystal) throw new Error('Crystal transition assets unavailable')

  const originalStyle = crystal.getAttribute('style')
  const glowStyles = glows.map((element) => ({ element, style: element.getAttribute('style') }))
  const logoBounds = logo.getBoundingClientRect()
  const finalBounds = crystal.getBoundingClientRect()
  const center = { x: logoBounds.left + logoBounds.width / 2, y: logoBounds.top + logoBounds.height / 2 }
  const columns = mobile ? 5 : 8
  const rows = mobile ? 7 : 6
  const tiles: HTMLElement[] = []
  tileLayer.style.setProperty('--intro-columns', String(columns))
  tileLayer.style.setProperty('--intro-rows', String(rows))
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const tile = document.createElement('span')
      tile.className = 'intro-preloader__tile'
      tile.setAttribute('aria-hidden', 'true')
      tileLayer.append(tile)
      tiles.push(tile)
    }
  }

  // The source is already decoded by the preloader. Retain its precise surface mask
  // when the temporary copy is moved outside the hero's clipping container.
  const flight = crystal.cloneNode(false) as HTMLImageElement
  flight.className = 'intro-handoff-c hero__crystal-surface'
  flight.removeAttribute('data-hero-piece')
  flight.removeAttribute('srcset')
  flight.removeAttribute('sizes')
  flight.src = crystal.currentSrc || crystal.src
  flight.alt = ''
  flight.setAttribute('aria-hidden', 'true')
  flight.style.cssText = `left:${finalBounds.left}px;top:${finalBounds.top}px;width:${finalBounds.width}px;height:${finalBounds.height}px`
  const surfaceStyle = window.getComputedStyle(crystal)
  flight.style.clipPath = surfaceStyle.clipPath
  flight.style.maskImage = surfaceStyle.maskImage
  flight.style.maskSize = '100% 100%'
  flight.style.maskRepeat = 'no-repeat'
  flight.style.setProperty('-webkit-mask-image', surfaceStyle.maskImage)
  flight.style.setProperty('-webkit-mask-size', '100% 100%')
  flight.style.setProperty('-webkit-mask-repeat', 'no-repeat')
  document.body.append(flight)
  const initialScale = Math.min(0.3, logoBounds.height / Math.max(1, finalBounds.height))
  gsap.set(flight, {
    x: center.x - (finalBounds.left + finalBounds.width / 2),
    y: center.y - (finalBounds.top + finalBounds.height / 2),
    scale: initialScale,
    opacity: 0,
    transformOrigin: '50% 50%',
    willChange: 'transform, opacity',
    force3D: true,
  })
  gsap.set(crystal, { opacity: 0 })
  gsap.set(glows, { opacity: 0 })
  for (const effect of [ring, flash]) {
    gsap.set(effect, { left: center.x, top: center.y, xPercent: -50, yPercent: -50, opacity: 0 })
  }
  const restoreCrystal = () => {
    if (originalStyle === null) crystal.removeAttribute('style')
    else crystal.setAttribute('style', originalStyle)
  }
  const restoreGlows = () => {
    glowStyles.forEach(({ element, style }) => {
      if (style === null) element.removeAttribute('style')
      else element.setAttribute('style', style)
    })
  }

  return {
    addTo(timeline: gsap.core.Timeline, start: number, duration: number) {
      const tileDuration = Math.min(0.9, duration * 0.6)
      const landing = start + duration + 0.12
      timeline.set(tileLayer, { visibility: 'visible' }, start)
      timeline.set(root, { background: 'transparent' }, start)
      timeline.to(logo, { opacity: 0, duration: 0.34, ease: 'power1.inOut' }, start)
      timeline.to(tiles, {
        x: (index: number) => ((index % columns) - (columns - 1) / 2) * (mobile ? 6 : 9),
        y: (index: number) => (Math.floor(index / columns) - (rows - 1) / 2) * (mobile ? 6 : 9),
        rotation: (index: number) => ((index * 17) % 29) - 14,
        scale: 0.08,
        opacity: 0,
        duration: tileDuration * 0.64,
        stagger: { grid: [rows, columns], from: 'center', amount: tileDuration * 0.36 },
        ease: 'power2.in',
        force3D: true,
      }, start + 0.04)
      timeline.fromTo(ring, { scale: 0.2, opacity: 0.5 }, {
        scale: mobile ? 4.5 : 6, opacity: 0,
        duration: Math.min(1, duration * 0.7), ease: 'power2.out',
      }, start)
      timeline.fromTo(flash, { scale: 0.65, opacity: 0 }, {
        scale: 1.4, opacity: 0.3, duration: 0.2, ease: 'power2.out',
      }, start)
      timeline.to(flash, { opacity: 0, scale: 1.8, duration: 0.42, ease: 'power2.out' }, start + 0.2)
      timeline.to(flight, { opacity: 1, duration: 0.34, ease: 'power1.inOut' }, start + 0.02)
      // No blur or brightness filter is animated over the large PNG. Its texture
      // stays unchanged throughout this measured transform-only journey.
      timeline.to(flight, {
        x: 0, y: 0, scale: 1,
        duration, ease: 'power2.inOut', force3D: true,
      }, start + 0.12)
      timeline.call(() => {
        restoreCrystal()
        flight.remove()
        tileLayer.style.visibility = 'hidden'
      }, [], landing)
      // The stationary background light switches on only after the C is seated.
      timeline.to(glows, { opacity: 1, duration: 0.9, ease: 'sine.inOut' }, landing)
    },
    cleanup() {
      flight.remove()
      restoreCrystal()
      restoreGlows()
      tileLayer.replaceChildren()
      tileLayer.style.removeProperty('visibility')
      tileLayer.style.removeProperty('--intro-columns')
      tileLayer.style.removeProperty('--intro-rows')
    },
  }
}
