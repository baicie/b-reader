import { Webview } from "vscode";

export function sendMessage(webview: Webview, _path: string, data: unknown) {
  webview.postMessage({
    path: _path,
    data,
  });
}
