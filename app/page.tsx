import HomeSection from '@/components/sections/HomeSection'
import AboutSection from '@/components/sections/AboutSection'
import SkillsSection from '@/components/sections/SkillsSection'
import ExperiencesSection from '@/components/sections/ExperiencesSection'
import PortfolioSection from '@/components/sections/PortfolioSection'
import BlogSection from '@/components/sections/BlogSection'
import ScrollHandler from '@/components/ScrollHandler'

export default function Home() {
  return (
    <>
      <ScrollHandler />
      <HomeSection />
      <AboutSection />
      <SkillsSection />
      <ExperiencesSection />
      <PortfolioSection />
      <BlogSection />
      {/* Move the ContactSection to the bottom of the page */}
    </>
  )
}

