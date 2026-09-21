export const LOCALES = ['en', 'zh'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

// Where the visitor's language choice is remembered (read by the root redirect).
export const LOCALE_STORAGE_KEY = 'chuyue-locale'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}
