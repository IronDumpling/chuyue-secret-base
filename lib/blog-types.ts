// Client-safe type definitions for blog
// These types can be imported in client components

import type { Locale } from './i18n/config'
import type { BlogCategory, BlogGroup } from './taxonomy'

export interface BlogPost {
  slug: string
  frontMatter: {
    title: string
    category: BlogCategory // from the folder
    group: BlogGroup // from lib/taxonomy.ts
    date: string
    tags?: string[]
    rating?: number  // Only used for reviews
    images?: string[]
    description?: string
    website?: string | { url: string; label: string }  // External link support
  }
  content: string
  lang?: Locale // language the text is in
  isFallback?: boolean // true when it is not the language the page asked for
}
