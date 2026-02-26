'use client'

import { useEffect, useState } from 'react'
import type { Identity } from '@/lib/identity'

type SkillLevel = 'expert' | 'proficient' | 'familiar'

interface Skill {
  name: string
  level: SkillLevel
}

interface SkillCategory {
  title: string
  subtitle: string
  icon: string
  skills: Skill[]
}

const engineerSkillCategories: SkillCategory[] = [
  {
    title: 'Programming Languages',
    subtitle: 'Core competencies',
    icon: 'code',
    skills: [
      { name: 'C#', level: 'expert' },
      { name: 'Java', level: 'proficient' },
      { name: 'Python', level: 'proficient' },
      { name: 'C', level: 'proficient' },
      { name: 'Rust', level: 'proficient' },
      { name: 'TypeScript', level: 'proficient' },
      { name: 'C++ (11/14/17/20)', level: 'familiar' },
    ],
  },
  {
    title: 'Databases & Data Platforms',
    subtitle: 'Production experience',
    icon: 'database',
    skills: [
      { name: 'PostgreSQL', level: 'expert' },
      { name: 'MySQL', level: 'expert' },
      { name: 'Redis', level: 'proficient' },
      { name: 'ClickHouse', level: 'proficient' },
      { name: 'MongoDB', level: 'proficient' },
      { name: 'Cassandra', level: 'proficient' },
      { name: 'DynamoDB', level: 'familiar' },
      { name: 'Query Optimization', level: 'expert' },
      { name: 'Data Modeling (OLTP/OLAP)', level: 'proficient' },
      { name: 'Parquet/Columnar Storage', level: 'proficient' },
    ],
  },
  {
    title: 'Distributed Systems',
    subtitle: 'Architecture & design',
    icon: 'cpu',
    skills: [
      { name: 'ACID & Distributed Transactions', level: 'expert' },
      { name: 'Consensus Algorithms (Raft, Paxos)', level: 'proficient' },
      { name: 'Sharding & Replication', level: 'expert' },
      { name: 'CAP Theorem & Trade-offs', level: 'proficient' },
      { name: 'Message Queues (Kafka)', level: 'proficient' },
      { name: 'Distributed Caching', level: 'proficient' },
      { name: 'RDMA Programming', level: 'proficient' },
      { name: 'Performance Benchmarking', level: 'expert' },
    ],
  },
  {
    title: 'Web & API Development',
    subtitle: 'Full-stack experience',
    icon: 'web',
    skills: [
      { name: 'Node.js / Express.js', level: 'proficient' },
      { name: 'Django', level: 'proficient' },
      { name: '.NET Core', level: 'familiar' },
      { name: 'React.js', level: 'proficient' },
      { name: 'RESTful APIs', level: 'expert' },
      { name: 'Microservices', level: 'proficient' },
      { name: 'HTML / CSS', level: 'expert' },
      { name: 'JavaScript', level: 'proficient' },
    ],
  },
  {
    title: 'DevOps & Cloud',
    subtitle: 'Infrastructure & automation',
    icon: 'cloud',
    skills: [
      { name: 'Docker', level: 'proficient' },
      { name: 'Kubernetes', level: 'familiar' },
      { name: 'Jenkins CI/CD', level: 'expert' },
      { name: 'Git / Version Control', level: 'expert' },
      { name: 'AWS S3', level: 'familiar' },
      { name: 'Microsoft Azure', level: 'familiar' },
      { name: 'Shell Scripting', level: 'expert' },
      { name: 'Linux Kernel', level: 'proficient' },
    ],
  },
  {
    title: 'Systems & Performance',
    subtitle: 'Low-level understanding',
    icon: 'tools',
    skills: [
      { name: 'LLVM / Compiler Design', level: 'proficient' },
      { name: 'TCP/IP & Socket Programming', level: 'proficient' },
      { name: 'Parallel Programming', level: 'proficient' },
      { name: 'Performance Profiling (perf)', level: 'proficient' },
      { name: 'Operating Systems', level: 'proficient' },
      { name: 'Computer Networks', level: 'proficient' },
    ],
  },
  {
    title: 'Machine Learning & AI',
    subtitle: 'Research & applications',
    icon: 'brain',
    skills: [
      { name: 'AI Agent Development', level: 'proficient' },
      { name: 'PyTorch', level: 'proficient' },
      { name: 'Deep Learning', level: 'familiar' },
      { name: 'Reinforcement Learning', level: 'familiar' },
      { name: 'RAG (Retrieval-Augmented Generation)', level: 'familiar' },
    ],
  },
]

