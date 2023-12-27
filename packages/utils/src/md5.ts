import crypto from 'node:crypto'
import { Uri, workspace } from 'vscode'

export async function calculateMD5(filePath: string) {
  const data = await workspace.fs.readFile(Uri.file(filePath))
  const hash = crypto.createHash('md5').update(data).digest('hex')
  return hash
}
