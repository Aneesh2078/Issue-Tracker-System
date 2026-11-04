/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563EB', // Primary
          700: '#1d4ed8'
        },
        slate: {
          50: '#F8FAFC',  // Page Background
          100: '#F1F5F9',
          200: '#E2E8F0', // Border
          500: '#64748B', // Secondary Text
          800: '#1E293B', // Text
          900: '#0F172A'
        },
        status: {
          open: '#2563EB',
          inprogress: '#F97316',
          closed: '#16A34A'
        },
        priority: {
          low: '#64748B',
          medium: '#2563EB',
          high: '#F59E0B',
          critical: '#DC2626'
        }
      }
    },
  },
  plugins: [],
};

