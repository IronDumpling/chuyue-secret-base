import { describe, it, expect, afterEach, vi } from 'vitest'
import { getShareProps } from './share'

afterEach(() => vi.unstubAllEnvs())

describe('getShareProps', () => {
  it('builds the canonical url, poster path and a download filename for a locale', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const props = getShareProps(
      { kind: 'blog', category: 'films', slug: 'her-review' },
      'en',
      'Her Review',
      'A quiet, devastating sci-fi romance.'
    )
    expect(props).toEqual({
      title: 'Her Review',
      description: 'A quiet, devastating sci-fi romance.',
      url: 'https://irondumpling.github.io/chuyue-secret-base/en/blog/films/her-review/',
      posterPath: '/share/poster/en/blog/films/her-review.jpg',
      filename: 'her-review-en-poster.jpg',
    })
  })

  it('keys the poster path, url and filename by locale, and tolerates no description', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const props = getShareProps({ kind: 'portfolio', category: 'applications', slug: 'pact' }, 'zh', 'PACT')
    expect(props.url).toBe('https://irondumpling.github.io/chuyue-secret-base/zh/portfolio/applications/pact/')
    expect(props.posterPath).toBe('/share/poster/zh/portfolio/applications/pact.jpg')
    expect(props.filename).toBe('pact-zh-poster.jpg')
    expect(props.description).toBeUndefined()
  })
})
