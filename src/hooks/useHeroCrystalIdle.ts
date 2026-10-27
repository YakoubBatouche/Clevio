import { useEffect } from 'react'
import type { RefObject } from 'react'
import { gsap } from '../lib/animation'
import { CRYSTAL_SURFACE_MASK_URL } from '../content/crystal-geometry'

// The C remains completely static. Only a clipped highlight band moves after landing.
export function useHeroCrystalIdle(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = root.current
    const crystal = hero?.querySelector<HTMLImageElement>('[data-hero-piece="main-c"]')
    const scene = crystal?.parentElement
    if (!hero || !crystal || !scene) return
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('skipintro')) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let ready = !document.documentElement.classList.contains('intro-pending')
    const bounds = crystal.getBoundingClientRect()
    let visible = bounds.bottom > 0 && bounds.top < window.innerHeight
    let shine: HTMLDivElement | null = null
    let band: HTMLDivElement | null = null
    let sweep: gsap.core.Timeline | undefined

    function syncShine() {
      if (!shine || !crystal) return
      for (const property of ['left', 'top', 'width', 'height'] as const) shine.style[property] = crystal.style[property]
      // Share the C's exact surface mask, including removal of the baked orbit strip.
      shine.style.maskImage = CRYSTAL_SURFACE_MASK_URL
      shine.style.setProperty('-webkit-mask-image', CRYSTAL_SURFACE_MASK_URL)
    }

    function stop() {
      sweep?.kill()
      sweep = undefined
      shine?.remove()
      shine = null
      band = null
    }

    function start() {
      if (!crystal || !scene || sweep || !ready || reduced.matches) return
      shine = document.createElement('div')
      shine.className = 'hero__crystal-shine'
      shine.setAttribute('aria-hidden', 'true')
      Object.assign(shine.style, {
        position: 'absolute', pointerEvents: 'none', overflow: 'hidden',
        clipPath: 'url(#hero-crystal-clip)',
        maskSize: '100% 100%', maskRepeat: 'no-repeat', maskMode: 'alpha',
      })
      shine.style.setProperty('-webkit-mask-size', '100% 100%')
      shine.style.setProperty('-webkit-mask-repeat', 'no-repeat')
      syncShine()
      band = document.createElement('div')
      Object.assign(band.style, {
        position: 'absolute', left: '-24%', top: '-30%', width: '22%', height: '160%',
        background: 'linear-gradient(90deg, transparent, rgba(183,246,255,0.10), transparent)',
        opacity: '0', pointerEvents: 'none',
      })
      shine.append(band)
      // Preserve the front orbit's paint order above the C and its highlight.
      scene.insertBefore(shine, crystal.nextSibling)
      const highlight = band
      sweep = gsap.timeline({ delay: 6, repeat: -1, repeatDelay: 5.2 })
        .set(highlight, { xPercent: 0, skewX: -20, opacity: 0, willChange: 'transform, opacity' })
        .to(highlight, { opacity: 1, duration: 0.3, ease: 'sine.out' })
        .to(highlight, { xPercent: 660, duration: 1.8, ease: 'sine.inOut', force3D: true }, 0)
        .to(highlight, { opacity: 0, duration: 0.35, ease: 'sine.in' }, 1.45)
        .set(highlight, { clearProps: 'willChange' })
    }

    function updateAvailability() {
      if (reduced.matches) { stop(); return }
      start()
      const paused = !visible || document.hidden
      sweep?.paused(paused)
      if (paused && band) band.style.removeProperty('will-change')
    }
    function onComplete() {
      ready = true
      updateAvailability()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updateAvailability()
    }, { threshold: 0 })
    observer.observe(crystal)
    window.addEventListener('clevio:intro-complete', onComplete)
    document.addEventListener('visibilitychange', updateAvailability)
    reduced.addEventListener('change', updateAvailability)
    updateAvailability()

    return () => {
      observer.disconnect()
      window.removeEventListener('clevio:intro-complete', onComplete)
      document.removeEventListener('visibilitychange', updateAvailability)
      reduced.removeEventListener('change', updateAvailability)
      stop()
    }
  }, [root])
}
