import process from 'node:process'
import { execSync } from 'node:child_process'
import type { Project } from '@pnpm/find-workspace-packages'
import { findWorkspacePackages } from '@pnpm/find-workspace-packages'
import chalk from 'chalk'
import consola from 'consola'
import { rootPath } from './paths'

interface MyProject extends Project {
  manifest: {
    config?: {
      publish?: boolean
      type?: 'extension' | 'package'
    }
  }
}

const getWorkspacePackages = () => findWorkspacePackages(rootPath)

function errorAndExit(err: Error): void {
  consola.error(err)
  process.exit(1)
}

async function main() {
  consola.debug(chalk.yellow('publish-script started'))

  const pkgs: MyProject[] = await getWorkspacePackages()

  const publishPackage = async (project: MyProject) =>
    execSync('pnpm publish --access public --no-git-checks', { cwd: project.dir, stdio: 'inherit' })

  // const publishExtensions = async (project: MyProject) => execSync('pnpm publish --access public --no-git-checks', { cwd: project.dir, stdio: 'inherit' })

  try {
    const publishd = pkgs.filter(pkg => pkg.manifest.config?.publish)
    // publishd.filter(pkg => pkg.manifest.config?.type === 'extension').forEach(publishExtensions)
    publishd.filter(pkg => pkg.manifest.config?.type === 'package').forEach(publishPackage)
  }
  catch (error) {
    errorAndExit(error as Error)
  }

  consola.success(chalk.green('packages published successfully'))
}

main()
