import { describe, it, expect } from 'vitest'
import { pagePath, shareImagePath, siteOgPath } from './share-paths'

describe('share paths', () => {
  it('builds blog page and image paths under the language', () => {
    const t = { kind: 'blog', category: 'music', type: 'review', slug: 'laufey-bewitched' } as const
    expect(pagePath(t, 'en')).toBe('/en/blog/music/review/laufey-bewitched/')
    expect(pagePath(t, 'zh')).toBe('/zh/blog/music/review/laufey-bewitched/')
    expect(shareImagePath(t, 'og', 'en')).toBe('/share/og/en/blog/music/review/laufey-bewitched.jpg')
    expect(shareImagePath(t, 'poster', 'zh')).toBe('/share/poster/zh/blog/music/review/laufey-bewitched.jpg')
  })

  it('builds portfolio page and image paths (no type segment)', () => {
    const t = { kind: 'portfolio', category: 'applications', slug: 'pact' } as const
    expect(pagePath(t, 'en')).toBe('/en/portfolio/applications/pact/')
    expect(shareImagePath(t, 'og', 'zh')).toBe('/share/og/zh/portfolio/applications/pact.jpg')
  })

  it('has one site card per language', () => {
    expect(siteOgPath('en')).toBe('/share/og/en/site.jpg')
    expect(siteOgPath('zh')).toBe('/share/og/zh/site.jpg')
  })
})
