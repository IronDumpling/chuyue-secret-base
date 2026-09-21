// Client-safe type definitions for portfolio
// These types can be imported in client components

import type { Locale } from './i18n/config'
import type { PortfolioCategory, PortfolioGroup } from './taxonomy'

export interface Link {
  url: string
  label: string
}

export interface PortfolioProject {
  slug: string
  frontMatter: {
    title: string
    category: PortfolioCategory // from the folder
    group: PortfolioGroup // from lib/taxonomy.ts
    date: string
    context?: 'course' | 'research' | 'work' | 'personal' // where it was made; not a category
    tags?: string[]
    github?: string | Link[] // Support single link, multiple links, or labeled links
    demo?: string | Link[] // Support single link, multiple links, or labeled links
    website?: string | Link[] // Support single link, multiple links, or labeled links
    images?: string[]
    description?: string
  }
  content: string
  lang?: Locale // language the text is in
  isFallback?: boolean // true when it is not the language the page asked for
}
