import 'server-only'

import { getAllMDXFiles, getMDXFile, MDXContent } from './mdx'
import { categoryMap, subcategoryMap } from './blog-utils'
import type { BlogPost } from './blog-types'

// Re-export type for convenience
export type { BlogPost }

export function getAllPosts(): BlogPost[] {
  const posts: BlogPost[] = []
  
  // Handle review category with subcategories
  const subcategories: Array<keyof typeof subcategoryMap> = [
    'music',
    'movies',
    'video-games',
    'shows',
    'books',
  ]

  for (const subcategory of subcategories) {
    const files = getAllMDXFiles(`blog/review/${subcategory}`)
    for (const file of files) {
      posts.push({
        slug: file.slug,
        frontMatter: {
          ...file.frontMatter,
          category: 'review',
          subcategory,
        } as BlogPost['frontMatter'],
        content: file.content,
      })
    }
  }

  // Handle casual category without subcategories
  const casualFiles = getAllMDXFiles(`blog/casual`)
  for (const file of casualFiles) {
    posts.push({
      slug: file.slug,
      frontMatter: {
        ...file.frontMatter,
        category: 'casual',
        subcategory: undefined,
        rating: undefined,  // Casual posts don't have ratings
      } as BlogPost['frontMatter'],
      content: file.content,
    })
  }

  return posts.sort((a, b) => 
    new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
  )
}

export function getPostBySlug(
  slug: string,
  category?: string,
  subcategory?: string
): BlogPost | null {
  // Handle review posts with subcategory
  if (category === 'review' && subcategory) {
    const file = getMDXFile(`blog/review/${subcategory}/${slug}.mdx`)
    if (!file) return null
    return {
      slug: file.slug,
      frontMatter: {
        ...file.frontMatter,
        category: 'review',
        subcategory: subcategory as BlogPost['frontMatter']['subcategory'],
      } as BlogPost['frontMatter'],
      content: file.content,
    }
  }

  // Handle casual posts without subcategory
  if (category === 'casual') {
    const file = getMDXFile(`blog/casual/${slug}.mdx`)
    if (!file) return null
    return {
      slug: file.slug,
      frontMatter: {
        ...file.frontMatter,
        category: 'casual',
        subcategory: undefined,
        rating: undefined,
      } as BlogPost['frontMatter'],
      content: file.content,
    }
  }

  // Search all posts if category/subcategory not provided
  // First check review posts
  const subcategories: Array<keyof typeof subcategoryMap> = [
    'music',
    'movies',
    'video-games',
    'shows',
    'books',
  ]

  for (const subcat of subcategories) {
    const file = getMDXFile(`blog/review/${subcat}/${slug}.mdx`)
    if (file) {
      return {
        slug: file.slug,
        frontMatter: {
          ...file.frontMatter,
          category: 'review',
          subcategory: subcat,
        } as BlogPost['frontMatter'],
        content: file.content,
      }
    }
  }

  // Then check casual posts
  const casualFile = getMDXFile(`blog/casual/${slug}.mdx`)
  if (casualFile) {
    return {
      slug: casualFile.slug,
      frontMatter: {
        ...casualFile.frontMatter,
        category: 'casual',
        subcategory: undefined,
        rating: undefined,
      } as BlogPost['frontMatter'],
      content: casualFile.content,
    }
  }

  return null
}

export function getPostsByCategory(category: BlogPost['frontMatter']['category']): BlogPost[] {
  const posts: BlogPost[] = []

  if (category === 'review') {
    // Review posts have subcategories
    const subcategories: Array<keyof typeof subcategoryMap> = [
      'music',
      'movies',
      'video-games',
      'shows',
      'books',
    ]

    for (const subcategory of subcategories) {
      const files = getAllMDXFiles(`blog/review/${subcategory}`)
      for (const file of files) {
        posts.push({
          slug: file.slug,
          frontMatter: {
            ...file.frontMatter,
            category: 'review',
            subcategory,
          } as BlogPost['frontMatter'],
          content: file.content,
        })
      }
    }
  } else if (category === 'casual') {
    // Casual posts don't have subcategories
    const files = getAllMDXFiles(`blog/casual`)
    for (const file of files) {
      posts.push({
        slug: file.slug,
        frontMatter: {
          ...file.frontMatter,
          category: 'casual',
          subcategory: undefined,
          rating: undefined,
        } as BlogPost['frontMatter'],
        content: file.content,
      })
    }
  }

  return posts.sort((a, b) => 
    new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
  )
}

export function getPostsBySubcategory(
  category: 'review',
  subcategory: BlogPost['frontMatter']['subcategory']
): BlogPost[] {
  // Only review category has subcategories
  if (category !== 'review' || !subcategory) {
    return []
  }

  const files = getAllMDXFiles(`blog/review/${subcategory}`)
  return files.map(file => ({
    slug: file.slug,
    frontMatter: {
      ...file.frontMatter,
      category: 'review',
      subcategory,
    } as BlogPost['frontMatter'],
    content: file.content,
  })).sort((a, b) => 
    new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime()
  )
}

// Re-export for convenience, but use the client-safe version
export { getCategoryDisplayName, getSubcategoryDisplayName } from './blog-utils'

