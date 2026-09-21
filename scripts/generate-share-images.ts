import fs from 'fs'
import path from 'path'
import { collectContent } from './lib/content-index'
import { buildCardTree, coverDataUri, renderJpeg } from './lib/card'
import { containsCjk, entryTexts } from './lib/card-texts'
import { loadCjkFont, loadLatinFallback } from './lib/fonts'
import { shareImagePath, siteOgPath } from '../lib/share-paths'
import { LOCALES, type Locale } from '../lib/i18n/config'
import { getDictionary } from '../lib/i18n'

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')

function writeTo(sitePath: string, data: Buffer) {
  const file = path.join(PUBLIC_DIR, sitePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, data)
}

function coverFile(images: string[]): string | null {
  const first = images[0]
  return first ? path.join(PUBLIC_DIR, first) : null
}

function siteTexts(lang: Locale) {
  const t = getDictionary(lang)
  return { title: t.meta.siteName, badge: t.meta.cardBadge, footer: `${t.meta.siteName} · ${t.footer.tagline}` }
}

async function main() {
  const contentDir = path.join(ROOT, 'content')
  // Every language gets a card for every page, because every page exists in every
  // language (a missing translation is served as the other language).
  const perLang = LOCALES.map(lang => ({ lang, entries: collectContent(contentDir, lang) }))

  const allText = perLang
    .flatMap(({ lang, entries }) => [
      ...Object.values(siteTexts(lang)),
      ...entries.flatMap(entry => Object.values(entryTexts(entry, lang))),
    ])
    .join('')

  const cjk = await loadCjkFont(allText)
  if (containsCjk(allText) && !cjk) {
    // Shipping cards with empty boxes instead of Chinese titles is worse than failing.
    throw new Error(
      'Chinese text needs a CJK font but it could not be loaded (Google Fonts unreachable and no cached copy in .cache/fonts). Retry with network access.'
    )
  }
  const fonts = [cjk ?? loadLatinFallback()]

  fs.rmSync(path.join(PUBLIC_DIR, 'share', 'og'), { recursive: true, force: true })

  let written = 0
  for (const { lang, entries } of perLang) {
    // The site card uses the gradient background only; no cover image.
    await writeCard(siteOgPath(lang), { ...siteTexts(lang) }, fonts)
    written += 1

    for (const entry of entries) {
      const { title, badge } = entryTexts(entry, lang)
      const cover = await coverDataUri(coverFile(entry.images), 1200, 630)
      await writeCard(
        shareImagePath(entry, 'og', lang),
        { title, badge, footer: siteTexts(lang).footer, coverDataUri: cover },
        fonts
      )
      written += 1
    }
  }

  console.log(`[share-images] wrote ${written} og cards to public/share/og`)
}

async function writeCard(
  sitePath: string,
  input: Parameters<typeof buildCardTree>[0],
  fonts: Parameters<typeof renderJpeg>[3]
) {
  writeTo(sitePath, await renderJpeg(buildCardTree(input), 1200, 630, fonts))
}

if (require.main === module) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
