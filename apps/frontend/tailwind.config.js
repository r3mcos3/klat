/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a1929',
          secondary: '#132f4c',
          tertiary: '#1e3a5f',
          elevated: '#2c5282',
        },
        text: {
          primary: '#e3f2fd',
          secondary: '#90caf9',
          tertiary: '#64b5f6',
        },
        accent: {
          primary: '#06b6d4',
          'primary-hover': '#0891b2',
          'primary-subtle': 'rgba(6, 182, 212, 0.15)',
          secondary: '#14b8a6',
          'secondary-hover': '#0d9488',
          'secondary-subtle': 'rgba(20, 184, 166, 0.15)',
        },
        border: {
          default: '#1e4976',
          subtle: '#163454',
        },
        priority: {
          high: '#ff6b6b',
          'high-bg': 'rgba(255, 107, 107, 0.15)',
          medium: '#ffa726',
          'medium-bg': 'rgba(255, 167, 38, 0.15)',
          low: '#4fc3f7',
          'low-bg': 'rgba(79, 195, 247, 0.15)',
        },
        success: {
          DEFAULT: '#14b8a6',
          bg: 'rgba(20, 184, 166, 0.15)',
        },
        ocean: {
          50: '#e3f2fd',
          100: '#90caf9',
          200: '#64b5f6',
          300: '#42a5f5',
          400: '#2196f3',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#0a1929',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Work Sans', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-lg': '0 0 30px rgba(6, 182, 212, 0.4)',
        'ocean': '0 4px 16px rgba(6, 182, 212, 0.2), 0 8px 32px rgba(6, 182, 212, 0.1)',
        'ocean-lg': '0 8px 24px rgba(6, 182, 212, 0.25), 0 16px 48px rgba(6, 182, 212, 0.15)',
        'dark': '0 4px 16px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 8px 24px rgba(0, 0, 0, 0.7), 0 16px 48px rgba(0, 0, 0, 0.5)',
      },
      gridTemplateColumns: {
        calendar: 'repeat(7, minmax(0, 1fr))',
      },
      backgroundImage: {
        'wave-gradient': 'linear-gradient(135deg, #0a1929 0%, #1e3a5f 50%, #2c5282 100%)',
      },
    },
  },
  plugins: [],
};
