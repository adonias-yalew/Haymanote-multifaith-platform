/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        background: {
          DEFAULT: '#F8FAFC',
          50: '#FFFFFF',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#CBD5E1',
        },
        beige: {
          DEFAULT: '#E2E8F0',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
        },
        sage: {
          DEFAULT: '#14B8A6',
          light: '#99F6E4',
          dark: '#0F766E',
        },
        warm: {
          white: '#FFFFFF',
          gray: '#94A3B8',
          dark: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 10px 30px -18px rgba(15, 23, 42, 0.35)',
        'soft-lg': '0 18px 48px -28px rgba(15, 23, 42, 0.42)',
        'card': '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -24px rgba(15, 23, 42, 0.35)',
        'card-hover': '0 18px 48px -28px rgba(15, 23, 42, 0.42)',
        'hover': '0 18px 48px -28px rgba(15, 23, 42, 0.42)',
        'elevated': '0 24px 70px -32px rgba(15, 23, 42, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-soft': 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 50%, #F8FAFC 100%)',
        'gradient-green': 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.4s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '500px' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  safelist: [
    { pattern: /^bg-(indigo|amber|emerald|blue)-50$/ },
    { pattern: /^border-(indigo|amber|emerald|blue)-200\/60$/ },
    { pattern: /^text-indigo-600$/ },
    { pattern: /^bg-(indigo|amber|emerald|blue)-600$/ },
    { pattern: /^hover:bg-(indigo|amber|emerald|blue)-700$/ },
    { pattern: /^from-(indigo|amber|emerald|blue)-600$/ },
    { pattern: /^from-(indigo|amber|emerald|blue)-500\/5$/ },
    { pattern: /^to-(purple|teal|cyan|orange)-600$/ },
    { pattern: /^ring-(indigo|amber|emerald|blue)-500$/ },
    { pattern: /^shadow-(indigo|amber|emerald|blue)-500\/2[05]$/ },
  ],
  plugins: [],
}
