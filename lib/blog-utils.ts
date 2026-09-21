// Client-safe utility functions for blog
// These functions don't use fs and can be used in client components

import type { Locale } from './i18n/config'
import { getDictionary } from './i18n'
import { getGroupOf, type BlogCategory, type BlogGroup } from './taxonomy'

export function getCategoryDisplayName(category: BlogCategory, locale: Locale): string {
  return getDictionary(locale).blog.categories[category] || category
}

export function getGroupDisplayName(group: BlogGroup, locale: Locale): string {
  return getDictionary(locale).blog.groups[group] || group
}

// 'Reviews · Films'. A category that is the only one in its group ('Moments') is shown once.
export function getCategoryPath(category: BlogCategory, locale: Locale): string[] {
  const group = getGroupOf('blog', category)
  const groupName = getGroupDisplayName(group, locale)
  const categoryName = getCategoryDisplayName(category, locale)
  return groupName === categoryName ? [categoryName] : [groupName, categoryName]
}

// Only reviews carry a score.
export function hasRating(group: BlogGroup): boolean {
  return group === 'reviews'
}

// The line under a post's title in the list: its description, or else the start of the text
// without headings and markdown marks.
export function getExcerpt(description: string | undefined, content: string, max = 150): string {
  if (description && description.trim()) return description.trim()
  const text = content
    .replace(/^#{1,6}\s.*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}
