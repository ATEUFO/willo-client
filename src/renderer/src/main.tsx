import './assets/main.css'
import './i18n' // ← initialize i18next before any component renders
import { applyTheme, getSavedThemeId } from './config/themes'

// Apply initial saved theme on application boot
applyTheme(getSavedThemeId())

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
