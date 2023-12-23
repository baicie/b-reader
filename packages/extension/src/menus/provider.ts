import {
  CancellationToken,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
} from "vscode";
import path from "node:path";
import { getWebViewContent, sliderbarPath } from "@b-reader/utils";
import { BReaderContext } from "../context";

export class MenusProvider implements WebviewViewProvider {
  private config: BReaderContext;

  constructor(config: BReaderContext) {
    this.config = config;
  }

  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    if (!(this.config.localResourceRoots && this.config.extensionPath)) {
      return;
    }
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
  }
}
