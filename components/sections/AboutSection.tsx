'use client'

import IdentitySwitcher from '@/components/shared/IdentitySwitcher'
import { Identity } from '@/lib/identity'
import { withBasePath } from '@/lib/utils'
import Link from 'next/link'
import { SkillsAccordion } from '@/components/sections/SkillsSection'
import RotatingImage from '@/components/shared/RotatingImage'
import { useLocale, useLocalePath, useT } from '@/components/shared/LocaleProvider'
import SocialIcon from '@/components/shared/SocialIcon'
import { socialLinksByIdentity, visibleSocialLinks } from '@/lib/social-links'
import { pick } from '@/lib/i18n/localized'

interface AboutContent {
  images: string[] // alt text for each comes from the dictionary, in the same order
  statValues: string[] // labels come from the dictionary, in the same order
}

const aboutContentByIdentity: Record<Identity, AboutContent> = {
  engineer: {
    images: ['/images/about/aboutImg1.jpeg', '/images/about/aboutImg2.jpeg'],
    statValues: ['07+', '26+'],
  },
  creator: {
    images: ['/images/about/aboutImg3.jpg', '/images/about/aboutImg4.jpg', '/images/about/aboutImg5.jpeg'],
    statValues: ['03+', '10+'],
  },
  adventurer: {
    images: ['/images/about/aboutImg6.JPG', '/images/about/aboutImg7.jpeg', '/images/about/aboutImg8.jpeg'],
    statValues: ['20+', '10+'],
  },
}

interface AboutSectionProps {
  identity: Identity
  direction: 'left' | 'right'
  onIdentityChange: (identity: Identity) => void
}

export default function AboutSection({ identity, direction, onIdentityChange }: AboutSectionProps) {
  const lp = useLocalePath()
  const locale = useLocale()
  const t = useT()
  const content = aboutContentByIdentity[identity]
  const text = t.about.identities[identity]
  const socialLinks = visibleSocialLinks(socialLinksByIdentity[identity])
  const slideClass = direction === 'left' ? 'slide-in-left-soft' : 'slide-in-right-soft'
  const showResume = identity === 'engineer'

  const cta =
    identity === 'engineer'
      ? { label: t.about.viewResume, href: withBasePath('/pdf/Chuyue_Zhang_Resume.pdf'), external: true }
      : identity === 'creator'
        ? { label: t.about.viewDetails, href: lp('/portfolio'), external: false }
        : { label: t.about.viewDetails, href: lp('/blog'), external: false }

  return (
    <section id="identity-card-section" className="section">
      <div className="container">
        <div className="space-y-12">
          <h2 className="section-title">{t.about.heading}</h2>
          <IdentitySwitcher currentIdentity={identity} onIdentityChange={onIdentityChange} />

          <div className={`identity-card-surface ${slideClass}`}>
            <div className="identity-card-bg-glow" aria-hidden="true" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 relative">
              <div className="lg:col-span-5 flex flex-col gap-6 text-gray-900 dark:text-gray-50">
                <div>
                  <h2 className="text-4xl font-bold mb-2 identity-gradient-text">
                    {t.identity.labels[identity]}
                  </h2>
                  <p className="text-gray-700 dark:text-slate-300 text-lg">{text.paragraph}</p>
                </div>

                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 z-10" />
                  <RotatingImage
                    images={content.images}
                    alt={text.imageAlts[0]}
                    defaultSrc={content.images[0] ?? '/images/about/aboutImg1.jpeg'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex gap-3 mt-auto">
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="identity-social-button"
                      aria-label={pick(social.label, locale)}
                    >
                      <SocialIcon id={social.id} className="text-slate-200" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-center text-gray-900 dark:text-gray-50">
                <div className="grid grid-cols-2 gap-6 mb-12">
                  {content.statValues.map((value, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-5xl font-bold text-gray-900 dark:text-white tracking-tighter">
                        {value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-slate-400 uppercase tracking-widest whitespace-pre-line">
                        {text.statLabels[index]}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full h-px bg-white/10 mb-8" />

                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="identity-dot" aria-hidden="true" />
                    {t.about.coreCompetencies}
                  </h3>

                  <SkillsAccordion identity={identity} />
                </div>

                <div className="mt-10">
                  {cta.external ? (
                    <a
                      href={cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="identity-cta"
                    >
                      {cta.label}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0-7L10 14" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10v11h11" />
                      </svg>
                    </a>
                  ) : (
                    <Link href={cta.href} className="identity-cta">
                      {cta.label}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0-7L10 14" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10v11h11" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
