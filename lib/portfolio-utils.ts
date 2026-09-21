// Client-safe utility functions for portfolio
// These functions don't use fs and can be used in client components

import type { Locale } from './i18n/config'
import { getDictionary } from './i18n'
import type { PortfolioCategory, PortfolioGroup } from './taxonomy'

export type ProjectContext = 'course' | 'research' | 'work' | 'personal'

export function getCategoryDisplayName(category: PortfolioCategory, locale: Locale): string {
  return getDictionary(locale).portfolio.categories[category] || category
}

export function getGroupDisplayName(group: PortfolioGroup, locale: Locale): string {
  return getDictionary(locale).portfolio.groups[group] || group
}

export function getContextDisplayName(context: ProjectContext, locale: Locale): string {
  return getDictionary(locale).portfolio.contexts[context] || context
}
