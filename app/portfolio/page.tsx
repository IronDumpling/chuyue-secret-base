import { getAllProjects } from '@/lib/portfolio'
import ProjectGrid from '@/components/portfolio/ProjectGrid'

export const metadata = {
  title: 'Portfolio - Chuyue',
  description: 'Portfolio projects by Chuyue Zhang',
}

export default function PortfolioPage() {
  const projects = getAllProjects()

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">Portfolio</h1>
        <ProjectGrid projects={projects} />
      </div>
    </section>
  )
}

