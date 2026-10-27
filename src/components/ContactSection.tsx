import { useId, useState } from 'react'
import { ArrowLeft, ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { services } from '../content/site'


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
            <img className="contact-crystal-render" data-contact-piece="crystal-plane"
              src={import.meta.env.BASE_URL + 'contact/contact-crystal-768.webp'}
              srcSet={import.meta.env.BASE_URL + 'contact/contact-crystal-768.webp 768w, ' + import.meta.env.BASE_URL + 'contact/contact-crystal-1200.webp 1200w'}
              sizes="(max-width: 760px) 1px, (max-width: 1100px) 32vw, 460px"
              alt="" width="1200" height="1200" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
    </section>
  )
}