const creatorSkillCategories: SkillCategory[] = [
  {
    title: 'Game Creation',
    subtitle: 'From mechanics to feel',
    icon: 'game',
    skills: [
      { name: 'Gameplay Prototyping', level: 'proficient' },
      { name: 'Unity', level: 'proficient' },
      { name: 'Level & Encounter Design', level: 'proficient' },
      { name: 'Narrative Systems', level: 'familiar' },
    ],
  },
  {
    title: 'Visuals & Illustration',
    subtitle: 'Drawing and composition',
    icon: 'graphics',
    skills: [
      { name: 'Procreate', level: 'expert' },
      { name: 'Photoshop', level: 'familiar' },
      { name: 'Color & Lighting Studies', level: 'proficient' },
      { name: 'UI Sketching & Wireframes', level: 'proficient' },
    ],
  },
  {
    title: 'Writing & Storytelling',
    subtitle: 'Scripts, essays, and reviews',
    icon: 'tools',
    skills: [
      { name: 'Screenwriting & Story Structure', level: 'proficient' },
      { name: 'Game Narrative & Worldbuilding', level: 'proficient' },
      { name: 'Film Reviews & Analysis', level: 'proficient' },
      { name: 'Album Reviews', level: 'proficient' },
    ],
  },
  {
    title: 'Music & Sound',
    subtitle: 'Atmosphere and rhythm',
    icon: 'cloud',
    skills: [
      { name: 'Basic Music Production', level: 'familiar' },
      { name: 'Soundscapes for Games', level: 'familiar' },
    ],
  },
]

const adventurerSkillCategories: SkillCategory[] = [
  {
    title: 'Outdoor & Sports',
    subtitle: 'Activities I return to',
    icon: 'cpu',
    skills: [
      { name: 'Hiking & City Walking', level: 'expert' },
      { name: 'Badminton / Table Tennis', level: 'proficient' },
      { name: 'Cycling', level: 'proficient' },
      { name: 'Trying new sports', level: 'expert' },
    ],
  },
  {
    title: 'Travel & Exploration',
    subtitle: 'Moving through spaces',
    icon: 'web',
    skills: [
      { name: 'City Hopping & Short Trips', level: 'expert' },
      { name: 'Long Walks with Camera', level: 'expert' },
      { name: 'Planning Itineraries', level: 'proficient' },
    ],
  },
  {
    title: 'Community & Conversations',
    subtitle: 'People and perspectives',
    icon: 'tools',
    skills: [
      { name: 'Meeting New People', level: 'proficient' },
      { name: 'Deep One-on-one Chats', level: 'proficient' },
      { name: 'Joining Events & Meetups', level: 'proficient' },
    ],
  },
]

const skillCategoriesByIdentity: Record<Identity, SkillCategory[]> = {
  engineer: engineerSkillCategories,
  creator: creatorSkillCategories,
  adventurer: adventurerSkillCategories,
}
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

const levelLabel: Record<SkillLevel, string> = {
  expert: '专业',
  proficient: '熟练',
  familiar: '涉猎',
}

function LevelBadge({ level }: { level: SkillLevel }) {
  let levelClass = ''
  if (level === 'expert') levelClass = 'identity-badge-expert'
  if (level === 'proficient') levelClass = 'identity-badge-proficient'
  if (level === 'familiar') levelClass = 'identity-badge-familiar'

  return (
    <span className={`identity-badge ${levelClass}`}>
      {levelLabel[level]}
    </span>
  )
}

interface SkillsSectionProps {
  identity: Identity
  direction: 'left' | 'right'
}

export default function SkillsSection({ identity, direction }: SkillsSectionProps) {
  const [openCategory, setOpenCategory] = useState<number | null>(null)

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index)
  }

  useEffect(() => {
    setOpenCategory(null)
  }, [identity])

  const categories = skillCategoriesByIdentity[identity]
  const slideClass = direction === 'left' ? 'slide-in-left-soft' : 'slide-in-right-soft'

  return (
    <section id="skills-section" className="section">
      <div className="container">
        <h2 className="section-title">Skills</h2>

        <div
          key={identity}
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${slideClass}`}
        >
          {categories.map((category, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                openCategory === index ? 'identity-card-ring-active' : ''
              }`}
            >
              <button
                onClick={() => toggleCategory(index)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="identity-accent-text">
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
                        <LevelBadge level={skill.level} />
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

