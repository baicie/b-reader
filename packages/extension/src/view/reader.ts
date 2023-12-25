import {
  BReaderContext,
  clientPath,
  getWebViewPanelContent,
} from "@b-reader/utils";
import path from "path";
import { ExtensionContext, Uri, ViewColumn, window } from "vscode";
import { receiveMessage } from "../receive-message";
import { mixinAppid } from "../utils/appid";

export function prepareWebView(
  context: ExtensionContext,
  config: BReaderContext,
  data: any
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

  console.log("prepareWebView", data);

  const html = getWebViewPanelContent(
    context,
    path.relative(context.extensionPath, clientPath),
    panel,
    data
  );

  panel.webview.html = html;
  mixinAppid(config);
  receiveMessage(panel.webview, context, config);
  return panel;
}
