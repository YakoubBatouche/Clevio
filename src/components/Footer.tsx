import { ArrowLeft, Mail } from 'lucide-react'
import { Brand } from './Brand'
import type { Panel } from '../content/site'

const workCategories = ['الهوية البصرية', 'التصميم والإبداع', 'التسويق الرقمي', 'المواقع والتطبيقات']

export function Footer({ onNavigate }: { onNavigate: (panel: Panel) => void }) {
  const email = import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'info@clevio.dz'

  return (
    <footer className="site-footer" aria-label="تذييل الموقع">
      <div className="site-footer__inner" data-native-scroll>
        <div className="site-footer__grid">
          <div className="site-footer__column site-footer__links">
            <h2>روابط سريعة</h2>
            <nav aria-label="روابط سريعة">
              <ul>
                <li><a href="#home">الرئيسية</a></li>
                <li><a href="#services">خدماتنا</a></li>
                <li><a href="#work">أعمالنا</a></li>
                <li><button type="button" onClick={() => onNavigate('about')}>من نحن</button></li>
                <li><a href="#contact">تواصل معنا</a></li>
              </ul>
            </nav>
          </div>
          <div className="site-footer__column site-footer__contact">
            <h2>تواصل معنا</h2>
            <p className="site-footer__contact-copy">لنصنع شيئًا يستحق أن يُرى.</p>
            <a className="site-footer__email" href={'mailto:' + email}>
              <Mail aria-hidden="true" strokeWidth={1.6} />
              <bdi dir="ltr">{email}</bdi>
            </a>
            <button type="button" className="site-footer__contact-cta" onClick={() => onNavigate('contact')}>
              <span>لنبدأ الحديث</span><ArrowLeft aria-hidden="true" strokeWidth={1.7} />
            </button>
          </div>
          <div className="site-footer__column site-footer__work">
            <h2>خدماتنا</h2>
            <ul>
              {workCategories.map((category) => <li key={category}><button type="button" onClick={() => onNavigate('services')}>{category}</button></li>)}
            </ul>
          </div>
          <div className="site-footer__column site-footer__brand">
            <Brand />
            <p>شريكك الإبداعي في عالم التصميم والتسويق والتكنولوجيا.</p>
          </div>
        </div>
        <div className="site-footer__bottom">
          <p>© 2026 <bdi dir="ltr">Clevio</bdi>. جميع الحقوق محفوظة.</p>
          <p>التصميم · التسويق · التكنولوجيا</p>
        </div>
      </div>
    </footer>
  )
}
