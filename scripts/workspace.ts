import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'fast-glob'
import { rootPath } from './paths'

export interface PackageManifest {
  name?: string
  version?: string
  gitHead?: string
  config?: {
    publish?: boolean
    type?: 'extension' | 'package'
  }
  [key: string]: unknown
}

export interface WorkspacePackage {
  dir: string
  manifest: PackageManifest
  manifestPath: string
  writeManifest: (manifest: PackageManifest) => Promise<void>
}

export async function getWorkspacePackages(): Promise<WorkspacePackage[]> {
  const packageFiles = await glob(['package.json', 'packages/*/package.json'], {
    absolute: true,
    cwd: rootPath,
    onlyFiles: true,
  })

  return await Promise.all(packageFiles.sort().map(async (manifestPath) => {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as PackageManifest

    return {
      dir: path.dirname(manifestPath),
      manifest,
      manifestPath,
      writeManifest: async (nextManifest: PackageManifest) => {
        await writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`)
      },
    }
  }))
}
