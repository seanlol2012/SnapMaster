/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#030303',
          800: '#080808',
          700: '#0d0d0d',
          600: '#111111',
          500: '#1a1a1a',
          400: '#262626',
        },
        muted: {
          DEFAULT: '#a1a1aa',
          foreground: '#71717a',
          subtle: '#3f3f46',
        },
        accent: {
          DEFAULT: '#5b5bd4',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.15)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'border-beam': 'border-beam 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'shimmer': 'shimmer 6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'border-beam': {
          '0%, 100%': { transform: 'translateX(-100%) rotate(var(--beam-angle, 0deg))' },
          '50%': { transform: 'translateX(100%) rotate(var(--beam-angle, 0deg))' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%, 100%': { backgroundPosition: '200% 0' },
          '50%': { backgroundPosition: '-200% 0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(91,91,212,0.1), 0 0 60px rgba(91,91,212,0.05)' },
          '100%': { boxShadow: '0 0 35px rgba(91,91,212,0.2), 0 0 80px rgba(91,91,212,0.08)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
