import {
  BReaderContext,
  clientPath,
  getWebViewContent,
  resolvehtml,
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
      localResourceRoots: [config.localResourceRoots!],
    }
  );

  const html = getWebViewContent(
    config,
    path.relative(config.extensionPath!, resolvehtml("reader")),
    panel
  );

  panel.webview.html = html;
  mixinAppid(config);
  receiveMessage(panel.webview, context, config);
  return panel;
}
