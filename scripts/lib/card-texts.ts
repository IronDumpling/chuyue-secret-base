import type { Entry } from '../../lib/entry-types'
import type { Locale } from '../../lib/i18n/config'
import { getDictionary } from '../../lib/i18n'
import { getCategoryPath, hasRating } from '../../lib/blog-utils'
import { getCategoryDisplayName } from '../../lib/portfolio-utils'

// The title comes from the post itself; the label above it comes from the dictionary of
// the language the card is made for.
export function entryTexts(entry: Entry, lang: Locale): { title: string; badge: string } {
  const { title } = entry.frontMatter

  if (entry.target.kind === 'blog') {
    const { category, group, rating } = (entry as Entry<'blog'>).frontMatter
    const path = getCategoryPath(category, lang).join(' · ')
    const score = hasRating(group) && rating ? ` · ${rating}/10` : ''
    return { title, badge: `${path}${score}` }
  }

  const { category } = (entry as Entry<'portfolio'>).frontMatter
  return { title, badge: `${getDictionary(lang).nav.portfolio} · ${getCategoryDisplayName(category, lang)}` }
}

// Chinese needs a CJK font; the bundled Latin fallback would draw empty boxes.
export function containsCjk(text: string): boolean {
  return /[㐀-鿿]/.test(text)
}
