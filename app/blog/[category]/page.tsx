import { notFound } from 'next/navigation'
import { getPostsByCategory } from '@/lib/blog'
import { getCategoryDisplayName } from '@/lib/blog-utils'
import BlogList from '@/components/blog/BlogList'

interface CategoryPageProps {
  params: {
    category: string
  }
}

export function generateStaticParams() {
  return [
    { category: 'review' },
    { category: 'casual' },
  ]
}

export default function CategoryPage({ params }: CategoryPageProps) {
  if (params.category !== 'review' && params.category !== 'casual') {
    notFound()
  }

  const posts = getPostsByCategory(params.category)

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">{getCategoryDisplayName(params.category)}</h1>
        <span className="section-subtitle">Browse by category</span>
        <BlogList posts={posts} showFilters={false} />
      </div>
    </section>
  )
}

