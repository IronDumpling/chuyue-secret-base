import { describe, it, expect } from 'vitest'
import { SHARE_TARGETS } from './share-targets'

function find(id: string) {
  const target = SHARE_TARGETS.find(t => t.id === id)
  if (!target) throw new Error(`missing share target: ${id}`)
  return target
}

describe('SHARE_TARGETS', () => {
  it('builds a Weibo share url', () => {
    const url = find('weibo').buildUrl({ title: 'Her', url: 'https://example.com/her' })
    expect(url).toBe('https://service.weibo.com/share/share.php?url=https%3A%2F%2Fexample.com%2Fher&title=Her')
  })

  it('builds an X (Twitter) share url', () => {
    const url = find('twitter').buildUrl({ title: 'Her', url: 'https://example.com/her' })
    expect(url).toBe('https://twitter.com/intent/tweet?url=https%3A%2F%2Fexample.com%2Fher&text=Her')
  })

  it('builds a Facebook share url', () => {
    const url = find('facebook').buildUrl({ title: 'Her', url: 'https://example.com/her' })
    expect(url).toBe('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2Fher')
  })

  it('builds a WhatsApp share url combining title and url in one text param', () => {
    const url = find('whatsapp').buildUrl({ title: 'Her', url: 'https://example.com/her' })
    expect(url).toBe('https://api.whatsapp.com/send?text=Her%20https%3A%2F%2Fexample.com%2Fher')
  })

  it('builds a Telegram share url', () => {
    const url = find('telegram').buildUrl({ title: 'Her', url: 'https://example.com/her' })
    expect(url).toBe('https://t.me/share/url?url=https%3A%2F%2Fexample.com%2Fher&text=Her')
  })

  it('encodes spaces, ampersands and CJK titles correctly', () => {
    const input = { title: '她 & 我们的故事', url: 'https://example.com/her?x=1&y=2' }
    const weiboUrl = find('weibo').buildUrl(input)
    const parsed = new URL(weiboUrl)
    expect(parsed.searchParams.get('title')).toBe('她 & 我们的故事')
    expect(parsed.searchParams.get('url')).toBe('https://example.com/her?x=1&y=2')

    const whatsappUrl = find('whatsapp').buildUrl(input)
    const whatsappParsed = new URL(whatsappUrl)
    expect(whatsappParsed.searchParams.get('text')).toBe('她 & 我们的故事 https://example.com/her?x=1&y=2')
  })

  it('has exactly the five expected targets, in order', () => {
    expect(SHARE_TARGETS.map(t => t.id)).toEqual(['weibo', 'twitter', 'facebook', 'whatsapp', 'telegram'])
  })
})
