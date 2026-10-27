import { gsap } from '../lib/animation'

/** The three Arabic lines remain intact inside their own generous clipping masks. */
export function setupHeroReveal(mobile: boolean) {
  const select = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)]
  const background = select('.hero__background')
  const stage = select('[data-hero-piece="stage"]')
  const orbits = select('[data-hero-piece^="orbit-"]')
  const floats = select('.hero__float-intro')
  const brand = select('.site-header > .brand, .site-header > .menu-toggle')
  const links = select('.desktop-nav > a, .desktop-nav > button')
  const lines = select('.hero__line')
  const description = select('.hero__description')
  const primary = select('.hero__actions .action--primary')
  const secondary = select('.hero__actions .action--secondary')
  const underlines = select('.desktop-nav .is-active, .hero__actions .action--secondary')
  const heading = select('.hero__heading')
  const elements = [...background, ...stage, ...orbits, ...floats, ...brand, ...links, ...lines, ...description, ...primary, ...secondary, ...underlines, ...heading]
  const original = new Map(elements.map((element) => [element, element.getAttribute('style')]))

  gsap.set(background, { scale: 1.08, filter: 'brightness(0.38)', transformOrigin: '50% 100%', willChange: 'transform, opacity' })
  gsap.set(stage, { y: mobile ? 40 : 65, opacity: 0, willChange: 'transform, opacity' })
  gsap.set(orbits, { scale: 0.94, rotation: -5, opacity: 0, transformOrigin: 'center', willChange: 'transform, opacity' })
  gsap.set(floats, {
    y: (index: number) => (index === 2 ? 22 : -26), scale: 0.88,
    rotation: (index: number) => index === 1 ? -6 : 0, opacity: 0,
    transformOrigin: 'center', willChange: 'transform, opacity',
  })
  gsap.set([...brand, ...links], { y: -18, opacity: 0, willChange: 'transform, opacity' })
  gsap.set(lines, { yPercent: 112, willChange: 'transform' })
  gsap.set(description, { y: 20, opacity: 0, willChange: 'transform, opacity' })
  gsap.set(primary, { scale: 0.88, y: 10, opacity: 0, willChange: 'transform, opacity' })
  gsap.set(secondary, { y: 12, opacity: 0, willChange: 'transform, opacity' })
  gsap.set(underlines, { '--intro-underline': 0 })

  return {
    addTo(timeline: gsap.core.Timeline, start: number, backgroundStart: number) {
      const pace = mobile ? 0.82 : 1
      const at = (offset: number) => start + offset * pace
      timeline.to(background, { scale: 1, filter: 'brightness(1)', duration: 1.8 * pace, ease: 'expo.out' }, backgroundStart)
      timeline.to(stage, { y: 0, opacity: 1, duration: 1.15 * pace, ease: 'power3.out' }, start)
      timeline.to(orbits, { scale: 1, rotation: 0, opacity: 1, duration: 1.1 * pace, ease: 'power3.out' }, at(0.28))
      timeline.to(floats, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1.08 * pace, stagger: 0.14 * pace, ease: 'back.out(1.25)' }, at(0.35))
      timeline.to(brand, { y: 0, opacity: 1, duration: 0.8 * pace, ease: 'power3.out' }, at(0.5))
      // Navigation's DOM order already starts at the rightmost Arabic item.
      timeline.to(links, { y: 0, opacity: 1, duration: 0.7 * pace, stagger: 0.08 * pace, ease: 'power3.out' }, at(0.6))
      timeline.to(lines, { yPercent: 0, duration: 1.03 * pace, stagger: 0.15 * pace, ease: 'power4.out' }, at(0.95))
      timeline.to(underlines.filter((element) => !element.classList.contains('action')), { '--intro-underline': 1, duration: 0.7 * pace, ease: 'power2.inOut' }, at(1.0))
      timeline.to(description, { y: 0, opacity: 1, duration: 0.8 * pace, ease: 'power2.out' }, at(1.92))
      timeline.to(primary, { scale: 1, y: 0, opacity: 1, duration: 0.85 * pace, ease: 'back.out(1.35)' }, at(2.4))
      timeline.to(secondary, { y: 0, opacity: 1, duration: 0.75 * pace, ease: 'power2.out' }, at(2.57))
      timeline.to(secondary, { '--intro-underline': 1, duration: 0.7 * pace, ease: 'power2.inOut' }, at(2.57))
    },
    cleanup() {
      original.forEach((style, element) => {
        if (style === null) element.removeAttribute('style')
        else element.setAttribute('style', style)
      })
    },
  }
}
