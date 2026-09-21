import { describe, it, expect } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, isLocale } from './config'
import { localePath, splitLocale, switchLocalePath } from './paths'

describe('config', () => {
  it('defaults to English and knows both locales', () => {
    expect(DEFAULT_LOCALE).toBe('en')
    expect([...LOCALES]).toEqual(['en', 'zh'])
    expect(isLocale('zh')).toBe(true)
    expect(isLocale('fr')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })
})

describe('localePath', () => {
  it('prefixes plain paths and adds the trailing slash the site uses', () => {
    expect(localePath('zh', '/blog')).toBe('/zh/blog/')
    expect(localePath('en', '/blog/')).toBe('/en/blog/')
    expect(localePath('en', '/blog/music/review/a')).toBe('/en/blog/music/review/a/')
  })

  it('handles the root path', () => {
    expect(localePath('zh', '/')).toBe('/zh/')
    expect(localePath('en', '')).toBe('/en/')
  })

  it('keeps hash anchors', () => {
    expect(localePath('en', '/#experiences-section')).toBe('/en/#experiences-section')
    expect(localePath('zh', '/contact#form')).toBe('/zh/contact/#form')
  })

  it('replaces an existing locale prefix instead of stacking', () => {
    expect(localePath('zh', '/en/blog/')).toBe('/zh/blog/')
    expect(localePath('en', '/zh')).toBe('/en/')
  })

  it('does not mistake a path that only starts with the letters of a locale', () => {
    expect(localePath('zh', '/english-notes')).toBe('/zh/english-notes/')
  })
})

describe('splitLocale', () => {
  it('separates the locale from the rest of the path', () => {
    expect(splitLocale('/zh/blog/a/')).toEqual({ locale: 'zh', rest: '/blog/a/' })
    expect(splitLocale('/en/')).toEqual({ locale: 'en', rest: '/' })
    expect(splitLocale('/en')).toEqual({ locale: 'en', rest: '/' })
  })

  it('reports no locale for unprefixed paths', () => {
    expect(splitLocale('/blog/a/')).toEqual({ locale: null, rest: '/blog/a/' })
    expect(splitLocale('/')).toEqual({ locale: null, rest: '/' })
  })
})

describe('switchLocalePath', () => {
  it('keeps the page and changes the language', () => {
    expect(switchLocalePath('/zh/blog/films-shows/review/her-review/', 'en')).toBe(
      '/en/blog/films-shows/review/her-review/'
    )
    expect(switchLocalePath('/en/', 'zh')).toBe('/zh/')
  })

  it('works for an unprefixed path too', () => {
    expect(switchLocalePath('/portfolio/', 'zh')).toBe('/zh/portfolio/')
  })
})
