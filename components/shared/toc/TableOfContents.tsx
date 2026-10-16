'use client'

import { useCallback, useMemo } from 'react'
import type { TocHeading } from '@/lib/rehype-collect-headings'
import { buildTocTree, TOC_MIN_HEADINGS } from '@/lib/toc'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'
import { useReadAloud } from '@/components/shared/read-aloud/context'
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
  const seekToId = useReadAloud()?.seekToId

  // While reading aloud, a jump in the contents also moves the reading position there.
  const navigate = useCallback(
    (id: string) => {
      jumpTo(id)
      seekToId?.(id)
    },
    [jumpTo, seekToId]
  )

  const hasToc = headings.length >= TOC_MIN_HEADINGS
  if (variant === 'sidebar') {
    return hasToc ? <TocSidebar tree={tree} activeId={activeId} onNavigate={navigate} labels={labels} /> : null
  }
  // The corner button stays on short pages too, as the way to start reading aloud.
  return <TocFloating tree={hasToc ? tree : []} activeId={activeId} onNavigate={navigate} labels={labels} />
}
