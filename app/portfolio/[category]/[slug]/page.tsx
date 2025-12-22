import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/portfolio'
import { serializeMDX } from '@/lib/mdx'
import MDXContent from '@/components/MDXContent'
import SafeImage from '@/components/portfolio/SafeImage'
import Link from 'next/link'

interface ProjectPageProps {
  params: {
    category: string
    slug: string
  }
}

export async function generateStaticParams() {
  const { getAllProjects } = await import('@/lib/portfolio')
  const projects = getAllProjects()
  
  return projects.map(project => ({
    category: project.frontMatter.category,
    slug: project.slug,
  }))
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = getProjectBySlug(params.slug, params.category)

  if (!project) {
    notFound()
  }

  const mdxSource = await serializeMDX(project.content)

  return (
    <article className="section bg-white dark:bg-gray-900">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Portfolio
          </Link>
          <h1 className="text-4xl font-bold mb-4">{project.frontMatter.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
            <span className="text-sm">
              {new Date(project.frontMatter.date).toLocaleDateString('en-US', {
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

        {/* Images Gallery */}
        {project.frontMatter.images && project.frontMatter.images.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.frontMatter.images.map((image, index) => (
              <div key={index} className="relative h-64 rounded-lg overflow-hidden">
                <SafeImage
                  src={image}
                  alt={`${project.frontMatter.title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
        {(!project.frontMatter.images || project.frontMatter.images.length === 0) && (
          <div className="mb-8">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <SafeImage
                src="/images/placeholder/portofolio-default.jpg"
                alt={`${project.frontMatter.title} - Default`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Links */}
        {(project.frontMatter.github || project.frontMatter.demo || project.frontMatter.website) && (
          <div className="flex flex-wrap gap-4 mb-8">
            {typeof project.frontMatter.github === 'string' && project.frontMatter.github && (
              <a
                href={project.frontMatter.github}
                target="_blank"
                rel="noopener noreferrer"
                className="button-primary inline-flex items-center gap-2"
              >
                View on GitHub
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
            {Array.isArray(project.frontMatter.github) && project.frontMatter.github.map((item, index) => {
              // Handle both string array and object array formats
              const url = typeof item === 'string' ? item : item.url
              const label = typeof item === 'string' 
                ? (project.frontMatter.github!.length > 1 ? `GitHub Repo ${index + 1}` : 'View on GitHub')
                : item.label
              
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary inline-flex items-center gap-2"
                >
                  {label}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )
            })}
            {typeof project.frontMatter.demo === 'string' && project.frontMatter.demo && (
              <a
                href={project.frontMatter.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary inline-flex items-center gap-2"
              >
                View Demo
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {Array.isArray(project.frontMatter.demo) && project.frontMatter.demo.map((item, index) => {
              const url = typeof item === 'string' ? item : item.url
              const label = typeof item === 'string' ? 'View Demo' : item.label
              
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary inline-flex items-center gap-2"
                >
                  {label}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )
            })}
            {typeof project.frontMatter.website === 'string' && project.frontMatter.website && (
              <a
                href={project.frontMatter.website}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary inline-flex items-center gap-2"
              >
                Visit Website
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {Array.isArray(project.frontMatter.website) && project.frontMatter.website.map((item, index) => {
              const url = typeof item === 'string' ? item : item.url
              const label = typeof item === 'string' ? 'Visit Website' : item.label
              
              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary inline-flex items-center gap-2"
                >
                  {label}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )
            })}
          </div>
        )}

        {/* MDX Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MDXContent source={mdxSource} />
        </div>
      </div>
    </article>
  )
}

