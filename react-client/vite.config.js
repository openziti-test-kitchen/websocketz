import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get frontend URL from environment or default to localhost
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:9876'

// Derive WebSocket URL from frontend URL
const getWsUrl = (url) => {
  const wsUrl = new URL(url)
  wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  return wsUrl.href
}

export default defineConfig({
  plugins: [react()],
  define: {
    // Make frontend URL available in the React app
    'process.env.FRONTEND_URL': JSON.stringify(FRONTEND_URL)
  },
  server: {
    proxy: {
      '/ws': {
        target: getWsUrl(FRONTEND_URL),
        ws: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ws/, '/ws'),
        headers: {
          'Origin': FRONTEND_URL
        }
      },
      '/': {
        target: FRONTEND_URL,
        secure: false,
        changeOrigin: true
      }
    }
  }
})
