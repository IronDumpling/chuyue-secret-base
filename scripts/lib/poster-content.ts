import type { Entry } from '../../lib/entry-types'
import type { Locale } from '../../lib/i18n/config'
import { getDictionary } from '../../lib/i18n'
import { getCategoryPath, hasRating } from '../../lib/blog-utils'
import { getCategoryDisplayName } from '../../lib/portfolio-utils'
import { parseDateParts } from '../../lib/date'
import { summarize } from '../../lib/seo'
import { clip } from './card'

// What a share poster shows, decided per kind of entry. Pure: no files, no rendering.

export type PosterLayout = 'project' | 'review' | 'art' | 'novel' | 'moment'

export interface SpecRow {
  label: string
  value: string
}

export interface PosterContent {
  layout: PosterLayout
  label: string // top-left category label, never with the score
  dateText: string // top-right date: '2025.12' / '2026.04.04' (review) / '2019' (novel)
  day?: string // moment only: the day of the month, the poster's big number
  title: string
  description?: string
  rating?: number // review only
  specRows: SpecRow[] // project only
  imagePath: string | null // site path of the first image
}

// A safety cap only: each layout clamps the title by lines, which wraps English by words.
export const TITLE_MAX = 60
// 0 means the layout shows no description.
export const DESC_MAX: Record<PosterLayout, number> = { project: 60, review: 40, art: 0, novel: 90, moment: 50 }
// Art posters let the picture speak, except a game's: its one line says how it plays.
const GAMEPLAY_MAX = 50

export function posterLayoutOf(entry: Entry): PosterLayout {
  if (entry.target.kind === 'blog') {
    return (entry as Entry<'blog'>).frontMatter.group === 'moments' ? 'moment' : 'review'
  }
  const { category, group } = (entry as Entry<'portfolio'>).frontMatter
  if (group === 'computing') return 'project'
  return category === 'novel' ? 'novel' : 'art'
}

const pad = (n: number) => String(n).padStart(2, '0')

function dateTexts(value: string, layout: PosterLayout): { dateText: string; day?: string } {
  const parts = parseDateParts(value)
  if (!parts) return { dateText: String(value ?? '') }
  const { year, month, day } = parts
  if (layout === 'novel') return { dateText: String(year) }
  if (layout === 'review') return { dateText: `${year}.${pad(month)}.${pad(day)}` }
  if (layout === 'moment') return { dateText: `${year}.${pad(month)}`, day: String(day) }
  return { dateText: `${year}.${pad(month)}` }
}

function specRows(entry: Entry<'portfolio'>, lang: Locale): SpecRow[] {
  const { posterSpec, posterLinks } = getDictionary(lang).share
  const { tags, github, demo, website } = entry.frontMatter
  const rows: SpecRow[] = []
  if (tags && tags.length > 0) rows.push({ label: posterSpec.tech, value: tags.slice(0, 3).join(' · ') })
  if (github.length > 0) rows.push({ label: posterSpec.code, value: posterLinks.github })
  if (demo.length > 0) rows.push({ label: posterSpec.live, value: posterLinks.demo })
  else if (website.length > 0) rows.push({ label: posterSpec.live, value: posterLinks.website })
  return rows
}

function label(entry: Entry, lang: Locale): string {
  if (entry.target.kind === 'blog') {
    return getCategoryPath((entry as Entry<'blog'>).frontMatter.category, lang).join(' · ')
  }
  const { category } = (entry as Entry<'portfolio'>).frontMatter
  return `${getDictionary(lang).nav.portfolio} · ${getCategoryDisplayName(category, lang)}`
}

export function posterContent(entry: Entry, lang: Locale): PosterContent {
  const layout = posterLayoutOf(entry)
  const { title, description, date, images } = entry.frontMatter
  const isGame = entry.target.kind === 'portfolio' && entry.target.category === 'games'
  const max = isGame ? GAMEPLAY_MAX : DESC_MAX[layout]
  const text = max > 0 ? clip(summarize(description, entry.content, max), max) : ''

  let rating: number | undefined
  if (entry.target.kind === 'blog') {
    const fm = (entry as Entry<'blog'>).frontMatter
    if (hasRating(fm.group) && typeof fm.rating === 'number') rating = fm.rating
  }

  return {
    layout,
    label: label(entry, lang),
    ...dateTexts(date, layout),
    title: clip(title, TITLE_MAX),
    description: text || undefined,
    rating,
    specRows: layout === 'project' ? specRows(entry as Entry<'portfolio'>, lang) : [],
    imagePath: images?.[0] ?? null,
  }
}
