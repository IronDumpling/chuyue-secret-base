import { getAllPosts } from '@/lib/blog'
import BlogList from '@/components/blog/BlogList'
import type { Locale } from '@/lib/i18n/config'

export const metadata = {
  title: 'Blog - Chuyue',
  description: 'Reviews and casual posts by Chuyue Zhang',
}

export default function BlogPage({ params }: { params: { lang: Locale } }) {
  const posts = getAllPosts(params.lang)

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">Blog</h1>
        <BlogList posts={posts} />
      </div>
    </section>
  )
}

