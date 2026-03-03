'use client'

import IdentitySwitcher from '@/components/shared/IdentitySwitcher'
import { Identity } from '@/lib/identity'
import { withBasePath } from '@/lib/utils'
import Link from 'next/link'
import { SkillsAccordion } from '@/components/sections/SkillsSection'
import RotatingImage from '@/components/shared/RotatingImage'

interface AboutImage {
  src: string
  alt: string
}

interface AboutStat {
  value: string
  label: string
}

interface AboutContent {
  images: AboutImage[]
  paragraphs: string[]
  stats: AboutStat[]
}

interface SocialLink {
  href: string
  icon: 'github' | 'linkedin' | 'twitter' | 'zhihu' | 'bilibili' | 'pixiv' | 'instagram'
  label: string
}

const aboutContentByIdentity: Record<Identity, AboutContent> = {
  engineer: {
    images: [
      { src: '/images/about/aboutImg1.jpeg', alt: 'Engineer ring ceremony' },
      { src: '/images/about/aboutImg2.jpeg', alt: 'Graduation photo' },
    ],
    paragraphs: [
      'As a software engineer, I build reliable, high-performance systems with experience across databases, distributed systems, and backend infrastructure.'
    ],
    stats: [
      { value: '07+', label: 'Years\nin software' },
      { value: '26+', label: 'Shipped\nprojects' },
    ],
  },
  creator: {
    images: [
      { src: '/images/about/aboutImg3.jpg', alt: 'Photographer' },
      { src: '/images/about/aboutImg4.jpeg', alt: 'Visual artist' },
    ],
    paragraphs: [
      'As a creator, I explore games, photography, writing, illustration, and music as different ways of telling stories and shaping experiences.'
    ],
    stats: [
      { value: '03+', label: 'Years in\nindie creation' },
      { value: '10+', label: 'Game & art\nexperiments' },
    ],
  },
  adventurer: {
    images: [
      { src: '/images/about/aboutImg5.jpeg', alt: 'Explore the beauty of nature' },
      { src: '/images/about/aboutImg6.jpeg', alt: 'Skiing' },
      { src: '/images/about/aboutImg7.jpeg', alt: 'Feeding the birds' },
    ],
    paragraphs: [
      'As an adventurer, I seek out new places, sports, and conversations that push me out of my comfort zone and widen my perspective.'
    ],
    stats: [
      { value: '20+', label: 'Cities\nvisited' },
      { value: '10+', label: 'Sports &\nactivities' },
    ],
  },
}

const socialLinksByIdentity: Record<Identity, SocialLink[]> = {
  engineer: [
    { href: 'https://github.com/IronDumpling', icon: 'github', label: 'GitHub' },
    { href: 'https://www.linkedin.com/in/chuyuez/', icon: 'linkedin', label: 'LinkedIn' },
  ],
  creator: [
    { href: 'https://space.bilibili.com/26023645', icon: 'bilibili', label: 'Bilibili' },
    { href: 'https://www.zhihu.com/people/zhang-chu-yue-13-47', icon: 'zhihu', label: 'Zhihu' },
    { href: 'https://www.pixiv.net/users/56079335', icon: 'pixiv', label: 'Pixiv' },
  ],
  adventurer: [
    { href: 'https://www.instagram.com/chuyue_charlie', icon: 'instagram', label: 'Instagram' },
    { href: 'https://twitter.com/Irondump1ing', icon: 'twitter', label: 'Twitter' },
  ],
}

