import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig as defineVitestConfig, mergeConfig } from 'vitest/config'

// https://vite.dev/config/
const viteConfig = defineConfig({
  plugins: [react()],
})

export default mergeConfig(
  viteConfig,
  defineVitestConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  })
)
