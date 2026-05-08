import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',  // listen on 127.0.0.1
    port: 5173,         // always use this port
    strictPort: true,   // crash instead of switching to a random port
  },
})
