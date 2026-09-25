import type { Identity } from './identity'
import type { Text } from './i18n/localized'

export interface SocialLink {
  id: string
  label: Text
  // A platform with no profile URL can show an image (a QR code) in a lightbox instead.
  // A link with neither is still shown, as an icon that does nothing when clicked: fill
  // one in and it starts working (in the About card and the footer) without any other change.
  href?: string
  qr?: string
}

// Order matters: it is the order of the buttons on the About card. The footer shows all
// of them, engineer first.
export const socialLinksByIdentity: Record<Identity, SocialLink[]> = {
  engineer: [
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/chuyuez/' },
    { id: 'github', label: 'GitHub', href: 'https://github.com/IronDumpling' },
  ],
  creator: [
    { id: 'bilibili', label: { en: 'Bilibili', zh: '哔哩哔哩' }, href: 'https://space.bilibili.com/26023645' },
    { id: 'zhihu', label: { en: 'Zhihu', zh: '知乎' }, href: 'https://www.zhihu.com/people/zhang-chu-yue-13-47' },
    { id: 'pixiv', label: 'Pixiv', href: 'https://www.pixiv.net/users/56079335' },
    { id: 'xiaohongshu', label: { en: 'Xiaohongshu', zh: '小红书' }, href: 'https://xhslink.cn/o/4CBJdzI2bxv' },
    { id: 'shutterstock', label: 'Shutterstock', href: 'https://www.shutterstock.com/g/CharIron?rid=481312973' },
  ],
  adventurer: [
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/chuyue.charlie' },
    { id: 'wechat', label: { en: 'WeChat', zh: '微信' }, qr: '/images/logo/wechat-qr.jpg' },
  ],
}

export type SocialLinkAction = 'link' | 'qr' | 'none'

export function socialLinkAction(link: SocialLink): SocialLinkAction {
  if (link.href) return 'link'
  if (link.qr) return 'qr'
  return 'none'
}

export function allSocialLinks(): SocialLink[] {
  return [
    ...socialLinksByIdentity.engineer,
    ...socialLinksByIdentity.creator,
    ...socialLinksByIdentity.adventurer,
  ]
}
