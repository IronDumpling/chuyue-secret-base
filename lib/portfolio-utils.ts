// Client-safe utility functions for portfolio
// These functions don't use fs and can be used in client components

export const categoryMap = {
  'student-projects': 'Student Projects',
  'video-games': 'Video Games',
  'applications': 'Applications',
  'habits': 'Habits',
} as const

export function getCategoryDisplayName(
  category: keyof typeof categoryMap
): string {
  return categoryMap[category] || category
}

