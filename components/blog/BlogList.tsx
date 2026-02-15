'use client'

import { useState } from 'react'
import type { BlogPost } from '@/lib/blog-types'
import BlogCard from './BlogCard'
import { getCategoryDisplayName, getTypeDisplayName } from '@/lib/blog-utils'

interface BlogListProps {
  posts: BlogPost[]
  showFilters?: boolean
}

const categories: BlogPost['frontMatter']['category'][] = [
  'photography',
  'illustration',
  'films-shows',
  'music',
  'video-games',
  'books',
]

const types: BlogPost['frontMatter']['type'][] = ['review', 'casual']

export default function BlogList({ posts, showFilters = true }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<BlogPost['frontMatter']['category'] | 'all'>('all')
  const [selectedType, setSelectedType] = useState<BlogPost['frontMatter']['type'] | 'all'>('all')

  const filteredPosts = posts.filter(post => {
    // Filter by category
    if (selectedCategory !== 'all' && post.frontMatter.category !== selectedCategory) {
      return false
    }
    
    // Filter by type
    if (selectedType !== 'all' && post.frontMatter.type !== selectedType) {
      return false
    }
    
    return true
  })

  return (
    <div>
      {showFilters && (
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSelectedType('all')
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setSelectedType('all')
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {getCategoryDisplayName(category)}
              </button>
            ))}
          </div>

          {/* Type Filter - Show when a category is selected */}
          {selectedCategory !== 'all' && (
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All {getCategoryDisplayName(selectedCategory)}
              </button>
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {getTypeDisplayName(type)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <BlogCard key={`${post.frontMatter.category}-${post.frontMatter.type}-${post.slug}`} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No blog posts found.</p>
        </div>
      )}
    </div>
  )
}

