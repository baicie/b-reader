import { globSync } from "fast-glob";
import { clientPath } from "./path";
import path from "node:path";
import fs from "node:fs";
import vscode from "vscode";

/**
 * scan client dist
 * @returns string[]
 */
export function scanClientDist() {
  const distPath = globSync("**/*.{js,css}", {
    cwd: clientPath,
    onlyFiles: true,
  });

  return distPath;
}

export function getWebViewPanelContent(
  context: vscode.ExtensionContext,
  templatePath: string,
  panel: vscode.WebviewPanel,
  data: any
) {
  const resourcePath = path.join(
    context.extensionPath,
    templatePath,
    "index.html"
  );
  const dirPath = path.dirname(resourcePath);
  let htmlIndexPath = fs.readFileSync(resourcePath, "utf-8");
  const html = htmlIndexPath.replace(
    /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
    (m, $1, $2) => {
      const webviewUri = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(dirPath, $2))
      );
      const replaceHref = $1 + webviewUri.toString() + '"';
      return replaceHref;
    }
  );
  return html;
}

export function getWebViewContent(
  config: any,
  templatePath: string,
  webviewView: vscode.WebviewView
) {
  const resourcePath = path.join(config.extensionPath, templatePath);
  const dirPath = path.dirname(resourcePath);
  let htmlIndexPath = fs.readFileSync(resourcePath, "utf-8");
  const html = htmlIndexPath.replace(
    /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
    (m, $1, $2) => {
      const webviewUri = webviewView.webview.asWebviewUri(
        vscode.Uri.file(path.join(dirPath, $2))
      );
      const replaceHref = $1 + webviewUri.toString() + '"';
      return replaceHref;
    }
  );

  return html;
}
