import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/alexandria'
import { App } from './App'
import { prepareIntro } from './intro/bootstrap'
import './styles/intro.css'
import './styles/intro-transition.css'
import './styles/intro-hero.css'
import './styles/global.css'
import './styles/hero.css'
import './styles/dialog.css'

prepareIntro()

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)

import './styles/services.css'
import './styles/section-paging.css'

import './styles/partners.css'

import './styles/contact-section.css'

import './styles/footer.css'

import './styles/section-transitions.css'

import './styles/hero-seam-fix.css'

import './styles/layout-spacing.css'

import './styles/header-glass.css'

import './styles/work-hover.css'

import './styles/hero-scroll-indicator.css'

import './styles/work-scene-fit.css'
