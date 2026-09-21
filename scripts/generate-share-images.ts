import fs from 'fs'
import path from 'path'
import { collectContent, type ContentEntry } from './lib/content-index'
import { buildCardTree, coverDataUri, renderJpeg } from './lib/card'
import { loadCjkFont, loadLatinFallback } from './lib/fonts'
import { SITE_OG_PATH, shareImagePath } from '../lib/share-paths'
import { categoryMap as blogCategories, typeMap } from '../lib/blog-utils'
import { categoryMap as portfolioCategories } from '../lib/portfolio-utils'

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')
const SITE_TITLE = 'Chuyue'
const SITE_BADGE = 'Portfolio & Blog'

export function entryTexts(entry: ContentEntry): { title: string; badge: string } {
  if (entry.kind === 'blog') {
    const category = blogCategories[entry.category as keyof typeof blogCategories] ?? entry.category
    const type = typeMap[entry.type as keyof typeof typeMap] ?? entry.type
    const rating = entry.type === 'review' && entry.rating ? ` · ${entry.rating}/10` : ''
    return { title: entry.title, badge: `${category} · ${type}${rating}` }
  }
  const category = portfolioCategories[entry.category as keyof typeof portfolioCategories] ?? entry.category
  return { title: entry.title, badge: `Portfolio · ${category}` }
}

function writeTo(sitePath: string, data: Buffer) {
  const file = path.join(PUBLIC_DIR, sitePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, data)
}

function coverFile(entry: ContentEntry): string | null {
  const first = entry.images[0]
  return first ? path.join(PUBLIC_DIR, first) : null
}

async function main() {
  const entries = collectContent(path.join(ROOT, 'content'))

  const allText = [SITE_TITLE, SITE_BADGE, 'Chuyue · System Designer', ...entries.flatMap(e => Object.values(entryTexts(e)))].join('')
  const cjk = await loadCjkFont(allText)
  const fonts = [cjk ?? loadLatinFallback()]

  fs.rmSync(path.join(PUBLIC_DIR, 'share', 'og'), { recursive: true, force: true })

  // The site card uses the gradient background only; no cover image.
  writeTo(SITE_OG_PATH, await renderJpeg(buildCardTree({ title: SITE_TITLE, badge: SITE_BADGE }), 1200, 630, fonts))

  for (const entry of entries) {
    const { title, badge } = entryTexts(entry)
    const cover = await coverDataUri(coverFile(entry), 1200, 630)
    writeTo(shareImagePath(entry, 'og'), await renderJpeg(buildCardTree({ title, badge, coverDataUri: cover }), 1200, 630, fonts))
  }

  console.log(`[share-images] wrote ${entries.length + 1} og cards to public/share/og`)
}

if (require.main === module) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
