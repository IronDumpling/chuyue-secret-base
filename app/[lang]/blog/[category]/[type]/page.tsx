import { notFound } from 'next/navigation'
import { getPostsByCategoryAndType } from '@/lib/blog'
import { getCategoryDisplayName, getTypeDisplayName } from '@/lib/blog-utils'
import BlogList from '@/components/blog/BlogList'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

interface TypePageProps {
  params: {
    lang: Locale
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
    params.type as 'review' | 'casual',
    params.lang
  )

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">
          {getCategoryDisplayName(params.category as any, params.lang)} - {getTypeDisplayName(params.type as any, params.lang)}
        </h1>
        <span className="section-subtitle">{getDictionary(params.lang).blog.browseByCategoryAndType}</span>
        <BlogList posts={posts} showFilters={false} />
      </div>
    </section>
  )
}
