/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#0B0F1A',
        'bg-header': '#111827',
        'bg-card': '#1A2238',
        'primary': '#00A8FF',
        'highlight': '#FFD400',
        'glow': '#00F5FF',
        'success': '#00FF9C',
        'error': '#FF4C4C',
      }
    },
  },
  plugins: [],
}