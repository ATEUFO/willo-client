export interface Theme {
  id: string
  nameFr: string
  nameEn: string
  type: 'light' | 'dark'
  category: 'medical' | 'neutral'
  preview: {
    primary: string
    dark: string
    bg: string
    card: string
  }
  variables: Record<string, string>
}

export const APP_THEMES: Theme[] = [
  {
    id: 'willo-emerald',
    nameFr: 'Vert Médical Willo (Défaut)',
    nameEn: 'Willo Medical Green (Default)',
    type: 'light',
    category: 'medical',
    preview: { primary: '#00C853', dark: '#0A192F', bg: '#F8F9FA', card: '#FFFFFF' },
    variables: {
      '--color-medical-primary': '#00C853',
      '--color-medical-hover': '#00B048',
      '--color-medical-subtle': '#DCFCE7',
      '--color-medical-dark': '#0A192F',
      '--color-medical-lightBg': '#F8F9FA',
      '--color-medical-light-bg': '#F8F9FA',
      '--color-medical-cardBg': '#FFFFFF',
      '--color-medical-card-bg': '#FFFFFF',
      '--color-medical-border': '#E2E8F0',
      '--color-medical-danger': '#EF4444',
      '--color-medical-warning': '#F59E0B'
    }
  },
  {
    id: 'vscode-dark',
    nameFr: 'VS Code Dark (Gris Neutre)',
    nameEn: 'VS Code Dark (Neutral Gray)',
    type: 'dark',
    category: 'neutral',
    preview: { primary: '#007ACC', dark: '#181818', bg: '#1E1E1E', card: '#252526' },
    variables: {
      '--color-medical-primary': '#007ACC',
      '--color-medical-hover': '#0062A3',
      '--color-medical-subtle': '#1E293B',
      '--color-medical-dark': '#181818',
      '--color-medical-lightBg': '#1E1E1E',
      '--color-medical-light-bg': '#1E1E1E',
      '--color-medical-cardBg': '#252526',
      '--color-medical-card-bg': '#252526',
      '--color-medical-border': '#3C3C3C',
      '--color-medical-danger': '#F44747',
      '--color-medical-warning': '#CCA700'
    }
  },
  {
    id: 'antigravity-slate',
    nameFr: 'Antigravity Slate (Anthracite)',
    nameEn: 'Antigravity Slate (Charcoal)',
    type: 'dark',
    category: 'neutral',
    preview: { primary: '#10B981', dark: '#0F172A', bg: '#1E293B', card: '#0F172A' },
    variables: {
      '--color-medical-primary': '#10B981',
      '--color-medical-hover': '#059669',
      '--color-medical-subtle': '#1E293B',
      '--color-medical-dark': '#0B1120',
      '--color-medical-lightBg': '#0F172A',
      '--color-medical-light-bg': '#0F172A',
      '--color-medical-cardBg': '#1E293B',
      '--color-medical-card-bg': '#1E293B',
      '--color-medical-border': '#334155',
      '--color-medical-danger': '#F87171',
      '--color-medical-warning': '#FBBF24'
    }
  },
  {
    id: 'willo-light',
    nameFr: 'Bleu Médical Épuré',
    nameEn: 'Clean Sky Blue',
    type: 'light',
    category: 'medical',
    preview: { primary: '#0284C7', dark: '#0C4A6E', bg: '#F0F9FF', card: '#FFFFFF' },
    variables: {
      '--color-medical-primary': '#0284C7',
      '--color-medical-hover': '#0369A1',
      '--color-medical-subtle': '#E0F2FE',
      '--color-medical-dark': '#0C4A6E',
      '--color-medical-lightBg': '#F0F9FF',
      '--color-medical-light-bg': '#F0F9FF',
      '--color-medical-cardBg': '#FFFFFF',
      '--color-medical-card-bg': '#FFFFFF',
      '--color-medical-border': '#BAE6FD',
      '--color-medical-danger': '#EF4444',
      '--color-medical-warning': '#F59E0B'
    }
  },
  {
    id: 'midnight-ocean',
    nameFr: 'Nuit Océan (Bleu Sourd)',
    nameEn: 'Midnight Ocean (Deep Navy)',
    type: 'dark',
    category: 'neutral',
    preview: { primary: '#38BDF8', dark: '#030712', bg: '#0B132B', card: '#1C2541' },
    variables: {
      '--color-medical-primary': '#38BDF8',
      '--color-medical-hover': '#0284C7',
      '--color-medical-subtle': '#172554',
      '--color-medical-dark': '#030712',
      '--color-medical-lightBg': '#0B132B',
      '--color-medical-light-bg': '#0B132B',
      '--color-medical-cardBg': '#1C2541',
      '--color-medical-card-bg': '#1C2541',
      '--color-medical-border': '#3A506B',
      '--color-medical-danger': '#F87171',
      '--color-medical-warning': '#FBBF24'
    }
  },
  {
    id: 'vscode-light',
    nameFr: 'VS Code Light (Gris Clair)',
    nameEn: 'VS Code Light (Light Gray)',
    type: 'light',
    category: 'neutral',
    preview: { primary: '#005FB8', dark: '#2C2C2C', bg: '#F3F3F3', card: '#FFFFFF' },
    variables: {
      '--color-medical-primary': '#005FB8',
      '--color-medical-hover': '#00458B',
      '--color-medical-subtle': '#EFF6FF',
      '--color-medical-dark': '#2C2C2C',
      '--color-medical-lightBg': '#F3F3F3',
      '--color-medical-light-bg': '#F3F3F3',
      '--color-medical-cardBg': '#FFFFFF',
      '--color-medical-card-bg': '#FFFFFF',
      '--color-medical-border': '#E5E5E5',
      '--color-medical-danger': '#E51400',
      '--color-medical-warning': '#E3A008'
    }
  },
  {
    id: 'nordic-frost',
    nameFr: 'Gris Nordique (Frost Mint)',
    nameEn: 'Nordic Frost (Mint Teal)',
    type: 'dark',
    category: 'neutral',
    preview: { primary: '#2DD4BF', dark: '#0F172A', bg: '#111827', card: '#1F2937' },
    variables: {
      '--color-medical-primary': '#2DD4BF',
      '--color-medical-hover': '#14B8A6',
      '--color-medical-subtle': '#134E4A',
      '--color-medical-dark': '#0F172A',
      '--color-medical-lightBg': '#111827',
      '--color-medical-light-bg': '#111827',
      '--color-medical-cardBg': '#1F2937',
      '--color-medical-card-bg': '#1F2937',
      '--color-medical-border': '#374151',
      '--color-medical-danger': '#F87171',
      '--color-medical-warning': '#FBBF24'
    }
  },
  {
    id: 'royal-indigo',
    nameFr: 'Indigo Médical & Améthyste',
    nameEn: 'Royal Indigo & Amethyst',
    type: 'light',
    category: 'medical',
    preview: { primary: '#6366F1', dark: '#1E1B4B', bg: '#F5F3FF', card: '#FFFFFF' },
    variables: {
      '--color-medical-primary': '#6366F1',
      '--color-medical-hover': '#4F46E5',
      '--color-medical-subtle': '#EEF2FF',
      '--color-medical-dark': '#1E1B4B',
      '--color-medical-lightBg': '#F5F3FF',
      '--color-medical-light-bg': '#F5F3FF',
      '--color-medical-cardBg': '#FFFFFF',
      '--color-medical-card-bg': '#FFFFFF',
      '--color-medical-border': '#E0E7FF',
      '--color-medical-danger': '#EF4444',
      '--color-medical-warning': '#F59E0B'
    }
  },
  {
    id: 'sunset-coral',
    nameFr: 'Ambre & Corail Médical',
    nameEn: 'Warm Coral & Amber',
    type: 'light',
    category: 'medical',
    preview: { primary: '#F97316', dark: '#431407', bg: '#FFF7ED', card: '#FFFFFF' },
    variables: {
      '--color-medical-primary': '#F97316',
      '--color-medical-hover': '#EA580C',
      '--color-medical-subtle': '#FFEDD5',
      '--color-medical-dark': '#431407',
      '--color-medical-lightBg': '#FFF7ED',
      '--color-medical-light-bg': '#FFF7ED',
      '--color-medical-cardBg': '#FFFFFF',
      '--color-medical-card-bg': '#FFFFFF',
      '--color-medical-border': '#FED7AA',
      '--color-medical-danger': '#EF4444',
      '--color-medical-warning': '#D97706'
    }
  },
  {
    id: 'monochrome-charcoal',
    nameFr: 'Gris Anthracite Minimaliste',
    nameEn: 'Monochrome Slate Minimal',
    type: 'light',
    category: 'neutral',
    preview: { primary: '#475569', dark: '#0F172A', bg: '#F8FAFC', card: '#FFFFFF' },
    variables: {
      '--color-medical-primary': '#475569',
      '--color-medical-hover': '#334155',
      '--color-medical-subtle': '#F1F5F9',
      '--color-medical-dark': '#0F172A',
      '--color-medical-lightBg': '#F8FAFC',
      '--color-medical-light-bg': '#F8FAFC',
      '--color-medical-cardBg': '#FFFFFF',
      '--color-medical-card-bg': '#FFFFFF',
      '--color-medical-border': '#CBD5E1',
      '--color-medical-danger': '#EF4444',
      '--color-medical-warning': '#F59E0B'
    }
  }
]

export const STORAGE_THEME_KEY = 'willo-theme'

/**
 * Apply a theme by updating DOM root attributes and CSS variables.
 */
export function applyTheme(themeId: string): Theme {
  const selectedTheme = APP_THEMES.find((t) => t.id === themeId) || APP_THEMES[0]
  const root = document.documentElement

  // Set data-theme attribute on <html> element
  root.setAttribute('data-theme', selectedTheme.id)
  root.setAttribute('data-theme-type', selectedTheme.type)

  // Apply CSS custom properties to root
  Object.entries(selectedTheme.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Persist choice in localStorage
  localStorage.setItem(STORAGE_THEME_KEY, selectedTheme.id)
  return selectedTheme
}

/**
 * Get active theme ID from localStorage or return default.
 */
export function getSavedThemeId(): string {
  return localStorage.getItem(STORAGE_THEME_KEY) || 'willo-emerald'
}
