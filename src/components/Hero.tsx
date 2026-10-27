import { useRef } from 'react'
import { heroStaticLayers } from '../content/hero-layers'
import { CRYSTAL_SURFACE_MASK_URL } from '../content/crystal-geometry'
import { HeroCrystalDefinitions, HeroOrbit } from './HeroOrbit'
import { useHeroFloatInteraction } from '../hooks/useHeroFloatInteraction'
import { useHeroCrystalIdle } from '../hooks/useHeroCrystalIdle'
import { ActionButton } from './ActionButton'
import type { Panel } from '../content/site'

const heroImageSizes = '(max-width: 979px) min(187vw, 1210px), (max-aspect-ratio: 16/9) 178svh, 100vw'
const heroSources = (name: string, type = 'png') => [['2k', 1920], ['4k', 3840], ['8k', 7680]].map(([size, width]) => import.meta.env.BASE_URL + 'hero-layers/hires/' + name + '-' + size + '.' + type + ' ' + width + 'w').join(', ')

export function Hero({ onNavigate }: { onNavigate: (panel: Panel) => void }) {
  const root = useRef<HTMLElement>(null)
  useHeroFloatInteraction(root)
  useHeroCrystalIdle(root)

  function sceneImage(part: typeof heroStaticLayers[number], glow = false) {
    if (glow) return <div key="crystal-glow" className="hero__part hero__crystal-glow" data-hero-glow=""
      style={{ left: part.x + '%', top: part.y + '%', width: part.width + '%', height: part.height + '%' }} />
    const surface = part.name === 'main-c'
    const mask = surface ? CRYSTAL_SURFACE_MASK_URL : undefined
    return <img key={part.name}
      className={'hero__part' + (surface ? ' hero__crystal-surface' : '')}
      data-hero-piece={part.name}
      src={import.meta.env.BASE_URL + 'hero-layers/separated/' + part.name + '-2k.png'}
      srcSet={part.sources.map((source) => import.meta.env.BASE_URL + 'hero-layers/separated/' + part.name + '-' + source.size + '.png ' + source.width + 'w').join(', ')}
      sizes={'(max-width: 979px) min(' + (187 * part.width / 100) + 'vw, ' + (1210 * part.width / 100) + 'px), (max-aspect-ratio: 16/9) ' + (178 * part.width / 100) + 'svh, ' + part.width + 'vw'}
      style={{ left: part.x + '%', top: part.y + '%', width: part.width + '%', height: part.height + '%', maskImage: mask, WebkitMaskImage: mask }}
      alt="" width={part.sources[2].width} height={part.sources[2].height} decoding="async" fetchPriority={surface ? 'high' : 'auto'} />
  }


  return (
      <section id="home" className="hero" tabIndex={-1} ref={root} aria-labelledby="hero-heading">
        <HeroCrystalDefinitions />
        <div className="hero__artwork" aria-hidden="true">
          <div className="hero__registered-frame">
          <img key="background" className="hero__background" src={import.meta.env.BASE_URL + 'hero-layers/separated/background-2k.webp'} srcSet={[1920, 3840, 7680].map((width, index) => import.meta.env.BASE_URL + 'hero-layers/separated/background-' + ['2k', '4k', '8k'][index] + '.webp ' + width + 'w').join(', ')} sizes={heroImageSizes} alt="" width="7680" height="4320" fetchPriority="high" decoding="async" />
          <div key="scene" className="hero__scene" data-hero-scene="separated">
            {sceneImage(heroStaticLayers.find((part) => part.name === 'main-c')!, true)}
            <HeroOrbit part="back" />
            {heroStaticLayers.filter((part) => part.name === 'stage' || part.name === 'main-c').map((part) => sceneImage(part))}
            <HeroOrbit part="front" />
          </div>
          <div key="blue-bubble" className="hero__float-track hero__float-track--blue" data-hero-parallax="blue">
            <div className="hero__float-intro">
            <img className="hero__float hero__float--blue" data-hero-object="blue-bubble" src={import.meta.env.BASE_URL + 'hero-layers/hires/bubble-blue-2k.png'} srcSet={heroSources('bubble-blue')} sizes={heroImageSizes} alt="" width="7680" height="4320" decoding="async" />
            </div>
          </div>
          <div key="cube" className="hero__float-track hero__float-track--cube" data-hero-parallax="cube">
            <div className="hero__float-intro">
            <img className="hero__float hero__float--cube" data-hero-object="cube" src={import.meta.env.BASE_URL + 'hero-layers/hires/floating-cube-2k.png'} srcSet={heroSources('floating-cube')} sizes={heroImageSizes} alt="" width="7680" height="4320" decoding="async" />
            </div>
          </div>
          <div key="lime-bubble" className="hero__float-track hero__float-track--lime" data-hero-parallax="lime">
            <div className="hero__float-intro">
            <img className="hero__float hero__float--lime" data-hero-object="lime-bubble" src={import.meta.env.BASE_URL + 'hero-layers/hires/bubble-lime-2k.png'} srcSet={heroSources('bubble-lime')} sizes={heroImageSizes} alt="" width="7680" height="4320" decoding="async" />
            </div>
          </div>
          </div>
        </div>
        <div className="hero__content">
          <h1 id="hero-heading" className="hero__heading" aria-label="أفكار خارج الإطار">
            <span className="hero__line-mask"><span className="hero__line">أفكار</span></span>
            <span className="hero__line-mask"><span className="hero__line">خارج</span></span>
            <span className="hero__line-mask"><span className="hero__line">الإطار</span></span>
          </h1>
          <p className="hero__description">
            <span>نحوّل أفكارك إلى هويات وتجارب رقمية مؤثرة،</span>
            <span>من الفكرة إلى النمو، نرافقك في كل خطوة.</span>
          </p>
          <div className="hero__actions">
            <ActionButton onClick={() => onNavigate('contact')}>لنبدأ مشروعك</ActionButton>
            <ActionButton variant="secondary" onClick={() => onNavigate('services')}>اكتشف خدماتنا</ActionButton>
          </div>
        </div>
        <a className="hero__scroll-indicator" href="#services" aria-label="انتقل إلى خدماتنا">
          <svg viewBox="0 0 32 60" aria-hidden="true" fill="none">
            <rect x="5" y="2" width="22" height="36" rx="11" stroke="currentColor" strokeWidth="1.4" />
            <path className="hero__scroll-wheel" d="M16 10v7" stroke="#d5ff48" strokeWidth="2.3" strokeLinecap="round" />
            <path className="hero__scroll-chevron" d="m11 46 5 5 5-5m-10 7 5 5 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>
  )
}
