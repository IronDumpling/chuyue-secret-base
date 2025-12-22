// Client-safe type definitions for blog
// These types can be imported in client components

export interface BlogPost {
  slug: string
  frontMatter: {
    title: string
    category: 'review' | 'casual'
    subcategory?: 'music' | 'movies' | 'video-games' | 'shows' | 'books'  // Only for review
    date: string
    tags?: string[]
    rating?: number  // Only used for review category
    description?: string
  }
  content: string
}

