import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildJsonLd, reviewedName, serializeJsonLd } from './jsonld'

afterEach(() => vi.unstubAllEnvs())

const base = 'https://irondumpling.github.io/chuyue-secret-base'
const her = { kind: 'blog', category: 'films', slug: 'her-review' } as const

describe('reviewedName', () => {
  it('takes the work name out of review titles', () => {
    expect(reviewedName('Her Review')).toBe('Her')
    expect(reviewedName('The Social Network Review')).toBe('The Social Network')
    expect(reviewedName('《生化危机：爆发夜》影评')).toBe('生化危机：爆发夜')
  })

  it('returns null for titles that are not a single-work review', () => {
    expect(reviewedName('Ang Lee Movie Marathon')).toBeNull()
    expect(reviewedName('李安电影马拉松')).toBeNull()
  })
})

describe('buildJsonLd', () => {
  it('describes a rated review as BlogPosting + Review of the right kind of work', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const data = buildJsonLd(her, 'en', {
      title: 'Her Review',
      description: 'Underrated',
      body: '',
      date: '2026-01-04',
      lang: 'en',
      rating: 8,
      authorName: 'Chuyue Zhang',
    })
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': ['BlogPosting', 'Review'],
      headline: 'Her Review',
      description: 'Underrated',
      inLanguage: 'en',
      datePublished: '2026-01-04T00:00:00.000Z',
      url: `${base}/en/blog/films/her-review/`,
      image: `${base}/share/og/en/blog/films/her-review.jpg`,
      author: { '@type': 'Person', name: 'Chuyue Zhang' },
      itemReviewed: { '@type': 'Movie', name: 'Her' },
      reviewRating: { '@type': 'Rating', ratingValue: 8, bestRating: 10, worstRating: 0 },
    })
  })

  it('leaves out review markup when there is no rating or no single reviewed work', () => {
    const noRating = buildJsonLd(her, 'en', { title: 'Her Review', body: 'x', lang: 'en', authorName: 'C' })
    expect(noRating['@type']).toBe('BlogPosting')
    expect(noRating.reviewRating).toBeUndefined()

    const marathon = buildJsonLd(
      { kind: 'blog', category: 'films', slug: 'ang-lee' },
      'en',
      { title: 'Ang Lee Movie Marathon', body: 'x', lang: 'en', rating: 8, authorName: 'C' }
    )
    expect(marathon['@type']).toBe('BlogPosting')
  })

  it('describes a portfolio project as CreativeWork', () => {
    const data = buildJsonLd({ kind: 'portfolio', category: 'applications', slug: 'pact' }, 'zh', {
      title: 'PA:CT',
      body: 'x',
      lang: 'en',
      authorName: '张楚岳',
    })
    expect(data['@type']).toBe('CreativeWork')
    expect(data.name).toBe('PA:CT')
    expect(data.inLanguage).toBe('en')
    expect(data.datePublished).toBeUndefined()
  })
})

describe('serializeJsonLd', () => {
  it('escapes < so a title cannot close the script tag', () => {
    const out = serializeJsonLd({ headline: '</script><script>alert(1)</script>' })
    expect(out).not.toContain('<')
    expect(JSON.parse(out).headline).toBe('</script><script>alert(1)</script>')
  })
})
