import { withBasePath } from '@/lib/utils'

export default function HomeSection() {
  return (
    <section
      id="home-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900"
    >
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[110px] bg-primary-400/30 dark:bg-[color:var(--identity-primary)]/25" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[110px] bg-blue-200/40 dark:bg-white/10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl ring-1 ring-white/10 bg-white/5">
              <img
                src={withBasePath('/images/home/profileImg2.jpeg')}
                alt="Chuyue Zhang"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 text-gray-900 dark:text-white">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Hi, I am{' '}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent">
                Chuyue
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto font-light">
              Who am I?
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 flex justify-center">
          <a
            href="#identity-card-section"
            className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors animate-bounce"
          >
            <span className="text-sm tracking-widest uppercase mb-2">Scroll down</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

