import { platform } from 'node:os'
import { execSync } from 'node:child_process'
import path from 'node:path'

const extensionPath = path.resolve(__dirname, '../packages/extension')

function main() {
  switch (platform()) {
    case 'win32':
      // eslint-disable-next-line no-case-declarations
      const powerShellCommand = 'Start-Process code -ArgumentList "--extensionDevelopmentPath=$(pwd)" -PassThru'
      execSync(`powershell -Command "& { ${powerShellCommand} }"`, {
        cwd: extensionPath,
      })
      break
    case 'darwin':
      execSync('bash -exec \'code --extensionDevelopmentPath=$(pwd)\'', {
        cwd: extensionPath,
      })
      break
  }
}

main()
