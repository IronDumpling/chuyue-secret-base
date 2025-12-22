import HomeSection from '@/components/sections/HomeSection'
import AboutSection from '@/components/sections/AboutSection'
import SkillsSection from '@/components/sections/SkillsSection'
import ExperiencesSection from '@/components/sections/ExperiencesSection'
import ScrollHandler from '@/components/ScrollHandler'

export default function Home() {
  return (
    <>
      <ScrollHandler />
      <HomeSection />
      <AboutSection />
      <SkillsSection />
      <ExperiencesSection />
    </>
  )
}

