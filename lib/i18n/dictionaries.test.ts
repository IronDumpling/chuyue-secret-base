import { describe, it, expect } from 'vitest'
import { en } from './dictionaries/en'
import { zh } from './dictionaries/zh'

function strings(obj: unknown): string[] {
  if (typeof obj === 'string') return [obj]
  if (obj && typeof obj === 'object') return Object.values(obj).flatMap(strings)
  return []
}

describe('site copy', () => {
  it('names the site the secret base', () => {
    expect(zh.meta.title).toBe('楚岳的秘密基地')
    expect(en.meta.title).toBe("Chuyue's Secret Base")
    expect(zh.footer.tagline).toBe('欢迎来到我的秘密基地')
    expect(en.footer.tagline).toBe('Welcome to my secret base')
  })

  it('carries no job title anywhere but the description', () => {
    const { description: _zd, ...zhMeta } = zh.meta
    const { description: _ed, ...enMeta } = en.meta
    const all = [...strings({ ...zh, meta: zhMeta }), ...strings({ ...en, meta: enMeta })]
    expect(all.filter(s => /系统设计师|System Designer/i.test(s))).toEqual([])
  })

  it('has the poster strings', () => {
    expect(zh.share.posterScan).toBe('扫码查看')
    expect(en.share.posterScan).toBe('Scan to view')
    expect(zh.share.posterSpec).toEqual({ tech: '技术', code: '代码', live: '在线' })
    expect(en.share.posterSpec).toEqual({ tech: 'Stack', code: 'Code', live: 'Live' })
    expect(zh.share.longPressHint).toBe('长按图片可保存到相册')
    expect(en.share.longPressHint).toBe('Long-press the image to save it to Photos')
  })
})
