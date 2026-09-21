import { describe, it, expect } from 'vitest'
import { pick } from './localized'

describe('pick', () => {
  it('returns a plain string for both languages', () => {
    expect(pick('PostgreSQL', 'en')).toBe('PostgreSQL')
    expect(pick('PostgreSQL', 'zh')).toBe('PostgreSQL')
  })

  it('returns the text for the requested language', () => {
    const text = { en: 'Hiking', zh: '徒步' }
    expect(pick(text, 'en')).toBe('Hiking')
    expect(pick(text, 'zh')).toBe('徒步')
  })
})
