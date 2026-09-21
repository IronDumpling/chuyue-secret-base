import 'server-only'

import { getLocalizedMDXFile, getLocalizedMDXFiles, type LocalizedMDXContent } from './mdx'
import { getCategories, getGroupOf, isValidCategory, type PortfolioCategory } from './taxonomy'
import type { Locale } from './i18n/config'
import type { PortfolioProject } from './portfolio-types'

// Re-export type for convenience
export type { PortfolioProject }

// Category comes from the folder and group from the taxonomy, not from the frontmatter.
function toProject(file: LocalizedMDXContent, category: PortfolioCategory): PortfolioProject {
  return {
    slug: file.slug,
    frontMatter: {
      ...file.frontMatter,
      category,
      group: getGroupOf('portfolio', category),
    } as PortfolioProject['frontMatter'],
    content: file.content,
    lang: file.lang,
    isFallback: file.isFallback,
  }
}

function newestFirst(projects: PortfolioProject[]): PortfolioProject[] {
  return projects.sort(
    (a, b) => new Date(b.frontMatter.date || 0).getTime() - new Date(a.frontMatter.date || 0).getTime()
  )
}

export function getProjectsByCategory(category: PortfolioCategory, lang: Locale): PortfolioProject[] {
  const files = getLocalizedMDXFiles(`portfolio/${category}`, lang)
  return newestFirst(files.map(file => toProject(file, category)))
}

export function getAllProjects(lang: Locale): PortfolioProject[] {
  return newestFirst(getCategories('portfolio').flatMap(category => getProjectsByCategory(category, lang)))
}

export function getProjectBySlug(
  slug: string,
  category: string | undefined,
  lang: Locale
): PortfolioProject | null {
  if (category) {
    if (!isValidCategory('portfolio', category)) return null
    const file = getLocalizedMDXFile(`portfolio/${category}`, slug, lang)
    return file ? toProject(file, category) : null
  }

  for (const cat of getCategories('portfolio')) {
    const file = getLocalizedMDXFile(`portfolio/${cat}`, slug, lang)
    if (file) return toProject(file, cat)
  }

  return null
}

// Re-export for convenience, but use the client-safe version
export { getCategoryDisplayName } from './portfolio-utils'
