import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './i18n/config'

// `her-review.zh.mdx` -> { slug: 'her-review', lang: 'zh' }. A file without a language
// suffix has lang null and counts as English (see pickLocalized), so content written
// before the site was bilingual needs no renaming.
export function parseContentFilename(name: string): { slug: string; lang: Locale | null } | null {
  const match = name.match(/^(.+?)\.(mdx?)$/)
  if (!match) return null

  const stem = match[1]
  const dot = stem.lastIndexOf('.')
  if (dot > 0) {
    const suffix = stem.slice(dot + 1)
    if (isLocale(suffix)) return { slug: stem.slice(0, dot), lang: suffix }
  }
  return { slug: stem, lang: null }
}

export interface LangFile<T> {
  slug: string
  lang: Locale | null
  value: T
}

export interface Localized<T> {
  slug: string
  lang: Locale // the language the text is actually in
  isFallback: boolean // true when that is not the language that was asked for
  value: T
}

// One entry per slug: the file in the requested language, else the one in the other.
export function pickLocalized<T>(files: LangFile<T>[], wanted: Locale): Localized<T>[] {
  const bySlug = new Map<string, Map<Locale, { explicit: boolean; value: T }>>()

  for (const file of files) {
    const lang = file.lang ?? DEFAULT_LOCALE
    const explicit = file.lang !== null
    const versions = bySlug.get(file.slug) ?? new Map()
    const existing = versions.get(lang)
    // An explicit `.en.mdx` beats an unmarked `.mdx` for the same slug.
    if (!existing || (explicit && !existing.explicit)) versions.set(lang, { explicit, value: file.value })
    bySlug.set(file.slug, versions)
  }

  const result: Localized<T>[] = []
  for (const [slug, versions] of bySlug) {
    const exact = versions.get(wanted)
    if (exact) {
      result.push({ slug, lang: wanted, isFallback: false, value: exact.value })
      continue
    }
    const other = LOCALES.find(l => l !== wanted && versions.has(l))
    if (other) result.push({ slug, lang: other, isFallback: true, value: versions.get(other)!.value })
  }
  return result
}
