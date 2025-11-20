import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/orion': {
        target: 'http://34.55.45.169:1026',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/orion/, '')
      },
      '/api/sth': {
        target: 'http://34.55.45.169:8666',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sth/, '')
      }
    }
  },
  resolve: {
    alias: {
      // Fix para a biblioteca MQTT no browser
      './platform/index.js': 'mqtt/dist/mqtt.min.js'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})