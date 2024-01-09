import { error } from 'node:console'
import type { ProgressOptions } from 'vscode'
import { ProgressLocation, window } from 'vscode'

export function useMessage() {
  function binfo(message: string) {
    window.showInformationMessage(message)
  }

  function berror(message: string) {
    window.showErrorMessage(message)
    error(message)
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

export function useProgress(title?: string) {
  const options: ProgressOptions = {
    location: ProgressLocation.Notification,
    title: title ?? 'B-Reader',
  }

  function start(message: string) {
    window.withProgress(
      {
        location: 15,
        title: message,
        cancellable: true,
      },
      (progress, token) => {
        token.onCancellationRequested(() => {
          // eslint-disable-next-line no-console
          console.log('User canceled the long running operation')
        })

        progress.report({ increment: 0 })

        return new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 1000)
        })
      },
    )
  }

  function stop() {}

  return {
    start,
  }
}
