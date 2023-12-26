import {
  BReaderContext,
  getWebViewContent,
  resolvehtml,
} from "@b-reader/utils/dist";
import path from "path";
import {
  ExtensionContext,
  ViewColumn,
  WebviewPanel,
  WebviewView,
  window,
} from "vscode";
import { receiveMessage } from "../receive-message";
import { mixinAppid } from "./appid";

export type WebviewFactoryConfig = {
  onlyOne?: boolean;
  name?: string;
  title?: string;
};

export const webviewFactory = (
  name: string,
  factoryConfig?: WebviewFactoryConfig
) => {
  let webview: WebviewPanel | undefined;
  return (context: ExtensionContext, config: BReaderContext, data: any) => {
    if (factoryConfig && factoryConfig.onlyOne && webview) {
      return webview;
    }
    console.log("bookid", data);

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

    webview = panel;
    return panel;
  };
};
