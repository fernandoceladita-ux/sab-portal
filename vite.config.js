import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Debe coincidir con el nombre del repo de GitHub: tuusuario.github.io/sab-portal/
  // Si renombras el repo, actualiza esto también.
  base: '/sab-portal/', // rutas relativas: funciona igual en localhost y en usuario.github.io/repo/
})
