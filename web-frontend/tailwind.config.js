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
        dark: {
          950: '#06090F',
          900: '#090D16', // Main Dark background
          850: '#111726',
          800: '#161F30', // Card surface
          700: '#1E293B', // Borders
          600: '#334155',
        },
        neon: {
          green: '#10B981', // Neon Emerald Green
          emerald: '#059669',
          glow: '#00F59B',
          cyan: '#06B6D4',  // Electric Cyan
          amber: '#F59E0B', // Expiring Alert
          rose: '#EF4444',  // Expired / Udhaari Alert
        },
      },
      boxShadow: {
        'neon-green': '0 0 20px -3px rgba(16, 185, 129, 0.45)',
        'neon-amber': '0 0 20px -3px rgba(245, 158, 11, 0.45)',
        'neon-rose': '0 0 20px -3px rgba(239, 68, 68, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
