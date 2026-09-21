import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ShareTarget } from '../../lib/share-paths'
import { parseContentFilename, pickLocalized, type LangFile } from '../../lib/content-lang'
import { DEFAULT_LOCALE, type Locale } from '../../lib/i18n/config'

export interface ContentEntry extends ShareTarget {
  title: string
  description?: string
  rating?: number
  images: string[]
  body: string
  lang: Locale // language the text is in
  isFallback: boolean // true when that is not the language that was asked for
}

function dirs(parent: string): string[] {
  if (!fs.existsSync(parent)) return []
  return fs.readdirSync(parent, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
}

function read(file: string, target: ShareTarget): Omit<ContentEntry, 'lang' | 'isFallback'> {
  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  return {
    ...target,
    title: String(data.title ?? target.slug),
    description: typeof data.description === 'string' ? data.description : undefined,
    rating: typeof data.rating === 'number' ? data.rating : undefined,
    images: Array.isArray(data.images) ? data.images.filter((i: unknown): i is string => typeof i === 'string') : [],
    body: content,
  }
}

// One entry per post in a folder, in the requested language where it exists.
function readFolder(folder: string, base: Omit<ShareTarget, 'slug'>, lang: Locale): ContentEntry[] {
  if (!fs.existsSync(folder)) return []

  const files: LangFile<Omit<ContentEntry, 'lang' | 'isFallback'>>[] = []
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    const parsed = parseContentFilename(entry.name)
    if (!parsed) continue
    files.push({
      slug: parsed.slug,
      lang: parsed.lang,
      value: read(path.join(folder, entry.name), { ...base, slug: parsed.slug }),
    })
  }

  return pickLocalized(files, lang).map(({ lang: actual, isFallback, value }) => ({
    ...value,
    lang: actual,
    isFallback,
  }))
}

export function collectContent(contentDir: string, lang: Locale = DEFAULT_LOCALE): ContentEntry[] {
  const entries: ContentEntry[] = []

  const blogRoot = path.join(contentDir, 'blog')
  for (const category of dirs(blogRoot)) {
    entries.push(...readFolder(path.join(blogRoot, category), { kind: 'blog', category }, lang))
  }

  const portfolioRoot = path.join(contentDir, 'portfolio')
  for (const category of dirs(portfolioRoot)) {
    entries.push(...readFolder(path.join(portfolioRoot, category), { kind: 'portfolio', category }, lang))
  }

  return entries
}
