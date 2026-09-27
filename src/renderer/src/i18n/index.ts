import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// ── FR locales ──
import frCommon from './locales/fr/common.json'
import frAuth from './locales/fr/auth.json'
import frServer from './locales/fr/server.json'
import frConnections from './locales/fr/connections.json'
import frLayout from './locales/fr/layout.json'
import frAdmin from './locales/fr/admin.json'
import frReception from './locales/fr/reception.json'
import frMedical from './locales/fr/medical.json'
import frLaboratory from './locales/fr/laboratory.json'
import frPharmacy from './locales/fr/pharmacy.json'
import frBilling from './locales/fr/billing.json'
import frManagement from './locales/fr/management.json'

// ── EN locales ──
import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enServer from './locales/en/server.json'
import enConnections from './locales/en/connections.json'
import enLayout from './locales/en/layout.json'
import enAdmin from './locales/en/admin.json'
import enReception from './locales/en/reception.json'
import enMedical from './locales/en/medical.json'
import enLaboratory from './locales/en/laboratory.json'
import enPharmacy from './locales/en/pharmacy.json'
import enBilling from './locales/en/billing.json'
import enManagement from './locales/en/management.json'

// Persist language preference
const savedLang = localStorage.getItem('willo-lang') || 'fr'

i18n.use(initReactI18next).init({
  lng: savedLang,
  fallbackLng: 'fr',
  defaultNS: 'common',
  ns: ['common', 'auth', 'server', 'connections', 'layout', 'admin', 'reception', 'medical', 'laboratory', 'pharmacy', 'billing', 'management'],
  interpolation: {
    escapeValue: false // React already escapes by default
  },
  resources: {
    fr: {
      common: frCommon,
      auth: frAuth,
      server: frServer,
      connections: frConnections,
      layout: frLayout,
      admin: frAdmin,
      reception: frReception,
      medical: frMedical,
      laboratory: frLaboratory,
      pharmacy: frPharmacy,
      billing: frBilling,
      management: frManagement
    },
    en: {
      common: enCommon,
      auth: enAuth,
      server: enServer,
      connections: enConnections,
      layout: enLayout,
      admin: enAdmin,
      reception: enReception,
      medical: enMedical,
      laboratory: enLaboratory,
      pharmacy: enPharmacy,
      billing: enBilling,
      management: enManagement
    }
  }
})

/**
 * Change the active language and persist it.
 * Uses l10n for locale metadata (direction, charset, name).
 */
export function changeLanguage(lang: 'fr' | 'en'): void {
  i18n.changeLanguage(lang)
  localStorage.setItem('willo-lang', lang)
}

export type SupportedLang = 'fr' | 'en'

export const SUPPORTED_LANGUAGES: { code: SupportedLang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
]

export default i18n
