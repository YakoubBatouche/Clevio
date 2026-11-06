import { useEffect, useId, useRef, useState } from 'react'
import { ArrowLeft, ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { contactEmail, services, siteContent, siteImageUrl } from '../content/site'

const defaultArt = 'contact/contact-crystal-768.webp'

export function ContactSection() {
  const { contact: content } = siteContent
  const { form: copy } = content
  const fieldId = useId()
  const sectionRef = useRef<HTMLElement>(null)
  const [draftHref, setDraftHref] = useState('')
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

  return (
    <section ref={sectionRef} id="contact" className="contact-section" tabIndex={-1} aria-labelledby="contact-heading">
      <div className="contact-section__shell" data-native-scroll>
        <div className="contact-section__layout">
          <div className="contact-section__content">
            <p className="contact-section__eyebrow"><span aria-hidden="true" />{content.eyebrow}</p>
            <h2 id="contact-heading">{content.heading}</h2>
            <p className="contact-section__intro">{content.intro}</p>

            <form className="contact-section__form" aria-label={copy.label}
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
                  contactInput.setCustomValidity(copy.validationMessage)
                  contactInput.reportValidity()
                  return
                }
                contactInput.setCustomValidity('')
                const body = [
                  copy.nameLabel + ': ' + String(data.get('name') || '').trim(),
                  copy.contactLabel + ': ' + contact,
                  copy.serviceLabel + ': ' + data.get('service'),
                  '',
                  copy.briefLabel + ':',
                  String(data.get('brief') || '').trim(),
                ].join('\n')
                setDraftHref('mailto:' + contactEmail + '?subject=' + encodeURIComponent(copy.subject) + '&body=' + encodeURIComponent(body))
              }}>
              <div className="contact-section__fields">
                <div className="contact-section__field">
                  <label htmlFor={fieldId + '-name'}>{copy.nameLabel} <span aria-hidden="true">*</span></label>
                  <input id={fieldId + '-name'} name="name" autoComplete="name" required maxLength={120} placeholder={copy.namePlaceholder} />
                </div>
                <div className="contact-section__field">
                  <label htmlFor={fieldId + '-contact'}>{copy.contactLabel} <span aria-hidden="true">*</span></label>
                  <input id={fieldId + '-contact'} name="contact" autoComplete="email" dir="auto" required maxLength={254}
                    placeholder={copy.contactPlaceholder}
                    onInput={(event) => event.currentTarget.setCustomValidity('')} />
                </div>
                <div className="contact-section__field contact-section__field--full contact-section__field--select">
                  <label htmlFor={fieldId + '-service'}>{copy.serviceLabel} <span aria-hidden="true">*</span></label>
                  <select id={fieldId + '-service'} name="service" defaultValue="" required>
                    <option value="" disabled>{copy.servicePlaceholder}</option>
                    {services.map((service) => <option key={service} value={service}>{service}</option>)}
                    <option value={copy.completeProject}>{copy.completeProject}</option>
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
                <div className="contact-section__field contact-section__field--full">
                  <label htmlFor={fieldId + '-brief'}>{copy.briefLabel} <span aria-hidden="true">*</span></label>
                  <textarea id={fieldId + '-brief'} name="brief" rows={4} required maxLength={4000}
                    placeholder={copy.briefPlaceholder} />
                </div>
              </div>
              <p className="contact-section__required">{copy.required}</p>
              <div className="contact-section__actions">
                <button className="contact-section__submit" type="submit"><span>{copy.submit}</span><ArrowLeft aria-hidden="true" /></button>
                <a className="contact-section__direct" href={secondaryHref}
                  target={hasWhatsApp ? '_blank' : undefined} rel={hasWhatsApp ? 'noopener noreferrer' : undefined}>
                  {hasWhatsApp ? <MessageCircle aria-hidden="true" /> : <Mail aria-hidden="true" />}
                  <span>{hasWhatsApp ? copy.viaWhatsapp : copy.viaEmail}</span>
                </a>
              </div>
              {draftHref && <div className="contact-section__draft" role="status">
                <p>{copy.draftMessage}</p>
                <a href={draftHref}><Mail aria-hidden="true" /><span>{copy.openEmail}</span><ArrowLeft aria-hidden="true" /></a>
              </div>}
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
