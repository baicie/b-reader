import { ProgressLocation, ProgressOptions, window } from "vscode";

export function useMessage() {
  function info(message: string) {
    window.showInformationMessage(message);
  }

  function error(message: string) {
    window.showErrorMessage(message);
  }

  function warn(message: string) {
    window.showWarningMessage(message);
  }

  return {
    info,
    error,
    warn,
  };
}

export function useProgress(title?: string) {
  const options: ProgressOptions = {
    location: ProgressLocation.Notification,
    title: title ?? "B-Reader",
  };

  function start(message: string) {
    window.withProgress(
      {
        location: 15,
        title: message,
        cancellable: true,
      },
      (progress, token) => {
        token.onCancellationRequested(() => {
          console.log("User canceled the long running operation");
        });

        progress.report({ increment: 0 });

        return new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      }
    );
  }

  function stop() {}

  return {
    start,
  };
}
