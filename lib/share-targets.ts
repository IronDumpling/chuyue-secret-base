export interface ShareTargetInput {
  title: string
  url: string
}

export interface ShareTarget {
  id: 'weibo' | 'twitter' | 'facebook' | 'whatsapp' | 'telegram'
  buildUrl(input: ShareTargetInput): string
}

// Official web share-intent URLs for platforms that have one. WeChat/Instagram/Xiaohongshu
// have no equivalent — they can only be reached through the native share sheet's file
// attachment path (see ShareBar's systemShare), not a one-click link like these.
export const SHARE_TARGETS: ShareTarget[] = [
  {
    id: 'weibo',
    buildUrl: ({ title, url }) =>
      `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: 'twitter',
    buildUrl: ({ title, url }) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: 'facebook',
    buildUrl: ({ url }) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'whatsapp',
    buildUrl: ({ title, url }) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    id: 'telegram',
    buildUrl: ({ title, url }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
]
