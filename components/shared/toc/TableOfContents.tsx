'use client'

import { useMemo } from 'react'
import type { TocHeading } from '@/lib/rehype-collect-headings'
import { buildTocTree, TOC_MIN_HEADINGS } from '@/lib/toc'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'
import { useActiveHeading } from './useActiveHeading'
import TocSidebar from './TocSidebar'
import TocFloating from './TocFloating'

interface TableOfContentsProps {
  headings: TocHeading[]
  labels: Dictionary['toc']
  // 'sidebar' sits in the left gutter on wide screens; 'floating' is the corner button below.
  variant: 'sidebar' | 'floating'
}

export default function TableOfContents({ headings, labels, variant }: TableOfContentsProps) {
  const tree = useMemo(() => buildTocTree(headings), [headings])
  const ids = useMemo(() => headings.map(h => h.id), [headings])
  const { activeId, jumpTo } = useActiveHeading(ids)

  if (headings.length < TOC_MIN_HEADINGS) return null

  const Variant = variant === 'sidebar' ? TocSidebar : TocFloating
  return <Variant tree={tree} activeId={activeId} onNavigate={jumpTo} labels={labels} />
}
