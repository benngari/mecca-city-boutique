/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1B3D',
          50: '#EEF1F8',
          100: '#DBE1F0',
          200: '#B0BEDE',
          300: '#8598C9',
          400: '#4C63A0',
          500: '#233062',
          600: '#1A2450',
          700: '#141B3E',
          800: '#0F1B3D',
          900: '#0A1129',
        },
        electric: {
          DEFAULT: '#2D8FE0',
          50: '#EAF5FE',
          100: '#CFE9FC',
          400: '#4FA5EA',
          500: '#2D8FE0',
          600: '#1D6FB8',
        },
        emerald: {
          DEFAULT: '#16A34A',
        },
        gold: {
          DEFAULT: '#F5B301',
        },
        cream: '#FBF9F5',
        charcoal: '#171717',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
      },
      backgroundImage: {
        'stitch': "repeating-linear-gradient(90deg, currentColor 0, currentColor 6px, transparent 6px, transparent 12px)",
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
