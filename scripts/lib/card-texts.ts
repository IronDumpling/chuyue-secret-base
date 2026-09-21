import type { ContentEntry } from './content-index'
import type { Locale } from '../../lib/i18n/config'
import { getDictionary } from '../../lib/i18n'

// The title comes from the post itself; the label above it comes from the dictionary of
// the language the card is made for.
export function entryTexts(entry: ContentEntry, lang: Locale): { title: string; badge: string } {
  const t = getDictionary(lang)

  if (entry.kind === 'blog') {
    const category = t.blog.categories[entry.category as keyof typeof t.blog.categories] ?? entry.category
    const type = t.blog.types[entry.type as keyof typeof t.blog.types] ?? entry.type
    const rating = entry.type === 'review' && entry.rating ? ` · ${entry.rating}/10` : ''
    return { title: entry.title, badge: `${category} · ${type}${rating}` }
  }

  const category = t.portfolio.categories[entry.category as keyof typeof t.portfolio.categories] ?? entry.category
  return { title: entry.title, badge: `${t.nav.portfolio} · ${category}` }
}

// Chinese needs a CJK font; the bundled Latin fallback would draw empty boxes.
export function containsCjk(text: string): boolean {
  return /[㐀-鿿]/.test(text)
}
