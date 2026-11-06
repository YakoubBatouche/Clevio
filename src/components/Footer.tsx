import { ArrowLeft, Mail } from 'lucide-react'
import { Brand } from './Brand'
import { contactEmail, siteContent, type Panel } from '../content/site'

export function Footer({ onNavigate }: { onNavigate: (panel: Panel) => void }) {
  const { brand, footer, navigation } = siteContent

  return (
    <footer className="site-footer" aria-label="تذييل الموقع">
      <div className="site-footer__inner" data-native-scroll>
        <div className="site-footer__grid">
          <div className="site-footer__column site-footer__links">
            <h2>{footer.linksHeading}</h2>
            <nav aria-label={footer.linksHeading}>
              <ul>
                <li><a href="#home">{navigation.home}</a></li>
                <li><a href="#services">{navigation.services}</a></li>
                <li><a href="#work">{navigation.work}</a></li>
                <li><button type="button" onClick={() => onNavigate('about')}>{navigation.about}</button></li>
                <li><a href="#contact">{navigation.contact}</a></li>
              </ul>
            </nav>
          </div>
          <div className="site-footer__column site-footer__contact">
            <h2>{navigation.contact}</h2>
            <p className="site-footer__contact-copy">{footer.contactCopy}</p>
            <a className="site-footer__email" href={'mailto:' + contactEmail}>
              <Mail aria-hidden="true" strokeWidth={1.6} />
              <bdi dir="ltr">{contactEmail}</bdi>
            </a>
            <button type="button" className="site-footer__contact-cta" onClick={() => onNavigate('contact')}>
              <span>{footer.contactAction}</span><ArrowLeft aria-hidden="true" strokeWidth={1.7} />
            </button>
          </div>
          <div className="site-footer__column site-footer__work">
            <h2>{footer.servicesHeading}</h2>
            <ul>
              {footer.serviceLinks?.map((category, index) => <li key={index}><button type="button" onClick={() => onNavigate('services')}>{category}</button></li>)}
            </ul>
          </div>
          <div className="site-footer__column site-footer__brand">
            <Brand />
            <p>{footer.brandCopy}</p>
          </div>
        </div>
        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} <bdi dir="auto">{brand.name}</bdi>. {footer.copyright}</p>
          <p>{footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
