import type { Locale } from './i18n/config'

export type ShareKind = 'blog' | 'portfolio'

export interface ShareTarget {
  kind: ShareKind
  category: string
  slug: string
}

function segments(t: ShareTarget): string[] {
  return [t.kind, t.category, t.slug]
}

// Both languages have every page: a post without a Chinese version is still served at
// /zh/... (in English, with a notice), so this works for any target and language.
export function pagePath(t: ShareTarget, lang: Locale): string {
  return `/${lang}/${segments(t).join('/')}/`
}

// The page without its language, so both language versions of a post share one like count.
export function likeId(t: ShareTarget): string {
  return segments(t).join('/')
}

export function shareImagePath(t: ShareTarget, variant: 'og' | 'poster', lang: Locale): string {
  return `/share/${variant}/${lang}/${segments(t).join('/')}.jpg`
}

export function siteOgPath(lang: Locale): string {
  return `/share/og/${lang}/site.jpg`
}
