import { describe, it, expect } from 'vitest'
import { parseContentFilename, pickLocalized } from './content-lang'

describe('parseContentFilename', () => {
  it('reads the slug and language from the file name', () => {
    expect(parseContentFilename('her-review.zh.mdx')).toEqual({ slug: 'her-review', lang: 'zh' })
    expect(parseContentFilename('her-review.en.md')).toEqual({ slug: 'her-review', lang: 'en' })
  })

  it('treats a file without a language suffix as unmarked', () => {
    expect(parseContentFilename('her-review.mdx')).toEqual({ slug: 'her-review', lang: null })
    expect(parseContentFilename('notes.md')).toEqual({ slug: 'notes', lang: null })
  })

  it('keeps dots that are not a supported language', () => {
    expect(parseContentFilename('v1.2-notes.mdx')).toEqual({ slug: 'v1.2-notes', lang: null })
    expect(parseContentFilename('x.fr.mdx')).toEqual({ slug: 'x.fr', lang: null })
  })

  it('ignores files that are not markdown', () => {
    expect(parseContentFilename('cover.jpg')).toBeNull()
    expect(parseContentFilename('notes.txt')).toBeNull()
  })
})

const file = (slug: string, lang: 'en' | 'zh' | null, value = `${slug}-${lang}`) => ({ slug, lang, value })

describe('pickLocalized', () => {
  it('treats an unmarked file as English', () => {
    const out = pickLocalized([file('a', null)], 'en')
    expect(out).toEqual([{ slug: 'a', lang: 'en', isFallback: false, value: 'a-null' }])
  })

  it('serves the requested language when it exists', () => {
    const files = [file('a', 'en'), file('a', 'zh')]
    expect(pickLocalized(files, 'zh')).toEqual([{ slug: 'a', lang: 'zh', isFallback: false, value: 'a-zh' }])
    expect(pickLocalized(files, 'en')).toEqual([{ slug: 'a', lang: 'en', isFallback: false, value: 'a-en' }])
  })

  it('falls back to the other language and says so', () => {
    expect(pickLocalized([file('a', null)], 'zh')).toEqual([
      { slug: 'a', lang: 'en', isFallback: true, value: 'a-null' },
    ])
    expect(pickLocalized([file('a', 'zh')], 'en')).toEqual([
      { slug: 'a', lang: 'zh', isFallback: true, value: 'a-zh' },
    ])
  })

  it('prefers an explicit language suffix over an unmarked file', () => {
    const out = pickLocalized([file('a', null, 'old'), file('a', 'en', 'new')], 'en')
    expect(out).toEqual([{ slug: 'a', lang: 'en', isFallback: false, value: 'new' }])
  })

  it('returns one entry per slug, in the order slugs first appear', () => {
    const out = pickLocalized([file('b', 'zh'), file('a', 'en'), file('b', 'en')], 'en')
    expect(out.map(o => [o.slug, o.lang])).toEqual([
      ['b', 'en'],
      ['a', 'en'],
    ])
  })
})
