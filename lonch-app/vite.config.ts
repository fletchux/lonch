import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/lib': path.resolve(__dirname, './src/lib'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React vendor chunk
          'react-vendor': ['react', 'react-dom'],
          // Firebase services chunk
          'firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage'
          ],
          // UI library chunk (Radix UI components + Framer Motion)
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            'framer-motion',
            'lucide-react'
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false, // Disable sourcemaps in production for smaller builds
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
