import { useEffect } from 'react'
import { gsap } from '../lib/animation'

type Kind = 'heading' | 'services' | 'work' | 'partners' | 'contact-art' | 'contact-content' | 'footer'
const definitions: { selector: string; kind: Kind }[] = [
  { selector: '#services .services-section__header', kind: 'heading' },
  { selector: '#services .service-card', kind: 'services' },
  { selector: '#partners .work-showcase__header', kind: 'heading' },
  { selector: '#partners .work-showcase__card', kind: 'work' },
  { selector: '#partners .partners__header', kind: 'heading' },
  { selector: '#partners .partners__mark', kind: 'partners' },
  { selector: '#contact .contact-section__art', kind: 'contact-art' },
  { selector: '#contact .contact-section__content', kind: 'contact-content' },
  { selector: 'footer .site-footer__column', kind: 'footer' },
  { selector: 'footer .site-footer__bottom', kind: 'heading' },
]
type Group = {
  elements: HTMLElement[]; owner: HTMLElement; kind: Kind; prepared: boolean
  playing: boolean; finishTimer: number; tween: gsap.core.Tween | null; originals: (string | null)[]
}

/** Crystal panels assemble on each full section re-entry; Arabic stays in joined blocks. */
export function useSectionTransitions() {
  useEffect(() => {
    const groups: Group[] = definitions.flatMap(({ selector, kind }) => {
      // The artwork can become visible after a viewport change.
      const elements = [...document.querySelectorAll<HTMLElement>(selector)].filter((element) =>
        !element.closest('dialog') && (kind === 'contact-art' || element.getClientRects().length > 0))
      const owner = elements[0]?.closest<HTMLElement>('section, footer')
      return owner ? [{ elements, owner, kind, prepared: false, playing: false, finishTimer: 0, tween: null, originals: elements.map((element) => element.getAttribute('style')) }] : []
    })
    const owners = [...new Set(groups.map((group) => group.owner))]
    const markers = new Map(owners.map((owner) => [owner, owner.getAttribute('data-section-revealed')]))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const touch = window.matchMedia('(max-width: 979px), (pointer: coarse)')
    const context = gsap.context(() => {})
    let observer: IntersectionObserver | null = null
    let pointerActive = false
    let entryFrame = 0
    const headerInset = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-offset')) || 0

    function restore(group: Group) {
      window.clearTimeout(group.finishTimer)
      group.finishTimer = 0
      group.tween?.kill()
      group.tween = null
      if (group.prepared) {
        gsap.set(group.elements, { clearProps: 'transform,opacity,clipPath,willChange,transformOrigin' })
        group.elements.forEach((element, index) => {
          const original = group.originals[index]
          if (original === null) element.removeAttribute('style')
          else element.setAttribute('style', original)
        })
      }
      group.prepared = false
      group.playing = false
    }
    function prepare(group: Group) {
      if (reduced.matches || document.hidden || group.elements.some((element) => element.contains(document.activeElement))) return
      restore(group)
      group.prepared = true
      context.add(() => {
        // Keep offscreen groups hidden without reserving compositing layers.
        gsap.set(group.elements, { opacity: 0 })
      })
    }
    function reveal(group: Group) {
      if (!group.prepared || group.playing) return
      const artworkHidden = group.kind === 'contact-art' && group.elements[0].getClientRects().length === 0
      if (reduced.matches || document.hidden || artworkHidden) { restore(group); return }
      group.playing = true
      context.add(() => {
        const common = { opacity: 0, force3D: true, willChange: 'transform, opacity' }
        let duration = 1.05
        let delay = 0
        if (group.kind === 'heading') {
          duration = 0.8
          gsap.set(group.elements, { ...common, y: 24, clipPath: 'inset(0% 0% 100% 0%)' })
        } else if (group.kind === 'services') gsap.set(group.elements, { ...common, y: 38, rotationX: -9, rotationY: (index: number) => index % 3 === 0 ? -5 : 5, scale: 0.96, transformOrigin: '50% 100%' })
        else if (group.kind === 'work') gsap.set(group.elements, { ...common, x: (index: number) => index % 2 ? -24 : 24, y: 22, rotationY: (index: number) => index % 2 ? 8 : -8, rotationZ: (index: number) => index % 2 ? -1 : 1, scale: 0.95 })
        else if (group.kind === 'partners') gsap.set(group.elements, { ...common, y: 15, scale: 0.72, rotation: (index: number) => index % 2 ? 7 : -7 })
        else if (group.kind === 'contact-art') {
          duration = 1.24
          gsap.set(group.elements, {
            ...common, x: -32, y: 52, rotation: -4, rotationX: 10, rotationY: -22,
            scale: 0.86, transformPerspective: 960, transformOrigin: '50% 62%',
          })
        } else if (group.kind === 'contact-content') {
          duration = touch.matches ? 0.68 : 0.88
          delay = touch.matches ? 0.06 : 0.14
          // Keep the translated form inside the mobile panel's existing scroll range.
          gsap.set(group.elements, { ...common, y: touch.matches ? -12 : 26 })
        } else gsap.set(group.elements, { ...common, y: 30, rotationX: -5, scale: 0.98 })
        const stagger = group.kind === 'partners' ? 0.055 : group.kind === 'heading' ? 0 : 0.065
        group.tween = gsap.to(group.elements, {
          opacity: 1, x: 0, y: 0, rotation: 0, rotationX: 0, rotationY: 0, scale: 1,
          ...(group.kind === 'heading' ? { clipPath: 'inset(0% 0% 0% 0%)' } : {}),
          duration, delay,
          stagger,
          ease: group.kind === 'partners' ? 'back.out(1.3)' : 'power3.out',
          overwrite: 'auto', force3D: true, onComplete: () => restore(group),
        })
        // Finish the reveal if throttled frames leave visible content partly hidden.
        const revealTime = (delay + duration + (group.elements.length - 1) * stagger) * 1000
        group.finishTimer = window.setTimeout(() => restore(group), revealTime + 750)
      })
    }
    function readyToReveal(owner: HTMLElement) {
      const bounds = owner.getBoundingClientRect()
      const inset = headerInset()
      const usable = Math.max(1, innerHeight - inset)
      const visible = Math.max(0, Math.min(bounds.bottom, innerHeight) - Math.max(bounds.top, inset))
      // Start revealing incoming content as soon as a touch transition brings it into view.
      if (touch.matches) return visible > 1
      const visibleEnough = visible >= Math.min(usable * 0.45, bounds.height * 0.55)
      // A short footer cannot reach the top landing when the document ends.
      if (owner.matches('footer')) return visibleEnough
      // A narrow glimpse of the following section is never an entry.
      return bounds.top <= inset + usable * 0.25 && visibleEnough
    }
    function checkEntries() {
      entryFrame = 0
      for (const owner of owners) {
        if (readyToReveal(owner) && groups.some((group) => group.owner === owner && group.prepared && !group.playing)) showOwner(owner)
      }
    }
    function scheduleEntries() {
      if (!entryFrame) entryFrame = window.requestAnimationFrame(checkEntries)
    }
    function showOwner(owner: HTMLElement) {
      owner.setAttribute('data-section-revealed', 'true')
      groups.filter((group) => group.owner === owner).forEach(reveal)
    }
    function hashTarget() {
      try { return document.getElementById(decodeURIComponent(location.hash.slice(1))) } catch { return null }
    }
    const target = hashTarget()
    for (const owner of owners) {
      const visible = readyToReveal(owner)
      if (!visible && !owner.contains(target) && !reduced.matches && !document.hidden && typeof IntersectionObserver !== 'undefined') {
        groups.filter((group) => group.owner === owner).forEach(prepare)
        owner.removeAttribute('data-section-revealed')
      } else owner.setAttribute('data-section-revealed', 'true')
    }
    function observeOwners() {
      if (typeof IntersectionObserver === 'undefined') return
      observer?.disconnect()
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const owner = entry.target as HTMLElement
          if (entry.isIntersecting) { if (readyToReveal(owner)) showOwner(owner) }
          else {
            const bounds = owner.getBoundingClientRect()
            // Re-arm only after the entire owner has left: no blinking between internal rows.
            if (bounds.bottom <= headerInset() + 1 || bounds.top >= innerHeight - 1) {
              const active = document.activeElement
              const controlFocused = active instanceof Element && owner.contains(active) && active.matches('a, button, input, textarea, select, [contenteditable]')
              groups.filter((group) => group.owner === owner && (!controlFocused || group.kind === 'contact-art')).forEach(prepare)
              if (!controlFocused && !reduced.matches && !document.hidden) owner.removeAttribute('data-section-revealed')
            }
          }
        }
      }, { rootMargin: '-' + (headerInset() + 1) + 'px 0px -1px 0px', threshold: [0, 0.1, 0.25, 0.45, 0.65, 0.85, 1] })
      owners.forEach((owner) => observer?.observe(owner))
    }
    observeOwners()
    window.addEventListener('resize', observeOwners)
    window.addEventListener('scroll', scheduleEntries, { passive: true })
    function onPointerDown() { pointerActive = true }
    function onPointerEnd() { pointerActive = false }
    function onFocus(event: FocusEvent) {
      if (pointerActive || !(event.target instanceof Node)) return
      const focused = event.target
      for (const group of groups) {
        if (group.elements.some((element) => element.contains(focused)) || (group.kind === 'heading' && group.owner.contains(focused))) restore(group)
      }
    }
    function onHashChange() {
      const element = hashTarget()
      if (element) for (const group of groups) if (group.kind === 'heading' && group.owner.contains(element)) restore(group)
    }
    function onMotionChange() {
      if (reduced.matches) groups.forEach(restore)
      else for (const owner of owners) {
        const bounds = owner.getBoundingClientRect()
        if (bounds.bottom <= headerInset() + 1 || bounds.top >= innerHeight - 1) groups.filter((group) => group.owner === owner).forEach(prepare)
      }
    }
    function onTouchModeChange() { scheduleEntries() }
    function onVisibilityChange() { if (document.hidden) groups.forEach(restore) }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('pointerup', onPointerEnd, true)
    document.addEventListener('pointercancel', onPointerEnd, true)
    document.addEventListener('keydown', onPointerEnd, true)
    document.addEventListener('focusin', onFocus, true)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('hashchange', onHashChange)
    reduced.addEventListener('change', onMotionChange)
    touch.addEventListener('change', onTouchModeChange)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', observeOwners)
      window.removeEventListener('scroll', scheduleEntries)
      window.cancelAnimationFrame(entryFrame)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('pointerup', onPointerEnd, true)
      document.removeEventListener('pointercancel', onPointerEnd, true)
      document.removeEventListener('keydown', onPointerEnd, true)
      document.removeEventListener('focusin', onFocus, true)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('hashchange', onHashChange)
      reduced.removeEventListener('change', onMotionChange)
      touch.removeEventListener('change', onTouchModeChange)
      groups.forEach(restore)
      context.revert()
      markers.forEach((value, owner) => value === null ? owner.removeAttribute('data-section-revealed') : owner.setAttribute('data-section-revealed', value))
    }
  }, [])
}



