import Link from 'next/link'

const stats = [
  { value: '05+', label: 'Years\nexperiences' },
  { value: '08+', label: 'Completed\nprojects' },
  { value: '07+', label: 'Skilled\nlanguages' },
  { value: '07+', label: 'Subjects\nKnowledge' },
]

export default function AboutSection() {
  return (
    <section id="about" className="section bg-white dark:bg-gray-900">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        <span className="section-subtitle">My introduction</span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src="/images/aboutImg1.jpeg"
                alt="About me"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg mt-8">
              <img
                src="/images/aboutImg2.jpeg"
                alt="About me"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              An undergraduate computer engineer who is currently studying in University of Toronto.
              I am interested in <strong className="text-primary-600 dark:text-primary-400">client software, website frontend, gameplay development and machine learning</strong>.
              With extensive skills in programming and massive experiences in group projects, I am competent for all kinds of software work.
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

            {/* Download CV Button */}
            <Link
              href="/pdf/Chuyue-Zhang-CV.pdf"
              download
              className="button-primary inline-flex items-center gap-2"
            >
              Download CV
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

