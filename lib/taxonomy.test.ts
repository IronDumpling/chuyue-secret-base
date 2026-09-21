import { describe, it, expect } from 'vitest'
import { TAXONOMY, getCategories, getGroupOf, getGroups, hasSubcategories, isValidCategory } from './taxonomy'

describe('taxonomy', () => {
  it('lists categories in display order', () => {
    expect(getCategories('blog')).toEqual(['moments', 'films', 'shows', 'music', 'video-games', 'books'])
    expect(getCategories('portfolio')).toEqual([
      'applications',
      'games',
      'systems',
      'ai',
      'photography',
      'illustration',
    ])
  })

  it('gives every category to exactly one group', () => {
    for (const section of Object.keys(TAXONOMY) as (keyof typeof TAXONOMY)[]) {
      const all = getCategories(section)
      expect(new Set(all).size).toBe(all.length)
    }
  })

  it('finds the group of a category', () => {
    expect(getGroupOf('blog', 'films')).toBe('reviews')
    expect(getGroupOf('blog', 'moments')).toBe('moments')
    expect(getGroupOf('portfolio', 'games')).toBe('computing')
    expect(getGroupOf('portfolio', 'photography')).toBe('art')
  })

  it('validates a folder name against the section', () => {
    expect(isValidCategory('blog', 'films')).toBe(true)
    expect(isValidCategory('blog', 'films-shows')).toBe(false)
    expect(isValidCategory('blog', 'review')).toBe(false)
    // Category ids are per section: 'photography' lives in the portfolio now.
    expect(isValidCategory('blog', 'photography')).toBe(false)
    expect(isValidCategory('portfolio', 'student-projects')).toBe(false)
  })

  it('only gives multi-category groups a second menu level', () => {
    const [moments, reviews] = getGroups('blog')
    expect(hasSubcategories(moments)).toBe(false)
    expect(hasSubcategories(reviews)).toBe(true)
  })
})
