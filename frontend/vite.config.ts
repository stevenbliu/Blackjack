import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // ✅ Changed
import path from 'path';
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), tailwindcss(), visualizer()],
  css:{
    devSourcemap: false
  },
  
  server: {
    hmr: {
      overlay: false
    },
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 1000,
    },
    allowedHosts: ['blackjack-frontend-y2bh.onrender.com'],
  },
    resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@shared': path.resolve(__dirname, './src/shared'),
    }
  },
  optimizeDeps: {
    include:['tailwindcss',
      'react', 'react-dom', 'react/jsx-runtime'
    ]
  }
})
