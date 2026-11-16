/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#FAF7F2',
          card: '#FFFFFF',
          muted: '#F5EFEB',
          subtle: '#FAF5EF',
          border: '#EFEBE4',
          borderHover: '#E0D9CE',
          text: '#2B2D42',
          subtext: '#64748B',
          lighttext: '#8E90A6',
          coral: '#F97316',
          amber: '#D97706',
          teal: '#0D9488',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Warm soft indigo
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces"', '"Plus Jakarta Sans"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(43, 45, 66, 0.04), 0 1px 3px -1px rgba(43, 45, 66, 0.02)',
        'card': '0 4px 20px -2px rgba(43, 45, 66, 0.05), 0 2px 6px -1px rgba(43, 45, 66, 0.02)',
        'card-hover': '0 12px 28px -4px rgba(43, 45, 66, 0.08), 0 4px 10px -2px rgba(43, 45, 66, 0.03)',
        'lift': '0 8px 24px -4px rgba(79, 70, 229, 0.18)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      }
    },
  },
  plugins: [],
}
