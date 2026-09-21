import type { Locale } from './config'

// Text that is written once in each language next to the data it belongs to (skill
// names, experience entries). A plain string means "same in both languages": product
// names, course codes, school names.
export type Text = string | { en: string; zh: string }

export function pick(text: Text, locale: Locale): string {
  return typeof text === 'string' ? text : text[locale]
}
