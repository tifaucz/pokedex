/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DC0A2D',
        grayscale: {
          dark: '#1D1D1D',
          medium: '#666666',
          light: '#E0E0E0',
          background: '#EFEFEF',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'inner-2dp': 'inset 0px 1px 3px 1px rgba(0, 0, 0, 0.25)',
        'drop-2dp': '0px 1px 3px 1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
