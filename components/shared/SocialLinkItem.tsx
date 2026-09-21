'use client'

import { useState, type ReactNode } from 'react'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { useLocale } from '@/components/shared/LocaleProvider'
import { pick } from '@/lib/i18n/localized'
import { socialLinkAction, type SocialLink } from '@/lib/social-links'

// One social button. A link with an address opens it in a new tab; a link with only a
// QR code image (WeChat) opens that image in a lightbox; a link with neither is just the
// icon, and clicking it does nothing.
export default function SocialLinkItem({
  link,
  className,
  children,
}: {
  link: SocialLink
  className?: string
  children: ReactNode
}) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const label = pick(link.label, locale)

  const action = socialLinkAction(link)

  if (action === 'none') {
    return (
      <span className={className} aria-label={label} role="img">
        {children}
      </span>
    )
  }

  if (action === 'link') {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className} aria-label={label}>
        {children}
      </a>
    )
  }

  return (
    <>
      <button type="button" className={className} aria-label={label} onClick={() => setOpen(true)}>
        {children}
      </button>
      <ImageLightbox images={[link.qr!]} isOpen={open} onClose={() => setOpen(false)} alt={label} />
    </>
  )
}
