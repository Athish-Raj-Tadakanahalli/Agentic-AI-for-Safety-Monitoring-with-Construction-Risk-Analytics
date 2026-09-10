/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          hover: '#334155',
        },
        risk: {
          low: '#10B981',      // emerald-500
          medium: '#F59E0B',   // amber-500
          high: '#F97316',     // orange-500
          critical: '#EF4444', // red-500
          extreme: '#7F1D1D'   // red-900
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
