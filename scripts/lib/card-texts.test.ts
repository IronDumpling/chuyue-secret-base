import { describe, it, expect } from 'vitest'
import { containsCjk, entryTexts } from './card-texts'
import type { ContentEntry } from './content-index'

const blog: ContentEntry = {
  kind: 'blog',
  category: 'films',
  slug: 'her-review',
  title: 'Her Review',
  rating: 8,
  images: [],
  body: '',
  lang: 'en',
  isFallback: false,
}

describe('entryTexts', () => {
  it('builds the English label for a review with a rating', () => {
    expect(entryTexts(blog, 'en')).toEqual({ title: 'Her Review', badge: 'Reviews · Films · 8/10' })
  })

  it('builds the Chinese label from the Chinese dictionary', () => {
    expect(entryTexts(blog, 'zh')).toEqual({ title: 'Her Review', badge: '评测 · 电影 · 8/10' })
  })

  it('shows a single-category group once and leaves the rating out of non-reviews', () => {
    const moment: ContentEntry = { ...blog, category: 'moments', rating: undefined }
    expect(entryTexts(moment, 'en').badge).toBe('Moments')
    expect(entryTexts(moment, 'zh').badge).toBe('随笔')
    // A rating on a post outside the Reviews group is ignored.
    expect(entryTexts({ ...blog, category: 'moments' }, 'en').badge).toBe('Moments')
  })

  it('labels portfolio entries', () => {
    const project: ContentEntry = { ...blog, kind: 'portfolio', category: 'applications', rating: undefined }
    expect(entryTexts(project, 'en').badge).toBe('Portfolio · Applications')
    expect(entryTexts(project, 'zh').badge).toBe('作品集 · 应用')
    expect(entryTexts({ ...project, category: 'photography' }, 'en').badge).toBe('Portfolio · Photography')
  })
})

describe('containsCjk', () => {
  it('detects Chinese characters', () => {
    expect(containsCjk('评测 · 电影')).toBe(true)
    expect(containsCjk('Her Review · 8/10')).toBe(false)
  })
})
