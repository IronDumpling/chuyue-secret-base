import { notFound } from 'next/navigation'
import { getPostsByCategory } from '@/lib/blog'
import { getCategoryDisplayName } from '@/lib/blog-utils'
import BlogList from '@/components/blog/BlogList'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { getCategories, isValidCategory } from '@/lib/taxonomy'

interface CategoryPageProps {
  params: {
    lang: Locale
    category: string
  }
}

export function generateStaticParams() {
  return getCategories('blog').map(category => ({ category }))
}

export default function CategoryPage({ params }: CategoryPageProps) {
  if (!isValidCategory('blog', params.category)) {
    notFound()
  }

  const posts = getPostsByCategory(params.category, params.lang)

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">{getCategoryDisplayName(params.category, params.lang)}</h1>
        <span className="section-subtitle">{getDictionary(params.lang).blog.browseByCategory}</span>
        <BlogList posts={posts} showFilters={false} />
      </div>
    </section>
  )
}
