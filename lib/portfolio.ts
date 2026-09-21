import 'server-only'

import { getLocalizedMDXFile, getLocalizedMDXFiles, type LocalizedMDXContent } from './mdx'
import { categoryMap } from './portfolio-utils'
import { DEFAULT_LOCALE, type Locale } from './i18n/config'
import type { PortfolioProject } from './portfolio-types'

// Re-export type for convenience
export type { PortfolioProject }

type Category = PortfolioProject['frontMatter']['category']

const categories = Object.keys(categoryMap) as Category[]

// The category comes from the folder, not from the frontmatter.
function toProject(file: LocalizedMDXContent, category: string): PortfolioProject {
  return {
    slug: file.slug,
    frontMatter: {
      ...file.frontMatter,
      category,
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

export function getProjectsByCategory(category: Category, lang: Locale = DEFAULT_LOCALE): PortfolioProject[] {
  const files = getLocalizedMDXFiles(`portfolio/${category}`, lang)
  return newestFirst(files.map(file => toProject(file, category)))
}

export function getAllProjects(lang: Locale = DEFAULT_LOCALE): PortfolioProject[] {
  return newestFirst(categories.flatMap(category => getProjectsByCategory(category, lang)))
}

export function getProjectBySlug(
  slug: string,
  category?: string,
  lang: Locale = DEFAULT_LOCALE
): PortfolioProject | null {
  if (category) {
    const file = getLocalizedMDXFile(`portfolio/${category}`, slug, lang)
    return file ? toProject(file, category) : null
  }

  for (const cat of categories) {
    const file = getLocalizedMDXFile(`portfolio/${cat}`, slug, lang)
    if (file) return toProject(file, cat)
  }

  return null
}

// Re-export for convenience, but use the client-safe version
export { getCategoryDisplayName } from './portfolio-utils'
