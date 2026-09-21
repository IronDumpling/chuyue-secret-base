import { isLocale, type Locale } from './config'

export function splitLocale(pathname: string): { locale: Locale | null; rest: string } {
  const match = pathname.match(/^\/([^/]+)(\/.*)?$/)
  if (match && isLocale(match[1])) {
    return { locale: match[1], rest: match[2] || '/' }
  }
  return { locale: null, rest: pathname || '/' }
}

// Site-internal path -> the same page under a language, with the trailing slash the
// static export uses. Any language prefix already on the path is replaced.
export function localePath(locale: Locale, path: string): string {
  if (!isLocale(locale)) throw new Error(`Unsupported locale: ${String(locale)}`)

  const hashAt = path.indexOf('#')
  const hash = hashAt === -1 ? '' : path.slice(hashAt)
  const rawPath = hashAt === -1 ? path : path.slice(0, hashAt)

  const withSlash = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const { rest } = splitLocale(withSlash)
  const normalized = rest.endsWith('/') ? rest : `${rest}/`

  return `/${locale}${normalized}${hash}`
}

export function switchLocalePath(pathname: string, target: Locale): string {
  return localePath(target, pathname)
}
