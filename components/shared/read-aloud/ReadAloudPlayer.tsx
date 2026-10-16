'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '@/components/shared/LocaleProvider'
import { ListIcon } from '@/components/shared/toc/TocSidebar'
import { useReadAloud } from './context'
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  RotateCcwIcon,
  SkipBackIcon,
  SkipForwardIcon,
  XIcon,
} from './icons'

const control =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'

function Control({
  label,
  onClick,
  disabled,
  className = '',
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`${control} ${className}`}>
      {children}
    </button>
  )
}

// The player docked at the bottom while reading: a full-width bar on phones, a floating card
// as wide as the article from md up. It publishes its height as `--dock-h` so the page (body
// padding, the wide table of contents) can keep clear of it, and on tablets it moves right
// together with the article while the table-of-contents sidebar is open (`.read-aloud-dock`).
export default function ReadAloudPlayer() {
  const reader = useReadAloud()
  const t = useT().readAloud
  const dockRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)
  const wasPlaying = useRef(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const active = !!reader?.active
  useEffect(() => {
    const dock = dockRef.current
    if (!active || !dock) return
    const root = document.documentElement
    // Height plus the gap below it; offsetHeight, unlike getBoundingClientRect, ignores the
    // slide-in transform.
    const update = () =>
      root.style.setProperty('--dock-h', `${dock.offsetHeight + (parseFloat(getComputedStyle(dock).bottom) || 0)}px`)
    const observer = new ResizeObserver(update)
    observer.observe(dock)
    window.addEventListener('resize', update)
    update()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      root.style.removeProperty('--dock-h')
    }
  }, [active, mounted])

  // The native `change` event fires once the thumb is let go (mouse, touch or keyboard);
  // React's onChange fires on every move and only previews.
  const seek = reader?.seek
  useEffect(() => {
    const range = rangeRef.current
    if (!range || !seek) return
    const commit = () => {
      if (wasPlaying.current) seek(Number(range.value), { autoplay: true, scroll: 'none' })
      wasPlaying.current = false
    }
    range.addEventListener('change', commit)
    return () => range.removeEventListener('change', commit)
  }, [seek, active, mounted])

  if (!reader || !reader.active || !mounted) return null

  const { status, index, total, chapter, rate, hasToc } = reader
  const playing = status === 'playing'
  const ended = status === 'ended'
  const max = Math.max(0, total - 1)
  const percent = max > 0 ? (index / max) * 100 : 0
  const beginScrub = () => {
    if (status === 'playing') wasPlaying.current = true
  }
  const mainLabel = playing ? t.pause : ended ? t.replay : t.play

  return createPortal(
    <div ref={dockRef} className="read-aloud-dock fixed inset-x-0 bottom-0 z-40 motion-safe:animate-drawer-in md:bottom-4">
      <div
        className="flex flex-col border-t border-gray-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 md:mx-auto md:w-[calc(100%-2rem)] md:max-w-[52rem] md:rounded-2xl md:border md:shadow-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Progress: along the top edge on phones, under the controls on wider screens. */}
        <div className="order-1 md:order-2 md:px-5 md:pb-3">
          <input
            ref={rangeRef}
            type="range"
            min={0}
            max={max}
            step={1}
            value={Math.min(index, max)}
            aria-label={t.progress}
            aria-valuetext={`${index + 1} / ${total}`}
            onPointerDown={beginScrub}
            onKeyDown={beginScrub}
            onChange={event => reader.seek(Number(event.target.value), { autoplay: false, scroll: 'force' })}
            className="read-aloud-range block w-full"
            style={{ '--pct': `${percent}%` } as React.CSSProperties}
          />
        </div>

        <div className="order-2 flex items-center gap-1 px-3 pb-2 pt-1 md:order-1 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4 md:px-5 md:pb-1 md:pt-3">
          {/* What is being read */}
          <div className="min-w-0 flex-1 pr-1">
            <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{reader.title}</div>
            <div className="truncate text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {chapter ? `${chapter} · ` : ''}
              {index + 1} / {total}
            </div>
          </div>

          {/* Transport */}
          <div className="flex items-center gap-0.5 md:gap-1">
            <Control label={t.prevParagraph} onClick={reader.prevParagraph} disabled={index === 0} className="hidden md:flex">
              <SkipBackIcon className="h-4 w-4" />
            </Control>
            <Control label={t.prevSentence} onClick={reader.prevSentence} disabled={index === 0}>
              <RewindIcon className="h-4 w-4" />
            </Control>
            <button
              type="button"
              onClick={ended ? reader.restart : reader.toggle}
              aria-label={mainLabel}
              title={mainLabel}
              className="mx-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition-[background-color,transform] duration-200 hover:bg-primary-700 active:scale-95 dark:bg-primary-500 dark:hover:bg-primary-400"
            >
              {playing ? (
                <PauseIcon className="h-5 w-5" />
              ) : ended ? (
                <RotateCcwIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="ml-0.5 h-5 w-5" />
              )}
            </button>
            <Control label={t.nextSentence} onClick={reader.nextSentence} disabled={index >= max}>
              <FastForwardIcon className="h-4 w-4" />
            </Control>
            <Control label={t.nextParagraph} onClick={reader.nextParagraph} disabled={index >= max} className="hidden md:flex">
              <SkipForwardIcon className="h-4 w-4" />
            </Control>
          </div>

          {/* Secondary */}
          <div className="flex items-center justify-end gap-0.5 md:gap-1">
            <Control label={t.restart} onClick={reader.restart} className="hidden md:flex">
              <RotateCcwIcon className="h-4 w-4" />
            </Control>
            <button
              type="button"
              onClick={reader.cycleRate}
              aria-label={`${t.speed}: ${rate}×`}
              title={t.speed}
              className={`${control} hidden w-12 text-xs font-semibold tabular-nums md:flex`}
            >
              {rate}×
            </button>
            {hasToc && (
              <Control label={t.toc} onClick={() => reader.setTocOpen(open => !open)} className="xl:hidden">
                <ListIcon className="h-5 w-5" />
              </Control>
            )}
            <Control label={t.close} onClick={reader.close}>
              <XIcon className="h-4 w-4" />
            </Control>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
