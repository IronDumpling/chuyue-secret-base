import { beforeAll, describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { renderJpeg, type Node } from './card'
import { loadLatinFallback } from './fonts'
import { buildPosterTree, qrDataUri, verticalColumns, type PosterInput } from './poster'
import type { PosterContent, PosterLayout } from './poster-content'

const LAYOUTS: PosterLayout[] = ['project', 'review', 'art', 'novel', 'moment']

// A tiny grey jpeg stands in for every image slot.
let TINY = ''
beforeAll(async () => {
  const buf = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#777777' } }).jpeg().toBuffer()
  TINY = `data:image/jpeg;base64,${buf.toString('base64')}`
})

function content(layout: PosterLayout, extra: Partial<PosterContent> = {}): PosterContent {
  return {
    layout,
    label: 'Portfolio · Applications',
    dateText: '2025.12',
    day: layout === 'moment' ? '15' : undefined,
    title: 'FrameTime',
    description: 'A time tracking app',
    rating: layout === 'review' ? 9 : undefined,
    specRows: layout === 'project' ? [{ label: 'Stack', value: 'Web' }] : [],
    imagePath: '/x.jpg',
    ...extra,
  }
}

function input(c: PosterContent, withImages: boolean, qr: string): PosterInput {
  return {
    content: c,
    backgroundDataUri: withImages ? TINY : undefined,
    imageDataUri: withImages ? TINY : undefined,
    avatarDataUri: TINY,
    qrDataUri: qr,
    signature: 'Chuyue',
    scanLine: 'Scan to view',
  }
}

function texts(node: unknown): string[] {
  if (typeof node === 'string') return [node]
  if (Array.isArray(node)) return node.flatMap(texts)
  if (node && typeof node === 'object' && 'props' in node) return texts((node as Node).props.children)
  return []
}

function findPart(node: unknown, part: string): Node | undefined {
  if (Array.isArray(node)) {
    for (const n of node) {
      const hit = findPart(n, part)
      if (hit) return hit
    }
    return undefined
  }
  if (!node || typeof node !== 'object' || !('props' in node)) return undefined
  const n = node as Node
  if (n.props['data-part'] === part) return n
  return findPart(n.props.children, part)
}

describe('poster renderer', () => {
  it('makes a scannable-size QR data uri', async () => {
    const uri = await qrDataUri('https://irondumpling.github.io/chuyue-secret-base/en/blog/films/her-review/')
    expect(uri).toMatch(/^data:image\/png;base64,/)
    const meta = await sharp(Buffer.from(uri.split(',')[1], 'base64')).metadata()
    expect(meta.width).toBeGreaterThanOrEqual(400)
  })

  it('splits a vertical title into right-to-left columns', () => {
    expect(verticalColumns('有关夜的五重真相')).toEqual([['有', '关', '夜', '的', '五', '重', '真', '相']])
    const long = verticalColumns('一二三四五六七八九十一二三四五六七')
    expect(long).toHaveLength(2)
    expect(long[1]).toHaveLength(8)
    expect(long[1][7]).toBe('…')
    expect(verticalColumns('《夜》')).toEqual([['《', '夜', '》']])
  })

  it('renders every layout with and without images', async () => {
    const qr = await qrDataUri('https://example.com/en/blog/films/her-review/')
    for (const layout of LAYOUTS) {
      for (const withImages of [true, false]) {
        const jpeg = await renderJpeg(buildPosterTree(input(content(layout), withImages, qr)), 1080, 1920, [
          loadLatinFallback(),
        ])
        const meta = await sharp(jpeg).metadata()
        expect([layout, meta.format, meta.width, meta.height]).toEqual([layout, 'jpeg', 1080, 1920])
      }
    }
  }, 60_000)

  it('renders a Latin novel title horizontally and a CJK one vertically', () => {
    const latin = texts(buildPosterTree(input(content('novel', { title: 'The Day Consciousness Fades' }), false, TINY)))
    expect(latin).toContain('The Day Consciousness Fades')
    const cjk = texts(buildPosterTree(input(content('novel', { title: '有关夜的五重真相' }), false, TINY)))
    expect(cjk).toContain('有')
    expect(cjk).not.toContain('有关夜的五重真相')
  })

  it('review without rating renders no score', () => {
    const t = texts(buildPosterTree(input(content('review', { rating: undefined }), true, TINY))).join('')
    expect(t).not.toContain('/10')
    const rated = texts(buildPosterTree(input(content('review'), true, TINY))).join('')
    expect(rated).toContain('/10')
  })

  it('signature row is identical across layouts', () => {
    const rows = LAYOUTS.map(l => JSON.stringify(findPart(buildPosterTree(input(content(l), true, TINY)), 'signature')))
    expect(rows[0]).toBeDefined()
    expect(new Set(rows).size).toBe(1)
  })
})
