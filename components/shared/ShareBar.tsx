'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '@/components/shared/LocaleProvider'
import { withBasePath } from '@/lib/utils'
import { SHARE_TARGETS } from '@/lib/share-targets'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { tileIconClass, tileLabelClass } from '@/components/shared/tileStyles'

interface ShareBarProps {
  title: string
  description?: string
  url: string
  posterPath: string
  filename: string
}

const MOBILE_TRANSITION_MS = 300
const DESKTOP_TRANSITION_MS = 150

function ShareIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.68 13.34a3 3 0 100-2.68m0 2.68l6.64 3.32m-6.64-6l6.64-3.32m0 0a3 3 0 105.37-2.68 3 3 0 00-5.37 2.68zm0 8a3 3 0 105.37 2.68 3 3 0 00-5.37-2.68z"
      />
    </svg>
  )
}

function LinkIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.19 8.69a4.5 4.5 0 011.24 7.24l-4.5 4.5a4.5 4.5 0 01-6.37-6.36l1.76-1.76M10.81 15.31a4.5 4.5 0 01-1.24-7.24l4.5-4.5a4.5 4.5 0 016.37 6.36l-1.76 1.76"
      />
    </svg>
  )
}

function DownloadIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
      />
    </svg>
  )
}

function CheckIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

// One glyph per platform, kept simple/monochrome so the tile's background carries the
// styling rather than each brand's own color — see the plan's "site identity, not brand
// colors" decision.
const PLATFORM_ICONS: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  weibo: ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.31 8.17c-3.71.38-6.55 2.7-6.34 5.5.21 2.8 3.44 4.79 7.15 4.41 3.71-.37 6.55-2.7 6.34-5.5-.21-2.8-3.43-4.78-7.15-4.41zm1.2 7.28c-1.68.28-3.2-.4-3.4-1.5-.2-1.11.99-2.24 2.67-2.52 1.68-.28 3.2.4 3.4 1.5.2 1.11-.99 2.24-2.67 2.52zm-.49-1.57c-.26.34-.75.49-1.09.32-.33-.16-.4-.55-.14-.88.26-.33.72-.48 1.06-.32.34.15.42.54.17.88zm1.24-.49c-.1.16-.32.24-.48.15-.16-.08-.19-.28-.09-.44.1-.15.31-.23.47-.14.16.08.2.27.1.43zM16.5 8.36c.14-.85-.52-1.6-1.47-1.7a.44.44 0 000 .87c.44.05.72.4.66.76a.44.44 0 00.81.07zm.5-3.24c-.63-.72-1.62-1.03-2.65-.89a.55.55 0 10.16 1.09c.68-.1 1.32.11 1.68.53.36.42.44 1.02.24 1.68a.55.55 0 101.05.32c.3-.98.16-1.92-.48-2.73zM12 2C6.48 2 2 5.13 2 9c0 2.55 2.2 4.78 5.46 6-.16-.4-.26-.83-.29-1.28C4.6 12.6 3 11 3 9c0-3.31 4.03-6 9-6s9 2.69 9 6c0 .84-.28 1.63-.78 2.34a.5.5 0 00.82.57C21.62 10.9 22 9.98 22 9c0-3.87-4.48-7-10-7z" />
    </svg>
  ),
  twitter: ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  facebook: ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.494v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.796.143v3.24h-1.92c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.324-.593 1.324-1.325V1.325C24 .593 23.407 0 22.675 0z" />
    </svg>
  ),
  whatsapp: ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 004.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.06c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11a16.1 16.1 0 01-1.62-.6c-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.55-1.16-2.96 0-1.4.73-2.09.99-2.38.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.61-.07.16-.19.68-.79.86-1.06.18-.28.36-.23.61-.14.24.09 1.55.73 1.82.87.26.14.44.2.5.31.07.12.07.66-.17 1.34z" />
    </svg>
  ),
  telegram: ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.94 4.6L18.6 20.2c-.25 1.1-.9 1.37-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15 9.38-8.47c.41-.36-.09-.56-.63-.2L6.06 12.7l-5.02-1.57c-1.09-.34-1.11-1.09.23-1.61L20.57 3.1c.91-.34 1.7.2 1.37 1.5z" />
    </svg>
  ),
}

const PLATFORM_NAMES: Record<string, string> = {
  weibo: 'Weibo',
  twitter: 'X',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
}

function Tile({
  onClick,
  accent,
  label,
  children,
}: {
  onClick: () => void
  accent?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5">
      <span className={tileIconClass(accent)}>{children}</span>
      <span className={tileLabelClass}>{label}</span>
    </button>
  )
}

