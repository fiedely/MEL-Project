/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lab-white': '#FDFDFD',
        'lab-lavender': '#E6E6FA',
        'lab-blue': '#D4F1F4',
        'lab-dark-blue': '#75E6DA',
        'lab-text': '#4A5568',
        'lab-border': '#E2E8F0',
      },
      boxShadow: {
        'lab': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}