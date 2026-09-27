import { useState, useEffect } from 'react'
import { APP_THEMES, applyTheme, getSavedThemeId } from './themes'

export function useTheme() {
  const [activeThemeId, setActiveThemeId] = useState<string>(getSavedThemeId)

  useEffect(() => {
    applyTheme(activeThemeId)
  }, [activeThemeId])

  const setTheme = (themeId: string) => {
    setActiveThemeId(themeId)
    applyTheme(themeId)
  }

  const currentTheme = APP_THEMES.find((t) => t.id === activeThemeId) || APP_THEMES[0]

  return {
    themeId: activeThemeId,
    currentTheme,
    setTheme,
    themes: APP_THEMES
  }
}
