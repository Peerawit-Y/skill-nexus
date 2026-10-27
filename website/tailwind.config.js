/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#000000',
        panel: {
          DEFAULT: '#090a0d',
          subtle: '#0f1117',
          active: '#161922',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.16)',
          hover: 'rgba(255, 255, 255, 0.24)',
        },
        accent: {
          DEFAULT: '#00d2ff',
          hover: '#33dcff',
          muted: 'rgba(0, 210, 255, 0.12)',
          border: 'rgba(0, 210, 255, 0.3)',
        },
        ink: {
          primary: '#ffffff',
          secondary: '#9da7b3',
          muted: '#626d7a',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Menlo', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.025em',
        tight: '-0.015em',
      }
    },
  },
  plugins: [],
}
