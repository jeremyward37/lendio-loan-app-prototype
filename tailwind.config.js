/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0800A6',
          button: '#192526',
        },
        neutral: {
          50: '#EAEBEB',
          200: '#C0C3C3',
          500: '#727879',
          800: '#2F3637',
        },
        lendio: {
          border: '#DADFE3',
          focus: 'rgb(116, 120, 255)',
          muted: '#6B717A',
          error: '#d9534f',
        },
      },
      fontFamily: {
        sans: ["'proxima-nova'", "'Helvetica Neue'", 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
