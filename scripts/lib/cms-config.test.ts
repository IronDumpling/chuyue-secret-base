import { describe, it, expect } from 'vitest'
import { buildCmsConfig } from './cms-config'
import { getCategories } from '../../lib/taxonomy'

const config = buildCmsConfig({ repo: 'me/site', branch: 'main' }) as any

function fieldNames(collectionName: string): string[] {
  const collection = config.collections.find((c: any) => c.name === collectionName)
  return collection.fields.map((f: any) => f.name)
}

function fields(collectionName: string): any[] {
  return config.collections.find((c: any) => c.name === collectionName).fields
}

describe('buildCmsConfig', () => {
  it('uses the github backend with token login', () => {
    expect(config.backend).toEqual({ name: 'github', repo: 'me/site', branch: 'main', auth_methods: ['token'] })
  })

  it('declares a top-level media folder fallback for the global asset library', () => {
    expect(config.media_folder).toBe('/images')
    expect(config.public_folder).toBe('/images')
  })

  it('declares bilingual multiple_files i18n matching the existing .en/.zh naming', () => {
    expect(config.i18n).toEqual({
      structure: 'multiple_files',
      locales: ['en', 'zh'],
      default_locale: 'en',
      initial_locales: ['en'],
    })
  })

  it('creates one collection per blog and portfolio category, all names unique', () => {
    const expected = getCategories('blog').length + getCategories('portfolio').length
    expect(config.collections).toHaveLength(expected)
    expect(config.collections).toHaveLength(12)
    const names = config.collections.map((c: any) => c.name)
    expect(new Set(names).size).toBe(expected)
  })

  it('points a blog collection at the folder and image paths the site reads', () => {
    const c = config.collections.find((x: any) => x.name === 'blog-music')
    expect(c).toMatchObject({
      folder: 'blog/music',
      extension: 'mdx',
      format: 'frontmatter',
      create: true,
      i18n: true,
      media_folder: '/images/blog/music',
      public_folder: '/images/blog/music',
    })
  })

  it('points a portfolio collection at the folder and image paths the site reads', () => {
    const c = config.collections.find((x: any) => x.name === 'portfolio-photography')
    expect(c).toMatchObject({
      folder: 'portfolio/photography',
      extension: 'mdx',
      format: 'frontmatter',
      create: true,
      i18n: true,
      media_folder: '/images/portfolio/photography',
      public_folder: '/images/portfolio/photography',
    })
  })

  it('only offers a rating field on blog review-group categories', () => {
    expect(fieldNames('blog-films')).toContain('rating')
    expect(fieldNames('blog-moments')).not.toContain('rating')
  })

  it('omits github/demo on portfolio Art-group categories, keeps them on Computing', () => {
    expect(fieldNames('portfolio-illustration')).not.toContain('github')
    expect(fieldNames('portfolio-illustration')).not.toContain('demo')
    expect(fieldNames('portfolio-photography')).not.toContain('github')
    expect(fieldNames('portfolio-games')).toContain('github')
    expect(fieldNames('portfolio-games')).toContain('demo')
  })

  it('has website as a list field on every portfolio collection', () => {
    expect(fieldNames('portfolio-illustration')).toContain('website')
    expect(fieldNames('portfolio-games')).toContain('website')
  })

  it('has no tags field on blog collections (Blog has no tags in its data model)', () => {
    expect(fieldNames('blog-films')).not.toContain('tags')
    expect(fieldNames('blog-moments')).not.toContain('tags')
  })

  it('keeps tags as a shared list field on portfolio collections', () => {
    const tags = fields('portfolio-games').find((f: any) => f.name === 'tags')
    expect(tags).toMatchObject({ i18n: 'duplicate' })
  })

  it('marks shared fields as i18n duplicate and per-language fields as i18n true', () => {
    const byName = (name: string) => fields('blog-films').find((f: any) => f.name === name)
    expect(byName('title')).toMatchObject({ i18n: true })
    expect(byName('description')).toMatchObject({ i18n: true })
    expect(byName('body')).toMatchObject({ i18n: true })
    expect(byName('date')).toMatchObject({ i18n: 'duplicate' })
    expect(byName('images')).toMatchObject({ i18n: 'duplicate' })
    expect(byName('rating')).toMatchObject({ i18n: 'duplicate' })

    const portfolioByName = (name: string) => fields('portfolio-games').find((f: any) => f.name === name)
    expect(portfolioByName('github')).toMatchObject({ i18n: 'duplicate' })
    expect(portfolioByName('demo')).toMatchObject({ i18n: 'duplicate' })
    expect(portfolioByName('website')).toMatchObject({ i18n: 'duplicate' })
  })

  it('uses the datetime widget with type date for the date field', () => {
    const date = fields('blog-films').find((f: any) => f.name === 'date')
    expect(date).toMatchObject({ widget: 'datetime', type: 'date' })
  })

  it('has the body field last, using the richtext widget', () => {
    const blogFields = fields('blog-films')
    expect(blogFields[blogFields.length - 1]).toMatchObject({ name: 'body', widget: 'richtext' })
    const portfolioFieldsList = fields('portfolio-games')
    expect(portfolioFieldsList[portfolioFieldsList.length - 1]).toMatchObject({ name: 'body', widget: 'richtext' })
  })

  it('compresses uploaded images to webp, max 2048px', () => {
    expect(config.media_libraries.all.transformations.raster_image).toMatchObject({
      format: 'webp',
      quality: 82,
      width: 2048,
      height: 2048,
    })
  })
})
