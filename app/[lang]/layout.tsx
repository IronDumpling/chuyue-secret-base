import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { LocaleProvider } from '@/components/shared/LocaleProvider'
import Analytics from '@/components/shared/Analytics'
import { LOCALES, isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'
import { localePath } from '@/lib/i18n/paths'
import { absoluteUrl, siteOrigin } from '@/lib/site'
import { siteOgPath } from '@/lib/share-paths'
import { rssAlternate } from '@/lib/seo'
import '../globals.css'

// Only the languages listed here exist; anything else is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }))
}

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  if (!isLocale(params.lang)) return {}
  const t = getDictionary(params.lang)

  return {
    metadataBase: new URL(siteOrigin()),
    title: { default: t.meta.title, template: `%s | ${t.meta.siteName}` },
    description: t.meta.description,
    alternates: { types: rssAlternate(params.lang) },
    openGraph: {
      type: 'website',
      siteName: t.meta.siteName,
      title: t.meta.title,
      description: t.meta.description,
      url: absoluteUrl(localePath(params.lang, '/')),
      locale: t.meta.ogLocale,
      images: [{ url: absoluteUrl(siteOgPath(params.lang)), width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [absoluteUrl(siteOgPath(params.lang))] },
  }
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  if (!isLocale(params.lang)) notFound()

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body className="antialiased">
        <LocaleProvider locale={params.lang} dictionary={getDictionary(params.lang)}>
          <Header />
          <main className="pt-16 md:pt-20">
            {children}
          </main>
          <Footer locale={params.lang} />
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
