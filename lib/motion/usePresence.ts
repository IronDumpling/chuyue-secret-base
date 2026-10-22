'use client'

import { useEffect, useRef, useState } from 'react'

export type PresenceState = 'enter' | 'entered' | 'exit'

// Read a --dur-* token from CSS so scripts and stylesheets cannot drift apart.
export function readDuration(token: 'fast' | 'base' | 'slow', fallback: number): number {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--dur-${token}`).trim()
  const ms = parseFloat(raw)
  return Number.isFinite(ms) ? ms : fallback
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Keeps a layer mounted while its exit animation plays.
//   open   -> `mounted` at once; `state` is 'enter' (play the entrance), then 'entered'
//   closed -> `state` is 'exit' (play the exit); `mounted` drops after `exitMs`
// 'entered' arrives after `enterMs`, or two frames when that is 0 (enough for a CSS transition to
// have a painted starting point). A keyframe entrance should pass its own length, so the class
// that runs it is not removed halfway.
// Reopening during an exit cancels the pending unmount, so a quick close-then-open never tears the
// layer down.
export function usePresence(
  open: boolean,
  exitMs: number,
  enterMs = 0
): { mounted: boolean; state: PresenceState } {
  const [lingering, setLingering] = useState(open)
  const [settled, setSettled] = useState(open)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timer.current)
    if (open) {
      setLingering(true)
      setSettled(false)
      if (enterMs > 0 && !prefersReducedMotion()) {
        timer.current = setTimeout(() => setSettled(true), enterMs)
        return () => clearTimeout(timer.current)
      }
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setSettled(true)))
      return () => cancelAnimationFrame(frame)
    }
    timer.current = setTimeout(() => setLingering(false), prefersReducedMotion() ? 0 : exitMs)
    return () => clearTimeout(timer.current)
  }, [open, exitMs, enterMs])

  // Derived from `open` so the first render after a change is already right (no frame of the old state).
  return { mounted: open || lingering, state: !open ? 'exit' : settled ? 'entered' : 'enter' }
}
