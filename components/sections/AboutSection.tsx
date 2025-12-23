import Link from 'next/link'
import { withBasePath } from '@/lib/utils'

const stats = [
  { value: '05+', label: 'Years\nexperiences' },
  { value: '08+', label: 'Completed\nprojects' },
  { value: '07+', label: 'Skilled\nlanguages' },
  { value: '07+', label: 'Subjects\nKnowledge' },
]

export default function AboutSection() {
  return (
    <section id="about-section" className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h2 className="section-title">About Me</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative rounded-lg overflow-hidden shadow-lg h-64">
              <img
                src={withBasePath('/images/about/aboutImg1.jpg')}
                alt="About me"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg mt-8 h-64">
              <img
                src={withBasePath('/images/about/aboutImg2.jpg')}
                alt="About me"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
              Currently working as a Software Engineer at ArcTrade, I view myself as a system architect across different mediums.
              My passion lies in <strong className="text-primary-600 dark:text-primary-400">system design, AI agent development, and game creation</strong>.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              For me, code is more than just logic. It's a tool to bridge the gap between technology and emotion. Whether I'm building a complex software 
              architecture or designing a game mechanic, my goal is the same: to deliver robust systems that provide seamless experiences and bring genuine joy to the user.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* View Resume Button */}
            <a
              href={withBasePath('/pdf/Chuyue_Zhang_Resume.pdf')}
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary inline-flex items-center gap-2"
            >
              View Resume
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

