/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d4ff',
          300: '#92b2ff',
          400: '#5f87ff',
          500: '#3b5bff',
          600: '#1e35f0',
          700: '#1826d6',
          800: '#1a22ae',
          900: '#1c2389',
        },
        dmk:  '#E53935',
        admk: '#43A047',
        tvk:  '#A67C00',
        ntk:  '#b31818',
        inc:  '#1565C0',
        bjp:  '#FF6F00',
        pmk:  '#FFB300',
        vcк:  '#1E90FF',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
