import type { Identity } from './identity'
import type { Text } from './i18n/localized'

export interface SocialLink {
  id: string
  label: Text
  // Links without an href are not shown yet: fill it in and the button appears
  // (in the About card and the footer) without any other change.
  href?: string
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
    // TODO: add the profile link, and the icon at public/images/logo/xiaohongshu.svg
    { id: 'xiaohongshu', label: { en: 'Xiaohongshu', zh: '小红书' } },
    // TODO: add the portfolio link, and the icon at public/images/logo/shutterstock.svg
    { id: 'shutterstock', label: 'Shutterstock' },
  ],
  adventurer: [
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/chuyue.charlie' },
    // TODO: WeChat has no profile URL. Decide what the button opens (a QR code image?),
    // then add the icon at public/images/logo/wechat.svg
    { id: 'wechat', label: { en: 'WeChat', zh: '微信' } },
  ],
}

export function visibleSocialLinks(links: SocialLink[]): (SocialLink & { href: string })[] {
  return links.filter((link): link is SocialLink & { href: string } => Boolean(link.href))
}

export function allSocialLinks(): SocialLink[] {
  return [
    ...socialLinksByIdentity.engineer,
    ...socialLinksByIdentity.creator,
    ...socialLinksByIdentity.adventurer,
  ]
}
