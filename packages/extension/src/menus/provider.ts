import { getWebViewContent, sliderbarPath } from "@b-reader/utils";
import path from "node:path";
import { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { BReaderContext } from "../context";
import { receiveMessage } from "../post-message";

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

    receiveMessage(webviewView.webview, this.context);

    this.sendMessage("config", this.config);
  }

  sendMessage(path: string, message: unknown) {
    this.webviewView?.webview.postMessage({
      path,
      data: message,
    });
  }
}
