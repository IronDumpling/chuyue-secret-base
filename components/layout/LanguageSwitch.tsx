'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LOCALES, LOCALE_STORAGE_KEY } from '@/lib/i18n/config'
import { switchLocalePath } from '@/lib/i18n/paths'
import { applySelectionToParams, selectionFromParams } from '@/lib/filter-model'
import { useLocale, useT } from '@/components/shared/LocaleProvider'

// Two languages, so one button that goes to the same page in the other language.
//
// The blog and portfolio filter is in the query ('?group=reviews&category=films'). Its ids are
// the same in both languages, so the query is carried over and the other language opens with
// the same filter chosen. Reading the query needs a Suspense boundary in a static export; the
// fallback is the plain link, which is what the exported HTML contains.
export default function LanguageSwitch() {
  return (
    <Suspense fallback={<SwitchLink query="" />}>
      <SwitchLinkWithFilter />
    </Suspense>
  )
}

function SwitchLinkWithFilter() {
  const searchParams = useSearchParams()
  // Only the filter is carried over, not whatever else may be in the address.
  const carried = new URLSearchParams()
  applySelectionToParams(carried, selectionFromParams(new URLSearchParams(searchParams.toString())))
  return <SwitchLink query={carried.toString()} />
}

function SwitchLink({ query }: { query: string }) {
  const locale = useLocale()
  const t = useT()
  const pathname = usePathname()
  const other = LOCALES.find(l => l !== locale)!

  const remember = () => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, other)
    } catch {
      // Storage can be blocked; switching still works, it just is not remembered.
    }
  }

  return (
    <Link
      href={`${switchLocalePath(pathname, other)}${query ? `?${query}` : ''}`}
      onClick={remember}
      hrefLang={other}
      lang={other}
      aria-label={t.language.switchAria}
      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {t.language.switchLabel}
    </Link>
  )
}
