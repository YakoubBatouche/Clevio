import siteData from './site.json'
import servicesContent from './services.json'

type SiteContent = Omit<typeof siteData, 'partners' | 'contact'> & {
  partners: {
    heading: string
    note?: string | null
    logos?: { name: string; image: string }[] | null
  }
  contact: Omit<typeof siteData.contact, 'email' | 'whatsapp'> & {
    email?: string | null
    whatsapp?: string | null
  }
}

export const siteContent: SiteContent = siteData

export type Panel = 'services' | 'work' | 'about' | 'contact'

export const navigation: { label: string; panel: Panel | null }[] = [
  { label: siteContent.navigation.home, panel: null },
  { label: siteContent.navigation.services, panel: 'services' },
  { label: siteContent.navigation.work, panel: 'work' },
  { label: siteContent.navigation.contact, panel: 'contact' },
  { label: siteContent.navigation.about, panel: 'about' },
]

export const services = servicesContent.items.map(({ title }) => title)

export const contactEmail = siteContent.contact.email?.trim() || import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'info@clevio.dz'

export function siteImageUrl(path: string) {
  return import.meta.env.BASE_URL + path.replace(/^(?:\.\/|\/+)/, '')
}

export const workAreas = [
  { title: 'هوية بصرية متكاملة', description: 'حضور مميز يعبّر عن جوهر العلامة.' },
  { title: 'تجارب رقمية تفاعلية', description: 'تجارب سهلة، مصممة لتترك أثرًا.' },
  { title: 'قصص تُروى بالصورة', description: 'محتوى يحوّل الرسالة إلى تجربة.' },
]
