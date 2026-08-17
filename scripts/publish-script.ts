import { execFileSync } from 'node:child_process'
import process from 'node:process'
import { getWorkspacePackages } from './workspace'

async function main() {
  const packages = await getWorkspacePackages()
  const publishablePackages = packages.filter(project =>
    project.manifest.config?.publish
    && project.manifest.config.type === 'package',
  )

  for (const project of publishablePackages) {
    console.log(`Publishing ${project.manifest.name}`)
    execFileSync('pnpm', ['publish', '--access', 'public', '--no-git-checks'], {
      cwd: project.dir,
      stdio: 'inherit',
    })
  }

  console.log('Workspace packages published')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
