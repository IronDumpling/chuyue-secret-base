import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/portfolio'
import { describeLink, pickPrimaryLink, secondaryLinks } from '@/lib/link-icon'
import MDXContent from '@/components/shared/MDXContent'
import MDXHeaderImage from '@/components/shared/MDXHeaderImage'
import ShareBar from '@/components/shared/ShareBar'
import LinkIcon from '@/components/shared/LinkIcons'
import { getShareProps } from '@/lib/share'
import { buildPageMetadata, summarize } from '@/lib/seo'
import { INTL_LOCALE, LOCALES, type Locale } from '@/lib/i18n/config'
import { localePath } from '@/lib/i18n/paths'
import { getDictionary } from '@/lib/i18n'
import ListBackLink from '@/components/shared/ListBackLink'
import FallbackNotice from '@/components/shared/FallbackNotice'

interface ProjectPageProps {
  params: {
    lang: Locale
    category: string
    slug: string
  }
}

export async function generateStaticParams() {
  const { getAllProjects } = await import('@/lib/portfolio')
  const projects = getAllProjects('en')
  
  return projects.map(project => ({
    category: project.frontMatter.category,
    slug: project.slug,
  }))
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = getProjectBySlug(params.slug, params.category, params.lang)
  if (!project) return {}
  const languages = LOCALES.filter(l => {
    const version = getProjectBySlug(params.slug, params.category, l)
    return version && !version.isFallback
  })
  return buildPageMetadata(
    { kind: 'portfolio', category: project.frontMatter.category, slug: project.slug },
    params.lang,
    {
      title: project.frontMatter.title,
      description: project.frontMatter.description,
      body: project.content,
      date: String(project.frontMatter.date),
      contentLang: project.lang,
      languages,
    }
  )
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = getProjectBySlug(params.slug, params.category, params.lang)

  if (!project) {
    notFound()
  }

  const t = getDictionary(params.lang)

  return (
    <article className="section bg-white dark:bg-gray-900">
      <div className="container max-w-4xl">
        <FallbackNotice pageLang={params.lang} contentLang={project.lang} />
        {/* Header */}
        <div className="mb-8">
          <ListBackLink
            href={localePath(params.lang, '/portfolio')}
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.portfolio.back}
          </ListBackLink>
          <h1 lang={project.lang} className="text-4xl font-bold mb-4">{project.frontMatter.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
            <span className="text-sm">
              {new Date(project.frontMatter.date).toLocaleDateString(INTL_LOCALE[params.lang], {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {project.frontMatter.tags && (
              <div className="flex flex-wrap gap-2">
                {project.frontMatter.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <ShareBar
          {...getShareProps(
            { kind: 'portfolio', category: project.frontMatter.category, slug: project.slug },
            params.lang,
            project.frontMatter.title,
            summarize(project.frontMatter.description, project.content)
          )}
        />

        {/* Header Image */}
        <MDXHeaderImage
          images={
            project.frontMatter.images && project.frontMatter.images.length > 0
              ? project.frontMatter.images
              : ['/images/placeholder/portofolio-default.jpg']
          }
          title={project.frontMatter.title}
        />

        {/* Links: one prominent primary link (demo > website > github), the rest as
            compact secondary chips — see lib/link-icon.ts for the priority/icon rules. */}
        {(() => {
          const groups = {
            github: project.frontMatter.github ?? [],
            demo: project.frontMatter.demo ?? [],
            website: project.frontMatter.website ?? [],
          }
          const primary = pickPrimaryLink(groups)
          const secondary = secondaryLinks(groups, primary)
          if (!primary) return null
          const primaryInfo = describeLink(primary)
          return (
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <a
                href={primary.url}
                target="_blank"
                rel="noopener noreferrer"
                className="button-primary inline-flex items-center gap-2"
              >
                <LinkIcon iconId={primaryInfo.iconId} />
                {primaryInfo.label}
              </a>
              {secondary.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {secondary.map(link => {
                    const info = describeLink(link)
                    return (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-secondary text-sm inline-flex items-center gap-1.5"
                      >
                        <LinkIcon iconId={info.iconId} className="w-4 h-4" />
                        {info.label}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* MDX Content */}
        <div lang={project.lang} className="prose prose-lg dark:prose-invert max-w-none">
          <MDXContent source={project.content} />
        </div>
      </div>
    </article>
  )
}

