'use client'

import { useRef, useState } from 'react'
import { flattenToc, type TocNode } from '@/lib/toc'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'
import { useT } from '@/components/shared/LocaleProvider'
import { useReadAloud } from '@/components/shared/read-aloud/context'
import { PlayIcon } from '@/components/shared/read-aloud/icons'
import TocTree from './TocTree'
import { useTocCollapsed } from './useTocCollapsed'

interface TocSidebarProps {
  tree: TocNode[]
  activeId: string | null
  onNavigate: (id: string) => void
  labels: Dictionary['toc']
}

const iconButton =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors duration-200'
const card =
  'rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/95'
const BAR_WIDTH = { 1: 'w-6', 2: 'w-4', 3: 'w-2.5' } as const
const PEEK_MAX_WIDTH = 256
const PEEK_MIN_WIDTH = 144

// Starts reading aloud from the contents, so a reader halfway down the page need not scroll
// back up to the play tile. Hidden while reading (the player is on screen) or unsupported.
export function TocPlayButton({ className = iconButton }: { className?: string }) {
  const reader = useReadAloud()
  const t = useT().readAloud
  if (!reader || reader.active || reader.supported === false) return null
  return (
    <button type="button" onClick={reader.start} aria-label={t.listen} title={t.listen} className={className}>
      <PlayIcon className="ml-px h-3.5 w-3.5" />
    </button>
  )
}

// The wide-screen table of contents, sticky in the left gutter. Collapsed, it becomes a rail
// of short bars (one per heading, shorter for deeper levels) that still shows where the
// reader is; hovering the rail shows the full list as a card to its left, over the empty
// gutter, so it never covers the article.
export default function TocSidebar({ tree, activeId, onNavigate, labels }: TocSidebarProps) {
  const [collapsed, setCollapsed] = useTocCollapsed()
  // Width of the hover card while it is shown; it fits into the gutter left of the rail.
  const [peekWidth, setPeekWidth] = useState<number | null>(null)
  const railRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const openPeek = () => {
    const left = railRef.current?.getBoundingClientRect().left ?? 0
    setPeekWidth(Math.min(PEEK_MAX_WIDTH, Math.max(PEEK_MIN_WIDTH, left - 24)))
  }
  const closePeek = () => setPeekWidth(null)

  if (collapsed) {
    return (
      <nav
        ref={railRef}
        aria-label={labels.title}
        className="sticky top-28 ml-auto flex w-8 flex-col items-start gap-1"
        onMouseEnter={openPeek}
        onMouseLeave={closePeek}
        onFocus={() => peekWidth === null && openPeek()}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closePeek()
        }}
      >
        <TocPlayButton />
        <button
          type="button"
          onClick={() => {
            closePeek()
            setCollapsed(false)
          }}
          aria-label={labels.expand}
          title={labels.expand}
          className={iconButton}
        >
          <ListIcon />
        </button>
        <div aria-hidden className="mt-3 flex flex-col items-start gap-2 pl-1">
          {flattenToc(tree).map(node => (
            <span
              key={node.id}
              className={`h-0.5 rounded-full transition-colors duration-200 ${BAR_WIDTH[node.level]} ${
                node.id === activeId ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        {peekWidth !== null && (
          <div className="absolute right-full top-0 z-30 pr-2">
            <div className={`${card} motion-safe:animate-fade-slide`} style={{ width: peekWidth }}>
              <div ref={scrollRef} className="max-h-[calc(100vh-10rem)] overflow-y-auto overscroll-contain p-2">
                <TocTree tree={tree} activeId={activeId} onNavigate={onNavigate} labels={labels} scrollRef={scrollRef} />
              </div>
            </div>
          </div>
        )}
      </nav>
    )
  }

  return (
    <nav
      aria-label={labels.title}
      className="sticky top-28 ml-auto flex max-h-[calc(100vh-8rem-var(--dock-h,0px))] w-full max-w-56 flex-col"
    >
      <div className="mb-2 flex items-center justify-between gap-2 pl-1">
        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {labels.title}
        </span>
        <div className="flex items-center gap-1">
          <TocPlayButton />
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label={labels.collapse}
            title={labels.collapse}
            className={iconButton}
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path d="M10 3.5 5.5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <TocTree tree={tree} activeId={activeId} onNavigate={onNavigate} labels={labels} scrollRef={scrollRef} />
      </div>
    </nav>
  )
}

export function ListIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path d="M2.5 4h11M5 8h8.5M7.5 12h6" strokeLinecap="round" />
    </svg>
  )
}
