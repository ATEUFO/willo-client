import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
// @ts-ignore – l10n has no TS typings
import L10n from 'l10n'
import { changeLanguage, SUPPORTED_LANGUAGES, type SupportedLang } from './index'

/**
 * useLocale — wraps react-i18next and enriches with l10n metadata.
 *
 * l10n provides: language name, locale code, text direction (ltr/rtl), charset, fallback.
 * react-i18next provides: t() translation function, language toggle.
 */
export function useLocale() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language as SupportedLang

  // l10n locale metadata (direction, charset, language name)
  const l10nInstance = new L10n(currentLang === 'fr' ? 'fra' : 'eng')
  const localeInfo = l10nInstance.info(currentLang === 'fr' ? 'fr_FR' : 'en_US') as {
    language: string
    locale: string
    fallback: string
    charset: string
    direction: 'ltr' | 'rtl'
  }

  const toggle = useCallback(() => {
    const next: SupportedLang = currentLang === 'fr' ? 'en' : 'fr'
    changeLanguage(next)
  }, [currentLang])

  const setLang = useCallback((lang: SupportedLang) => {
    changeLanguage(lang)
  }, [])

  return {
    /** Current active language code: 'fr' | 'en' */
    lang: currentLang,
    /** Uppercase label: 'FR' | 'EN' */
    langLabel: currentLang.toUpperCase() as 'FR' | 'EN',
    /** Toggle between FR and EN */
    toggle,
    /** Set a specific language */
    setLang,
    /** All supported languages */
    languages: SUPPORTED_LANGUAGES,
    /** l10n metadata: direction (ltr/rtl), charset, language name */
    localeInfo,
    /** Text direction from l10n */
    direction: localeInfo?.direction ?? 'ltr',
    /** Charset from l10n */
    charset: localeInfo?.charset ?? 'utf-8',
    /** Human-readable language name from l10n */
    languageName: localeInfo?.language ?? currentLang
  }
}
