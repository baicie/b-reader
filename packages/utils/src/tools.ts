import path from 'node:path'
import fs from 'node:fs'
import { globSync } from 'fast-glob'
import type { WebviewPanel, WebviewView } from 'vscode'
import { Uri } from 'vscode'
import { clientPath } from './path'

/**
 * scan client dist
 * @returns string[]
 */
export function scanClientDist() {
  const distPath = globSync('**/*.{js,css}', {
    cwd: clientPath,
    onlyFiles: true,
  })

  return distPath
}

export function getWebViewContent(
  config: any,
  templatePath: string,
  webviewView: WebviewView | WebviewPanel,
  data?: unknown,
) {
  const resourcePath = path.join(config.extensionPath, templatePath)
  const dirPath = path.dirname(path.dirname(resourcePath))
  const htmlContent = fs.readFileSync(resourcePath, 'utf-8')
  const html = htmlContent.replace(
    /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
    (m, $1, $2) => {
      const webviewUri = webviewView.webview.asWebviewUri(
        Uri.file(path.join(dirPath, $2)),
      )
      const replaceHref = `${$1 + webviewUri.toString()}"`
      return replaceHref
    },
  )

  return html
}
