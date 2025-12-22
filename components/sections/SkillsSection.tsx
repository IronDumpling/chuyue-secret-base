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
    title: 'Programming Languages',
    subtitle: 'Core competencies',
    icon: 'code',
    skills: [
      { name: 'C++/Modern C++ (11/14/17)', percentage: 85 },
      { name: 'C', percentage: 80 },
      { name: 'Python', percentage: 90 },
      { name: 'C#', percentage: 80 },
      { name: 'Java', percentage: 75 },
      { name: 'Go', percentage: 70 },
      { name: 'Rust', percentage: 65 },
      { name: 'SQL', percentage: 85 },
      { name: 'TypeScript', percentage: 70 },
    ],
  },
  {
    title: 'Databases & Data Platforms',
    subtitle: 'Production experience',
    icon: 'database',
    skills: [
      { name: 'PostgreSQL', percentage: 90 },
      { name: 'MySQL', percentage: 85 },
      { name: 'Redis', percentage: 80 },
      { name: 'ClickHouse', percentage: 75 },
      { name: 'MongoDB', percentage: 70 },
      { name: 'Cassandra', percentage: 70 },
      { name: 'DynamoDB', percentage: 65 },
      { name: 'Query Optimization', percentage: 85 },
      { name: 'Data Modeling (OLTP/OLAP)', percentage: 80 },
      { name: 'Parquet/Columnar Storage', percentage: 80 },
    ],
  },
  {
    title: 'Distributed Systems',
    subtitle: 'Architecture & Design',
    icon: 'cpu',
    skills: [
      { name: 'ACID & Distributed Transactions', percentage: 85 },
      { name: 'Consensus Algorithms (Raft, Paxos)', percentage: 80 },
      { name: 'Sharding & Replication', percentage: 85 },
      { name: 'CAP Theorem & Trade-offs', percentage: 80 },
      { name: 'Message Queues (Kafka)', percentage: 70 },
      { name: 'Distributed Caching', percentage: 80 },
      { name: 'RDMA Programming', percentage: 75 },
      { name: 'Performance Benchmarking', percentage: 85 },
    ],
  },
  {
    title: 'Web & API Development',
    subtitle: 'Full-stack experience',
    icon: 'web',
    skills: [
      { name: 'Node.js/Express.js', percentage: 80 },
      { name: 'Django', percentage: 75 },
      { name: '.NET Core', percentage: 70 },
      { name: 'React.js', percentage: 75 },
      { name: 'RESTful APIs', percentage: 85 },
      { name: 'Microservices', percentage: 75 },
      { name: 'HTML/CSS', percentage: 85 },
      { name: 'JavaScript', percentage: 80 },
    ],
  },
  {
    title: 'DevOps & Cloud',
    subtitle: 'Infrastructure & Automation',
    icon: 'cloud',
    skills: [
      { name: 'Docker', percentage: 80 },
      { name: 'Kubernetes', percentage: 70 },
      { name: 'Jenkins CI/CD', percentage: 85 },
      { name: 'Git/Version Control', percentage: 90 },
      { name: 'AWS S3', percentage: 70 },
      { name: 'Microsoft Azure', percentage: 65 },
      { name: 'Shell Scripting', percentage: 85 },
      { name: 'Linux Kernel', percentage: 75 },
    ],
  },
  {
    title: 'Game Development',
    subtitle: 'More than 3 years',
    icon: 'game',
    skills: [
      { name: 'Unity', percentage: 80 },
      { name: 'MAYA', percentage: 50 },
      { name: 'Photoshop', percentage: 50 },
      { name: 'Procreate', percentage: 95 },
      { name: 'Shader Programming', percentage: 70 },
    ],
  },
  {
    title: 'Machine Learning & AI',
    subtitle: 'Research & Applications',
    icon: 'brain',
    skills: [
      { name: 'PyTorch', percentage: 70 },
      { name: 'Deep Learning', percentage: 65 },
      { name: 'Reinforcement Learning', percentage: 70 },
      { name: 'Generative Learning', percentage: 60 },
      { name: 'AI Agent Development', percentage: 60 },
    ],
  },
  {
    title: 'Computer Graphics',
    subtitle: 'More than 4 projects',
    icon: 'graphics',
    skills: [
      { name: 'Shader Programming', percentage: 70 },
      { name: 'Geometry Processing', percentage: 65 },
      { name: 'Rendering Techniques', percentage: 75 },
      { name: 'Animation Systems', percentage: 70 },
      { name: 'GPU Programming', percentage: 65 },
    ],
  },
  {
    title: 'Additional Skills',
    subtitle: 'Tools & Technologies',
    icon: 'tools',
    skills: [
      { name: 'LLVM/Compiler Design', percentage: 70 },
      { name: 'TCP/IP & Socket Programming', percentage: 80 },
      { name: 'Parallel Programming', percentage: 75 },
      { name: 'Performance Profiling (perf)', percentage: 80 },
      { name: 'Operating Systems', percentage: 75 },
      { name: 'Computer Networks', percentage: 80 },
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
  web: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  cloud: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
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
  tools: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

export default function SkillsSection() {
  const [openCategory, setOpenCategory] = useState<number | null>(null)

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index)
  }

  return (
    <section id="skills-section" className="section bg-gray-50 dark:bg-gray-800">
      <div className="container">
        <h2 className="section-title">Skills</h2>

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

              <div
                className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  openCategory === index
                    ? 'max-h-[1000px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div
                  className={`p-4 pt-0 space-y-4 transform-gpu origin-top transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    openCategory === index
                      ? 'scale-100 translate-y-0'
                      : 'scale-95 -translate-y-2'
                  }`}
                >
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

