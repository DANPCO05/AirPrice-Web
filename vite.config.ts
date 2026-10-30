import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // La API solo permite http://localhost:5173 por defecto. Si el puerto está
  // ocupado, es mejor fallar que arrancar en otro puerto y romper CORS.
  server: { port: 5173, strictPort: true },
})
