import { defineConfig, loadEnv } from 'vite' // 👈 Added loadEnv
import react from '@vitejs/plugin-react-swc'
import path from 'path';
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from "rollup-plugin-visualizer";

// Change to a function that takes 'mode' and 'command'
export default defineConfig(({ mode }) => {
  // 1. Load the environment variables for the current mode.
  // The third argument ('') tells loadEnv to load ALL env vars, regardless of prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // 2. Define the fallback value here
  const apiUrlFallback = env.API_URL || ''; // If VITE_API_URL is missing, use empty string for relative path

  return {
    // 3. Use the define option to inject the variable with the fallback
    define: {
      'import.meta.env.API_URL': JSON.stringify(apiUrlFallback),
    },
    
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
  }
})