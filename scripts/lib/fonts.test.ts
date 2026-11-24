import { describe, it, expect } from 'vitest'
import { fontCacheKey, POSTER_FACES } from './fonts'

describe('fontCacheKey', () => {
  it('differs by family and by weight for the same text', () => {
    const keys = new Set([
      fontCacheKey(POSTER_FACES.sans, '楚岳'),
      fontCacheKey(POSTER_FACES.sansBold, '楚岳'),
      fontCacheKey(POSTER_FACES.serif, '楚岳'),
    ])
    expect(keys.size).toBe(3)
  })

  it('ignores character order and repeats', () => {
    expect(fontCacheKey(POSTER_FACES.serif, '岳楚楚')).toBe(fontCacheKey(POSTER_FACES.serif, '楚岳'))
  })
})