// Unified share entry point: Copy Link, Save Poster (preview-then-download), native Web
// Share (feature-detected, with a best-effort poster file attachment) and one-click links to
// platforms that have a web share intent. Renders as a bottom sheet on narrow screens and an
// anchored popover on wide ones (matchMedia('(min-width: 768px)'), matching Tailwind's `md`).
export default function ShareBar({ title, description, url, posterPath, filename }: ShareBarProps) {
  const t = useT()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<'mobile' | 'desktop'>('mobile')
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // navigator.share only exists on some browsers; decide after mount so the server-rendered
  // and first client-rendered HTML stay identical.
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const updateDesktopPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const panelWidth = 288 // w-72
    const left = Math.min(rect.left, window.innerWidth - panelWidth - 16)
    setPosition({ top: rect.bottom + 8, left: Math.max(left, 16) })
  }

  const openMenu = () => {
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
    setMode(isDesktop ? 'desktop' : 'mobile')
    setMounted(true)
    if (isDesktop) updateDesktopPosition()
    // Mount closed, then flip to visible on the next frame so the CSS transition runs
    // instead of the panel appearing already in its open state.
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }

  const closeMenu = () => {
    setVisible(false)
    setTimeout(() => setMounted(false), mode === 'mobile' ? MOBILE_TRANSITION_MS : DESKTOP_TRANSITION_MS)
  }

  // Keep the mode (and desktop position) correct if the viewport crosses the breakpoint, or
  // the page scrolls/resizes, while the menu is open.
  useEffect(() => {
    if (!mounted) return
    const onResize = () => {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches
      setMode(isDesktop ? 'desktop' : 'mobile')
      if (isDesktop) updateDesktopPosition()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  // Lock body scroll only for the mobile bottom sheet — the desktop popover doesn't cover
  // the page, so scrolling underneath it is fine.
  useEffect(() => {
    if (mounted && mode === 'mobile') {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [mounted, mode])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        closeMenu()
      }, 1200)
    } catch {
      window.prompt(t.share.copyLink, url)
      closeMenu()
    }
  }

  const openPosterPreview = () => {
    closeMenu()
    setPreviewOpen(true)
  }

  const systemShare = async () => {
    closeMenu()
    try {
      let files: File[] | undefined
      try {
        const res = await fetch(withBasePath(posterPath))
        const blob = await res.blob()
        const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })
        if (navigator.canShare?.({ files: [file] })) {
          files = [file]
        }
      } catch {
        // Couldn't fetch/attach the poster; fall back to a text-only share below.
      }
      await navigator.share(files ? { title, text: description, url, files } : { title, text: description, url })
    } catch {
      // User cancelled the share sheet, or the call was rejected; nothing to do.
    }
  }

  const shareToPlatform = (buildUrl: (input: { title: string; url: string }) => string) => {
    closeMenu()
    window.open(buildUrl({ title, url }), '_blank', 'noopener,noreferrer')
  }

  const panel = mounted && typeof document !== 'undefined' && (
    mode === 'mobile' ? (
      createPortal(
        <div
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        >
          <div
            className={`absolute bottom-0 inset-x-0 rounded-t-2xl bg-white dark:bg-gray-900 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-out ${
              visible ? 'translate-y-0' : 'translate-y-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto mb-5" />
            <div className="grid grid-cols-4 gap-4">
              <ShareOptions
                t={t}
                canShare={canShare}
                copied={copied}
                onCopyLink={copyLink}
                onSavePoster={openPosterPreview}
                onSystemShare={systemShare}
                onPlatform={shareToPlatform}
              />
            </div>
          </div>
        </div>,
        document.body
      )
    ) : (
      createPortal(
        <>
          {/* Transparent click-catcher: closes the popover on outside click without a
              visible backdrop over the page. */}
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div
            className={`fixed z-50 w-72 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-4 transition-all duration-150 ease-out ${
              visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ top: position?.top ?? 0, left: position?.left ?? 0 }}
          >
            <div className="grid grid-cols-3 gap-3">
              <ShareOptions
                t={t}
                canShare={canShare}
                copied={copied}
                onCopyLink={copyLink}
                onSavePoster={openPosterPreview}
                onSystemShare={systemShare}
                onPlatform={shareToPlatform}
              />
            </div>
          </div>
        </>,
        document.body
      )
    )
  )

  // No wrapping block/margin here — this renders as one tile inside the caller's link+share
  // row (see the portfolio/blog detail pages), matching LinkTile's shape exactly.
  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={openMenu}
        aria-haspopup="true"
        aria-expanded={mounted}
        className="flex flex-col items-center gap-1.5"
      >
        <span className={tileIconClass(false)}>
          <ShareIcon className="w-6 h-6" />
        </span>
        <span className={tileLabelClass}>{t.share.shareButton}</span>
      </button>
      {panel}
      <ImageLightbox
        images={[posterPath]}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        alt={title}
        downloadHref={withBasePath(posterPath)}
        downloadFilename={filename}
      />
    </>
  )
}

function ShareOptions({
  t,
  canShare,
  copied,
  onCopyLink,
  onSavePoster,
  onSystemShare,
  onPlatform,
}: {
  t: ReturnType<typeof useT>
  canShare: boolean
  copied: boolean
  onCopyLink: () => void
  onSavePoster: () => void
  onSystemShare: () => void
  onPlatform: (buildUrl: (input: { title: string; url: string }) => string) => void
}) {
  return (
    <>
      <Tile onClick={onSavePoster} accent label={t.share.savePoster}>
        <DownloadIcon />
      </Tile>
      <Tile onClick={onCopyLink} accent label={copied ? t.share.copied : t.share.copyLink}>
        {copied ? <CheckIcon /> : <LinkIcon />}
      </Tile>
      {canShare && (
        <Tile onClick={onSystemShare} label={t.share.shareButton}>
          <ShareIcon className="w-6 h-6" />
        </Tile>
      )}
      {SHARE_TARGETS.map(target => {
        const Icon = PLATFORM_ICONS[target.id]
        return (
          <Tile key={target.id} onClick={() => onPlatform(target.buildUrl)} label={PLATFORM_NAMES[target.id]}>
            <Icon />
          </Tile>
        )
      })}
    </>
  )
}
