import fs from 'node:fs'
import path from 'node:path'
import type { Uri } from 'vscode'

export function existsOrCreate(target: string | Uri) {
  const filePath = typeof target === 'string' ? target : target.path
  const directoryPath = path.dirname(filePath)

  // Ensure the directory structure exists
  if (!fs.existsSync(directoryPath))
    fs.mkdirSync(directoryPath, { recursive: true })

  // Create the file if it doesn't exist
  if (!fs.existsSync(filePath))
    fs.writeFileSync(filePath, JSON.stringify({}), { encoding: 'utf-8' })
}
