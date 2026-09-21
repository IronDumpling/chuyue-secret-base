import { describe, it, expect } from 'vitest'
import { containsCjk, entryTexts } from './card-texts'
import type { ContentEntry } from './content-index'

const blog: ContentEntry = {
  kind: 'blog',
  category: 'films-shows',
  type: 'review',
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
    expect(entryTexts(blog, 'en')).toEqual({ title: 'Her Review', badge: 'Films & Shows · Review · 8/10' })
  })

  it('builds the Chinese label from the Chinese dictionary', () => {
    expect(entryTexts(blog, 'zh')).toEqual({ title: 'Her Review', badge: '影视 · 评测 · 8/10' })
  })

  it('leaves the rating out of casual posts and labels portfolio entries', () => {
    expect(entryTexts({ ...blog, type: 'casual', category: 'photography' }, 'en').badge).toBe('Photography · Casual')
    const project: ContentEntry = { ...blog, kind: 'portfolio', category: 'applications', type: undefined, rating: undefined }
    expect(entryTexts(project, 'en').badge).toBe('Portfolio · Applications')
    expect(entryTexts(project, 'zh').badge).toBe('作品集 · 应用')
  })
})

describe('containsCjk', () => {
  it('detects Chinese characters', () => {
    expect(containsCjk('影视 · 评测')).toBe(true)
    expect(containsCjk('Her Review · 8/10')).toBe(false)
  })
})
