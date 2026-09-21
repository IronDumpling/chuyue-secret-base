import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SITE_NAME, absoluteUrl, siteOrigin } from '@/lib/site'
import { SITE_OG_PATH } from '@/lib/share-paths'
import './globals.css'

const description = 'Portfolio and blog of Chuyue Zhang, a system designer graduate from University of Toronto'

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: 'Chuyue - System Designer', template: `%s | ${SITE_NAME}` },
  description,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Chuyue - System Designer',
    description,
    url: absoluteUrl('/'),
    images: [{ url: absoluteUrl(SITE_OG_PATH), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: [absoluteUrl(SITE_OG_PATH)] },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Header />
        <main className="pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
