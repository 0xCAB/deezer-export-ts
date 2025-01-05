import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.mts'],
  publicDir: false,
  clean: true,
  minify: true,
  format: ['esm'],
  outDir: 'build',
})
