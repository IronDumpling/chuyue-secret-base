import type { Metadata } from 'next'
import { absoluteUrl, SITE_NAME } from './site'
import { pagePath, shareImagePath, type ShareTarget } from './share-paths'

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

interface PageMetaInput {
  title: string
  description?: string
  body: string
  date?: string
}

export function buildPageMetadata(t: ShareTarget, o: PageMetaInput): Metadata {
  const url = absoluteUrl(pagePath(t))
  const image = absoluteUrl(shareImagePath(t, 'og'))
  const description = summarize(o.description, o.body)
  const published = o.date ? new Date(o.date) : undefined
  const publishedTime =
    published && !Number.isNaN(published.getTime()) ? published.toISOString() : undefined

  return {
    title: o.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: o.title,
      description,
      siteName: SITE_NAME,
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
