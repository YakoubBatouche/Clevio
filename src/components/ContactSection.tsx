import { useId, useState } from 'react'
import { ArrowLeft, ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { services } from '../content/site'


/** A static glass message, with separate pieces prepared for future choreography. */
function ContactMessageVisual() {
  const id = 'contact-message-' + useId().replaceAll(':', '')
  return <svg className="contact-message" viewBox="0 0 480 500" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={id + '-glass'} x1="0" y1="1" x2="1" y2="0">
        <stop stopColor="#06246f" /><stop offset=".45" stopColor="#0758dc" stopOpacity=".78" /><stop offset="1" stopColor="#78d9ff" stopOpacity=".87" />
      </linearGradient>
      <linearGradient id={id + '-face'} x1="0" y1="1" x2=".8" y2="0">
        <stop stopColor="#062552" /><stop offset=".6" stopColor="#0c4fbb" /><stop offset="1" stopColor="#2177e5" stopOpacity=".88" />
      </linearGradient>
      <linearGradient id={id + '-edge'} x1="0" y1="1" x2="1" y2="0">
        <stop stopColor="#174eff" /><stop offset=".55" stopColor="#64caff" /><stop offset="1" stopColor="#d4f6ff" />
      </linearGradient>
      <linearGradient id={id + '-paper'} x1="0" y1="1" x2="1" y2="0">
        <stop stopColor="#071a43" /><stop offset="1" stopColor="#173d73" />
      </linearGradient>
      <radialGradient id={id + '-light'}><stop stopColor="#1265ed" stopOpacity=".32" /><stop offset="1" stopColor="#1265ed" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="238" cy="272" rx="226" ry="216" fill={'url(#' + id + '-light)'} />
    <ellipse cx="242" cy="425" rx="171" ry="21" fill="#020b24" opacity=".7" />
    <ellipse cx="242" cy="422" rx="141" ry="12" fill="#0753b7" opacity=".16" />
    <g data-contact-piece="letter" transform="rotate(-13 232 229)">
      <rect x="142" y="121" width="178" height="231" rx="19" fill="#05152e" stroke="#174990" strokeWidth="2" />
      <rect x="136" y="113" width="178" height="231" rx="19" fill={'url(#' + id + '-paper)'} stroke={'url(#' + id + '-edge)'} strokeWidth="1.5" />
      <path d="M159 143h47M159 161h116M159 179h95" fill="none" stroke="#8edaff" strokeLinecap="round" strokeWidth="4" opacity=".55" />
      <path d="M159 209h117M159 225h100M159 241h111" fill="none" stroke="#5d9fdf" strokeLinecap="round" strokeWidth="3" opacity=".28" />
      <rect x="159" y="270" width="61" height="22" rx="7" fill="#d5ff48" opacity=".84" />
      <path d="M169 280h41" stroke="#173234" strokeWidth="2" strokeLinecap="round" />
    </g>
    <g data-contact-piece="envelope" strokeLinejoin="round">
      <path d="m74 252 260-59 60 162-260 62Z" fill="#041d4d" stroke="#1b4ba0" strokeWidth="2" />
      <path d="m65 240 260-59 60 162-260 62Z" fill={'url(#' + id + '-face)'} stroke={'url(#' + id + '-edge)'} strokeWidth="2" />
      <path d="m65 240 171 68 89-127" fill={'url(#' + id + '-glass)'} stroke="#81d3ff" strokeWidth="1.6" />
      <path d="m125 402 77-109m181 48-108-65" fill="none" stroke="#9bddff" strokeWidth="1.3" opacity=".57" />
      <path d="m65 240 60 165 260-62-60-162" fill="none" stroke="#4b93ff" strokeWidth="1" opacity=".63" />
      <path d="m76 245 152 61" fill="none" stroke="#e6fbff" strokeWidth="2.4" opacity=".58" />
      <path d="m128 395 245-57" fill="none" stroke="#156bff" strokeWidth="4" opacity=".65" />
      <path d="m87 247 44 122 30-6-43-103Z" fill="#b7e9ff" opacity=".06" />
    </g>
    <g data-contact-piece="bubble" strokeLinejoin="round">
      <path d="M287 66h103a23 23 0 0 1 23 23v65a23 23 0 0 1-23 23h-54l-35 30 4-30h-18a23 23 0 0 1-23-23V89a23 23 0 0 1 23-23Z" fill="#051b42" stroke="#174fa9" strokeWidth="2" />
      <path d="M280 58h103a23 23 0 0 1 23 23v65a23 23 0 0 1-23 23h-54l-35 30 4-30h-18a23 23 0 0 1-23-23V81a23 23 0 0 1 23-23Z" fill={'url(#' + id + '-glass)'} stroke={'url(#' + id + '-edge)'} strokeWidth="1.7" />
      <path d="M280 65h101a17 17 0 0 1 17 17" fill="none" stroke="#d0f5ff" strokeWidth="2" opacity=".52" />
      <circle cx="296" cy="113" r="7" fill="#d5ff48" /><circle cx="331" cy="113" r="7" fill="#d7f5ff" opacity=".85" /><circle cx="366" cy="113" r="7" fill="#d7f5ff" opacity=".55" />
    </g>
    <g data-contact-piece="signal">
      <path d="M98 143v31a18 18 0 0 0 18 18h13M372 384h31a18 18 0 0 0 18-18v-32" fill="none" stroke="#4e94e0" strokeWidth="1.5" strokeDasharray="3 8" strokeLinecap="round" opacity=".55" />
      <circle cx="98" cy="130" r="8" fill="#d5ff48" />
      <circle cx="421" cy="321" r="6" fill="#67cfff" />
      <circle cx="109" cy="130" r="16" fill="none" stroke="#d5ff48" strokeWidth="1" opacity=".13" />
      <path d="m183 71 5-13 5 13 13 5-13 5-5 13-5-13-13-5Z" fill="#74caff" opacity=".54" />
    </g>
  </svg>
}

export function ContactSection() {
  const fieldId = useId()
  const [draftHref, setDraftHref] = useState('')
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'info@clevio.dz'
  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '').replace(/^00/, '')
  const hasWhatsApp = /^\d{8,15}$/.test(whatsappNumber)
  const secondaryHref = hasWhatsApp
    ? 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent('مرحبًا كليفيو، أود مناقشة مشروع جديد.')
    : 'mailto:' + contactEmail

  return (
    <section id="contact" className="contact-section" tabIndex={-1} aria-labelledby="contact-heading">
      <div className="contact-section__shell">
        <div className="contact-section__layout">
          <div className="contact-section__content">
            <p className="contact-section__eyebrow"><span aria-hidden="true" />لنبدأ شيئًا مختلفًا</p>
            <h2 id="contact-heading">لديك فكرة؟ لنحوّلها إلى شيء مميز.</h2>
            <p className="contact-section__intro">أخبرنا عن مشروعك، وسنتواصل معك في أقرب وقت.</p>

            <form className="contact-section__form" aria-label="تفاصيل مشروع جديد"
              onChange={() => { if (draftHref) setDraftHref('') }}
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                const data = new FormData(form)
                const contact = String(data.get('contact') || '').trim()
                const contactInput = form.elements.namedItem('contact') as HTMLInputElement
                const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
                const validPhone = /^[+\d()\s.-]+$/.test(contact) && contact.replace(/\D/g, '').length >= 6
                if (!validEmail && !validPhone) {
                  contactInput.setCustomValidity('أدخل بريدًا إلكترونيًا أو رقم هاتف صحيحًا.')
                  contactInput.reportValidity()
                  return
                }
                contactInput.setCustomValidity('')
                const body = [
                  'الاسم: ' + String(data.get('name') || '').trim(),
                  'وسيلة التواصل: ' + contact,
                  'الخدمة: ' + data.get('service'),
                  '',
                  'تفاصيل المشروع:',
                  String(data.get('brief') || '').trim(),
                ].join('\n')
                setDraftHref('mailto:' + contactEmail + '?subject=' + encodeURIComponent('مشروع جديد — Clevio') + '&body=' + encodeURIComponent(body))
              }}>
              <div className="contact-section__fields">
                <div className="contact-section__field">
                  <label htmlFor={fieldId + '-name'}>الاسم الكامل <span aria-hidden="true">*</span></label>
                  <input id={fieldId + '-name'} name="name" autoComplete="name" required maxLength={120} placeholder="كيف نناديك؟" />
                </div>
                <div className="contact-section__field">
                  <label htmlFor={fieldId + '-contact'}>البريد الإلكتروني أو رقم الهاتف <span aria-hidden="true">*</span></label>
                  <input id={fieldId + '-contact'} name="contact" autoComplete="email" dir="auto" required maxLength={254}
                    placeholder="وسيلة التواصل المناسبة لك"
                    onInput={(event) => event.currentTarget.setCustomValidity('')} />
                </div>
                <div className="contact-section__field contact-section__field--full contact-section__field--select">
                  <label htmlFor={fieldId + '-service'}>نوع الخدمة أو المشروع <span aria-hidden="true">*</span></label>
                  <select id={fieldId + '-service'} name="service" defaultValue="" required>
                    <option value="" disabled>اختر الخدمة المناسبة</option>
                    {services.map((service) => <option key={service} value={service}>{service}</option>)}
                    <option value="مشروع متكامل">مشروع متكامل</option>
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
                <div className="contact-section__field contact-section__field--full">
                  <label htmlFor={fieldId + '-brief'}>تفاصيل المشروع <span aria-hidden="true">*</span></label>
                  <textarea id={fieldId + '-brief'} name="brief" rows={4} required maxLength={4000}
                    placeholder="حدثنا عن فكرتك، وما الذي تطمح إلى تحقيقه..." />
                </div>
              </div>
              <p className="contact-section__required">جميع الحقول مطلوبة.</p>
              <div className="contact-section__actions">
                <button className="contact-section__submit" type="submit"><span>جهّز تفاصيل مشروعك</span><ArrowLeft aria-hidden="true" /></button>
                <a className="contact-section__direct" href={secondaryHref}
                  target={hasWhatsApp ? '_blank' : undefined} rel={hasWhatsApp ? 'noopener noreferrer' : undefined}>
                  {hasWhatsApp ? <MessageCircle aria-hidden="true" /> : <Mail aria-hidden="true" />}
                  <span>{hasWhatsApp ? 'أو تواصل معنا عبر واتساب' : 'أو تواصل معنا عبر البريد'}</span>
                </a>
              </div>
              {draftHref && <div className="contact-section__draft" role="status">
                <p>تفاصيل مشروعك جاهزة. افتح تطبيق البريد لمراجعة الرسالة وإرسالها.</p>
                <a href={draftHref}><Mail aria-hidden="true" /><span>فتح تطبيق البريد</span><ArrowLeft aria-hidden="true" /></a>
              </div>}
            </form>
          </div>
          <div className="contact-section__art" aria-hidden="true">
            <ContactMessageVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
