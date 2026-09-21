import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { collectAboutImages } from './about-images'

let dir: string
function touch(name: string) {
  fs.writeFileSync(path.join(dir, name), '')
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'about-'))
})
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }))

describe('collectAboutImages', () => {
  it('groups images by the identity in the file name', () => {
    touch('engineer-1.jpeg')
    touch('creator-1.jpg')
    touch('adventurer-1.png')

    expect(collectAboutImages(dir)).toEqual({
      engineer: ['/images/about/engineer-1.jpeg'],
      creator: ['/images/about/creator-1.jpg'],
      adventurer: ['/images/about/adventurer-1.png'],
    })
  })

  it('orders by the number, not alphabetically, and accepts any extension case', () => {
    touch('creator-10.jpg')
    touch('creator-2.JPG')
    touch('creator-1.webp')

    expect(collectAboutImages(dir).creator).toEqual([
      '/images/about/creator-1.webp',
      '/images/about/creator-2.JPG',
      '/images/about/creator-10.jpg',
    ])
  })

  it('ignores files that do not follow the naming', () => {
    touch('aboutImg4_1.jpg')
    touch('creator-.jpg')
    touch('creator-1.txt')
    touch('creator-1-copy.jpg')
    touch('designer-1.jpg')

    expect(collectAboutImages(dir)).toEqual({ engineer: [], creator: [], adventurer: [] })
  })

  it('gives an empty list for an identity with no image, and for a missing folder', () => {
    touch('engineer-1.jpg')
    expect(collectAboutImages(dir).creator).toEqual([])
    expect(collectAboutImages(path.join(dir, 'nope'))).toEqual({ engineer: [], creator: [], adventurer: [] })
  })
})
