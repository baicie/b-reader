import path from 'node:path'
import fs from 'node:fs'
import type { WebviewPanel, WebviewView } from 'vscode'
import { Uri } from 'vscode'

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

  return data ? addDataToHtml(html, data) : html
}

function addDataToHtml(html: string, data: any) {
  const newData = `<comment style="display: none;">${JSON.stringify(data)}</comment>`
  const modifiedHtml = html.replace('</body>', `${newData}</body>`)

  return modifiedHtml
}
