/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      // Motion tokens. The same values live in globals.css as --ease-* / --dur-* so scripts can read them.
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.2, 0, 0, 1)',
        spring: 'cubic-bezier(0.32, 1.2, 0.4, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms',
      },
      // Used with `motion-safe:` so they switch off for visitors who asked for less motion.
      keyframes: {
        // A list or grid coming back after the filter changed.
        'feed-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        // The second menu level appearing.
        'fade-slide': {
          '0%': { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // The table-of-contents drawer rising from the bottom on phones.
        'drawer-in': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'none' },
        },
        // The table-of-contents sidebar sliding in from the left on tablets.
        'panel-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'none' },
        },
        // The corner menu's items popping up one after another.
        'dial-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        // Exits mirror the entrances above so a layer leaves the way it arrived.
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'drawer-out': {
          '0%': { transform: 'none' },
          '100%': { transform: 'translateY(100%)' },
        },
        'panel-out': {
          '0%': { transform: 'none' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'dial-out': {
          '0%': { opacity: '1', transform: 'none' },
          '100%': { opacity: '0', transform: 'translateY(8px) scale(0.8)' },
        },
      },
      animation: {
        'feed-in': 'feed-in 280ms cubic-bezier(0.2, 0, 0, 1) both',
        'fade-slide': 'fade-slide 200ms cubic-bezier(0.2, 0, 0, 1) both',
        'fade-in': 'fade-in 200ms cubic-bezier(0.2, 0, 0, 1) both',
        // No overshoot on edge-anchored sheets: it would open a gap against the screen edge.
        'drawer-in': 'drawer-in 350ms cubic-bezier(0.2, 0, 0, 1) both',
        'panel-in': 'panel-in 350ms cubic-bezier(0.2, 0, 0, 1) both',
        'dial-in': 'dial-in 180ms cubic-bezier(0.32, 1.2, 0.4, 1) both',
        // A page arriving; `backwards`, not `both`, so nothing is held once it has finished.
        'page-in': 'feed-in 350ms cubic-bezier(0.2, 0, 0, 1) backwards',
        'fade-out': 'fade-out 200ms cubic-bezier(0.2, 0, 0, 1) both',
        'drawer-out': 'drawer-out 250ms cubic-bezier(0.2, 0, 0, 1) both',
        'panel-out': 'panel-out 250ms cubic-bezier(0.2, 0, 0, 1) both',
        'dial-out': 'dial-out 150ms cubic-bezier(0.2, 0, 0, 1) both',
      },
    },
  },
  plugins: [],
}

