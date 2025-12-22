import 'server-only'

import { getAllMDXFiles, getMDXFile, MDXContent } from './mdx'
import { categoryMap } from './portfolio-utils'
import type { PortfolioProject } from './portfolio-types'

// Re-export type for convenience
export type { PortfolioProject }

export function getAllProjects(): PortfolioProject[] {
  const projects: PortfolioProject[] = []
  
  const categories: Array<keyof typeof categoryMap> = [
    'student-projects',
    'video-games',
    'applications',
    'habits',
  ]

  for (const category of categories) {
    const files = getAllMDXFiles(`portfolio/${category}`)
    for (const file of files) {
      projects.push({
        slug: file.slug,
        frontMatter: {
          ...file.frontMatter,
          category,
        } as PortfolioProject['frontMatter'],
        content: file.content,
      })
    }
  }

  return projects.sort((a, b) => 
    new Date(b.frontMatter.date || 0).getTime() - new Date(a.frontMatter.date || 0).getTime()
  )
}

export function getProjectBySlug(slug: string, category?: string): PortfolioProject | null {
  if (category) {
    const file = getMDXFile(`portfolio/${category}/${slug}.mdx`)
    if (!file) return null
    return {
      slug: file.slug,
      frontMatter: {
        ...file.frontMatter,
        category: category as PortfolioProject['frontMatter']['category'],
      } as PortfolioProject['frontMatter'],
      content: file.content,
    }
  }

  // Search all categories
  const categories: Array<keyof typeof categoryMap> = [
    'student-projects',
    'video-games',
    'applications',
    'habits',
  ]

  for (const cat of categories) {
    const file = getMDXFile(`portfolio/${cat}/${slug}.mdx`)
    if (file) {
      return {
        slug: file.slug,
        frontMatter: {
          ...file.frontMatter,
          category: cat,
        } as PortfolioProject['frontMatter'],
        content: file.content,
      }
    }
  }

  return null
}

export function getProjectsByCategory(
  category: PortfolioProject['frontMatter']['category']
): PortfolioProject[] {
  const files = getAllMDXFiles(`portfolio/${category}`)
  return files.map(file => ({
    slug: file.slug,
    frontMatter: {
      ...file.frontMatter,
      category,
    } as PortfolioProject['frontMatter'],
    content: file.content,
  })).sort((a, b) => 
    new Date(b.frontMatter.date || 0).getTime() - new Date(a.frontMatter.date || 0).getTime()
  )
}

// Re-export for convenience, but use the client-safe version
export { getCategoryDisplayName } from './portfolio-utils'

