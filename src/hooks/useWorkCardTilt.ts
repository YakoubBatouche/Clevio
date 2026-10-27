import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Independent CSS rotation keeps pointer tilt separate from section entrance transforms. */
export function useWorkCardTilt(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element) return
    const available = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    let active: HTMLElement | null = null
    let frame = 0
    let point = { x: 0, y: 0 }
    function reset() {
      cancelAnimationFrame(frame)
      frame = 0
      if (active) {
        active.style.setProperty('--work-tilt-angle', '0deg')
        active.removeAttribute('data-work-tilt')
      }
      active = null
    }
    function update() {
      frame = 0
      if (!active) return
      const box = active.getBoundingClientRect()
      const x = Math.max(-1, Math.min(1, (point.x - box.left) / box.width * 2 - 1))
      const y = Math.max(-1, Math.min(1, (point.y - box.top) / box.height * 2 - 1))
      // The pointer presses its corner away; the opposite corner lifts like a sheet of glass.
      active.style.setProperty('--work-tilt-axis-x', String(-y))
      active.style.setProperty('--work-tilt-axis-y', String(x || 0.001))
      active.style.setProperty('--work-tilt-angle', Math.min(4, Math.hypot(x, y) * 3.2) + 'deg')
    }
    function move(event: PointerEvent) {
      if (!available.matches || event.pointerType === 'touch' || !(event.target instanceof Element)) { reset(); return }
      const card = event.target.closest<HTMLElement>('.work-showcase__card')
      if (!card || !element!.contains(card)) { reset(); return }
      if (active !== card) { reset(); active = card; active.setAttribute('data-work-tilt', '') }
      point = { x: event.clientX, y: event.clientY }
      if (!frame) frame = requestAnimationFrame(update)
    }
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerleave', reset)
    window.addEventListener('scroll', reset, { passive: true })
    available.addEventListener('change', reset)
    return () => {
      reset()
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerleave', reset)
      window.removeEventListener('scroll', reset)
      available.removeEventListener('change', reset)
    }
  }, [root])
}
