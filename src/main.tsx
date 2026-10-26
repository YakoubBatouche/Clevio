import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/alexandria/arabic.css'
import '@fontsource-variable/alexandria/latin.css'
import '@fontsource-variable/cairo/arabic.css'
import '@fontsource-variable/cairo/latin.css'
import { App } from './App'
import './styles/global.css'
import './styles/hero.css'
import './styles/dialog.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
