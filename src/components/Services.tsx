import { useEffect, useId, useRef, useState } from 'react'
import { ArrowUpLeft, ArrowLeft, X } from 'lucide-react'
import { services } from '../content/site'

const offerings = [
  ['التصميم الجرافيكي', 'تصميم المطبوعات', 'المحتوى الإبداعي'],
  ['إدارة المنصات الاجتماعية', 'الحملات الإعلانية', 'استراتيجية المحتوى'],
  ['المواقع والتطبيقات', 'تصميم تجربة المستخدم', 'التكاملات الرقمية'],
  ['التصوير والإنتاج', 'الموشن جرافيك', 'المونتاج والمعالجة'],
  ['بناء الهوية البصرية', 'استراتيجية العلامة', 'دليل استخدام الهوية'],
  ['دراسة السوق', 'خطط التسويق', 'تطوير استراتيجية النمو'],
  ['تنظيم الفعاليات', 'تجارب العلامات', 'التغطية والإنتاج'],
  ['الدعم التقني', 'الصيانة والتطوير', 'الحلول الرقمية المتكاملة'],
]

const shapes = [
  'M30 72 42 37 70 20 89 39 73 67 38 79Z M42 37 73 67 M38 79 56 54',
  'M30 43 60 43 87 27 87 77 60 61 30 61Z M41 62 46 81 59 81 54 63',
  'M44 30 23 52 44 75 M74 30 95 52 74 75 M67 24 52 82',
  'M28 35 82 35 89 43 89 80 28 80Z M28 35 25 24 80 17 83 28Z M50 45 50 69 70 57Z',
  'M25 46 58 26 92 46 58 66Z M25 59 58 79 92 59 M25 72 58 92 92 72',
  'M29 79 29 57 41 57 41 79Z M51 79 51 43 63 43 63 79Z M73 79 73 26 85 26 85 79Z M28 43 52 27 65 31 87 14',
  'M27 31 89 31 89 84 27 84Z M27 46 89 46 M43 23 43 39 M73 23 73 39 M43 59 51 59 M65 59 73 59 M43 72 51 72 M65 72 73 72',
  'M42 31 35 24 23 36 31 44 27 54 17 56 17 72 29 73 34 82 31 92 46 99 52 89 63 89 70 98 83 89 78 79 83 68 95 65 92 49 80 48 74 39 76 28 61 23 55 33Z M69 61 A15 15 0 1 1 39 61 A15 15 0 1 1 69 61Z',
]

function ServiceGlassIcon({ index }: { index: number }) {
  const id = 'service-glass-' + useId().replaceAll(':', '')
  return <svg className="service-card__glass" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={id} x1="0" y1="1" x2="0.9" y2="0">
        <stop stopColor="#002ca9" /><stop offset="0.45" stopColor="#1265f0" stopOpacity="0.6" /><stop offset="1" stopColor="#b8edff" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id={id + '-edge'} x1="0" y1="1" x2="1" y2="0">
        <stop stopColor="#165cff" /><stop offset="0.5" stopColor="#61caff" /><stop offset="1" stopColor="#efffff" />
      </linearGradient>
      <mask id={id + '-shine-mask'} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
        <path d={shapes[index]} fill={index === 0 || index === 1 || index === 3 || index === 4 ? 'white' : 'none'} fillRule="evenodd" stroke="white" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
      </mask>
      <linearGradient id={id + '-shine'}>
        <stop stopColor="white" stopOpacity="0" /><stop offset=".5" stopColor="#efffff" stopOpacity=".75" /><stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={id + '-floor'}><stop stopColor="#146aff" stopOpacity="0.55" /><stop offset="1" stopColor="#146aff" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="60" cy="103" rx="48" ry="11" fill={'url(#' + id + '-floor)'} />
    <path d="M18 37 62 13 106 37 106 86 62 109 18 85Z" fill="#072552" stroke="#1453ab" strokeWidth="0.8" opacity="0.65" />
    <path d="M18 37 62 62 106 37 M62 62 62 109" fill="none" stroke="#7bcfff" strokeOpacity="0.15" />
    <g transform="translate(4 5)" opacity="0.75"><path d={shapes[index]} fill="none" stroke="#0437a7" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" /></g>
    <path d={shapes[index]} fill={index === 0 || index === 1 || index === 3 || index === 4 ? 'url(#' + id + ')' : 'none'} fillRule="evenodd" stroke={'url(#' + id + '-edge)'} strokeWidth="3.1" strokeLinejoin="round" strokeLinecap="round" />
    <g mask={'url(#' + id + '-shine-mask)'}>
      <rect className="service-card__shine" x="-40" y="0" width="28" height="120" fill={'url(#' + id + '-shine)'} />
    </g>
    <path d="M26 36 62 16 79 25" fill="none" stroke="#dcfbff" strokeOpacity="0.3" strokeWidth="1.2" />
    <circle cx="98" cy="25" r="3" fill="#d5ff48" />
  </svg>
}

