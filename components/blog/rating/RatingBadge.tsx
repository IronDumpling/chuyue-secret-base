'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import type { RatingScale } from '@/lib/ratings'
import { clampScore, placePopover } from '@/lib/rating-meter'
import { usePresence, readDuration } from '@/lib/motion/usePresence'
import { lockScroll } from '@/lib/scroll-lock'
import { useBreakpoint } from '@/lib/useBreakpoint'
import { useIsomorphicLayoutEffect } from '@/lib/useIsomorphicLayoutEffect'
import { useT } from '@/components/shared/LocaleProvider'
import { format } from '@/lib/i18n/format'
import RatingMeter from './RatingMeter'
import RatingExplorer from './RatingExplorer'

interface RatingBadgeProps {
  score: number
  scale: RatingScale
  categoryName: string
  size?: 'sm' | 'md'
  className?: string
}

const POPOVER_WIDTH = 340
const SWIPE_CLOSE_PX = 60

// A review's score as a button: the meter, which opens the rating scale for the post's
// category. An anchored popover from `md` (like ShareBar), a bottom sheet below it. The button
// sits above any link overlay of its row (relative z-10) and swallows its own click, so
// opening the scale never follows the row's link.
export default function RatingBadge({ score, scale, categoryName, size = 'sm', className = '' }: RatingBadgeProps) {
  const t = useT().blog.rating
  const value = clampScore(score)
  const name = scale.tiers[value].name
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const headingId = useId()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [drag, setDrag] = useState<{ startY: number; dy: number } | null>(null)
  const desktop = useBreakpoint('md')
  const { mounted, state } = usePresence(open, readDuration(desktop ? 'fast' : 'slow', desktop ? 150 : 350))
  const visible = state === 'entered'

  const close = () => setOpen(false)

  const toggle = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(o => !o)
  }

  // Focus returns to the meter once the layer is gone.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus()
    wasOpen.current = open
  }, [open])

  // Desktop: place under the meter (or above, if it does not fit), follow scroll and resize,
  // and close once the meter has left the viewport.
  useIsomorphicLayoutEffect(() => {
    if (!open || !desktop) return
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect()
      if (!rect) return
      if (rect.bottom < 0 || rect.top > window.innerHeight) return close()
      const height = panel.current?.offsetHeight ?? 0
      const { top, left } = placePopover(
        rect,
        { width: POPOVER_WIDTH, height },
        { width: window.innerWidth, height: window.innerHeight }
      )
      setPosition({ top, left })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, desktop, mounted])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // The sheet covers the page, so the page must not scroll behind it.
  useEffect(() => {
    if (open && !desktop) return lockScroll()
  }, [open, desktop])

  // Keep Tab inside the sheet: wrap between its first and last focusable element.
  const trapTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || desktop) return
    const items = panel.current?.querySelectorAll<HTMLElement>('input, button:not(.invisible)')
    if (!items || items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  // Swipe down on the grab handle to close the sheet. The start is kept in a ref, not state: a
  // quick flick can deliver move and up before React re-renders with the new state.
  const dragStart = useRef<number | null>(null)
  const onHandleDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = event.clientY
    setDrag({ startY: event.clientY, dy: 0 })
  }
  const onHandleMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (start !== null) setDrag({ startY: start, dy: Math.max(0, event.clientY - start) })
  }
  const onHandleUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    dragStart.current = null
    setDrag(null)
    if (start !== null && event.clientY - start > SWIPE_CLOSE_PX) close()
  }

  const explorer = (
    <RatingExplorer scale={scale} categoryName={categoryName} postScore={value} autoFocus headingId={headingId} />
  )

  const layer =
    mounted &&
    typeof document !== 'undefined' &&
    createPortal(
      desktop ? (
        <>
          {/* Transparent click-catcher: an outside click closes the popover. */}
          <div className="fixed inset-0 z-40" onClick={close} />
          <div
            ref={panel}
            role="dialog"
            aria-modal="false"
            aria-labelledby={headingId}
            className={`fixed z-50 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl transition-[opacity,transform] duration-fast ease-ios dark:border-gray-800 dark:bg-gray-900 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            }`}
            style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
          >
            {explorer}
          </div>
        </>
      ) : (
        <div
          className={`fixed inset-0 z-50 bg-gray-900/35 transition-opacity duration-slow ease-ios ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={close}
        >
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            onClick={event => event.stopPropagation()}
            onKeyDown={trapTab}
            className={`absolute inset-x-0 bottom-0 rounded-t-2xl bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2.5 dark:bg-gray-900 ${
              drag ? '' : 'transition-transform duration-slow ease-ios'
            } ${visible ? '' : 'translate-y-full'}`}
            style={drag ? { transform: `translateY(${drag.dy}px)` } : undefined}
          >
            <div
              className="-mx-5 -mt-2.5 mb-2 flex touch-none justify-center pb-2 pt-2.5"
              onPointerDown={onHandleDown}
              onPointerMove={onHandleMove}
              onPointerUp={onHandleUp}
              onPointerCancel={() => {
                dragStart.current = null
                setDrag(null)
              }}
            >
              <span className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
            {explorer}
          </div>
        </div>
      ),
      document.body
    )

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={toggle}
        aria-label={format(t.meterLabel, { n: value, name })}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`relative z-10 -mx-1.5 -my-0.5 inline-flex rounded-md px-1.5 py-0.5 transition-colors hover:bg-primary-500/[.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${className}`}
      >
        <RatingMeter score={value} name={name} size={size} />
      </button>
      {layer}
    </>
  )
}
