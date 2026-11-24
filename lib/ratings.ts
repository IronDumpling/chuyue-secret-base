// The rating scale: what each score from 1 to 10 is called and what it means, per review
// category. The text lives in content/blog/ratings.{en,zh}.yml, one file per language; each
// has a full default set and optional per-category overrides of any field. The axis itself
// (1-10, 5 as the midpoint) is fixed and not content.
//
// Client-safe: no fs. lib/ratings-source.ts reads the files.

import { getGroups, type TAXONOMY } from './taxonomy'

export type Score = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export const SCORES: Score[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

type ReviewsGroup = Extract<(typeof TAXONOMY)['blog']['groups'][number], { id: 'reviews' }>
export type ReviewCategory = ReviewsGroup['categories'][number]
export const REVIEW_CATEGORIES = [
  ...(getGroups('blog').find(group => group.id === 'reviews')?.categories ?? []),
] as ReviewCategory[]

export interface TierText {
  score: Score
  name: string
  definition: string
}

export interface CategoryOverride {
  category: ReviewCategory
  subtitle?: string
  tiers?: { score: Score; name?: string; definition?: string }[]
}

// One language file, as parsed from YAML. Lists, not numeric keys, so the CMS form can edit it.
export interface RatingsFile {
  subtitle: string
  tiers: TierText[]
  categories?: CategoryOverride[]
}

export interface RatingScale {
  subtitle: string
  tiers: Record<Score, { name: string; definition: string }>
}

export type RatingScales = Partial<Record<ReviewCategory, RatingScale>>

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function filled(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isScore(value: unknown): value is Score {
  return typeof value === 'number' && (SCORES as number[]).includes(value)
}

// Collects every problem and throws them together, so one build run shows all of them.
export function validateRatingsFile(raw: unknown, file: string): RatingsFile {
  const problems: string[] = []
  if (!isObject(raw)) throw new Error(`${file}: expected a mapping with subtitle and tiers`)

  if (!filled(raw.subtitle)) problems.push('subtitle is missing')

  const tiers = Array.isArray(raw.tiers) ? raw.tiers : []
  if (!Array.isArray(raw.tiers)) problems.push('tiers must be a list of ten tiers')
  const seen = new Set<number>()
  tiers.forEach((tier, index) => {
    const where = `tiers[${index}]`
    if (!isObject(tier)) return problems.push(`${where} is not a mapping`)
    if (!isScore(tier.score)) return problems.push(`${where}: score ${String(tier.score)} is not 1-10`)
    if (seen.has(tier.score)) problems.push(`tiers: duplicate score ${tier.score}`)
    seen.add(tier.score)
    if (!filled(tier.name)) problems.push(`tiers score ${tier.score}: name is missing`)
    if (!filled(tier.definition)) problems.push(`tiers score ${tier.score}: definition is missing`)
  })
  for (const score of SCORES) {
    if (!seen.has(score)) problems.push(`tiers: score ${score} is missing`)
  }

  if (raw.categories !== undefined && raw.categories !== null) {
    if (!Array.isArray(raw.categories)) {
      problems.push('categories must be a list')
    } else {
      const known = REVIEW_CATEGORIES as string[]
      const listed = new Set<string>()
      raw.categories.forEach((entry, index) => {
        const where = `categories[${index}]`
        if (!isObject(entry)) return problems.push(`${where} is not a mapping`)
        const id = String(entry.category)
        if (!known.includes(id)) {
          problems.push(`${where}: "${id}" is not a review category (known: ${known.join(', ')})`)
        } else if (listed.has(id)) {
          problems.push(`${where}: duplicate category ${id}`)
        }
        listed.add(id)
        if (entry.tiers === undefined || entry.tiers === null) return
        if (!Array.isArray(entry.tiers)) return problems.push(`${where}.tiers must be a list`)
        entry.tiers.forEach((tier, i) => {
          if (!isObject(tier) || !isScore(tier.score)) {
            problems.push(`${where}.tiers[${i}]: score ${isObject(tier) ? String(tier.score) : '?'} is not 1-10`)
          }
        })
      })
    }
  }

  if (problems.length > 0) {
    throw new Error(`${file} is not a valid rating scale:\n  - ${problems.join('\n  - ')}`)
  }
  return raw as unknown as RatingsFile
}

// Per field: the category's override if it has one, else the default.
export function resolveScale(file: RatingsFile, category: ReviewCategory): RatingScale {
  const override = file.categories?.find(entry => entry.category === category)
  const tiers = {} as RatingScale['tiers']
  for (const tier of file.tiers) {
    const own = override?.tiers?.find(t => t.score === tier.score)
    tiers[tier.score] = {
      name: filled(own?.name) ? own!.name! : tier.name,
      definition: filled(own?.definition) ? own!.definition! : tier.definition,
    }
  }
  return { subtitle: filled(override?.subtitle) ? override!.subtitle! : file.subtitle, tiers }
}

export function resolveScales(file: RatingsFile): RatingScales {
  return Object.fromEntries(REVIEW_CATEGORIES.map(category => [category, resolveScale(file, category)]))
}
