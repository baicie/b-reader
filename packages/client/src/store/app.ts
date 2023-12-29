import type { BReaderContext, MessageType } from '@b-reader/utils'
import { reactive } from 'vue'
import type { WebviewApi } from '../vite-env'
import type { AppState } from './types'

export function useAppStore() {
  const config: BReaderContext = reactive({})
  const state = reactive<AppState>({
    goto: '',
  })
  let vscode: WebviewApi<unknown> | undefined

  const sendMessage = (message: MessageType) => {
    vscode?.postMessage(message)
  }

  const mergeObject = (source: BReaderContext, target: object) => {
    for (const key of Object.keys(target))
      source[key] = target[key]
  }

  const initApp = () => {
    vscode = acquireVsCodeApi()

    window.addEventListener('message', (event) => {
      const message = event.data as MessageType
      switch (message.path) {
        case 'config':
          mergeObject(config, message.data)
          break
        case 'routerTo':
          break
      }
    })
    // get config
    sendMessage({
      path: 'config',
      data: {},
    })
  }

  return {
    config,
    vscode,
    initApp,
    sendMessage,
  }
}
