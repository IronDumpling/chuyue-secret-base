'use client'

import { useCallback, useEffect, useState } from 'react'

const KEY = 'toc:collapsed'

// Whether the wide-screen table of contents is folded to its rail; remembered across posts.
// Read after mount so the server render and the first client render agree (expanded).
export function useTocCollapsed(): [boolean, (collapsed: boolean) => void] {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(KEY) === '1')
    } catch {
      // Storage blocked (private mode, site data off): stay expanded.
    }
  }, [])

  const update = useCallback((value: boolean) => {
    setCollapsed(value)
    try {
      window.localStorage.setItem(KEY, value ? '1' : '0')
    } catch {
      // Not remembered; fine.
    }
  }, [])

  return [collapsed, update]
}
