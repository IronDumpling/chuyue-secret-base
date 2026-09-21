import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ShareTarget } from '../../lib/share-paths'

export interface ContentEntry extends ShareTarget {
  title: string
  description?: string
  rating?: number
  images: string[]
  body: string
}

function dirs(parent: string): string[] {
  if (!fs.existsSync(parent)) return []
  return fs.readdirSync(parent, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
}

function markdownFiles(parent: string): string[] {
  if (!fs.existsSync(parent)) return []
  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter(e => e.isFile() && /\.mdx?$/.test(e.name))
    .map(e => e.name)
}

function read(file: string, target: ShareTarget): ContentEntry {
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

export function collectContent(contentDir: string): ContentEntry[] {
  const entries: ContentEntry[] = []

  const blogRoot = path.join(contentDir, 'blog')
  for (const category of dirs(blogRoot)) {
    for (const type of dirs(path.join(blogRoot, category))) {
      const folder = path.join(blogRoot, category, type)
      for (const name of markdownFiles(folder)) {
        const slug = path.basename(name, path.extname(name))
        entries.push(read(path.join(folder, name), { kind: 'blog', category, type, slug }))
      }
    }
  }

  const portfolioRoot = path.join(contentDir, 'portfolio')
  for (const category of dirs(portfolioRoot)) {
    const folder = path.join(portfolioRoot, category)
    for (const name of markdownFiles(folder)) {
      const slug = path.basename(name, path.extname(name))
      entries.push(read(path.join(folder, name), { kind: 'portfolio', category, slug }))
    }
  }

  return entries
}
