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
//   open     -> mounted at once, `state` is 'enter' (play the entrance), then 'entered'
//   closed   -> `state` is 'exit' (play the exit); unmounts after `durationMs`
// Reopening during the exit cancels the pending unmount, so a quick close-then-open never tears the layer down.
export function usePresence(open: boolean, durationMs: number): { mounted: boolean; state: PresenceState } {
  const [mounted, setMounted] = useState(open)
  const [state, setState] = useState<PresenceState>(open ? 'entered' : 'exit')
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timer.current)
    if (open) {
      setMounted(true)
      setState('enter')
      // Two frames: let the 'enter' styles paint before 'entered' so a transition has something to run from.
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setState('entered')))
      return () => cancelAnimationFrame(frame)
    }
    setState('exit')
    const wait = prefersReducedMotion() ? 0 : durationMs
    timer.current = setTimeout(() => setMounted(false), wait)
    return () => clearTimeout(timer.current)
  }, [open, durationMs])

  return { mounted, state }
}
