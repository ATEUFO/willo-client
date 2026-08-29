import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import type { Plugin } from 'vite'

// Custom plugin to copy Drizzle migrations directory to out/main/migrations
const copyMigrationsPlugin = (): Plugin => ({
  name: 'copy-migrations',
  closeBundle() {
    const srcDir = resolve(__dirname, 'src/main/database/migrations')
    const destDir = resolve(__dirname, 'out/main/migrations')
    if (fs.existsSync(srcDir)) {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }
      fs.cpSync(srcDir, destDir, { recursive: true })
    }
  }
})

export default defineConfig({
  main: {
    plugins: [copyMigrationsPlugin()]
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [tailwindcss(), react()]
  }
})
