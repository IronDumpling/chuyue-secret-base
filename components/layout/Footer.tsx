import Link from 'next/link'
import SocialIcon from '@/components/shared/SocialIcon'
import { allSocialLinks, visibleSocialLinks } from '@/lib/social-links'
import { pick } from '@/lib/i18n/localized'
import { localePath } from '@/lib/i18n/paths'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const socialLinks = visibleSocialLinks(allSocialLinks())

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">{t.meta.siteName}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t.footer.tagline}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={localePath(locale, '/')} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href={localePath(locale, '/portfolio')} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t.nav.portfolio}
                </Link>
              </li>
              <li>
                <Link href={localePath(locale, '/blog')} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t.nav.blog}
                </Link>
              </li>
              <li>
                <Link href={localePath(locale, '/contact')} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.socialMedia}</h4>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  aria-label={pick(social.label, locale)}
                >
                  <SocialIcon id={social.id} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} {t.meta.siteName}. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  )
}

