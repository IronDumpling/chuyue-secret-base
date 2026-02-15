import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/blog'
import Rating from '@/components/blog/Rating'
import MDXContent from '@/components/shared/MDXContent'
import MDXHeaderImage from '@/components/shared/MDXHeaderImage'
import { getCategoryDisplayName, getTypeDisplayName } from '@/lib/blog-utils'

interface BlogPostPageProps {
  params: {
    category: string
    type: string
    slug: string
  }
}

export async function generateStaticParams() {
  const { getAllPosts } = await import('@/lib/blog')
  const posts = getAllPosts()
  
  return posts.map(post => ({
    category: post.frontMatter.category,
    type: post.frontMatter.type,
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug, params.category, params.type)

  if (!post) {
    notFound()
  }

  return (
    <article className="section bg-white dark:bg-gray-900">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          <h1 className="text-4xl font-bold mb-4">{post.frontMatter.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
            <span className="text-sm">
              {new Date(post.frontMatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full">
              {getCategoryDisplayName(post.frontMatter.category)}
            </span>
            <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
              {getTypeDisplayName(post.frontMatter.type)}
            </span>
            {post.frontMatter.type === 'review' && post.frontMatter.rating && (
              <Rating score={post.frontMatter.rating} />
            )}
          </div>
          {post.frontMatter.tags && (
            <div className="flex flex-wrap gap-2">
              {post.frontMatter.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Header Image */}
        <MDXHeaderImage
          images={
            post.frontMatter.images && post.frontMatter.images.length > 0
              ? post.frontMatter.images
              : ['/images/placeholder/blog-default.jpg']
          }
          title={post.frontMatter.title}
        />

        {/* MDX Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MDXContent source={post.content} />
        </div>
      </div>
    </article>
  )
}