export function Services({ onStartProject }: { onStartProject: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const section = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (selected === null || !dialog.current) return
    const element = dialog.current
    element.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      if (element.open) element.close()
      document.body.style.overflow = overflow
    }
  }, [selected])

  useEffect(() => {
    const element = section.current
    if (!element) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const initial = element.getBoundingClientRect()
    let visible = initial.bottom > 0 && initial.top < window.innerHeight
    const update = () => element.setAttribute('data-services-motion', visible && !document.hidden && !reduced.matches ? 'running' : 'paused')
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    }, { threshold: 0 })
    observer?.observe(element)
    document.addEventListener('visibilitychange', update)
    reduced.addEventListener('change', update)
    update()
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', update)
      reduced.removeEventListener('change', update)
      element.removeAttribute('data-services-motion')
    }
  }, [])

  function close() {
    dialog.current?.close()
    setSelected(null)
    trigger.current?.focus()
  }

  return <section ref={section} id="services" className="services-section" aria-labelledby="services-heading" tabIndex={-1}>
    <div className="services-section__shell">
      <header className="services-section__header">
        <div><p className="services-section__eyebrow">خبرات تتكامل. أفكار تتحوّل.</p><h2 id="services-heading">خدماتنا</h2></div>
        <p className="services-section__intro">ثمانية مسارات إبداعية،<br />وإمكانيات تتجاوز الإطار.</p>
      </header>
      <div className="services-section__grid">
        {services.map((category, index) => <button key={category} className="service-card" type="button" onClick={(event) => { trigger.current = event.currentTarget; setSelected(index) }}>
          <span className="service-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <ServiceGlassIcon index={index} />
          <span className="service-card__body"><strong>{category}</strong><span className="service-card__explore">استكشف الخدمات <ArrowUpLeft aria-hidden="true" strokeWidth={1.5} /></span></span>
          <span className="service-card__corner" aria-hidden="true" />
        </button>)}
      </div>
    </div>
    <dialog ref={dialog} className="services-dialog" aria-labelledby="service-dialog-title" onCancel={() => { setSelected(null); trigger.current?.focus() }} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
      {selected !== null && <div className="services-dialog__body">
        <button className="services-dialog__close" type="button" aria-label="إغلاق تفاصيل الخدمة" onClick={close}><X aria-hidden="true" /></button>
        <ServiceGlassIcon index={selected} />
        <p className="services-section__eyebrow">من الفكرة إلى التنفيذ</p>
        <h2 id="service-dialog-title">{services[selected]}</h2>
        <p>خبرات متكاملة تمنح مشروعك وضوحًا وحضورًا وتأثيرًا.</p>
        <ul>{offerings[selected].map((item) => <li key={item}>{item}</li>)}</ul>
        <button className="services-dialog__cta" type="button" onClick={() => { close(); onStartProject() }}><span>لنتحدث عن مشروعك</span><ArrowLeft aria-hidden="true" /></button>
      </div>}
    </dialog>
  </section>
}
