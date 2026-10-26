import { useEffect, useRef } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { ContactForm } from './ContactForm'
import { services, workAreas } from '../content/site'
import type { Panel } from '../content/site'

const titles: Record<Panel, string> = {
  services: 'خدماتنا', work: 'أعمالنا', about: 'من نحن', contact: 'لنبدأ مشروعك',
}

export function ContentDialog({ panel, onClose, onNavigate }: {
  panel: Panel | null; onClose: () => void; onNavigate: (panel: Panel) => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !panel) return
    element.showModal()
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = oldOverflow
    }
  }, [panel])

  return (
    <dialog ref={ref} className="content-dialog" aria-labelledby="panel-title"
      onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="content-dialog__inner">
        <button type="button" className="icon-button content-dialog__close" aria-label="إغلاق النافذة" onClick={onClose}><X aria-hidden="true" /></button>
        <p className="panel-eyebrow" lang="en" dir="ltr">CLEVIO</p>
        <h2 id="panel-title">{panel ? titles[panel] : ''}</h2>
        {panel === 'contact' && <ContactForm />}
        {panel === 'services' && <ul className="service-list">{services.map((service) => <li key={service}>{service}<ArrowLeft aria-hidden="true" /></li>)}</ul>}
        {panel === 'work' && <div className="work-areas">{workAreas.map((area) => <article key={area.title}><h3>{area.title}</h3><p>{area.description}</p></article>)}</div>}
        {panel === 'about' && <p className="panel-copy">نحن كليفيو. شريكك الإبداعي في عالم التصميم والتسويق والتكنولوجيا. نحوّل الأفكار الجريئة إلى هويات وتجارب رقمية مؤثرة، ونرافقك من الفكرة إلى النمو.</p>}
        {panel && panel !== 'contact' && <button type="button" className="action action--primary panel-cta" onClick={() => onNavigate('contact')}>
          <span>تحدّث معنا عن مشروعك</span><ArrowLeft aria-hidden="true" />
        </button>}
      </div>
    </dialog>
  )
}
