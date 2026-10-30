import { useEffect } from 'react'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { gsap } from '../lib/animation'
import { sectionScrollTop } from './useSectionNavigation'

gsap.registerPlugin(ScrollToPlugin)

/** One deliberate gesture advances one section; tall sections keep native reading space. */
export function useSectionPaging() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = window.matchMedia('(min-width: 980px) and (hover: hover) and (pointer: fine)')
    const touch = window.matchMedia('(max-width: 979px), (pointer: coarse)')
    const html = document.documentElement
    html.classList.add('section-paging-ready')
    let tween: gsap.core.Tween | null = null
    let lastWheel = 0
    let accumulated = 0
    let previousDirection = 0
    let consumed = false
    let gesture: {
      identifier: number; x: number; y: number; scrollY: number; target: EventTarget | null
      state: 'pending' | 'native' | 'paging'; destination: number | null
    } | null = null

    const cancel = () => {
      tween?.kill()
      tween = null
      consumed = false
      accumulated = 0
      gesture = null
      html.classList.remove('section-paging-moving')
    }
    const pagingAvailable = () => !reduced.matches &&
      !html.classList.contains('intro-pending') && document.body.style.overflow !== 'hidden' && !document.querySelector('dialog[open]')
    const canPage = () => desktop.matches && pagingAvailable()
    const canTouchPage = () => touch.matches && pagingAvailable()
    function hasNativeScroll(target: EventTarget | null, direction: number) {
      if (!(target instanceof Element)) return false
      if (target.closest('input, textarea, select, [contenteditable="true"], [data-native-scroll]')) return true
      for (let element: Element | null = target; element && element !== document.body; element = element.parentElement) {
        if (!(element instanceof HTMLElement)) continue
        const overflow = getComputedStyle(element).overflowY
        if (!/auto|scroll/.test(overflow) || element.scrollHeight <= element.clientHeight + 2) continue
        if (direction > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 2 : element.scrollTop > 2) return true
      }
      return false
    }
    function sections() {
      return [...document.querySelectorAll<HTMLElement>('#home, #services, #partners, #contact, .site-footer')]
        .map((element) => {
          const selector = element.id === 'contact' ? '.contact-section__content, .contact-section__art'
            : element.id === 'services' ? '.services-section__grid'
              : element.id === 'partners' ? '.partners__group'
                : element.id === 'home' ? '.hero__content, .hero__artwork' : '.site-footer__inner'
          const content = [...element.querySelectorAll<HTMLElement>(selector)].filter((item) => item.getClientRects().length)
          return {
            top: sectionScrollTop(element),
            bottom: element.getBoundingClientRect().bottom + window.scrollY,
            contentBottom: Math.max(...content.map((item) => item.getBoundingClientRect().bottom + window.scrollY), 0),
          }
        })
    }
    function moveTo(y: number, duration = 0.95) {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const target = Math.max(0, Math.min(max, y))
      if (Math.abs(target - window.scrollY) < 3) return
      consumed = true
      html.classList.add('section-paging-moving')
      tween = gsap.to(window, {
        scrollTo: { y: target, autoKill: false }, duration, ease: 'power3.inOut',
        onComplete: () => { tween = null; html.classList.remove('section-paging-moving') },
      })
    }
    function onWheel(event: WheelEvent) {
      if (!canPage() || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      const direction = Math.sign(event.deltaY)
      if (!direction || hasNativeScroll(event.target, direction)) return
      const now = performance.now()
      const idle = now - lastWheel > 180
      lastWheel = now
      if (tween || (consumed && !idle)) { event.preventDefault(); return }
      if (idle || direction !== previousDirection) { accumulated = 0; consumed = false }
      previousDirection = direction
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1)
      const landings = sections()
      if (!landings.length) return
      const y = window.scrollY
      let index = 0
      landings.forEach((section, candidate) => { if (section.top <= y + 8) index = candidate })
      const current = landings[index]
      const readingEnd = Math.max(current.top, current.bottom - window.innerHeight)
      // A tall service grid or form can be read normally until its visible content ends.
      const tailAllowance = Math.max(64, window.innerHeight * 0.08)
      // Small decorative floor/padding tails must not consume an extra wheel gesture.
      const decorativeTail = readingEnd - y <= tailAllowance && current.contentBottom <= y + window.innerHeight + 2
      if (direction > 0 && y < readingEnd - 4 && !decorativeTail) {
        if (delta < readingEnd - y - 4) { accumulated = 0; return }
        event.preventDefault()
        moveTo(readingEnd)
        return
      }
      if (direction < 0 && y > current.top + 8) { accumulated = 0; return }
      const next = landings[index + direction]
      if (!next) return
      event.preventDefault()
      accumulated += Math.abs(delta)
      if (accumulated < 32) return
      accumulated = 0
      moveTo(next.top)
    }
    function onTouchStart(event: TouchEvent) {
      // A fresh touch interrupts a previous settle, and a second finger releases paging.
      cancel()
      if (!canTouchPage() || event.touches.length !== 1 || event.defaultPrevented) return
      const point = event.touches[0]
      gesture = {
        identifier: point.identifier, x: point.clientX, y: point.clientY,
        scrollY: window.scrollY, target: event.target, state: 'pending', destination: null,
      }
    }
    function onTouchMove(event: TouchEvent) {
      if (!gesture) return
      if (!canTouchPage() || event.touches.length !== 1) { cancel(); return }
      if (gesture.state === 'native') return
      const point = [...event.touches].find((item) => item.identifier === gesture?.identifier)
      if (!point) { cancel(); return }
      const horizontal = Math.abs(point.clientX - gesture.x)
      const vertical = gesture.y - point.clientY
      if (gesture.state === 'pending') {
        // Leave horizontal drags, pinching, form controls and nested scrollers alone.
        if (event.defaultPrevented || (horizontal >= 10 && horizontal > Math.abs(vertical) * 1.15)) {
          gesture.state = 'native'
          return
        }
        if (Math.abs(vertical) < 18 || Math.abs(vertical) < horizontal * 1.35) return
        const direction = Math.sign(vertical)
        const landings = sections()
        let index = 0
        landings.forEach((section, candidate) => { if (section.top <= gesture!.scrollY + 8) index = candidate })
        const current = landings[index]
        const next = landings[index + direction]
        if (!current || !next || hasNativeScroll(gesture.target, direction)) { gesture.state = 'native'; return }
        const y = gesture.scrollY
        const readingEnd = Math.max(current.top, current.bottom - window.innerHeight)
        const decorativeTail = readingEnd - y <= Math.max(64, window.innerHeight * 0.08) && current.contentBottom <= y + window.innerHeight + 2
        if ((direction > 0 && y < readingEnd - 4 && !decorativeTail) || (direction < 0 && y > current.top + 8)) {
          gesture.state = 'native'
          return
        }
        // Fix the destination once: reversing or continuing this drag cannot skip sections.
        gesture.state = 'paging'
        gesture.destination = next.top
      }
      if (event.cancelable) event.preventDefault()
    }
    function onTouchEnd(event: TouchEvent) {
      if (!gesture) return
      const current = gesture
      gesture = null
      if (event.touches.length || !canTouchPage() || current.state !== 'paging' || current.destination === null) return
      // Settling on release also works when the browser began native scrolling before
      // the vertical intent became clear; no native momentum competes with the finger.
      if (event.cancelable) event.preventDefault()
      moveTo(current.destination, 0.72)
    }
    function onKey(event: KeyboardEvent) {
      if (['Escape', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) cancel()
    }
    function onClick(event: MouseEvent) {
      if (event.target instanceof Element && event.target.closest('a, button')) cancel()
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: false })
    window.addEventListener('touchcancel', cancel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', cancel)
    window.addEventListener('hashchange', cancel)
    window.addEventListener('popstate', cancel)
    document.addEventListener('click', onClick, true)
    reduced.addEventListener('change', cancel)
    desktop.addEventListener('change', cancel)
    touch.addEventListener('change', cancel)
    return () => {
      cancel()
      html.classList.remove('section-paging-ready')
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', cancel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', cancel)
      window.removeEventListener('hashchange', cancel)
      window.removeEventListener('popstate', cancel)
      document.removeEventListener('click', onClick, true)
      reduced.removeEventListener('change', cancel)
      desktop.removeEventListener('change', cancel)
      touch.removeEventListener('change', cancel)
    }
  }, [])
}
