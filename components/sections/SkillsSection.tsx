'use client'

import { useEffect, useState } from 'react'
import type { Identity } from '@/lib/identity'
import { pick, type Text } from '@/lib/i18n/localized'
import { useLocale, useT } from '@/components/shared/LocaleProvider'

type SkillLevel = 'expert' | 'proficient' | 'familiar'

interface Skill {
  name: Text
  level: SkillLevel
}

interface SkillCategory {
  title: Text
  icon: string
  skills: Skill[]
}

const engineerSkillCategories: SkillCategory[] = [
  {
    title: { en: 'Programming Languages', zh: '编程语言' },
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
    title: { en: 'Databases & Data Platforms', zh: '数据库与数据平台' },
    icon: 'database',
    skills: [
      { name: 'PostgreSQL', level: 'expert' },
      { name: 'MySQL', level: 'expert' },
      { name: 'Redis', level: 'proficient' },
      { name: 'ClickHouse', level: 'proficient' },
      { name: 'MongoDB', level: 'proficient' },
      { name: 'Cassandra', level: 'proficient' },
      { name: 'DynamoDB', level: 'familiar' },
      { name: { en: 'Query Optimization', zh: '查询优化' }, level: 'expert' },
      { name: { en: 'Data Modeling (OLTP/OLAP)', zh: '数据建模（OLTP/OLAP）' }, level: 'proficient' },
      { name: { en: 'Parquet/Columnar Storage', zh: 'Parquet / 列式存储' }, level: 'proficient' },
    ],
  },
  {
    title: { en: 'Distributed Systems', zh: '分布式系统' },
    icon: 'cpu',
    skills: [
      { name: { en: 'ACID & Distributed Transactions', zh: 'ACID 与分布式事务' }, level: 'expert' },
      { name: { en: 'Consensus Algorithms (Raft, Paxos)', zh: '共识算法（Raft、Paxos）' }, level: 'proficient' },
      { name: { en: 'Sharding & Replication', zh: '分片与复制' }, level: 'expert' },
      { name: { en: 'CAP Theorem & Trade-offs', zh: 'CAP 定理与权衡' }, level: 'proficient' },
      { name: { en: 'Message Queues (Kafka)', zh: '消息队列（Kafka）' }, level: 'proficient' },
      { name: { en: 'Distributed Caching', zh: '分布式缓存' }, level: 'proficient' },
      { name: { en: 'RDMA Programming', zh: 'RDMA 编程' }, level: 'proficient' },
      { name: { en: 'Performance Benchmarking', zh: '性能基准测试' }, level: 'expert' },
    ],
  },
  {
    title: { en: 'Web & API Development', zh: 'Web 与 API 开发' },
    icon: 'web',
    skills: [
      { name: 'Node.js / Express.js', level: 'proficient' },
      { name: 'Django', level: 'proficient' },
      { name: '.NET Core', level: 'familiar' },
      { name: 'React.js', level: 'proficient' },
      { name: 'RESTful APIs', level: 'expert' },
      { name: { en: 'Microservices', zh: '微服务' }, level: 'proficient' },
      { name: 'HTML / CSS', level: 'expert' },
      { name: 'JavaScript', level: 'proficient' },
    ],
  },
  {
    title: { en: 'DevOps & Cloud', zh: 'DevOps 与云' },
    icon: 'cloud',
    skills: [
      { name: 'Docker', level: 'proficient' },
      { name: 'Kubernetes', level: 'familiar' },
      { name: 'Jenkins CI/CD', level: 'expert' },
      { name: { en: 'Git / Version Control', zh: 'Git / 版本控制' }, level: 'expert' },
      { name: 'AWS S3', level: 'familiar' },
      { name: 'Microsoft Azure', level: 'familiar' },
      { name: { en: 'Shell Scripting', zh: 'Shell 脚本' }, level: 'expert' },
      { name: { en: 'Linux Kernel', zh: 'Linux 内核' }, level: 'proficient' },
    ],
  },
  {
    title: { en: 'System-level Skills', zh: '系统级技能' },
    icon: 'tools',
    skills: [
      { name: { en: 'LLVM / Compiler Design', zh: 'LLVM / 编译器设计' }, level: 'proficient' },
      { name: { en: 'TCP/IP & Socket Programming', zh: 'TCP/IP 与 Socket 编程' }, level: 'proficient' },
      { name: { en: 'Parallel Programming', zh: '并行编程' }, level: 'proficient' },
      { name: { en: 'Performance Profiling (perf)', zh: '性能分析（perf）' }, level: 'proficient' },
      { name: { en: 'Operating Systems', zh: '操作系统' }, level: 'proficient' },
      { name: { en: 'Computer Networks', zh: '计算机网络' }, level: 'proficient' },
    ],
  },
  {
    title: { en: 'Machine Learning & AI', zh: '机器学习与人工智能' },
    icon: 'brain',
    skills: [
      { name: { en: 'AI Agent Development', zh: 'AI Agent 开发' }, level: 'proficient' },
      { name: 'PyTorch', level: 'proficient' },
      { name: { en: 'Deep Learning', zh: '深度学习' }, level: 'familiar' },
      { name: { en: 'Reinforcement Learning', zh: '强化学习' }, level: 'familiar' },
      { name: { en: 'RAG (Retrieval-Augmented Generation)', zh: 'RAG（检索增强生成）' }, level: 'familiar' },
    ],
  },
]

