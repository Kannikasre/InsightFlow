/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0B0D12',
          surface: '#131720',
          elevated: '#191F2B',
          card: '#131720',
        },
        border: {
          subtle: '#293140',
          muted: '#1e2533',
        },
        text: {
          primary: '#F1F4F8',
          secondary: '#9AA5B5',
          muted: '#626F84',
        },
        accent: {
          mint: '#71E3BD',
          amber: '#F3BC66',
          coral: '#FF737D',
          blue: '#78A9FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
