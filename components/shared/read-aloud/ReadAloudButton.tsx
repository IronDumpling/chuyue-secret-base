'use client'

import { useT } from '@/components/shared/LocaleProvider'
import { tileIconClass, tileLabelClass } from '@/components/shared/tileStyles'
import { useReadAloud } from './context'
import { PauseIcon, PlayIcon } from './icons'

// The entry point in the links / share row: same tile as its neighbours. Once reading has
// started it doubles as play / pause.
export default function ReadAloudButton() {
  const reader = useReadAloud()
  const t = useT().readAloud
  if (!reader) return null

  const unsupported = reader.supported === false
  const playing = reader.active && reader.status === 'playing'
  const label = !reader.active ? t.listen : playing ? t.pause : t.play

  return (
    <button
      type="button"
      onClick={() => (reader.active ? reader.toggle() : reader.start())}
      disabled={unsupported}
      aria-label={unsupported ? t.unsupported : label}
      title={unsupported ? t.unsupported : label}
      className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className={tileIconClass(reader.active)}>
        {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="ml-0.5 h-5 w-5" />}
      </span>
      <span className={tileLabelClass}>{label}</span>
    </button>
  )
}
