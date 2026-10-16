import { describe, it, expect } from 'vitest'
import { containsCjk, entryTexts } from './card-texts'
import type { Entry } from '../../lib/entry-types'

const blog: Entry<'blog'> = {
  slug: 'her-review',
  frontMatter: {
    title: 'Her Review',
    category: 'films',
    group: 'reviews',
    date: '2026-01-04',
    rating: 8,
    github: [],
    demo: [],
    website: [],
  },
  content: '',
  lang: 'en',
  isFallback: false,
  target: { kind: 'blog', category: 'films', slug: 'her-review' },
  nativeLanguages: ['en'],
}

function moment(rating?: number): Entry<'blog'> {
  return { ...blog, frontMatter: { ...blog.frontMatter, category: 'moments', group: 'moments', rating } }
}

function project(category: 'applications' | 'photography'): Entry<'portfolio'> {
  const group = category === 'applications' ? 'computing' : 'art'
  return {
    ...blog,
    frontMatter: { title: 'Her Review', category, group, date: '2026-01-04', github: [], demo: [], website: [] },
    target: { kind: 'portfolio', category, slug: 'her-review' },
  }
}

describe('entryTexts', () => {
  it('builds the English label for a review with a rating', () => {
    expect(entryTexts(blog, 'en')).toEqual({ title: 'Her Review', badge: 'Reviews · Films · 8/10' })
  })

  it('builds the Chinese label from the Chinese dictionary', () => {
    expect(entryTexts(blog, 'zh')).toEqual({ title: 'Her Review', badge: '评测 · 电影 · 8/10' })
  })

  it('shows a single-category group once and leaves the rating out of non-reviews', () => {
    expect(entryTexts(moment(), 'en').badge).toBe('Moments')
    expect(entryTexts(moment(), 'zh').badge).toBe('随笔')
    // A rating on a post outside the Reviews group is ignored.
    expect(entryTexts(moment(8), 'en').badge).toBe('Moments')
  })

  it('labels portfolio entries', () => {
    expect(entryTexts(project('applications'), 'en').badge).toBe('Portfolio · Applications')
    expect(entryTexts(project('applications'), 'zh').badge).toBe('作品集 · 应用')
    expect(entryTexts(project('photography'), 'en').badge).toBe('Portfolio · Photography')
  })
})

describe('containsCjk', () => {
  it('detects Chinese characters', () => {
    expect(containsCjk('评测 · 电影')).toBe(true)
    expect(containsCjk('Her Review · 8/10')).toBe(false)
  })
})
