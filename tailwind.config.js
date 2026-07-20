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
        flyAcross: {
          '0%': { transform: 'translateX(-45vw) translateY(0)', opacity: 0 },
          '10%': { opacity: 1 },
          '30%': { transform: 'translateX(5vw) translateY(-8px)' },
          '50%': { transform: 'translateX(45vw) translateY(6px)' },
          '70%': { transform: 'translateX(85vw) translateY(-6px)' },
          '90%': { opacity: 1 },
          '100%': { transform: 'translateX(135vw) translateY(0)', opacity: 0 },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(237,22,80,0.75)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 28px 10px rgba(237,22,80,0.8)', transform: 'scale(1.06)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .7s cubic-bezier(.22,1,.36,1) both',
        bob: 'bob 2.2s ease-in-out infinite',
        flyAcross: 'flyAcross 1500ms cubic-bezier(.45,0,.55,1) forwards',
        shake: 'shake 420ms ease-in-out',
        fadeIn: 'fadeIn 350ms ease-out both',
        glowPulse: 'glowPulse 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
