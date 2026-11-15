import portfolioMetadata from './portfolio.json'
import audiovisualMedia from './portfolio/audiovisual-media.json'
import digitalMarketing from './portfolio/digital-marketing.json'
import logos from './portfolio/logos.json'
import print from './portfolio/print.json'
import webApp from './portfolio/web-app.json'
import { siteImageUrl } from './site'

type PortfolioFilter = {
  id: string
  label: string
  description: string
}

export type PortfolioItem = {
  id?: string | null
  filterId?: string | null
  title: string
  image?: string | null
  alt?: string | null
  video?: string | null
  position?: string | null
}

export type PortfolioCategory = {
  id: string
  title: string
  description: string
  cover: string
  filters: readonly PortfolioFilter[]
  items: readonly PortfolioItem[]
}

type PortfolioFile = Omit<PortfolioCategory, 'items' | 'filters'> & {
  filters?: PortfolioCategory['filters'] | null
  items?: PortfolioCategory['items'] | null
}

const portfolioFiles: readonly PortfolioFile[] = [print, logos, digitalMarketing, webApp, audiovisualMedia]

export const portfolioContent: {
  eyebrow: string
  title: string
  intro: readonly string[]
  note?: string | null
  sheetNote?: string | null
  emptyMessage: string
  allFilterLabel: string
  closeLabel: string
  gripLabel: string
  filtersLabel: string
  galleryLabel: string
  previewLabel: string
  closeImageLabel: string
} = portfolioMetadata

export const portfolioCategories: readonly PortfolioCategory[] = portfolioFiles.map((category) => ({
  ...category,
  filters: category.filters ?? [],
  items: (category.items ?? []).filter((item) => item.image?.trim() || item.video?.trim()),
}))

export function portfolioVideoUrl(path: string | null | undefined) {
  const video = path?.trim()
  if (!video) return undefined
  return /^https:\/\//i.test(video) ? video : siteImageUrl(video)
}
