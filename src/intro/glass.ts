import { gsap } from '../lib/animation'

// Every tween joins the owner's master timeline, including the restrained breath.
export function addGlassPhase(timeline: gsap.core.Timeline, root: HTMLElement, start: number, duration: number): void {
  const logo = root.querySelector<SVGSVGElement>('.intro-logo')
  const shapes = root.querySelectorAll<SVGGeometryElement>('.intro-logo__shape')
  const sweep = root.querySelector<SVGRectElement>('.intro-logo__sweep')
  if (!logo || !shapes.length || !sweep) return

  gsap.set(shapes, { fillOpacity: 0 })
  gsap.set(sweep, { x: 0, skewX: -20, opacity: 0, transformOrigin: 'center' })

  timeline
    .to(shapes, {
      fillOpacity: 1,
      stroke: '#b7f6ff',
      strokeWidth: 1.15,
      strokeOpacity: 0.72,
      duration: duration * 0.48,
      ease: 'power2.inOut',
    }, start)
    .to(logo, {
      filter: 'drop-shadow(0 0 10px rgba(92, 200, 255, 0.28))',
      duration: duration * 0.5,
      ease: 'sine.inOut',
    }, start)
    .to(sweep, { opacity: 0.85, duration: duration * 0.12, ease: 'sine.out' }, start + duration * 0.14)
    .to(sweep, { x: 620, duration: duration * 0.64, ease: 'power2.inOut' }, start + duration * 0.14)
    .to(sweep, { opacity: 0, duration: duration * 0.16, ease: 'sine.in' }, start + duration * 0.7)
    .to(logo, { scale: 1.035, duration: duration * 0.22, ease: 'sine.inOut', transformOrigin: 'center center' }, start + duration * 0.52)
    .to(logo, { scale: 1, duration: duration * 0.26, ease: 'sine.inOut' }, start + duration * 0.74)
}
