import type { Locale } from './i18n/config'
import { absoluteUrl } from './site'
import { pagePath, shareImagePath, type ShareTarget } from './share-paths'

export interface ShareProps {
  title: string
  description?: string
  url: string
  posterPath: string
  filename: string
}

export function getShareProps(
  target: ShareTarget,
  lang: Locale,
  title: string,
  description?: string
): ShareProps {
  return {
    title,
    description,
    url: absoluteUrl(pagePath(target, lang)),
    posterPath: shareImagePath(target, 'poster', lang),
    filename: `${target.slug}-${lang}-poster.jpg`,
  }
}
