'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { flattenToc, type TocNode } from '@/lib/toc'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'
import { useT } from '@/components/shared/LocaleProvider'
import { useReadAloud } from '@/components/shared/read-aloud/context'
import { ArrowUpIcon, PlayIcon } from '@/components/shared/read-aloud/icons'
import TocTree from './TocTree'
import { scrollToTop } from './useActiveHeading'
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
// The longest bar is as wide as the panel glyph above it (12px of the 16px icon); all of them
// end at its right edge, so deeper levels start further right, as they are indented when open.
const BAR_WIDTH = { 1: 'w-3', 2: 'w-2', 3: 'w-1.5' } as const
const PEEK_MAX_WIDTH = 256
const PEEK_MIN_WIDTH = 144

// The end of the contents: play (left) and back to top (right), as the same small circles,
// play in the primary colour and back to top in grey so play stays the main action.
const playCircle =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors duration-200 group-hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-400 dark:group-hover:bg-primary-900/70'
const topCircle =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors duration-200 group-hover:bg-gray-200 group-hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-700 dark:group-hover:text-gray-100'

// Starts reading aloud from the section being read (from the top above the first heading), so
// a reader halfway down the page need not scroll back up to the play tile. Null while reading
// (the player is on screen, and choosing a section moves the reading there) or unsupported.
function useListen(activeId: string | null): { label: string; start: () => void } | null {
  const reader = useReadAloud()
  const t = useT().readAloud
  if (!reader || reader.active || reader.supported === false) return null
  return { label: activeId ? t.listenFromHere : t.listen, start: () => reader.start(activeId ?? undefined) }
}

// Under the list.
export function TocListenRow({
  activeId,
  onStart,
  trailing,
  className = 'mt-2',
}: {
  activeId: string | null
  // Runs `start` itself, when the panel must get out of the way first (the phone drawer).
  onStart?: (start: () => void) => void
  // At the right end of the row (back to top on wide screens); keeps the row while reading.
  trailing?: ReactNode
  className?: string
}) {
  const listen = useListen(activeId)
  if (!listen && !trailing) return null
  return (
    <div className={`flex items-center gap-1 border-t border-gray-200 pt-2 dark:border-gray-800 ${className}`}>
      {listen ? (
        <button
          type="button"
          onClick={() => (onStart ? onStart(listen.start) : listen.start())}
          className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <span className={playCircle}>
            <PlayIcon className="ml-px h-3 w-3" />
          </span>
          <span className="truncate">{listen.label}</span>
        </button>
      ) : (
        <span className="flex-1" />
      )}
      {trailing}
    </div>
  )
}

// Shown once the reader is half a screen down; at the top of the page there is nowhere to go.
function useScrolledDown(): boolean {
  const [down, setDown] = useState(false)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setDown(window.scrollY > window.innerHeight / 2)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
  return down
}

// A circle in a square hit area: `p-1.5` beside the listen row's text, `p-0.5` on the rail
// (as wide as the rail).
const circleButton = 'group flex shrink-0 items-center justify-center motion-safe:animate-fade-in'

function BackToTopButton({ label, pad = 'p-1.5', hidden = false }: { label: string; pad?: string; hidden?: boolean }) {
  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      tabIndex={hidden ? -1 : undefined}
      className={`${circleButton} ${pad}`}
    >
      <span className={topCircle}>
        <ArrowUpIcon className="h-3.5 w-3.5" />
      </span>
    </button>
  )
}

// The end of the collapsed rail: the listen row without its words (the label is the tooltip).
// Whatever is last sits in the rail's column. Play alone is there; back to top, once it
// appears, grows into the column and pushes play out to its left, into the empty gutter.
function RailEnd({ activeId, showTop, topLabel }: { activeId: string | null; showTop: boolean; topLabel: string }) {
  const listen = useListen(activeId)
  if (!listen && !showTop) return null
  return (
    <div className="flex items-center">
      {listen && (
        <button
          type="button"
          onClick={listen.start}
          aria-label={listen.label}
          title={listen.label}
          className={`${circleButton} p-0.5`}
        >
          <span className={playCircle}>
            <PlayIcon className="ml-px h-3 w-3" />
          </span>
        </button>
      )}
      <div
        aria-hidden={!showTop}
        className={`overflow-hidden motion-safe:transition-[width,margin-left,opacity] motion-safe:duration-200 motion-safe:ease-out ${
          showTop ? 'ml-1 w-7 opacity-100' : 'ml-0 w-0 opacity-0'
        }`}
      >
        <BackToTopButton label={topLabel} pad="p-0.5" hidden={!showTop} />
      </div>
    </div>
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
  const scrolledDown = useScrolledDown()

  const openPeek = () => {
    const left = railRef.current?.getBoundingClientRect().left ?? 0
    setPeekWidth(Math.min(PEEK_MAX_WIDTH, Math.max(PEEK_MIN_WIDTH, left - 24)))
  }
  const closePeek = () => setPeekWidth(null)

  if (collapsed) {
    // Play and back to top end the rail, outside the part that opens the hover card on the way.
    return (
      <div className="sticky top-28 ml-auto flex w-7 flex-col items-end gap-3">
        <nav
          ref={railRef}
          aria-label={labels.title}
          className="relative flex flex-col items-end gap-1"
          onMouseEnter={openPeek}
          onMouseLeave={closePeek}
          onFocus={() => peekWidth === null && openPeek()}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closePeek()
          }}
        >
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
            <PanelOpenIcon />
          </button>
          <div aria-hidden className="mt-3 flex flex-col items-end gap-2 pr-2">
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
                  <TocListenRow activeId={activeId} />
                </div>
              </div>
            </div>
          )}
        </nav>
        <RailEnd activeId={activeId} showTop={scrolledDown} topLabel={labels.backToTop} />
      </div>
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
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label={labels.collapse}
          title={labels.collapse}
          className={iconButton}
        >
          <PanelCloseIcon />
        </button>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <TocTree tree={tree} activeId={activeId} onNavigate={onNavigate} labels={labels} scrollRef={scrollRef} />
      </div>
      <TocListenRow
        activeId={activeId}
        trailing={scrolledDown && <BackToTopButton label={labels.backToTop} />}
      />
    </nav>
  )
}

// Collapse and expand show the panel itself, so they read as "fold this panel away", not as
// "go back". From Lucide (panel-left-close / panel-left-open).
export function PanelCloseIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  )
}

export function PanelOpenIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  )
}

export function ListIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path d="M2.5 4h11M5 8h8.5M7.5 12h6" strokeLinecap="round" />
    </svg>
  )
}
