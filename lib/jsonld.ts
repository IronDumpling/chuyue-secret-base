import { absoluteUrl } from './site'
import { pagePath, shareImagePath, type ShareTarget } from './share-paths'
import { summarize } from './seo'
import type { Locale } from './i18n/config'

// schema.org type of the thing a review category is about.
const REVIEWED_TYPE: Record<string, string> = {
  films: 'Movie',
  shows: 'TVSeries',
  music: 'MusicAlbum',
  'video-games': 'VideoGame',
  books: 'Book',
}

// "Her Review" -> "Her", "《她》影评" -> "她". Anything else (e.g. "Ang Lee Movie Marathon")
// is not a single-work review, so it gets no Review markup rather than a guessed name.
export function reviewedName(title: string): string | null {
  const zh = title.match(/^《(.+)》\s*(影评|剧评|乐评|游戏评测|书评|评测)$/)
  if (zh) return zh[1]
  const en = title.match(/^(.+?)\s+Review$/i)
  return en ? en[1] : null
}

interface JsonLdInput {
  title: string
  description?: string
  body: string
  date?: string
  lang: Locale // language the text is written in
  rating?: number // out of 10, reviews only
  authorName: string
}

export function buildJsonLd(target: ShareTarget, pageLang: Locale, o: JsonLdInput): Record<string, any> {
  const url = absoluteUrl(pagePath(target, pageLang))
  const published = o.date ? new Date(o.date) : undefined
  const datePublished = published && !Number.isNaN(published.getTime()) ? published.toISOString() : undefined
  const isBlog = target.kind === 'blog'

  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': isBlog ? 'BlogPosting' : 'CreativeWork',
    ...(isBlog ? { headline: o.title } : { name: o.title }),
    description: summarize(o.description, o.body),
    image: absoluteUrl(shareImagePath(target, 'og', pageLang)),
    inLanguage: o.lang,
    mainEntityOfPage: url,
    url,
    ...(datePublished ? { datePublished } : {}),
    author: { '@type': 'Person', name: o.authorName },
  }

  const itemType = isBlog ? REVIEWED_TYPE[target.category] : undefined
  const itemName = reviewedName(o.title)
  if (itemType && itemName && typeof o.rating === 'number') {
    data['@type'] = ['BlogPosting', 'Review']
    data.itemReviewed = { '@type': itemType, name: itemName }
    data.reviewRating = { '@type': 'Rating', ratingValue: o.rating, bestRating: 10, worstRating: 0 }
  }

  return data
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
