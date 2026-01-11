/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#1a1d23',
          secondary: '#242930',
          tertiary: '#2d3340',
          elevated: '#353b4a',
        },
        text: {
          primary: '#e8eaed',
          secondary: '#9aa0a6',
          tertiary: '#6c7280',
        },
        accent: {
          primary: '#00ff88',
          'primary-hover': '#00cc6e',
          'primary-subtle': 'rgba(0, 255, 136, 0.15)',
          secondary: '#00d9ff',
          'secondary-hover': '#00b8d4',
          'secondary-subtle': 'rgba(0, 217, 255, 0.15)',
        },
        border: {
          default: '#3a4049',
          subtle: '#2a2f38',
        },
        priority: {
          high: '#ff4757',
          'high-bg': 'rgba(255, 71, 87, 0.15)',
          medium: '#ffa502',
          'medium-bg': 'rgba(255, 165, 2, 0.15)',
          low: '#00d9ff',
          'low-bg': 'rgba(0, 217, 255, 0.15)',
        },
        success: {
          DEFAULT: '#00ff88',
          bg: 'rgba(0, 255, 136, 0.15)',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-lg': '0 0 30px rgba(0, 255, 136, 0.4)',
        'dark': '0 4px 16px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 8px 24px rgba(0, 0, 0, 0.5), 0 16px 48px rgba(0, 0, 0, 0.4)',
      },
      gridTemplateColumns: {
        calendar: 'repeat(7, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
