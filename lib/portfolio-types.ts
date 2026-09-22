// Client-safe type definitions for portfolio
// These types can be imported in client components

import type { Locale } from './i18n/config'
import type { PortfolioCategory, PortfolioGroup } from './taxonomy'
import type { Link } from './frontmatter'

// Re-exported for existing callers that import Link from here.
export type { Link }

export interface PortfolioProject {
  slug: string
  frontMatter: {
    title: string
    category: PortfolioCategory // from the folder
    group: PortfolioGroup // from lib/taxonomy.ts
    date: string
    context?: 'course' | 'research' | 'work' | 'personal' // where it was made; not a category
    tags?: string[]
    github?: Link[] // normalized by lib/portfolio.ts from string | object | list
    demo?: Link[] // normalized by lib/portfolio.ts from string | object | list
    website?: Link[] // normalized by lib/portfolio.ts from string | object | list
    images?: string[]
    description?: string
  }
  content: string
  lang?: Locale // language the text is in
  isFallback?: boolean // true when it is not the language the page asked for
}
