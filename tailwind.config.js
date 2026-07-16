/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        latam: {
          profunda: '#0F004F',   // Noche Profunda
          estrellada: '#1B0088', // Noche Estrellada (dominante)
          diavivo: '#4257E8',    // Día Vivo
          coral: '#ED1650',      // Coral Atardecer
        },
      },
      fontFamily: {
        sans: ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15,0,79,0.08)',
        card: '0 18px 40px rgba(15,0,79,0.16)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        bob: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(5px)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .7s cubic-bezier(.22,1,.36,1) both',
        bob: 'bob 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
