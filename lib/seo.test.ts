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

const base = 'https://irondumpling.github.io/chuyue-secret-base'
const her = { kind: 'blog', category: 'films', slug: 'her-review' } as const

describe('buildPageMetadata', () => {
  it('produces canonical, open graph and twitter data with absolute urls', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const meta = buildPageMetadata(her, 'en', {
      title: 'Her Review',
      description: 'The most underrated sci-fi film',
      body: '',
      date: '2026-01-04',
    })
    expect(meta.title).toBe('Her Review')
    expect(meta.alternates?.canonical).toBe(`${base}/en/blog/films/her-review/`)
    expect(meta.openGraph).toMatchObject({
      url: `${base}/en/blog/films/her-review/`,
      siteName: 'Chuyue',
      locale: 'en_US',
      publishedTime: '2026-01-04T00:00:00.000Z',
      images: [
        { url: `${base}/share/og/en/blog/films/her-review.jpg`, width: 1200, height: 630, alt: 'Her Review' },
      ],
    })
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' })
  })

  it('uses the page language for the url, image and locale', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const meta = buildPageMetadata(her, 'zh', { title: '她', body: 'x', contentLang: 'zh' })
    expect(meta.alternates?.canonical).toBe(`${base}/zh/blog/films/her-review/`)
    expect(meta.openGraph).toMatchObject({ locale: 'zh_CN' })
    expect((meta.openGraph as any).images[0].url).toBe(`${base}/share/og/zh/blog/films/her-review.jpg`)
  })

  it('lists both languages as alternates, with English as the default', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const meta = buildPageMetadata(her, 'en', { title: 'Her', body: 'x' })
    expect(meta.alternates?.languages).toEqual({
      en: `${base}/en/blog/films/her-review/`,
      zh: `${base}/zh/blog/films/her-review/`,
      'x-default': `${base}/en/blog/films/her-review/`,
    })
  })

  it('only lists languages the post really exists in, and canonicalises a fallback page', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    // Chinese page showing the English text because there is no Chinese version.
    const meta = buildPageMetadata(her, 'zh', { title: 'Her', body: 'x', contentLang: 'en', languages: ['en'] })
    expect(meta.alternates?.canonical).toBe(`${base}/en/blog/films/her-review/`)
    expect(meta.alternates?.languages).toEqual({
      en: `${base}/en/blog/films/her-review/`,
      'x-default': `${base}/en/blog/films/her-review/`,
    })
    // Its own url and preview image still belong to the Chinese page.
    expect((meta.openGraph as any).url).toBe(`${base}/zh/blog/films/her-review/`)
  })

  it('omits publishedTime for an invalid date', () => {
    const meta = buildPageMetadata(
      { kind: 'portfolio', category: 'applications', slug: 'pact' },
      'en',
      { title: 'PA:CT', body: 'x', date: 'not a date' }
    )
    expect((meta.openGraph as any).publishedTime).toBeUndefined()
  })
})
