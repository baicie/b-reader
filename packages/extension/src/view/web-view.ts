import { clientPath, getWebViewPanelContent } from "@b-reader/utils";
import path from "path";
import { ExtensionContext, ViewColumn, Uri, window } from "vscode";

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

  const html = getWebViewPanelContent(
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
