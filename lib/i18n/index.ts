import { en, type Dictionary } from './dictionaries/en'
import { zh } from './dictionaries/zh'
import type { Locale } from './config'

export type { Dictionary }

const dictionaries: Record<Locale, Dictionary> = { en, zh }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
