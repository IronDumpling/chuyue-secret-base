import fs from 'fs'
import path from 'path'
import { createContentIndex } from '../lib/entries'
import type { Entry } from '../lib/entry-types'
import { buildCardTree, coverDataUri, renderJpeg } from './lib/card'
import { buildPosterTree, posterImageSize, qrDataUri } from './lib/poster'
import { posterContent, type PosterContent } from './lib/poster-content'
import { avatarDataUri, blurredBackgroundDataUri, posterImageDataUri } from './lib/poster-assets'
import { containsCjk, entryTexts } from './lib/card-texts'
import { loadCjkFace, loadCjkFont, loadLatinFallback, POSTER_FACES, type CjkFace, type FontData } from './lib/fonts'
import { pagePath, shareImagePath, siteOgPath } from '../lib/share-paths'
import { absoluteUrl } from '../lib/site'
import { LOCALES, type Locale } from '../lib/i18n/config'
import { getDictionary } from '../lib/i18n'

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')
const AVATAR = path.join(PUBLIC_DIR, 'images', 'home', 'profile.jpeg')

function writeTo(sitePath: string, data: Buffer) {
  const file = path.join(PUBLIC_DIR, sitePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, data)
}

function publicFile(sitePath: string | null): string | null {
  return sitePath ? path.join(PUBLIC_DIR, sitePath) : null
}

function siteTexts(lang: Locale) {
  const t = getDictionary(lang)
  // The site is called by its name ("楚岳的秘密基地"), never by a job title.
  return { title: t.meta.title, badge: t.meta.cardBadge, footer: t.meta.title }
}

// Serif is only for literary text: a novel's title and blurb, a review's quote.
function serifText(c: PosterContent): string {
  if (c.layout === 'novel') return `${c.title}${c.description ?? ''}`
  if (c.layout === 'review') return c.description ?? ''
  return ''
}

function sansText(c: PosterContent): string {
  const sansBody = c.layout === 'novel' ? '' : c.layout === 'review' ? c.title : `${c.title}${c.description ?? ''}`
  const rows = c.specRows.map(r => `${r.label}${r.value}`).join('')
  return `${c.label}${c.dateText}${c.day ?? ''}${sansBody}${rows}${c.rating ?? ''}/10…`
}

// Shipping posters with empty boxes instead of Chinese text is worse than failing.
async function loadFace(face: CjkFace, text: string): Promise<FontData | null> {
  if (!text) return null
  const font = await loadCjkFace(face, text)
  if (containsCjk(text) && !font) {
    throw new Error(
      `Chinese text needs ${face.family} ${face.weight} but it could not be loaded (Google Fonts unreachable and no cached copy in .cache/fonts). Retry with network access.`
    )
  }
  return font
}

async function main() {
  const content = createContentIndex(path.join(ROOT, 'content'))
  // Every language gets a card for every page, because every page exists in every
  // language (a missing translation is served as the other language).
  const perLang = LOCALES.map(lang => ({
    lang,
    entries: [...content.entries('blog', lang), ...content.entries('portfolio', lang)],
  }))

  const cardText = perLang
    .flatMap(({ lang, entries }) => [
      ...Object.values(siteTexts(lang)),
      ...entries.flatMap(entry => Object.values(entryTexts(entry, lang))),
    ])
    .join('')

  const cjk = await loadCjkFont(cardText)
  if (containsCjk(cardText) && !cjk) {
    throw new Error(
      'Chinese text needs a CJK font but it could not be loaded (Google Fonts unreachable and no cached copy in .cache/fonts). Retry with network access.'
    )
  }
  const cardFonts = [cjk ?? loadLatinFallback()]

  const posters = perLang.map(({ lang, entries }) => ({
    lang,
    items: entries.map(entry => ({ entry, content: posterContent(entry, lang) })),
  }))
  const signatures = LOCALES.map(lang => `${getDictionary(lang).meta.siteName}${getDictionary(lang).share.posterScan}`).join('')
  const sans = signatures + posters.flatMap(p => p.items.map(i => sansText(i.content))).join('')
  const serif = posters.flatMap(p => p.items.map(i => serifText(i.content))).join('')
  const posterFonts = [
    await loadFace(POSTER_FACES.sans, sans),
    await loadFace(POSTER_FACES.sansBold, sans),
    await loadFace(POSTER_FACES.serif, serif),
  ].filter((f): f is FontData => f !== null)
  posterFonts.push(loadLatinFallback())

  fs.rmSync(path.join(PUBLIC_DIR, 'share', 'og'), { recursive: true, force: true })
  fs.rmSync(path.join(PUBLIC_DIR, 'share', 'poster'), { recursive: true, force: true })

  const avatar = await avatarDataUri(AVATAR)

  let written = 0
  for (const { lang, entries } of perLang) {
    // The site card uses the gradient background only; no cover image.
    await writeCard(siteOgPath(lang), { ...siteTexts(lang) }, cardFonts)
    written += 1

    for (const entry of entries) {
      const { title, badge } = entryTexts(entry, lang)
      const cover = await coverDataUri(publicFile(entry.frontMatter.images?.[0] ?? null), 1200, 630)
      await writeCard(
        shareImagePath(entry.target, 'og', lang),
        { title, badge, footer: siteTexts(lang).footer, coverDataUri: cover },
        cardFonts
      )
      written += 1

      const c = posterContent(entry, lang)
      const picture = publicFile(c.imagePath)
      const size = posterImageSize(c)
      const poster = buildPosterTree({
        content: c,
        backgroundDataUri: c.layout === 'novel' ? undefined : await blurredBackgroundDataUri(picture),
        imageDataUri: size ? await posterImageDataUri(picture, size.width, size.height) : undefined,
        avatarDataUri: avatar,
        qrDataUri: await qrDataUri(absoluteUrl(pagePath(entry.target, lang))),
        signature: getDictionary(lang).meta.siteName,
        scanLine: getDictionary(lang).share.posterScan,
      })
      writeTo(shareImagePath(entry.target, 'poster', lang), await renderJpeg(poster, 1080, 1920, posterFonts))
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
