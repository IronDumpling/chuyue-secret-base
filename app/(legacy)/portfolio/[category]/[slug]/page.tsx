import LegacyRedirect from '@/components/shared/LegacyRedirect'
import type { Metadata } from 'next'
import { getAllProjects, getProjectBySlug } from '@/lib/portfolio'
import { buildPageMetadata } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllProjects('en').map(project => ({
    category: project.frontMatter.category,
    slug: project.slug,
  }))
}

export function generateMetadata({ params }: { params: { category: string; slug: string } }): Metadata {
  const project = getProjectBySlug(params.slug, params.category, 'en')
  if (!project) return {}
  return buildPageMetadata(
    { kind: 'portfolio', category: params.category, slug: project.slug },
    'en',
    {
      title: project.frontMatter.title,
      description: project.frontMatter.description,
      body: project.content,
      date: String(project.frontMatter.date),
      contentLang: project.lang,
    }
  )
}

export default function LegacyProject({ params }: { params: { category: string; slug: string } }) {
  return <LegacyRedirect path={`/portfolio/${params.category}/${params.slug}/`} />
}
