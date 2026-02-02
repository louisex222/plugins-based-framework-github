import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/plugins-based-framework/' : '/',

  plugins: [react()],

  server: {
    port: 3000,
    open: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/page': path.resolve(__dirname, './src/page'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/i18n': path.resolve(__dirname, './src/i18n'),
      '@/module': path.resolve(__dirname, './src/module'),
      '@/api': path.resolve(__dirname, './src/api'),
    },
  },
}))
