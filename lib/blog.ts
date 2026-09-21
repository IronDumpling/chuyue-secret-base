import 'server-only'

import { getLocalizedMDXFile, getLocalizedMDXFiles, type LocalizedMDXContent } from './mdx'
import { categoryMap, typeMap } from './blog-utils'
import { DEFAULT_LOCALE, type Locale } from './i18n/config'
import type { BlogPost } from './blog-types'

// Re-export type for convenience
export type { BlogPost }

type Category = BlogPost['frontMatter']['category']
type PostType = BlogPost['frontMatter']['type']

const categories = Object.keys(categoryMap) as Category[]
const types = Object.keys(typeMap) as PostType[]

// Category and type come from the folder, not from the frontmatter.
function toPost(file: LocalizedMDXContent, category: string, type: string): BlogPost {
  return {
    slug: file.slug,
    frontMatter: {
      ...file.frontMatter,
      category,
      type,
    } as BlogPost['frontMatter'],
    content: file.content,
    lang: file.lang,
    isFallback: file.isFallback,
  }
}

function newestFirst(posts: BlogPost[]): BlogPost[] {
  return posts.sort(
    (a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
  )
}

export function getPostsByCategoryAndType(
  category: Category,
  type: PostType,
  lang: Locale = DEFAULT_LOCALE
): BlogPost[] {
  const files = getLocalizedMDXFiles(`blog/${category}/${type}`, lang)
  return newestFirst(files.map(file => toPost(file, category, type)))
}

export function getAllPosts(lang: Locale = DEFAULT_LOCALE): BlogPost[] {
  return newestFirst(
    categories.flatMap(category => types.flatMap(type => getPostsByCategoryAndType(category, type, lang)))
  )
}

export function getPostsByCategory(category: Category, lang: Locale = DEFAULT_LOCALE): BlogPost[] {
  return newestFirst(types.flatMap(type => getPostsByCategoryAndType(category, type, lang)))
}

export function getPostsByType(type: PostType, lang: Locale = DEFAULT_LOCALE): BlogPost[] {
  return newestFirst(categories.flatMap(category => getPostsByCategoryAndType(category, type, lang)))
}

export function getPostBySlug(
  slug: string,
  category?: string,
  type?: string,
  lang: Locale = DEFAULT_LOCALE
): BlogPost | null {
  // If category and type are provided, look in that folder only
  if (category && type) {
    const file = getLocalizedMDXFile(`blog/${category}/${type}`, slug, lang)
    return file ? toPost(file, category, type) : null
  }

  // Search all categories and types
  for (const cat of categories) {
    for (const typ of types) {
      const file = getLocalizedMDXFile(`blog/${cat}/${typ}`, slug, lang)
      if (file) return toPost(file, cat, typ)
    }
  }

  return null
}

// Re-export for convenience, but use the client-safe version
export { getCategoryDisplayName, getTypeDisplayName } from './blog-utils'
