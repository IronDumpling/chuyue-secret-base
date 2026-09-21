'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

// A single element that slides to whichever menu item is active, instead of every item
// switching its own background. The container must be `position: relative` and each item
// carries `data-key`; the indicator is an absolutely positioned child styled by `style`.
export function useSlidingIndicator<T extends HTMLElement>(
  activeKey: string | null,
  axis: 'x' | 'y'
): { containerRef: RefObject<T>; style: CSSProperties; animate: boolean } {
  const containerRef = useRef<T>(null)
  const [box, setBox] = useState<{ offset: number; size: number } | null>(null)
  // The first position is set without a transition, otherwise the indicator would fly in
  // from the corner on page load.
  const [animate, setAnimate] = useState(false)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || activeKey === null) {
      setBox(null)
      return
    }
    const measure = () => {
      const item = Array.from(container.querySelectorAll<HTMLElement>('[data-key]')).find(
        el => el.dataset.key === activeKey
      )
      if (!item) return setBox(null)
      setBox(
        axis === 'x'
          ? { offset: item.offsetLeft, size: item.offsetWidth }
          : { offset: item.offsetTop, size: item.offsetHeight }
      )
    }
    measure()
    // Labels and the container change width with the window and with fonts loading.
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [activeKey, axis])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const style: CSSProperties = box
    ? axis === 'x'
      ? { transform: `translateX(${box.offset}px)`, width: box.size }
      : { transform: `translateY(${box.offset}px)`, height: box.size }
    : { opacity: 0 }

  return { containerRef, style, animate }
}
