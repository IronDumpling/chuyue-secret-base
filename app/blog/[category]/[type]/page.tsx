import { notFound } from 'next/navigation'
import { getPostsByCategoryAndType } from '@/lib/blog'
import { getCategoryDisplayName, getTypeDisplayName } from '@/lib/blog-utils'
import BlogList from '@/components/blog/BlogList'

interface TypePageProps {
  params: {
    category: string
    type: string
  }
}

export function generateStaticParams() {
  const categories = ['photography', 'illustration', 'films-shows', 'music', 'video-games', 'books']
  const types = ['review', 'casual']
  
  return categories.flatMap(category =>
    types.map(type => ({
      category,
      type,
    }))
  )
}

export default function TypePage({ params }: TypePageProps) {
  const validCategories = ['photography', 'illustration', 'films-shows', 'music', 'video-games', 'books']
  const validTypes = ['review', 'casual']
  
  if (!validCategories.includes(params.category) || !validTypes.includes(params.type)) {
    notFound()
  }

  const posts = getPostsByCategoryAndType(
    params.category as 'photography' | 'illustration' | 'films-shows' | 'music' | 'video-games' | 'books',
    params.type as 'review' | 'casual'
  )

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">
          {getCategoryDisplayName(params.category as any)} - {getTypeDisplayName(params.type as any)}
        </h1>
        <span className="section-subtitle">Browse by category and type</span>
        <BlogList posts={posts} showFilters={false} />
      </div>
    </section>
  )
}
