import { useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ContentDialog } from './components/ContentDialog'
import type { Panel } from './content/site'

export function App() {
  const [panel, setPanel] = useState<Panel | null>(null)
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#hero-heading">انتقل إلى المحتوى</a>
      <Header onNavigate={setPanel} />
      <Hero onNavigate={setPanel} />
      <ContentDialog panel={panel} onClose={() => setPanel(null)} onNavigate={setPanel} />
    </MotionConfig>
  )
}
