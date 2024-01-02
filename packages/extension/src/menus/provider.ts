import path from 'node:path'
import type { BReaderContext } from '@b-reader/utils'
import {
  getWebViewContent,
  resolvehtml,
} from '@b-reader/utils'
import type { ExtensionContext, WebviewView, WebviewViewProvider } from 'vscode'
import { receiveMessage } from '../receive-message'
import { mixinAppid } from '../utils/appid'
import { setWebviewCache } from '../view/cache'

export class MenusProvider implements WebviewViewProvider {
  private config: BReaderContext
  private webviewView?: WebviewView
  private context: ExtensionContext
  private name: string

  constructor(name: string, config: BReaderContext, context: ExtensionContext) {
    this.config = config
    this.context = context
    this.name = name
  }

  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    if (!(this.config.localResourceRoots && this.config.extensionPath))
      return

    this.webviewView = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
      localResourceRoots: [this.config.localResourceRoots],
    }

    const html = getWebViewContent(
      this.config,
      path.relative(this.config.extensionPath, resolvehtml('sliderbar')),
      webviewView,
    )
    webviewView.webview.html = html
    mixinAppid(this.config)

    setWebviewCache(webviewView.webview, this.name, this.config.appid!)

    receiveMessage(webviewView.webview, this.context, this.config)
  }

  sendMessage(path: string, message: unknown) {
    this.webviewView?.webview.postMessage({
      path,
      data: message,
    })
  }
}
