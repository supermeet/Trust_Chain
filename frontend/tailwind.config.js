/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      colors: {
        canvas: '#080A0F',
        surface: {
          1: '#0D1018',
          2: '#141820',
          3: '#1C2230',
        },
        accent: '#10B981',
        danger: '#FF4D6D',
        success: '#10B981',
        warn: '#F59E0B',
        gold: '#C9A84C',
      },
    },
  },
  plugins: [],
}
