import {
  BReaderContext,
  getWebViewContent,
  resolvehtml,
} from "@b-reader/utils/dist";
import path from "path";
import { ExtensionContext, ViewColumn, window } from "vscode";
import { receiveMessage } from "../receive-message";
import { mixinAppid } from "./appid";

export const webviewFactory = (name: string) => {
  return (context: ExtensionContext, config: BReaderContext, data: any) => {
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
      path.relative(config.extensionPath!, resolvehtml(name)),
      panel,
      data
    );

    panel.webview.html = html;
    mixinAppid(config);
    receiveMessage(panel.webview, context, config);
    return panel;
  };
};
