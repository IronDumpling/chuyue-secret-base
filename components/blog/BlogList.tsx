'use client'

import { useState } from 'react'
import { BlogPost } from '@/lib/blog'
import BlogCard from './BlogCard'
import { getCategoryDisplayName, getSubcategoryDisplayName } from '@/lib/blog-utils'

interface BlogListProps {
  posts: BlogPost[]
  showFilters?: boolean
}

const categories: BlogPost['frontMatter']['category'][] = ['review', 'casual']
const subcategories: BlogPost['frontMatter']['subcategory'][] = [
  'music',
  'movies',
  'video-games',
  'shows',
  'books',
]

export default function BlogList({ posts, showFilters = true }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<BlogPost['frontMatter']['category'] | 'all'>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState<BlogPost['frontMatter']['subcategory'] | 'all'>('all')

  const filteredPosts = posts.filter(post => {
    // First, filter by category
    if (selectedCategory !== 'all' && post.frontMatter.category !== selectedCategory) {
      return false
    }
    
    // If selected category is 'review', only show review posts
    if (selectedCategory === 'review') {
      // Must be a review post with a subcategory
      if (post.frontMatter.category !== 'review' || !post.frontMatter.subcategory) {
        return false
      }
      // If a specific subcategory is selected, filter by it
      if (selectedSubcategory !== 'all' && post.frontMatter.subcategory !== selectedSubcategory) {
        return false
      }
    }
    
    // If selected category is 'casual', only show casual posts
    if (selectedCategory === 'casual') {
      if (post.frontMatter.category !== 'casual') {
        return false
      }
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
                setSelectedSubcategory('all')
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
                  setSelectedSubcategory('all')
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

          {/* Subcategory Filter - Only show for review category */}
          {selectedCategory === 'review' && (
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setSelectedSubcategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubcategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All {getCategoryDisplayName(selectedCategory)}
              </button>
              {subcategories.map(subcategory => (
                <button
                  key={subcategory}
                  onClick={() => setSelectedSubcategory(subcategory)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSubcategory === subcategory
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {getSubcategoryDisplayName(subcategory)}
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
            <BlogCard key={`${post.frontMatter.category}-${post.frontMatter.subcategory || 'no-sub'}-${post.slug}`} post={post} />
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

