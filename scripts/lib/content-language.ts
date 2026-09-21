import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { parseContentFilename } from '../../lib/content-lang'
import type { Locale } from '../../lib/i18n/config'

// Share of Chinese characters, among Chinese characters and Latin letters, that an English
// text may have (a few Chinese names in English prose are fine) and that a Chinese text
// must have (Chinese prose with English product names is still mostly Chinese).
export const EN_MAX_CJK = 0.05
export const ZH_MIN_CJK = 0.2

// Fields that describe the post, not the words in it, so both versions must agree.
const SHARED_FIELDS = ['date', 'rating', 'tags', 'images', 'github', 'demo']

const CJK = /[㐀-䶿一-鿿]/g
const LATIN = /[A-Za-z]/g

export function cjkShare(text: string): number {
  const prose = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ')

  const cjk = (prose.match(CJK) ?? []).length
  const latin = (prose.match(LATIN) ?? []).length
  return cjk + latin === 0 ? 0 : cjk / (cjk + latin)
}

const percent = (share: number) => `${Math.round(share * 100)}%`

interface Version {
  file: string // for messages, e.g. blog/films/her.zh.mdx
  lang: Locale
  data: Record<string, unknown>
  body: string
}

function checkVersion({ file, lang, data, body }: Version): string[] {
  const problems: string[] = []
  const bodyShare = cjkShare(body)

  if (lang === 'en') {
    if (bodyShare > EN_MAX_CJK) {
      problems.push(
        `${file}: named .en but ${percent(bodyShare)} of its text is Chinese. Move the Chinese into a .zh file`
      )
    }
    const front = `${data.title ?? ''} ${data.description ?? ''}`
    if (cjkShare(front) > EN_MAX_CJK) {
      problems.push(`${file}: the title or description is written in Chinese`)
    }
  } else {
    if (bodyShare < ZH_MIN_CJK) {
      problems.push(
        `${file}: named .zh but only ${percent(bodyShare)} of its text is Chinese. Write it in Chinese, or rename it .en`
      )
    }
    if (!/[㐀-䶿一-鿿]/.test(String(data.title ?? ''))) {
      problems.push(`${file}: the title has no Chinese`)
    }
    if (data.description !== undefined && !/[㐀-䶿一-鿿]/.test(String(data.description))) {
      problems.push(`${file}: the description has no Chinese`)
    }
  }
  return problems
}

function checkPair(name: string, en: Version, zh: Version): string[] {
  const differing = SHARED_FIELDS.filter(
    key => JSON.stringify(en.data[key] ?? null) !== JSON.stringify(zh.data[key] ?? null)
  )
  return differing.length === 0
    ? []
    : [`${name}: the .en and .zh versions disagree on ${differing.join(', ')}. These are shared, keep them the same`]
}

// Every markdown file must say which language it is in (`slug.en.mdx` / `slug.zh.mdx`) and
// its text must really be in that language. Returns one message per problem.
export function checkContentLanguages(contentDir: string): string[] {
  const problems: string[] = []

  for (const section of ['blog', 'portfolio']) {
    const sectionDir = path.join(contentDir, section)
    if (!fs.existsSync(sectionDir)) continue

    for (const category of fs.readdirSync(sectionDir, { withFileTypes: true })) {
      if (!category.isDirectory()) continue
      const folder = path.join(sectionDir, category.name)
      const versions = new Map<string, Partial<Record<Locale, Version>>>()

      for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
        if (!entry.isFile()) continue
        const parsed = parseContentFilename(entry.name)
        if (!parsed) continue

        const file = `${section}/${category.name}/${entry.name}`
        if (!parsed.lang) {
          problems.push(
            `${file}: no language in the file name, rename it to ${parsed.slug}.en.mdx (or ${parsed.slug}.zh.mdx)`
          )
          continue
        }

        const { data, content } = matter(fs.readFileSync(path.join(folder, entry.name), 'utf8'))
        const version: Version = { file, lang: parsed.lang, data, body: content }
        problems.push(...checkVersion(version))

        const pair = versions.get(parsed.slug) ?? {}
        pair[parsed.lang] = version
        versions.set(parsed.slug, pair)
      }

      for (const [slug, pair] of versions) {
        if (pair.en && pair.zh) {
          problems.push(...checkPair(`${section}/${category.name}/${slug}`, pair.en, pair.zh))
        }
      }
    }
  }
  return problems
}

export function assertContentLanguages(contentDir: string): void {
  const problems = checkContentLanguages(contentDir)
  if (problems.length > 0) {
    throw new Error(
      `The content is not cleanly separated by language:\n  - ${problems.join('\n  - ')}\nFix these in the content repo.`
    )
  }
}
