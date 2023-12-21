import { clientPath, getWebViewContent } from "@b-reader/utils/dist";
import path from "path";
import { ExtensionContext, ViewColumn, Uri, window } from "vscode";

type MessageType = "openReader";

export function prepareWebView(context: ExtensionContext) {
  const panel = window.createWebviewPanel(
    "vueWebview",
    "vue webview",
    ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [
        Uri.file(
          path.join(
            context.extensionPath,
            path.relative(context.extensionPath, clientPath)
          )
        ),
      ],
    }
  );

  const html = getWebViewContent(
    context,
    path.relative(context.extensionPath, clientPath),
    panel
  );

  panel.webview.html = html;

  panel.webview.onDidReceiveMessage(
    async (message) => {
      console.log("message", message);
    },
    undefined,
    context.subscriptions
  );

  return panel;
}
