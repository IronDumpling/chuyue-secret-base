'use client'

import { useEffect } from 'react'

// While the window is being resized, layouts swap (menu, filters, contents) and elements that
// appear or move would otherwise animate from their old size to the new one, trailing the drag.
// `html[data-resizing]` switches transitions off (see globals.css) until the resize settles.
export default function ResizeGuard() {
  useEffect(() => {
    const root = document.documentElement
    let timer: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      if (timer === undefined) root.dataset.resizing = ''
      clearTimeout(timer)
      timer = setTimeout(() => {
        timer = undefined
        delete root.dataset.resizing
      }, 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timer)
      delete root.dataset.resizing
    }
  }, [])
  return null
}
