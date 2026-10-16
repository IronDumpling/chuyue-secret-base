import { describe, it, expect } from 'vitest'
import {
  splitSentences,
  buildQueue,
  blockStart,
  nextBlockStart,
  prevBlockStart,
  pickVoice,
  type VoiceLike,
} from './read-aloud'

describe('splitSentences', () => {
  it('splits Chinese on full-width terminators', () => {
    expect(splitSentences('今天下雨了。我没带伞！怎么办？', 'zh')).toEqual(['今天下雨了。', '我没带伞！', '怎么办？'])
  })

  it('keeps closing quotes and brackets with the sentence they end', () => {
    expect(splitSentences('他说：“走吧。”她没回答。', 'zh')).toEqual(['他说：“走吧。”', '她没回答。'])
    expect(splitSentences('「好。」然后呢', 'zh')).toEqual(['「好。」', '然后呢'])
  })

  it('treats a run of ellipses or terminators as one break', () => {
    expect(splitSentences('等等……你说什么？！不可能', 'zh')).toEqual(['等等……', '你说什么？！', '不可能'])
  })

  it('splits English on . ! ? followed by a space', () => {
    expect(splitSentences('It rained. I had no umbrella! What now?', 'en')).toEqual([
      'It rained.',
      'I had no umbrella!',
      'What now?',
    ])
  })

  it('does not split after common abbreviations, initials or inside numbers', () => {
    expect(splitSentences('Mr. Smith met Dr. Lee, e.g. at 3.5 p.m. on Friday. Then he left.', 'en')).toEqual([
      'Mr. Smith met Dr. Lee, e.g. at 3.5 p.m. on Friday.',
      'Then he left.',
    ])
    expect(splitSentences('J. K. Rowling wrote it. Done.', 'en')).toEqual(['J. K. Rowling wrote it.', 'Done.'])
  })

  it('handles English sentences inside Chinese text and the reverse', () => {
    expect(splitSentences('我喜欢 Unity. 它很好用。', 'zh')).toEqual(['我喜欢 Unity.', '它很好用。'])
  })

  it('collapses whitespace and drops empty pieces', () => {
    expect(splitSentences('  Hello\n  world.   ', 'en')).toEqual(['Hello world.'])
    expect(splitSentences('   ', 'en')).toEqual([])
  })

  it('cuts long Chinese sentences at commas', () => {
    const clause = '这是一个相当长的分句用来测试切分逻辑是否正常工作'
    const text = Array.from({ length: 6 }, () => clause).join('，') + '。'
    const pieces = splitSentences(text, 'zh')
    expect(pieces.length).toBeGreaterThan(1)
    for (const piece of pieces) expect(piece.length).toBeLessThanOrEqual(80)
    expect(pieces.join('')).toBe(text)
  })

  it('cuts long English sentences at commas, then at spaces', () => {
    const text = Array.from({ length: 12 }, (_, i) => `this is clause number ${i} of a long sentence`).join(', ') + '.'
    const pieces = splitSentences(text, 'en')
    expect(pieces.length).toBeGreaterThan(1)
    for (const piece of pieces) expect(piece.length).toBeLessThanOrEqual(220)
    expect(pieces.join(' ')).toBe(text)

    const noCommas = Array.from({ length: 80 }, () => 'word').join(' ')
    for (const piece of splitSentences(noCommas, 'en')) expect(piece.length).toBeLessThanOrEqual(220)
  })
})

describe('queue navigation', () => {
  // block 0: 2 sentences, block 1: 1, block 2: 3
  const queue = buildQueue(['A one. A two.', '', 'B one.', 'C one. C two. C three.'], 'en')

  it('builds one entry per sentence and skips empty blocks', () => {
    expect(queue.map(s => s.block)).toEqual([0, 0, 2, 3, 3, 3])
    expect(queue[0].text).toBe('A one.')
  })

  it('finds the start of the current block', () => {
    expect(blockStart(queue, 1)).toBe(0)
    expect(blockStart(queue, 5)).toBe(3)
  })

  it('jumps to the next block, or -1 at the last one', () => {
    expect(nextBlockStart(queue, 0)).toBe(2)
    expect(nextBlockStart(queue, 2)).toBe(3)
    expect(nextBlockStart(queue, 4)).toBe(-1)
  })

  it('goes back to the block start first, then to the previous block', () => {
    expect(prevBlockStart(queue, 4)).toBe(3)
    expect(prevBlockStart(queue, 3)).toBe(2)
    expect(prevBlockStart(queue, 2)).toBe(0)
    expect(prevBlockStart(queue, 1)).toBe(0)
    expect(prevBlockStart(queue, 0)).toBe(0)
  })
})

describe('pickVoice', () => {
  const v = (name: string, lang: string, isDefault = false): VoiceLike => ({ name, lang, default: isDefault })

  it('prefers mainland Mandarin, then Taiwan, then Hong Kong', () => {
    expect(pickVoice([v('HK', 'zh-HK'), v('TW', 'zh-TW'), v('CN', 'zh-CN')], 'zh')?.name).toBe('CN')
    expect(pickVoice([v('HK', 'zh-HK'), v('TW', 'zh_TW')], 'zh')?.name).toBe('TW')
    expect(pickVoice([v('HK', 'zh-HK'), v('EN', 'en-US')], 'zh')?.name).toBe('HK')
  })

  it('prefers natural voices within the same region', () => {
    const voices = [
      v('Microsoft Huihui', 'zh-CN', true),
      v('Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)', 'zh-CN'),
    ]
    expect(pickVoice(voices, 'zh')?.name).toContain('Xiaoxiao')
  })

  it('prefers US then British English, and falls back to any English', () => {
    expect(pickVoice([v('GB', 'en-GB'), v('US', 'en-US')], 'en')?.name).toBe('US')
    expect(pickVoice([v('AU', 'en-AU'), v('ZH', 'zh-CN')], 'en')?.name).toBe('AU')
  })

  it('returns null when nothing matches', () => {
    expect(pickVoice([v('FR', 'fr-FR')], 'zh')).toBeNull()
    expect(pickVoice([], 'en')).toBeNull()
  })
})
