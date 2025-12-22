import { notFound } from 'next/navigation'
import { getPostsBySubcategory } from '@/lib/blog'
import { getCategoryDisplayName, getSubcategoryDisplayName } from '@/lib/blog-utils'
import BlogList from '@/components/blog/BlogList'

interface SubcategoryPageProps {
  params: {
    category: string
    subcategory: string
  }
}

export function generateStaticParams() {
  // Only review category has subcategories
  const subcategories = ['music', 'movies', 'video-games', 'shows', 'books']
  
  return subcategories.map(subcategory => ({
    category: 'review',
    subcategory,
  }))
}

export default function SubcategoryPage({ params }: SubcategoryPageProps) {
  // Only review category should have subcategories
  if (params.category !== 'review' || !['music', 'movies', 'video-games', 'shows', 'books'].includes(params.subcategory)) {
    notFound()
  }

  const posts = getPostsBySubcategory(
    'review',
    params.subcategory as 'music' | 'movies' | 'video-games' | 'shows' | 'books'
  )

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">
          {getCategoryDisplayName('review')} - {getSubcategoryDisplayName(params.subcategory as 'music' | 'movies' | 'video-games' | 'shows' | 'books')}
        </h1>
        <span className="section-subtitle">Browse by subcategory</span>
        <BlogList posts={posts} showFilters={false} />
      </div>
    </section>
  )
}

