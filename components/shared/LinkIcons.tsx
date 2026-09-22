import type { LinkIconId } from '@/lib/link-icon'
import { withBasePath } from '@/lib/utils'

const GITHUB_ICON_PATH =
  'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'

export function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d={GITHUB_ICON_PATH} />
    </svg>
  )
}

export function ExternalLinkIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
}

export function YoutubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export function AppStoreIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.05 12.536c-.018-1.98 1.62-2.933 1.694-2.98-.923-1.348-2.36-1.533-2.874-1.554-1.223-.124-2.386.72-3.007.72-.62 0-1.582-.702-2.6-.683-1.34.02-2.575.78-3.263 1.98-1.39 2.41-.354 5.98.999 7.936.663.957 1.452 2.03 2.489 1.99 1-.04 1.377-.646 2.587-.646 1.208 0 1.548.646 2.605.622 1.076-.017 1.756-.972 2.412-1.933.76-1.107 1.073-2.18 1.09-2.235-.024-.011-2.09-.803-2.132-3.217zM15.06 6.44c.55-.668.92-1.596.82-2.52-.792.033-1.75.53-2.32 1.196-.51.593-.956 1.54-.836 2.448.887.07 1.79-.45 2.336-1.124z" />
    </svg>
  )
}

// No official source asset for itch.io's mark, so this is a generic storefront/game icon
// rather than a faithful brand reproduction — the platform label carries the identity.
export function ItchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 9v10a1 1 0 001 1h10a1 1 0 001-1V9M4 5l1.5-2.5A1 1 0 016.35 2h11.3a1 1 0 01.85.5L20 5m-16 0h16m-16 0l-.5 3a2.5 2.5 0 004.9.8M8.4 8.8A2.5 2.5 0 0012 8a2.5 2.5 0 003.6.8m0 0A2.5 2.5 0 0020.5 8L20 5"
      />
    </svg>
  )
}

export function BilibiliIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <img src={withBasePath('/images/logo/bilibili.svg')} alt="" className={`${className} dark:invert`} />
}

export function PixivIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return <img src={withBasePath('/images/logo/pixiv.svg')} alt="" className={`${className} dark:invert`} />
}

const ICONS: Record<LinkIconId, (props: { className?: string }) => React.JSX.Element> = {
  github: GithubIcon,
  youtube: YoutubeIcon,
  bilibili: BilibiliIcon,
  itch: ItchIcon,
  appstore: AppStoreIcon,
  pixiv: PixivIcon,
  website: ExternalLinkIcon,
}

export default function LinkIcon({ iconId, className }: { iconId: LinkIconId; className?: string }) {
  const Icon = ICONS[iconId]
  return <Icon className={className} />
}
