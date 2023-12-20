import { clientPath, getWebViewContent } from "@b-reader/utils";
import path from "node:path";
import vscode, { ExtensionContext } from "vscode";
import { resolveConfig } from "./config";
import { BReaderContext } from "./context";

export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "b-reader" is now active!');
  const config = resolveConfig(context);
  console.log(config);

  let kindDisposable = vscode.commands.registerCommand(
    `b-reader.helloWorld`,
    () => {
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

export function prepareWebView(context: ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "vueWebview",
    "vue webview",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(
          path.join(
            context.extensionPath,
            path.relative(context.extensionPath, clientPath)
          )
        ),
      ],
    }
  );

  const html = getWebViewContent(
    context,
    path.relative(context.extensionPath, clientPath),
    panel
  );

  panel.webview.html = html;
  return panel;
}
// this method is called when your extension is deactivated
export function deactivate() {}
