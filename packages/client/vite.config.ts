import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    plugins: [
      vue({
        customElement: true,
      }),
    ],
    build: {
      outDir: "../extension/vue-dist",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          sliderbar: resolve(__dirname, "sliderbar.html"),
        },
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
    define: {
      __PLATFORM__: "vscode",
      __MODE__: "development",
    },
  };
});
