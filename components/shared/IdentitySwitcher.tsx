'use client'

import { useMemo } from 'react'
import { Identity, orderedIdentities, identityLabels } from '@/lib/identity'

interface IdentitySwitcherProps {
  currentIdentity: Identity
  onIdentityChange: (identity: Identity) => void
}

function IdentityIcon({ identity }: { identity: Identity }) {
  if (identity === 'engineer') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
      </svg>
    )
  }

  if (identity === 'creator') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2M7 8h10M7 16h10M9 19h6M6 10h.01M18 10h.01M6 14h.01M18 14h.01" />
      </svg>
    )
  }

  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 2" />
    </svg>
  )
}

export default function IdentitySwitcher({ currentIdentity, onIdentityChange }: IdentitySwitcherProps) {
  const currentIndex = useMemo(
    () => orderedIdentities.indexOf(currentIdentity),
    [currentIdentity],
  )

  const handleChange = (identity: Identity) => {
    if (identity === currentIdentity) return
    onIdentityChange(identity)
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {orderedIdentities.map((id) => {
          const active = id === currentIdentity
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleChange(id)}
              className={`identity-tab ${active ? 'identity-tab-active' : ''}`}
              aria-current={active ? 'true' : undefined}
            >
              <IdentityIcon identity={id} />
              <span className="font-medium tracking-wide">{identityLabels[id]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

