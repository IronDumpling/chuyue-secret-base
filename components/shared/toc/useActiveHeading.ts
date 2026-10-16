'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { pickActiveId } from '@/lib/toc'

// While a click-jump scrolls, the highlight stays on the target instead of flicking through
// every heading on the way. Control returns on `scrollend`, or after this long at the latest
// (browsers without `scrollend`, or a jump that needs no scrolling).
const JUMP_LOCK_MAX_MS = 1500

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// The heading being read, and a way to jump to one.
export function useActiveHeading(ids: string[]): { activeId: string | null; jumpTo: (id: string) => void } {
  const [activeId, setActiveId] = useState<string | null>(null)
  const jumping = useRef(false)
  const releaseJump = useRef<() => void>(() => {})
  const cancelPending = useRef<() => void>(() => {})

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      if (jumping.current) return
      const positions = ids.flatMap(id => {
        const el = document.getElementById(id)
        return el ? [{ id, top: el.getBoundingClientRect().top }] : []
      })
      const root = document.documentElement
      const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 2
      setActiveId(pickActiveId(positions, atBottom))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    releaseJump.current = () => {
      jumping.current = false
      schedule()
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    // Images loading and the window resizing move the headings without a scroll event.
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    return () => {
      window.removeEventListener('scroll', schedule)
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ids])

  const jumpTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    setActiveId(id)
    jumping.current = true
    // A second click mid-jump replaces the first jump's release.
    cancelPending.current()
    const timer = window.setTimeout(release, JUMP_LOCK_MAX_MS)
    function stop() {
      window.clearTimeout(timer)
      window.removeEventListener('scrollend', release)
    }
    function release() {
      stop()
      releaseJump.current()
    }
    cancelPending.current = stop
    window.addEventListener('scrollend', release)
    // 'instant', not 'auto': `auto` would follow the global `scroll-behavior: smooth`.
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${encodeURIComponent(id)}`)
  }, [])

  return { activeId, jumpTo }
}
