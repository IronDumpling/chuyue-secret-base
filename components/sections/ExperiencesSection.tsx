'use client'

import { useState } from 'react'

interface ExperienceItem {
  title: string
  subtitle: string
  period: string
  details: Array<{
    title: string
    content: string[]
    links?: Array<{ text: string; url: string }>
  }>
}

const experiences: ExperienceItem[] = [
  {
    title: 'Science Major',
    subtitle: 'High School Affiliated to Southwest University, China',
    period: '2016-2019',
    details: [
      {
        title: 'IELTS',
        content: ['Average: 7', 'Writing & Reading: 8.5'],
      },
    ],
  },
  {
    title: 'Civil Engineering',
    subtitle: 'University of Toronto, Canada',
    period: '9/2019-5/2020',
    details: [
      {
        title: 'Group Project: Toronto Island Flood Control',
        content: ['CDS got full mark', 'Played role as project manager'],
      },
    ],
  },
  {
    title: 'Computer Engineering',
    subtitle: 'University of Toronto, Canada',
    period: '9/2020-5/2023',
    details: [
      {
        title: 'GPA',
        content: ['Cumulative GPA: 3.75', 'Annual GPA: 3.91'],
      },
      {
        title: "Dean's List",
        content: ['On the list in 4 semesters'],
      },
      {
        title: 'Course Highlights',
        content: [
          'ECE345H1 Data Structure & Algorithm: 91/100 A+',
          'CSC317H1 Computer Graphics: 94/100 A+',
          'ECE361H1 Computer Networks: 87/100 A',
          'ECE297H1 Software Design: 86/100 A',
        ],
      },
      {
        title: 'Easy Go Map',
        content: [
          'An offline GIS software, presenting global urban map data with navigation function.',
          'Build city maps with from scratch. Develop a navigator with A* algorithm which provides driving instructions. Apply greedy algorithms, simulated annealing, and multi-threading to tackle the NP-hard Traveling Salesman Problem, achieving top 15% in the class.',
        ],
      },
      {
        title: 'Battle of Balls',
        content: ['2D Game which got full mark in ECE 243 course'],
        links: [{ text: 'Github Repository', url: 'https://github.com/IronDumpling/BattleOfBalls' }],
      },
      {
        title: 'MindVoice',
        content: ['Social Network which was developed by a 2 person team'],
        links: [{ text: 'Github Repository', url: 'https://github.com/IronDumpling/MindVoice_Project' }],
      },
      {
        title: 'EmoNet',
        content: ['Deep learning network which can recognize facial expression in webcam and generate corresponding emoji'],
        links: [{ text: 'Github Repository', url: 'https://github.com/IronDumpling/EmoNet' }],
      },
    ],
  },
  {
    title: 'PEY Internship',
    subtitle: 'Intel Corp., Canada',
    period: '5/2022-6/2023',
    details: [
      {
        title: 'Intel Corp. PSG Group',
        content: ["Intel's FPGAs and programmable solution group."],
      },
      {
        title: 'Software Engineer',
        content: [
          'Internship at timing modeling team.',
          'Responsible for developing a website and tools for analyzing and comparing Quartus chip models and actual chip data using Python.',
          'Utilizing tools such as Pandas and PostgreSQL for database processing.',
        ],
      },
    ],
  },
  {
    title: 'Personal Game Projects',
    subtitle: 'Canada',
    period: '9/2022-8/2023',
    details: [
      {
        title: 'Candle Lighter',
        content: ['A 45 degree 2.5D program puzzle solving game.'],
        links: [
          { text: 'Github Repository', url: 'https://github.com/ECE496-Game-Project/Candle-Lighter' },
          { text: 'Gameplay Demo', url: 'https://youtu.be/zvElcN9tpf8' },
        ],
      },
      {
        title: 'Backtrack',
        content: ['A fixed-angle 3D level-based parkour game.'],
        links: [
          { text: 'Github Repository', url: 'https://github.com/IronDumpling/Backtrack' },
          { text: 'Gameplay Demo', url: 'https://www.bilibili.com/video/BV1Eu41147eL/?share_source=copy_web&vd_source=c4f4a62c77e5958d5b7b68dc5ac0b675' },
        ],
      },
      {
        title: 'Backpack System',
        links: [{ text: 'Github Repository', url: 'https://github.com/IronDumpling/backpack-system' }],
        content: [],
      },
      {
        title: 'Over-Clock Survivor',
        content: ['A third-person 3D survival game inspired by "Vampire Survivor" and "Backpack Heroes".'],
        links: [{ text: 'Github Repository', url: 'https://github.com/IronDumpling/over-clock-survivor-3d' }],
      },
    ],
  },
  {
    title: 'Summer Research',
    subtitle: 'C-MORE Lab, Canada',
    period: '5/2023-9/2023',
    details: [
      {
        title: 'Multi-Agent Reinforcement Learning',
        content: [
          'Build and train reinforcement learning models to solve multi-robot exploration tasks in unknown areas.',
          'Use Bayesian optimization to determine the optimal robot configuration.',
          'Test the effectiveness of the optimization process using physical simulation environment built by Gazebo and ROS.',
        ],
      },
    ],
  },
  {
    title: 'Computer Engineering',
    subtitle: 'University of Toronto, Canada',
    period: '9/2023-5/2024',
    details: [
      {
        title: 'Wave Optics Education Website',
        content: [
          'Simulated interactive and editable scenes generated through physical algorithms, facilitating students\' comprehension of wave optics.',
        ],
        links: [
          { text: 'Website Page', url: 'https://ece496-game-project.github.io/' },
          { text: 'Github Repository', url: 'https://github.com/ECE496-Game-Project/ece496-game-project.github.io' },
        ],
      },
    ],
  },
  {
    title: 'Future',
    subtitle: '',
    period: '5/2024-',
    details: [
      {
        title: 'Who Knows?',
        content: [],
      },
    ],
  },
]

export default function ExperiencesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleExperience = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="experiences-section" className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h2 className="section-title">Experiences</h2>
        <span className="section-subtitle">My personal journey</span>

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
                        {exp.title}
                        <svg
                          className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-90' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{exp.subtitle}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {exp.period}
                      </p>
                    </button>
                  </div>

                  {/* Right side (even) or Left side (odd) */}
                  <div className={`md:${index % 2 === 0 ? 'pl-8' : 'pr-8 order-1'}`}>
                    {openIndex === index && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
                        {exp.details.map((detail, detailIndex) => (
                          <div key={detailIndex}>
                            <h4 className="font-semibold mb-2">{detail.title}</h4>
                            {detail.content.map((item, itemIndex) => (
                              <p key={itemIndex} className="text-gray-700 dark:text-gray-300 mb-1">
                                {item}
                              </p>
                            ))}
                            {detail.links && (
                              <div className="mt-2 space-x-2">
                                {detail.links.map((link, linkIndex) => (
                                  <a
                                    key={linkIndex}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                                  >
                                    {link.text}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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

