import Link from 'next/link'
import SafeImage from './SafeImage'
import type { PortfolioProject } from '@/lib/portfolio-types'

interface ProjectCardProps {
  project: PortfolioProject
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const image = project.frontMatter.images?.[0] || '/images/placeholder/portofolio-default.jpg'

  return (
    <Link
      href={`/portfolio/${project.frontMatter.category}/${project.slug}`}
      className="group block bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <SafeImage
          src={image}
          alt={project.frontMatter.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {project.frontMatter.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {project.frontMatter.description || project.content.substring(0, 150) + '...'}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.frontMatter.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-500">
          {new Date(project.frontMatter.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          })}
        </div>
      </div>
    </Link>
  )
}

