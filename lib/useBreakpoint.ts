'use client'

import { useEffect, useState } from 'react'

// Tailwind's default min-widths, so scripts and `md:` classes agree on where the layout changes.
export const BREAKPOINTS = { md: 768, lg: 1024, xl: 1280 } as const

// True while the viewport is at least `name` wide. Starts false on the server and first paint, then
// follows the media query, so a layer can react when a resize crosses the breakpoint.
export function useBreakpoint(name: keyof typeof BREAKPOINTS): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${BREAKPOINTS[name]}px)`)
    const update = () => setMatches(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [name])

  return matches
}
