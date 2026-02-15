/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: ['class', '.theme-dark'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#0a0f1f',
          900: '#0f162d',
          800: '#141c34',
          700: '#1a2544'
        },
        glow: {
          500: '#5ee7ff',
          600: '#3ccfff'
        }
      },
      boxShadow: {
        glass: '0 10px 30px rgba(12, 19, 40, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
      },
      backdropBlur: {
        glass: '18px'
      }
    },
    fontFamily: {
      display: ['"Space Grotesk"', 'sans-serif'],
      body: ['"Manrope"', 'sans-serif']
    }
  },
  plugins: []
};
