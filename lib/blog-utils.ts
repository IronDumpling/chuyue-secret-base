// Client-safe utility functions for blog
// These functions don't use fs and can be used in client components

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
  category: keyof typeof categoryMap
): string {
  return categoryMap[category] || category
}

export function getTypeDisplayName(
  type: keyof typeof typeMap
): string {
  return typeMap[type] || type
}

