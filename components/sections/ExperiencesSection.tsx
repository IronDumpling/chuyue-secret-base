'use client'

import { useState } from 'react'
import { withBasePath } from '@/lib/utils'
import { useLocale, useLocalePath, useT } from '@/components/shared/LocaleProvider'
import { pick, type Text } from '@/lib/i18n/localized'

interface ExperienceItem {
  title: Text
  subtitle: Text
  period: Text
  details: Array<{
    title: Text
    content: Text[]
    links?: Array<{ text: Text; url: string }>
  }>
}

const experiences: ExperienceItem[] = [
  {
    title: { en: 'Science Major', zh: '理科' },
    subtitle: { en: 'High School Affiliated to Southwest University, China', zh: '西南大学附属中学，中国' },
    period: '2016-2019',
    details: [
      {
        title: { en: 'IELTS', zh: '雅思' },
        content: [{ en: 'Average: 7', zh: '总分：7' }, { en: 'Writing & Reading: 8.5', zh: '写作与阅读：8.5' }],
      },
    ],
  },
  {
    title: { en: 'Civil Engineering (BASc)', zh: '土木工程（BASc）' },
    subtitle: { en: 'University of Toronto, Canada', zh: '多伦多大学，加拿大' },
    period: '9/2019-5/2020',
    details: [
      {
        title: { en: 'Group Project: Toronto Island Flood Control', zh: '小组项目：多伦多岛防洪' },
        content: [{ en: 'CDS got full mark', zh: 'CDS 获得满分' }, { en: 'Played role as project manager', zh: '担任项目经理' }],
      },
    ],
  },
  {
    title: { en: 'Computer Engineering (BASc)', zh: '计算机工程（BASc）' },
    subtitle: { en: 'University of Toronto, Canada', zh: '多伦多大学，加拿大' },
    period: '9/2020-5/2022',
    details: [
      {
        title: 'GPA',
        content: [{ en: 'Cumulative GPA: 3.76/4.0', zh: '累计 GPA：3.76/4.0' }, { en: 'Graduate with Honours', zh: '荣誉毕业' }],
      },
      {
        title: { en: "Dean's Honours List", zh: '院长荣誉榜' },
        content: [{ en: 'On the list in 5 semesters', zh: '5 个学期上榜' }],
      },
      {
        title: { en: 'Course Highlights', zh: '课程亮点' },
        content: [
          { en: 'ECE345H1 Data Structure & Algorithm: 91/100 A+', zh: 'ECE345H1 数据结构与算法：91/100 A+' },
          { en: 'CSC317H1 Computer Graphics: 94/100 A+', zh: 'CSC317H1 计算机图形学：94/100 A+' },
          { en: 'ECE361H1 Computer Networks: 87/100 A', zh: 'ECE361H1 计算机网络：87/100 A' },
          { en: 'ECE297H1 Software Design: 86/100 A', zh: 'ECE297H1 软件设计：86/100 A' },
        ],
      },
      {
        title: 'Easy Go Map',
        content: [
          { en: 'An offline GIS software, presenting global urban map data with navigation function.', zh: '一款离线 GIS 软件，展示全球城市地图数据，并提供导航功能。' },
          { en: 'Build city maps with from scratch. Develop a navigator with A* algorithm which provides driving instructions. Apply greedy algorithms, simulated annealing, and multi-threading to tackle the NP-hard Traveling Salesman Problem, achieving top 15% in the class.', zh: '从零构建城市地图；用 A* 算法开发提供驾驶指引的导航器；运用贪心算法、模拟退火和多线程求解 NP 难的旅行商问题，成绩位列班级前 15%。' },
        ],
      },
      {
        title: 'Battle of Balls',
        content: [{ en: '2D Game which got full mark in ECE 243 course', zh: '在 ECE 243 课程中获得满分的 2D 游戏' }],
        links: [{ text: { en: 'Github Repository', zh: 'GitHub 仓库' }, url: 'https://github.com/IronDumpling/BattleOfBalls' }],
      },
      {
        title: 'MindVoice',
        content: [{ en: 'Social Network which was developed by a 2 person team', zh: '由 2 人团队开发的社交网络' }],
        links: [{ text: { en: 'Github Repository', zh: 'GitHub 仓库' }, url: 'https://github.com/IronDumpling/MindVoice_Project' }],
      },
      {
        title: 'EmoNet',
        content: [{ en: 'Deep learning network which can recognize facial expression in webcam and generate corresponding emoji', zh: '能识别摄像头中的面部表情并生成对应表情符号的深度学习网络' }],
        links: [{ text: { en: 'Github Repository', zh: 'GitHub 仓库' }, url: 'https://github.com/IronDumpling/EmoNet' }],
      },
    ],
  },
  {
    title: { en: 'Software Engineer (Intern)', zh: '软件工程师（实习）' },
    subtitle: { en: 'Intel Corp., Programmable Solutions Group (PSG)', zh: 'Intel Corp.，可编程解决方案事业部（PSG）' },
    period: '5/2022-6/2023',
    details: [
      {
        title: { en: 'Role & Impact', zh: '职责与成果' },
        content: [
          { en: 'Streamlined chip analysis tools by combining PostgreSQL query tuning and Pandas preprocessing, reducing end-to-end analysis latency by 85%.', zh: '结合 PostgreSQL 查询调优和 Pandas 预处理，精简芯片分析工具，端到端分析延迟降低 85%。' },
          { en: 'Implemented Django-powered dynamic query features, enabling 20+ engineers to customize chip data visualizations.', zh: '基于 Django 实现动态查询功能，让 20 多位工程师可以自定义芯片数据的可视化。' },
          { en: 'Managed 10M+ Quartus chip database with PostgreSQL and integrated it into internal CI/CD regression pipelines.', zh: '用 PostgreSQL 管理超过 1000 万条记录的 Quartus 芯片数据库，并接入内部 CI/CD 回归流水线。' },
        ],
      },
      {
        title: { en: 'Technologies', zh: '技术栈' },
        content: ['Python, Django, PostgreSQL, Pandas, CI/CD'],
      },
    ],
  },
  {
    title: { en: 'Personal Game Projects', zh: '个人游戏项目' },
    subtitle: { en: 'Canada', zh: '加拿大' },
    period: '9/2022-8/2023',
    details: [
      {
        title: 'Candle Lighter',
        content: [{ en: 'A 45 degree 2.5D program puzzle solving game.', zh: '一款 45 度视角的 2.5D 编程解谜游戏。' }],
        links: [
          { text: { en: 'Github Repository', zh: 'GitHub 仓库' }, url: 'https://github.com/ECE496-Game-Project/Candle-Lighter' },
          { text: { en: 'Gameplay Demo', zh: '玩法演示' }, url: 'https://youtu.be/zvElcN9tpf8' },
        ],
      },
      {
        title: 'Backtrack',
        content: [{ en: 'A fixed-angle 3D level-based parkour game.', zh: '一款固定视角、按关卡推进的 3D 跑酷游戏。' }],
        links: [
          { text: { en: 'Github Repository', zh: 'GitHub 仓库' }, url: 'https://github.com/IronDumpling/Backtrack' },
          { text: { en: 'Gameplay Demo', zh: '玩法演示' }, url: 'https://www.bilibili.com/video/BV1Eu41147eL/?share_source=copy_web&vd_source=c4f4a62c77e5958d5b7b68dc5ac0b675' },
        ],
      },
      {
        title: 'Signal Android',
        content: [{ en: 'A third-person 2D survival game inspired by "Vampire Survivor" and "Backpack Heroes".', zh: '一款第三人称 2D 生存游戏，灵感来自《吸血鬼幸存者》和《背包英雄》。' }],
        links: [
          { text: { en: 'Github Repository', zh: 'GitHub 仓库' }, url: 'https://github.com/IronDumpling/signal-chariot' },
          { text: { en: 'Gameplay Demo', zh: '玩法演示' }, url: 'https://www.bilibili.com/video/BV1DBtzetEd2/?share_source=copy_web&vd_source=c4f4a62c77e5958d5b7b68dc5ac0b675' },
        ],
      },
    ],
  },
  {
    title: { en: 'Machine Learning Researcher (Intern)', zh: '机器学习研究员（实习）' },
    subtitle: { en: 'C-MORE Lab, Robotics Team', zh: 'C-MORE 实验室，机器人团队' },
    period: '5/2023-12/2023',
    details: [
      {
        title: { en: 'Multi-Agent Reinforcement Learning', zh: '多智能体强化学习' },
        content: [
          { en: 'Engineered a pipeline for converting 2D maps to 3D Gazebo environments using ROS and XML plugins, automating batch simulations for multi-robot scenarios.', zh: '使用 ROS 和 XML 插件搭建把 2D 地图转换为 3D Gazebo 环境的流水线，实现多机器人场景的批量仿真自动化。' },
          { en: 'Developed reinforcement learning-based exploration algorithms, improving multi-robot coverage efficiency by 45%.', zh: '开发基于强化学习的探索算法，多机器人覆盖效率提升 45%。' },
          { en: 'Applied Bayesian Optimization for robot parameter tuning, reducing trial count by 50% in real-world deployment scenarios.', zh: '用贝叶斯优化调整机器人参数，在真实部署场景中将试验次数减少 50%。' },
        ],
      },
      {
        title: { en: 'Technologies', zh: '技术栈' },
        content: [{ en: 'Python, PyTorch, ROS, Gazebo, Reinforcement Learning, Bayesian Optimization', zh: 'Python, PyTorch, ROS, Gazebo, 强化学习, 贝叶斯优化' }],
      },
    ],
  },
  {
    title: { en: 'Computer Engineering (BASc)', zh: '计算机工程（BASc）' },
    subtitle: { en: 'University of Toronto, Canada', zh: '多伦多大学，加拿大' },
    period: '9/2023-5/2024',
    details: [
      {
        title: { en: 'Key Projects', zh: '主要项目' },
        content: [
          { en: 'Wave Optics Education Website: Interactive physics simulations for wave optics education', zh: '波动光学教学网站：用于波动光学教学的交互式物理仿真' },
          { en: 'Dynamo/Cassandra-Style Distributed Key-Value Store: Consistent hashing, 3-replica redundancy, dynamic node management', zh: 'Dynamo/Cassandra 风格的分布式键值存储：一致性哈希、3 副本冗余、动态节点管理' },
          { en: 'LLVM-based SmallC Compiler: IR optimization, code generation, semantic analysis', zh: '基于 LLVM 的 SmallC 编译器：IR 优化、代码生成、语义分析' },
        ],
        links: [
          { text: { en: 'View Portfolio', zh: '查看作品集' }, url: '/portfolio' },
        ],
      },
    ],
  },
  {
    title: { en: 'Software Engineer (Full-time)', zh: '软件工程师（全职）' },
    subtitle: { en: 'Huawei Canada, Distributed Database Team (DDSM)', zh: '华为加拿大，分布式数据库团队（DDSM）' },
    period: '7/2024-7/2025',
    details: [
      {
        title: { en: 'Database Performance Optimization', zh: '数据库性能优化' },
        content: [
          { en: 'Accelerated TPC-H query runtime by 4.7× (28s → 6s, 1-node cluster) and 6.2× (28s → 4.5s, 3-node cluster) on GaussDB, a PostgreSQL-based database.', zh: '在基于 PostgreSQL 的 GaussDB 上，将 TPC-H 查询耗时缩短 4.7 倍（单节点集群 28 秒 → 6 秒）和 6.2 倍（3 节点集群 28 秒 → 4.5 秒）。' },
          { en: 'Optimized Parquet storage of GaussDB, boosting sysbench point-select TPS by 60% and reducing 3-node TPC-H performance to 5.8s.', zh: '优化 GaussDB 的 Parquet 存储，sysbench 点查询 TPS 提升 60%，3 节点 TPC-H 耗时降至 5.8 秒。' },
          { en: 'Extended the distributed query system utilizing a share-everything architecture on GaussDB, efficiently supporting SF-300 scale TPC-H workloads.', zh: '在 GaussDB 上扩展采用 share-everything 架构的分布式查询系统，高效支持 SF-300 规模的 TPC-H 负载。' },
        ],
      },
      {
        title: { en: 'DevOps & CI/CD', zh: 'DevOps 与 CI/CD' },
        content: [
          { en: 'Designed and implemented a 3-node Jenkins CI pipeline, completing 1,500+ automated runs.', zh: '设计并实现 3 节点 Jenkins CI 流水线，完成 1500 多次自动化运行。' },
          { en: 'Enabled 40+ engineers to validate code changes rapidly through automated testing infrastructure.', zh: '通过自动化测试基础设施，让 40 多位工程师能快速验证代码改动。' },
        ],
      },
      {
        title: { en: 'Technologies', zh: '技术栈' },
        content: [{ en: 'C++, PostgreSQL, Parquet, Jenkins, TPC-H Benchmarking, Distributed Systems', zh: 'C++, PostgreSQL, Parquet, Jenkins, TPC-H 基准测试, 分布式系统' }],
      },
    ],
  },
  {
    title: { en: 'Computer Engineering (MEng)', zh: '计算机工程（MEng）' },
    subtitle: { en: 'University of Toronto, Canada', zh: '多伦多大学，加拿大' },
    period: '9/2024-12/2025',
    details: [
      {
        title: { en: 'Graduate Studies', zh: '研究生学习' },
        content: [
          { en: 'Master of Engineering in Computer Engineering', zh: '计算机工程工程硕士' },
          { en: 'Expected graduation: December 2025', zh: '预计毕业时间：2025 年 12 月' },
          { en: 'Focus: Distributed Systems, Databases, and Performance Engineering', zh: '方向：分布式系统、数据库和性能工程' },
        ],
      },
      {
        title: { en: 'Key Projects', zh: '主要项目' },
        content: [
          { en: 'Database Management System: LSM tree, B+ tree, Bloom filter, buffer pool with LRU eviction, extendable hash table', zh: '数据库管理系统：LSM 树、B+ 树、布隆过滤器、带 LRU 淘汰的缓冲池、可扩展哈希表' },
          { en: 'Anime Goods E-Commerce Platform: Full-stack web application with user authentication, shopping cart, payment integration', zh: '动漫周边电商平台：全栈 Web 应用，包含用户认证、购物车和支付集成' },
          { en: 'ClickHouse-HE: Distributed Query on Homomorphic Encrypted Database', zh: 'ClickHouse-HE：同态加密数据库上的分布式查询' },
          { en: 'Redis Performance Enhancement with RDMA & VMA', zh: '用 RDMA 和 VMA 提升 Redis 性能' },
        ],
        links: [
          { text: { en: 'View Portfolio', zh: '查看作品集' }, url: '/portfolio' },
        ],
      },
    ],
  },
  {
    title: { en: 'Software Engineer (Full-time)', zh: '软件工程师（全职）' },
    subtitle: { en: 'ArcTrade, Infrastructure Team', zh: 'ArcTrade，基础设施团队' },
    period: { en: '8/2025-Present', zh: '8/2025-至今' },
    details: [
      {
        title: { en: 'Workflow Engine System', zh: '工作流引擎系统' },
        content: [
          { en: 'Designing and implementing the workflow engine system.', zh: '设计并实现工作流引擎系统。' },
          { en: 'Building robust infrastructure for workflow orchestration and execution.', zh: '为工作流编排和执行搭建稳健的基础设施。' },
          { en: 'Optimizing system performance and reliability for high-throughput scenarios.', zh: '针对高吞吐场景优化系统性能和可靠性。' },
        ],
      },
      {
        title: { en: 'Technologies', zh: '技术栈' },
        content: [{ en: 'Workflow Orchestration, Backend Development, C#', zh: '工作流编排, 后端开发, C#' }],
      },
    ],
  },
  {
    title: { en: 'Future Goals', zh: '未来目标' },
    subtitle: { en: 'Career Aspirations', zh: '职业愿景' },
    period: { en: 'Ongoing', zh: '持续进行' },
    details: [
      {
        title: { en: 'Professional Vision', zh: '职业愿景' },
        content: [
          { en: 'Bridging technical excellence with creative vision to build systems and products that impact millions.', zh: '把技术上的卓越与创造性的愿景结合起来，构建影响数百万人的系统和产品。' },
          { en: 'Becoming an exceptional video game producer, creating immersive and innovative gaming experiences.', zh: '成为一名出色的游戏制作人，打造沉浸而创新的游戏体验。' },
        ],
      },
    ],
  },
]

