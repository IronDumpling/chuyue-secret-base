'use client'

import { useEffect } from 'react'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isLocale } from '@/lib/i18n/config'
import { localePath } from '@/lib/i18n/paths'
import { withBasePath } from '@/lib/utils'

// GitHub Pages cannot send HTTP redirects, so the root URL is a tiny page that forwards the
// visitor to the home page in the language they last picked, or English.
export default function RootRedirect() {
  const fallbackTarget = withBasePath(localePath(DEFAULT_LOCALE, '/'))

  useEffect(() => {
    let locale = DEFAULT_LOCALE
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      if (isLocale(saved)) locale = saved
    } catch {
      // Storage can be blocked; the default language is fine.
    }
    window.location.replace(`${withBasePath(localePath(locale, '/'))}${window.location.hash}`)
  }, [])

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
