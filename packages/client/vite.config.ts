import path, { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import glob from 'fast-glob'

const modulesPath = path.resolve(__dirname, 'html')

function customPlugins(): Plugin[] {
  const resolveInput: Plugin = {
    name: 'resolve-input',
    async config(config) {
      const files = await glob('*.html', {
        onlyFiles: true,
        cwd: modulesPath,
      })

      for (const file of files) {
        config.build!.rollupOptions!.input![file] = path.resolve(
          modulesPath,
          file,
        )
      }
    },
  }

  return [resolveInput]
}

function getName(path: string, name: string, alias?: string): string {
  return `${alias || name}/${path
    .toString()
    .split(`${name}/`)[1]
    .split('/')[0]
    .toString()}`.replace('_', '')
}

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [
      customPlugins(),
      vue({
        customElement: true,
      }),
      jsx(),
    ],
    build: {
      outDir: '../extension/vue-dist',
      rollupOptions: {
        external: ['vscode'],
        input: {},
        output: {
          chunkFileNames: 'assets/[name].js',
          entryFileNames: 'assets/[name].js',
          inlineDynamicImports: false,
          manualChunks(id) {
            if (id.includes('node_modules/'))
              return getName(id, 'node_modules/.pnpm', 'deps')
          },
        },
      },
    },
    define: {
      __PLATFORM__: 'vscode',
      __MODE__: 'development',
    },
  }
})
