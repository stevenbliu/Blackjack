import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // ✅ Changed
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 100,
    },
    allowedHosts: ['blackjack-frontend-y2bh.onrender.com'],
  },
    resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@shared': path.resolve(__dirname, './src/shared'),
    }
  }
})
