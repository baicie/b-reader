import {
  BReaderContext,
  getWebViewContent,
  sliderbarPath,
} from "@b-reader/utils";
import path from "node:path";
import { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { receiveMessage } from "../receive-message";
import { mixinAppid } from "../utils/appid";

export class MenusProvider implements WebviewViewProvider {
  private config: BReaderContext;
  private webviewView?: WebviewView;
  private context: ExtensionContext;

  constructor(config: BReaderContext, context: ExtensionContext) {
    this.config = config;
    this.context = context;
  }

  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    if (!(this.config.localResourceRoots && this.config.extensionPath)) {
      return;
    }
    this.webviewView = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.config.localResourceRoots],
    };

    const html = getWebViewContent(
      this.config,
      path.relative(this.config.extensionPath, sliderbarPath),
      webviewView
    );
    webviewView.webview.html = html;
    mixinAppid(this.config);
    receiveMessage(webviewView.webview, this.context, this.config);
  }

  sendMessage(path: string, message: unknown) {
    this.webviewView?.webview.postMessage({
      path,
      data: message,
    });
  }
}
