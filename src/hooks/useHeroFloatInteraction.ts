import { useEffect } from 'react'
import type { RefObject } from 'react'
import { gsap } from '../lib/animation'

export function useHeroFloatInteraction(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = root.current
    const artwork = hero?.querySelector<HTMLElement>('.hero__artwork')
    if (!hero || !artwork) return
    const layers = [{ name: 'blue', max: 6 }, { name: 'cube', max: 9 }, { name: 'lime', max: 4 }].flatMap((layer) => {
      const element = hero.querySelector<HTMLElement>('[data-hero-parallax="' + layer.name + '"]')
      return element ? [{ element, max: layer.max }] : []
    })
    if (!layers.length) return
    const elements = layers.map((layer) => layer.element)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const desktop = window.matchMedia('(min-width: 980px)')
    const previousMarker = hero.getAttribute('data-hero-motion')
    const initialBounds = hero.getBoundingClientRect()
    let visible = initialBounds.bottom > 0 && initialBounds.top < window.innerHeight
    let paused = false
    let interacting = false
    let frame = 0
    let point: { x: number; y: number } | null = null

    function cancelFrame() {
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      point = null
    }
    function move(x: number, y: number) {
      for (const layer of layers) {
        gsap.to(layer.element, { x: x * layer.max, y: y * layer.max, duration: 0.8, ease: 'power2.out', overwrite: 'auto', force3D: false })
      }
    }
    function reset(immediate = false) {
      cancelFrame()
      if (immediate) {
        gsap.killTweensOf(elements)
        gsap.set(elements, { x: 0, y: 0, clearProps: 'transform' })
      } else if (interacting) move(0, 0)
      interacting = false
    }
    function updateAvailability() {
      paused = !visible || document.hidden || reduced.matches
      if (paused) {
        hero!.setAttribute('data-hero-motion', 'paused')
        reset(true)
      } else {
        hero!.removeAttribute('data-hero-motion')
        if (!finePointer.matches) reset()
      }
    }
    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || paused || !finePointer.matches) return
      const bounds = artwork!.getBoundingClientRect()
      const right = desktop.matches ? bounds.left + bounds.width * 0.62 : bounds.right
      const overCopy = event.target instanceof Element && Boolean(event.target.closest('.hero__content'))
      if (overCopy || bounds.width <= 0 || bounds.height <= 0 || event.clientX < bounds.left || event.clientX > right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        reset()
        return
      }
      const x = ((event.clientX - bounds.left) / (right - bounds.left)) * 2 - 1
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1
      const magnitude = Math.max(1, Math.hypot(x, y))
      point = { x: x / magnitude, y: y / magnitude }
      interacting = true
      if (!frame) frame = window.requestAnimationFrame(() => {
        frame = 0
        if (point && !paused && finePointer.matches) move(point.x, point.y)
      })
    }
    function onPointerLeave() { reset() }
    function onLayoutChange() { reset(true); updateAvailability() }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updateAvailability()
    }, { threshold: 0 })
    observer.observe(hero)
    hero.addEventListener('pointermove', onPointerMove, { passive: true })
    hero.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', updateAvailability)
    reduced.addEventListener('change', updateAvailability)
    finePointer.addEventListener('change', updateAvailability)
    desktop.addEventListener('change', onLayoutChange)
    updateAvailability()

    return () => {
      observer.disconnect()
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', updateAvailability)
      reduced.removeEventListener('change', updateAvailability)
      finePointer.removeEventListener('change', updateAvailability)
      desktop.removeEventListener('change', onLayoutChange)
      reset(true)
      if (previousMarker === null) hero.removeAttribute('data-hero-motion')
      else hero.setAttribute('data-hero-motion', previousMarker)
    }
  }, [root])
}
