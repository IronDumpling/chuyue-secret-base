import Link from 'next/link'
import SafeImage from '@/components/shared/SafeImage'
import type { BlogPost } from '@/lib/blog-types'
import { getCategoryDisplayName, getTypeDisplayName } from '@/lib/blog-utils'
import Rating from '@/components/blog/Rating'

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  // URL structure: /blog/{category}/{type}/{slug}
  const url = `/blog/${post.frontMatter.category}/${post.frontMatter.type}/${post.slug}`
  const image = post.frontMatter.images?.[0] || '/images/placeholder/blog-default.jpg'

  return (
    <Link
      href={url}
      className="group block bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Header Image Section */}
      <div className="relative h-48 overflow-hidden">
        <SafeImage
          src={image}
          alt={post.frontMatter.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {/* Category, Type, and Rating badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full">
              {getCategoryDisplayName(post.frontMatter.category)}
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
              {getTypeDisplayName(post.frontMatter.type)}
            </span>
          </div>
          {post.frontMatter.type === 'review' && post.frontMatter.rating && (
            <Rating score={post.frontMatter.rating} />
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {post.frontMatter.title}
        </h3>
        
        {/* Description */}
        {post.frontMatter.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {post.frontMatter.description}
          </p>
        )}
        
        {/* Tags */}
        {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.frontMatter.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Date */}
        <div className="text-sm text-gray-500 dark:text-gray-500">
          {new Date(post.frontMatter.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          })}
        </div>
      </div>
    </Link>
  )
}

