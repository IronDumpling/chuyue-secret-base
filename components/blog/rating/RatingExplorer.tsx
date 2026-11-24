'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { SCORES, type RatingScale, type Score } from '@/lib/ratings'
import { useT } from '@/components/shared/LocaleProvider'
import { format } from '@/lib/i18n/format'
import { CHIP_BG, FILL_BG } from './tones'

interface RatingExplorerProps {
  scale: RatingScale
  categoryName: string
  postScore: Score
  autoFocus?: boolean
  headingId?: string
}

// Position of a score on the slider's linear 1-10 axis, as a percentage.
const pos = (n: number) => ((n - 1) / 9) * 100

// One slider over the whole scale: it starts at the post's score and shows the name and
// definition of whichever score the thumb is on. Remounted on every open, so it always starts
// at the post's score.
export default function RatingExplorer({ scale, categoryName, postScore, autoFocus, headingId }: RatingExplorerProps) {
  const t = useT().blog.rating
  const [value, setValue] = useState<Score>(postScore)
  const input = useRef<HTMLInputElement>(null)
  const ownId = useId()
  const titleId = headingId ?? ownId
  const tier = scale.tiers[value]
  const from = Math.min(value, 5)
  const to = Math.max(value, 5)

  useEffect(() => {
    if (autoFocus) input.current?.focus()
  }, [autoFocus])

  return (
    <div className="text-sm">
      <h2 id={titleId} className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {format(t.scaleTitle, { category: categoryName })}
      </h2>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{scale.subtitle}</p>

      <div className="mt-3.5 flex min-h-[34px] items-center gap-2.5">
        <span
          className={`rounded-lg px-[11px] py-0.5 text-xl font-extrabold text-white tabular-nums transition-colors duration-150 ${CHIP_BG[value]}`}
        >
          {value}
        </span>
        <span className="text-[17px] font-bold text-gray-900 dark:text-gray-100">{tier.name}</span>
        <span
          className={`rounded-full bg-primary-100 px-[7px] py-px text-[11px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 ${
            value === postScore ? '' : 'invisible'
          }`}
        >
          {t.thisPost}
        </span>
      </div>
      <p className="mb-3 mt-1 min-h-[3.75rem] leading-relaxed text-gray-600 dark:text-gray-300">{tier.definition}</p>

      <div className="relative mx-[10px] h-12">
        <span className="absolute inset-x-0 top-[18px] h-2 rounded-full bg-gray-100 dark:bg-gray-800" />
        <span
          className={`absolute top-[18px] h-2 transition-all duration-150 ${value > 5 ? 'rounded-r-full' : 'rounded-l-full'} ${FILL_BG[value]}`}
          style={{ left: `${pos(from)}%`, width: `${pos(to) - pos(from)}%` }}
        />
        <span className="absolute top-3 h-5 w-0.5 -translate-x-1/2 bg-gray-400" style={{ left: `${pos(5)}%` }} />
        <span
          className="absolute top-0.5 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-primary-700 dark:border-t-primary-400"
          style={{ left: `${pos(postScore)}%` }}
        />
        {SCORES.map(n => (
          <span
            key={n}
            className={`absolute top-[34px] w-4 -translate-x-1/2 text-center text-[10px] tabular-nums ${
              n === 5 ? 'font-bold text-gray-600 dark:text-gray-300' : 'text-gray-400'
            }`}
            style={{ left: `${pos(n)}%` }}
          >
            {n}
          </span>
        ))}
        <input
          ref={input}
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={event => setValue(Number(event.target.value) as Score)}
          aria-label={t.sliderLabel}
          aria-valuetext={format(t.valueText, { n: value, name: tier.name })}
          className="rating-range absolute -inset-x-[10px] top-2 m-0 h-7 w-[calc(100%+20px)]"
        />
      </div>

      <div className="mt-3 border-t border-gray-100 pt-2.5 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setValue(postScore)}
          className={`text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 ${
            value === postScore ? 'invisible' : ''
          }`}
        >
          ↺ {format(t.backTo, { n: postScore })}
        </button>
      </div>
    </div>
  )
}
