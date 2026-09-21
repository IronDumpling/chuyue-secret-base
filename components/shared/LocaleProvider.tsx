'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Locale } from '@/lib/i18n/config'
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
