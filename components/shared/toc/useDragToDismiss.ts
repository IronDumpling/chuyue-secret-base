'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { prefersReducedMotion } from './useActiveHeading'

// Past this far down (or a quarter of the sheet, if less), or flicked faster than this, the
// sheet goes; otherwise it springs back.
const DISMISS_PX = 80
const DISMISS_SPEED = 0.5 // px per ms
// Movement before the gesture counts as a drag (or as a scroll, upwards).
const SLOP_PX = 4
const SETTLE = '220ms cubic-bezier(0.2, 0, 0, 1)'

// A bottom sheet that can be dragged down and away, like the ones it imitates. Anywhere on the
// sheet works, except that inside its scrolling list a downward drag only takes the sheet once
// the list is at its top; until then it scrolls the list. Touch events, not pointer events: the
// browser cancels a pointer as soon as it starts panning, and only a non-passive touchmove can
// keep the list from scrolling while the sheet is being dragged.
export function useDragToDismiss({
  enabled,
  sheetRef,
  scrollRef,
  backdropRef,
  onDismiss,
}: {
  enabled: boolean
  sheetRef: RefObject<HTMLElement | null>
  scrollRef: RefObject<HTMLElement | null>
  backdropRef: RefObject<HTMLElement | null>
  onDismiss: () => void
}) {
  const dismiss = useRef(onDismiss)
  dismiss.current = onDismiss

  useEffect(() => {
    const sheet = sheetRef.current
    if (!enabled || !sheet) return
    let state: 'idle' | 'pending' | 'drag' = 'idle'
    let startY = 0
    let lastY = 0
    let lastTime = 0
    let speed = 0

    const place = (dy: number, transition: string) => {
      const backdrop = backdropRef.current
      sheet.style.transition = transition && `transform ${transition}`
      sheet.style.transform = dy > 0 ? `translateY(${dy}px)` : ''
      if (backdrop) {
        backdrop.style.transition = transition && `opacity ${transition}`
        backdrop.style.opacity = dy > 0 ? String(Math.max(0, 1 - dy / sheet.offsetHeight)) : ''
      }
    }

    const onStart = (event: TouchEvent) => {
      const list = scrollRef.current
      const inScrolledList = !!list && list.contains(event.target as Node) && list.scrollTop > 0
      state = event.touches.length === 1 && !inScrolledList ? 'pending' : 'idle'
      startY = lastY = event.touches[0].clientY
      lastTime = event.timeStamp
      speed = 0
    }

    const onMove = (event: TouchEvent) => {
      if (state === 'idle') return
      const y = event.touches[0].clientY
      const dy = y - startY
      if (state === 'pending') {
        if (dy < -SLOP_PX) state = 'idle'
        // Claim a downward move from its first pixel: once iOS has started rubber-banding the
        // list, the move can no longer be cancelled.
        if (dy > 0) event.preventDefault()
        if (dy <= SLOP_PX) return
        state = 'drag'
        // The entrance animations hold their end frame (`both`), which would win over the
        // inline transform; they are over by now, so dropping them changes nothing on screen.
        sheet.style.animation = 'none'
        if (backdropRef.current) backdropRef.current.style.animation = 'none'
      }
      event.preventDefault()
      const elapsed = event.timeStamp - lastTime
      if (elapsed > 0) speed = (y - lastY) / elapsed
      lastY = y
      lastTime = event.timeStamp
      place(Math.max(0, dy), '')
    }

    const onEnd = () => {
      if (state !== 'drag') {
        state = 'idle'
        return
      }
      state = 'idle'
      const dy = lastY - startY
      const height = sheet.offsetHeight
      if (dy > Math.min(DISMISS_PX, height / 4) || speed > DISMISS_SPEED) {
        if (prefersReducedMotion()) return dismiss.current()
        let gone = false
        const go = () => {
          if (!gone) dismiss.current()
          gone = true
        }
        place(height, SETTLE)
        sheet.addEventListener('transitionend', go, { once: true })
        // In case the transition never runs (already at the bottom).
        window.setTimeout(go, 300)
      } else {
        place(0, SETTLE)
      }
    }

    sheet.addEventListener('touchstart', onStart, { passive: true })
    sheet.addEventListener('touchmove', onMove, { passive: false })
    sheet.addEventListener('touchend', onEnd)
    sheet.addEventListener('touchcancel', onEnd)
    return () => {
      sheet.removeEventListener('touchstart', onStart)
      sheet.removeEventListener('touchmove', onMove)
      sheet.removeEventListener('touchend', onEnd)
      sheet.removeEventListener('touchcancel', onEnd)
    }
  }, [enabled, sheetRef, scrollRef, backdropRef])
}
