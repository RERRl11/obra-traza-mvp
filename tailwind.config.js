/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: { 50: '#f0f4fb', 100: '#dfe8f6', 200: '#bdcfee', 300: '#96b1df', 400: '#668cc7', 500: '#3768ad', 600: '#245294', 700: '#12377B', 800: '#102f69', 900: '#12377B', 950: '#0b214b' },
        unt: { blue: '#12377B', gold: '#E6AD09' },
      },
      fontSize: { xs: ['0.875rem', { lineHeight: '1.45rem' }] },
    },
  },
  plugins: [],
}