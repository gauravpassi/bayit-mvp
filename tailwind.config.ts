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
          blue:        '#1A3D6B',
          'blue-light': '#2B5BA8',
          'blue-dark':  '#0D2540',
          gold:        '#C8973F',
          'gold-light': '#DEB266',
          'gold-dark':  '#A67A2E',
          cream:       '#F8F3EB',
          dark:        '#0D1B2A',
          gray:        '#5A6472',
          border:      '#E5E0D8',
          surface:     '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'slide-up':   'slideUp 0.6s ease-out forwards',
        'slide-right':'slideRight 0.35s ease-out forwards',
        'pulse-gold': 'pulseGold 2.5s ease-in-out infinite',
        'bounce-subtle': 'bounceSub 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(200,151,63,0.5)' }, '50%': { boxShadow: '0 0 0 12px rgba(200,151,63,0)' } },
        bounceSub: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
      },
      backgroundImage: {
        'gradient-bayit': 'linear-gradient(135deg, #0D1B2A 0%, #1A3D6B 60%, #2B5BA8 100%)',
        'gradient-gold':  'linear-gradient(135deg, #A67A2E 0%, #C8973F 50%, #DEB266 100%)',
        'gradient-card':  'linear-gradient(180deg, rgba(13,27,42,0) 40%, rgba(13,27,42,0.85) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
