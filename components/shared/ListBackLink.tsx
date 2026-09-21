'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { rememberedListHref } from '@/components/shared/filter/useUrlSelection'

interface ListBackLinkProps {
  href: string
  className?: string
  children: ReactNode
}

// The "Back to Blog / Portfolio" link of a post. It goes to the list with the filter the
// visitor had chosen there. The exported page links to the plain list; the remembered filter
// is added after mount, so the HTML stays the same for everyone.
export default function ListBackLink({ href, className, children }: ListBackLinkProps) {
  const [target, setTarget] = useState(href)
  useEffect(() => setTarget(rememberedListHref(href)), [href])
  return (
    <Link href={target} className={className}>
      {children}
    </Link>
  )
}
