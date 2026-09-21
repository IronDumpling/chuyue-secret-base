import { describe, it, expect } from 'vitest'
import { pagePath, shareImagePath, SITE_OG_PATH } from './share-paths'

describe('share paths', () => {
  it('builds blog page and image paths', () => {
    const t = { kind: 'blog', category: 'music', type: 'review', slug: 'laufey-bewitched' } as const
    expect(pagePath(t)).toBe('/blog/music/review/laufey-bewitched/')
    expect(shareImagePath(t, 'og')).toBe('/share/og/blog/music/review/laufey-bewitched.jpg')
    expect(shareImagePath(t, 'poster')).toBe('/share/poster/blog/music/review/laufey-bewitched.jpg')
  })

  it('builds portfolio page and image paths (no type segment)', () => {
    const t = { kind: 'portfolio', category: 'applications', slug: 'pact' } as const
    expect(pagePath(t)).toBe('/portfolio/applications/pact/')
    expect(shareImagePath(t, 'og')).toBe('/share/og/portfolio/applications/pact.jpg')
  })

  it('exposes the site card path', () => {
    expect(SITE_OG_PATH).toBe('/share/og/site.jpg')
  })
})
