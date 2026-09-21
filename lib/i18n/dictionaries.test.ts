import { describe, it, expect } from 'vitest'
import { en } from './dictionaries/en'
import { zh } from './dictionaries/zh'
import { getDictionary } from './index'

// Same keys in the same nesting, same array lengths. TypeScript already enforces the
// keys; this also catches arrays of different length, which the type system cannot.
function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))]
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      shape(v, path ? `${path}.${k}` : k)
    )
  }
  return [path]
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

describe('dictionaries', () => {
  it('have the same structure in English and Chinese', () => {
    expect(shape(zh)).toEqual(shape(en))
  })

  it('have no empty strings', () => {
    expect(strings(en).filter(s => s.trim() === '')).toEqual([])
    expect(strings(zh).filter(s => s.trim() === '')).toEqual([])
  })

  it('are looked up by locale', () => {
    expect(getDictionary('en').nav.blog).toBe('Blog')
    expect(getDictionary('zh').nav.blog).toBe('博客')
  })
})
