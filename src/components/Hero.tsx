import { useRef } from 'react'
import { heroStaticLayers } from '../content/hero-layers'
import { useHeroFloatInteraction } from '../hooks/useHeroFloatInteraction'
import { gsap, useGSAP } from '../lib/animation'
import { ActionButton } from './ActionButton'
import type { Panel } from '../content/site'

const heroImageSizes = '(max-width: 979px) min(187vw, 1210px), (max-aspect-ratio: 16/9) 178svh, 100vw'
const heroSources = (name: string, type = 'png') => [['2k', 1920], ['4k', 3840], ['8k', 7680]].map(([size, width]) => import.meta.env.BASE_URL + 'hero-layers/hires/' + name + '-' + size + '.' + type + ' ' + width + 'w').join(', ')

export function Hero({ onNavigate }: { onNavigate: (panel: Panel) => void }) {
  const root = useRef<HTMLElement>(null)
  useHeroFloatInteraction(root)

  useGSAP(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('skipintro')) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero__line', { y: 22, opacity: 0, stagger: 0.09, duration: 0.75, ease: 'power3.out' })
      gsap.from('.hero__description, .hero__actions', { y: 14, opacity: 0, stagger: 0.12, duration: 0.65, delay: 0.25, ease: 'power2.out' })
    })
    return () => media.revert()
  }, { scope: root })

  return (
      <section id="home" className="hero" tabIndex={-1} ref={root} aria-labelledby="hero-heading">
        <div className="hero__artwork" aria-hidden="true">
          <img key="background" className="hero__background" src={import.meta.env.BASE_URL + 'hero-layers/separated/background-2k.webp'} srcSet={[1920, 3840, 7680].map((width, index) => import.meta.env.BASE_URL + 'hero-layers/separated/background-' + ['2k', '4k', '8k'][index] + '.webp ' + width + 'w').join(', ')} sizes={heroImageSizes} alt="" width="7680" height="4320" fetchPriority="high" decoding="async" />
          <div key="scene" className="hero__scene" data-hero-scene="separated">
            {heroStaticLayers.map((part) => <img key={part.name} className="hero__part" data-hero-piece={part.name}
              src={import.meta.env.BASE_URL + 'hero-layers/separated/' + part.name + '-2k.png'}
              srcSet={part.sources.map((source) => import.meta.env.BASE_URL + 'hero-layers/separated/' + part.name + '-' + source.size + '.png ' + source.width + 'w').join(', ')}
              sizes={'(max-width: 979px) min(' + (187 * part.width / 100) + 'vw, ' + (1210 * part.width / 100) + 'px), (max-aspect-ratio: 16/9) ' + (178 * part.width / 100) + 'svh, ' + part.width + 'vw'}
              style={{ left: part.x + '%', top: part.y + '%', width: part.width + '%', height: part.height + '%' }}
              alt="" width={part.sources[2].width} height={part.sources[2].height} decoding="async" fetchPriority={part.name === 'main-c' ? 'high' : 'auto'} />)}
          </div>
          <div key="blue-bubble" className="hero__float-track hero__float-track--blue" data-hero-parallax="blue">
            <img className="hero__float hero__float--blue" data-hero-object="blue-bubble" src={import.meta.env.BASE_URL + 'hero-layers/hires/bubble-blue-2k.png'} srcSet={heroSources('bubble-blue')} sizes={heroImageSizes} alt="" width="7680" height="4320" decoding="async" />
          </div>
          <div key="cube" className="hero__float-track hero__float-track--cube" data-hero-parallax="cube">
            <img className="hero__float hero__float--cube" data-hero-object="cube" src={import.meta.env.BASE_URL + 'hero-layers/hires/floating-cube-2k.png'} srcSet={heroSources('floating-cube')} sizes={heroImageSizes} alt="" width="7680" height="4320" decoding="async" />
          </div>
          <div key="lime-bubble" className="hero__float-track hero__float-track--lime" data-hero-parallax="lime">
            <img className="hero__float hero__float--lime" data-hero-object="lime-bubble" src={import.meta.env.BASE_URL + 'hero-layers/hires/bubble-lime-2k.png'} srcSet={heroSources('bubble-lime')} sizes={heroImageSizes} alt="" width="7680" height="4320" decoding="async" />
          </div>
        </div>
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
  )
}
