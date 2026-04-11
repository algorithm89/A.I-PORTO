import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // listen on 0.0.0.0 — accessible from phone on same WiFi
    port: 5173,        // always use this port
    strictPort: true,  // crash instead of switching to a random port
  },
})
