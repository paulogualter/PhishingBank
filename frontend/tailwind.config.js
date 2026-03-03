/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A3C5E',
        secondary: '#00A86B',
        accent: '#FFD700',
        background: '#F5F7FA',
      }
    },
  },
  plugins: [],
}
