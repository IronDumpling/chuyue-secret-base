import type { Metadata } from 'next'
import { absoluteUrl } from './site'
import { pagePath, shareImagePath, type ShareTarget } from './share-paths'
import { DEFAULT_LOCALE, LOCALES, type Locale } from './i18n/config'
import { getDictionary } from './i18n'

export function summarize(description: string | undefined, body: string, max = 160): string {
  if (description && description.trim()) return description.trim()

  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/<[^>]+>/g, ' ') // html / jsx tags
    .replace(/^#{1,6}\s*/gm, '') // heading markers
    .replace(/[*_`>~]/g, '') // emphasis, code, quote
    .replace(/\s+/g, ' ')
    .trim()

  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

export function feedPath(lang: Locale): string {
  return `/${lang}/feed.xml`
}

// The page's language feed, for `alternates.types`. A page's own `alternates` replaces the
// layout's rather than merging with it, so detail pages must repeat this.
export function rssAlternate(lang: Locale): Record<string, string> {
  return { 'application/rss+xml': absoluteUrl(feedPath(lang)) }
}

interface PageMetaInput {
  title: string
  description?: string
  body: string
  date?: string
  // Language the text is really written in. When it differs from the page language the
  // page is a fallback (e.g. English text served at /zh/...): its canonical then points
  // at the page in the real language, so the two are not treated as duplicates.
  contentLang?: Locale
  // Languages this post exists in natively. Defaults to all of them.
  languages?: Locale[]
}

export function buildPageMetadata(t: ShareTarget, lang: Locale, o: PageMetaInput): Metadata {
  const url = absoluteUrl(pagePath(t, lang))
  const canonical = absoluteUrl(pagePath(t, o.contentLang ?? lang))
  const image = absoluteUrl(shareImagePath(t, 'og', lang))
  const description = summarize(o.description, o.body)
  const published = o.date ? new Date(o.date) : undefined
  const publishedTime =
    published && !Number.isNaN(published.getTime()) ? published.toISOString() : undefined

  const available = o.languages ?? [...LOCALES]
  const languages: Record<string, string> = {}
  for (const l of LOCALES) {
    if (available.includes(l)) languages[l] = absoluteUrl(pagePath(t, l))
  }
  const defaultLang = available.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : available[0]
  if (defaultLang) languages['x-default'] = absoluteUrl(pagePath(t, defaultLang))

  return {
    title: o.title,
    description,
    alternates: { canonical, languages, types: rssAlternate(lang) },
    openGraph: {
      type: 'article',
      url,
      title: o.title,
      description,
      siteName: getDictionary(lang).meta.siteName,
      locale: getDictionary(lang).meta.ogLocale,
      images: [{ url: image, width: 1200, height: 630, alt: o.title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: o.title,
      description,
      images: [image],
    },
  }
}
