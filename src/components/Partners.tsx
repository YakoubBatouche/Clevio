import { useRef, useState } from 'react'
import { ArrowUpLeft } from 'lucide-react'
import { useWorkCardTilt } from '../hooks/useWorkCardTilt'
import { portfolioCategories, portfolioContent } from '../content/portfolio'
import { siteContent, siteImageUrl } from '../content/site'
import { PortfolioSheet } from './PortfolioSheet'

function WorkShowcase() {
  const root = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<{ category: string; trigger: HTMLButtonElement } | null>(null)
  useWorkCardTilt(root)
  return <div ref={root} id="work" className="work-showcase" role="group" tabIndex={-1} aria-labelledby="work-heading">
    <div className="work-showcase__header">
      <div><p className="work-showcase__eyebrow">{portfolioContent.eyebrow}</p><h2 id="work-heading">{portfolioContent.title}</h2></div>
      <p className="work-showcase__intro">{portfolioContent.intro[0]}<br />{portfolioContent.intro[1]}</p>
    </div>
    <div className="work-showcase__grid">
      {portfolioCategories.map((category, index) => <article className="work-showcase__card" data-category={category.id} key={category.id}>
        <div className="work-showcase__visual" aria-hidden="true">
          <img src={siteImageUrl(category.cover)} alt="" loading="lazy" decoding="async" />
          <span className="work-showcase__glass" />
          <span className="work-showcase__orbit" />
        </div>
        <span className="work-showcase__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <h3 id={'work-card-' + category.id}>{category.title}</h3>
        <button type="button" className="work-showcase__trigger" aria-haspopup="dialog" aria-controls="portfolio-sheet"
          aria-labelledby={'work-card-' + category.id} onClick={(event) => setSelection({ category: category.id, trigger: event.currentTarget })}>
          <span className="work-showcase__open" aria-hidden="true"><ArrowUpLeft /></span>
        </button>
      </article>)}
    </div>
    {portfolioContent.note && <p className="work-showcase__note">{portfolioContent.note}</p>}
    <PortfolioSheet category={selection?.category ?? null} trigger={selection?.trigger} onClose={() => setSelection(null)} />
  </div>
}

export function Partners() {
  const { partners } = siteContent
  const logos = partners.logos?.filter((logo) => logo.image) ?? []
  return (
    <section id="partners" className="partners" aria-labelledby="work-heading">
      <div className="partners__inner">
        <WorkShowcase />
        {logos.length > 0 && <div className="partners__group" role="group" aria-labelledby="partners-heading">
          <div className="partners__header">
            <h2 id="partners-heading" className="partners__heading">{partners.heading}</h2>
            {partners.note && <p id="partners-note" className="partners__note">{partners.note}</p>}
          </div>
          <div className="partners__marks partners__marks--marquee">
            <div className="partners__track" style={{ width: `${Math.max(200, logos.length * 25)}%` }}>
              {[0, 1].map((copy) => <div className="partners__sequence" key={copy} aria-hidden={copy === 1 || undefined}
                style={{ gridTemplateColumns: `repeat(${logos.length}, minmax(0, 1fr))` }}>
                {logos.map((logo, index) => (
                  <span key={`${logo.image}-${index}`} className="partners__mark">
                    <img src={siteImageUrl(logo.image)} alt={copy === 0 ? logo.name : ''} loading="lazy" decoding="async" />
                  </span>
                ))}
              </div>)}
            </div>
          </div>
        </div>}
      </div>
    </section>
  )
}

