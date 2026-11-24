import type { Score } from '@/lib/ratings'
import { meterFill } from '@/lib/rating-meter'
import { CHIP_BG, FILL_BG } from './tones'

interface RatingMeterProps {
  score: Score
  name: string
  size?: 'sm' | 'md'
}

const SIZES = {
  sm: { chip: 'px-[7px] text-[13px]', bar: 'w-[90px] h-2', word: 'text-[13px]' },
  md: { chip: 'px-[9px] py-0.5 text-[15px]', bar: 'w-[120px] h-2.5', word: 'text-[15px]' },
}

// Score chip · a bar centered on 5 · the tier's name. The bar grows right from the center for a
// score above 5 and left for one below; a 5 has no bar, only a dot on the center line. Purely
// presentational: RatingBadge makes it a button.
export default function RatingMeter({ score, name, size = 'sm' }: RatingMeterProps) {
  const fill = meterFill(score)
  const s = SIZES[size]
  return (
    <span className="inline-flex items-center gap-2" aria-hidden="true">
      <span className={`rounded-md font-bold leading-snug text-white tabular-nums ${CHIP_BG[score]} ${s.chip}`}>
        {score}
      </span>
      <span className={`relative rounded-full bg-gray-100 dark:bg-gray-800 ${s.bar}`}>
        {fill.side === 'none' ? (
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500" />
        ) : (
          <span
            className={`absolute inset-y-0 rounded-full ${FILL_BG[score]}`}
            style={{ left: `${fill.start * 100}%`, width: `${fill.width * 100}%` }}
          />
        )}
        <span className="absolute -top-[3px] -bottom-[3px] left-1/2 w-px bg-gray-400 dark:bg-gray-500" />
      </span>
      <span className={`font-semibold text-gray-700 dark:text-gray-200 ${s.word}`}>{name}</span>
    </span>
  )
}
