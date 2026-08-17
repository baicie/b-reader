import process from 'node:process'
import { getWorkspacePackages } from './workspace'

async function main() {
  const version = process.env.TAG_VERSION?.replace(/^v/, '')
  const gitHead = process.env.GIT_HEAD
  if (!version)
    throw new Error('TAG_VERSION is required')

  console.log(`Updating workspace packages to ${version}`)

  for (const project of await getWorkspacePackages()) {
    await project.writeManifest({
      ...project.manifest,
      version,
      ...(gitHead ? { gitHead } : {}),
    })
  }

  console.log(`Workspace packages updated to ${version}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
