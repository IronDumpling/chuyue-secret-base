import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/blog'
import Rating from '@/components/blog/Rating'
import MDXContent from '@/components/shared/MDXContent'
import MDXHeaderImage from '@/components/shared/MDXHeaderImage'
import { getCategoryPath, hasRating } from '@/lib/blog-utils'
import { buildPageMetadata } from '@/lib/seo'
import { INTL_LOCALE, LOCALES, type Locale } from '@/lib/i18n/config'
import { localePath } from '@/lib/i18n/paths'
import { getDictionary } from '@/lib/i18n'
import ListBackLink from '@/components/shared/ListBackLink'
import FallbackNotice from '@/components/shared/FallbackNotice'

interface BlogPostPageProps {
  params: {
    lang: Locale
    category: string
    slug: string
  }
}

export async function generateStaticParams() {
  const { getAllPosts } = await import('@/lib/blog')
  // Every post exists in both languages (the other one is the fallback), so the
  // parent [lang] segment supplies the language and this only lists the posts.
  const posts = getAllPosts('en')
  
  return posts.map(post => ({
    category: post.frontMatter.category,
    slug: post.slug,
  }))
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getPostBySlug(params.slug, params.category, params.lang)
  if (!post) return {}
  // Languages this post is really written in (the other one is only a fallback).
  const languages = LOCALES.filter(l => {
    const version = getPostBySlug(params.slug, params.category, l)
    return version && !version.isFallback
  })
  return buildPageMetadata(
    { kind: 'blog', category: post.frontMatter.category, slug: post.slug },
    params.lang,
    {
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      body: post.content,
      date: String(post.frontMatter.date),
      contentLang: post.lang,
      languages,
    }
  )
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug, params.category, params.lang)

  if (!post) {
    notFound()
  }

  const t = getDictionary(params.lang)

  return (
    <article className="section bg-white dark:bg-gray-900">
      <div className="container max-w-4xl">
        <FallbackNotice pageLang={params.lang} contentLang={post.lang} />
        {/* Header */}
        <div className="mb-8">
          <ListBackLink
            href={localePath(params.lang, '/blog')}
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.blog.back}
          </ListBackLink>
          <h1 lang={post.lang} className="text-4xl font-bold mb-4">{post.frontMatter.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
            <span className="text-sm">
              {new Date(post.frontMatter.date).toLocaleDateString(INTL_LOCALE[params.lang], {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {getCategoryPath(post.frontMatter.category, params.lang).map((name, index, path) => (
              <span
                key={name}
                className={
                  index === path.length - 1
                    ? 'px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full'
                    : 'px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full'
                }
              >
                {name}
              </span>
            ))}
            {hasRating(post.frontMatter.group) && post.frontMatter.rating && (
              <Rating score={post.frontMatter.rating} />
            )}
          </div>
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

        {/* Website Link */}
        {post.frontMatter.website && (
          <div className="flex flex-wrap gap-4 mb-8">
            <a
              href={typeof post.frontMatter.website === 'string' ? post.frontMatter.website : post.frontMatter.website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="button-secondary inline-flex items-center gap-2"
            >
              {typeof post.frontMatter.website === 'string' ? t.blog.visitWebsite : post.frontMatter.website.label}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {/* MDX Content */}
        <div lang={post.lang} className="prose prose-lg dark:prose-invert max-w-none">
          <MDXContent source={post.content} />
        </div>
      </div>
    </article>
  )
}
