import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'

import messages from 'src/i18n'

export type MessageLanguages = keyof typeof messages
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US']

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

const LOCALE_STORAGE_KEY = 'user-locale'
const SUPPORTED_LOCALES: MessageLanguages[] = ['en-US', 'ru-RU']
const DEFAULT_LOCALE: MessageLanguages = 'en-US'

/**
 * Detect user's preferred locale from browser settings
 */
function detectBrowserLocale(): MessageLanguages {
  // Check localStorage first
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale as MessageLanguages)) {
    return savedLocale as MessageLanguages
  }

  // Get browser languages
  const browserLanguages = navigator.languages || [navigator.language]

  for (const lang of browserLanguages) {
    // Exact match (e.g., 'en-US', 'ru-RU')
    if (SUPPORTED_LOCALES.includes(lang as MessageLanguages)) {
      return lang as MessageLanguages
    }

    // Partial match (e.g., 'en' -> 'en-US', 'ru' -> 'ru-RU')
    const langPrefix = lang.split('-')[0]
    const matchedLocale = SUPPORTED_LOCALES.find((locale) => locale.startsWith(langPrefix || ''))
    if (matchedLocale) {
      return matchedLocale
    }
  }

  return DEFAULT_LOCALE
}

// Create i18n instance with detected locale
const detectedLocale = detectBrowserLocale()

export const i18n = createI18n<{ message: MessageSchema }, MessageLanguages>({
  locale: detectedLocale,
  fallbackLocale: DEFAULT_LOCALE,
  legacy: false,
  messages,
})

/**
 * Set the application locale and save to localStorage
 */
export function setLocale(locale: MessageLanguages): void {
  // In Composition API mode (legacy: false), locale is a ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const localeRef = i18n.global.locale as any
  if (localeRef && typeof localeRef === 'object' && 'value' in localeRef) {
    localeRef.value = locale
  }
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}


export default defineBoot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})
