export type ShareKind = 'blog' | 'portfolio'

export interface ShareTarget {
  kind: ShareKind
  category: string
  type?: string // blog only
  slug: string
}

export const SITE_OG_PATH = '/share/og/site.jpg'

function segments(t: ShareTarget): string[] {
  return t.kind === 'blog' ? [t.kind, t.category, t.type ?? '', t.slug] : [t.kind, t.category, t.slug]
}

export function pagePath(t: ShareTarget): string {
  return `/${segments(t).join('/')}/`
}

export function shareImagePath(t: ShareTarget, variant: 'og' | 'poster'): string {
  return `/share/${variant}/${segments(t).join('/')}.jpg`
}
