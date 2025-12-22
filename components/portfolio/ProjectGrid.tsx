'use client'

import { useState } from 'react'
import { PortfolioProject } from '@/lib/portfolio'
import ProjectCard from './ProjectCard'
import { getCategoryDisplayName } from '@/lib/portfolio-utils'

interface ProjectGridProps {
  projects: PortfolioProject[]
}

const categories: PortfolioProject['frontMatter']['category'][] = [
  'student-projects',
  'work-projects',
  'video-games',
  'applications',
]

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<PortfolioProject['frontMatter']['category'] | 'all'>('all')

  const filteredProjects =
    selectedCategory === 'all'
      ? projects
      : projects.filter(p => p.frontMatter.category === selectedCategory)

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {getCategoryDisplayName(category)}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={`${project.frontMatter.category}-${project.slug}`} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No projects found in this category.</p>
        </div>
      )}
    </div>
  )
}

