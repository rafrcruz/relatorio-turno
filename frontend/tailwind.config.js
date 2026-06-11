/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '2560px',
      },
      colors: {
        'hydro-blue': '#444D55',
        'hydro-light-blue': '#768692',
        'hydro-dark-blue': '#333940',
        'aluminium': '#8C8C8C',
        'white': '#FFFFFF',
        'black': '#1A1D21',
        'green': '#43807A',
        'green-dark': '#336360',
        'warm': '#C5B9AC',
        'warm-dark': '#A09080',
        'purple': '#4A3041',
        'bauxite': '#B95946',
        'bauxite-dark': '#9A4538',
        'mid-gray': '#757575',
        'light-gray': '#F4F4F4',
        'page-bg': '#EEF1F5',
        'surface': '#FFFFFF',
        'surface-alt': '#F7F9FB',
        'surface-hover': '#F0F4F8',
        'border': '#DDE1E7',
        'border-light': '#ECEEF1',
      },
      fontFamily: {
        display: ['"Ivar Display"', 'Times New Roman', 'serif'],
        text: ['"Ivar Text"', 'Times New Roman', 'serif'],
        arial: ['Arial', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.09), 0 16px 32px rgba(0,0,0,0.06)',
        'header': '0 1px 0 #DDE1E7, 0 2px 8px rgba(0,0,0,0.04)',
        'dropdown': '0 4px 8px rgba(0,0,0,0.09), 0 12px 24px rgba(0,0,0,0.08)',
        'button': '0 1px 2px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.08)',
        'input-focus': '0 0 0 3px rgba(118,134,146,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
