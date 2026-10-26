import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:8017' },
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
    setupFiles: './src/shared/lib/testing/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
