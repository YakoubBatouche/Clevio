import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/alexandria'
import '@fontsource-variable/cairo'
import { App } from './App'
import './styles/global.css'
import './styles/hero.css'
import './styles/dialog.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)

import './styles/selected-work.css'

import './styles/partners.css'

import './styles/contact-section.css'

import './styles/footer.css'

import './styles/section-transitions.css'
