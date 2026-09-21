import { getBasePath } from './utils'

export function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://irondumpling.github.io'
}

export function siteUrl(): string {
  return `${siteOrigin()}${getBasePath()}`
}

export function absoluteUrl(sitePath: string): string {
  const path = sitePath.startsWith('/') ? sitePath : `/${sitePath}`
  return `${siteUrl()}${path}`
}
