import { notFound } from 'next/navigation'
import { getPostsByCategory } from '@/lib/blog'
import { getCategoryDisplayName } from '@/lib/blog-utils'
import BlogList from '@/components/blog/BlogList'
import type { Locale } from '@/lib/i18n/config'

interface CategoryPageProps {
  params: {
    lang: Locale
    category: string
  }
}

export function generateStaticParams() {
  return [
    { category: 'photography' },
    { category: 'illustration' },
    { category: 'films-shows' },
    { category: 'music' },
    { category: 'video-games' },
    { category: 'books' },
  ]
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const validCategories = ['photography', 'illustration', 'films-shows', 'music', 'video-games', 'books']
  
  if (!validCategories.includes(params.category)) {
    notFound()
  }

  const posts = getPostsByCategory(params.category as any, params.lang)

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">{getCategoryDisplayName(params.category as any)}</h1>
        <span className="section-subtitle">Browse by category</span>
        <BlogList posts={posts} showFilters={false} />
      </div>
    </section>
  )
}

