import { describe, it, expect } from 'vitest'
import type { Entry } from '../../lib/entry-types'
import { getCategories, getGroupOf, type BlogCategory, type PortfolioCategory } from '../../lib/taxonomy'
import { posterContent, posterLayoutOf, TITLE_MAX, DESC_MAX } from './poster-content'

const noLinks = { github: [], demo: [], website: [] }

function post(category: BlogCategory, extra: Partial<Entry<'blog'>['frontMatter']> = {}, content = ''): Entry<'blog'> {
  return {
    slug: 'x',
    frontMatter: { title: 'Her', category, group: getGroupOf('blog', category), date: '2026-04-04', ...noLinks, ...extra },
    content,
    lang: 'en',
    isFallback: false,
    target: { kind: 'blog', category, slug: 'x' },
    nativeLanguages: ['en'],
  }
}

function project(
  category: PortfolioCategory,
  extra: Partial<Entry<'portfolio'>['frontMatter']> = {}
): Entry<'portfolio'> {
  return {
    slug: 'x',
    frontMatter: { title: 'FrameTime', category, group: getGroupOf('portfolio', category), date: '2025-12-01', ...noLinks, ...extra },
    content: '',
    lang: 'en',
    isFallback: false,
    target: { kind: 'portfolio', category, slug: 'x' },
    nativeLanguages: ['en'],
  }
}

describe('posterLayoutOf', () => {
  it('maps every taxonomy category to a layout', () => {
    for (const c of getCategories('blog')) {
      expect(posterLayoutOf(post(c))).toBe(c === 'moments' ? 'moment' : 'review')
    }
    const art: Record<string, string> = { games: 'art', photography: 'art', illustration: 'art', novel: 'novel' }
    for (const c of getCategories('portfolio')) {
      expect(posterLayoutOf(project(c))).toBe(art[c] ?? 'project')
    }
  })
})

describe('posterContent', () => {
  it('labels without the score', () => {
    const review = posterContent(post('films', { rating: 8 }), 'zh')
    expect(review.label).toBe('评测 · 电影')
    expect(review.rating).toBe(8)
    expect(posterContent(project('applications'), 'zh').label).toBe('作品集 · 应用')
    expect(posterContent(post('moments'), 'zh').label).toBe('随笔')
  })

  it('drops rating outside reviews or when missing', () => {
    expect(posterContent(post('moments', { rating: 7 }), 'zh').rating).toBeUndefined()
    expect(posterContent(post('films'), 'zh').rating).toBeUndefined()
  })

  it('formats dates per layout', () => {
    expect(posterContent(post('films', { date: '2026-04-04' }), 'zh').dateText).toBe('2026.04.04')
    expect(posterContent(project('applications', { date: '2025-12-01' }), 'zh').dateText).toBe('2025.12')
    expect(posterContent(project('novel', { date: '2019-12-01' }), 'zh').dateText).toBe('2019')
    const moment = posterContent(post('moments', { date: '2026-03-15' }), 'zh')
    expect(moment.dateText).toBe('2026.03')
    expect(moment.day).toBe('15')
    expect(posterContent(post('films'), 'zh').day).toBeUndefined()
  })

  it('builds spec rows only from present data', () => {
    const full = project('applications', {
      tags: ['Web', 'Time Tracking', 'Analytics', 'Extra'],
      github: [{ url: 'https://github.com/a/b' }],
    })
    expect(posterContent(full, 'zh').specRows).toEqual([
      { label: '技术', value: 'Web · Time Tracking · Analytics' },
      { label: '代码', value: 'GitHub' },
    ])
    expect(posterContent(project('applications', { demo: [{ url: 'https://d' }] }), 'en').specRows).toEqual([
      { label: 'Live', value: 'Demo' },
    ])
    expect(posterContent(project('applications', { website: [{ url: 'https://w' }] }), 'zh').specRows).toEqual([
      { label: '在线', value: '网站' },
    ])
    expect(posterContent(project('applications'), 'zh').specRows).toEqual([])
    expect(posterContent(project('photography', { tags: ['a'] }), 'zh').specRows).toEqual([])
  })

  it('clips long title and description', () => {
    const longTitle = '长'.repeat(80)
    const c = posterContent(project('applications', { title: longTitle, description: '述'.repeat(200) }), 'zh')
    expect(Array.from(c.title)).toHaveLength(TITLE_MAX)
    expect(c.title.endsWith('…')).toBe(true)
    expect(Array.from(c.description!).length).toBeLessThanOrEqual(DESC_MAX.project)
    expect(c.description!.endsWith('…')).toBe(true)
  })

  it('shows no description on photo, illustration posters, but a gameplay line on games', () => {
    expect(posterContent(project('photography', { description: 'Visit' }), 'zh').description).toBeUndefined()
    expect(posterContent(project('illustration', { description: 'Ink' }), 'zh').description).toBeUndefined()
    const game = posterContent(project('games', { description: 'A 2D stealth platformer with sound-based resonance' }), 'en')
    expect(game.layout).toBe('art')
    expect(game.description).toBe('A 2D stealth platformer with sound-based resonance')
    expect(posterContent(project('games'), 'zh').label).toBe('作品集 · 游戏')
  })

  it('empty quote is undefined', () => {
    expect(posterContent(post('films', {}, ''), 'zh').description).toBeUndefined()
    expect(posterContent(post('films', {}, 'Body text here'), 'zh').description).toBe('Body text here')
  })

  it('imagePath is first image or null', () => {
    expect(posterContent(post('films', { images: ['/a.jpg', '/b.jpg'] }), 'zh').imagePath).toBe('/a.jpg')
    expect(posterContent(post('films'), 'zh').imagePath).toBeNull()
  })

  it('leaves room for an English title to wrap by words', () => {
    const title = 'Multi-Agent Reinforcement Learning for Exploration'
    expect(posterContent(project('ai', { title }), 'en').title).toBe(title)
  })
})

