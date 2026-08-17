import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig({
  entry: ['./src/extension.ts'],
  external: ['vscode', '@aws-sdk/client-s3'],
  noExternal: [...Object.keys(pkg.dependencies || {})],
  skipNodeModulesBundle: false,
  sourcemap: true,
  target: 'node20',
})
