// Client-safe utility functions for portfolio
// These functions don't use fs and can be used in client components

export const categoryMap = {
  'student-projects': 'Student Project',
  'work-projects': 'Work Project',
  'video-games': 'Video Games',
  'applications': 'Applications',
} as const

export function getCategoryDisplayName(
  category: keyof typeof categoryMap
): string {
  return categoryMap[category] || category
}

