'use client'

import { useEffect, useRef, useState } from 'react'
import type { TocNode } from '@/lib/toc'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'
import TocTree from './TocTree'
import { ListIcon } from './TocSidebar'

interface TocFloatingProps {
  tree: TocNode[]
  activeId: string | null
  onNavigate: (id: string) => void
  labels: Dictionary['toc']
}

const RING_RADIUS = 21
const RING_LENGTH = 2 * Math.PI * RING_RADIUS
// How long the article takes to move aside (matches `.toc-shift` in globals.css), plus a margin.
const SHIFT_MS = 350

// The article reflows while it moves aside for the sidebar; keep the paragraph being read at
// the same height on screen through every frame of that, instead of letting the text slide away.
function holdReadingPosition() {
  // Small blocks (a paragraph, a list item), not whole lists: a long list's top may be far
  // above the screen, and pinning it would not keep the visible line in place.
  const blocks = document.querySelectorAll<HTMLElement>(
    '.prose :is(p, li, h1, h2, h3, h4, pre, img, blockquote, table, hr)'
  )
  const header = 96
  const anchor = Array.from(blocks).find(el => el.getBoundingClientRect().top >= header)
  if (!anchor) return
  const top = anchor.getBoundingClientRect().top
  const until = performance.now() + SHIFT_MS
  const step = () => {
    const drift = anchor.getBoundingClientRect().top - top
    if (Math.abs(drift) >= 1) window.scrollBy({ top: drift, behavior: 'instant' })
    if (performance.now() < until) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const surface = 'border border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95'

// Below the wide breakpoint: a round button ringed with reading progress. On tablets it sits
// bottom-left and opens a sidebar from the left edge that pushes the article right (see
// `.toc-shift` in globals.css) and stays open while the reader jumps around; on phones it sits
// bottom-right and opens a bottom drawer that closes as soon as an entry is chosen.
export default function TocFloating({ tree, activeId, onNavigate, labels }: TocFloatingProps) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const panelScrollRef = useRef<HTMLDivElement>(null)
  const drawerScrollRef = useRef<HTMLDivElement>(null)

  // Appears once the first heading is on screen, and tracks how far through the page we are.
  useEffect(() => {
    const first = tree[0] && document.getElementById(tree[0].id)
    let frame = 0
    const update = () => {
      frame = 0
      const root = document.documentElement
      const scrollable = root.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1)
      setVisible(!first || first.getBoundingClientRect().top < window.innerHeight)
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
  }, [tree])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    // Tablets: the article makes room for the sidebar. The CSS rule only applies between md
    // and xl, so setting it on phones is harmless.
    holdReadingPosition()
    document.documentElement.dataset.tocPanel = ''
    // The drawer covers the page on phones; keep the page from scrolling behind it.
    const isPhone = window.matchMedia('(max-width: 767.98px)').matches
    const previousOverflow = document.body.style.overflow
    if (isPhone) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      holdReadingPosition()
      delete document.documentElement.dataset.tocPanel
      if (isPhone) document.body.style.overflow = previousOverflow
    }
  }, [open])

  const navigateFromDrawer = (id: string) => {
    setOpen(false)
    // Let the body scroll lock come off before scrolling.
    requestAnimationFrame(() => onNavigate(id))
  }

  return (
    <div
      className={`fixed right-4 md:left-4 md:right-auto ${open ? 'z-[60]' : 'z-40'} motion-safe:transition-opacity motion-safe:duration-300 ${
        visible || open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      {open && (
        <>
          {/* Tablets: a sidebar below the header; the article moves right to make room. */}
          <nav
            aria-label={labels.title}
            className="fixed bottom-0 left-0 top-20 hidden w-72 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:flex motion-safe:animate-panel-in"
          >
            <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {labels.title}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.collapse}
                title={labels.collapse}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path d="M10 3.5 5.5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div ref={panelScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-6">
              <TocTree tree={tree} activeId={activeId} onNavigate={onNavigate} labels={labels} scrollRef={panelScrollRef} />
            </div>
          </nav>

          {/* Phones: a bottom drawer over a dimmed page. */}
          <div className="md:hidden">
            <div aria-hidden className="fixed inset-0 bg-black/40 motion-safe:animate-fade-in" onClick={() => setOpen(false)} />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={labels.title}
              className={`fixed inset-x-0 bottom-0 flex max-h-[70vh] flex-col rounded-t-2xl shadow-2xl motion-safe:animate-drawer-in ${surface}`}
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div aria-hidden className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{labels.title}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={labels.close}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                    <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div ref={drawerScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4">
                <TocTree
                  tree={tree}
                  activeId={activeId}
                  onNavigate={navigateFromDrawer}
                  labels={labels}
                  dense={false}
                  scrollRef={drawerScrollRef}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        // Open, the drawer / sidebar has its own close button and the corner button would sit on it.
        className={`${open ? 'hidden' : ''} relative flex h-12 w-12 items-center justify-center rounded-full text-gray-700 shadow-lg transition-colors duration-200 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 ${surface}`}
      >
        <svg aria-hidden className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={RING_RADIUS} fill="none" strokeWidth={2} className="stroke-gray-200 dark:stroke-gray-800" />
          <circle
            cx="24"
            cy="24"
            r={RING_RADIUS}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - progress)}
            className="stroke-primary-500"
          />
        </svg>
        <ListIcon className="h-5 w-5" />
      </button>
    </div>
  )
}
