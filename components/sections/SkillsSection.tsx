'use client'

import { useState } from 'react'

interface Skill {
  name: string
  percentage: number
}

interface SkillCategory {
  title: string
  subtitle: string
  icon: string
  skills: Skill[]
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend Develop',
    subtitle: 'More than 6 websites',
    icon: 'code',
    skills: [
      { name: 'HTML', percentage: 90 },
      { name: 'CSS', percentage: 80 },
      { name: 'JavaScript', percentage: 60 },
      { name: 'React', percentage: 50 },
    ],
  },
  {
    title: 'Software Develop',
    subtitle: 'More than 4 projects',
    icon: 'cpu',
    skills: [
      { name: 'C', percentage: 75 },
      { name: 'C++', percentage: 60 },
      { name: 'Rust', percentage: 60 },
      { name: 'Operating System', percentage: 50 },
      { name: 'Computer Network', percentage: 50 },
      { name: 'Version Control (Git, Perforce)', percentage: 60 },
      { name: 'Design Patterns', percentage: 60 },
    ],
  },
  {
    title: 'Data Process',
    subtitle: 'More than 2 years',
    icon: 'database',
    skills: [
      { name: 'Python', percentage: 90 },
      { name: 'PostgreSQL', percentage: 75 },
      { name: 'MySQL', percentage: 75 },
    ],
  },
  {
    title: 'Game Develop',
    subtitle: 'More than 3 years',
    icon: 'game',
    skills: [
      { name: 'C#', percentage: 80 },
      { name: 'Unity', percentage: 75 },
      { name: 'MAYA', percentage: 50 },
      { name: 'Photoshop', percentage: 50 },
      { name: 'Procreate', percentage: 95 },
    ],
  },
  {
    title: 'Machine Learning',
    subtitle: 'More than 2 projects',
    icon: 'brain',
    skills: [
      { name: 'Pytorch', percentage: 60 },
      { name: 'Deep Learning', percentage: 40 },
      { name: 'Reinforcement Learning', percentage: 40 },
    ],
  },
  {
    title: 'Computer Graphics',
    subtitle: 'More than 4 projects',
    icon: 'graphics',
    skills: [
      { name: 'Shader', percentage: 60 },
      { name: 'Geometry', percentage: 50 },
      { name: 'Rendering', percentage: 70 },
      { name: 'Animation', percentage: 70 },
    ],
  },
]

const iconMap: Record<string, JSX.Element> = {
  code: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  cpu: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  database: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  game: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  brain: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  graphics: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
}

export default function SkillsSection() {
  const [openCategory, setOpenCategory] = useState<number | null>(null)

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index)
  }

  return (
    <section id="skills" className="section bg-gray-50 dark:bg-gray-800">
      <div className="container">
        <h2 className="section-title">Skills</h2>
        <span className="section-subtitle">My technical Level</span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillCategories.map((category, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                openCategory === index ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <button
                onClick={() => toggleCategory(index)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-primary-600 dark:text-primary-400">
                    {iconMap[category.icon]}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{category.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.subtitle}</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                    openCategory === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openCategory === index && (
                <div className="p-4 pt-0 space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{skill.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${skill.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

