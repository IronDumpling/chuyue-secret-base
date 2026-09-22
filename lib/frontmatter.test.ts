import { describe, it, expect } from 'vitest'
import { normalizeFrontMatter, normalizeLinks } from './frontmatter'

describe('normalizeFrontMatter', () => {
  it('turns Date values into YYYY-MM-DD strings', () => {
    const out = normalizeFrontMatter({ date: new Date('2026-01-04T00:00:00.000Z'), title: 'Her' })
    expect(out).toEqual({ date: '2026-01-04', title: 'Her' })
  })

  it('leaves strings, numbers, arrays and objects untouched', () => {
    const input = {
      date: '2026-01-04',
      rating: 8,
      tags: ['a', 'b'],
      website: { url: 'https://x.com', label: 'X' },
    }
    expect(normalizeFrontMatter(input)).toEqual(input)
  })
})

describe('normalizeLinks', () => {
  it('turns a missing value into an empty list', () => {
    expect(normalizeLinks(undefined)).toEqual([])
    expect(normalizeLinks(null)).toEqual([])
    expect(normalizeLinks('')).toEqual([])
  })

  it('turns a string into a one-item list', () => {
    expect(normalizeLinks('https://github.com/x/y')).toEqual([{ url: 'https://github.com/x/y' }])
  })

  it('wraps a single object in a list', () => {
    const link = { url: 'https://x.com', label: 'X' }
    expect(normalizeLinks(link)).toEqual([link])
  })

  it('passes a list through, coercing string items', () => {
    const input = ['https://a.com', { url: 'https://b.com', label: 'B' }]
    expect(normalizeLinks(input)).toEqual([{ url: 'https://a.com' }, { url: 'https://b.com', label: 'B' }])
  })

  it('returns an empty list for an empty list', () => {
    expect(normalizeLinks([])).toEqual([])
  })
})
