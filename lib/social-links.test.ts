import { describe, it, expect } from 'vitest'
import { allSocialLinks, socialLinkAction, socialLinksByIdentity } from './social-links'

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

  it('says what a click does: open the address, open the QR code, or nothing yet', () => {
    const byId = (id: string) => allSocialLinks().find(link => link.id === id)!
    expect(socialLinkAction(byId('github'))).toBe('link')
    expect(socialLinkAction(byId('wechat'))).toBe('qr')
    expect(socialLinkAction(byId('shutterstock'))).toBe('link')
    expect(socialLinkAction({ id: 'unfilled', label: 'Unfilled' })).toBe('none')
  })

  it('opens the QR code as an image, not as a link', () => {
    const wechat = allSocialLinks().find(link => link.id === 'wechat')
    expect(wechat).toMatchObject({ qr: '/images/logo/wechat-qr.jpg' })
    expect(wechat?.href).toBeUndefined()
  })
})
