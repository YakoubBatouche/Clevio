import { gsap } from '../lib/animation'

/** Pixel-measured 2D logo-to-crystal handoff; no permanent layout changes. */
export function setupCrystalTransition(root: HTMLElement, mobile: boolean) {
  const logo = root.querySelector<SVGSVGElement>('.intro-logo')
  const tileLayer = root.querySelector<HTMLElement>('.intro-preloader__tiles')
  const ring = root.querySelector<HTMLElement>('.intro-preloader__shockwave')
  const flash = root.querySelector<HTMLElement>('.intro-preloader__flash')
  const crystal = document.querySelector<HTMLImageElement>('[data-hero-piece="main-c"]')
  if (!logo || !tileLayer || !ring || !flash || !crystal) throw new Error('Crystal transition assets unavailable')

  const originalStyle = crystal.getAttribute('style')
  const logoBounds = logo.getBoundingClientRect()
  const finalBounds = crystal.getBoundingClientRect()
  const center = { x: logoBounds.left + logoBounds.width / 2, y: logoBounds.top + logoBounds.height / 2 }
  const columns = mobile ? 8 : 12
  const rows = mobile ? 10 : 7
  const tiles: HTMLElement[] = []
  tileLayer.style.setProperty('--intro-columns', String(columns))
  tileLayer.style.setProperty('--intro-rows', String(rows))
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const tile = document.createElement('span')
      tile.className = 'intro-preloader__tile'
      tile.setAttribute('aria-hidden', 'true')
      tile.dataset.column = String(column)
      tile.dataset.row = String(row)
      tileLayer.append(tile)
      tiles.push(tile)
    }
  }

  const flight = crystal.cloneNode(false) as HTMLImageElement
  flight.className = 'intro-handoff-c'
  flight.removeAttribute('data-hero-piece')
  flight.removeAttribute('srcset')
  flight.removeAttribute('sizes')
  flight.src = crystal.currentSrc || crystal.src
  flight.alt = ''
  flight.setAttribute('aria-hidden', 'true')
  flight.style.cssText = `left:${finalBounds.left}px;top:${finalBounds.top}px;width:${finalBounds.width}px;height:${finalBounds.height}px`
  document.body.append(flight)
  const initialScale = Math.min(0.3, logoBounds.height / Math.max(1, finalBounds.height))
  gsap.set(flight, {
    x: center.x - (finalBounds.left + finalBounds.width / 2),
    y: center.y - (finalBounds.top + finalBounds.height / 2),
    scale: initialScale,
    opacity: 0,
    filter: `blur(${mobile ? 2 : 4}px) brightness(1.35)`,
    transformOrigin: '50% 50%',
    force3D: true,
  })
  gsap.set(crystal, { opacity: 0 })
  for (const effect of [ring, flash]) {
    gsap.set(effect, { left: center.x, top: center.y, xPercent: -50, yPercent: -50, opacity: 0 })
  }
  const restoreCrystal = () => {
    if (originalStyle === null) crystal.removeAttribute('style')
    else crystal.setAttribute('style', originalStyle)
  }

  return {
    addTo(timeline: gsap.core.Timeline, start: number, duration: number) {
      const tileDuration = Math.min(0.9, duration * 0.6)
      timeline.set(tileLayer, { visibility: 'visible' }, start)
      timeline.set(root, { background: 'transparent' }, start)
      timeline.to(logo, { opacity: 0, duration: 0.28, ease: 'power2.inOut' }, start)
      timeline.to(tiles, {
        x: (index: number) => ((index % columns) - (columns - 1) / 2) * (mobile ? 7 : 10),
        y: (index: number) => (Math.floor(index / columns) - (rows - 1) / 2) * (mobile ? 7 : 10),
        rotation: (index: number) => ((index * 17) % 37) - 18,
        scale: 0.08,
        opacity: 0,
        duration: tileDuration * 0.64,
        stagger: { grid: [rows, columns], from: 'center', amount: tileDuration * 0.36 },
        ease: 'power3.in',
        force3D: true,
      }, start + 0.04)
      timeline.fromTo(ring, { scale: 0.2, opacity: 0.65 }, {
        scale: mobile ? 4.5 : 6, opacity: 0,
        duration: Math.min(1, duration * 0.7), ease: 'power2.out',
      }, start)
      timeline.fromTo(flash, { scale: 0.65, opacity: 0 }, {
        scale: 1.65, opacity: 0.55, duration: 0.16, ease: 'power2.out',
      }, start)
      timeline.to(flash, { opacity: 0, scale: 2, duration: 0.42, ease: 'power2.out' }, start + 0.16)
      timeline.to(flight, { opacity: 1, duration: 0.28, ease: 'power2.out' }, start + 0.02)
      timeline.to(flight, {
        x: 0, y: 0, scale: 1, filter: 'blur(0px) brightness(1)',
        duration, ease: 'expo.out',
      }, start + 0.12)
      timeline.call(() => {
        restoreCrystal()
        flight.remove()
        tileLayer.style.visibility = 'hidden'
      }, [], start + duration + 0.12)
    },
    cleanup() {
      flight.remove()
      restoreCrystal()
      tileLayer.replaceChildren()
      tileLayer.style.removeProperty('visibility')
      tileLayer.style.removeProperty('--intro-columns')
      tileLayer.style.removeProperty('--intro-rows')
    },
  }
}

