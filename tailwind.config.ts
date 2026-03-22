import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bayit: {
          // Primary — muted steel blue
          blue:          '#5B9BD5',
          'blue-dark':   '#4A84BE',
          'blue-light':  '#7FB3E0',
          'blue-soft':   '#EBF4FC',
          'blue-softer': '#F0F7FF',

          // Warm neutrals — trust, belonging
          cream:       '#FAF7F2',   // warm ivory — primary section bg
          'cream-dark':'#EDE8E0',   // deeper warm cream
          gold:        '#C9A96E',   // subtle luxury accent
          'gold-light':'#E8D5B0',
          'gold-muted':'#F5EFE3',   // very light gold tint

          // Backgrounds
          bg:       '#F4F7FA',
          surface:  '#FFFFFF',
          surface2: '#F8FAFB',

          // Text
          dark:  '#1A1C2E',
          gray:  '#5A6072',
          muted: '#9BA3AF',

          // Borders
          border:     '#E4E8EF',
          'border-lt':'#F0F3F7',

          // Legacy
          'blue-50': '#EBF4FC',
        },
      },
      fontFamily: {
        // DM Sans — humanist, warm, readable
        sans:  ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        // Playfair Display — serif for headings, signals luxury + trust
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card':       '0 1px 4px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.04)',
        'panel':      '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)',
        'popup':      '0 4px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)',
        'chat':       '-4px 0 40px rgba(26,28,46,0.10)',
        'gold':       '0 4px 14px rgba(201,169,110,0.25)',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out forwards',
        'slide-up':      'slideUp 0.5s ease-out forwards',
        'pulse-blue':    'pulseBlue 2.5s ease-in-out infinite',
        'bounce-subtle': 'bounceSub 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseBlue: { '0%,100%': { boxShadow: '0 0 0 0 rgba(91,155,213,0.45)' }, '50%': { boxShadow: '0 0 0 12px rgba(91,155,213,0)' } },
        bounceSub: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      backgroundImage: {
        'map-grid': "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.85) 59px,rgba(255,255,255,0.85) 63px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.85) 59px,rgba(255,255,255,0.85) 63px)",
      },
    },
  },
  plugins: [],
};

export default config;
