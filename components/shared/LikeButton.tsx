'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/components/shared/LocaleProvider'
import { tileIconClass, tileLabelClass } from '@/components/shared/tileStyles'

// Optional: the counter lives in a separate Cloudflare Worker (workers/likes). With no API
// set at build time, or when the Worker can't be reached, the button is simply not shown.
const API = process.env.NEXT_PUBLIC_LIKES_API

function storageKey(id: string): string {
  return `liked:${id}`
}

function readLiked(id: string): boolean {
  try {
    return window.localStorage.getItem(storageKey(id)) === '1'
  } catch {
    return false
  }
}

function writeLiked(id: string) {
  try {
    window.localStorage.setItem(storageKey(id), '1')
  } catch {
    // Private mode or blocked storage: the server still counts one like per day.
  }
}

function HeartIcon({ filled, className = 'w-6 h-6' }: { filled: boolean; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )
}

export default function LikeButton({ id }: { id: string }) {
  const t = useT()
  const [count, setCount] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (!API) return
    setLiked(readLiked(id))
    let cancelled = false
    fetch(`${API}/likes?id=${encodeURIComponent(id)}`)
      .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((body: { n: number }) => {
        if (!cancelled) setCount(body.n)
      })
      .catch(() => {
        // Counter unavailable: stay hidden rather than show a broken button.
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!API || count === null) return null

  const onClick = async () => {
    if (liked) return
    setLiked(true)
    setCount(n => (n ?? 0) + 1)
    writeLiked(id)
    try {
      const res = await fetch(`${API}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) setCount(((await res.json()) as { n: number }).n)
    } catch {
      // Keep the optimistic count; the next page load shows the real one.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      aria-label={liked ? t.like.liked : t.like.label}
      className="flex flex-col items-center gap-1.5"
    >
      <span className={tileIconClass(liked)}>
        <HeartIcon filled={liked} />
      </span>
      <span className={tileLabelClass}>{count > 0 ? count : t.like.label}</span>
    </button>
  )
}
