import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { assertContentLanguages, checkContentLanguages, cjkShare } from './content-language'

let contentDir: string

function post(rel: string, front: Record<string, unknown>, body: string) {
  const file = path.join(contentDir, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const yaml = Object.entries(front)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')
  fs.writeFileSync(file, `---\n${yaml}\n---\n\n${body}\n`)
}

const en = { title: 'Her Review', description: 'A film', date: '2026-01-04', rating: 8, tags: ['Drama'], images: ['/a.jpg'] }
const zh = { ...en, title: '《她》影评', description: '一部电影' }
const enBody = 'A quiet film about love and software, and what people want from each other.'
const zhBody = '这是一部关于爱和软件的安静电影，讲的是人们彼此想要什么。'

beforeEach(() => {
  contentDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lang-'))
})
afterEach(() => fs.rmSync(contentDir, { recursive: true, force: true }))

describe('cjkShare', () => {
  it('is 0 for English and 1 for Chinese', () => {
    expect(cjkShare('Just some English text.')).toBe(0)
    expect(cjkShare('这是纯中文的一段话。')).toBe(1)
  })

  it('measures mixed text by letters and Chinese characters', () => {
    // 4 Chinese characters, 4 Latin letters
    expect(cjkShare('中文测试 test')).toBe(0.5)
  })

  it('ignores code, links, images and html', () => {
    const text = 'Plain words\n\n```\n这是代码里的中文注释\n```\n\n`中文`\n\n![图片](/images/中文.jpg)\n\n[link](https://x.com/中文)\n\n<span>tag</span>'
    expect(cjkShare(text)).toBe(0)
  })

  it('is 0 for text without letters', () => {
    expect(cjkShare('  123 — ')).toBe(0)
  })
})

describe('checkContentLanguages', () => {
  it('passes for a post written once in each language', () => {
    post('blog/films/her.en.mdx', en, enBody)
    post('blog/films/her.zh.mdx', zh, zhBody)
    post('portfolio/games/only-english.en.mdx', en, enBody)
    expect(checkContentLanguages(contentDir)).toEqual([])
  })

  it('tolerates a few Chinese names inside English text', () => {
    post(
      'portfolio/games/signal.en.mdx',
      en,
      `${enBody} It was shown at the 腾讯WePlay Game Expo, among many other events and demos across the country, with players lining up.`
    )
    expect(checkContentLanguages(contentDir)).toEqual([])
  })

  it('fails on a file without a language in its name', () => {
    post('blog/films/her.mdx', en, enBody)
    expect(checkContentLanguages(contentDir)).toEqual([
      'blog/films/her.mdx: no language in the file name, rename it to her.en.mdx (or her.zh.mdx)',
    ])
  })

  it('fails on an English file whose text is Chinese, and on a Chinese file whose text is English', () => {
    post('blog/films/a.en.mdx', en, zhBody)
    post('blog/films/b.zh.mdx', zh, enBody)
    const problems = checkContentLanguages(contentDir)
    expect(problems.join('\n')).toMatch(/blog\/films\/a\.en\.mdx: .*\.en.* Chinese/)
    expect(problems.join('\n')).toMatch(/blog\/films\/b\.zh\.mdx: .*\.zh.* Chinese/)
  })

  it('fails on both languages written in one file', () => {
    post('blog/films/both.en.mdx', en, `${enBody}\n\n---\n\n${zhBody}`)
    expect(checkContentLanguages(contentDir).join('\n')).toMatch(/both\.en\.mdx: .*Chinese/)
  })

  it('checks the title and description too', () => {
    post('blog/films/a.en.mdx', { ...en, title: '中文标题' }, enBody)
    post('blog/films/b.zh.mdx', { ...zh, title: 'English title', description: 'English blurb' }, zhBody)
    const problems = checkContentLanguages(contentDir).join('\n')
    expect(problems).toMatch(/a\.en\.mdx: the title or description is written in Chinese/)
    expect(problems).toMatch(/b\.zh\.mdx: the title has no Chinese/)
    expect(problems).toMatch(/b\.zh\.mdx: the description has no Chinese/)
  })

  it('fails when the shared fields of the two versions differ', () => {
    post('blog/films/her.en.mdx', en, enBody)
    post('blog/films/her.zh.mdx', { ...zh, rating: 9, date: '2026-01-05', images: ['/b.jpg'] }, zhBody)
    const problems = checkContentLanguages(contentDir)
    expect(problems).toHaveLength(1)
    expect(problems[0]).toMatch(/blog\/films\/her: .*date.*rating.*images/)
  })

  it('does not require shared fields when only one version exists', () => {
    post('blog/films/only.zh.mdx', zh, zhBody)
    expect(checkContentLanguages(contentDir)).toEqual([])
  })
})

describe('assertContentLanguages', () => {
  it('throws one error listing every problem', () => {
    post('blog/films/a.mdx', en, enBody)
    post('blog/films/b.en.mdx', en, zhBody)
    expect(() => assertContentLanguages(contentDir)).toThrow(/a\.mdx[\s\S]*b\.en\.mdx/)
  })

  it('does nothing for clean content', () => {
    post('blog/films/her.en.mdx', en, enBody)
    expect(() => assertContentLanguages(contentDir)).not.toThrow()
  })
})
