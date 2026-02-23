/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c3dafe', 300: '#a4bcfd',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
        surface: {
          light: '#fbfdf8',
          dark: '#121212',
          darkElevated: '#1e1e1e',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, box-shadow, transform, filter, backdrop-filter',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        springUp: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        springDown: {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.95) translateY(20px)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-out': 'fadeOut 0.3s ease-in forwards',
        'spring-up': 'springUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spring-down': 'springDown 0.3s ease-in forwards',
      }
    },
  },
  plugins: [],
}