function SocialIcon({ icon }: { icon: SocialLink['icon'] }) {
  if (icon === 'github') {
    return (
      <svg className="w-6 h-6 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234C5.662 21.38 4.967 19.238 4.967 19.238c-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.729.082-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604C7.14 16.902 4.337 15.873 4.337 11.276c0-1.311.469-2.381 1.238-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.002 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.652.241 2.873.118 3.176.77.84 1.236 1.91 1.236 3.221 0 4.609-2.807 5.624-5.48 5.921.43.372.824 1.102.824 2.222v3.293c0 .319.192.694.8.576C20.563 21.8 24 17.302 24 12 24 5.373 18.627 0 12 0Z" />
      </svg>
    )
  }

  if (icon === 'twitter') {
    return (
      <svg className="w-6 h-6 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7.48v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3Z" />
      </svg>
    )
  }

  if (icon === 'linkedin') {
    return (
      <svg className="w-6 h-6 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.047c.476-.9 1.636-1.85 3.369-1.85 3.602 0 4.268 2.37 4.268 5.455v6.286ZM5.337 7.433A2.063 2.063 0 1 1 5.338 3.305a2.063 2.063 0 0 1-.001 4.128ZM6.782 20.452H3.89V9h2.892v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z" />
      </svg>
    )
  }

  if (icon === 'zhihu') {
    return (
      <img
        src={withBasePath('/images/logo/zhihu.svg')}
        alt="Zhihu"
        className="w-6 h-6 dark:invert"
      />
    )
  }

  if (icon === 'bilibili') {
    return (
      <img
        src={withBasePath('/images/logo/bilibili.svg')}
        alt="Bilibili"
        className="w-6 h-6 dark:invert"
      />
    )
  }

  if (icon === 'pixiv') {
    return (
      <img
        src={withBasePath('/images/logo/pixiv.svg')}
        alt="Pixiv"
        className="w-6 h-6 dark:invert"
      />
    )
  }

  // Instagram
  return (
    <img
      src={withBasePath('/images/logo/instagram.svg')}
      alt="Instagram"
      className="w-6 h-6 dark:invert"
    />
  )
}

interface AboutSectionProps {
  identity: Identity
  direction: 'left' | 'right'
  onIdentityChange: (identity: Identity) => void
}

export default function AboutSection({ identity, direction, onIdentityChange }: AboutSectionProps) {
  const content = aboutContentByIdentity[identity]
  const socialLinks = socialLinksByIdentity[identity]
  const slideClass = direction === 'left' ? 'slide-in-left-soft' : 'slide-in-right-soft'
  const showResume = identity === 'engineer'

  const cta =
    identity === 'engineer'
      ? { label: 'View Resume', href: withBasePath('/pdf/Chuyue_Zhang_Resume.pdf'), external: true }
      : identity === 'creator'
        ? { label: 'View Details', href: '/portfolio', external: false }
        : { label: 'View Details', href: '/blog', external: false }

  return (
    <section id="identity-card-section" className="section">
      <div className="container">
        <div className="space-y-12">
          <h2 className="section-title">I am...</h2>
          <IdentitySwitcher currentIdentity={identity} onIdentityChange={onIdentityChange} />

          <div className={`identity-card-surface ${slideClass}`}>
            <div className="identity-card-bg-glow" aria-hidden="true" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 relative">
              <div className="lg:col-span-5 flex flex-col gap-6 text-gray-900 dark:text-gray-50">
                <div>
                  <h2 className="text-4xl font-bold mb-2 identity-gradient-text">
                    {identity === 'engineer' ? 'Software Engineer' : identity === 'creator' ? 'Creator' : 'Adventurer'}
                  </h2>
                  <p className="text-gray-700 dark:text-slate-300 text-lg">{content.paragraphs[0]}</p>
                </div>

                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 z-10" />
                  <RotatingImage
                    images={content.images.map((image) => image.src)}
                    alt={content.images[0]?.alt ?? 'Identity image'}
                    defaultSrc={content.images[0]?.src ?? '/images/about/aboutImg1.jpeg'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex gap-3 mt-auto">
                  {socialLinks.map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="identity-social-button"
                      aria-label={social.label}
                    >
                      <SocialIcon icon={social.icon} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-center text-gray-900 dark:text-gray-50">
                <div className="grid grid-cols-2 gap-6 mb-12">
                  {content.stats.map((stat, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-5xl font-bold text-gray-900 dark:text-white tracking-tighter">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-slate-400 uppercase tracking-widest whitespace-pre-line">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full h-px bg-white/10 mb-8" />

                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="identity-dot" aria-hidden="true" />
                    Core Competencies
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
