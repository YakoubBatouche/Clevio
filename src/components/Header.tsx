import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Brand } from './Brand'
import { navigation } from '../content/site'
import type { Panel } from '../content/site'

export function Header({ onNavigate }: { onNavigate: (panel: Panel) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
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

  function closeMenu() {
    setMenuOpen(false)
    menuButton.current?.focus()
  }

  function navigate(panel: Panel | null) {
    closeMenu()
    if (panel) onNavigate(panel)
  }

  return (
    <header className="site-header">
      <Brand />
      <nav className="desktop-nav" aria-label="التنقل الرئيسي">
        {navigation.map(({ label, panel }) => panel
          ? <button key={label} type="button" onClick={() => onNavigate(panel)}>{label}</button>
          : <a key={label} href="#home" className="is-active" aria-current="page">{label}</a>,
        )}
      </nav>
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
          <nav aria-label="التنقل على الهاتف">
            {navigation.map(({ label, panel }) => panel
              ? <button key={label} type="button" onClick={() => navigate(panel)}>{label}</button>
              : <a key={label} href="#home" aria-current="page" onClick={() => navigate(null)}>{label}</a>,
            )}
          </nav>
        </div>
      </dialog>
    </header>
  )
}
