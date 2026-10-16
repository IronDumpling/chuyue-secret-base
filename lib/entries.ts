// Loads Posts and Projects from a content folder: the one module the site pages, the sitemap
// and the build scripts read content through.
//
// No 'server-only' and no `@/` imports, so scripts run with tsx and vitest can import it.
// The site binds it to the real content folder in lib/content.ts.

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { normalizeSlug, parseContentFilename, pickLocalized, type LangFile } from './content-lang'
import { LOCALES, DEFAULT_LOCALE, type Locale } from './i18n/config'
import { normalizeFrontMatter, normalizeLinks } from './frontmatter'
import { getCategories, getGroupOf, isValidCategory, type CategoryId, type Section } from './taxonomy'
import type { Entry } from './entry-types'

interface RawFile {
  category: string
  slug: string
  data: Record<string, unknown>
  content: string
}

export interface ContentIndex {
  // Every entry of a section (or of one category), newest first. Each slug appears once, in
  // the requested language where it exists, else in the other one.
  entries<S extends Section>(section: S, lang: Locale, category?: CategoryId<S>): Entry<S>[]
  entry<S extends Section>(section: S, category: string, slug: string, lang: Locale): Entry<S> | null
}

function readFile(file: string): { data: Record<string, unknown>; content: string } | null {
  try {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'))
    return { data: normalizeFrontMatter(data), content }
  } catch (error) {
    console.error(`Error reading MDX file ${file}:`, error)
    return null
  }
}

// Every language version of every entry in a section, in the categories the taxonomy knows.
// Files are keyed by category/slug: a slug is only unique within its category.
function readSection(root: string, section: Section): LangFile<RawFile>[] {
  const files: LangFile<RawFile>[] = []
  for (const category of getCategories(section)) {
    const folder = path.join(root, section, category)
    if (!fs.existsSync(folder)) continue
    for (const name of fs.readdirSync(folder, { recursive: true })) {
      if (typeof name !== 'string') continue
      const parsed = parseContentFilename(path.basename(name))
      if (!parsed) continue
      const read = readFile(path.join(folder, name))
      if (read) {
        files.push({ slug: `${category}/${parsed.slug}`, lang: parsed.lang, value: { category, slug: parsed.slug, ...read } })
      }
    }
  }
  return files
}

// Category comes from the folder and group from the taxonomy, not from the frontmatter.
// github/demo/website are normalized to a list here so every consumer sees one shape,
// regardless of whether the content file wrote a string, a single object, or a list.
function toEntry<S extends Section>(
  section: S,
  { lang, isFallback, value }: { lang: Locale; isFallback: boolean; value: RawFile },
  nativeLanguages: Locale[]
): Entry<S> {
  const { slug } = value
  const category = value.category as CategoryId<S>
  return {
    slug,
    frontMatter: {
      ...value.data,
      category,
      group: getGroupOf(section, category),
      github: normalizeLinks(value.data.github),
      demo: normalizeLinks(value.data.demo),
      website: normalizeLinks(value.data.website),
    } as unknown as Entry<S>['frontMatter'],
    content: value.content,
    lang,
    isFallback,
    target: { kind: section, category, slug },
    nativeLanguages,
  }
}

function newestFirst<S extends Section>(entries: Entry<S>[]): Entry<S>[] {
  return entries.sort(
    (a, b) => new Date(b.frontMatter.date || 0).getTime() - new Date(a.frontMatter.date || 0).getTime()
  )
}

export function createContentIndex(root: string, { cache = false }: { cache?: boolean } = {}): ContentIndex {
  const cached = new Map<Section, Map<Locale, Entry[]>>()

  function load<S extends Section>(section: S): Map<Locale, Entry<S>[]> {
    const hit = cached.get(section)
    if (hit) return hit as Map<Locale, Entry<S>[]>

    const files = readSection(root, section)
    const native = new Map<string, Locale[]>()
    for (const file of files) {
      const langs = native.get(file.slug) ?? []
      const lang = file.lang ?? DEFAULT_LOCALE
      if (!langs.includes(lang)) langs.push(lang)
      native.set(file.slug, langs)
    }

    const byLang = new Map<Locale, Entry<S>[]>()
    for (const lang of LOCALES) {
      const picked = pickLocalized(files, lang).map(file =>
        toEntry(section, file, LOCALES.filter(l => native.get(file.slug)!.includes(l)))
      )
      byLang.set(lang, newestFirst(picked))
    }
    if (cache) cached.set(section, byLang as Map<Locale, Entry[]>)
    return byLang
  }

  return {
    entries(section, lang, category) {
      const all = load(section).get(lang) ?? []
      return category ? all.filter(e => e.frontMatter.category === category) : [...all]
    },
    entry(section, category, slug, lang) {
      if (!isValidCategory(section, category)) return null
      const wanted = normalizeSlug(slug)
      return (
        (load(section).get(lang) ?? []).find(
          e => e.frontMatter.category === category && e.slug.normalize('NFC') === wanted
        ) ?? null
      )
    },
  }
}
