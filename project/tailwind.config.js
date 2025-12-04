/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        tan: {
          50: '#f7f4f0',
          100: '#f0ebe3',
          200: '#e8dfd1',
          300: '#dccfbb',
          400: '#d0bfa5',
          500: '#c4af8f',
          600: '#b89f79',
          700: '#9a856a',
          800: '#7c6b55',
          900: '#5e5140',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#c9941d',
          600: '#a67c1a',
          700: '#8b6914',
          800: '#6f5410',
          900: '#5a430d',
        },
      },
      fontFamily: {
        sans: ['Spectral', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
};