export default function ExperiencesSection() {
  const lp = useLocalePath()
  const locale = useLocale()
  const t = useT()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleExperience = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="experiences-section" className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h2 className="section-title">{t.experiences.heading}</h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700 transform md:-translate-x-1/2" />

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary-600 dark:bg-primary-400 rounded-full transform -translate-x-1/2 z-10" />

                <div className="ml-12 md:ml-0 md:grid md:grid-cols-2 gap-8">
                  {/* Left side (even) or Right side (odd) */}
                  <div className={`md:${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 order-2'}`}>
                    <button
                      onClick={() => toggleExperience(index)}
                      className="w-full text-left md:text-right"
                    >
                      <h3 className="text-xl font-semibold mb-1 flex items-center gap-2 md:justify-end">
                        {pick(exp.title, locale)}
                        <svg
                          className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-90' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{pick(exp.subtitle, locale)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {pick(exp.period, locale)}
                      </p>
                    </button>
                  </div>

                  {/* Right side (even) or Left side (odd) */}
                  <div className={`md:${index % 2 === 0 ? 'pl-8' : 'pr-8 order-1'}`}>
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        openIndex === index
                          ? 'max-h-[2000px] opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div
                        className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6 shadow-lg transform-gpu origin-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                          openIndex === index
                            ? 'scale-100 translate-y-0'
                            : 'scale-90 translate-y-4'
                        }`}
                      >
                        {exp.details.map((detail, detailIndex) => (
                          <div key={detailIndex}>
                            <h4 className="font-semibold mb-2">{pick(detail.title, locale)}</h4>
                            {detail.content.map((item, itemIndex) => (
                              <p key={itemIndex} className="text-gray-700 dark:text-gray-300 mb-1">
                                {pick(item, locale)}
                              </p>
                            ))}
                            {detail.links && (
                              <div className="mt-2 space-x-2">
                                {detail.links.map((link, linkIndex) => (
                                  <a
                                    key={linkIndex}
                                    href={withBasePath(link.url.startsWith('/portfolio') ? lp(link.url) : link.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                                  >
                                    {pick(link.text, locale)}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

