import { redirect } from 'next/navigation'
import { localePath } from '@/lib/i18n/paths'
import type { Locale } from '@/lib/i18n/config'

export default function AboutPage({ params }: { params: { lang: Locale } }) {
  redirect(localePath(params.lang, '/#identity-card-section'))
}
