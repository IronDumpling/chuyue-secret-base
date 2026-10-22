'use client'

import { useMemo } from 'react'
import type { PortfolioProject } from '@/lib/entry-types'
import ProjectCard from './ProjectCard'
import CategoryFilter from '@/components/shared/filter/CategoryFilter'
import { useUrlSelection } from '@/components/shared/filter/useUrlSelection'
import { getCategoryDisplayName, getGroupDisplayName } from '@/lib/portfolio-utils'
import {
  buildFilterModel,
  matchesSelection,
  normalizeSelection,
  selectionKey,
} from '@/lib/filter-model'
import SwapFade from '@/components/shared/SwapFade'
import { staggerDelay } from '@/lib/motion/stagger'
import { useLocale, useT } from '@/components/shared/LocaleProvider'
import { format } from '@/lib/i18n/format'
import type { PortfolioCategory, PortfolioGroup } from '@/lib/taxonomy'

interface ProjectGridProps {
  projects: PortfolioProject[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const locale = useLocale()
  const t = useT()
  const { selection: chosen, choose: setChosen, watcher } = useUrlSelection()

  const model = useMemo(
    () =>
      buildFilterModel(
        'portfolio',
        projects.map(project => ({ category: project.frontMatter.category })),
        {
          group: id => getGroupDisplayName(id as PortfolioGroup, locale),
          category: id => getCategoryDisplayName(id as PortfolioCategory, locale),
        }
      ),
    [projects, locale]
  )
  const selection = normalizeSelection(chosen, model)

  const visible = projects.filter(project =>
    matchesSelection({ category: project.frontMatter.category, group: project.frontMatter.group }, selection)
  )

  return (
    <div>
      {watcher}
      <div className="mb-8 mt-10">
        <CategoryFilter
          variant="topbar"
          model={model}
          selection={selection}
          onChange={setChosen}
          labels={{
            ariaLabel: t.portfolio.filterLabel,
            all: t.common.all,
            allIn: name => format(t.common.allIn, { name }),
          }}
        />
      </div>

      <SwapFade swapKey={selectionKey(selection)}>
      {visible.length > 0 ? (
        // Keyed by the selection so a new choice replays the fade-in.
        <div key={selectionKey(selection)} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, index) => (
            <div
              key={`${project.frontMatter.category}-${project.slug}`}
              className="motion-safe:animate-feed-in"
              style={{ animationDelay: staggerDelay(index) }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">{t.portfolio.noProjects}</p>
        </div>
      )}
      </SwapFade>
    </div>
  )
}
