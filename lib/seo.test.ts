import { describe, it, expect, vi, afterEach } from 'vitest'
import { summarize, buildPageMetadata } from './seo'

afterEach(() => vi.unstubAllEnvs())

describe('summarize', () => {
  it('prefers the frontmatter description', () => {
    expect(summarize('Short blurb', '# Title\n\nbody text')).toBe('Short blurb')
  })

  it('strips markdown from the body when there is no description', () => {
    const body = '# Her\n\n![alt](/images/a.jpg)\n\nSome **bold** text with a [link](https://x.com) and `code`.'
    expect(summarize(undefined, body)).toBe('Her Some bold text with a link and code.')
  })

  it('truncates long bodies with an ellipsis', () => {
    const out = summarize(undefined, 'word '.repeat(200), 50)
    expect(out.length).toBeLessThanOrEqual(50)
    expect(out.endsWith('…')).toBe(true)
  })
})

describe('buildPageMetadata', () => {
  it('produces canonical, open graph and twitter data with absolute urls', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const meta = buildPageMetadata(
      { kind: 'blog', category: 'films-shows', type: 'review', slug: 'her-review' },
      { title: 'Her Review', description: 'The most underrated sci-fi film', body: '', date: '2026-01-04' }
    )
    const base = 'https://irondumpling.github.io/chuyue-secret-base'
    expect(meta.title).toBe('Her Review')
    expect(meta.alternates?.canonical).toBe(`${base}/blog/films-shows/review/her-review/`)
    expect(meta.openGraph).toMatchObject({
      url: `${base}/blog/films-shows/review/her-review/`,
      siteName: 'Chuyue',
      publishedTime: '2026-01-04T00:00:00.000Z',
      images: [{ url: `${base}/share/og/blog/films-shows/review/her-review.jpg`, width: 1200, height: 630, alt: 'Her Review' }],
    })
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' })
  })

  it('omits publishedTime for an invalid date', () => {
    const meta = buildPageMetadata(
      { kind: 'portfolio', category: 'applications', slug: 'pact' },
      { title: 'PA:CT', body: 'x', date: 'not a date' }
    )
    expect((meta.openGraph as any).publishedTime).toBeUndefined()
  })
})
