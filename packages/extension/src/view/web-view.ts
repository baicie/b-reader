import { clientPath, getWebViewPanelContent } from "@b-reader/utils";
import path from "path";
import { ExtensionContext, ViewColumn, Uri, window } from "vscode";
import { receiveMessage } from "../receive-message";
import { BReaderContext } from "../context";

export function prepareWebView(
  context: ExtensionContext,
  config: BReaderContext
) {
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
  receiveMessage(panel.webview, context, config);
  return panel;
}
