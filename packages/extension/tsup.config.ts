import process from 'node:process'
import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig({
  entry: ['./src/extension.ts'],
  external: ['vscode'],
  noExternal: process.env.MODE === 'dev' ? undefined : [...Object.keys(pkg.dependencies || {})],
  sourcemap: true,
})
