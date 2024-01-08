import type { Webview } from 'vscode'
import type { MessageType } from '@b-reader/utils'
import { getWebviewCache } from '../view/cache'

export async function sendMessage(
  webview: Webview,
  _path: MessageType['path'],
  data: unknown,
) {
  await webview.postMessage({
    path: _path,
    data,
  })
}

export async function sendMessageToAll(
  name: string,
  _path: MessageType['path'],
  data: unknown,
) {
  const webviews = getWebviewCache(name)
  for (const webview of webviews)
    await sendMessage(webview, _path, data)
}
