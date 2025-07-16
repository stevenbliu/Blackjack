import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ensures Vite is accessible from outside Docker container
    watch: {
      usePolling: true, // Enables polling for file changes
      interval: 100,    // Optional: polling interval (ms)
    },
  },
})
