import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
   base: './', // rutas relativas: funciona igual en localhost y en usuario.github.io/repo/
})
