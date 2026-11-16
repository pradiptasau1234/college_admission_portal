/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0b4a8f',
          dark: '#083563',
          light: '#eaf2fb',
          accent: '#2b78d4'
        },
        slate: {
          bg: '#f4f7fb',
          line: '#d5deea',
          ink: '#1b2733',
          muted: '#5a6b7d'
        }
      }
    },
  },
  plugins: [],
}
