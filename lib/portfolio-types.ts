// Client-safe type definitions for portfolio
// These types can be imported in client components

export interface Link {
  url: string
  label: string
}

export interface PortfolioProject {
  slug: string
  frontMatter: {
    title: string
    category: 'student-projects' | 'video-games' | 'applications' | 'habits'
    date: string
    tags?: string[]
    github?: string | Link[] // Support single link, multiple links, or labeled links
    demo?: string | Link[] // Support single link, multiple links, or labeled links
    website?: string | Link[] // Support single link, multiple links, or labeled links
    images?: string[]
    description?: string
  }
  content: string
}

