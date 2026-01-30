/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // https://partnermarketinghub.withgoogle.com/brands/google-news/visual-identity/color-palette/
        // Google Blues
        'google-blue': {
          DEFAULT: '#174EA6', // Original Blue
          light: '#D2E3FC',
          medium: '#4285F4',
        },
        // Google Reds
        'google-red': {
          DEFAULT: '#A50E0E', // Original Red
          light: '#FAD2CF',
          medium: '#EA4335',
        },
        // Google Greens
        'google-green': {
          DEFAULT: '#0D652D', // Original Green
          light: '#CEEAD6',
          medium: '#34A853',
        },
        // Google Yellows
        'google-yellow': {
          DEFAULT: '#FBBC04', // Original Yellow
          light: '#FEEFC3',
        },
        // Other Google Brand Colors
        'google-orange': '#E37400',
        'google-grey': {
          DEFAULT: '#9AA0A6',
          light: '#F1F3F4',
        },
        'google-black': '#202124',
      },
    },
  },
  plugins: [],
}
