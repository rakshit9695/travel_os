/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Midnight Alpine" — cool slate-navy surfaces (dark-first) + a refined
        // azure accent (replaces the old teal). Swiss red kept as a micro-accent.
        pine: {
          50: '#EEF2F9',
          100: '#DBE2F0',
          200: '#B7C5DF',
          300: '#8A9CC0',
          400: '#566688',
          500: '#2C3A58',
          600: '#1E2A44',
          700: '#161F38',
          800: '#10182C',
          900: '#0A0F1E',
        },
        glacier: {
          50: '#ECF3FF',
          100: '#D7E6FF',
          200: '#B4CFFF',
          300: '#8AB2FB',
          400: '#6395F5',
          500: '#4C82EC',
          600: '#3A66C8',
          700: '#2D4E9C',
        },
        canvas: {
          DEFAULT: '#F5F7FB',
          soft: '#E9EDF5',
        },
        ink: {
          DEFAULT: '#121726',
          soft: '#39415A',
          mute: '#6B7488',
        },
        swiss: '#E4322B',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(8,14,28,0.06), 0 8px 24px -8px rgba(8,14,28,0.18)',
        lift: '0 2px 4px rgba(8,14,28,0.10), 0 18px 40px -12px rgba(8,14,28,0.35)',
        glass: '0 1px 0 rgba(255,255,255,0.5) inset, 0 8px 30px -10px rgba(8,14,28,0.4)',
      },
      backgroundImage: {
        'pine-gradient': 'linear-gradient(135deg, #131C32 0%, #1E2D4E 55%, #314A7C 100%)',
        'glacier-gradient': 'linear-gradient(135deg, #4C82EC 0%, #8AB2FB 100%)',
        'canvas-radial': 'radial-gradient(120% 120% at 50% 0%, #FFFFFF 0%, #F5F7FB 55%, #E9EDF5 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
