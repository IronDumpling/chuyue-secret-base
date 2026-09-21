'use client'

import { useMemo } from 'react'
import type { BlogPost } from '@/lib/blog-types'
import BlogListItem from './BlogListItem'
import CategoryFilter from '@/components/shared/filter/CategoryFilter'
import { useUrlSelection } from '@/components/shared/filter/useUrlSelection'
import { getCategoryDisplayName, getGroupDisplayName } from '@/lib/blog-utils'
import { formatMonth, monthKey } from '@/lib/date'
import {
  buildFilterModel,
  matchesSelection,
  normalizeSelection,
  selectionKey,
} from '@/lib/filter-model'
import { useLocale, useT } from '@/components/shared/LocaleProvider'
import { format } from '@/lib/i18n/format'
import type { BlogCategory, BlogGroup } from '@/lib/taxonomy'

interface BlogListProps {
  posts: BlogPost[]
  showFilters?: boolean
}

// How long each row waits before it fades in, so the list settles top to bottom. Capped so a
// long list does not keep the last rows waiting.
const STAGGER_MS = 40
const STAGGER_ROWS = 8

export default function BlogList({ posts, showFilters = true }: BlogListProps) {
  const locale = useLocale()
  const t = useT()
  const { selection: chosen, choose: setChosen, watcher } = useUrlSelection(showFilters)

  const model = useMemo(
    () =>
      buildFilterModel(
        'blog',
        posts.map(post => ({ category: post.frontMatter.category })),
        {
          group: id => getGroupDisplayName(id as BlogGroup, locale),
          category: id => getCategoryDisplayName(id as BlogCategory, locale),
        }
      ),
    [posts, locale]
  )
  const selection = normalizeSelection(chosen, model)

  const visible = posts.filter(post =>
    matchesSelection({ category: post.frontMatter.category, group: post.frontMatter.group }, selection)
  )

  // Posts arrive newest first, so a month is a run of consecutive posts.
  const months: { key: string; label: string; posts: BlogPost[] }[] = []
  for (const post of visible) {
    const key = monthKey(post.frontMatter.date)
    const last = months[months.length - 1]
    if (last && last.key === key) last.posts.push(post)
    else months.push({ key, label: formatMonth(post.frontMatter.date, locale), posts: [post] })
  }

  let row = 0
  const feed =
    visible.length > 0 ? (
      // Keyed by the selection so a new choice replays the fade-in.
      <div key={selectionKey(selection)}>
        {months.map(month => (
          <section key={month.key} aria-label={month.label} className="mt-8 first:mt-0">
            <h2 className="mb-1 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <span>{month.label}</span>
              <span aria-hidden className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </h2>
            <div>
              {month.posts.map(post => (
                <BlogListItem
                  key={`${post.frontMatter.category}-${post.slug}`}
                  post={post}
                  className="motion-safe:animate-feed-in"
                  style={{ animationDelay: `${Math.min(row++, STAGGER_ROWS) * STAGGER_MS}ms` }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    ) : (
      <div className="py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">{t.blog.noPosts}</p>
      </div>
    )

  if (!showFilters) {
    return <div className="mx-auto mt-10 max-w-3xl">{feed}</div>
  }

  return (
    <div className="mx-auto mt-10 max-w-5xl lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
      {watcher}
      <aside className="mb-6 lg:mb-0">
        {/* Below the header (fixed, up to 5rem tall) while the list scrolls. */}
        <div className="lg:sticky lg:top-24">
          <CategoryFilter
            variant="sidebar"
            model={model}
            selection={selection}
            onChange={setChosen}
            labels={{
              ariaLabel: t.blog.filterLabel,
              all: t.common.all,
              allIn: name => format(t.common.allIn, { name }),
            }}
          />
        </div>
      </aside>
      <div className="min-h-[24rem] min-w-0">{feed}</div>
    </div>
  )
}
