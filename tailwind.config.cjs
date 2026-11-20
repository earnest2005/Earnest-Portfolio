module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#0A0A12',
        sage: '#9277E0',
        sage2: '#1B1B2B',
        ink: '#F4F4F8',
        mute: '#6E7188',
        surface: '#14141F',
        surfaceAlt: '#0E0E18',
        accent: '#6F8FFF',
        accentLight: '#7CB4FF',
        textSec: '#A3A6BA',
      },
      fontFamily: {
        head: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
