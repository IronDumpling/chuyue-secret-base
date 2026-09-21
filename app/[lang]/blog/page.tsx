import { getAllPosts } from '@/lib/blog'
import BlogList from '@/components/blog/BlogList'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

export function generateMetadata({ params }: { params: { lang: Locale } }) {
  const t = getDictionary(params.lang)
  return { title: t.blog.pageTitle, description: t.blog.pageDescription }
}

export default function BlogPage({ params }: { params: { lang: Locale } }) {
  const posts = getAllPosts(params.lang)

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">{getDictionary(params.lang).blog.pageTitle}</h1>
        <BlogList posts={posts} />
      </div>
    </section>
  )
}

