import fs from 'fs'
import path from 'path'
import { collectContent, type ContentEntry } from './lib/content-index'
import { buildCardTree, coverDataUri, renderJpeg } from './lib/card'
import { buildPosterTree, qrDataUri } from './lib/poster'
import { containsCjk, entryTexts } from './lib/card-texts'
import { loadCjkFont, loadLatinFallback } from './lib/fonts'
import { pagePath, shareImagePath, siteOgPath } from '../lib/share-paths'
import { absoluteUrl, siteOrigin } from '../lib/site'
import { summarize } from '../lib/seo'
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

function posterDescription(entry: ContentEntry): string {
  return summarize(entry.description, entry.body, 90)
}

async function main() {
  const contentDir = path.join(ROOT, 'content')
  // Every language gets a card for every page, because every page exists in every
  // language (a missing translation is served as the other language).
  const perLang = LOCALES.map(lang => ({ lang, entries: collectContent(contentDir, lang) }))

  const allText = perLang
    .flatMap(({ lang, entries }) => [
      ...Object.values(siteTexts(lang)),
      getDictionary(lang).share.scanToRead,
      ...entries.flatMap(entry => [...Object.values(entryTexts(entry, lang)), posterDescription(entry)]),
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
  fs.rmSync(path.join(PUBLIC_DIR, 'share', 'poster'), { recursive: true, force: true })

  const host = new URL(siteOrigin()).host

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

      const posterCover = await coverDataUri(coverFile(entry.images), 1080, 1080)
      const qr = await qrDataUri(absoluteUrl(pagePath(entry, lang)))
      const poster = buildPosterTree({
        title,
        badge,
        description: posterDescription(entry),
        coverDataUri: posterCover,
        qrDataUri: qr,
        brand: siteTexts(lang).footer,
        scanLine: `${getDictionary(lang).share.scanToRead} · ${host}`,
      })
      writeTo(shareImagePath(entry, 'poster', lang), await renderJpeg(poster, 1080, 1920, fonts))
      written += 1
    }
  }

  console.log(`[share-images] wrote ${written} share images (og cards + posters) to public/share`)
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
