import LegacyRedirect from '@/components/shared/LegacyRedirect'
import type { Metadata } from 'next'
import { getEntries, getEntry } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

export function generateStaticParams() {
  return getEntries('portfolio', 'en').map(project => ({
    category: project.frontMatter.category,
    slug: project.slug,
  }))
}

export function generateMetadata({ params }: { params: { category: string; slug: string } }): Metadata {
  const project = getEntry('portfolio', params.category, params.slug, 'en')
  if (!project) return {}
  return buildPageMetadata(
    project.target,
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
