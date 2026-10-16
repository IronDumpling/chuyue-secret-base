'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { buildQueue, nextBlockStart, pickVoice, prevBlockStart, type QueuedSentence } from '@/lib/read-aloud'
import { prefersReducedMotion } from '@/components/shared/toc/useActiveHeading'
import { extractBlocks, type ReadBlock } from './extract'
import ReadAloudPlayer from './ReadAloudPlayer'
import { ReadAloudContext, type ReadAloudValue, type ReadStatus, type ScrollMode } from './context'

const RATES = [1, 1.25, 1.5, 2]
// After the reader scrolls by hand, leave the page alone for this long.
const MANUAL_SCROLL_HOLD_MS = 4000
const VOICE_WAIT_MS = 2000
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

interface ReadAloudProviderProps {
  // The language the text is written in (not the page's UI language).
  lang: Locale
  title: string
  hasToc: boolean
  children: ReactNode
}

export default function ReadAloudProvider({ lang, title, hasToc, children }: ReadAloudProviderProps) {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState<ReadStatus>('idle')
  const [index, setIndex] = useState(0)
  const [total, setTotal] = useState(0)
  const [rate, setRate] = useState(1)
  const [tocOpen, setTocOpen] = useState(false)

  const voice = useRef<SpeechSynthesisVoice | null>(null)
  const blocks = useRef<ReadBlock[]>([])
  const queue = useRef<QueuedSentence[]>([])
  // Callbacks read these, not the state, so a sentence ending never sees stale values.
  const indexRef = useRef(0)
  const statusRef = useRef<ReadStatus>('idle')
  const rateRef = useRef(1)
  // Bumped on every cancel; an utterance whose token is old ignores its own end event.
  const token = useRef(0)
  // Kept so Chrome does not garbage-collect the utterance before it ends.
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const scrollMode = useRef<ScrollMode>('follow')
  const holdUntil = useRef(0)
  const lastBlock = useRef(-1)
  const highlighted = useRef<HTMLElement | null>(null)

  const updateStatus = (next: ReadStatus) => {
    statusRef.current = next
    setStatus(next)
  }
  const moveTo = (i: number, mode: ScrollMode) => {
    scrollMode.current = mode
    indexRef.current = i
    setIndex(i)
  }

  // Voices load asynchronously in most browsers; give up after a short wait.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false)
      return
    }
    const synth = window.speechSynthesis
    let settled = false
    const choose = (final: boolean) => {
      if (settled) return
      const picked = pickVoice(synth.getVoices(), lang)
      if (picked || final) {
        settled = true
        voice.current = picked
        setSupported(picked !== null)
      }
    }
    const onVoicesChanged = () => choose(false)
    choose(false)
    synth.addEventListener('voiceschanged', onVoicesChanged)
    const timer = window.setTimeout(() => choose(true), VOICE_WAIT_MS)
    return () => {
      settled = true
      window.clearTimeout(timer)
      synth.removeEventListener('voiceschanged', onVoicesChanged)
      token.current++
      synth.cancel()
    }
  }, [lang])

  const stopSpeech = () => {
    token.current++
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  const speakFrom = useCallback((i: number, mode: ScrollMode = 'follow') => {
    stopSpeech()
    const synth = window.speechSynthesis
    if (i >= queue.current.length) {
      updateStatus('ended')
      return
    }
    const mine = token.current
    const sentence = new SpeechSynthesisUtterance(queue.current[i].text)
    if (voice.current) {
      sentence.voice = voice.current
      sentence.lang = voice.current.lang
    } else {
      sentence.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    }
    sentence.rate = rateRef.current
    sentence.onend = () => {
      if (token.current === mine) speakFrom(i + 1)
    }
    sentence.onerror = event => {
      if (token.current !== mine || event.error === 'interrupted' || event.error === 'canceled') return
      updateStatus('paused')
    }
    utterance.current = sentence
    moveTo(i, mode)
    updateStatus('playing')
    synth.speak(sentence)
  }, [lang])

  const start = useCallback(() => {
    if (supported === false) return
    blocks.current = extractBlocks()
    queue.current = buildQueue(blocks.current.map(b => b.text), lang)
    setTotal(queue.current.length)
    if (queue.current.length === 0) return
    lastBlock.current = -1
    setActive(true)
    const from = statusRef.current === 'ended' || indexRef.current >= queue.current.length ? 0 : indexRef.current
    speakFrom(from)
  }, [supported, lang, speakFrom])

  const play = useCallback(() => {
    if (!active) return start()
    speakFrom(statusRef.current === 'ended' ? 0 : indexRef.current)
  }, [active, start, speakFrom])

  const pause = useCallback(() => {
    stopSpeech()
    if (statusRef.current === 'playing') updateStatus('paused')
  }, [])

  const toggle = useCallback(() => {
    if (statusRef.current === 'playing') pause()
    else play()
  }, [pause, play])

  const seek = useCallback(
    (i: number, { autoplay, scroll = 'follow' }: { autoplay?: boolean; scroll?: ScrollMode } = {}) => {
      if (queue.current.length === 0) return
      const target = Math.max(0, Math.min(queue.current.length - 1, i))
      const keepPlaying = autoplay ?? statusRef.current === 'playing'
      if (keepPlaying) return speakFrom(target, scroll)
      stopSpeech()
      moveTo(target, scroll)
      updateStatus('paused')
    },
    [speakFrom]
  )

  const seekToId = useCallback(
    (id: string) => {
      if (!active) return
      const block = blocks.current.findIndex(b => b.el.id === id)
      if (block === -1) return
      const i = queue.current.findIndex(s => s.block === block)
      if (i !== -1) seek(i, { scroll: 'none' })
    },
    [active, seek]
  )

  const prevSentence = useCallback(() => seek(indexRef.current - 1), [seek])
  const nextSentence = useCallback(() => {
    if (indexRef.current >= queue.current.length - 1) return
    seek(indexRef.current + 1)
  }, [seek])
  const prevParagraph = useCallback(() => seek(prevBlockStart(queue.current, indexRef.current)), [seek])
  const nextParagraph = useCallback(() => {
    const next = nextBlockStart(queue.current, indexRef.current)
    if (next !== -1) seek(next)
  }, [seek])
  const restart = useCallback(() => {
    lastBlock.current = -1
    seek(0, { autoplay: true })
  }, [seek])

  const cycleRate = useCallback(() => {
    const next = RATES[(RATES.indexOf(rateRef.current) + 1) % RATES.length]
    rateRef.current = next
    setRate(next)
    // The new speed applies from the next utterance; restart the current one with it.
    if (statusRef.current === 'playing') speakFrom(indexRef.current, 'none')
  }, [speakFrom])

  const close = useCallback(() => {
    stopSpeech()
    setActive(false)
    updateStatus('idle')
    moveTo(0, 'none')
  }, [])

  const holdScroll = useCallback((ms: number) => {
    holdUntil.current = Math.max(holdUntil.current, performance.now() + ms)
  }, [])

  // A reader scrolling by hand takes over the page for a few seconds.
  useEffect(() => {
    if (!active) return
    const hold = () => holdScroll(MANUAL_SCROLL_HOLD_MS)
    const onKey = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key) && !(event.target instanceof HTMLInputElement)) hold()
    }
    window.addEventListener('wheel', hold, { passive: true })
    window.addEventListener('touchmove', hold, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', hold)
      window.removeEventListener('touchmove', hold)
      window.removeEventListener('keydown', onKey)
    }
  }, [active, holdScroll])

  // Highlight the block being read and bring it near the top of the screen.
  useEffect(() => {
    const clear = () => {
      highlighted.current?.removeAttribute('data-reading')
      highlighted.current = null
    }
    if (!active || status === 'ended') {
      clear()
      lastBlock.current = -1
      return
    }
    const sentence = queue.current[index]
    const block = sentence && blocks.current[sentence.block]
    if (!block) return
    if (highlighted.current !== block.el) {
      clear()
      block.el.setAttribute('data-reading', '')
      highlighted.current = block.el
    }
    const mode = scrollMode.current
    scrollMode.current = 'follow'
    const changed = sentence.block !== lastBlock.current
    lastBlock.current = sentence.block
    const shouldScroll = mode === 'force' || (mode === 'follow' && changed && performance.now() >= holdUntil.current)
    if (shouldScroll) {
      // 'instant', not 'auto': `auto` would follow the global `scroll-behavior: smooth`.
      block.el.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' })
    }
  }, [active, status, index])

  useEffect(() => {
    return () => highlighted.current?.removeAttribute('data-reading')
  }, [])

  const chapter = useMemo(() => {
    const sentence = queue.current[index]
    if (!active || !sentence) return null
    for (let b = sentence.block; b >= 0; b--) {
      const heading = blocks.current[b]?.heading
      if (heading) return heading
    }
    return null
  }, [active, index])

  const value: ReadAloudValue = {
    title,
    supported,
    active,
    status,
    index,
    total,
    chapter,
    rate,
    hasToc,
    tocOpen,
    setTocOpen,
    start,
    play,
    pause,
    toggle,
    seek,
    seekToId,
    prevSentence,
    nextSentence,
    prevParagraph,
    nextParagraph,
    restart,
    cycleRate,
    close,
    holdScroll,
  }

  return (
    <ReadAloudContext.Provider value={value}>
      {children}
      <ReadAloudPlayer />
    </ReadAloudContext.Provider>
  )
}
