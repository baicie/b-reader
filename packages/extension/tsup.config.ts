import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig({
  entry: ['./src/extension.ts'],
  external: ['vscode', ...Object.keys(pkg.dependencies || {})],
  sourcemap: true,
})
