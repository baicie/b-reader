import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import glob from 'fast-glob'
import { defineConfig } from 'vite'

const projectPath = fileURLToPath(new URL('.', import.meta.url))
const modulesPath = path.resolve(projectPath, 'html')

export default defineConfig(async () => {
  const htmlFiles = await glob('*.html', {
    cwd: modulesPath,
    onlyFiles: true,
  })
  const input = Object.fromEntries(
    htmlFiles.map(file => [file, path.resolve(modulesPath, file)]),
  )

  return {
    resolve: {
      alias: {
        '@': path.resolve(projectPath, 'src'),
      },
    },
    plugins: [
      vue({ customElement: true }),
      jsx(),
    ],
    build: {
      outDir: '../extension/vue-dist',
      rollupOptions: {
        external: ['vscode'],
        input,
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          manualChunks(id: string) {
            const moduleId = id.replaceAll('\\', '/')
            if (!moduleId.includes('/node_modules/'))
              return undefined
            if (moduleId.includes('/ant-design-vue/') || moduleId.includes('/@ant-design/'))
              return 'vendor-ant-design'
            if (moduleId.includes('/vue/') || moduleId.includes('/@vue/') || moduleId.includes('/@intlify/'))
              return 'vendor-vue'
            return 'vendor'
          },
        },
      },
    },
  }
})