const creatorSkillCategories: SkillCategory[] = [
  {
    title: { en: 'Game Design', zh: '游戏设计' },
    icon: 'game',
    skills: [
      { name: { en: 'Game Systems Design', zh: '游戏系统设计' }, level: 'proficient' },
      { name: { en: 'Level Design', zh: '关卡设计' }, level: 'proficient' },
      { name: { en: 'Gameplay Prototyping', zh: '玩法原型' }, level: 'proficient' },
    ],
  },
  {
    title: { en: 'Writing', zh: '写作' },
    icon: 'tools',
    skills: [
      { name: { en: 'Film Reviews', zh: '影评' }, level: 'proficient' },
      { name: { en: 'Fiction', zh: '小说' }, level: 'proficient' },
      { name: { en: 'Screenplays', zh: '剧本' }, level: 'proficient' },
      { name: { en: 'Essays & Commentary', zh: '随笔与评论' }, level: 'proficient' },
    ],
  },
  {
    title: { en: 'Visuals', zh: '视觉' },
    icon: 'graphics',
    skills: [
      { name: { en: 'Procreate Illustration', zh: 'Procreate 插画' }, level: 'expert' },
      { name: { en: 'Photography', zh: '摄影' }, level: 'proficient' },
      { name: { en: 'Video Editing', zh: '视频剪辑' }, level: 'proficient' },
      { name: { en: 'Image Editing', zh: '图像编辑' }, level: 'proficient' },
      { name: 'Maya', level: 'familiar' },
      { name: 'Blender', level: 'familiar' },
    ],
  },
  {
    title: { en: 'Music', zh: '音乐' },
    icon: 'cloud',
    skills: [{ name: { en: 'FL Studio Remix', zh: 'FL Studio 混音' }, level: 'familiar' }],
  },
]

const adventurerSkillCategories: SkillCategory[] = [
  {
    title: { en: 'Sports', zh: '运动' },
    icon: 'game',
    skills: [
      { name: { en: 'Badminton', zh: '羽毛球' }, level: 'proficient' },
      { name: { en: 'Swimming', zh: '游泳' }, level: 'proficient' },
      { name: { en: 'Skiing', zh: '滑雪' }, level: 'familiar' },
      { name: { en: 'Skating', zh: '滑冰' }, level: 'familiar' },
      { name: { en: 'Long-distance Running', zh: '长跑' }, level: 'proficient' },
      { name: { en: 'Hiking', zh: '徒步' }, level: 'proficient' },
      { name: { en: 'Cycling', zh: '骑行' }, level: 'proficient' },
      { name: { en: 'Bowling', zh: '保龄球' }, level: 'familiar' },
      { name: { en: 'Volleyball', zh: '排球' }, level: 'familiar' },
    ],
  },
  {
    title: { en: 'Activities', zh: '活动' },
    icon: 'web',
    skills: [
      { name: { en: 'Murder Mystery', zh: '剧本杀' }, level: 'proficient' },
      { name: { en: 'Escape Rooms', zh: '密室逃脱' }, level: 'proficient' },
      { name: { en: 'Board Games', zh: '桌游' }, level: 'expert' },
      { name: { en: 'Theatre', zh: '戏剧' }, level: 'expert' },
      { name: { en: 'Concert', zh: '演唱会' }, level: 'expert' },
      { name: { en: 'Go-karting', zh: '卡丁车' }, level: 'familiar' },
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

interface SkillsSectionProps {
  identity: Identity
  direction: 'left' | 'right'
}

export function SkillsAccordion({ identity }: { identity: Identity }) {
  const locale = useLocale()
  const [openCategory, setOpenCategory] = useState<number | null>(null)

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index)
  }

  useEffect(() => {
    setOpenCategory(null)
  }, [identity])

  const categories = skillCategoriesByIdentity[identity]
  const levelOrder: Record<SkillLevel, number> = {
    expert: 0,
    proficient: 1,
    familiar: 2,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-900 dark:text-gray-50">
      {categories.map((category, index) => (
        <div
          key={index}
          className={`rounded-xl overflow-hidden transition-all duration-300 ${
            openCategory === index ? 'identity-card-ring-active' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => toggleCategory(index)}
            className={`w-full p-4 flex items-center justify-between identity-accordion-header ${
              openCategory === index ? 'rounded-t-xl' : 'rounded-xl'
            }`}
          >
              <div className="flex items-center gap-4">
                <div className="identity-accent-text">{iconMap[category.icon]}</div>
                <div className="text-left">
                  <h4 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-50">
                    {pick(category.title, locale)}
                  </h4>
                </div>
              </div>
            <svg
              className={`w-5 h-5 text-gray-500 dark:text-slate-400 transition-transform ${
                openCategory === index ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              openCategory === index ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div
              className={`p-4 pt-0 space-y-4 transform-gpu origin-top transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                openCategory === index ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-2'
              }`}
            >
              <div className="mt-3 pt-3 flex flex-wrap gap-2 border-t border-gray-200 dark:border-white/10">
                {[...category.skills]
                  .sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
                  .map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className={`identity-chip ${
                        skill.level === 'expert' ? 'identity-chip-expert' : 'identity-chip-normal'
                      }`}
                    >
                      {pick(skill.name, locale)}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SkillsSection({ identity, direction }: SkillsSectionProps) {
  const t = useT()
  const slideClass = direction === 'left' ? 'slide-in-left-soft' : 'slide-in-right-soft'

  return (
    <section id="skills-section" className="section">
      <div className="container">
        <div className={`identity-card-surface space-y-8 ${slideClass}`}>
          <h2 className="section-title">{t.skills.heading}</h2>
          <SkillsAccordion identity={identity} />
        </div>
      </div>
    </section>
  )
}

