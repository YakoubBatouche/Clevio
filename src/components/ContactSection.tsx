import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { contactEmail, services, siteContent, siteImageUrl } from '../content/site'

const defaultArt = 'contact/contact-crystal-768.webp'
const sendingMessage = 'جارٍ إرسال طلبك…'
const successMessage = 'وصلنا طلبك. سنتواصل معك قريبًا.'
const unavailableMessage = 'تعذّر تأكيد إرسال طلبك. حاول مرة أخرى أو أرسل تفاصيله بالبريد الإلكتروني.'
const invalidMessage = 'تحقّق من اكتمال البيانات، ثم حاول إرسال الطلب مرة أخرى.'

type SubmissionNotice = { kind: 'success' | 'error'; message: string; draftHref?: string }

export function ContactSection() {
  const { contact: content } = siteContent
  const { form: copy } = content
  const fieldId = useId()
  const sectionRef = useRef<HTMLElement>(null)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<SubmissionNotice | null>(null)
  const sendingRef = useRef(false)
  const retry = useRef<{ body: string; key: string } | null>(null)
  const artwork = content.art?.replace(/^\/+/, '') || defaultArt
  const whatsappNumber = (content.whatsapp?.trim() || import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '').replace(/^00/, '')
  const hasWhatsApp = /^\d{8,15}$/.test(whatsappNumber)
  const secondaryHref = hasWhatsApp
    ? 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(content.whatsappMessage)
    : 'mailto:' + contactEmail

  useEffect(() => {
    const viewport = window.visualViewport
    const section = sectionRef.current
    if (!viewport || !section) return
    // Keep the reading panel above a mobile keyboard without resizing its stage.
    const updateViewportHeight = () => section.style.setProperty('--contact-viewport-height', `${viewport.height}px`)
    updateViewportHeight()
    viewport.addEventListener('resize', updateViewportHeight)
    return () => {
      viewport.removeEventListener('resize', updateViewportHeight)
      section.style.removeProperty('--contact-viewport-height')
    }
  }, [])

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sendingRef.current) return

    const form = event.currentTarget
    const data = new FormData(form)
    const details = {
      name: String(data.get('name') || '').trim(),
      contact: String(data.get('contact') || '').trim(),
      service: String(data.get('service') || '').trim(),
      brief: String(data.get('brief') || '').trim(),
      website: String(data.get('website') || '').trim(),
    }
    const contactInput = form.elements.namedItem('contact') as HTMLInputElement
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.contact)
    const validPhone = /^[+\d()\s.-]+$/.test(details.contact) && details.contact.replace(/\D/g, '').length >= 6
    if (!validEmail && !validPhone) {
      contactInput.setCustomValidity(copy.validationMessage)
      contactInput.reportValidity()
      return
    }
    contactInput.setCustomValidity('')
    if (!details.name || !details.service || !details.brief) {
      setNotice({ kind: 'error', message: invalidMessage })
      return
    }

    function showEmailFallback() {
      const body = [
        copy.nameLabel + ': ' + details.name,
        copy.contactLabel + ': ' + details.contact,
        copy.serviceLabel + ': ' + details.service,
        '',
        copy.briefLabel + ':',
        details.brief,
      ].join('\n')
      const draftHref = 'mailto:' + contactEmail + '?subject=' + encodeURIComponent(copy.subject) + '&body=' + encodeURIComponent(body)
      setNotice({ kind: 'error', message: unavailableMessage, draftHref })
    }

    sendingRef.current = true
    setSending(true)
    setNotice(null)
    try {
      const body = JSON.stringify(details)
      const key = retry.current?.body === body ? retry.current.key : crypto.randomUUID()
      retry.current = { body, key }
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
        body,
        signal: AbortSignal.timeout(15000),
      })
      const result = await response.json().catch(() => null)
      if (response.ok && result?.ok === true) {
        form.reset()
        retry.current = null
        setNotice({ kind: 'success', message: successMessage })
      } else if (response.status === 429 || result?.error === 'rate_limit') {
        setNotice({ kind: 'error', message: 'أُرسلت طلبات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.' })
      } else if (response.status === 400 || response.status === 422 || result?.error === 'invalid') {
        setNotice({ kind: 'error', message: invalidMessage })
      } else {
        showEmailFallback()
      }
    } catch {
      showEmailFallback()
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  return (
    <section ref={sectionRef} id="contact" className="contact-section" tabIndex={-1} aria-labelledby="contact-heading">
      <div className="contact-section__shell" data-native-scroll>
        <div className="contact-section__layout">
          <div className="contact-section__content">
            <p className="contact-section__eyebrow"><span aria-hidden="true" />{content.eyebrow}</p>
            <h2 id="contact-heading">{content.heading}</h2>
            <p className="contact-section__intro">{content.intro}</p>

            <form className="contact-section__form" aria-label={copy.label}
              onChange={() => { if (notice) setNotice(null) }} onSubmit={submitRequest}>
              <div className="contact-section__fields">
                <div className="contact-section__field">
                  <label htmlFor={fieldId + '-name'}>{copy.nameLabel} <span aria-hidden="true">*</span></label>
                  <input id={fieldId + '-name'} name="name" autoComplete="name" required maxLength={120} disabled={sending} placeholder={copy.namePlaceholder} />
                </div>
                <div className="contact-section__field">
                  <label htmlFor={fieldId + '-contact'}>{copy.contactLabel} <span aria-hidden="true">*</span></label>
                  <input id={fieldId + '-contact'} name="contact" autoComplete="email" dir="auto" required maxLength={254} disabled={sending}
                    placeholder={copy.contactPlaceholder}
                    onInput={(event) => event.currentTarget.setCustomValidity('')} />
                </div>
                <div className="contact-section__field contact-section__field--full contact-section__field--select">
                  <label htmlFor={fieldId + '-service'}>{copy.serviceLabel} <span aria-hidden="true">*</span></label>
                  <select id={fieldId + '-service'} name="service" defaultValue="" required disabled={sending}>
                    <option value="" disabled>{copy.servicePlaceholder}</option>
                    {services.map((service) => <option key={service} value={service}>{service}</option>)}
                    <option value={copy.completeProject}>{copy.completeProject}</option>
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
                <div className="contact-section__field contact-section__field--full">
                  <label htmlFor={fieldId + '-brief'}>{copy.briefLabel} <span aria-hidden="true">*</span></label>
                  <textarea id={fieldId + '-brief'} name="brief" rows={4} required maxLength={4000} disabled={sending}
                    placeholder={copy.briefPlaceholder} />
                </div>
              </div>
              <div hidden>
                <label htmlFor={fieldId + '-website'}>الموقع الإلكتروني</label>
                <input id={fieldId + '-website'} name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <p className="contact-section__required">{copy.required}</p>
              <div className="contact-section__actions">
                <button className="contact-section__submit" type="submit" disabled={sending}><span>{sending ? sendingMessage : copy.submit}</span><ArrowLeft aria-hidden="true" /></button>
                <a className="contact-section__direct" href={secondaryHref}
                  target={hasWhatsApp ? '_blank' : undefined} rel={hasWhatsApp ? 'noopener noreferrer' : undefined}>
                  {hasWhatsApp ? <MessageCircle aria-hidden="true" /> : <Mail aria-hidden="true" />}
                  <span>{hasWhatsApp ? copy.viaWhatsapp : copy.viaEmail}</span>
                </a>
              </div>
              <div role="status" aria-atomic="true">
                {sending && <span className="contact-section__sr-only">{sendingMessage}</span>}
                {notice && <div className={`contact-section__notice contact-section__notice--${notice.kind}`}>
                  <p>{notice.message}</p>
                  {notice.draftHref && <a href={notice.draftHref}><Mail aria-hidden="true" /><span>{copy.openEmail}</span><ArrowLeft aria-hidden="true" /></a>}
                </div>}
              </div>
            </form>
          </div>
          <div className="contact-section__art" aria-hidden="true">
            <img className="contact-crystal-render" data-contact-piece="crystal-plane"
              src={siteImageUrl(artwork)}
              srcSet={artwork === defaultArt ? `${siteImageUrl(defaultArt)} 768w, ${siteImageUrl('contact/contact-crystal-1200.webp')} 1200w` : undefined}
              sizes="(max-width: 760px) 1px, (max-width: 1100px) 32vw, 460px"
              alt="" width="1200" height="1200" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
    </section>
  )
}
