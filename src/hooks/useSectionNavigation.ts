import { useEffect } from 'react'

type SectionId = 'home' | 'work' | 'contact'
const sectionIds = new Set(['home', 'work', 'contact'])

export function scrollToSection(id: SectionId) {
  const section = document.getElementById(id)
  if (!section) return
  if (window.location.hash !== '#' + id) window.history.pushState(null, '', '#' + id)
  const focusTarget = id === 'contact' ? section.querySelector<HTMLElement>('input') : section
  focusTarget?.focus({ preventScroll: true })
  section.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })
}

export function useSectionNavigation() {
  useEffect(() => {
    let frame = 0
    function onAnchorClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element ? event.target.closest('a') : null
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
      const href = anchor.getAttribute('href')
      if (!href?.startsWith('#') || !sectionIds.has(href.slice(1))) return
      const id = href.slice(1) as SectionId
      if (!document.getElementById(id)) return
      event.preventDefault()
      // Let a mobile menu close and release its scroll lock before navigating.
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        frame = 0
        scrollToSection(id)
      })
    }
    document.addEventListener('click', onAnchorClick)
    return () => {
      document.removeEventListener('click', onAnchorClick)
      window.cancelAnimationFrame(frame)
    }
  }, [])
}
