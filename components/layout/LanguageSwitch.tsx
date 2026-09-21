'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALES, LOCALE_STORAGE_KEY } from '@/lib/i18n/config'
import { switchLocalePath } from '@/lib/i18n/paths'
import { useLocale, useT } from '@/components/shared/LocaleProvider'

// Two languages, so one button that goes to the same page in the other language.
export default function LanguageSwitch() {
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
      href={switchLocalePath(pathname, other)}
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
