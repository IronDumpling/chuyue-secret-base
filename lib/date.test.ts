import { describe, it, expect } from 'vitest'
import { formatDay, formatMonth, monthKey, parseDateParts } from './date'

describe('post dates', () => {
  it('reads the day as written, including unpadded months and days', () => {
    expect(parseDateParts('2026-2-15')).toEqual({ year: 2026, month: 2, day: 15 })
    expect(parseDateParts('2025-12-20')).toEqual({ year: 2025, month: 12, day: 20 })
    expect(parseDateParts('not a date')).toBeNull()
  })

  it('keeps a month-start date in its month regardless of the machine time zone', () => {
    // new Date('2026-03-01') is midnight UTC, which is still February in Toronto.
    expect(monthKey('2026-03-01')).toBe('2026-03')
    expect(formatMonth('2026-03-01', 'en')).toBe('March 2026')
    expect(formatDay('2026-03-01', 'en')).toBe('Mar 1, 2026')
  })

  it('formats in the language of the page', () => {
    expect(formatDay('2026-1-4', 'en')).toBe('Jan 4, 2026')
    expect(formatDay('2026-1-4', 'zh')).toBe('2026年1月4日')
    expect(formatMonth('2026-2-15', 'zh')).toBe('2026年2月')
  })

  it('pads the month key so keys sort as text', () => {
    expect(monthKey('2026-2-5')).toBe('2026-02')
    expect(['2026-10', '2026-02'].sort()).toEqual(['2026-02', '2026-10'])
  })

  it('does not throw on an unreadable date', () => {
    expect(formatDay('soon', 'en')).toBe('soon')
    expect(monthKey('soon')).toBe('')
  })
})
