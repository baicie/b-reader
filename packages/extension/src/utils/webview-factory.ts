import path from 'node:path'
import type { BReaderContext } from '@b-reader/utils'
import {
  getWebViewContent,
} from '@b-reader/utils'
import type {
  ExtensionContext,
  WebviewPanel,
} from 'vscode'
import {
  ViewColumn,
  window,
} from 'vscode'
import { receiveMessage } from '../receive-message'
import { setWebviewCache } from '../view/cache'
import { resolvehtml } from '../path'
import { mixinAppid } from './appid'

export interface WebviewFactoryConfig {
  onlyOne?: boolean
  name?: string
  title?: string
}

export function webviewFactory(
  name: string,
  factoryConfig?: WebviewFactoryConfig,
) {
  let webview: WebviewPanel | undefined
  return (context: ExtensionContext, config: BReaderContext, data: any) => {
    if (factoryConfig && factoryConfig.onlyOne && webview)
      return webview

    const panel = window.createWebviewPanel(
      'vueWebview',
      'vue webview',
      ViewColumn.One,
      {
        enableScripts: true,
        enableCommandUris: true,
        enableFindWidget: true,
        retainContextWhenHidden: true,
        localResourceRoots: [config.localResourceRoots!],
      },
    )

    const html = getWebViewContent(
      config,
      path.relative(config.extensionPath!, resolvehtml(name)),
      panel,
      data,
    )

    panel.webview.html = html
    mixinAppid(config)
    receiveMessage(panel.webview, context, config, data)

    setWebviewCache(panel.webview, name, config.appid!)

    webview = panel
    return panel
  }
}
