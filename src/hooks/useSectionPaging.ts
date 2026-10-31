import { useEffect } from 'react'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { gsap } from '../lib/animation'
import { sectionScrollTop } from './useSectionNavigation'

gsap.registerPlugin(ScrollToPlugin)

const stageSelector = '#home, #services, #partners, #contact, .site-footer'

/** Mobile document scrolling belongs to this pager; reading panels scroll internally. */
export function useSectionPaging() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = window.matchMedia('(min-width: 980px) and (hover: hover) and (pointer: fine)')
    const touch = window.matchMedia('(max-width: 979px), (pointer: coarse)')
    const html = document.documentElement
    html.classList.add('section-paging-ready')
    let tween: gsap.core.Tween | null = null
    let tweenIndex: number | null = null
    let activeIndex = 0
    let settleTimer = 0
    let resizeFrame = 0
    let lastWheel = 0
    let accumulated = 0
    let previousDirection = 0
    let consumed = false
    let revealFocus = false
    let gesture: {
      identifier: number; x: number; y: number; target: EventTarget | null
      state: 'pending' | 'native' | 'paging' | 'blocked'; destination: number | null
    } | null = null

    const pagingAvailable = () => !html.classList.contains('intro-pending') &&
      document.body.style.overflow !== 'hidden' && !document.querySelector('dialog[open]')
    const canPage = () => desktop.matches && !reduced.matches && pagingAvailable()
    // Reduced motion changes the transition, never the mobile section lock.
    const canTouchPage = () => touch.matches && pagingAvailable()
    const prevent = (event: Event) => { if (event.cancelable) event.preventDefault() }
    function sections() {
      const max = Math.max(0, html.scrollHeight - window.innerHeight)
      return [...document.querySelectorAll<HTMLElement>(stageSelector)].map((element) => {
        const selector = element.id === 'contact' ? '.contact-section__content, .contact-section__art'
          : element.id === 'services' ? '.services-section__grid'
            : element.id === 'partners' ? '.partners__group'
              : element.id === 'home' ? '.hero__content, .hero__artwork' : '.site-footer__inner'
        const content = [...element.querySelectorAll<HTMLElement>(selector)].filter((item) => item.getClientRects().length)
        return {
          element,
          top: touch.matches ? Math.min(max, sectionScrollTop(element)) : sectionScrollTop(element),
          bottom: element.getBoundingClientRect().bottom + window.scrollY,
          contentBottom: Math.max(...content.map((item) => item.getBoundingClientRect().bottom + window.scrollY), 0),
        }
      })
    }
    function closestIndex(landings = sections()) {
      return landings.reduce((nearest, section, index) =>
        Math.abs(section.top - window.scrollY) < Math.abs(landings[nearest].top - window.scrollY) ? index : nearest, 0)
    }
    function stopAnimation() {
      tween?.kill()
      tween = null
      tweenIndex = null
      html.classList.remove('section-paging-moving')
    }
    function cancel() {
      stopAnimation()
      consumed = false
      accumulated = 0
      gesture = null
    }
    function moveTo(y: number, duration = 0.95, index: number | null = null) {
      const max = Math.max(0, html.scrollHeight - window.innerHeight)
      const target = Math.max(0, Math.min(max, y))
      consumed = true
      if (index !== null) {
        activeIndex = index
        const focused = document.activeElement
        if (focused instanceof HTMLElement && focused.matches('input, textarea, select, [contenteditable="true"]') &&
          !sections()[index]?.element.contains(focused)) focused.blur()
      }
      if (Math.abs(target - window.scrollY) < 0.5 || (touch.matches && reduced.matches)) {
        window.scrollTo({ top: target, behavior: 'auto' })
        return
      }
      tweenIndex = index
      html.classList.add('section-paging-moving')
      tween = gsap.to(window, {
        scrollTo: { y: target, autoKill: false }, duration, ease: 'power3.inOut',
        onComplete: () => {
          tween = null
          tweenIndex = null
          html.classList.remove('section-paging-moving')
        },
      })
    }
    function page(direction: number) {
      const landings = sections()
      if (!landings.length || tween) return
      const current = closestIndex(landings)
      const index = Math.max(0, Math.min(landings.length - 1, current + direction))
      moveTo(landings[index].top, 0.72, index)
    }
    function nativeScroller(target: EventTarget | null, direction: number) {
      if (!(target instanceof Element)) return false
      // Controls alone cannot release document scrolling. Only explicit reading
      // viewports and scrollable textareas may consume a vertical gesture.
      for (let element: Element | null = target; element && element !== document.body; element = element.parentElement) {
        if (!(element instanceof HTMLElement) || !element.matches('[data-native-scroll], textarea')) continue
        if (element.scrollHeight <= element.clientHeight + 2) continue
        if (direction > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 2 : element.scrollTop > 2) return true
      }
      return false
    }
    function desktopNativeScroll(target: EventTarget | null, direction: number) {
      if (!(target instanceof Element)) return false
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return true
      for (let element: Element | null = target; element && element !== document.body; element = element.parentElement) {
        if (!(element instanceof HTMLElement)) continue
        const overflow = getComputedStyle(element).overflowY
        if (!/auto|scroll/.test(overflow) || element.scrollHeight <= element.clientHeight + 2) continue
        if (direction > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 2 : element.scrollTop > 2) return true
      }
      return false
    }
    function revealFocusedControl() {
      const focused = document.activeElement
      if (!(focused instanceof HTMLElement) || !focused.matches('input, textarea, select, [contenteditable="true"]')) return
      const panel = focused.closest<HTMLElement>('[data-native-scroll]')
      if (!panel) return
      const bounds = focused.getBoundingClientRect()
      const panelBounds = panel.getBoundingClientRect()
      const viewport = window.visualViewport
      const bottom = Math.min(panelBounds.bottom, (viewport?.height ?? window.innerHeight) + (viewport?.offsetTop ?? 0)) - 20
      const top = panelBounds.top + 20
      if (bounds.bottom > bottom) panel.scrollTop += bounds.bottom - bottom
      else if (bounds.top < top) panel.scrollTop -= top - bounds.top
    }
    function settle() {
      if (!canTouchPage() || tween || gesture) return
      const landings = sections()
      if (!landings.length) return
      // Focus can move the document despite overflow:hidden. Anchor its stage
      // and reveal the focused field inside the independently scrolling panel.
      const focused = document.activeElement
      const focusedStage = focused instanceof Element && focused.matches('input, textarea, select, [contenteditable="true"]')
        ? focused.closest(stageSelector) : null
      const focusIndex = landings.findIndex((item) => item.element === focusedStage)
      activeIndex = focusIndex >= 0 ? focusIndex : closestIndex(landings)
      window.scrollTo({ top: landings[activeIndex].top, behavior: 'auto' })
      if (revealFocus) { revealFocusedControl(); revealFocus = false }
    }
    function scheduleSettle() {
      window.clearTimeout(settleTimer)
      if (touch.matches) settleTimer = window.setTimeout(settle, 140)
    }
    function onFocusViewport() { revealFocus = true; scheduleSettle() }
    function onWheel(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      const direction = Math.sign(event.deltaY)
      if (!direction) return
      const mobile = canTouchPage()
      if (!mobile && !canPage()) return
      if (mobile ? !tween && nativeScroller(event.target, direction) : desktopNativeScroll(event.target, direction)) return
      // Mobile never gives the document partial deltas or native edge scrolling.
      if (mobile) prevent(event)
      const now = performance.now()
      const idle = now - lastWheel > 180
      lastWheel = now
      if (tween || (consumed && !idle)) { prevent(event); return }
      if (idle || direction !== previousDirection) { accumulated = 0; consumed = false }
      previousDirection = direction
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1)
      if (mobile) {
        accumulated += Math.abs(delta)
        if (accumulated >= 32) { accumulated = 0; page(direction) }
        return
      }
      const landings = sections()
      if (!landings.length) return
      const y = window.scrollY
      let index = 0
      landings.forEach((section, candidate) => { if (section.top <= y + 8) index = candidate })
      const current = landings[index]
      const readingEnd = Math.max(current.top, current.bottom - window.innerHeight)
      const decorativeTail = readingEnd - y <= Math.max(64, window.innerHeight * 0.08) && current.contentBottom <= y + window.innerHeight + 2
      if (direction > 0 && y < readingEnd - 4 && !decorativeTail) {
        if (delta < readingEnd - y - 4) { accumulated = 0; return }
        prevent(event)
        moveTo(readingEnd)
        return
      }
      if (direction < 0 && y > current.top + 8) { accumulated = 0; return }
      const next = landings[index + direction]
      if (!next) return
      prevent(event)
      accumulated += Math.abs(delta)
      if (accumulated < 32) return
      accumulated = 0
      moveTo(next.top)
    }
    function onTouchStart(event: TouchEvent) {
      if (!canTouchPage() || event.touches.length !== 1 || event.defaultPrevented) { gesture = null; return }
      const point = event.touches[0]
      // A new touch cannot strand an in-flight transition between stages.
      gesture = {
        identifier: point.identifier, x: point.clientX, y: point.clientY, target: event.target,
        state: tween ? 'blocked' : 'pending', destination: null,
      }
    }
    function onTouchMove(event: TouchEvent) {
      if (!gesture) return
      if (!canTouchPage() || event.touches.length !== 1) { gesture = null; scheduleSettle(); return }
      if (gesture.state === 'native') return
      if (gesture.state === 'blocked') { prevent(event); return }
      const point = [...event.touches].find((item) => item.identifier === gesture?.identifier)
      if (!point) { gesture = null; scheduleSettle(); return }
      const horizontal = Math.abs(point.clientX - gesture.x)
      const vertical = gesture.y - point.clientY
      if (gesture.state === 'pending') {
        if (horizontal >= 10 && horizontal > Math.abs(vertical) * 1.15) { gesture.state = 'native'; return }
        const direction = Math.sign(vertical)
        if (direction && nativeScroller(gesture.target, direction)) { gesture.state = 'native'; return }
        // Block native vertical movement from its first pixels, before the
        // deliberate 18px section threshold has been reached.
        if (Math.abs(vertical) >= horizontal) prevent(event)
        if (Math.abs(vertical) < 18 || Math.abs(vertical) < horizontal * 1.35) return
        const landings = sections()
        if (!landings.length) return
        const current = closestIndex(landings)
        gesture.state = 'paging'
        gesture.destination = Math.max(0, Math.min(landings.length - 1, current + direction))
      }
      prevent(event)
    }
    function onTouchEnd(event: TouchEvent) {
      if (!gesture) return
      const current = gesture
      gesture = null
      if (event.touches.length || !canTouchPage()) { scheduleSettle(); return }
      if (current.state === 'paging' && current.destination !== null) {
        prevent(event)
        const landing = sections()[current.destination]
        if (landing) moveTo(landing.top, 0.72, current.destination)
      } else scheduleSettle()
    }
    function onTouchCancel() { gesture = null; scheduleSettle() }
    function onKey(event: KeyboardEvent) {
      const keys = ['PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' ']
      if (!canTouchPage()) {
        if (['Escape', ...keys].includes(event.key)) cancel()
        return
      }
      if (!keys.includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return
      if (event.target instanceof Element && event.target.closest('input, textarea, select, button, [contenteditable="true"], [data-native-scroll]')) return
      prevent(event)
      if (tween || event.repeat) return
      if (event.key === 'Home' || event.key === 'End') {
        const landings = sections()
        const index = event.key === 'Home' ? 0 : landings.length - 1
        if (landings[index]) moveTo(landings[index].top, 0.72, index)
      } else page(event.key === 'PageUp' || event.key === 'ArrowUp' || (event.key === ' ' && event.shiftKey) ? -1 : 1)
    }
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element) || !event.target.closest('a, button')) return
      if (!touch.matches) { cancel(); return }
      // Finish the landing before a link/button starts its own navigation.
      if (tween) tween.progress(1)
      gesture = null
      scheduleSettle()
    }
    function onResize() {
      const index = tweenIndex ?? closestIndex()
      cancel()
      window.cancelAnimationFrame(resizeFrame)
      if (touch.matches) resizeFrame = window.requestAnimationFrame(() => {
        if (!canTouchPage()) return
        const landings = sections()
        const landing = landings[index]
        if (landing) { activeIndex = index; window.scrollTo({ top: landing.top, behavior: 'auto' }) }
        scheduleSettle()
      })
    }
    function onNavigation() {
      if (touch.matches && tween) tween.progress(1)
      else if (!touch.matches) cancel()
      gesture = null
      scheduleSettle()
    }
    function updateMode() {
      cancel()
      html.classList.toggle('section-paging-mobile', touch.matches)
      if (touch.matches) { activeIndex = closestIndex(); scheduleSettle() }
    }
    // Resume cleanly after intro/menu/dialog locks without releasing the root.
    const lockObserver = new MutationObserver(scheduleSettle)
    lockObserver.observe(html, { attributes: true, attributeFilter: ['class'] })
    lockObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    updateMode()
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: false })
    window.addEventListener('touchcancel', onTouchCancel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    window.addEventListener('scroll', scheduleSettle, { passive: true })
    window.addEventListener('hashchange', onNavigation)
    window.addEventListener('popstate', onNavigation)
    window.visualViewport?.addEventListener('resize', onFocusViewport)
    document.addEventListener('focusin', onFocusViewport)
    document.addEventListener('click', onClick, true)
    reduced.addEventListener('change', updateMode)
    desktop.addEventListener('change', updateMode)
    touch.addEventListener('change', updateMode)
    return () => {
      lockObserver.disconnect()
      cancel()
      window.clearTimeout(settleTimer)
      window.cancelAnimationFrame(resizeFrame)
      html.classList.remove('section-paging-ready', 'section-paging-mobile')
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchCancel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.removeEventListener('scroll', scheduleSettle)
      window.removeEventListener('hashchange', onNavigation)
      window.removeEventListener('popstate', onNavigation)
      window.visualViewport?.removeEventListener('resize', onFocusViewport)
      document.removeEventListener('focusin', onFocusViewport)
      document.removeEventListener('click', onClick, true)
      reduced.removeEventListener('change', updateMode)
      desktop.removeEventListener('change', updateMode)
      touch.removeEventListener('change', updateMode)
    }
  }, [])
}
