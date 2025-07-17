import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ✅ Changed

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
})
