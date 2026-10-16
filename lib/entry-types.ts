// Client-safe type definitions for entries (Posts and Projects).
// These types can be imported in client components.

import type { Locale } from './i18n/config'
import type { BlogCategory, BlogGroup, PortfolioCategory, PortfolioGroup, Section } from './taxonomy'
import type { Link } from './frontmatter'
import type { ShareTarget } from './share-paths'
import type { ProjectContext } from './portfolio-utils'

// Re-exported for existing callers that import Link from here.
export type { Link }

export interface BlogFrontMatter {
  title: string
  category: BlogCategory // from the folder
  group: BlogGroup // from lib/taxonomy.ts
  date: string
  rating?: number // Only used for reviews
  images?: string[]
  description?: string
  github: Link[] // normalized by lib/entries.ts from string | object | list
  demo: Link[]
  website: Link[]
}

export interface PortfolioFrontMatter {
  title: string
  category: PortfolioCategory // from the folder
  group: PortfolioGroup // from lib/taxonomy.ts
  date: string
  context?: ProjectContext // where it was made; not a category
  tags?: string[]
  images?: string[]
  description?: string
  github: Link[] // normalized by lib/entries.ts from string | object | list
  demo: Link[]
  website: Link[]
}

interface FrontMatterOf {
  blog: BlogFrontMatter
  portfolio: PortfolioFrontMatter
}

// One Post or Project in one language.
export interface Entry<S extends Section = Section> {
  slug: string
  frontMatter: FrontMatterOf[S]
  content: string
  lang: Locale // language the text is in
  isFallback: boolean // true when it is not the language the page asked for
  target: ShareTarget // section, category and slug: everything a URL is built from
  nativeLanguages: Locale[] // languages this entry is really written in
}

export type BlogPost = Entry<'blog'>
export type PortfolioProject = Entry<'portfolio'>
