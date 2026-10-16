import { MetadataRoute } from 'next'
import { getEntries } from '@/lib/content'
import { absoluteUrl } from '@/lib/site'
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n/config'
import { localePath } from '@/lib/i18n/paths'
import { pagePath } from '@/lib/share-paths'

type Entry = MetadataRoute.Sitemap[number]

// hreflang links between the language versions of one page. x-default is English.
function languageLinks(urlFor: (lang: Locale) => string, available: Locale[]): Record<string, string> {
  const links: Record<string, string> = {}
  for (const lang of available) links[lang] = urlFor(lang)
  const fallback = available.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : available[0]
  if (fallback) links['x-default'] = urlFor(fallback)
  return links
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = []

  // The interface is translated, so these exist natively in every language.
  for (const route of ['/', '/portfolio', '/blog', '/contact']) {
    const urlFor = (lang: Locale) => absoluteUrl(localePath(lang, route))
    for (const lang of LOCALES) {
      entries.push({
        url: urlFor(lang),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '/' ? 1 : 0.8,
        alternates: { languages: languageLinks(urlFor, [...LOCALES]) },
      })
    }
  }

  // Posts and projects: only the languages they are really written in. A page served as
  // the other language's fallback is not listed (its canonical points at the real one).
  const sections = [
    { section: 'blog', priority: 0.6, freq: 'weekly' },
    { section: 'portfolio', priority: 0.7, freq: 'monthly' },
  ] as const

  for (const { section, priority, freq } of sections) {
    for (const entry of getEntries(section, DEFAULT_LOCALE)) {
      const urlFor = (lang: Locale) => absoluteUrl(pagePath(entry.target, lang))
      for (const lang of entry.nativeLanguages) {
        entries.push({
          url: urlFor(lang),
          lastModified: new Date(entry.frontMatter.date),
          changeFrequency: freq,
          priority,
          alternates: { languages: languageLinks(urlFor, entry.nativeLanguages) },
        })
      }
    }
  }

  return entries
}
