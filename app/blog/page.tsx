import { getAllPosts } from '@/lib/blog'
import BlogList from '@/components/blog/BlogList'

export const metadata = {
  title: 'Blog - Chuyue',
  description: 'Reviews and casual posts by Chuyue Zhang',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">Blog</h1>
        <span className="section-subtitle">Reviews and Recommendations</span>
        <BlogList posts={posts} />
      </div>
    </section>
  )
}

