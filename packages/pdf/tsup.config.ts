import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig({
  entry: ['./src/index.ts'],
  dts: true,
  external: [...Object.keys(pkg.dependencies || {})],
  sourcemap: true,
})
