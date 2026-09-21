'use client'

import { useEffect } from 'react'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isLocale } from '@/lib/i18n/config'
import { localePath } from '@/lib/i18n/paths'
import { withBasePath } from '@/lib/utils'

interface LegacyRedirectProps {
  // The site path without a language, e.g. '/blog/music/review/a/' or '/#experiences-section'.
  path: string
  // The root URL honours the visitor's saved language; old article URLs always go to
  // English, the language they were written in.
  useSavedLanguage?: boolean
}

// GitHub Pages cannot send HTTP redirects, so URLs from before the site had languages
// are tiny pages that forward the visitor to the same page under /en/ (or /zh/).
export default function LegacyRedirect({ path, useSavedLanguage = false }: LegacyRedirectProps) {
  const fallbackTarget = withBasePath(localePath(DEFAULT_LOCALE, path))

  useEffect(() => {
    let locale = DEFAULT_LOCALE
    if (useSavedLanguage) {
      try {
        const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
        if (isLocale(saved)) locale = saved
      } catch {
        // Storage can be blocked; the default language is fine.
      }
    }
    const keepHash = path.includes('#') ? '' : window.location.hash
    window.location.replace(`${withBasePath(localePath(locale, path))}${keepHash}`)
  }, [path, useSavedLanguage])

  return (
    <div className="container py-24 text-center">
      <p>
        <a href={fallbackTarget} className="underline">
          Continue
        </a>
      </p>
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${fallbackTarget}`} />
      </noscript>
    </div>
  )
}
