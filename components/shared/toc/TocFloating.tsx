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
const surface = 'border border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95'

// Below the wide breakpoint: a round button in the bottom-right corner, ringed with reading
// progress. From md up it opens a card above itself that stays open while the reader jumps
// around; on phones it opens a bottom drawer that closes as soon as an entry is chosen.
export default function TocFloating({ tree, activeId, onNavigate, labels }: TocFloatingProps) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
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
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    // The drawer covers the page on phones; keep the page from scrolling behind it.
    const isPhone = window.matchMedia('(max-width: 767.98px)').matches
    const previousOverflow = document.body.style.overflow
    if (isPhone) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
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
      ref={rootRef}
      className={`fixed right-4 ${open ? 'z-[60]' : 'z-40'} motion-safe:transition-opacity motion-safe:duration-300 ${
        visible || open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      {open && (
        <>
          {/* md and up: a card above the button. */}
          <div
            className={`absolute bottom-full right-0 mb-3 hidden w-80 rounded-xl shadow-lg md:block motion-safe:animate-feed-in ${surface}`}
          >
            <div className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {labels.title}
            </div>
            <div ref={panelScrollRef} className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
              <TocTree tree={tree} activeId={activeId} onNavigate={onNavigate} labels={labels} scrollRef={panelScrollRef} />
            </div>
          </div>

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
        // On phones the open drawer has its own close button and the corner button would sit on it.
        className={`${open ? 'max-md:hidden' : ''} relative flex h-12 w-12 items-center justify-center rounded-full text-gray-700 shadow-lg transition-colors duration-200 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 ${surface}`}
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
