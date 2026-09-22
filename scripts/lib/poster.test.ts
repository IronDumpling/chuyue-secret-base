import { describe, it, expect } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { renderJpeg, coverDataUri } from './card'
import { loadLatinFallback } from './fonts'
import { buildPosterTree, qrDataUri } from './poster'

const BRAND = 'Chuyue · System Designer'
const SCAN_LINE = 'Scan to read · irondumpling.github.io'

describe('poster renderer', () => {
  it('makes a scannable-size QR data uri', async () => {
    const uri = await qrDataUri('https://irondumpling.github.io/chuyue-secret-base/en/blog/films/her-review/')
    expect(uri).toMatch(/^data:image\/png;base64,/)
    const meta = await sharp(Buffer.from(uri.split(',')[1], 'base64')).metadata()
    expect(meta.width).toBeGreaterThanOrEqual(400)
  })

  it('renders a 1080x1920 portrait jpeg without a cover', async () => {
    const qr = await qrDataUri('https://example.com/en/blog/films/her-review/')
    const tree = buildPosterTree({
      title: 'Her Review',
      badge: 'Reviews · Films · 8/10',
      description: 'The most underrated sci-fi film of the decade',
      qrDataUri: qr,
      brand: BRAND,
      scanLine: SCAN_LINE,
    })
    const jpeg = await renderJpeg(tree, 1080, 1920, [loadLatinFallback()])
    const meta = await sharp(jpeg).metadata()
    expect(meta.format).toBe('jpeg')
    expect(meta.width).toBe(1080)
    expect(meta.height).toBe(1920)
  })

  it('renders with a cover image behind the top square', async () => {
    const cover = await sharp({ create: { width: 1600, height: 1600, channels: 3, background: '#cc6633' } })
      .jpeg()
      .toBuffer()
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'poster-cover-')), 'cover.jpg')
    fs.writeFileSync(file, cover)

    const uri = await coverDataUri(file, 1080, 1080)
    const qr = await qrDataUri('https://example.com/en/blog/films/her-review/')
    const jpeg = await renderJpeg(
      buildPosterTree({ title: 'With cover', qrDataUri: qr, coverDataUri: uri, brand: BRAND, scanLine: SCAN_LINE }),
      1080,
      1920,
      [loadLatinFallback()]
    )
    const meta = await sharp(jpeg).metadata()
    expect(meta.width).toBe(1080)
    expect(meta.height).toBe(1920)
  })
})
