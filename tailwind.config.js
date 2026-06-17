/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: '#EEF1F8',
          100: '#D8DFF0',
          200: '#B3C1E0',
          300: '#8DA3D1',
          400: '#5E7BBF',
          500: '#1B2A4A',
          600: '#172342',
          700: '#121C38',
          800: '#0D142D',
          900: '#080D1F',
        },
        coral: {
          50: '#FFF0EC',
          100: '#FFDDD5',
          200: '#FFBBAB',
          300: '#FF9981',
          400: '#FF6B4A',
          500: '#E8553A',
          600: '#C44530',
          700: '#A03726',
          800: '#7C2A1D',
          900: '#581D13',
        },
        mint: {
          50: '#E6FBF4',
          100: '#C0F5E4',
          200: '#88EBCF',
          300: '#50E0BA',
          400: '#2DD4A0',
          500: '#1AB889',
          600: '#149B72',
          700: '#0F7E5C',
          800: '#0A6145',
          900: '#05442F',
        },
        surface: {
          50: '#F8F9FC',
          100: '#E8EDF3',
          200: '#D1D9E5',
          300: '#B3C1D3',
          400: '#8A9BB5',
          500: '#627597',
          600: '#4D5F7F',
          700: '#3A4B68',
          800: '#2A3950',
          900: '#1B2740',
        },
      },
      fontFamily: {
        display: ['"Noto Sans SC"', 'sans-serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(27,42,74,0.06), 0 1px 2px rgba(27,42,74,0.04)',
        cardHover: '0 10px 25px rgba(27,42,74,0.08), 0 4px 10px rgba(27,42,74,0.05)',
        modal: '0 25px 50px rgba(27,42,74,0.15)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,74,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,107,74,0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
