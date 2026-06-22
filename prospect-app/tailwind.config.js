/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        accent: {
          50: '#f0f9ff',
          500: '#06b6d4',
          600: '#0891b2',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-nocr': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #f5f3ff 0%, #f0f9ff 100%)',
      },
    },
  },
  plugins: [],
}
