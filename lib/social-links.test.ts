import { describe, it, expect } from 'vitest'
import { allSocialLinks, socialLinksByIdentity, visibleSocialLinks } from './social-links'

const ids = (links: { id: string }[]) => links.map(link => link.id)

describe('social links', () => {
  it('groups platforms by identity, in display order', () => {
    expect(ids(socialLinksByIdentity.engineer)).toEqual(['linkedin', 'github'])
    expect(ids(socialLinksByIdentity.creator)).toEqual(['bilibili', 'zhihu', 'pixiv', 'xiaohongshu', 'shutterstock'])
    expect(ids(socialLinksByIdentity.adventurer)).toEqual(['instagram', 'wechat'])
  })

  it('lists every platform once, engineer first', () => {
    expect(ids(allSocialLinks())).toEqual([
      'linkedin',
      'github',
      'bilibili',
      'zhihu',
      'pixiv',
      'xiaohongshu',
      'shutterstock',
      'instagram',
      'wechat',
    ])
  })

  it('no longer includes Twitter', () => {
    expect(ids(allSocialLinks())).not.toContain('twitter')
  })

  it('hides links that have no address yet', () => {
    const visible = ids(visibleSocialLinks(allSocialLinks()))
    expect(visible).toContain('github')
    expect(visible).not.toContain('xiaohongshu')
    expect(visible).not.toContain('wechat')
  })
})
