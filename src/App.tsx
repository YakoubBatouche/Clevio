import { useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { IntroPreloader } from './components/IntroPreloader'
import { Services } from './components/Services'
import { useSectionPaging } from './hooks/useSectionPaging'
import { Partners } from './components/Partners'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import { ContentDialog } from './components/ContentDialog'
import type { Panel } from './content/site'
import { scrollToSection, useSectionNavigation } from './hooks/useSectionNavigation'
import { useSectionTransitions } from './hooks/useSectionTransitions'

export function App() {
  useSectionNavigation()
  useSectionPaging()
  useSectionTransitions()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [destination, setDestination] = useState<{ id: 'services' | 'work' | 'contact' } | null>(null)

  useEffect(() => {
    if (!destination) return
    scrollToSection(destination.id)
  }, [destination])

  function navigate(next: Panel) {
    if (next === 'services' || next === 'work' || next === 'contact') {
      setPanel(null)
      setDestination({ id: next })
    } else {
      setPanel(next)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <IntroPreloader />
      <a className="skip-link" href="#hero-heading">انتقل إلى المحتوى</a>
      <Header onNavigate={navigate} />
      <main id="main-content">
        <Hero onNavigate={navigate} />
        <Services onStartProject={() => navigate('contact')} />
        <Partners />
        <ContactSection />
      </main>
      <Footer onNavigate={navigate} />
      <ContentDialog panel={panel} onClose={() => setPanel(null)} onNavigate={navigate} />
    </MotionConfig>
  )
}
