import ContactSection from '@/components/sections/ContactSection'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

export function generateMetadata({ params }: { params: { lang: Locale } }) {
  const t = getDictionary(params.lang)
  return { title: t.contact.heading, description: t.contact.pageDescription }
}

export default function ContactPage() {
  return <ContactSection />
}

