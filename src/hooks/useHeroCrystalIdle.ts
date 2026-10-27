import { useEffect } from 'react'
import type { RefObject } from 'react'
import { gsap } from '../lib/animation'

// Idle life starts after the intro has landed; it never owns the PNG's layout.
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
    let float: gsap.core.Tween | undefined
    let sweep: gsap.core.Timeline | undefined
    let originalTransform = ''
    let originalPriority = ''

    function syncShine() {
      if (!shine || !crystal) return
      for (const property of ['left', 'top', 'width', 'height'] as const) shine.style[property] = crystal.style[property]
      const source = JSON.stringify(crystal.currentSrc || crystal.src)
      shine.style.maskImage = 'url(' + source + ')'
      shine.style.setProperty('-webkit-mask-image', 'url(' + source + ')')
    }

    function stop() {
      if (!float) return
      float.kill()
      sweep?.kill()
      float = undefined
      sweep = undefined
      if (originalTransform) crystal!.style.setProperty('transform', originalTransform, originalPriority)
      else crystal!.style.removeProperty('transform')
      // GSAP keeps a transform cache; force its next owner to read the restored style.
      gsap.set(crystal!, { clearProps: 'transform' })
      if (originalTransform) crystal!.style.setProperty('transform', originalTransform, originalPriority)
      shine?.remove()
      shine = null
    }

    function start() {
      if (!crystal || !scene || float || !ready || reduced.matches) return
      originalTransform = crystal.style.getPropertyValue('transform')
      originalPriority = crystal.style.getPropertyPriority('transform')
      shine = document.createElement('div')
      shine.className = 'hero__crystal-shine'
      shine.setAttribute('aria-hidden', 'true')
      Object.assign(shine.style, {
        position: 'absolute', pointerEvents: 'none', overflow: 'hidden',
        maskSize: '100% 100%', maskRepeat: 'no-repeat', maskMode: 'alpha',
      })
      shine.style.setProperty('-webkit-mask-size', '100% 100%')
      shine.style.setProperty('-webkit-mask-repeat', 'no-repeat')
      syncShine()
      const band = document.createElement('div')
      Object.assign(band.style, {
        position: 'absolute', left: '-24%', top: '-30%', width: '22%', height: '160%',
        background: 'linear-gradient(90deg, transparent, rgba(183,246,255,0.15), transparent)',
        opacity: '0', pointerEvents: 'none',
      })
      shine.append(band)
      // Preserve the front orbit's paint order above the C and its highlight.
      scene.insertBefore(shine, crystal.nextSibling)
      float = gsap.to([crystal, shine], {
        y: -5, duration: 5, delay: 2, repeat: -1, yoyo: true,
        ease: 'sine.inOut', force3D: false,
      })
      sweep = gsap.timeline({ delay: 6, repeat: -1, repeatDelay: 4.4 })
        .set(band, { xPercent: 0, skewX: -20, opacity: 0 })
        .to(band, { opacity: 1, duration: 0.25, ease: 'sine.out' })
        .to(band, { xPercent: 660, duration: 1.6, ease: 'sine.inOut', force3D: false }, 0)
        .to(band, { opacity: 0, duration: 0.3, ease: 'sine.in' }, 1.3)
    }

    function updateAvailability() {
      if (reduced.matches) { stop(); return }
      start()
      const paused = !visible || document.hidden
      float?.paused(paused)
      sweep?.paused(paused)
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
    crystal.addEventListener('load', syncShine)
    updateAvailability()

    return () => {
      observer.disconnect()
      window.removeEventListener('clevio:intro-complete', onComplete)
      document.removeEventListener('visibilitychange', updateAvailability)
      reduced.removeEventListener('change', updateAvailability)
      crystal.removeEventListener('load', syncShine)
      stop()
    }
  }, [root])
}

