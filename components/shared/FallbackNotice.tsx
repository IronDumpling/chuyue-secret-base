import { getDictionary } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n/config'

// Shown on a page whose text is in the other language because the requested one does
// not exist yet, e.g. a Chinese page for an article that only has an English version.
export default function FallbackNotice({ pageLang, contentLang }: { pageLang: Locale; contentLang?: Locale }) {
  if (!contentLang || contentLang === pageLang) return null
  const t = getDictionary(pageLang)

  return (
    <p
      role="note"
      className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200"
    >
      {pageLang === 'en' ? t.notice.missingEnglish : t.notice.missingChinese}
    </p>
  )
}
