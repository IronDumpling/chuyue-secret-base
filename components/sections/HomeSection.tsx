import Link from 'next/link'

const socialLinks = [
  { href: 'https://github.com/IronDumpling', icon: 'github', label: 'GitHub' },
  { href: 'https://twitter.com/Irondump1ing', icon: 'twitter', label: 'Twitter' },
  { href: 'https://www.linkedin.com/in/charlie-zhang-27216a207/', icon: 'linkedin', label: 'LinkedIn' },
  { href: 'https://www.zhihu.com/people/zhang-chu-yue-13-47', icon: 'zhihu', label: 'Zhihu' },
  { href: 'https://space.bilibili.com/26023645', icon: 'bilibili', label: 'Bilibili' },
  { href: 'https://www.pixiv.net/users/56079335', icon: 'pixiv', label: 'Pixiv' },
]

export default function HomeSection() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Social Links */}
          <div className="flex flex-col items-center md:items-start space-y-6 order-2 md:order-1">
            <div className="flex flex-col md:flex-row gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow hover:scale-110 transform transition-transform"
                  aria-label={social.label}
                >
                  {social.icon === 'github' && (
                    <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  {social.icon === 'twitter' && (
                    <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  )}
                  {social.icon === 'linkedin' && (
                    <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  {social.icon === 'zhihu' && (
                    <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.344 17.963l-1.688 1.074-2.131-3.644-2.771 1.005 1.933-2.097-4.215.048 5.428-5.428L3.99 6.002l2.464 2.453L3.99 3.002l8.354 8.354-2.654 2.607zm8.172-2.982l-1.933 2.097 2.771-1.005 2.131 3.644 1.688-1.074-2.654-2.607 8.354-8.354-2.464 2.453 2.464 2.453-5.428 5.428 4.215-.048z"/>
                    </svg>
                  )}
                  {social.icon === 'bilibili' && (
                    <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.381 18.056c-1.508 0-2.956-.295-4.381-.832l-.425-.141c-.285-.095-.59-.141-.893-.141-.304 0-.608.046-.893.141l-.425.141c-1.425.537-2.873.832-4.381.832H2.106v-1.5h4.256c1.306 0 2.581-.245 3.806-.729l.425-.141c.285-.095.59-.141.893-.141.304 0 .608.046.893.141l.425.141c1.225.484 2.5.729 3.806.729h4.256v1.5h-4.256zm-1.5-3.75c-1.508 0-2.956-.295-4.381-.832l-.425-.141c-.285-.095-.59-.141-.893-.141-.304 0-.608.046-.893.141l-.425.141c-1.425.537-2.873.832-4.381.832H2.106v-1.5h4.256c1.306 0 2.581-.245 3.806-.729l.425-.141c.285-.095.59-.141.893-.141.304 0 .608.046.893.141l.425.141c1.225.484 2.5.729 3.806.729h4.256v1.5h-4.256z"/>
                    </svg>
                  )}
                  {social.icon === 'pixiv' && (
                    <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.935 2.1c-.947 0-1.713.768-1.713 1.713v16.374c0 .947.768 1.713 1.713 1.713h14.13c.947 0 1.713-.768 1.713-1.713V3.813c0-.947-.768-1.713-1.713-1.713H4.935zm.57 1.142h12.99c.315 0 .57.255.57.57v14.376c0 .315-.255.57-.57.57H5.505a.57.57 0 01-.57-.57V3.812c0-.315.255-.57.57-.57zm1.142 2.856v10.284h10.284V6.098H6.647zm1.142 1.142h8v8H7.789v-8zm1.713 1.713v4.574h4.574v-4.574H9.502z"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>

            {/* Profile Image */}
            <div className="w-64 h-64 rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-primary-400 to-primary-600">
              <img
                src="/images/profileImg.jpeg"
                alt="Chuyue Zhang"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center md:text-left order-1 md:order-2">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Hi, I am Chuyue
            </h1>
            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
              A computer engineer
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Undergraduate computer engineering student at University of Toronto.
            </p>
            <Link
              href="/contact"
              className="button-primary inline-flex items-center gap-2"
            >
              Contact Me
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 flex justify-center">
          <a
            href="#about"
            className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors animate-bounce"
          >
            <span className="text-sm mb-2">Scroll down</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

