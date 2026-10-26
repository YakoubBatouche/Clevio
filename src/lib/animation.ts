import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export { gsap, useGSAP }

// Import this on demand when the rest of the page needs scroll choreography.
// Neither the WebGL stack nor smooth scrolling is loaded by the static hero.
export async function createScrollExperience() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const [{ default: Lenis }, { ScrollTrigger }] = await Promise.all([
    import('lenis'), import('gsap/ScrollTrigger'),
  ])
  gsap.registerPlugin(ScrollTrigger)
  const lenis = new Lenis({ anchors: true })
  const tick = (time: number) => lenis.raf(time * 1000)
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  return () => {
    gsap.ticker.remove(tick)
    lenis.off('scroll', ScrollTrigger.update)
    lenis.destroy()
  }
}
