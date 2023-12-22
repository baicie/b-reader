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

  console.log(clientPath);

  return distPath;
}

export function getWebViewContent(
  context: vscode.ExtensionContext,
  templatePath: string,
  panel: vscode.WebviewPanel
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
