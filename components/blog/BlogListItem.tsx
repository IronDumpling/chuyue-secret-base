'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { BlogPost } from '@/lib/blog-types'
import { getCategoryPath, getExcerpt, hasRating } from '@/lib/blog-utils'
import { formatDay } from '@/lib/date'
import Rating from '@/components/blog/Rating'
import RotatingImage from '@/components/shared/RotatingImage'
import { useLocale, useLocalePath } from '@/components/shared/LocaleProvider'

interface BlogListItemProps {
  post: BlogPost
  className?: string
  style?: CSSProperties
}

// One post in the blog list: category, title, a two-line summary and a line of facts on the
// left, a small cover on the right. The whole row is the link (the title's ::after covers it),
// so the tags and the rating inside it stay plain text instead of nested links. The divider
// sits on the outer element so it stays straight while the row inside has rounded corners.
export default function BlogListItem({ post, className = '', style }: BlogListItemProps) {
  const locale = useLocale()
  const lp = useLocalePath()
  const { frontMatter } = post
  const url = lp(`/blog/${frontMatter.category}/${post.slug}`)
  const summary = getExcerpt(frontMatter.description, post.content)
  const cover = frontMatter.images?.slice(0, 1)
  const score = hasRating(frontMatter.group) ? frontMatter.rating : undefined

  return (
    <div
      style={style}
      className={`border-t border-gray-200 first:border-t-0 dark:border-gray-800 ${className}`}
    >
      <article className="group relative -mx-3 flex gap-4 rounded-lg px-3 py-5 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium text-primary-600 dark:text-primary-400">
            {getCategoryPath(frontMatter.category, locale).join(' · ')}
          </p>
          <h3
            lang={post.lang}
            className="text-lg font-semibold leading-snug transition-colors duration-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 md:text-xl line-clamp-2"
          >
            <Link href={url} className="after:absolute after:inset-0">
              {frontMatter.title}
            </Link>
          </h3>
          {summary && (
            <p lang={post.lang} className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {summary}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <time dateTime={frontMatter.date}>{formatDay(frontMatter.date, locale)}</time>
            {score !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Rating score={score} size="sm" />
                <span className="tabular-nums">{score}/10</span>
              </span>
            )}
            {frontMatter.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-primary-600/80 dark:text-primary-400/80">
                #{tag}
              </span>
            ))}
            {post.isFallback && (
              // The text is in the other language than the page.
              <span className="rounded border border-gray-300 px-1 py-px text-[10px] leading-none dark:border-gray-600">
                {post.lang === 'zh' ? '中' : 'EN'}
              </span>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/3] w-24 shrink-0 self-start overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 sm:w-36">
          <RotatingImage
            images={cover}
            alt=""
            defaultSrc="/images/placeholder/blog-default.jpg"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </article>
    </div>
  )
}
