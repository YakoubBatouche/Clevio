import { siteContent, siteImageUrl } from '../content/site'

const defaultLogo = 'images/clevio-logo.svg'

export function Brand({ vector = false }: { vector?: boolean }) {
  const logo = siteContent.brand.logo?.replace(/^\/+/, '') || defaultLogo
  return (
    <a className="brand" href="#home" aria-label={`${siteContent.brand.name} — ${siteContent.navigation.home}`}>
      {vector || logo !== defaultLogo ? (
        <img src={siteImageUrl(logo)} width="372.19" height="107.26" alt="" />
      ) : (
        <svg viewBox="84 39 176 48" aria-hidden="true" focusable="false">
          <image href={import.meta.env.BASE_URL + 'images/hero-approved.webp'} width="1672" height="941" />
        </svg>
      )}
    </a>
  )
}
