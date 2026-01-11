/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfbf7',
          100: '#f8f4ed',
        },
        charcoal: {
          500: '#757570',
          700: '#4a4a45',
          900: '#2d2d2a',
        },
        terracotta: {
          100: '#fde8e0',
          500: '#d4704f',
          600: '#c2573a',
        },
        sage: {
          100: '#e3f0ea',
          500: '#6b9080',
        },
        navy: {
          100: '#e5eaed',
          700: '#2c4251',
        },
        priority: {
          high: '#c93a3a',
          'high-bg': '#fce8e8',
          medium: '#d97706',
          'medium-bg': '#fef3e7',
          low: '#0c8ab3',
          'low-bg': '#e6f4f9',
        },
      },
      fontFamily: {
        display: ['Crimson Pro', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.08)',
      },
      gridTemplateColumns: {
        calendar: 'repeat(7, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
