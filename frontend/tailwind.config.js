/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finance: {
          50: '#F3FBF2',
          100: '#DFF6E3',
          200: '#BDECC6',
          300: '#8CDD9B',
          400: '#57CF71',
          500: '#21B14B',
          600: '#0D8A3B',
          700: '#096A2F',
          800: '#074D24',
          900: '#042B16',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(11, 129, 58, 0.10)',
        card: '0 12px 30px rgba(16, 24, 40, 0.06)',
      },
      backgroundImage: {
        'finance-radial': 'radial-gradient(circle at top left, rgba(33, 177, 75, 0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(33, 177, 75, 0.12), transparent 28%)',
      },
    },
  },
  plugins: [],
}

