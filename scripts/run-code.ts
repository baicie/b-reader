import { platform } from "node:os";
import { execSync } from "node:child_process";
import path from "node:path";

const extensionPath = path.resolve(__dirname, "../packages/extension");

function main() {
  switch (platform()) {
    case "win32":
      execSync(`'code --extensionDevelopmentPath=$(pwd)'`, {
        cwd: extensionPath,
      });
    case "darwin":
      execSync(`bash -exec 'code --extensionDevelopmentPath=$(pwd)'`, {
        cwd: extensionPath,
      });
  }
}

main();
