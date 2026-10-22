'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/motion/usePresence'

// How long the outgoing content takes to fade (the `fade-out` animation is 200ms).
const LEAVE_MS = 180

// Content that is replaced when `swapKey` changes (a filtered list): the old content fades out
// where it stands, then the new content takes its place, so the page height does not snap
// before the eye has left the old items. The first change after load is not animated: the
// client may swap the server-rendered list for the filtered one before anything is painted.
export default function SwapFade({ swapKey, children }: { swapKey: string; children: ReactNode }) {
  const [key, setKey] = useState(swapKey)
  const [leaving, setLeaving] = useState<{ node: ReactNode } | null>(null)
  const last = useRef(children)
  const armed = useRef(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => (armed.current = true))
    return () => cancelAnimationFrame(frame)
  }, [])

  if (key !== swapKey) {
    setKey(swapKey)
    if (armed.current && !prefersReducedMotion()) setLeaving({ node: last.current })
  } else {
    last.current = children
  }

  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(() => setLeaving(null), LEAVE_MS)
    return () => clearTimeout(timer)
  }, [leaving])

  if (leaving) {
    return (
      <div aria-hidden className="pointer-events-none motion-safe:animate-fade-out">
        {leaving.node}
      </div>
    )
  }
  return <>{children}</>
}
