// Geometry for the rating meter and its popover. Pure, so it can be tested without a DOM.
import type { Score } from './ratings'

// A frontmatter score is written by hand; the meter still draws something sensible for 7.5 or 0.
export function clampScore(n: number): Score {
  if (!Number.isFinite(n)) return 5
  return Math.min(10, Math.max(1, Math.round(n))) as Score
}

// The meter's track has 5 at its center; each step away from 5 is a tenth of the track.
// start and width are fractions of the track.
export function meterFill(score: Score): { side: 'above' | 'below' | 'none'; start: number; width: number } {
  const offset = (score - 5) / 10
  if (offset === 0) return { side: 'none', start: 0.5, width: 0 }
  if (offset > 0) return { side: 'above', start: 0.5, width: offset }
  return { side: 'below', start: 0.5 + offset, width: -offset }
}

interface Rect {
  top: number
  bottom: number
  left: number
  width: number
}

// Below the anchor if it fits, else above if that fits, else below. Left-aligned with the
// anchor, kept `margin` away from both viewport edges.
export function placePopover(
  anchor: Rect,
  pop: { width: number; height: number },
  viewport: { width: number; height: number },
  gap = 8,
  margin = 12
): { top: number; left: number; placement: 'below' | 'above' } {
  const below = anchor.bottom + gap
  const above = anchor.top - gap - pop.height
  const fitsBelow = below + pop.height <= viewport.height - margin
  const fitsAbove = above >= margin
  const placement = !fitsBelow && fitsAbove ? 'above' : 'below'
  const maxLeft = viewport.width - margin - pop.width
  const left = Math.max(margin, Math.min(anchor.left, maxLeft))
  return { top: placement === 'below' ? below : above, left, placement }
}

// The slider moves continuously under a finger, but the keyboard moves one whole score at a
// time, from the score the thumb is nearest. null for keys the slider does not handle.
export function keyStep(key: string, position: number): Score | null {
  const current = clampScore(position)
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return clampScore(current + 1)
    case 'ArrowLeft':
    case 'ArrowDown':
      return clampScore(current - 1)
    case 'Home':
      return 1
    case 'End':
      return 10
    default:
      return null
  }
}

// Frontmatter is hand-written: `rating:` (null), `rating: ""` or `rating: "7"` is not a score,
// and must not be drawn as one.
export function hasScore(rating: unknown): rating is number {
  return typeof rating === 'number' && Number.isFinite(rating)
}
