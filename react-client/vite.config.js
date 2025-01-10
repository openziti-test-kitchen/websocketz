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
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, '/ws'),
        headers: {
          'Origin': FRONTEND_URL
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url, 'to', proxyReq.path);
          });
          proxy.on('proxyReqWs', (proxyReq, req, socket, options, _head) => {
            socket.on('error', (err) => {
              console.log('WebSocket error:', err);
            });
            console.log('Proxying WebSocket:', req.url, 'to', options.target);
          });
        }
      },
      '/': {
        target: FRONTEND_URL,
        secure: false,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        }
      }
    }
  }
})
