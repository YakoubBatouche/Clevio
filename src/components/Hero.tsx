import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/animation'
import { ActionButton } from './ActionButton'
import type { Panel } from '../content/site'

export function Hero({ onNavigate }: { onNavigate: (panel: Panel) => void }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero__line', { y: 22, opacity: 0, stagger: 0.09, duration: 0.75, ease: 'power3.out' })
      gsap.from('.hero__description, .hero__actions', { y: 14, opacity: 0, stagger: 0.12, duration: 0.65, delay: 0.25, ease: 'power2.out' })
    })
    return () => media.revert()
  }, { scope: root })

  return (
    <main>
      <section id="home" className="hero" ref={root} aria-labelledby="hero-heading">
        <picture className="hero__artwork" aria-hidden="true">
          <source srcSet={import.meta.env.BASE_URL + 'images/hero-scene-1000.webp 1000w, ' + import.meta.env.BASE_URL + 'images/hero-scene.webp 1672w'} sizes="100vw" type="image/webp" />
          <img src={import.meta.env.BASE_URL + 'images/hero-scene.webp'} alt="" width="1672" height="941" fetchPriority="high" decoding="async" />
        </picture>
        <div className="hero__content">
          <h1 id="hero-heading" className="hero__heading" aria-label="أفكار خارج الإطار">
            <span className="hero__line">أفكار</span>
            <span className="hero__line">خارج</span>
            <span className="hero__line">الإطار</span>
          </h1>
          <p className="hero__description">
            <span>نحوّل أفكارك إلى هويات وتجارب رقمية مؤثرة،</span>
            <span>من الفكرة إلى النمو، نرافقك في كل خطوة.</span>
          </p>
          <div className="hero__actions">
            <ActionButton onClick={() => onNavigate('contact')}>لنبدأ مشروعك</ActionButton>
            <ActionButton variant="secondary" onClick={() => onNavigate('work')}>اكتشف أعمالنا</ActionButton>
          </div>
        </div>
      </section>
    </main>
  )
}
