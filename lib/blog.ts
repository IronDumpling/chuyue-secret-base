import 'server-only'

import { getAllMDXFiles, getMDXFile, MDXContent } from './mdx'
import { categoryMap, typeMap } from './blog-utils'
import type { BlogPost } from './blog-types'

// Re-export type for convenience
export type { BlogPost }

export function getAllPosts(): BlogPost[] {
  const posts: BlogPost[] = []
  
  // Iterate through all categories
  const categories: Array<keyof typeof categoryMap> = [
    'photography',
    'illustration',
    'films-shows',
    'music',
    'video-games',
    'books',
  ]

  const types: Array<keyof typeof typeMap> = ['review', 'casual']

  for (const category of categories) {
    for (const type of types) {
      const files = getAllMDXFiles(`blog/${category}/${type}`)
      for (const file of files) {
        posts.push({
          slug: file.slug,
          frontMatter: {
            ...file.frontMatter,
            category,
            type,
          } as BlogPost['frontMatter'],
          content: file.content,
        })
      }
    }
  }

  return posts.sort((a, b) => 
    new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
  )
}

export function getPostBySlug(
  slug: string,
  category?: string,
  type?: string
): BlogPost | null {
  // If category and type are provided, try direct path
  if (category && type) {
    const file = getMDXFile(`blog/${category}/${type}/${slug}.mdx`)
    if (!file) return null
    return {
      slug: file.slug,
      frontMatter: {
        ...file.frontMatter,
        category: category as BlogPost['frontMatter']['category'],
        type: type as BlogPost['frontMatter']['type'],
      } as BlogPost['frontMatter'],
      content: file.content,
    }
  }

  // Search all categories and types
  const categories: Array<keyof typeof categoryMap> = [
    'photography',
    'illustration',
    'films-shows',
    'music',
    'video-games',
    'books',
  ]

  const types: Array<keyof typeof typeMap> = ['review', 'casual']

  for (const cat of categories) {
    for (const typ of types) {
      const file = getMDXFile(`blog/${cat}/${typ}/${slug}.mdx`)
      if (file) {
        return {
          slug: file.slug,
          frontMatter: {
            ...file.frontMatter,
            category: cat,
            type: typ,
          } as BlogPost['frontMatter'],
          content: file.content,
        }
      }
    }
  }

  return null
}

export function getPostsByCategory(category: BlogPost['frontMatter']['category']): BlogPost[] {
  const posts: BlogPost[] = []
  const types: Array<keyof typeof typeMap> = ['review', 'casual']

  for (const type of types) {
    const files = getAllMDXFiles(`blog/${category}/${type}`)
    for (const file of files) {
      posts.push({
        slug: file.slug,
        frontMatter: {
          ...file.frontMatter,
          category,
          type,
        } as BlogPost['frontMatter'],
        content: file.content,
      })
    }
  }

  return posts.sort((a, b) => 
    new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
  )
}

export function getPostsByType(type: BlogPost['frontMatter']['type']): BlogPost[] {
  const posts: BlogPost[] = []
  const categories: Array<keyof typeof categoryMap> = [
    'photography',
    'illustration',
    'films-shows',
    'music',
    'video-games',
    'books',
  ]

  for (const category of categories) {
    const files = getAllMDXFiles(`blog/${category}/${type}`)
    for (const file of files) {
      posts.push({
        slug: file.slug,
        frontMatter: {
          ...file.frontMatter,
          category,
          type,
        } as BlogPost['frontMatter'],
        content: file.content,
      })
    }
  }

  return posts.sort((a, b) => 
    new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
  )
}

export function getPostsByCategoryAndType(
  category: BlogPost['frontMatter']['category'],
  type: BlogPost['frontMatter']['type']
): BlogPost[] {
  const files = getAllMDXFiles(`blog/${category}/${type}`)
  return files.map(file => ({
    slug: file.slug,
    frontMatter: {
      ...file.frontMatter,
      category,
      type,
    } as BlogPost['frontMatter'],
    content: file.content,
  })).sort((a, b) => 
    new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
  )
}

// Re-export for convenience, but use the client-safe version
export { getCategoryDisplayName, getTypeDisplayName } from './blog-utils'

