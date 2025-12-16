/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#0078D7",
        "primary-hover": "#0062b0",
        "background-light": "#f8fafc",
        "background-dark": "#0f172a",
        "card-dark": "#1e293b",
        "card-border": "#334155",
        "surface-dark": "#151921",
        "surface-border": "#2b3240",
        "text-secondary": "#94a3b8",
        "accent-blue": "#0ea5e9",
        "input-border": "#334155",
        "accent-dark": "#020617"
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
      },
      borderRadius: { 
        "DEFAULT": "1rem", 
        "lg": "1.5rem", 
        "xl": "2rem", 
        "full": "9999px" 
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
}

