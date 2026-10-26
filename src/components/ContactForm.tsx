import { useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'

export function ContactForm() {
  const [draft, setDraft] = useState('')
  const email = import.meta.env.VITE_CONTACT_EMAIL || 'info@clevio.dz'

  return (
    <form className="contact-form" onSubmit={(event) => {
      event.preventDefault()
      const data = new FormData(event.currentTarget)
      const body = 'الاسم: ' + data.get('name') + '\nالبريد: ' + data.get('email') + '\n\n' + data.get('brief')
      setDraft('mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('مشروع جديد — Clevio') + '&body=' + encodeURIComponent(body))
    }}>
      <p className="panel-copy">أخبرنا عن فكرتك، ولنعطها المساحة التي تستحقها.</p>
      <div className="contact-form__row">
        <label>الاسم الكامل<input name="name" autoComplete="name" required maxLength={120} /></label>
        <label>البريد الإلكتروني<input name="email" type="email" dir="ltr" autoComplete="email" required maxLength={254} /></label>
      </div>
      <label>عن مشروعك<textarea name="brief" rows={4} required maxLength={4000} /></label>
      <button type="submit" className="action action--primary"><span>جهّز رسالة المشروع</span><ArrowLeft aria-hidden="true" /></button>
      {draft && <div className="contact-form__draft" role="status">
        <p>رسالتك جاهزة للمراجعة والإرسال من تطبيق البريد.</p>
        <a className="draft-link" href={draft}><Mail aria-hidden="true" />فتح تطبيق البريد</a>
      </div>}
    </form>
  )
}
