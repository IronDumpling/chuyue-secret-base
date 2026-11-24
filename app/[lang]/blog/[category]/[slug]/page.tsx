import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEntries, getEntry, getRatingScales } from '@/lib/content'
import type { ReviewCategory } from '@/lib/ratings'
import RatingBadge from '@/components/blog/rating/RatingBadge'
import EntryDetail from '@/components/shared/EntryDetail'
import { getCategoryDisplayName, getCategoryPath, hasRating } from '@/lib/blog-utils'
import { buildEntryMetadata } from '@/lib/seo'
import type { Locale } from '@/lib/i18n/config'

interface BlogPostPageProps {
  params: {
    lang: Locale
    category: string
    slug: string
  }
}

export function generateStaticParams() {
  // Every post exists in both languages (the other one is the fallback), so the
  // parent [lang] segment supplies the language and this only lists the posts.
  return getEntries('blog', 'en').map(post => ({
    category: post.frontMatter.category,
    slug: post.slug,
  }))
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getEntry('blog', params.category, params.slug, params.lang)
  return post ? buildEntryMetadata(post, params.lang) : {}
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getEntry('blog', params.category, params.slug, params.lang)
  if (!post) notFound()

  const { category, group, rating } = post.frontMatter
  const scale = getRatingScales(params.lang)[category as ReviewCategory]
  const badges = (
    <>
      {getCategoryPath(category, params.lang).map((name, index, path) => (
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
      {hasRating(group) && rating !== undefined && scale && (
        <RatingBadge
          score={rating}
          scale={scale}
          categoryName={getCategoryDisplayName(category, params.lang)}
          size="md"
        />
      )}
    </>
  )

  return <EntryDetail entry={post} lang={params.lang} badges={badges} />
}
