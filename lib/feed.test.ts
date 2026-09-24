import { describe, it, expect } from 'vitest'
import { buildRss, escapeXml } from './feed'

describe('escapeXml', () => {
  it('escapes the five xml special characters', () => {
    expect(escapeXml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;'
    )
  })
})

describe('buildRss', () => {
  const channel = {
    title: 'Chuyue - Blog',
    link: 'https://example.com/site/en/blog/',
    description: 'Blog',
    feedUrl: 'https://example.com/site/en/feed.xml',
    language: 'en',
  }

  it('builds a valid rss 2.0 document with escaped items', () => {
    const xml = buildRss(channel, [
      {
        title: 'Q & A <draft>',
        link: 'https://example.com/site/en/blog/films/her-review/',
        description: 'Line "one"',
        pubDate: new Date('2026-01-04T00:00:00.000Z'),
      },
    ])
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">')
    expect(xml).toContain('<language>en</language>')
    expect(xml).toContain('<atom:link href="https://example.com/site/en/feed.xml" rel="self" type="application/rss+xml" />')
    expect(xml).toContain('<title>Q &amp; A &lt;draft&gt;</title>')
    expect(xml).toContain('<guid isPermaLink="true">https://example.com/site/en/blog/films/her-review/</guid>')
    expect(xml).toContain('<pubDate>Sun, 04 Jan 2026 00:00:00 GMT</pubDate>')
    expect(xml).toContain('<description>Line &quot;one&quot;</description>')
  })

  it('handles an empty item list', () => {
    expect(buildRss(channel, [])).toContain('</channel>')
  })
})
