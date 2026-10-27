import { useEffect } from 'react'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { gsap } from '../lib/animation'

gsap.registerPlugin(ScrollToPlugin)

/** One wheel gesture advances one section, while long sections retain native reading space. */
export function useSectionPaging() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = window.matchMedia('(min-width: 980px) and (hover: hover) and (pointer: fine)')
    const html = document.documentElement
    html.classList.add('section-paging-ready')
    let tween: gsap.core.Tween | null = null
    let lastWheel = 0
    let accumulated = 0
    let previousDirection = 0
    let consumed = false

    const cancel = () => {
      tween?.kill()
      tween = null
      consumed = false
      accumulated = 0
      html.classList.remove('section-paging-moving')
    }
    const canPage = () => desktop.matches && !reduced.matches &&
      !html.classList.contains('intro-pending') && document.body.style.overflow !== 'hidden' && !document.querySelector('dialog[open]')
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
    function moveTo(y: number) {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const target = Math.max(0, Math.min(max, y))
      if (Math.abs(target - window.scrollY) < 3) return
      consumed = true
      html.classList.add('section-paging-moving')
      tween = gsap.to(window, {
        scrollTo: { y: target, autoKill: false }, duration: 0.95, ease: 'power3.inOut',
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
      const sections = [...document.querySelectorAll<HTMLElement>('#home, #services, #partners, #contact, .site-footer')]
        .map((element) => ({ top: element.getBoundingClientRect().top + window.scrollY, height: element.offsetHeight }))
      if (!sections.length) return
      const y = window.scrollY
      let index = 0
      sections.forEach((section, candidate) => { if (section.top <= y + 8) index = candidate })
      const current = sections[index]
      const readingEnd = Math.max(current.top, current.top + current.height - window.innerHeight)
      // A tall service grid or form can be read normally until its visible content ends.
      if (direction > 0 && y < readingEnd - 4) {
        if (delta < readingEnd - y - 4) { accumulated = 0; return }
        event.preventDefault()
        moveTo(readingEnd)
        return
      }
      if (direction < 0 && y > current.top + 8) { accumulated = 0; return }
      const next = sections[index + direction]
      if (!next) return
      event.preventDefault()
      accumulated += Math.abs(delta)
      if (accumulated < 32) return
      accumulated = 0
      moveTo(next.top)
    }
    function onKey(event: KeyboardEvent) {
      if (['Escape', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) cancel()
    }
    function onClick(event: MouseEvent) {
      if (event.target instanceof Element && event.target.closest('a, button')) cancel()
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick, true)
    reduced.addEventListener('change', cancel)
    desktop.addEventListener('change', cancel)
    return () => {
      cancel()
      html.classList.remove('section-paging-ready')
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick, true)
      reduced.removeEventListener('change', cancel)
      desktop.removeEventListener('change', cancel)
    }
  }, [])
}
