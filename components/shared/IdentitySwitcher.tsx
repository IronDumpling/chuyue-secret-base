'use client'

import { useMemo } from 'react'
import { Identity, orderedIdentities, identityLabels, identityShortDescriptions } from '@/lib/identity'

interface IdentitySwitcherProps {
  currentIdentity: Identity
  onIdentityChange: (identity: Identity) => void
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

  const handlePrev = () => {
    const nextIndex = (currentIndex - 1 + orderedIdentities.length) % orderedIdentities.length
    handleChange(orderedIdentities[nextIndex])
  }

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % orderedIdentities.length
    handleChange(orderedIdentities[nextIndex])
  }

  const identityTagline =
    currentIdentity === 'engineer'
      ? 'Systems & Engineering'
      : currentIdentity === 'creator'
      ? 'Art & Creation'
      : 'Life & Exploration'

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto rounded-3xl border border-gray-200/60 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm px-6 py-6 md:px-8 md:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="space-y-2">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold identity-accent-text">
              {identityLabels[currentIdentity]}
            </h3>
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400">
              {identityShortDescriptions[currentIdentity]}
            </p>
          </div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {identityTagline}
          </div>
        </div>

        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-4 gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Previous identity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Next identity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {orderedIdentities.map((id) => (
              <span
                key={id}
                className={`h-1.5 w-4 rounded-full transition-colors ${
                  id === currentIdentity
                    ? 'bg-gray-900 dark:bg-gray-100'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

