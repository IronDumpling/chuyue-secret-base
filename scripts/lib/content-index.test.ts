import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { collectContent } from './content-index'

let dir: string
function write(rel: string, text: string) {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, text)
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-'))
})
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }))

describe('collectContent', () => {
  it('finds blog and portfolio entries with fields from the folder layout', () => {
    write(
      'blog/films/her-review.mdx',
      '---\ntitle: "Her Review"\nrating: 8\ndescription: "Underrated"\nimages:\n  - "/images/her.jpg"\n---\n\nBody text'
    )
    write('portfolio/applications/pact.mdx', '---\ntitle: "PA:CT"\n---\n\nPact body')

    const entries = collectContent(dir)
    const her = entries.find(e => e.slug === 'her-review')!
    expect(her).toMatchObject({
      kind: 'blog',
      category: 'films',
      title: 'Her Review',
      rating: 8,
      description: 'Underrated',
      images: ['/images/her.jpg'],
    })
    expect(her.body.trim()).toBe('Body text')

    const pact = entries.find(e => e.slug === 'pact')!
    expect(pact).toMatchObject({ kind: 'portfolio', category: 'applications', title: 'PA:CT', images: [] })
  })

  it('ignores non-markdown files and returns [] for a missing directory', () => {
    write('blog/music/notes.txt', 'nope')
    expect(collectContent(dir)).toEqual([])
    expect(collectContent(path.join(dir, 'missing'))).toEqual([])
  })

  it('serves the requested language and falls back to the other one', () => {
    write('blog/music/a.mdx', '---\ntitle: "A"\n---\nen body')
    write('blog/music/a.zh.mdx', '---\ntitle: "甲"\n---\nzh body')
    write('blog/music/b.mdx', '---\ntitle: "B"\n---\nonly english')
    write('portfolio/applications/p.zh.mdx', '---\ntitle: "项目"\n---\nonly chinese')

    const zh = collectContent(dir, 'zh')
    expect(zh.find(e => e.slug === 'a')).toMatchObject({ title: '甲', lang: 'zh', isFallback: false })
    expect(zh.find(e => e.slug === 'b')).toMatchObject({ title: 'B', lang: 'en', isFallback: true })
    expect(zh.find(e => e.slug === 'p')).toMatchObject({ title: '项目', lang: 'zh', isFallback: false })

    const en = collectContent(dir, 'en')
    expect(en.find(e => e.slug === 'a')).toMatchObject({ title: 'A', lang: 'en', isFallback: false })
    expect(en.find(e => e.slug === 'p')).toMatchObject({ title: '项目', lang: 'zh', isFallback: true })
    expect(en.filter(e => e.slug === 'a')).toHaveLength(1)
  })
})
