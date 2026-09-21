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
      'blog/films-shows/review/her-review.mdx',
      '---\ntitle: "Her Review"\nrating: 8\ndescription: "Underrated"\nimages:\n  - "/images/her.jpg"\n---\n\nBody text'
    )
    write('portfolio/applications/pact.mdx', '---\ntitle: "PA:CT"\n---\n\nPact body')

    const entries = collectContent(dir)
    const her = entries.find(e => e.slug === 'her-review')!
    expect(her).toMatchObject({
      kind: 'blog',
      category: 'films-shows',
      type: 'review',
      title: 'Her Review',
      rating: 8,
      description: 'Underrated',
      images: ['/images/her.jpg'],
    })
    expect(her.body.trim()).toBe('Body text')

    const pact = entries.find(e => e.slug === 'pact')!
    expect(pact).toMatchObject({ kind: 'portfolio', category: 'applications', title: 'PA:CT', images: [] })
    expect(pact.type).toBeUndefined()
  })

  it('ignores non-markdown files and returns [] for a missing directory', () => {
    write('blog/music/casual/notes.txt', 'nope')
    expect(collectContent(dir)).toEqual([])
    expect(collectContent(path.join(dir, 'missing'))).toEqual([])
  })
})
