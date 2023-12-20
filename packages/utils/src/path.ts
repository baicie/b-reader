import path from "node:path";

export const rootPath = path.resolve(__dirname, "..", "..", "..");
export const packagesPath = path.resolve(rootPath, "packages");
export const utilsPath = path.resolve(packagesPath, "utils");
export const extensionPath = path.resolve(packagesPath, "extension");
export const clientPath = path.resolve(extensionPath, "vue-dist");
