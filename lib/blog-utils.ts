// Client-safe utility functions for blog
// These functions don't use fs and can be used in client components

import type { Locale } from './i18n/config'
import { getDictionary } from './i18n'

export const categoryMap = {
  photography: 'Photography',
  illustration: 'Illustration',
  'films-shows': 'Films & Shows',
  music: 'Music',
  'video-games': 'Video Games',
  books: 'Books',
} as const

export const typeMap = {
  review: 'Review',
  casual: 'Casual',
} as const

export function getCategoryDisplayName(
  category: keyof typeof categoryMap,
  locale: Locale
): string {
  return getDictionary(locale).blog.categories[category] || category
}

export function getTypeDisplayName(
  type: keyof typeof typeMap,
  locale: Locale
): string {
  return getDictionary(locale).blog.types[type] || type
}

