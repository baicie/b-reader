import { error } from 'node:console'
import type { ProgressOptions } from 'vscode'
import { ProgressLocation, window } from 'vscode'

export function useMessage() {
  function binfo(message: string) {
    window.showInformationMessage(message)
  }

  function berror(err: Error | string) {
    let message = ''
    if (err instanceof Error)
      message = `${err.message}\n${err.stack}`

    else
      message = err

    window.showErrorMessage(message)
    error(err)
  }

  function bwarn(message: string) {
    window.showWarningMessage(message)
  }

  return {
    binfo,
    berror,
    bwarn,
  }
}

export function useProgress(options: ProgressOptions = {
  location: ProgressLocation.Notification,
}) {
  let isStop = false
  const _options: ProgressOptions = {
    ...options,
    title: 'Loading...',
  }

  function start(message?: string) {
    isStop = false
    if (message)
      _options.title = message
    window.withProgress(_options, async () => {
      await new Promise((resolve) => {
        setInterval(() => {
          if (isStop)
            resolve(1)
        }, 100)
      })
    })
  }

  function stop() {
    isStop = true
  }

  return {
    start,
    stop,
  }
}
