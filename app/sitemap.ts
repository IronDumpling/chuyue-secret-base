import { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/portfolio'
import { getAllPosts } from '@/lib/blog'
import { absoluteUrl } from '@/lib/site'
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n/config'
import { localePath } from '@/lib/i18n/paths'
import { pagePath, type ShareTarget } from '@/lib/share-paths'

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
  const pages = new Map<
    string,
    { target: ShareTarget; date: string; priority: number; freq: Entry['changeFrequency']; langs: Locale[] }
  >()

  for (const lang of LOCALES) {
    for (const post of getAllPosts(lang)) {
      if (post.isFallback) continue
      const target: ShareTarget = { kind: 'blog', category: post.frontMatter.category, slug: post.slug }
      const key = pagePath(target, 'en')
      const page = pages.get(key) ?? { target, date: post.frontMatter.date, priority: 0.6, freq: 'weekly' as const, langs: [] }
      page.langs.push(lang)
      pages.set(key, page)
    }
    for (const project of getAllProjects(lang)) {
      if (project.isFallback) continue
      const target: ShareTarget = { kind: 'portfolio', category: project.frontMatter.category, slug: project.slug }
      const key = pagePath(target, 'en')
      const page = pages.get(key) ?? { target, date: project.frontMatter.date, priority: 0.7, freq: 'monthly' as const, langs: [] }
      page.langs.push(lang)
      pages.set(key, page)
    }
  }

  for (const { target, date, priority, freq, langs } of pages.values()) {
    const urlFor = (lang: Locale) => absoluteUrl(pagePath(target, lang))
    for (const lang of langs) {
      entries.push({
        url: urlFor(lang),
        lastModified: new Date(date),
        changeFrequency: freq,
        priority,
        alternates: { languages: languageLinks(urlFor, langs) },
      })
    }
  }

  return entries
}
