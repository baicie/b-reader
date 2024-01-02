import type { Webview, WebviewPanel } from 'vscode'

interface WebviewCache {
  webview: Webview
  type: string
  appid: string
}

export const cacheWebview: Record<string, WebviewCache> = {

}

export function setWebviewCache(webview: Webview, type: string, appid: string) {
  cacheWebview[appid] = {
    webview,
    type,
    appid,
  }
}

export function getWebviewCache(type: string) {
  const res: Webview [] = []
  for (const item of Object.values(cacheWebview)) {
    if (item.type === type)
      res.push(item.webview)
  }

  return res
}
