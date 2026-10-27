import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Menu, X } from 'lucide-react'
import { Brand } from './Brand'
import { navigation } from '../content/site'
import type { Panel } from '../content/site'

export function Header({ onNavigate }: { onNavigate: (panel: Panel) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<Panel | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element || !menuOpen) return
    element.showModal()
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = oldOverflow
    }
  }, [menuOpen])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 980px)')
    const closeOnDesktop = () => { if (media.matches) setMenuOpen(false) }
    media.addEventListener('change', closeOnDesktop)
    return () => media.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    let frame = 0
    let disposed = false
    const sections = [
      { id: 'home', panel: null },
      { id: 'services', panel: 'services' },
      { id: 'partners', panel: 'work' },
      { id: 'contact', panel: 'contact' },
    ] as const
    function update() {
      frame = 0
      if (disposed) return
      const offset = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 100
      let current: Panel | null = null
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.getBoundingClientRect().top <= offset + 32) current = section.panel
      }
      setActivePanel(current)
    }
    function schedule() { if (!frame) frame = window.requestAnimationFrame(update) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('hashchange', schedule)
    schedule()
    void document.fonts.ready.then(() => { if (!disposed) schedule() })
    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('hashchange', schedule)
    }
  }, [])

  function closeMenu() {
    setMenuOpen(false)
    menuButton.current?.focus()
  }

  function choose(panel: Panel | null, event?: MouseEvent<HTMLAnchorElement>) {
    if (event && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return
    closeMenu()
    if (panel) {
      event?.preventDefault()
      onNavigate(panel)
    }
  }

  function items() {
    return navigation.map(({ label, panel }) => {
      if (panel === null || panel === 'services' || panel === 'work' || panel === 'contact') {
        return <a key={label} href={panel ? '#' + panel : '#home'}
          className={panel === activePanel ? 'is-active' : undefined}
          aria-current={panel === activePanel ? 'location' : undefined}
          onClick={(event) => choose(panel, event)}>{label}</a>
      }
      return <button key={label} type="button" onClick={() => choose(panel)}>{label}</button>
    })
  }

  return (
    <header className="site-header">
      <Brand vector />
      <nav className="desktop-nav" aria-label="التنقل الرئيسي">{items()}</nav>
      <button ref={menuButton} type="button" className="menu-toggle" aria-label="فتح القائمة"
        aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}>
        <Menu aria-hidden="true" />
      </button>
      <dialog ref={dialog} id="mobile-navigation" className="navigation-dialog" aria-label="قائمة التنقل"
        onCancel={() => setMenuOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) closeMenu() }}>
        <div className="navigation-dialog__inner">
          <button type="button" className="icon-button navigation-dialog__close" aria-label="إغلاق القائمة" onClick={closeMenu}>
            <X aria-hidden="true" />
          </button>
          <nav aria-label="التنقل على الهاتف">{items()}</nav>
        </div>
      </dialog>
    </header>
  )
}
