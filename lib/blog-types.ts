// Client-safe type definitions for blog
// These types can be imported in client components

export interface BlogPost {
  slug: string
  frontMatter: {
    title: string
    category: 'photography' | 'illustration' | 'films-shows' | 'music' | 'video-games' | 'books'
    type: 'review' | 'casual'
    date: string
    tags?: string[]
    rating?: number  // Only used for review type
    images?: string[]
    description?: string
    website?: string | { url: string; label: string }  // External link support
  }
  content: string
}

