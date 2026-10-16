import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEntries, getEntry } from '@/lib/content'
import EntryDetail from '@/components/shared/EntryDetail'
import { buildEntryMetadata } from '@/lib/seo'
import type { Locale } from '@/lib/i18n/config'

interface ProjectPageProps {
  params: {
    lang: Locale
    category: string
    slug: string
  }
}

export function generateStaticParams() {
  return getEntries('portfolio', 'en').map(project => ({
    category: project.frontMatter.category,
    slug: project.slug,
  }))
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = getEntry('portfolio', params.category, params.slug, params.lang)
  return project ? buildEntryMetadata(project, params.lang) : {}
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = getEntry('portfolio', params.category, params.slug, params.lang)
  if (!project) notFound()

  const { tags } = project.frontMatter
  const badges = tags && (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  )

  return <EntryDetail entry={project} lang={params.lang} badges={badges} />
}
