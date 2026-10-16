'use client'

import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'

export type ReadStatus = 'idle' | 'playing' | 'paused' | 'ended'

// How a position change moves the page: 'follow' scrolls when the block changes (unless the
// reader scrolled by hand a moment ago), 'force' always does (dragging the progress bar),
// 'none' never does (a table-of-contents jump, which scrolls by itself).
export type ScrollMode = 'follow' | 'force' | 'none'

export interface ReadAloudValue {
  title: string
  // null while the voice list is still loading.
  supported: boolean | null
  active: boolean
  status: ReadStatus
  index: number
  total: number
  chapter: string | null
  rate: number
  hasToc: boolean
  tocOpen: boolean
  setTocOpen: Dispatch<SetStateAction<boolean>>
  start: () => void
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (index: number, options?: { autoplay?: boolean; scroll?: ScrollMode }) => void
  seekToId: (id: string) => void
  prevSentence: () => void
  nextSentence: () => void
  prevParagraph: () => void
  nextParagraph: () => void
  restart: () => void
  cycleRate: () => void
  close: () => void
  // Hold off following the reading position for a while (the article reflowing on tablets).
  holdScroll: (ms: number) => void
}

export const ReadAloudContext = createContext<ReadAloudValue | null>(null)

// Optional on purpose: the table of contents also works on pages without read-aloud.
export function useReadAloud(): ReadAloudValue | null {
  return useContext(ReadAloudContext)
}
