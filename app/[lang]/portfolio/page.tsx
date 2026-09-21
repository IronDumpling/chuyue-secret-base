import { getAllProjects } from '@/lib/portfolio'
import ProjectGrid from '@/components/portfolio/ProjectGrid'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n'

export function generateMetadata({ params }: { params: { lang: Locale } }) {
  const t = getDictionary(params.lang)
  return { title: t.portfolio.pageTitle, description: t.portfolio.pageDescription }
}

export default function PortfolioPage({ params }: { params: { lang: Locale } }) {
  const projects = getAllProjects(params.lang)

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h1 className="section-title">{getDictionary(params.lang).portfolio.pageTitle}</h1>
        <ProjectGrid projects={projects} />
      </div>
    </section>
  )
}

