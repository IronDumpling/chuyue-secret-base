import { describe, it, expect, afterEach, vi } from 'vitest'
import { absoluteUrl, siteUrl, siteOrigin } from './site'

describe('site url helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('joins origin, base path and page path', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    expect(siteUrl()).toBe('https://irondumpling.github.io/chuyue-secret-base')
    expect(absoluteUrl('/blog/x/')).toBe('https://irondumpling.github.io/chuyue-secret-base/blog/x/')
  })

  it('works without a base path and tolerates a missing leading slash', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '')
    expect(absoluteUrl('feed.xml')).toBe('https://irondumpling.github.io/feed.xml')
  })

  it('honours a custom origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', 'https://example.com')
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '')
    expect(siteOrigin()).toBe('https://example.com')
  })
})
