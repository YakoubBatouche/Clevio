import { useEffect } from 'react'
import { gsap } from '../lib/animation'

const revealSelectors = [
  '#services .services-section__header',
  '#services .service-card',
  '#partners .work-showcase__header',
  '#partners .work-showcase__card',
  '#partners .partners__header',
  '#partners .partners__marks',
  '#contact .contact-section__content',
  '#contact .contact-section__art',
  'footer .site-footer__column',
  'footer .site-footer__bottom',
]

type RevealGroup = {
  elements: HTMLElement[]
  owner: HTMLElement | null
  prepared: boolean
  started: boolean
  done: boolean
  tween: gsap.core.Tween | null
}

export function useSectionTransitions() {
  useEffect(() => {
    const groups: RevealGroup[] = revealSelectors.map((selector) => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector))
        .filter((element) => !element.closest('dialog') && element.getClientRects().length > 0)
      return { elements, owner: elements[0]?.closest<HTMLElement>('section, footer') ?? null, prepared: false, started: false, done: false, tween: null }
    }).filter((group) => group.elements.length > 0)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const context = gsap.context(() => {})
    const previousMarkers = new Map<HTMLElement, string | null>()
    for (const group of groups) {
      if (group.owner && !previousMarkers.has(group.owner)) previousMarkers.set(group.owner, group.owner.getAttribute('data-section-revealed'))
    }
    let observer: IntersectionObserver | null = null
    let pointerActive = false

    function markOwner(group: RevealGroup) {
      if (group.owner?.getAttribute('data-section-revealed') !== 'true') group.owner?.setAttribute('data-section-revealed', 'true')
    }
    function finish(group: RevealGroup) {
      if (group.done) return
      group.done = true
      group.tween?.kill()
      group.tween = null
      if (group.prepared) context.add(() => { gsap.set(group.elements, { clearProps: 'opacity,transform' }) })
      observer?.unobserve(group.elements[0])
      markOwner(group)
    }
    function reveal(group: RevealGroup) {
      if (group.done || group.started) return
      if (reduced.matches || document.hidden) { finish(group); return }
      group.started = true
      observer?.unobserve(group.elements[0])
      markOwner(group)
      context.add(() => {
        group.tween = gsap.to(group.elements, {
          opacity: 1, y: 0, duration: 0.78, stagger: 0.07,
          ease: 'power3.out', overwrite: 'auto', force3D: false,
          onComplete: () => finish(group),
        })
      })
    }
    if (typeof IntersectionObserver !== 'undefined') {
      const lookup = new Map<Element, RevealGroup>(groups.map((group) => [group.elements[0], group]))
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const group = lookup.get(entry.target)
          if (entry.isIntersecting && group) reveal(group)
        }
      }, { rootMargin: '0px 0px -' + Math.round(window.innerHeight * 0.08) + 'px 0px', threshold: 0 })
    }

    function hashTarget() {
      try { return document.getElementById(decodeURIComponent(window.location.hash.slice(1))) } catch { return null }
    }
    const initialTarget = hashTarget()
    for (const group of groups) {
      const belowViewport = group.elements.every((element) => element.getBoundingClientRect().top >= window.innerHeight)
      const ownsTarget = Boolean(initialTarget && group.owner?.contains(initialTarget))
      const hasFocus = group.elements.some((element) => element.contains(document.activeElement))
      if (!belowViewport || ownsTarget || hasFocus || reduced.matches || document.hidden || !observer) {
        finish(group)
      } else {
        group.prepared = true
        context.add(() => { gsap.set(group.elements, { opacity: 0, y: 24, force3D: false }) })
        observer.observe(group.elements[0])
      }
    }

    function onPointerDown() { pointerActive = true }
    function onPointerEnd() { pointerActive = false }
    function onFocus(event: FocusEvent) {
      // Keep a link under the pointer stable between pointerdown and click.
      if (pointerActive || !(event.target instanceof Node)) return
      const target = event.target
      for (const group of groups) {
        const focusedHeading = target === group.owner && group.elements.some((element) => element.querySelector('h2'))
        if (focusedHeading || group.elements.some((element) => element.contains(target))) finish(group)
      }
    }
    function onHashChange() {
      const target = hashTarget()
      if (target) for (const group of groups) if (group.owner?.contains(target)) finish(group)
    }
    function onMotionChange() {
      if (reduced.matches) groups.forEach(finish)
    }
    function onVisibilityChange() {
      if (!document.hidden) return
      for (const group of groups) {
        const visible = group.elements.some((element) => {
          const bounds = element.getBoundingClientRect()
          return bounds.bottom > 0 && bounds.top < window.innerHeight
        })
        if (group.started || visible) finish(group)
      }
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('pointerup', onPointerEnd, true)
    document.addEventListener('pointercancel', onPointerEnd, true)
    document.addEventListener('keydown', onPointerEnd, true)
    document.addEventListener('focusin', onFocus, true)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('hashchange', onHashChange)
    reduced.addEventListener('change', onMotionChange)

    return () => {
      observer?.disconnect()
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('pointerup', onPointerEnd, true)
      document.removeEventListener('pointercancel', onPointerEnd, true)
      document.removeEventListener('keydown', onPointerEnd, true)
      document.removeEventListener('focusin', onFocus, true)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('hashchange', onHashChange)
      reduced.removeEventListener('change', onMotionChange)
      for (const group of groups) group.tween?.kill()
      context.revert()
      for (const [owner, previous] of previousMarkers) {
        if (previous === null) owner.removeAttribute('data-section-revealed')
        else owner.setAttribute('data-section-revealed', previous)
      }
    }
  }, [])
}

