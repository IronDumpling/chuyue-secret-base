import { describe, it, expect } from 'vitest'
import { format } from './format'

describe('format', () => {
  it('fills named placeholders', () => {
    expect(format('All {category}', { category: 'Music' })).toBe('All Music')
    expect(format('GitHub 仓库 {n}', { n: 2 })).toBe('GitHub 仓库 2')
  })

  it('leaves unknown placeholders untouched', () => {
    expect(format('Hello {name}', {})).toBe('Hello {name}')
  })

  it('fills a placeholder used twice', () => {
    expect(format('{a}-{a}', { a: 'x' })).toBe('x-x')
  })
})
