'use client'

import { useEffect, useRef, useState } from 'react'
import type { TocNode } from '@/lib/toc'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'
import { useT } from '@/components/shared/LocaleProvider'
import { useReadAloud } from '@/components/shared/read-aloud/context'
import { CONTENT_ID } from '@/components/shared/read-aloud/extract'
import { ArrowUpIcon, EllipsisVerticalIcon, PlayIcon, XIcon } from '@/components/shared/read-aloud/icons'
import { prefersReducedMotion } from './useActiveHeading'
import TocTree from './TocTree'
import { ListIcon, PanelCloseIcon, TocListenRow } from './TocSidebar'
import { useDragToDismiss } from './useDragToDismiss'

interface TocFloatingProps {
  // Empty when the page is too short for a table of contents; the button then only offers
  // reading aloud.
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
  // Only tablets reflow (`.toc-shift`). On phones pinning would only fight the scroll of a
  // jump chosen in the drawer, which closes as that jump starts.
  if (!window.matchMedia('(min-width: 768px) and (max-width: 1279.98px)').matches) return
  // The paragraph being read aloud, if any; otherwise the first small block on screen (a
  // paragraph, a list item), not whole lists: a long list's top may be far above the screen,
  // and pinning it would not keep the visible line in place.
  const reading = document.querySelector<HTMLElement>('.prose [data-reading]')
  const blocks = document.querySelectorAll<HTMLElement>(
    '.prose :is(p, li, h1, h2, h3, h4, pre, img, blockquote, table, hr)'
  )
  const header = 96
  const anchor = reading ?? Array.from(blocks).find(el => el.getBoundingClientRect().top >= header)
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
const dialItem = `group relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 shadow-md transition-colors duration-200 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 motion-safe:animate-dial-in ${surface}`
// Icon-only items explain themselves on hover: to the left on phones (button at the right
// edge), to the right on tablets (button at the left edge).
const tooltip =
  'pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-gray-100 dark:text-gray-900 right-full mr-2 md:left-full md:right-auto md:ml-2 md:mr-0'

// Below the wide breakpoint: a round button ringed with reading progress. It opens a small
// vertical menu (icons only) of the table of contents and reading aloud, whichever the page
// has, and back to top; with neither of the first two it goes back to top directly. On
// tablets it sits bottom-left and the
// contents open as a sidebar from the left edge that pushes the article right (see
// `.toc-shift` in globals.css) and stays open while the reader jumps around; on phones it sits
// bottom-right and the contents open as a bottom drawer that closes once an entry is chosen.
// While reading aloud the button is hidden: the player at the bottom has the contents button.
export default function TocFloating({ tree, activeId, onNavigate, labels }: TocFloatingProps) {
  const reader = useReadAloud()
  const readLabels = useT().readAloud
  const [localOpen, setLocalOpen] = useState(false)
  // Shared with the player when reading aloud is available, so its contents button opens this.
  const open = reader ? reader.tocOpen : localOpen
  const setOpen = reader ? reader.setTocOpen : setLocalOpen
  const [dialOpen, setDialOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const panelScrollRef = useRef<HTMLDivElement>(null)
  const drawerScrollRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const hasToc = tree.length > 0
  const canRead = !!reader && reader.supported !== false
  const reading = !!reader?.active
  const holdScroll = reader?.holdScroll

  // Appears once the first heading (or, without headings, the article) is on screen, and
  // tracks how far through the page we are.
  useEffect(() => {
    const first = (tree[0] && document.getElementById(tree[0].id)) || document.getElementById(CONTENT_ID)
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
    // and xl, so setting it on phones is harmless. Reading aloud stops following the text
    // while it reflows, so the two do not both move the page.
    holdScroll?.(SHIFT_MS)
    holdReadingPosition()
    document.documentElement.dataset.tocPanel = ''
    // The drawer covers the page on phones; keep the page from scrolling behind it.
    const isPhone = window.matchMedia('(max-width: 767.98px)').matches
    const previousOverflow = document.body.style.overflow
    if (isPhone) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      holdScroll?.(SHIFT_MS)
      holdReadingPosition()
      delete document.documentElement.dataset.tocPanel
      if (isPhone) document.body.style.overflow = previousOverflow
    }
  }, [open, setOpen, holdScroll])

  useEffect(() => {
    if (!dialOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDialOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dialOpen])

  // Starting to read (from anywhere) folds the menu away.
  useEffect(() => {
    if (reading) setDialOpen(false)
  }, [reading])

  useDragToDismiss({
    enabled: open && hasToc,
    sheetRef: drawerRef,
    scrollRef: drawerScrollRef,
    backdropRef,
    onDismiss: () => setOpen(false),
  })

  // Close the drawer, then act once the body scroll lock has come off (the action scrolls).
  const fromDrawer = (action: () => void) => {
    setOpen(false)
    requestAnimationFrame(action)
  }
  const navigateFromDrawer = (id: string) => fromDrawer(() => onNavigate(id))
  const openToc = () => {
    setDialOpen(false)
    setOpen(true)
  }
  const startReading = () => {
    setDialOpen(false)
    reader?.start()
  }
  const backToTop = () => {
    setDialOpen(false)
    // 'instant', not 'auto': `auto` would follow the global `scroll-behavior: smooth`.
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
  }
  // Back to top is always there; a menu is worth opening only with something besides it.
  const menu = hasToc || canRead
  const onMainClick = menu ? () => setDialOpen(value => !value) : backToTop
  const mainLabel = menu ? (dialOpen ? readLabels.closeMenu : readLabels.menu) : labels.backToTop
  const showButton = !open && !reading

  // Open on a phone, the drawer covers the header (z-50); on a tablet the sidebar stays under it
  // so the header's scroll shadow falls across the sidebar the same as across the article.
  return (
    <div
      className={`fixed right-4 md:left-4 md:right-auto ${open ? 'z-[60] md:z-40' : 'z-40'} motion-safe:transition-opacity motion-safe:duration-300 ${
        (visible && !reading) || open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      {open && hasToc && (
        <>
          {/* Tablets: a sidebar below the header; the article moves right to make room. */}
          <nav
            aria-label={labels.title}
            className="fixed bottom-0 left-0 top-20 hidden w-72 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:flex motion-safe:animate-panel-in"
          >
            <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {labels.title}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.collapse}
                title={labels.collapse}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                <PanelCloseIcon />
              </button>
            </div>
            <div ref={panelScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4">
              <TocTree tree={tree} activeId={activeId} onNavigate={onNavigate} labels={labels} scrollRef={panelScrollRef} />
            </div>
            <TocListenRow activeId={activeId} className="mx-2 mb-4" />
          </nav>

          {/* Phones: a bottom drawer over a dimmed page. */}
          <div className="md:hidden">
            <div
              ref={backdropRef}
              aria-hidden
              className="fixed inset-0 bg-black/40 motion-safe:animate-fade-in"
              onClick={() => setOpen(false)}
            />
            {/* Drags down and away (useDragToDismiss), like the sheets it imitates. */}
            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={labels.title}
              className={`fixed inset-x-0 bottom-0 flex max-h-[70vh] flex-col rounded-t-2xl shadow-2xl motion-safe:animate-drawer-in ${surface}`}
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div aria-hidden className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{labels.title}</span>
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
              <TocListenRow activeId={activeId} onStart={fromDrawer} className="mx-2 mb-2" />
            </div>
          </div>
        </>
      )}

      {showButton && dialOpen && (
        <>
          {/* A faint veil: tapping anywhere else folds the menu. */}
          <div aria-hidden className="fixed inset-0 -z-10 bg-black/10 motion-safe:animate-fade-in dark:bg-black/30" onClick={() => setDialOpen(false)} />
          {/* Rises from the main button: contents nearest the thumb, then play, then back to
              top, the one used least while reading. */}
          <div className="absolute inset-x-0 bottom-full mb-3 flex flex-col-reverse items-center gap-3">
            {[
              hasToc && { label: labels.open, onClick: openToc, icon: <ListIcon className="h-4 w-4" /> },
              canRead && { label: readLabels.listen, onClick: startReading, icon: <PlayIcon className="ml-px h-4 w-4" /> },
              { label: labels.backToTop, onClick: backToTop, icon: <ArrowUpIcon className="h-4 w-4" /> },
            ]
              .filter(item => !!item)
              .map((item, i) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  aria-label={item.label}
                  className={dialItem}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {item.icon}
                  <span aria-hidden className={tooltip}>
                    {item.label}
                  </span>
                </button>
              ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onMainClick}
        aria-label={mainLabel}
        aria-expanded={menu ? dialOpen : undefined}
        // Open, the drawer / sidebar has its own close button and the corner button would sit
        // on it; while reading, the player carries the contents button instead.
        className={`${showButton ? '' : 'hidden'} relative flex h-12 w-12 items-center justify-center rounded-full text-gray-700 shadow-lg transition-colors duration-200 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400 ${surface}`}
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
        {menu ? (
          // The dots (a menu, not the contents' list glyph, and the same on either side of the
          // screen) turn flat and give way to a close cross while the menu is open.
          <span className="relative h-5 w-5">
            <EllipsisVerticalIcon
              className={`absolute inset-0 h-5 w-5 motion-safe:transition-[transform,opacity] motion-safe:duration-200 ${
                dialOpen ? 'rotate-90 scale-75 opacity-0' : 'opacity-100'
              }`}
            />
            <XIcon
              className={`absolute inset-0 h-5 w-5 motion-safe:transition-[transform,opacity] motion-safe:duration-200 ${
                dialOpen ? 'opacity-100' : '-rotate-45 opacity-0'
              }`}
            />
          </span>
        ) : (
          <ArrowUpIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
