import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/extension.ts"],
  external: ["vscode"],
  sourcemap: true,
});
