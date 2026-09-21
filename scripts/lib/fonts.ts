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

// One request for the exact characters we draw. Google's css2 API returns a TrueType
// file when no browser user-agent is sent, and `text=` keeps it to a few KB.
export async function loadCjkFont(text: string): Promise<FontData | null> {
  const unique = Array.from(new Set(text)).join('')
  const key = crypto.createHash('sha1').update(unique).digest('hex').slice(0, 16)
  const cached = path.join(CACHE_DIR, `${key}.ttf`)
  const font = (data: Buffer): FontData => ({ name: 'Noto Sans SC', data, weight: 700, style: 'normal' })

  if (fs.existsSync(cached)) return font(fs.readFileSync(cached))

  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@700&text=${encodeURIComponent(unique)}`
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
    console.warn(`[share-images] could not load CJK font, falling back to Latin only: ${(error as Error).message}`)
    return null
  }
}

export function loadLatinFallback(): FontData {
  const file = path.join(
    process.cwd(),
    'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf'
  )
  return { name: 'Noto Sans', data: fs.readFileSync(file), weight: 400, style: 'normal' }
}
