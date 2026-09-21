// Client-safe utility functions for portfolio
// These functions don't use fs and can be used in client components

import type { Locale } from './i18n/config'
import { getDictionary } from './i18n'

export const categoryMap = {
  'student-projects': 'Student Projects',
  'video-games': 'Video Games',
  'applications': 'Applications',
} as const

export function getCategoryDisplayName(
  category: keyof typeof categoryMap,
  locale: Locale
): string {
  return getDictionary(locale).portfolio.categories[category] || category
}

