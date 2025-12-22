// Client-safe utility functions for blog
// These functions don't use fs and can be used in client components

export const categoryMap = {
  review: 'Review',
  casual: 'Casual',
} as const

export const subcategoryMap = {
  music: 'Music',
  movies: 'Movies',
  'video-games': 'Video Games',
  shows: 'Shows',
  books: 'Books',
} as const

export function getCategoryDisplayName(
  category: keyof typeof categoryMap
): string {
  return categoryMap[category] || category
}

export function getSubcategoryDisplayName(
  subcategory: keyof typeof subcategoryMap
): string {
  return subcategoryMap[subcategory] || subcategory
}

