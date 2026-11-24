import { describe, it, expect } from 'vitest'
import { clampScore, keyStep, meterFill, placePopover } from './rating-meter'

describe('clampScore', () => {
  it('rounds to a whole score', () => {
    expect(clampScore(7.5)).toBe(8)
    expect(clampScore(7.4)).toBe(7)
  })
  it('keeps the score inside 1-10', () => {
    expect(clampScore(0)).toBe(1)
    expect(clampScore(11)).toBe(10)
  })
  it('treats a non-number as the midpoint', () => {
    expect(clampScore(NaN)).toBe(5)
  })
})

describe('meterFill', () => {
  function expectFill(score: Parameters<typeof meterFill>[0], side: string, start: number, width: number) {
    const fill = meterFill(score)
    expect(fill.side).toBe(side)
    expect(fill.start).toBeCloseTo(start)
    expect(fill.width).toBeCloseTo(width)
  }
  it('fills rightward from the center for a pass', () => {
    expectFill(10, 'above', 0.5, 0.5)
    expectFill(6, 'above', 0.5, 0.1)
  })
  it('has no fill at 5', () => {
    expectFill(5, 'none', 0.5, 0)
  })
  it('fills leftward from the center for a fail', () => {
    expectFill(4, 'below', 0.4, 0.1)
    expectFill(1, 'below', 0.1, 0.4)
  })
})

describe('placePopover', () => {
  const pop = { width: 340, height: 300 }
  const viewport = { width: 1200, height: 800 }

  it('opens below the anchor, aligned to its left edge', () => {
    const anchor = { top: 100, bottom: 120, left: 200, width: 150 }
    expect(placePopover(anchor, pop, viewport)).toEqual({ top: 128, left: 200, placement: 'below' })
  })

  it('flips above when there is no room below', () => {
    const anchor = { top: 700, bottom: 720, left: 200, width: 150 }
    expect(placePopover(anchor, pop, viewport)).toEqual({ top: 700 - 8 - 300, left: 200, placement: 'above' })
  })

  it('stays below when neither side fits', () => {
    const anchor = { top: 250, bottom: 270, left: 200, width: 150 }
    expect(placePopover(anchor, pop, { width: 1200, height: 500 }).placement).toBe('below')
  })

  it('keeps inside the right edge', () => {
    const anchor = { top: 100, bottom: 120, left: 1100, width: 80 }
    const { left } = placePopover(anchor, pop, viewport)
    expect(left + pop.width).toBeLessThanOrEqual(viewport.width - 12)
  })

  it('keeps inside the left edge', () => {
    const anchor = { top: 100, bottom: 120, left: 2, width: 80 }
    expect(placePopover(anchor, pop, viewport).left).toBeGreaterThanOrEqual(12)
  })
})

describe('keyStep', () => {
  it('moves one whole score with the arrow keys, from wherever the thumb is', () => {
    expect(keyStep('ArrowRight', 7)).toBe(8)
    expect(keyStep('ArrowUp', 7)).toBe(8)
    expect(keyStep('ArrowLeft', 7)).toBe(6)
    expect(keyStep('ArrowDown', 7.4)).toBe(6)
  })
  it('jumps to the ends with Home and End', () => {
    expect(keyStep('Home', 7)).toBe(1)
    expect(keyStep('End', 3)).toBe(10)
  })
  it('stops at the ends', () => {
    expect(keyStep('ArrowRight', 10)).toBe(10)
    expect(keyStep('ArrowLeft', 1)).toBe(1)
  })
  it('ignores other keys', () => {
    expect(keyStep('a', 7)).toBeNull()
  })
})
