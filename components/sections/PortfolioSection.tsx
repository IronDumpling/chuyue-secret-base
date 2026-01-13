import { withBasePath } from '@/lib/utils'
import Link from 'next/link'

export default function PortfolioSection() {
  return (
    <section id="skills-section" className="section bg-gray-50 dark:bg-gray-800">
      <div className="container">
        <h2 className="section-title">Portfolio</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Explore my latest projects.
            </p>
            
            <Link 
              href={withBasePath('/portfolio')} 
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              View Full Portfolio
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}