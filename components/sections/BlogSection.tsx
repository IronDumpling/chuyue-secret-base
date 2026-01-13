import Link from 'next/link'
import { withBasePath } from '@/lib/utils'

export default function BlogSection() {
  return (
    <section id="blog-section" className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h2 className="section-title">Blogs</h2>

        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Explore my blogs.
            </p>

            <Link 
                href="/blog" 
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
                View Full Blogs
            </Link>
        </div>
      </div>
    </section>
  )
}
