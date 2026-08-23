import type { BReaderContext, MessageType } from '@b-reader/utils'
import { reactive, toRaw } from 'vue'
import type { WebviewApi } from '../vite-env'

export function useAppStore() {
  const config: BReaderContext = reactive({})
  let vscode: WebviewApi<unknown> | undefined
  let removeListener: (() => void) | undefined

  const sendMessage = (message: MessageType) => {
    vscode?.postMessage(toRaw(message))
  }

  const mergeObject = (source: BReaderContext, target: BReaderContext) =>
    Object.assign(source, target)

  const initApp = () => {
    if (!vscode)
      vscode = acquireVsCodeApi()
    if (removeListener)
      return

    const listener = (event: MessageEvent<unknown>) => {
      const message = event.data as MessageType
      switch (message.path) {
        case 'config':
          mergeObject(config, message.data)
          break
        case 'routerTo':
          break
      }
    }
    window.addEventListener('message', listener)
    removeListener = () => {
      window.removeEventListener('message', listener)
      removeListener = undefined
    }
    sendMessage({
      path: 'config',
      data: {},
    })
  }

  const dispose = () => {
    removeListener?.()
  }

  return {
    config,
    vscode,
    initApp,
    sendMessage,
    dispose,
  }
}
