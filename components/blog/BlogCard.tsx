import Link from 'next/link'
import { BlogPost } from '@/lib/blog'
import { getCategoryDisplayName, getSubcategoryDisplayName } from '@/lib/blog-utils'
import Rating from './Rating'

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={post.frontMatter.category === 'review' && post.frontMatter.subcategory
        ? `/blog/${post.frontMatter.category}/${post.frontMatter.subcategory}/${post.slug}`
        : `/blog/${post.frontMatter.category}/${post.slug}`}
      className="block bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full">
            {getCategoryDisplayName(post.frontMatter.category)}
          </span>
          {post.frontMatter.subcategory && (
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
              {getSubcategoryDisplayName(post.frontMatter.subcategory)}
            </span>
          )}
        </div>
        {post.frontMatter.category === 'review' && post.frontMatter.rating && (
          <Rating stars={post.frontMatter.rating} />
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        {post.frontMatter.title}
      </h3>
      {post.frontMatter.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {post.frontMatter.description}
        </p>
      )}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
        <span>
          {new Date(post.frontMatter.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.frontMatter.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

