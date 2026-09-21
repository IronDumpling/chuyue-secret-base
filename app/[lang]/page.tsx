'use client'

import { useState } from 'react'
import type { Identity } from '@/lib/identity'
import { orderedIdentities } from '@/lib/identity'
import HomeSection from '@/components/sections/HomeSection'
import AboutSection from '@/components/sections/AboutSection'
import ExperiencesSection from '@/components/sections/ExperiencesSection'
import PortfolioSection from '@/components/sections/PortfolioSection'
import BlogSection from '@/components/sections/BlogSection'
import ScrollHandler from '@/components/shared/ScrollHandler'

type Direction = 'left' | 'right'

function getDirection(current: Identity, next: Identity): Direction {
  if (current === next) return 'left'
  const currentIndex = orderedIdentities.indexOf(current)
  const nextIndex = orderedIdentities.indexOf(next)
  return nextIndex > currentIndex ? 'left' : 'right'
}

export default function Home() {
  const [identity, setIdentity] = useState<Identity>('engineer')
  const [direction, setDirection] = useState<Direction>('left')

  const handleIdentityChange = (next: Identity) => {
    if (next === identity) return
    setDirection(getDirection(identity, next))
    setIdentity(next)
  }

  return (
    <>
      <ScrollHandler />
      <main
        className={`identity-${identity} min-h-screen transition-colors duration-500`}
        style={{ backgroundColor: 'var(--identity-bg)' }}
      >
        <HomeSection />
        <AboutSection identity={identity} direction={direction} onIdentityChange={handleIdentityChange} />
        <ExperiencesSection />
        <PortfolioSection />
        <BlogSection />
        {/* Move the ContactSection to the bottom of the page */}
      </main>
    </>
  )
}

