import type { Score } from '@/lib/ratings'

// One color per score, shared by the chip and the bar: the site's blue above 5, deepening toward
// 10; gray at 5; orange below 5, deepening toward 1. Written out in full so Tailwind finds them.
export const CHIP_BG: Record<Score, string> = {
  1: 'bg-orange-700',
  2: 'bg-orange-600',
  3: 'bg-orange-500',
  4: 'bg-orange-400',
  5: 'bg-gray-500',
  6: 'bg-primary-400',
  7: 'bg-primary-500',
  8: 'bg-primary-600',
  9: 'bg-primary-700',
  10: 'bg-primary-800',
}

export const FILL_BG: Record<Score, string> = CHIP_BG
