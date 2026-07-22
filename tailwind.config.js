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
        'scale-in-slow': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slower': 'spin 15s linear infinite',
        'drift': 'drift 6s ease-in-out infinite',
        'drift-slow': 'drift 10s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'breath': 'breath 4s ease-in-out infinite',
        'grid-scroll': 'gridScroll 20s linear infinite',
        'satellite-sweep': 'satelliteSweep 6s ease-in-out infinite',
        'particle-float': 'particleFloat 8s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'card-enter': 'cardEnter 0.5s ease-out forwards',
        'zoom-in': 'zoomIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
        drift: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '33%': { transform: 'translateY(-4px) translateX(2px)' },
          '66%': { transform: 'translateY(2px) translateX(-2px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        breath: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.15' },
        },
        gridScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(40px)' },
        },
        satelliteSweep: {
          '0%': { transform: 'translateX(-100%) translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100vw) translateY(100vh)', opacity: '0' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-120px) translateX(20px)', opacity: '0' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(10vh)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
