import type { BReaderContext } from '@b-reader/utils/dist'
import type { ExtensionContext, WebviewPanel } from 'vscode'
import { commands } from 'vscode'

export function webviewCommandFactory(
  name: string,
  cb: (context: ExtensionContext, config: BReaderContext, data: any) => Promise<void> | WebviewPanel = () => Promise.resolve()) {
  return (context: ExtensionContext, config: BReaderContext) => {
    const webview = commands.registerCommand(name, async (data) => {
      cb(context, config, data)
    })
    context.subscriptions.push(webview)
  }
}
