import { describe, it, expect } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { avatarDataUri, blurredBackgroundDataUri } from './poster-assets'

async function tempImage(width: number, height: number): Promise<string> {
  const buf = await sharp({ create: { width, height, channels: 3, background: '#cc6633' } }).jpeg().toBuffer()
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'poster-assets-')), 'img.jpg')
  fs.writeFileSync(file, buf)
  return file
}

async function metaOf(uri: string) {
  return sharp(Buffer.from(uri.split(',')[1], 'base64')).metadata()
}

describe('poster assets', () => {
  it('blurs a cover into a 1080x1920 jpeg', async () => {
    const uri = await blurredBackgroundDataUri(await tempImage(800, 600))
    expect(uri).toMatch(/^data:image\/jpeg;base64,/)
    const meta = await metaOf(uri!)
    expect([meta.width, meta.height, meta.format]).toEqual([1080, 1920, 'jpeg'])
  })

  it('returns undefined for a missing file', async () => {
    expect(await blurredBackgroundDataUri('/nope.jpg')).toBeUndefined()
    expect(await blurredBackgroundDataUri(null)).toBeUndefined()
  })

  it('makes a square avatar', async () => {
    const meta = await metaOf(await avatarDataUri(await tempImage(300, 500)))
    expect([meta.width, meta.height]).toEqual([160, 160])
  })
})
