import type { Locale } from './i18n/config'

// Terminators that always end a sentence; runs of them (`？！`, `……`) count as one break.
const STRONG = '。！？；…!?'
// Closing quotes and brackets stay with the sentence they end.
const CLOSERS = '”’"\'」』）)]》'
// A full stop after one of these words (or after a single letter, or inside a dotted token
// like `e.g` / `p.m`) is not the end of a sentence.
const ABBREVIATIONS = new Set(['mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'jr', 'sr', 'vs', 'etc', 'no', 'fig'])

// Longest piece handed to the speech engine at once. Chrome's network voices stop after
// about 15 seconds of one utterance, so long sentences are cut at their commas.
const MAX_LENGTH: Record<Locale, number> = { zh: 80, en: 220 }

function isAbbreviation(text: string, dot: number): boolean {
  const start = text.lastIndexOf(' ', dot - 1) + 1
  const token = text.slice(start, dot).replace(/^[("'“‘]+/, '')
  if (token.length === 0) return false
  if (token.length === 1 && /[A-Za-z]/.test(token)) return true
  if (token.includes('.')) return true
  return ABBREVIATIONS.has(token.toLowerCase())
}

function splitAtTerminators(text: string): string[] {
  const pieces: string[] = []
  let start = 0
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    let end = -1
    if (STRONG.includes(ch)) {
      end = i + 1
      while (end < text.length && STRONG.includes(text[end])) end++
    } else if (ch === '.') {
      let after = i + 1
      while (after < text.length && CLOSERS.includes(text[after])) after++
      if ((after === text.length || text[after] === ' ') && !isAbbreviation(text, i)) end = i + 1
    }
    if (end === -1) {
      i++
      continue
    }
    while (end < text.length && CLOSERS.includes(text[end])) end++
    const piece = text.slice(start, end).trim()
    if (piece) pieces.push(piece)
    start = i = end
  }
  const rest = text.slice(start).trim()
  if (rest) pieces.push(rest)
  return pieces
}

// Packs a sentence's clauses into pieces no longer than `max`; a clause that is still too
// long is cut at its last space (or anywhere, for text without spaces).
function cutLong(sentence: string, max: number): string[] {
  if (sentence.length <= max) return [sentence]
  const clauses = sentence.match(/[^，、；：,;:]*[，、；：,;:]+\s*|[^，、；：,;:]+$/g) ?? [sentence]
  const pieces: string[] = []
  let current = ''
  const flush = () => {
    if (current.trim()) pieces.push(current.trim())
    current = ''
  }
  for (const clause of clauses) {
    if ((current + clause).trim().length <= max) {
      current += clause
      continue
    }
    flush()
    let rest = clause
    while (rest.trim().length > max) {
      const space = rest.lastIndexOf(' ', max)
      const cut = space > 0 ? space : max
      pieces.push(rest.slice(0, cut).trim())
      rest = rest.slice(cut)
    }
    current = rest
  }
  flush()
  return pieces
}

export function splitSentences(text: string, lang: Locale): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return []
  return splitAtTerminators(normalized).flatMap(sentence => cutLong(sentence, MAX_LENGTH[lang]))
}

export interface QueuedSentence {
  text: string
  // Index of the block (paragraph, heading, list item) the sentence belongs to.
  block: number
}

export function buildQueue(blocks: string[], lang: Locale): QueuedSentence[] {
  return blocks.flatMap((text, block) => splitSentences(text, lang).map(sentence => ({ text: sentence, block })))
}

export function blockStart(queue: QueuedSentence[], i: number): number {
  let start = i
  while (start > 0 && queue[start - 1].block === queue[i].block) start--
  return start
}

// First sentence of the next block, or -1 when `i` is in the last one.
export function nextBlockStart(queue: QueuedSentence[], i: number): number {
  for (let j = i + 1; j < queue.length; j++) if (queue[j].block !== queue[i].block) return j
  return -1
}

// Like a music player's "previous": back to the start of the current block, or to the
// previous block when already at the start.
export function prevBlockStart(queue: QueuedSentence[], i: number): number {
  const start = blockStart(queue, i)
  if (i > start || start === 0) return start
  return blockStart(queue, start - 1)
}

export interface VoiceLike {
  name: string
  lang: string
  default?: boolean
}

// Region preference per language; `yue` (Cantonese) is a last resort for Chinese text.
const VOICE_PREFIXES: Record<Locale, string[]> = {
  zh: ['zh-cn', 'zh-hans', 'cmn', 'zh-sg', 'zh-tw', 'zh-hant', 'zh-hk', 'yue', 'zh'],
  en: ['en-us', 'en-gb', 'en'],
}

function voiceQuality(voice: VoiceLike): number {
  if (/natural|neural|online|premium|enhanced/i.test(voice.name)) return 0
  return voice.default ? 1 : 2
}

export function pickVoice<V extends VoiceLike>(voices: V[], lang: Locale): V | null {
  for (const prefix of VOICE_PREFIXES[lang]) {
    const matches = voices.filter(voice => voice.lang.replace('_', '-').toLowerCase().startsWith(prefix))
    if (matches.length > 0) return [...matches].sort((a, b) => voiceQuality(a) - voiceQuality(b))[0]
  }
  return null
}
