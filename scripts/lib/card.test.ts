import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { buildCardTree, renderJpeg, coverDataUri } from './card'
import { loadLatinFallback } from './fonts'

describe('card renderer', () => {
  it('renders a 1200x630 jpeg without a cover', async () => {
    const tree = buildCardTree({ title: 'Her Review', badge: 'Films & Shows · Review' })
    const jpeg = await renderJpeg(tree, 1200, 630, [loadLatinFallback()])
    const meta = await sharp(jpeg).metadata()
    expect(meta.format).toBe('jpeg')
    expect(meta.width).toBe(1200)
    expect(meta.height).toBe(630)
  })

  it('renders with a cover image behind the title', async () => {
    const cover = await sharp({ create: { width: 1600, height: 900, channels: 3, background: '#cc6633' } })
      .jpeg()
      .toBuffer()
    const fs = await import('fs')
    const os = await import('os')
    const path = await import('path')
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cover-')), 'cover.jpg')
    fs.writeFileSync(file, cover)

    const uri = await coverDataUri(file, 1200, 630)
    expect(uri).toMatch(/^data:image\/jpeg;base64,/)

    const jpeg = await renderJpeg(buildCardTree({ title: 'With cover', coverDataUri: uri }), 1200, 630, [loadLatinFallback()])
    const meta = await sharp(jpeg).metadata()
    expect(meta.width).toBe(1200)
  })

  it('returns undefined for a missing cover file', async () => {
    expect(await coverDataUri('/no/such/file.jpg', 1200, 630)).toBeUndefined()
    expect(await coverDataUri(null, 1200, 630)).toBeUndefined()
  })
})
