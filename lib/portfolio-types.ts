// Client-safe type definitions for portfolio
// These types can be imported in client components

export interface PortfolioProject {
  slug: string
  frontMatter: {
    title: string
    category: 'student-projects' | 'video-games' | 'applications'
    date: string
    tags?: string[]
    github?: string
    demo?: string
    website?: string
    images?: string[]
    description?: string
  }
  content: string
}

