import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { assertContentLayout, assertContentPresent, syncContentImages } from './sync-content'

let root: string
let contentDir: string
let publicDir: string

function write(file: string, text = 'x') {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-'))
  contentDir = path.join(root, 'content')
  publicDir = path.join(root, 'public')
  fs.mkdirSync(contentDir, { recursive: true })
  fs.mkdirSync(publicDir, { recursive: true })
})
afterEach(() => fs.rmSync(root, { recursive: true, force: true }))

describe('assertContentPresent', () => {
  it('passes when blog and portfolio both have markdown files', () => {
    write(path.join(contentDir, 'blog/music/a.mdx'))
    write(path.join(contentDir, 'portfolio/applications/b.mdx'))
    expect(() => assertContentPresent(contentDir)).not.toThrow()
  })

  it('fails with a clear message when the content repo is missing or empty', () => {
    expect(() => assertContentPresent(contentDir)).toThrow(/content repo/)
    write(path.join(contentDir, 'blog/music/a.mdx'))
    expect(() => assertContentPresent(contentDir)).toThrow(/portfolio/)
  })
})

describe('assertContentLayout', () => {
  it('passes for folders that are categories of the taxonomy', () => {
    write(path.join(contentDir, 'blog/films/her.mdx'))
    write(path.join(contentDir, 'blog/moments/a.mdx'))
    write(path.join(contentDir, 'portfolio/photography/blue-sky.mdx'))
    write(path.join(contentDir, 'portfolio/ai/emonet.zh.mdx'))
    expect(() => assertContentLayout(contentDir)).not.toThrow()
  })

  it('fails on a category from the old layout', () => {
    write(path.join(contentDir, 'blog/films-shows/review/her.mdx'))
    write(path.join(contentDir, 'portfolio/student-projects/emonet.mdx'))
    expect(() => assertContentLayout(contentDir)).toThrow('blog/films-shows/ is not a blog category')
    expect(() => assertContentLayout(contentDir)).toThrow('portfolio/student-projects/ is not a portfolio category')
  })

  it('fails on a category of the other section', () => {
    // Photography moved to the portfolio; a blog/photography folder would be silently ignored.
    write(path.join(contentDir, 'blog/photography/a.mdx'))
    expect(() => assertContentLayout(contentDir)).toThrow('blog/photography/ is not a blog category')
  })

  it('fails on a nested folder inside a valid category (the old review/casual level)', () => {
    write(path.join(contentDir, 'blog/music/review/a.mdx'))
    expect(() => assertContentLayout(contentDir)).toThrow('blog/music/review/: put files directly in blog/music/')
  })

  it('fails on a post that sits directly in the section', () => {
    write(path.join(contentDir, 'portfolio/stray.mdx'))
    expect(() => assertContentLayout(contentDir)).toThrow('portfolio/stray.mdx: put posts in a category folder')
  })

  it('ignores empty leftover folders and non-markdown files', () => {
    fs.mkdirSync(path.join(contentDir, 'blog/films-shows/review'), { recursive: true })
    write(path.join(contentDir, 'blog/unknown/notes.txt'))
    expect(() => assertContentLayout(contentDir)).not.toThrow()
  })
})

describe('syncContentImages', () => {
  it('copies image folders into public/images and returns their names', () => {
    write(path.join(contentDir, 'images/blog/music/cover.jpg'), 'new')
    write(path.join(contentDir, 'images/portfolio/pact/1.png'), 'p')

    const copied = syncContentImages(contentDir, publicDir)

    expect(copied.sort()).toEqual(['blog', 'portfolio'])
    expect(fs.readFileSync(path.join(publicDir, 'images/blog/music/cover.jpg'), 'utf8')).toBe('new')
    expect(fs.existsSync(path.join(publicDir, 'images/portfolio/pact/1.png'))).toBe(true)
  })

  it('removes files that were deleted from the content repo', () => {
    write(path.join(publicDir, 'images/blog/old.jpg'))
    write(path.join(contentDir, 'images/blog/new.jpg'))

    syncContentImages(contentDir, publicDir)

    expect(fs.existsSync(path.join(publicDir, 'images/blog/old.jpg'))).toBe(false)
    expect(fs.existsSync(path.join(publicDir, 'images/blog/new.jpg'))).toBe(true)
  })

  it('does not touch site-owned image folders', () => {
    write(path.join(publicDir, 'images/about/me.jpg'), 'keep')
    write(path.join(contentDir, 'images/blog/a.jpg'))

    syncContentImages(contentDir, publicDir)

    expect(fs.readFileSync(path.join(publicDir, 'images/about/me.jpg'), 'utf8')).toBe('keep')
  })

  it('throws when the content repo has no images folder', () => {
    expect(() => syncContentImages(contentDir, publicDir)).toThrow(/images/)
  })
})
