import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:8017' },
    watch: { ignored: ['**/backend/**', '**/doki/**', '**/artifacts/**'] },
  },
  preview: { port: 4173, proxy: { '/api': 'http://127.0.0.1:8017' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor': ['motion/react'],
          'forms-vendor': ['react-hook-form', 'zod', '@hookform/resolvers/zod'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
