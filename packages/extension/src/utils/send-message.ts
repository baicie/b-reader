import { Webview } from "vscode";

export async function sendMessage(
  webview: Webview,
  _path: string,
  data: unknown
) {
  await webview.postMessage({
    path: _path,
    data,
  });
}
