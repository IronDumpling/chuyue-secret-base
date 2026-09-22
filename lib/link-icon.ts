import type { Link } from './frontmatter'

export type LinkIconId = 'github' | 'youtube' | 'bilibili' | 'itch' | 'appstore' | 'pixiv' | 'website'

interface DomainMatch {
  test: (hostname: string) => boolean
  iconId: LinkIconId
  label: string
}

const DOMAIN_MATCHERS: DomainMatch[] = [
  { test: h => h === 'github.com' || h === 'www.github.com', iconId: 'github', label: 'GitHub' },
  { test: h => h === 'itch.io' || h.endsWith('.itch.io'), iconId: 'itch', label: 'itch.io' },
  { test: h => h === 'youtube.com' || h === 'www.youtube.com' || h === 'youtu.be', iconId: 'youtube', label: 'YouTube' },
  { test: h => h === 'bilibili.com' || h === 'www.bilibili.com' || h === 'b23.tv', iconId: 'bilibili', label: 'Bilibili' },
  { test: h => h === 'apps.apple.com', iconId: 'appstore', label: 'App Store' },
  { test: h => h === 'pixiv.net' || h === 'www.pixiv.net', iconId: 'pixiv', label: 'Pixiv' },
]

function stripWww(hostname: string): string {
  return hostname.startsWith('www.') ? hostname.slice(4) : hostname
}

// Identify a link's platform by domain, for icon + fallback label purposes. `link.label`
// (when the frontmatter set one) always wins over the auto-detected label, but the icon is
// always chosen by domain so a labeled GitHub link still gets the GitHub icon.
export function describeLink(link: Link): { label: string; iconId: LinkIconId } {
  let hostname: string | null = null
  try {
    hostname = new URL(link.url).hostname
  } catch {
    hostname = null
  }

  if (hostname) {
    const match = DOMAIN_MATCHERS.find(m => m.test(hostname as string))
    if (match) {
      return { label: link.label ?? match.label, iconId: match.iconId }
    }
    return { label: link.label ?? stripWww(hostname), iconId: 'website' }
  }

  return { label: link.label ?? link.url, iconId: 'website' }
}

export interface LinkGroups {
  github: Link[]
  demo: Link[]
  website: Link[]
}

// One link to feature as the primary call-to-action: the most likely thing a visitor wants
// (a live demo, then a plain website, then falling back to source code).
export function pickPrimaryLink(groups: LinkGroups): Link | null {
  return groups.demo[0] ?? groups.website[0] ?? groups.github[0] ?? null
}

// Every other link, in the same demo/website/github order, minus whichever one is primary.
export function secondaryLinks(groups: LinkGroups, primary: Link | null): Link[] {
  const all = [...groups.demo, ...groups.website, ...groups.github]
  if (!primary) return all
  return all.filter(link => link.url !== primary.url)
}
