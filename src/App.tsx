import { useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { IntroPreloader } from './components/IntroPreloader'
import { SelectedWork } from './components/SelectedWork'
import { Partners } from './components/Partners'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import { ContentDialog } from './components/ContentDialog'
import type { Panel } from './content/site'
import { scrollToSection, useSectionNavigation } from './hooks/useSectionNavigation'
import { useSectionTransitions } from './hooks/useSectionTransitions'

export function App() {
  useSectionNavigation()
  useSectionTransitions()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [destination, setDestination] = useState<{ id: 'work' | 'contact' } | null>(null)

  useEffect(() => {
    if (!destination) return
    scrollToSection(destination.id)
  }, [destination])

  function navigate(next: Panel) {
    if (next === 'work' || next === 'contact') {
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
        <SelectedWork onStartProject={() => navigate('contact')} />
        <Partners />
        <ContactSection />
      </main>
      <Footer onNavigate={navigate} />
      <ContentDialog panel={panel} onClose={() => setPanel(null)} onNavigate={navigate} />
    </MotionConfig>
  )
}
