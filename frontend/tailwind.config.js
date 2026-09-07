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
        background: {
          darkest: '#050816',
          darker: '#07111F',
          dark: '#0B1220',
          card: 'rgba(15, 23, 42, 0.65)',
        },
        primary: {
          DEFAULT: '#38BDF8', // Sky
          hover: '#0284C7',
          light: '#7DD3FC',
        },
        secondary: {
          DEFAULT: '#22D3EE', // Cyan
          hover: '#06B6D4',
        },
        ai: {
          DEFAULT: '#8B5CF6', // Purple/Violet intelligence
          glow: 'rgba(139, 92, 246, 0.25)',
          light: '#A78BFA',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.45)',
        'glow-primary': '0 0 20px rgba(56, 189, 248, 0.25)',
        'glow-ai': '0 0 25px rgba(139, 92, 246, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
