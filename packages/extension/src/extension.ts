import * as vscode from "vscode";
import * as path from "path";
import { TextEncoder } from "util";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "b-reader" is now active!');

  let kindDisposable = vscode.commands.registerCommand(
    `b-reader.createFlow`,
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Opening vue generated webview inside extension!"
      );
      const panel = prepareWebView(context);

      panel.webview.onDidReceiveMessage(
        async ({ message }) => {
          vscode.window.showInformationMessage(message);
        },
        undefined,
        context.subscriptions
      );
    }
  );
  context.subscriptions.push(kindDisposable);
}

export function prepareWebView(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "vueWebview",
    "vue webview",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, "vue-dist", "assets")),
      ],
    }
  );

  const dependencyNameList: string[] = [
    "index.css",
    "index.js",
    "vendor.js",
    "logo.png",
  ];
  const dependencyList: vscode.Uri[] = dependencyNameList.map((item) =>
    panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(context.extensionPath, "vue-dist", "assets", item)
      )
    )
  );
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
    <script>
          const vscode = acquireVsCodeApi();
    </script>
    <script type="module" crossorigin src="${dependencyList[1]}"></script>
    <link rel="modulepreload" href="${dependencyList[2]}">
    <link rel="stylesheet" href="${dependencyList[0]}">
  </head>
  <body>
    <div id="app"></div>
  </body>
  </html>
  `;
  panel.webview.html = html;
  return panel;
}
// this method is called when your extension is deactivated
export function deactivate() {}
