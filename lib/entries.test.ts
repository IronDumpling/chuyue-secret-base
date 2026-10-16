import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { createContentIndex } from './entries'

let dir: string
function write(rel: string, text: string) {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, text)
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'entries-'))
})
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }))

describe('entries', () => {
  it('takes category and group from the folder, not the frontmatter', () => {
    write('blog/films/her-review.mdx', '---\ntitle: "Her Review"\ncategory: "music"\nrating: 8\n---\n\nBody text')
    write('portfolio/applications/pact.mdx', '---\ntitle: "PA:CT"\n---\n\nPact body')

    const index = createContentIndex(dir)
    const [her] = index.entries('blog', 'en')
    expect(her).toMatchObject({
      slug: 'her-review',
      frontMatter: { title: 'Her Review', category: 'films', group: 'reviews', rating: 8 },
      target: { kind: 'blog', category: 'films', slug: 'her-review' },
      lang: 'en',
      isFallback: false,
    })
    expect(her.content.trim()).toBe('Body text')

    const [pact] = index.entries('portfolio', 'en')
    expect(pact.frontMatter).toMatchObject({ category: 'applications', group: 'computing' })
  })

  it('ignores folders that are not categories, non-markdown files and a missing root', () => {
    write('blog/not-a-category/x.mdx', '---\ntitle: "X"\n---\n')
    write('blog/music/notes.txt', 'nope')
    expect(createContentIndex(dir).entries('blog', 'en')).toEqual([])
    expect(createContentIndex(path.join(dir, 'missing')).entries('blog', 'en')).toEqual([])
  })

  it('finds posts in subfolders of a category', () => {
    write('blog/music/2026/deep.mdx', '---\ntitle: "Deep"\n---\n')
    expect(createContentIndex(dir).entries('blog', 'en').map(e => e.slug)).toEqual(['deep'])
  })

  it('keeps the same slug in two categories apart', () => {
    write('blog/music/same.mdx', '---\ntitle: "Music"\n---\n')
    write('blog/films/same.zh.mdx', '---\ntitle: "电影"\n---\n')
    const index = createContentIndex(dir)
    expect(index.entries('blog', 'en')).toHaveLength(2)
    expect(index.entry('blog', 'music', 'same', 'zh')).toMatchObject({ lang: 'en', nativeLanguages: ['en'] })
    expect(index.entry('blog', 'films', 'same', 'en')).toMatchObject({ lang: 'zh', nativeLanguages: ['zh'] })
  })

  it('filters by category', () => {
    write('blog/music/a.mdx', '---\ntitle: "A"\n---\n')
    write('blog/films/b.mdx', '---\ntitle: "B"\n---\n')
    expect(createContentIndex(dir).entries('blog', 'en', 'films').map(e => e.slug)).toEqual(['b'])
  })

  it('serves the requested language, falls back to the other one, and lists the native ones', () => {
    write('blog/music/a.mdx', '---\ntitle: "A"\n---\nen body')
    write('blog/music/a.zh.mdx', '---\ntitle: "甲"\n---\nzh body')
    write('blog/music/b.mdx', '---\ntitle: "B"\n---\nonly english')
    write('portfolio/applications/p.zh.mdx', '---\ntitle: "项目"\n---\nonly chinese')
    const index = createContentIndex(dir)

    const zh = index.entries('blog', 'zh')
    expect(zh.find(e => e.slug === 'a')).toMatchObject({ frontMatter: { title: '甲' }, lang: 'zh', isFallback: false })
    expect(zh.find(e => e.slug === 'b')).toMatchObject({ frontMatter: { title: 'B' }, lang: 'en', isFallback: true })
    expect(zh.find(e => e.slug === 'a')!.nativeLanguages).toEqual(['en', 'zh'])
    expect(zh.find(e => e.slug === 'b')!.nativeLanguages).toEqual(['en'])

    const [p] = index.entries('portfolio', 'en')
    expect(p).toMatchObject({ lang: 'zh', isFallback: true, nativeLanguages: ['zh'] })
  })

  it('prefers an explicit .en.mdx over an unmarked .mdx', () => {
    write('blog/music/a.mdx', '---\ntitle: "Unmarked"\n---\n')
    write('blog/music/a.en.mdx', '---\ntitle: "Explicit"\n---\n')
    const entries = createContentIndex(dir).entries('blog', 'en')
    expect(entries).toHaveLength(1)
    expect(entries[0].frontMatter.title).toBe('Explicit')
  })

  it('normalizes links and unquoted dates', () => {
    write('blog/films/a.mdx', '---\ntitle: "A"\ndate: 2026-01-04\nwebsite: "https://example.com"\n---\n')
    write(
      'portfolio/applications/p.mdx',
      '---\ntitle: "P"\ngithub:\n  url: "https://github.com/x"\n  label: "Code"\ndemo:\n  - "https://demo.example"\n---\n'
    )
    const index = createContentIndex(dir)

    const [a] = index.entries('blog', 'en')
    expect(a.frontMatter.date).toBe('2026-01-04')
    expect(a.frontMatter.website).toEqual([{ url: 'https://example.com' }])
    expect(a.frontMatter.github).toEqual([])

    const [p] = index.entries('portfolio', 'en')
    expect(p.frontMatter.github).toEqual([{ url: 'https://github.com/x', label: 'Code' }])
    expect(p.frontMatter.demo).toEqual([{ url: 'https://demo.example' }])
    expect(p.frontMatter.website).toEqual([])
  })

  it('sorts newest first, entries without a date last', () => {
    write('blog/music/old.mdx', '---\ntitle: "Old"\ndate: "2024-05-01"\n---\n')
    write('blog/films/new.mdx', '---\ntitle: "New"\ndate: "2026-02-15"\n---\n')
    write('blog/books/none.mdx', '---\ntitle: "None"\n---\n')
    expect(createContentIndex(dir).entries('blog', 'en').map(e => e.slug)).toEqual(['new', 'old', 'none'])
  })
})

describe('entry', () => {
  it('finds one entry by category and slug, including a percent-encoded slug', () => {
    write('blog/video-games/résidence-evil.mdx', '---\ntitle: "RE"\n---\n')
    const index = createContentIndex(dir)
    expect(index.entry('blog', 'video-games', 'r%C3%A9sidence-evil', 'en')?.frontMatter.title).toBe('RE')
    expect(index.entry('blog', 'films', 'r%C3%A9sidence-evil', 'en')).toBeNull()
  })

  it('returns null for an unknown category or slug', () => {
    write('blog/music/a.mdx', '---\ntitle: "A"\n---\n')
    const index = createContentIndex(dir)
    expect(index.entry('blog', 'nope', 'a', 'en')).toBeNull()
    expect(index.entry('blog', 'music', 'b', 'en')).toBeNull()
    expect(index.entry('portfolio', 'music', 'a', 'en')).toBeNull()
  })
})
