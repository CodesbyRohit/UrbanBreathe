/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7fe',
          100: '#dcecfb',
          200: '#c0dff9',
          300: '#94cbf5',
          400: '#60aeef',
          500: '#3b91e8',
          600: '#2675dc',
          700: '#1f62cb',
          800: '#1f4fa5',
          900: '#1e4482',
          950: '#152b50',
        },
        /* AQI status badge colors — darkened from Tailwind defaults to meet WCAG AA 4.5:1 on white */
        red: { 500: '#b91c1c' },
        orange: { 500: '#c2410c' },
        amber: { 500: '#b45309', 600: '#92400e' },
        lime: { 600: '#4d7c0f' },
        sky: { 500: '#0369a1', 600: '#0369a1' },
        purple: { 500: '#7c3aed', 600: '#7c3aed' },
        /* teal-600 darkened from #0d9488 (4.3:1) to #0f766e (5.5:1) for small text on white */
        teal: {
          50: '#effcf9',
          100: '#d7f7f0',
          200: '#b0efe1',
          300: '#7ae2cd',
          400: '#42cdb3',
          500: '#1fb09a',
          600: '#0f766e',
          700: '#147166',
          800: '#155a53',
          900: '#164b46',
          950: '#072d2c',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
