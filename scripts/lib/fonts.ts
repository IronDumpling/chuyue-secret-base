import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface FontData {
  name: string
  data: Buffer
  weight: 400 | 700
  style: 'normal'
}

const CACHE_DIR = path.join(process.cwd(), '.cache', 'fonts')

export interface CjkFace {
  family: 'Noto Sans SC' | 'Noto Serif SC'
  weight: 400 | 700
}

// The three faces the posters use: sans for body text, bold sans for titles, numbers and the
// signature, and serif only for literary text (novel titles and blurbs, review quotes).
export const POSTER_FACES = {
  sans: { family: 'Noto Sans SC', weight: 400 },
  sansBold: { family: 'Noto Sans SC', weight: 700 },
  serif: { family: 'Noto Serif SC', weight: 700 },
} as const satisfies Record<string, CjkFace>

// Same characters in any order give the same file; a different face never shares one.
export function fontCacheKey(face: CjkFace, text: string): string {
  const unique = Array.from(new Set(text)).sort().join('')
  return crypto.createHash('sha1').update(`${face.family}|${face.weight}|${unique}`).digest('hex').slice(0, 16)
}

// One request for the exact characters we draw. Google's css2 API returns a TrueType
// file when no browser user-agent is sent, and `text=` keeps it to a few KB.
export async function loadCjkFace(face: CjkFace, text: string): Promise<FontData | null> {
  const unique = Array.from(new Set(text)).sort().join('')
  const cached = path.join(CACHE_DIR, `${fontCacheKey(face, text)}.ttf`)
  const font = (data: Buffer): FontData => ({ name: face.family, data, weight: face.weight, style: 'normal' })

  if (fs.existsSync(cached)) return font(fs.readFileSync(cached))

  try {
    const family = face.family.replace(/ /g, '+')
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${face.weight}&text=${encodeURIComponent(unique)}`
    const cssRes = await fetch(cssUrl)
    if (!cssRes.ok) throw new Error(`css ${cssRes.status}`)
    const match = (await cssRes.text()).match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)
    if (!match) throw new Error('no font url in css response')

    const fontRes = await fetch(match[1])
    if (!fontRes.ok) throw new Error(`font ${fontRes.status}`)
    const data = Buffer.from(await fontRes.arrayBuffer())

    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(cached, data)
    return font(data)
  } catch (error) {
    console.warn(
      `[share-images] could not load ${face.family} ${face.weight}, falling back to Latin only: ${(error as Error).message}`
    )
    return null
  }
}

// The OG cards use bold sans only.
export function loadCjkFont(text: string): Promise<FontData | null> {
  return loadCjkFace(POSTER_FACES.sansBold, text)
}

export function loadLatinFallback(): FontData {
  const file = path.join(
    process.cwd(),
    'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf'
  )
  return { name: 'Noto Sans', data: fs.readFileSync(file), weight: 400, style: 'normal' }
}
