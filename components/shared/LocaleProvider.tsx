'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { INTL_LOCALE, type Locale } from '@/lib/i18n/config'
import { localePath } from '@/lib/i18n/paths'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'

interface LocaleContextValue {
  locale: Locale
  dictionary: Dictionary
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: LocaleContextValue & { children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, dictionary }}>{children}</LocaleContext.Provider>
}

function useLocaleContext(): LocaleContextValue {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocale/useT must be used inside <LocaleProvider>')
  return value
}

export function useLocale(): Locale {
  return useLocaleContext().locale
}

export function useT(): Dictionary {
  return useLocaleContext().dictionary
}

// `const lp = useLocalePath()` then `lp('/blog')` -> '/en/blog/' or '/zh/blog/'.
export function useLocalePath(): (path: string) => string {
  const locale = useLocale()
  return path => localePath(locale, path)
}

// `const formatDate = useDateFormatter()` then `formatDate('2026-01-04')`.
export function useDateFormatter(): (date: string | Date) => string {
  const locale = useLocale()
  return date =>
    new Date(date).toLocaleDateString(INTL_LOCALE[locale], { year: 'numeric', month: 'long', day: 'numeric' })
}
