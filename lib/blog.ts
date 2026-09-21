import 'server-only'

import { getLocalizedMDXFile, getLocalizedMDXFiles, type LocalizedMDXContent } from './mdx'
import { getCategories, getGroupOf, isValidCategory, type BlogCategory } from './taxonomy'
import type { Locale } from './i18n/config'
import type { BlogPost } from './blog-types'

// Re-export type for convenience
export type { BlogPost }

// Category comes from the folder and group from the taxonomy, not from the frontmatter.
function toPost(file: LocalizedMDXContent, category: BlogCategory): BlogPost {
  return {
    slug: file.slug,
    frontMatter: {
      ...file.frontMatter,
      category,
      group: getGroupOf('blog', category),
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

export function getPostsByCategory(category: BlogCategory, lang: Locale): BlogPost[] {
  const files = getLocalizedMDXFiles(`blog/${category}`, lang)
  return newestFirst(files.map(file => toPost(file, category)))
}

export function getAllPosts(lang: Locale): BlogPost[] {
  return newestFirst(getCategories('blog').flatMap(category => getPostsByCategory(category, lang)))
}

export function getPostBySlug(slug: string, category: string | undefined, lang: Locale): BlogPost | null {
  // If a category is provided, look in that folder only
  if (category) {
    if (!isValidCategory('blog', category)) return null
    const file = getLocalizedMDXFile(`blog/${category}`, slug, lang)
    return file ? toPost(file, category) : null
  }

  // Search all categories
  for (const cat of getCategories('blog')) {
    const file = getLocalizedMDXFile(`blog/${cat}`, slug, lang)
    if (file) return toPost(file, cat)
  }

  return null
}

// Re-export for convenience, but use the client-safe version
export { getCategoryDisplayName } from './blog-utils'
