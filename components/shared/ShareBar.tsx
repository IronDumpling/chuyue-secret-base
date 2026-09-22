'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/components/shared/LocaleProvider'
import { withBasePath } from '@/lib/utils'

interface ShareBarProps {
  title: string
  description?: string
  url: string
  posterPath: string
  filename: string
}

const buttonClass = 'button-secondary inline-flex items-center gap-2 text-sm'

function LinkIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.19 8.69a4.5 4.5 0 011.24 7.24l-4.5 4.5a4.5 4.5 0 01-6.37-6.36l1.76-1.76M10.81 15.31a4.5 4.5 0 01-1.24-7.24l4.5-4.5a4.5 4.5 0 016.37 6.36l-1.76 1.76"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
      />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.68 13.34a3 3 0 100-2.68m0 2.68l6.64 3.32m-6.64-6l6.64-3.32m0 0a3 3 0 105.37-2.68 3 3 0 00-5.37 2.68zm0 8a3 3 0 105.37 2.68 3 3 0 00-5.37-2.68z"
      />
    </svg>
  )
}

// Copy Link, Save Poster (a pre-generated static jpg — no client-side rendering) and
// native Web Share (feature-detected; not every browser has it, mainly desktop).
export default function ShareBar({ title, description, url, posterPath, filename }: ShareBarProps) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  // navigator.share only exists on some browsers; decide after mount so the server-rendered
  // and first client-rendered HTML stay identical.
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t.share.copyLink, url)
    }
  }

  const systemShare = async () => {
    try {
      await navigator.share({ title, text: description, url })
    } catch {
      // user cancelled the share sheet, or the call was rejected; nothing to do
    }
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8" aria-label={t.share.shareButton}>
      <button type="button" onClick={copyLink} className={buttonClass}>
        <LinkIcon />
        {copied ? t.share.copied : t.share.copyLink}
      </button>
      {/* Same-origin static asset, so `download` works on desktop and Android. iOS Safari
          ignores the download attribute and opens the image in a new tab instead, where a
          long press saves it — that's why this also opens in a new tab everywhere. */}
      <a
        href={withBasePath(posterPath)}
        download={filename}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <DownloadIcon />
        {t.share.savePoster}
      </a>
      {canShare && (
        <button type="button" onClick={systemShare} className={buttonClass}>
          <ShareIcon />
          {t.share.shareButton}
        </button>
      )}
    </div>
  )
}
